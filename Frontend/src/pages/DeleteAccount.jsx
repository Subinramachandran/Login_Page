import { useNavigate } from 'react-router-dom'
import API from '../api/ApiInstance'
import { AuthContext } from '../auth/AuthContext'
import { useContext } from 'react'

export default function DeleteAccount() {
    const navigate = useNavigate()
    const { logout } = useContext(AuthContext)

    const handleDelete = async () => {
        try {
            await API.delete('/auth/delete')

            await logout()
            alert('Account deleted')
            
            navigate('/signup', {replace: true})
        } catch (err) {
            console.error(err)
            alert('Failed to delete account')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
                
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Delete Account
                </h2>

                <p className="text-gray-600 mb-6">
                    This action is permanent. Your account and data will be deleted forever.
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard', {replace: true})}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>
        </div>
    )
}