import { useContext, useState } from "react"
import { AuthContext } from "../auth/AuthContext"
import { ClipLoader } from "react-spinners"

const Signup = () => {

    const { handleSignup, loading } = useContext(AuthContext)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleSignup(username, password)
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="mt-4 p-4 shadow-lg rounded-lg w-80">

                <form onSubmit={handleSubmit}>

                    <h1 className="p-2 text-4xl font-bold text-center text-blue-600">
                        Signup
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
                        className="mt-4 p-2 border rounded-lg bg-green-600 text-white w-full font-bold flex justify-center items-center"
                    >
                        {loading ? (
                            <ClipLoader size={20} color="#fff" />
                        ) : (
                            "Register"
                        )}
                    </button>

                </form>

            </div>
        </div>
    )
}

export default Signup