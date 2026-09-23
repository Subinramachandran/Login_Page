import { useContext, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import ToastService from "../services/ToastService"

const Dashboard = () => {
    const { logout, profile } = useContext(AuthContext)

    const storageKey = `dashboard-items-${profile?.username ?? "guest"}`

    const [inputValue, setInputValue] = useState("")
    const [items, setItems] = useState([])
    const [editId, setEditId] = useState(null)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")
    const [isLoading, setIsLoading] = useState(true)

    // LOAD ITEMS
    useEffect(() => {
        try {
            const savedItems =
                localStorage.getItem(storageKey)

            const parsedItems = savedItems
                ? JSON.parse(savedItems)
                : []

            setItems(
                Array.isArray(parsedItems)
                    ? parsedItems
                    : []
            )
        } catch (error) {
            console.error(error)

            ToastService.error(
                "Unable to load tasks"
            )

            setItems([])
        } finally {
            setIsLoading(false)
        }
    }, [storageKey])

    // SAVE ITEMS
    useEffect(() => {
        if (isLoading) return

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(items)
            )
        } catch (error) {
            console.error(error)

            ToastService.error(
                "Unable to save tasks"
            )
        }
    }, [items, storageKey, isLoading])

    // STATISTICS

    const completedCount = items.filter(
        (item) => item.completed
    ).length

    const activeCount =
        items.length - completedCount

    const completionRate = items.length
        ? Math.round(
              (completedCount / items.length) * 100
          )
        : 0

    // SEARCH + FILTER

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase())

            const matchesFilter =
                filter === "all" ||
                (filter === "active" &&
                    !item.completed) ||
                (filter === "completed" &&
                    item.completed)

            return (
                matchesSearch &&
                matchesFilter
            )
        })
    }, [items, search, filter])

    // CREATE TASK

    const handleCreate = () => {
        const name = inputValue.trim()

        if (!name) {
            ToastService.warning(
                "Please enter a task"
            )

            return
        }

        const newTask = {
            id: crypto.randomUUID(),
            name,
            completed: false,
            createdAt: new Date().toISOString(),
        }

        setItems((currentItems) => [
            ...currentItems,
            newTask,
        ])

        setInputValue("")

        ToastService.success(
            "Task created successfully"
        )
    }

    // UPDATE TASK

    const handleUpdate = () => {
        const name = inputValue.trim()

        if (!name) {
            ToastService.warning(
                "Task name cannot be empty"
            )

            return
        }

        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === editId
                    ? {
                          ...item,
                          name,
                      }
                    : item
            )
        )

        setEditId(null)
        setInputValue("")

        ToastService.success(
            "Task updated successfully"
        )
    }

    // CREATE OR UPDATE

    const handleSubmit = () => {
        if (editId !== null) {
            handleUpdate()
        } else {
            handleCreate()
        }
    }

    // DELETE TASK

    const handleDelete = (id) => {
        ToastService.confirm(
            "Are you sure you want to delete this task?",
            () => {
                setItems((currentItems) =>
                    currentItems.filter(
                        (item) => item.id !== id
                    )
                )

                ToastService.success(
                    "Task deleted successfully"
                )
            }
        )
    }

    // EDIT TASK

    const handleEdit = (item) => {
        setInputValue(item.name)
        setEditId(item.id)
    }

    // TOGGLE TASK

    const toggleItem = (id) => {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          completed:
                              !item.completed,
                      }
                    : item
            )
        )
    }

    // CANCEL EDIT

    const cancelEdit = () => {
        setEditId(null)
        setInputValue("")
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* HEADER */}

            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            Dashboard
                        </h1>

                        <p className="text-sm text-gray-500">
                            Welcome,{" "}
                            {profile?.username ||
                                "User"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        <Link
                            to="/delete-account"
                            className="text-sm text-gray-600 hover:text-blue-600"
                        >
                            Account
                        </Link>

                        <button
                            onClick={logout}
                            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </header>

            {/* MAIN */}

            <main className="mx-auto max-w-2xl px-4 py-8">

                {/* TITLE */}

                <div className="mb-6 text-center">

                    <h2 className="text-2xl font-bold text-gray-800">
                        My Tasks
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Create and manage your tasks.
                    </p>

                </div>

                {/* STATISTICS */}

                <div className="mb-6 grid gap-4 sm:grid-cols-3">

                    {/* TOTAL */}

                    <div className="min-h-24 rounded-lg border bg-white p-5">

                        <p className="text-sm text-gray-500">
                            Total Tasks
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-800">
                            {items.length}
                        </p>

                    </div>

                    {/* ACTIVE */}

                    <div className="min-h-32 rounded-lg border bg-white p-5">

                        <p className="text-sm text-gray-500">
                            Active
                        </p>

                        <p className="mt-2 text-3xl font-bold text-orange-500">
                            {activeCount}
                        </p>

                    </div>

                    {/* COMPLETED */}

                    <div className="min-h-32 rounded-lg border bg-white p-5">

                        <p className="text-sm text-gray-500">
                            Completed
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {completedCount}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            {completionRate}% complete
                        </p>

                    </div>

                </div>

                {/* TASK FORM */}

                <div className="mx-auto mb-6 max-w-4xl rounded-lg border bg-white p-5">

                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                        {editId !== null
                            ? "Edit Task"
                            : "Add Task"}
                    </h3>

                    <div className="flex flex-col gap-3 sm:flex-row">

                        <input
                            value={inputValue}
                            onChange={(event) =>
                                setInputValue(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    handleSubmit()
                                }
                            }}
                            placeholder="Enter task name..."
                            className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                            onClick={handleSubmit}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {editId !== null
                                ? "Update"
                                : "Add Task"}
                        </button>

                        {editId !== null && (
                            <button
                                onClick={cancelEdit}
                                className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </div>

                {/* SEARCH + FILTER */}

                <div className="mx-auto mb-4 flex max-w-4xl flex-col gap-3 sm:flex-row">

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search tasks..."
                        className="flex-1 rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    />

                    <select
                        value={filter}
                        onChange={(event) =>
                            setFilter(
                                event.target.value
                            )
                        }
                        className="rounded-lg border bg-white px-4 py-2.5 text-sm outline-none"
                    >
                        <option value="all">
                            All Tasks
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                    </select>

                </div>

                {/* MY TASKS */}

                <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border bg-white">

                    {/* CARD HEADER */}

                    <div className="border-b px-5 py-4">

                        <h3 className="font-semibold text-gray-800">
                            Tasks
                        </h3>

                        <p className="text-sm text-gray-500">
                            {filteredItems.length}{" "}
                            task(s)
                        </p>

                    </div>

                    {/* LOADING */}

                    {isLoading ? (

                        <div className="p-8 text-center text-sm text-gray-500">
                            Loading tasks...
                        </div>

                    ) : filteredItems.length ===
                      0 ? (

                        /* EMPTY STATE */

                        <div className="p-8 text-center">

                            <p className="font-medium text-gray-700">
                                No tasks found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a task to get
                                started.
                            </p>

                        </div>

                    ) : (

                        /* TASK LIST */

                        <div className="divide-y">

                            {filteredItems.map(
                                (item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >

                                        {/* TASK */}

                                        <div className="flex items-center gap-3">

                                            <button
                                                onClick={() =>
                                                    toggleItem(
                                                        item.id
                                                    )
                                                }
                                                className={`h-5 w-5 rounded border ${
                                                    item.completed
                                                        ? "border-green-500 bg-green-500"
                                                        : "border-gray-400"
                                                }`}
                                                aria-label={
                                                    item.completed
                                                        ? "Mark as active"
                                                        : "Mark as completed"
                                                }
                                            />

                                            <div>

                                                <p
                                                    className={`text-sm font-medium ${
                                                        item.completed
                                                            ? "text-gray-400 line-through"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    {new Date(
                                                        item.createdAt
                                                    ).toLocaleDateString()}
                                                </p>

                                            </div>

                                        </div>

                                        {/* STATUS + ACTIONS */}

                                        <div className="flex items-center gap-3">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    item.completed
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-orange-100 text-orange-700"
                                                }`}
                                            >
                                                {item.completed
                                                    ? "Completed"
                                                    : "Active"}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    handleEdit(
                                                        item
                                                    )
                                                }
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        item.id
                                                    )
                                                }
                                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

            </main>
        </div>
    )
}

export default Dashboard
