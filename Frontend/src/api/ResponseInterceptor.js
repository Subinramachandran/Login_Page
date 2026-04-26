import API from './ApiInstance'
import ToastService from '../services/ToastService'
import { getAuthErrorHandler, getNavigate } from './AuthHandler'
import {
    processQueue,
    addQueue,
    isTokenRefreshing,
    setRefreshing
} from './RefreshQueue'

const isLoginPage = () => window.location.pathname === '/login'

// =========================
// PUBLIC ROUTE CHECK
// =========================
const isPublicRoute = (url) => {
    return (
        url?.includes('/login') ||
        url?.includes('/signup') ||
        url?.includes('/csrf-token') ||
        url?.includes('/refresh')
    )
}

// =========================
// SUCCESS INTERCEPTOR
// =========================
export const responseSuccess = (response) => {
    console.log("success interceptor")
    console.log('Status', response.status)
    console.log('Data', response.data)

    if (response.data?.success === false) {
        const message = response.data.message ?? 'Failed'
        ToastService.error(message)

        return Promise.reject({ response })
    }

    return response
}

// =========================
// ERROR INTERCEPTOR
// =========================
export const responseError = async (error) => {
    console.log('Error interceptor')
    console.log('Error', error)
    console.log('Status', error.response?.status)
    console.log('Message', error.response?.data?.message)

    // No response from server
    if (!error.response) {
        ToastService.error('Server is not reachable')
        return Promise.reject(error)
    }

    const status = error.response.status
    const req = error.config

    const isLogin = req.url?.includes('/login')
    const isRefresh = req.url?.includes('/refresh')

    // =========================
    // 1. PUBLIC ROUTE GUARD (IMPORTANT FIX)
    // =========================
    if (isPublicRoute(req.url)) {
        return Promise.reject(error)
    }

    // =========================
    // 2. LOGIN ERROR
    // =========================
    if (status === 401 && isLogin) {
        ToastService.error(
            error.response?.data?.message || 'Invalid credentials'
        )
        return Promise.reject(error)
    }

    // =========================
    // 3. REFRESH TOKEN FAILED
    // =========================
    if (isRefresh) {
        ToastService.error('Session expired. Please login again')
        getAuthErrorHandler()?.()
        getNavigate()?.('/login')
        return Promise.reject(error)
    }

    // =========================
    // 4. OTHER STATUS ERRORS
    // =========================
    if (status !== 401) {
        handleOtherErrors(status, error.response?.data?.message)
        return Promise.reject(error)
    }

    // =========================
    // 5. LOGIN PAGE GUARD
    // =========================
    if (isLoginPage()) {
        return Promise.reject(error)
    }

    // =========================
    // 6. RETRY GUARD (PREVENT LOOP)
    // =========================
    if (req._retry) {
        getAuthErrorHandler()?.()
        getNavigate()?.('/login')
        return Promise.reject(error)
    }

    req._retry = true

    // =========================
    // 7. IF TOKEN IS ALREADY REFRESHING → QUEUE
    // =========================
    if (isTokenRefreshing()) {
        return new Promise((resolve, reject) => {
            addQueue(resolve, reject)
        })
            .then(() => API(req))
            .catch(err => {
                ToastService.error(
                    err?.response?.data?.message || 'Request failed'
                )
                return Promise.reject(err)
            })
    }

    // =========================
    // 8. START REFRESH FLOW
    // =========================
    setRefreshing(true)

    try {
        await API.post('/refresh')

        processQueue(null, true)

        return API(req)

    } catch (err) {
        console.error('Refresh token failed:', err)

        ToastService.error('Session expired. Please login again')

        processQueue(err, null)

        getAuthErrorHandler()?.()
        getNavigate()?.('/login')

        return Promise.reject(err)

    } finally {
        setRefreshing(false)
    }
}

// =========================
// HANDLE OTHER ERRORS
// =========================
function handleOtherErrors(status, msg) {
    switch (status) {
        case 400:
            ToastService.error(msg ?? 'Bad request')
            break
        case 403:
            ToastService.error('Access denied')
            break
        case 404:
            ToastService.error('API not found')
            break
        case 500:
            ToastService.error('Server error')
            break
        default:
            ToastService.error(msg || 'Something went wrong')
    }
}