import axios from 'axios'
import { responseSuccess, responseError } from './ResponseInterceptor'

const API = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
})
// =========================
// CSRF STORAGE (GLOBAL)
// =========================
let csrfToken = null
let csrfPromise = null

// =========================
// GET CSRF (DEDUPED)
// =========================
export const getCsrfToken = async () => {

    if (csrfToken) return csrfToken

    if (csrfPromise) return csrfPromise

    csrfPromise = API.get('/csrf-token')
        .then(res => {
            csrfToken = res.data.csrfToken
            return csrfToken
        })
        .finally(() => {
            csrfPromise = null
        })

    return csrfPromise
}

// =========================
// ATTACH INTERCEPTOR
// =========================
API.interceptors.request.use(async (config) => {

    if (config.method !== 'get') {

        const token = csrfToken || await getCsrfToken()

        config.headers['X-CSRF-Token'] = token
    }

    return config
})

API.interceptors.response.use(responseSuccess, responseError)

export default API