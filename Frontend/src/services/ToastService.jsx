import { toast } from "react-toastify"

const ToastService = {

    success: (msg) =>
        toast.success(msg || "Success"),

    error: (msg) =>
        toast.error(msg || "Something went wrong"),

    warning: (msg) =>
        toast.warning(msg || "Warning"),

    info: (msg) =>
        toast.info(msg || "Info"),

    confirm: (message, onConfirm) => {

        toast.warning(
            <div>
                <p className="mb-3">
                    {message}
                </p>

                <div className="flex gap-2">

                    <button
                        onClick={() => {
                            toast.dismiss()
                            onConfirm()
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg cursor-pointer"
                    >
                        Yes
                    </button>

                    <button
                        onClick={() => {
                            toast.dismiss()
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded-lg cursor-pointer"
                    >
                        No
                    </button>

                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false
            }
        )
    }

}

export default ToastService
