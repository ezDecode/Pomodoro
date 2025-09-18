import { memo } from 'react'

export const ProgressBar = memo(function ProgressBar({ progress }) {
  return (
    <div className="progress-brutal mb-6 sm:mb-8" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" aria-label="Timer progress">
      <div 
        className="progress-fill" 
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        aria-hidden="true"
      />
    </div>
  )
})
