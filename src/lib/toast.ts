import { toast } from "react-toastify";
import type { ToastOptions as ReactToastifyOptions } from "react-toastify";

const defaultOptions: ReactToastifyOptions = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccess = (
  message: string,
  options?: ReactToastifyOptions
) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showInfo = (message: string, options?: ReactToastifyOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const showError = (message: string, options?: ReactToastifyOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};
