import { useContext } from 'react'
import { ToastContext } from '@/context/toastContext'

// const toast = useToast();  toast.success('Saved'); toast.error('Oops')
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
