import { createContext } from "react";

export type ToastKind = "success" | "error" | "info";
export type ToastApi = { show: (kind: ToastKind, message: string) => void };

export const ToastContext = createContext<ToastApi | null>(null);
