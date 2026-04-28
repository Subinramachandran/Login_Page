import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { Oval } from "react-loader-spinner"

const Dashboard = () => {
    const { profile, loading, logout } = useContext(AuthContext)

    // 🔴 Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Oval
                    height={50}
                    width={50}
                    color="#2563eb"
                    visible={true}
                    ariaLabel="loading"
                />
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">

                <p className="p-2 text-2xl text-red-600">
                    Welcome, {profile?.username}
                </p>

                <button
                    onClick={logout}
                    className="mt-4 p-2 bg-blue-600 border text-white font-bold rounded-lg cursor-pointer"
                >
                    Logout
                </button>

            </div>
        </div>
    )
}

export default Dashboard