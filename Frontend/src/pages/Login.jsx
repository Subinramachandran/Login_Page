import { AuthContext } from '../auth/AuthContext'
import { useContext, useState } from 'react'

const Login = () => {
    const { handleLogin } = useContext(AuthContext)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin(username, password)
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="mt-4 p-2 shadow-lg">
                <form onSubmit={handleSubmit}>
                    <h1 className="p-2 text-4xl font-bold text-center text-blue-600">Login</h1>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-4 p-2 rounded-lg w-full border"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-4 p-2 w-full rounded-lg border"
                    />

                    <button
                        type="submit"
                        className="mt-4 p-2 border rounded-lg bg-blue-600 text-white w-full font-bold cursor-pointer"
                        >
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}
export default Login