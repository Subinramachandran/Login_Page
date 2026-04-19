import API from './ApiInstance'
import ToastService from '../services/ToastService'
import { getAuthErrorHandler, getNavigate } from './AuthHandler'
import { processQueue, addQueue, isTokenRefreshing, setRefreshing } from './RefreshQueue'

const isLoginPage = () => window.location.pathname === '/login'

export const responseSuccess = response => {

    if (response.data?.success === false) {
        const message = response.data.message ?? 'Failed'

        console.log('TOAST:', message)
        ToastService.error(message)

        return Promise.reject({
            response: response   // ✅ IMPORTANT FIX
        })
    }

    return response
}

export const responseError = async error => {
    if (!error.response) {
        ToastService.error('Server is not reachable')
        return Promise.reject(error)
    }

    const s = error.response.status
    const req = error.config
    const isLogin = req.url?.includes('/login')
    const isRefresh = req.url?.includes('/refresh')
   
    // Login error
    if (s === 401 && isLogin) {
        ToastService.error(error.response?.data?.message || 'Invalid credentials')
        return Promise.reject(error)
    }

    // Refresh തന്നെ fail ആയാൽ logout
    if (isRefresh) {
        onAuthError?.()
        navigate?.('/login')
        return Promise.reject(error)
    }

    // 401 അല്ലാത്ത മറ്റ് errors
    if (s !== 401) {
        handleOtherErrors(s, error.response?.data?.message)
        return Promise.reject(error)
    }

    // 👈 Login page ആണെങ്കിൽ refresh attempt ചെയ്യരുത്
    if (isLoginPage()) {
        return Promise.reject(error)
    }

    // Infinite loop തടയുക
    if (req._retry) {
        onAuthError?.()
        navigate?.('/login')
        return Promise.reject(error)
    }

    req._retry = true

    // നിലവിൽ refresh നടക്കുകയാണെങ്കിൽ queue-ൽ ചേർക്കുക
    if (isTokenRefreshing()) {
        return new Promise((resolve, reject) => {
            addQueue(resolve, reject)
        }).then(() => API(req))
            .catch(err => {
                ToastService.error(err?.response?.data?.message || 'Request failed')
                return Promise.reject(err)
            })
    }

    setRefreshing(true)

    try {
        await API.post('/refresh')
        processQueue(null, true)
        return API(req)
    } catch (err) {
        console.error('Refresh token failed:', err)

        ToastService.error('Session expired. Please login again')

        processQueue(err, null)
        onAuthError?.()
        navigate?.('/login')

        return Promise.reject(err)
    }
    finally {
        setRefreshing(false)
    }
}

function handleOtherErrors(status, msg) {
    switch (status) {
        case 400: ToastService.error(msg ?? 'Bad request'); break
        case 403: ToastService.error('Access denied'); break
        case 404: ToastService.error('API not found'); break
        case 500: ToastService.error('Server error'); break
        default: ToastService.error(msg || 'Something went wrong')
    }
}