import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'

const Dashboard = () => {
    const { profile, logout } = useContext(AuthContext)

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div>
                <p className="p-2 text-2xl text-red-600">Welcome, {profile ? profile.username : 'Loading...'}</p>
                <button
                    onClick={logout}
                    className="ml-4 mt-4 p-2 bg-blue-600 border text-white font-bold rounded-lg cursor-pointer"
                >Logout
                </button>
            </div>

        </div>
    )
}
export default Dashboard