import { useState, useContext } from "react"
import { AuthContext } from "../auth/AuthContext"
import ToastService from "../services/ToastService"

const Dashboard = () => {
    const { logout } = useContext(AuthContext)

    const [inputValue, setInputValue] = useState("")
    const [items, setItems] = useState([])
    const [editId, setEditId] = useState(null)
    const [search, setSearch] = useState("")

    // Add or Update item
    const handleSubmit = () => {
        if (inputValue.trim() === "") {
            ToastService.warning("Please enter an item")
            return
        }

        // UPDATE
        if (editId !== null) {
            setItems(
                items.map((item) =>
                    item.id === editId
                        ? { ...item, name: inputValue.trim() }
                        : item
                )
            )

            setEditId(null)
            setInputValue("")
            ToastService.success("Item updated successfully")
            return
        }

        // ADD
        const newItem = {
            id: Date.now(),
            name: inputValue.trim()
        }

        setItems([...items, newItem])
        setInputValue("")
        ToastService.success("Item added successfully")
    }

    // Enter key
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmit()
        }
    }

    // Edit item
    const handleEdit = (item) => {
        setInputValue(item.name)
        setEditId(item.id)
    }

    // Delete item
    const handleDelete = (id) => {

        ToastService.confirm(
            "This action cannot be undone.",
            () => {
                setItems(
                    items.filter((item) => item.id !== id)
                )

                ToastService.success(
                    "Item deleted successfully"
                )
            }
        )
    }

    // Cancel edit
    const handleCancel = () => {
        setEditId(null)
        setInputValue("")
        ToastService.info("Edit Cancelled")
    }

    // Search filter
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    )

    // Clear search
    const handleClearSearch = () => {
        setSearch("")
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">

                    <h1 className="text-3xl font-bold">
                        My Dashboard
                    </h1>

                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
                    >
                        Logout
                    </button>

                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6">

                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500 text-sm">
                            Total Items
                        </p>

                        <p className="text-2xl font-bold">
                            {items.length}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-500 text-sm">
                            Showing
                        </p>

                        <p className="text-2xl font-bold">
                            {filteredItems.length}
                        </p>
                    </div>

                </div>

                {/* Search */}
                <div className="mb-6 relative">

                    <input
                        type="text"
                        placeholder="Search an item..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 pr-20 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    {search && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
                        >
                            Clear
                        </button>
                    )}

                </div>

                {/* Add / Edit Form */}
                <div className="bg-white p-5 rounded-lg shadow-md mb-6">

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter item name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex gap-2">

                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 cursor-pointer"
                        >
                            {editId !== null ? "Update" : "Add"}
                        </button>

                        {editId !== null && (
                            <button
                                onClick={handleCancel}
                                className="px-5 bg-gray-500 text-white rounded-md hover:bg-gray-600 cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </div>

                {/* Items */}
                <div className="space-y-3">

                    {filteredItems.map((item) => (

                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                        >

                            <span className="text-lg font-medium">
                                {item.name}
                            </span>

                            <div className="flex gap-2">

                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 cursor-pointer"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                    {/* Empty State */}
                    {items.length === 0 && (
                        <p className="text-center text-gray-500">
                            No items added yet
                        </p>
                    )}

                    {/* No Search Results */}
                    {items.length > 0 && filteredItems.length === 0 && (
                        <p className="text-center text-gray-500">
                            No matching items found
                        </p>
                    )}

                </div>

            </div>

        </div>
    )
}

export default Dashboard
