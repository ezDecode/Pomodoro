import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { formatTime, calculateTotalCycleSeconds, getSessionInfo, validateTimeInput } from '../utils/helpers'
import { TIME_LIMITS } from '../utils/constants'
import { ProgressBar } from './ProgressBar'
import { TimerControls } from './TimerControls'
import { PresetButtons } from './PresetButtons'

export function Timer({ 
  sessionIndex,
  remaining,
  isRunning,
  progress,
  breakTime = 0,
  carryoverBreakTime = 0,
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
  const { sessionLabel } = getSessionInfo(sessionIndex, preset)
  const totalCycleSeconds = calculateTotalCycleSeconds(preset)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [validationError, setValidationError] = useState('')
  const [adjustmentFeedback, setAdjustmentFeedback] = useState('')

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
      const currentTime = remaining
      const newTime = currentTime + seconds
      
      // Use consistent time limits
      const { MIN_SECONDS: minTime, MAX_SECONDS: maxTime, MAX_HOURS } = TIME_LIMITS
      
      let feedbackMessage = ''
      
      if (newTime < minTime) {
        // If trying to go below minimum, set to minimum
        onTimeUpdate(minTime, false) // Don't pause for quick adjustments
        feedbackMessage = 'Minimum time reached (1 second)'
      } else if (newTime > maxTime) {
        // If trying to go above maximum, set to maximum  
        onTimeUpdate(maxTime, false) // Don't pause for quick adjustments
        feedbackMessage = `Maximum time reached (${MAX_HOURS} hours)`
      } else {
        // Normal adjustment
        onTimeUpdate(newTime, false) // Don't pause for quick adjustments
        feedbackMessage = ''
      }
      
      // Show feedback and clear it after 2 seconds
      setAdjustmentFeedback(feedbackMessage)
      if (feedbackMessage) {
        setTimeout(() => setAdjustmentFeedback(''), 2000)
      }
    }
  }

  return (
    <div className="lg:col-span-1">
      <div className="card-brutal text-center">
        <div className="mb-8">
          <div className="text-lg sm:text-xl font-normal mb-4">{sessionLabel}</div>
          <div 
            className="timer-display mb-4 text-6xl sm:text-7xl md:text-8xl font-light tracking-tight cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2"
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
                  className={`bg-transparent border-none outline-none text-center w-full text-6xl sm:text-7xl md:text-8xl font-light tracking-tight ${
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
            <div className="space-y-2 mb-4">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleQuickAdjust(-60)}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Remove 1 minute"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => handleQuickAdjust(-300)}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Remove 5 minutes"
                >
                  <Minus size={16} />
                  <span className="text-xs ml-1">5</span>
                </button>
                <button
                  onClick={() => handleQuickAdjust(300)}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Add 5 minutes"
                >
                  <Plus size={16} />
                  <span className="text-xs ml-1">5</span>
                </button>
                <button
                  onClick={() => handleQuickAdjust(60)}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Add 1 minute"
                >
                  <Plus size={16} />
                </button>
              </div>
              {adjustmentFeedback && (
                <div className="text-sm text-orange-600 font-medium">
                  {adjustmentFeedback}
                </div>
              )}
            </div>
          )}
          
          <div className="text-base sm:text-lg font-normal space-y-3">
            <div className="flex items-center justify-center gap-6">
              <span>Cycle total: {formatTime(totalCycleSeconds)}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoStartNext} 
                  onChange={(e) => onSettingsUpdate({ autoStartNext: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Auto-start next</span>
              </label>
            </div>
            {!isRunning && breakTime > 0 && (
              <div className="text-center">
                <div className="text-sm text-orange-600">
                  Break time this session: <span className="font-medium">{formatTime(breakTime)}</span>
                </div>
              </div>
            )}
            {carryoverBreakTime > 0 && (
              <div className="text-center">
                <div className="text-sm text-purple-600">
                  + Carryover from previous session: <span className="font-medium">{formatTime(carryoverBreakTime)}</span>
                </div>
              </div>
            )}
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
}
