import { useEffect } from 'react'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'

export function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'warning', 'error', 'success'
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  onConfirm,
  onCancel
}) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={32} />
      case 'warning':
        return <AlertTriangle className="text-orange-500" size={32} />
      case 'error':
        return <AlertCircle className="text-red-500" size={32} />
      default:
        return <Info className="text-blue-500" size={32} />
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'btn-brutal btn-success'
      case 'warning':
        return 'btn-brutal btn-warning'
      case 'error':
        return 'btn-brutal btn-danger'
      default:
        return 'btn-brutal btn-primary'
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="card-brutal max-w-md w-full relative z-10 animate-in slide-in-from-top-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-normal tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-brutal btn-neutral btn-icon-only"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-base font-normal tracking-tight text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {showCancel && (
            <button
              onClick={handleCancel}
              className="btn-brutal btn-neutral"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={getButtonClass()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Convenience components for different alert types
export function InfoModal({ isOpen, onClose, title, message, onConfirm }) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      type="info"
      onConfirm={onConfirm}
    />
  )
}

export function WarningModal({ isOpen, onClose, title, message, onConfirm, onCancel }) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      type="warning"
      confirmText="Yes"
      cancelText="No"
      showCancel={true}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}

export function ErrorModal({ isOpen, onClose, title, message, onConfirm }) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      type="error"
      onConfirm={onConfirm}
    />
  )
}

export function SuccessModal({ isOpen, onClose, title, message, onConfirm }) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      type="success"
      onConfirm={onConfirm}
    />
  )
}
