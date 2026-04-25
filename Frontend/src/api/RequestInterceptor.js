import ToastService from '../services/ToastService'

export const requestInterceptor = (config) => config

export const requestError = (error) => {
    ToastService.error('Request failed')
    return Promise.reject(error)
}