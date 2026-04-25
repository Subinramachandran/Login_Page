const state = {
    isRefreshing: false,
    failedQueue: []
}

export const processQueue = (error, token = null) => {
    state.failedQueue.forEach(promise => {
        error ? promise.reject(error) : promise.resolve(token)
    })
    state.failedQueue = []
}

export const addQueue = (resolve, reject) => {
    state.failedQueue.push({ resolve, reject })
}

export const setRefreshing = value => {
    state.isRefreshing = !!value
}

export const isTokenRefreshing = () => state.isRefreshing

export const clearQueue = () => {
    state.failedQueue = []
}