import { useState, memo, useMemo } from 'react'
import { Plus, Minus } from 'lucide-react'
import { formatTime, calculateTotalCycleSeconds, getSessionInfo, validateTimeInput } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'
import { TimerControls } from './TimerControls'
import { PresetButtons } from './PresetButtons'

const Timer = memo(function Timer({ 
  sessionIndex,
  remaining,
  isRunning,
  progress,
  settings,
  customPresets = [],
  onStart,
  onPause,
  onReset,
  onSkip,
  onPresetSelect,
  onAddCustomPreset,
  onTimeUpdate,
  onSettingsUpdate
}) {
  const { preset } = settings
  
  // Memoize expensive calculations
  const sessionInfo = useMemo(() => 
    getSessionInfo(sessionIndex, preset), 
    [sessionIndex, preset]
  )
  
  const totalCycleSeconds = useMemo(() => 
    calculateTotalCycleSeconds(preset), 
    [preset]
  )
  
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [validationError, setValidationError] = useState('')
  
  const { sessionLabel } = sessionInfo

  const handleTimerClick = () => {
    if (!isRunning) {
      setIsEditing(true)
      setEditValue(formatTime(remaining))
      setValidationError('')
    }
  }

  const handleTimeEdit = (e) => {
    const value = e.target.value
    setEditValue(value)
    
    // Real-time validation
    const validation = validateTimeInput(value)
    if (validation.isValid) {
      setValidationError('')
    } else {
      setValidationError(validation.error)
    }
  }

  const handleTimeSubmit = () => {
    const validation = validateTimeInput(editValue)
    if (validation.isValid) {
      onTimeUpdate(validation.seconds)
      setIsEditing(false)
      setValidationError('')
    } else {
      setValidationError(validation.error)
    }
  }

  const handleTimeCancel = () => {
    setIsEditing(false)
    setEditValue('')
    setValidationError('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTimeSubmit()
    } else if (e.key === 'Escape') {
      handleTimeCancel()
    }
  }

  const handleQuickAdjust = (seconds) => {
    if (!isRunning) {
      const newTime = Math.max(0, remaining + seconds)
      onTimeUpdate(newTime)
    }
  }

  return (
    <div className="lg:col-span-1">
      <div className="card-brutal text-center">
        <div className="mb-6 sm:mb-8">
          <div className="text-base sm:text-lg md:text-xl font-normal mb-3 sm:mb-4">{sessionLabel}</div>
          <div 
            className="timer-display mb-3 sm:mb-4 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-lg p-2 select-none"
            onClick={handleTimerClick}
            title={!isRunning ? "Click to edit time" : "Stop timer to edit"}
          >
            {isEditing ? (
              <div className="w-full">
                <input
                  type="text"
                  value={editValue}
                  onChange={handleTimeEdit}
                  onBlur={handleTimeSubmit}
                  onKeyDown={handleKeyPress}
                  className={`bg-transparent border-none outline-none text-center w-full text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight ${
                    validationError ? 'text-red-500' : ''
                  }`}
                  autoFocus
                  placeholder="MM:SS or HH:MM:SS"
                />
                {validationError && (
                  <div className="text-sm text-red-500 mt-2">
                    {validationError}
                  </div>
                )}
              </div>
            ) : (
              formatTime(remaining)
            )}
          </div>
          
          {/* Quick Time Adjustment Buttons */}
          {!isRunning && !isEditing && (
            <div className="flex justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
              <button
                onClick={() => handleQuickAdjust(-60)}
                className="btn-brutal btn-neutral btn-icon-only"
                title="Remove 1 minute"
                aria-label="Remove 1 minute"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => handleQuickAdjust(-300)}
                className="btn-brutal btn-neutral btn-icon-only"
                title="Remove 5 minutes"
                aria-label="Remove 5 minutes"
              >
                <Minus size={18} />
                <span className="text-xs ml-1 hidden sm:inline">5</span>
              </button>
              <button
                onClick={() => handleQuickAdjust(300)}
                className="btn-brutal btn-neutral btn-icon-only"
                title="Add 5 minutes"
                aria-label="Add 5 minutes"
              >
                <Plus size={18} />
                <span className="text-xs ml-1 hidden sm:inline">5</span>
              </button>
              <button
                onClick={() => handleQuickAdjust(60)}
                className="btn-brutal btn-neutral btn-icon-only"
                title="Add 1 minute"
                aria-label="Add 1 minute"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
          
          <div className="text-sm sm:text-base md:text-lg font-normal flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mobile-stack">
            <span className="text-center">Cycle total: {formatTime(totalCycleSeconds)}</span>
            <label className="flex items-center gap-2 cursor-pointer touch-target">
              <input 
                type="checkbox" 
                checked={settings.autoStartNext} 
                onChange={(e) => onSettingsUpdate({ autoStartNext: e.target.checked })}
                className="w-5 h-5 sm:w-4 sm:h-4"
                aria-describedby="auto-start-help"
              />
              <span>Auto-start next</span>
            </label>
          </div>
        </div>

        <ProgressBar progress={progress} />
        
        <TimerControls
          isRunning={isRunning}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          onSkip={onSkip}
        />

        <PresetButtons 
          onPresetSelect={onPresetSelect}
          onAddCustomPreset={onAddCustomPreset}
          customPresets={customPresets}
        />
      </div>
    </div>
  )
})

export { Timer }
