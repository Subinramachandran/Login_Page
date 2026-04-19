import { toast } from 'react-toastify'

const ToastService = {
  success: (msg) => toast.success(msg || "success"),
  error: (msg) => toast.error(msg || "Something went wrong"),
  warning: (msg) => toast.warning(msg || "Warning"),
  info: (msg) => toast.info(msg || "Info")
}
export default ToastService