import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export function useToast() {
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  function hideToast() {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.type === 'success'

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
      isSuccess
        ? 'bg-emerald-600 text-white'
        : 'bg-red-600 text-white'
    }`}>
      {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}
