import { useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { formatTime } from '../utils/helpers'

export function CompletionModal({ 
  isOpen, 
  onClose, 
  sessionData,
  totalStats
}) {
  // Modal lifecycle cleanup
  useEffect(() => {
    if (!isOpen) return
    return () => {}
  }, [isOpen])

  if (!isOpen) return null

  const { completedSessions, pauseCount, totalBreakTime } = totalStats

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="card-brutal max-w-lg w-full relative z-10 animate-in slide-in-from-top-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={32} />
            <h2 className="text-2xl font-normal">Session Complete!</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-brutal btn-icon-only"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Session Details */}
        <div className="mb-8">
          <h3 className="text-lg font-normal mb-4">This Session:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-light text-blue-500">{formatTime(sessionData.duration)}</div>
              <div className="text-sm font-normal">Work time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-orange-500">{formatTime(sessionData.breakTime)}</div>
              <div className="text-sm font-normal">Break time</div>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="mb-8">
          <h3 className="text-lg font-normal mb-4">Overall Statistics:</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-light text-green-500">{completedSessions}</div>
              <div className="text-sm font-normal">Sessions completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-red-500">{pauseCount || 0}</div>
              <div className="text-sm font-normal">Times paused</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-purple-500">{formatTime(totalBreakTime)}</div>
            <div className="text-sm font-normal">Total break time</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="btn-brutal btn-primary"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}