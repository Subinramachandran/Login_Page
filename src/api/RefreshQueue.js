let isRefreshing = false
let failedQueue = []

export const processQueue = (error, token) => {
    failedQueue.forEach(p => {
        error ? p.reject(error) : p.resolve(token)
    })
    failedQueue = []
}

export const addQueue = (resolve, reject) => {
    failedQueue.push({ resolve, reject })
}

export const setRefreshing = value => {
    isRefreshing = !!value
}

export const isTokenRefreshing = () => isRefreshing

export const clearQueue = () => {
    failedQueue = []
}