import API from './ApiInstance'
import ToastService from '../services/ToastService'
import { getAuthErrorHandler, getNavigate } from './AuthHandler'
import { processQueue, addQueue, isTokenRefreshing, setRefreshing } from './RefreshQueue'

const isLoginPage = () => window.location.pathname === '/login'

export const responseSuccess = response => {
    console.log("success interceptor")
    console.log('Status', response.status)
    console.log('Data', response.data)
    if (response.data?.success === false) {
        const message = response.data.message ?? 'Failed'

        ToastService.error(message)

        return Promise.reject({
            response: response
        })
    }

    return response
}

export const responseError = async error => {
    console.log('Error interceptor')
    console.log('Error', error)
    console.log('Status', error.response?.status)
    console.log('Message', error.response?.data?.message)
    if (!error.response) {
        ToastService.error('Server is not reachable')
        return Promise.reject(error)
    }

    const status = error.response.status
    const req = error.config
    const isLogin = req.url?.includes('/login')
    const isRefresh = req.url?.includes('/refresh')

    // Login error
    if (status === 401 && isLogin) {
        ToastService.error(error.response?.data?.message || 'Invalid credentials')
        return Promise.reject(error)
    }

    if (isRefresh) {
        getAuthErrorHandler()?.()
        getNavigate()?.('/login')
        return Promise.reject(error)
    }

    if (status !== 401) {
        handleOtherErrors(status, error.response?.data?.message)
        return Promise.reject(error)
    }

    if (isLoginPage()) {
        return Promise.reject(error)
    }

    if (req._retry) {
        getAuthErrorHandler()?.()
        getNavigate()?.('/login')
        return Promise.reject(error)
    }

    req._retry = true

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
        getAuthErrorHandler()?.()
        getNavigate()?.('/login')

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