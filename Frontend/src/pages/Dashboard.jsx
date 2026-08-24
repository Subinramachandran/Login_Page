import { useState } from 'react'

const Dashboard = () => {
  const [inputValue, setInputValue] = useState("")
  const [items, setItems] = useState([])

  const addNewItem = () => {
    if (inputValue === "") return
    const newItem = {
      id: Date.now(),
      name: inputValue
    }
    setItems([...items, newItem])
    setInputValue("")
  }
  const deleteItem = (id) => {
      setItems(items.filter((item) => item.id !== id))
  }
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-16">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg cursor-pointer">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          My Dashboard
        </h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            placeholder="Enter an item"
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={addNewItem}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Add Item
          </button>
        </div>
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg text-gray-700 flex justify-between items-center"
            >
              <span>{item.name}</span>
              <button
                onClick={() => deleteItem(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover: bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
export default Dashboard