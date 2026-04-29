import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'
import { Oval } from "react-loader-spinner"
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const { profile, loading, logout } = useContext(AuthContext)
    const navigate = useNavigate()

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
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-100">

                <p className="p-2 text-2xl text-blue-600 font-semibold">
                    Welcome, {profile?.username}
                </p>

                <div className="mt-6 flex flex-col gap-3">

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="p-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                        Logout
                    </button>

                    {/* Delete Account */}
                    <button
                        onClick={() => navigate('/delete-account', {replace: true})}
                        className="p-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                        Delete Account
                    </button>

                </div>

            </div>
        </div>
    )
}

export default Dashboard