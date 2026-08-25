import { useState } from "react"

const Dashboard = () => {
    const [inputValue, setInputValue] = useState("")
    const [items, setItems] = useState([])
    const [editId, setEditId] = useState(null)

    // Add or Update item
    const handleSubmit = () => {
        if (inputValue.trim() === "") return

        // UPDATE
        if (editId !== null) {
            setItems(
                items.map((item) =>
                    item.id === editId
                        ? { ...item, name: inputValue }
                        : item
                )
            )

            setEditId(null)
            setInputValue("")
            return
        }

        // ADD
        const newItem = {
            id: Date.now(),
            name: inputValue
        }

        setItems([...items, newItem])
        setInputValue("")
    }

    // Edit item
    const handleEdit = (item) => {
        setInputValue(item.name)
        setEditId(item.id)
    }

    // Delete item
    const handleDelete = (id) => {
        setItems(items.filter((item) => item.id !== id))
    }

    // Cancel edit
    const handleCancel = () => {
        setEditId(null)
        setInputValue("")
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-xl mx-auto">

                {/* Dashboard Title */}
                <h1 className="text-3xl font-bold text-center mb-6">
                    My Dashboard
                </h1>

                {/* Add / Edit Form */}
                <div className="bg-white p-5 rounded-lg shadow-md mb-6">

                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter item name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex gap-2">

                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                        >
                            {editId !== null ? "Update" : "Add"}
                        </button>

                        {editId !== null && (
                            <button
                                onClick={handleCancel}
                                className="px-5 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}

                    </div>
                </div>

                {/* Items */}
                <div className="space-y-3">

                    {items.map((item) => (

                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                        >

                            {/* Item Name */}
                            <span className="text-lg font-medium">
                                {item.name}
                            </span>

                            {/* Buttons */}
                            <div className="flex gap-2">

                                <button
                                    onClick={() => handleEdit(item)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                    {/* Empty State */}
                    {items.length === 0 && (
                        <p className="text-center text-gray-500">
                            No items added yet.
                        </p>
                    )}

                </div>

            </div>

        </div>
    )
}

export default Dashboard