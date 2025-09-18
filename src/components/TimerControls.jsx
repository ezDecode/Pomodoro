import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

export function TimerControls({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  onSkip 
}) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {!isRunning ? (
        <button 
          className="btn-brutal btn-primary flex items-center gap-2 sm:gap-2 btn-icon-only"
          onClick={onStart}
          title="Start timer"
        >
          <Play size={20} />
          <span className="hide-text-mobile">Start</span>
        </button>
      ) : (
        <button 
          className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 btn-icon-only"
          onClick={onPause}
          title="Pause timer"
        >
          <Pause size={20} />
          <span className="hide-text-mobile">Pause</span>
        </button>
      )}
      <button 
        className="btn-brutal flex items-center gap-2 sm:gap-2 btn-icon-only"
        onClick={onReset}
        title="Reset timer"
      >
        <RotateCcw size={20} />
        <span className="hide-text-mobile">Reset</span>
      </button>
      <button 
        className="btn-brutal flex items-center gap-2 sm:gap-2 btn-icon-only"
        onClick={onSkip}
        title="Skip to next session"
      >
        <SkipForward size={20} />
        <span className="hide-text-mobile">Skip</span>
      </button>
    </div>
  )
}