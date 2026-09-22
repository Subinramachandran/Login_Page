import { useContext, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import ToastService from "../services/ToastService"

const Icon = ({ name, size = 20, className = "" }) => {
    const paths = {
        grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",

        search:
            "m21 21-4.35-4.35m2.1-5.15a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z",

        plus: "M12 5v14m-7-7h14",

        check: "m5 12 4 4L19 6",

        clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",

        edit: "m15 5 4 4M4 20h4L19 9a2.12 2.12 0 0 0-3-3L5 16l-1 4Z",

        trash: "M4 7h16m-10 4v5m4-5v5M9 7V4h6v3m-9 0 1 13h10l1-13",

        logout:
            "M10 17l5-5-5-5m5 5H3m10-7V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1",

        user: "M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",

        spark: "M12 2 9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7Z",

        arrow: "M5 12h14m-7-7 7 7-7 7",
    }

    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={paths[name]} />
        </svg>
    )
}

const Dashboard = () => {
    const { logout, profile } = useContext(AuthContext)

    const storageKey = `dashboard-items-${profile?.username ?? "guest"}`

    const [inputValue, setInputValue] = useState("")
    const [items, setItems] = useState([])
    const [editId, setEditId] = useState(null)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")
    const [isLoading, setIsLoading] = useState(true)

    // --------------------------------------------------
    // LOAD ITEMS FROM LOCAL STORAGE
    // --------------------------------------------------

    useEffect(() => {
        try {
            const savedItems = window.localStorage.getItem(storageKey)

            const parsedItems = savedItems ? JSON.parse(savedItems) : []

            setItems(Array.isArray(parsedItems) ? parsedItems : [])
        } catch (error) {
            console.error("Failed to restore items:", error)

            ToastService.error("We couldn't restore your dashboard items")

            setItems([])
        } finally {
            setIsLoading(false)
        }
    }, [storageKey])

    // --------------------------------------------------
    // SAVE ITEMS TO LOCAL STORAGE
    // --------------------------------------------------

    useEffect(() => {
        if (isLoading) return

        try {
            window.localStorage.setItem(storageKey, JSON.stringify(items))
        } catch (error) {
            console.error("Failed to save items:", error)

            ToastService.error("Unable to save dashboard items")
        }
    }, [items, storageKey, isLoading])

    // --------------------------------------------------
    // TASK STATISTICS
    // --------------------------------------------------

    const completedCount = items.filter(
        (item) => item.completed
    ).length

    const activeCount = items.length - completedCount

    const completionRate = items.length
        ? Math.round((completedCount / items.length) * 100)
        : 0

    // --------------------------------------------------
    // FILTER TASKS
    // --------------------------------------------------

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase())

            const matchesFilter =
                filter === "all" ||
                (filter === "active" && !item.completed) ||
                (filter === "completed" && item.completed)

            return matchesSearch && matchesFilter
        })
    }, [items, search, filter])

    const firstName = profile?.username?.split(" ")[0] || "there"

    // --------------------------------------------------
    // CREATE TASK
    // --------------------------------------------------

    const handleCreate = () => {
        const name = inputValue.trim()

        if (!name) {
            ToastService.warning("Please enter a task")
            return
        }

        const newTask = {
            id: crypto.randomUUID(),
            name,
            completed: false,
            createdAt: new Date().toISOString(),
        }

        setItems((currentItems) => [newTask, ...currentItems])

        setInputValue("")

        ToastService.success("Task created successfully")
    }

    // --------------------------------------------------
    // UPDATE TASK
    // --------------------------------------------------

    const handleUpdate = () => {
        const name = inputValue.trim()

        if (!name) {
            ToastService.warning("Task name cannot be empty")
            return
        }

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === editId
                    ? {
                        ...item,
                        name,
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        )

        setEditId(null)
        setInputValue("")

        ToastService.success("Task updated successfully")
    }

    // --------------------------------------------------
    // CREATE OR UPDATE
    // --------------------------------------------------

    const handleSubmit = () => {
        if (editId !== null) {
            handleUpdate()
        } else {
            handleCreate()
        }
    }

    // --------------------------------------------------
    // DELETE TASK
    // --------------------------------------------------

    const handleDelete = (id) => {
        ToastService.confirm(
            "This task will be permanently removed.",
            () => {
                setItems((currentItems) =>
                    currentItems.filter((item) => item.id !== id)
                )

                ToastService.success("Task deleted successfully")
            }
        )
    }

    // --------------------------------------------------
    // EDIT TASK
    // --------------------------------------------------

    const handleEdit = (item) => {
        setInputValue(item.name)
        setEditId(item.id)

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    // --------------------------------------------------
    // TOGGLE TASK
    // --------------------------------------------------

    const toggleItem = (id) => {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        completed: !item.completed,
                    }
                    : item
            )
        )
    }

    // --------------------------------------------------
    // CANCEL EDIT
    // --------------------------------------------------

    const cancelEdit = () => {
        setEditId(null)
        setInputValue("")
    }

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6 xl:p-8">
                {/* SIDEBAR */}

                <aside className="hidden w-72 shrink-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:flex">
                    <div className="flex items-center gap-3 px-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-200">
                            <Icon name="spark" size={20} />
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                Workspace
                            </p>

                            <span className="text-lg font-bold tracking-tight text-slate-900">
                                Northstar
                            </span>
                        </div>
                    </div>

                    {/* NAVIGATION */}

                    <nav className="mt-10 space-y-2">
                        <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700 shadow-sm">
                            <Icon name="grid" size={18} />
                            Overview
                        </div>

                        <Link
                            to="/delete-account"
                            className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                            <Icon name="user" size={18} />
                            Account settings
                        </Link>
                    </nav>

                    {/* SIDEBAR PROGRESS */}

                    <div className="mt-auto rounded-3xl bg-slate-900 p-4 text-white shadow-lg shadow-slate-200">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            Delivery
                        </p>

                        <p className="mt-3 text-lg font-bold">
                            Keep momentum high.
                        </p>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500"
                                style={{
                                    width: `${completionRate}%`,
                                }}
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                            <span>{completedCount} complete</span>

                            <span>{completionRate}%</span>
                        </div>
                    </div>
                </aside>

                {/* MAIN */}

                <main className="flex-1">
                    {/* HEADER */}

                    <header className="rounded-3xl border border-slate-200 bg-white/85 px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {new Date().toLocaleDateString(undefined, {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </p>

                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Good morning, {firstName} 👋
                                </h1>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-auto">
                                <div className="hidden text-right sm:block">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {profile?.username || "Your account"}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Operations dashboard
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 font-bold text-indigo-700">
                                    {(
                                        profile?.username?.[0] || "U"
                                    ).toUpperCase()}
                                </div>

                                <button
                                    onClick={logout}
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                    aria-label="Log out"
                                    title="Log out"
                                >
                                    <Icon name="logout" size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="mt-6 space-y-6">
                        {/* STATISTICS */}

                        <section className="grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    label: "Total tasks",
                                    value: items.length,
                                    detail: "Across your workspace",
                                    color: "bg-indigo-50 text-indigo-600",
                                    icon: "grid",
                                },
                                {
                                    label: "In progress",
                                    value: activeCount,
                                    detail: "Awaiting focus",
                                    color: "bg-amber-50 text-amber-600",
                                    icon: "clock",
                                },
                                {
                                    label: "Completed",
                                    value: completedCount,
                                    detail: `${completionRate}% completion rate`,
                                    color: "bg-emerald-50 text-emerald-600",
                                    icon: "check",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                {stat.label}
                                            </p>

                                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                                {stat.value}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}
                                        >
                                            <Icon
                                                name={stat.icon}
                                                size={19}
                                            />
                                        </div>
                                    </div>

                                    <p className="mt-4 text-xs text-slate-400">
                                        {stat.detail}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_320px]">
                            <section className="space-y-6">
                                {/* TASK MANAGEMENT */}

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                Task management
                                            </p>

                                            <h2 className="mt-1 text-xl font-bold text-slate-900">
                                                {editId !== null
                                                    ? "Update task"
                                                    : "Create a new task"}
                                            </h2>
                                        </div>

                                        {/* FILTER */}

                                        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                            {[
                                                "all",
                                                "active",
                                                "completed",
                                            ].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() =>
                                                        setFilter(option)
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === option
                                                            ? "bg-slate-900 text-white"
                                                            : "text-slate-500 hover:text-slate-900"
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SEARCH */}

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                            <Icon
                                                name="search"
                                                size={18}
                                                className="text-slate-400"
                                            />

                                            <input
                                                value={search}
                                                onChange={(event) =>
                                                    setSearch(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Search tasks..."
                                                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                            />

                                            {search && (
                                                <button
                                                    onClick={() =>
                                                        setSearch("")
                                                    }
                                                    className="text-xs font-semibold text-indigo-600"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleSubmit}
                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:brightness-105"
                                        >
                                            <Icon
                                                name={
                                                    editId !== null
                                                        ? "check"
                                                        : "plus"
                                                }
                                                size={16}
                                            />

                                            {editId !== null
                                                ? "Save changes"
                                                : "Add task"}
                                        </button>
                                    </div>

                                    {/* TASK INPUT */}

                                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center">
                                        <input
                                            value={inputValue}
                                            onChange={(event) =>
                                                setInputValue(
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    handleSubmit()
                                                }
                                            }}
                                            placeholder="e.g. Finalize product review"
                                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                        />

                                        {editId !== null && (
                                            <button
                                                onClick={cancelEdit}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* TASK LIST */}

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                Tasks
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                Manage and track your work.
                                            </p>
                                        </div>

                                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                            {filteredItems.length} shown
                                        </span>
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                                        {/* TABLE HEADER */}

                                        <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 sm:grid">
                                            <span>Task</span>

                                            <span>Status</span>

                                            <span className="text-right">
                                                Actions
                                            </span>
                                        </div>

                                        <div className="divide-y divide-slate-200 bg-white">
                                            {isLoading ? (
                                                <div className="px-6 py-12 text-center">
                                                    <p className="text-sm text-slate-500">
                                                        Loading tasks...
                                                    </p>
                                                </div>
                                            ) : filteredItems.length > 0 ? (
                                                filteredItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:items-center"
                                                    >
                                                        {/* TASK */}

                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <button
                                                                onClick={() =>
                                                                    toggleItem(
                                                                        item.id
                                                                    )
                                                                }
                                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${item.completed
                                                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                                                    : "border-slate-300 text-transparent hover:border-indigo-500"
                                                                    }`}
                                                                aria-label={
                                                                    item.completed
                                                                        ? "Mark task as active"
                                                                        : "Mark task as completed"
                                                                }
                                                            >
                                                                <Icon
                                                                    name="check"
                                                                    size={14}
                                                                />
                                                            </button>

                                                            <div className="min-w-0">
                                                                <p
                                                                    className={`truncate text-sm font-medium ${item.completed
                                                                            ? "text-slate-400 line-through"
                                                                            : "text-slate-700"
                                                                        }`}
                                                                >
                                                                    {item.name}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    {new Date(
                                                                        item.createdAt
                                                                    ).toLocaleDateString(
                                                                        undefined,
                                                                        {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            year: "numeric",
                                                                        }
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* STATUS */}

                                                        <div>
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.completed
                                                                        ? "bg-emerald-50 text-emerald-700"
                                                                        : "bg-amber-50 text-amber-700"
                                                                    }`}
                                                            >
                                                                {item.completed
                                                                    ? "Completed"
                                                                    : "Active"}
                                                            </span>
                                                        </div>

                                                        {/* ACTIONS */}

                                                        <div className="flex justify-start gap-2 sm:justify-end">
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        item
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                                aria-label={`Edit ${item.name}`}
                                                                title="Edit task"
                                                            >
                                                                <Icon
                                                                    name="edit"
                                                                    size={16}
                                                                />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                                aria-label={`Delete ${item.name}`}
                                                                title="Delete task"
                                                            >
                                                                <Icon
                                                                    name="trash"
                                                                    size={16}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                /* EMPTY STATE */

                                                <div className="px-6 py-12 text-center">
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                                        <Icon
                                                            name={
                                                                search ||
                                                                    filter !== "all"
                                                                    ? "search"
                                                                    : "plus"
                                                            }
                                                            size={20}
                                                        />
                                                    </div>

                                                    <h4 className="mt-4 text-sm font-bold text-slate-800">
                                                        {search ||
                                                            filter !== "all"
                                                            ? "No matching tasks"
                                                            : "Your workspace is clear"}
                                                    </h4>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {search ||
                                                            filter !== "all"
                                                            ? "Try a different search or filter."
                                                            : "Create your first task to begin tracking work."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* RIGHT SIDEBAR */}

                            <aside className="space-y-5">
                                {/* PROGRESS */}

                                <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                                            Progress
                                        </p>

                                        <div className="rounded-full bg-indigo-500/15 p-2 text-indigo-300">
                                            <Icon name="arrow" size={16} />
                                        </div>
                                    </div>

                                    <p className="mt-5 text-4xl font-bold tracking-tight">
                                        {completionRate}

                                        <span className="text-xl text-slate-400">
                                            %
                                        </span>
                                    </p>

                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500"
                                            style={{
                                                width: `${completionRate}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-3 text-sm text-slate-400">
                                        Small improvements add up to meaningful
                                        momentum.
                                    </p>
                                </div>

                                {/* QUICK NOTES */}

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Quick notes
                                    </h3>

                                    <ul className="mt-4 space-y-4 text-sm text-slate-500">
                                        <li className="flex gap-3">
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />

                                            <span>
                                                Break larger tasks into small,
                                                measurable actions.
                                            </span>
                                        </li>

                                        <li className="flex gap-3">
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

                                            <span>
                                                Complete tasks to keep your
                                                dashboard progress visible.
                                            </span>
                                        </li>

                                        <li className="flex gap-3">
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />

                                            <span>
                                                Use search and filters to
                                                quickly find work.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Dashboard