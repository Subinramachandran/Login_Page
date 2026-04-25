import API from './ApiInstance'
import { requestInterceptor, requestError } from './requestInterceptor'
import { responseSuccess, responseError } from './responseInterceptor'

let isSetup = false

const setupInterceptors = () => {

    if(isSetup) return

    API.interceptors.request.use(requestInterceptor, requestError)
    API.interceptors.response.use(responseSuccess, responseError)

    isSetup = true
}
export default setupInterceptors