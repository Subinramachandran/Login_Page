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
        toast(
            ({ closeToast }) => (
                <div className="w-72">

                    <p className="text-sm font-semibold text-gray-800 mb-1">
                        Confirm deletion
                    </p>

                    <p className="text-sm text-gray-500 mb-4">
                        {message}
                    </p>

                    <div className="flex justify-end gap-2">

                        <button
                            onClick={closeToast}
                            className="px-3 py-1.5 text-sm rounded-md
                                       border border-gray-300
                                       text-gray-600
                                       hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                closeToast()
                                onConfirm()
                            }}
                            className="px-3 py-1.5 text-sm rounded-md
                                       bg-red-500 text-white
                                       hover:bg-red-600"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                position: "top-center"
            }
        )
    }
}

export default ToastService