import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import { AuthContext } from '../auth/AuthContext'
import { useContext } from 'react'
import ProtectedRoute from '../auth/ProtectedRoute'

const AppRoutes = () => {
    const { profile, loading } = useContext(AuthContext)

    if (loading) return <p>Loading...</p>
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={profile ? (<Navigate to="/dashboard" replace />)
                : (<Login />)} />

            <Route
                path="/signup"
                element={
                    profile
                        ? <Navigate to="/dashboard" replace />
                        : <Signup />
                }
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            {/* Wildcard routes */}
            <Route
                path="*"
                element={profile ? (<Navigate to="/dashboard" replace />) : (<Navigate to="/login" replace />)}
            />
        </Routes>
    )
}
export default AppRoutes