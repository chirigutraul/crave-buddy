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
  toast.success(message, {
    ...defaultOptions,
    autoClose: 4000, // Slightly longer for success messages
    ...options,
  });
};

export const showInfo = (
  message: string,
  options?: ReactToastifyOptions
): string | number => {
  return toast.info(message, {
    ...defaultOptions,
    autoClose: 2500, // Shorter for progress updates
    ...options,
  });
};

export const showError = (message: string, options?: ReactToastifyOptions) => {
  toast.error(message, {
    ...defaultOptions,
    autoClose: 5000, // Longer for errors so users can read them
    ...options,
  });
};
