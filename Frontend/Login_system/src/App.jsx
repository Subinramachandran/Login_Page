import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './Login'
import Dashboard from './Dashboard'

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
    return (
        <div>
            <Routes>
                <Route path="/" element={!isLoggedIn
                    ? (<Login setIsLoggedIn={setIsLoggedIn} />)
                    : (
                        <Navigate to="/dashboard" />
                    )
                }></Route>

                <Route path="/dashboard" element={isLoggedIn ? (<Dashboard setIsLoggedIn={setIsLoggedIn} />) : (
                    <Navigate to="/" />
                )}></Route>

            </Routes>
        </div>
    )
}
export default App