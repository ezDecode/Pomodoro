import { createContext, useContext, useState } from 'react'
import { AlertModal } from '../components/AlertModal'

const AlertContext = createContext()

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  })

  const showAlert = ({
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
    onConfirm = null,
    onCancel = null
  }) => {
    setAlert({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm,
      onCancel
    })
  }

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }))
  }

  // Convenience methods
  const showInfo = (title, message, onConfirm) => {
    showAlert({ title, message, type: 'info', onConfirm })
  }

  const showWarning = (title, message, onConfirm, onCancel) => {
    showAlert({ 
      title, 
      message, 
      type: 'warning', 
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true,
      onConfirm, 
      onCancel 
    })
  }

  const showError = (title, message, onConfirm) => {
    showAlert({ title, message, type: 'error', onConfirm })
  }

  const showSuccess = (title, message, onConfirm) => {
    showAlert({ title, message, type: 'success', onConfirm })
  }

  const confirm = (title, message, onConfirm, onCancel) => {
    showAlert({ 
      title, 
      message, 
      type: 'warning', 
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true,
      onConfirm, 
      onCancel 
    })
  }

  const value = {
    showAlert,
    hideAlert,
    showInfo,
    showWarning,
    showError,
    showSuccess,
    confirm
  }

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={hideAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        showCancel={alert.showCancel}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
      />
    </AlertContext.Provider>
  )
}
