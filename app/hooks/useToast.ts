import { useState } from "react";

export type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "info",
    visible: false,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({
      message,
      type,
      visible: true,
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  return {
    toast,
    showToast,
  };
}