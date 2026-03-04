import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = ({ setIsLoggedIn }) => {  
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token")
      console.log(token)
      if (!token) return

      try {
        const response = await fetch('http://localhost:5000/profile', {
          headers: { "Authorization": `Bearer ${token}` }
        })        
        const data = await response.json()
        console.log(data)
        if (response.ok) {
          setProfile(data.user)
        } else {
          setMessage(data.message)
        }

      } catch (err) {
        setMessage("Error fetching profile")
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/")
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {profile ? (
        <div className="p-4 border rounded-lg bg-gray-50">
          <p>Username: {profile.username}</p>
        </div>
      ) : (
        <p>{message || "Loading..."}</p>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 p-2 font-bold text-lg bg-red-400 text-white rounded-lg cursor-pointer"
      >
        Logout
      </button>
    </div>
  )
}

export default Dashboard