import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        setIsLoggedIn(true)           // ✅ Update login state
        setMessage(data.message)
        setIsSuccess(true)
        navigate("/dashboard")        // ✅ Redirect to Dashboard
      } else {
        setIsSuccess(false)
        setMessage(data.message)
      }

    } catch (error) {
      setIsSuccess(false)
      setMessage("Login failed")
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col shadow-lg p-4 w-96">
        <h1 className="text-blue-600 text-3xl font-bold text-center">Login</h1>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="mt-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <button
          onClick={handleLogin}
          className="mt-4 p-2 font-bold text-lg bg-blue-400 text-white rounded-lg cursor-pointer"
        >
          Login
        </button>

        {message &&
          <p className={`mt-4 p-2 text-center font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        }
      </div>
    </div>
  )
}

export default Login