import { useContext, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../auth/AuthContext"
import ToastService from "../services/ToastService"

const Icon = ({ name, size = 20 }) => {
    const paths = {
        grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
        search: "m21 21-4.35-4.35m2.1-5.15a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z",
        plus: "M12 5v14m-7-7h14",
        check: "m5 12 4 4L19 6",
        clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
        edit: "m15 5 4 4M4 20h4L19 9a2.12 2.12 0 0 0-3-3L5 16l-1 4Z",
        trash: "M4 7h16m-10 4v5m4-5v5M9 7V4h6v3m-9 0 1 13h10l1-13",
        logout: "M10 17l5-5-5-5m5 5H3m10-7V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1",
        user: "M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={paths[name]} />
        </svg>
    )
}

const Dashboard = () => {
    const { logout, profile } = useContext(AuthContext)
    const storageKey = `dashboard-items-${profile?.username ?? "guest"}`
    const [inputValue, setInputValue] = useState("")
    const [items, setItems] = useState(() => {
        try {
            const savedItems = window.localStorage.getItem(storageKey)
            return savedItems ? JSON.parse(savedItems) : []
        } catch {
            ToastService.error("We couldn't restore your dashboard items")
            return []
        }
    })
    const [editId, setEditId] = useState(null)
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")

    useEffect(() => {
        window.localStorage.setItem(storageKey, JSON.stringify(items))
    }, [items, storageKey])

    const completedCount = items.filter((item) => item.completed).length
    const activeCount = items.length - completedCount
    const filteredItems = useMemo(() => items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === "all" || (filter === "active" && !item.completed) || (filter === "completed" && item.completed)
        return matchesSearch && matchesFilter
    }), [items, search, filter])

    const firstName = profile?.username?.split(" ")[0] || "there"

    const handleSubmit = () => {
        const name = inputValue.trim()
        if (!name) {
            ToastService.warning("Please enter an item")
            return
        }

        if (editId !== null) {
            setItems((currentItems) => currentItems.map((item) => item.id === editId ? { ...item, name } : item))
            setEditId(null)
            ToastService.success("Item updated successfully")
        } else {
            setItems((currentItems) => [{ id: Date.now(), name, completed: false, createdAt: new Date().toISOString() }, ...currentItems])
            ToastService.success("Item added successfully")
        }
        setInputValue("")
    }

    const handleDelete = (id) => {
        ToastService.confirm("This action cannot be undone.", () => {
            setItems((currentItems) => currentItems.filter((item) => item.id !== id))
            ToastService.success("Item deleted successfully")
        })
    }

    const handleEdit = (item) => {
        setInputValue(item.name)
        setEditId(item.id)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const toggleItem = (id) => {
        setItems((currentItems) => currentItems.map((item) => item.id === id ? { ...item, completed: !item.completed } : item))
    }

    const cancelEdit = () => {
        setEditId(null)
        setInputValue("")
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-7 lg:flex">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <Icon name="grid" size={21} />
                    </div>
                    <span className="text-lg font-bold tracking-tight">Workspace</span>
                </div>
                <nav className="mt-12 space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700">
                        <Icon name="grid" size={18} /> Overview
                    </div>
                    <Link to="/delete-account" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900">
                        <Icon name="user" size={18} /> Account settings
                    </Link>
                </nav>
                <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
                    <p className="text-xs font-medium text-slate-400">Your workspace</p>
                    <p className="mt-2 text-sm font-semibold">Stay focused, ship more.</p>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${items.length ? Math.round((completedCount / items.length) * 100) : 0}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{completedCount} of {items.length} complete</p>
                </div>
            </aside>

            <main className="lg:pl-64">
                <header className="border-b border-slate-200 bg-white/80 px-5 py-5 backdrop-blur sm:px-8">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Monday, {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Good morning, {firstName} <span aria-hidden="true">👋</span></h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold">{profile?.username || "Your account"}</p>
                                <p className="text-xs text-slate-500">Personal workspace</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                {(profile?.username?.[0] || "U").toUpperCase()}
                            </div>
                            <button onClick={logout} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Log out" title="Log out">
                                <Icon name="logout" size={19} />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            { label: "Total items", value: items.length, detail: "Across your workspace", color: "bg-indigo-50 text-indigo-600", icon: "grid" },
                            { label: "In progress", value: activeCount, detail: "Ready for your attention", color: "bg-amber-50 text-amber-600", icon: "clock" },
                            { label: "Completed", value: completedCount, detail: items.length ? `${Math.round((completedCount / items.length) * 100)}% completion rate` : "Start by adding an item", color: "bg-emerald-50 text-emerald-600", icon: "check" },
                        ].map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                                    </div>
                                    <div className={`rounded-xl p-2.5 ${stat.color}`}><Icon name={stat.icon} size={19} /></div>
                                </div>
                                <p className="mt-3 text-xs text-slate-400">{stat.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-7 xl:grid-cols-[1fr_320px]">
                        <section>
                            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="text-lg font-bold">Your items</h2>
                                    <p className="mt-1 text-sm text-slate-500">Manage your priorities and keep momentum.</p>
                                </div>
                                <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-semibold">
                                    {["all", "active", "completed"].map((option) => (
                                        <button key={option} onClick={() => setFilter(option)} className={`rounded-md px-3 py-1.5 capitalize transition ${filter === option ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <Icon name="search" size={18} />
                                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your items..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                                {search && <button onClick={() => setSearch("")} className="text-xs font-semibold text-indigo-600">Clear</button>}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Icon name="plus" size={18} /></div>
                                    <div>
                                        <h3 className="text-sm font-bold">{editId !== null ? "Update item" : "Add a new item"}</h3>
                                        <p className="text-xs text-slate-500">{editId !== null ? "Make your changes and save." : "What would you like to accomplish?"}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSubmit()} placeholder="e.g. Prepare weekly report" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
                                    <button onClick={handleSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">{editId !== null ? "Save changes" : "Add item"} <Icon name="plus" size={16} /></button>
                                    {editId !== null && <button onClick={cancelEdit} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>}
                                </div>
                            </div>

                            <div className="mt-4 space-y-3">
                                {filteredItems.map((item) => (
                                    <div key={item.id} className={`group flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md ${item.completed ? "border-slate-200" : "border-slate-200"}`}>
                                        <button onClick={() => toggleItem(item.id)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${item.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-500"}`} aria-label={item.completed ? "Mark as active" : "Mark as completed"}><Icon name="check" size={14} /></button>
                                        <span className={`min-w-0 flex-1 truncate text-sm font-medium ${item.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.name}</span>
                                        <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                                            <button onClick={() => handleEdit(item)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600" aria-label={`Edit ${item.name}`}><Icon name="edit" size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${item.name}`}><Icon name="trash" size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {filteredItems.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name={search || filter !== "all" ? "search" : "plus"} size={22} /></div>
                                        <h3 className="mt-4 text-sm font-bold">{search || filter !== "all" ? "No matching items" : "Your workspace is clear"}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{search || filter !== "all" ? "Try changing your search or filter." : "Add your first item above to get started."}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="space-y-4">
                            <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-200">
                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Progress overview</p>
                                <div className="mt-5 flex items-end justify-between">
                                    <p className="text-4xl font-bold">{items.length ? Math.round((completedCount / items.length) * 100) : 0}<span className="text-xl text-slate-400">%</span></p>
                                    <Icon name="check" size={28} />
                                </div>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${items.length ? (completedCount / items.length) * 100 : 0}%` }} /></div>
                                <p className="mt-3 text-sm text-slate-400">Small steps add up. Keep going.</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h3 className="font-bold">Quick tips</h3>
                                <ul className="mt-4 space-y-4 text-sm text-slate-500">
                                    <li className="flex gap-3"><span className="text-indigo-500">01</span><span>Break large goals into focused, actionable items.</span></li>
                                    <li className="flex gap-3"><span className="text-indigo-500">02</span><span>Mark work complete to keep your progress visible.</span></li>
                                    <li className="flex gap-3"><span className="text-indigo-500">03</span><span>Use search to quickly find what needs attention.</span></li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
