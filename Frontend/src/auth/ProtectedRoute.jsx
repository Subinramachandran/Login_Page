import { useContext } from 'react'
import { AuthContext } from '../auth/AuthContext'
import {Navigate} from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
    const { profile, loading } = useContext(AuthContext)
    
    if(loading) return <p>Loading...</p>

    //not logged in -> redirect to login and replace history
    if(!profile) return <Navigate to="/login" replace/>

    return children
}
export default ProtectedRoute