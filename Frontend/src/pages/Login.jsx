import { AuthContext } from '../auth/AuthContext'
import { useContext, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Oval } from "react-loader-spinner"

const Login = () => {
    const { handleLogin, loading } = useContext(AuthContext)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin(username, password)
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="mt-4 p-6 shadow-lg rounded-lg w-80">

                <form onSubmit={handleSubmit}>

                    <h1 className="p-2 text-4xl font-bold text-center text-blue-600">
                        Login
                    </h1>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-4 p-2 rounded-lg w-full border"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-4 p-2 w-full rounded-lg border"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 p-2 border rounded-lg bg-blue-600 text-white w-full font-bold flex justify-center items-center"
                    >
                        {loading ? (
                            <Oval
                                height={20}
                                width={20}
                                color="#ffffff"
                                visible={true}
                                ariaLabel="loading"
                            />
                        ) : (
                            "Login"
                        )}
                    </button>

                    <p className="text-center mt-4">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate('/signup')}
                            className="text-blue-600 cursor-pointer"
                        >
                            Signup
                        </span>
                    </p>

                </form>

            </div>
        </div>
    )
}

export default Login