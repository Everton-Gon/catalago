import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface ToastAction {
  label: string
  to: string
}

export interface Toast {
  id: number
  message: string
  action?: ToastAction
}

interface ToastContextValue {
  toasts: Toast[]
  showToast: (message: string, action?: ToastAction) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, action?: ToastAction) => {
      const id = nextId.current++
      // Mantém no máximo dois avisos visíveis para não cobrir o conteúdo.
      setToasts((current) => [...current.slice(-1), { id, message, action }])
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), TOAST_DURATION),
      )
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return context
}
