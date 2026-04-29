import ToastService from '../services/ToastService'
import { createContext, useEffect, useReducer } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import API, { getCsrfToken } from '../api/ApiInstance'
import { setAuthErrorHandler, setNavigate } from '../api/AuthHandler'

export const AuthContext = createContext()

const initialState = {
    profile: null,
    loading: true
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_PROFILE':
            return { profile: action.payload, loading: false }

        case 'RESET':
            return { profile: null, loading: false }

        case 'SET_LOADING':
            return { ...state, loading: true }

        default:
            return state
    }
}

export const AuthProvider = ({ children }) => {

    const [state, dispatch] = useReducer(reducer, initialState)

    const navigate = useNavigate()
    const location = useLocation()

    // =========================
    // CSRF INIT (RUN ONLY ONCE)
    // =========================
    useEffect(() => {
        getCsrfToken()
    }, [])

    // =========================
    // PROFILE FETCH (ROUTE BASED)
    // =========================
    useEffect(() => {

        const publicRoutes = ['/login', '/signup']

        if (publicRoutes.includes(location.pathname)) {
            dispatch({ type: 'SET_PROFILE', payload: null })
            return
        }

        const fetchProfile = async () => {
            dispatch({ type: 'SET_LOADING' })

            try {
                const res = await API.get('/profile')
                dispatch({ type: 'SET_PROFILE', payload: res.data.user })
            } catch (error) {
                dispatch({ type: 'RESET' })
            }
        }

        fetchProfile()

    }, [location.pathname])

    // =========================
    // SIGNUP
    // =========================
    const handleSignup = async (username, password) => {
        try {
            const res = await API.post('/signup', { username, password })

            if (res.data?.success) {
                ToastService.success(res.data.message ?? 'Signup successful')

                // 👉 Auto login after signup
                await handleLogin(username, password)

            } else {
                ToastService.error(res.data?.message ?? 'Signup failed')
            }

        } catch (error) {
            ToastService.error(error.response?.data?.message ?? 'Signup error')
        }
    }

    // =========================
    // LOGIN
    // =========================
    const handleLogin = async (username, password) => {

        try {
            const response = await API.post('/login', { username, password })

            if (response.data?.success) {

                // 👉 directly fetch profile (no race condition)
                const res = await API.get('/profile')
                dispatch({ type: 'SET_PROFILE', payload: res.data.user })

                navigate('/dashboard')

            } else {
                ToastService.error(response.data?.message || 'Login failed')
            }

        } catch (error) {
            ToastService.error(error.response?.data?.message ?? 'Login error')
        }
    }

    // =========================
    // LOGOUT
    // =========================
    const logout = async () => {

        try {
            await API.post('/logout')
        } catch (error) {
            console.log(error)
        }

        dispatch({ type: 'RESET' })
       
        navigate('/login', {replace: true})
    }

    // =========================
    // GLOBAL AUTH HANDLER
    // =========================
    useEffect(() => {

        setAuthErrorHandler(() => {
            dispatch({ type: 'RESET' })
            navigate('/login')
        })

        setNavigate(navigate)

        return () => setAuthErrorHandler(null)

    }, [navigate])

    return (
        <AuthContext.Provider value={{
            handleLogin,
            handleSignup,
            logout,
            profile: state.profile,
            loading: state.loading,
            isAuthenticated: !!state.profile
        }}>
            {children}
        </AuthContext.Provider>
    )
}