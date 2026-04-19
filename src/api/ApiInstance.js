import axios from 'axios'
import { responseSuccess, responseError } from './ResponseInterceptor'

const API = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
})

API.interceptors.response.use(responseSuccess, responseError)

export default API