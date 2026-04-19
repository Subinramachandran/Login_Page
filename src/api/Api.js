import API from '../api/ApiInstance';
import setupInterceptors from './setupInterceptors';
import { setAuthErrorHandler, setNavigate } from './authHandler';

//attach interceptors once
setupInterceptors();

export { setAuthErrorHandler, setNavigate };
export default API;