import ToastService from '../services/ToastService'
import { createContext, useEffect, useReducer, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import API, { getCsrfToken } from '../api/ApiInstance'
import { setAuthErrorHandler, setNavigate } from '../api/AuthHandler'

export const AuthContext = createContext()

const initialState = {
    profile: null,
    loading: true
}

const reducer = (state, action) => {

    if (action.type === 'SET_PROFILE')
        return { profile: action.payload, loading: false }

    if (action.type === 'RESET')
        return { profile: null, loading: false }

    return state
}

export const AuthProvider = ({ children }) => {

    const [state, dispatch] = useReducer(reducer, initialState)

    const navigate = useNavigate()
    const location = useLocation()

    // =========================
    // PROFILE
    // =========================
    const getProfile = useCallback(async () => {

        if (location.pathname === '/login') {
            dispatch({ type: 'SET_PROFILE', payload: null })
            return
        }

        try {
            const res = await API.get('/profile')
            dispatch({ type: 'SET_PROFILE', payload: res.data.user })

        } catch (error) {

            dispatch({ type: 'RESET' })

        }

    }, [location.pathname])

    // =========================
    // LOGIN
    // =========================
    const handleLogin = async (username, password) => {

        try {
            const response = await API.post('/login', {
                username,
                password
            })

            if (response.data?.success) {

                await getCsrfToken()   // ensure CSRF ready
                await getProfile()

                navigate('/dashboard')

            } else {
                ToastService.error(response.data?.message || 'Login failed')
            }

        } catch (error) {
            console.log(error)
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
        navigate('/login')
    }

    // =========================
    // INIT
    // =========================
    useEffect(() => {

        const init = async () => {
            await getCsrfToken()
            await getProfile()
        }

        init()

    }, [getProfile])

    // =========================
    // AUTH HANDLER
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
            logout,
            profile: state.profile,
            loading: state.loading,
            isAuthenticated: !!state.profile
        }}>
            {children}
        </AuthContext.Provider>
    )
}