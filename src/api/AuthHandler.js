// api/AuthHandler.js

let onAuthError = null
let navigate = null

export const setAuthErrorHandler = (handler) => {
    onAuthError = handler
}

export const setNavigate = (nav) => {
    navigate = nav
}

export const getAuthErrorHandler = () => onAuthError
export const getNavigate = () => navigate