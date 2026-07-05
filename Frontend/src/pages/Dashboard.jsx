import { useState, useEffect } from "react";

const Dashboard = () => {
  const [text, setText] = useState("")
  const [items, setItem] = useState([])

  const addItem = () => {
    const trimmedText = text.trim()

    if (trimmedText === "") return
    const newItems = [...items, trimmedText]
    setItem(newItems)
    setText("")    
  }
 

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Add Items
        </h1>

        {/* Input */}

        <input
          type="text"
          placeholder="Enter item..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addItem();
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Button */}

        <button
          onClick={addItem}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition cursor-pointer"
        >
          Add Item
        </button>

        {/* Total */}

        <p className="mt-6 text-gray-600">
          Total Items:
          <span className="font-bold ml-2">
            {items.length}
          </span>
        </p>

        {/* List */}

        <ul className="mt-4 space-y-2">

          {items.map((item, index) => (
            <li
              key={index}
              className="bg-gray-100 p-3 rounded-lg shadow-sm"
            >
              {item}
            </li>
          ))}

        </ul>

      </div>

    </div>
  );
};

export default Dashboard;