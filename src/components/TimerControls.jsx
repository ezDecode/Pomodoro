import { memo } from 'react'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

export const TimerControls = memo(function TimerControls({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  onSkip 
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8" role="group" aria-label="Timer controls">
      {!isRunning ? (
        <button 
          className="btn-brutal btn-primary flex items-center gap-2 btn-icon-only"
          onClick={onStart}
          title="Start timer"
          aria-label="Start timer"
        >
          <Play size={20} />
          <span className="hide-text-mobile">Start</span>
        </button>
      ) : (
        <button 
          className="btn-brutal btn-secondary flex items-center gap-2 btn-icon-only"
          onClick={onPause}
          title="Pause timer"
          aria-label="Pause timer"
        >
          <Pause size={20} />
          <span className="hide-text-mobile">Pause</span>
        </button>
      )}
      <button 
        className="btn-brutal flex items-center gap-2 btn-icon-only"
        onClick={onReset}
        title="Reset timer to initial duration"
        aria-label="Reset timer"
      >
        <RotateCcw size={20} />
        <span className="hide-text-mobile">Reset</span>
      </button>
      <button 
        className="btn-brutal flex items-center gap-2 btn-icon-only"
        onClick={onSkip}
        title="Skip to next session in cycle"
        aria-label="Skip to next session"
      >
        <SkipForward size={20} />
        <span className="hide-text-mobile">Skip</span>
      </button>
    </div>
  )
})
