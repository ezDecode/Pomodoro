import { useState } from 'react'
import { formatTime, calculateTotalCycleSeconds, getSessionInfo, parseTimeInput } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'
import { TimerControls } from './TimerControls'
import { PresetButtons } from './PresetButtons'

export function Timer({ 
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
  onTimeUpdate
}) {
  const { preset } = settings
  const { sessionLabel } = getSessionInfo(sessionIndex, preset)
  const totalCycleSeconds = calculateTotalCycleSeconds(preset)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const handleTimerClick = () => {
    if (!isRunning) {
      setIsEditing(true)
      setEditValue(formatTime(remaining))
    }
  }

  const handleTimeEdit = (e) => {
    setEditValue(e.target.value)
  }

  const handleTimeSubmit = () => {
    const newTime = parseTimeInput(editValue)
    if (newTime !== null && newTime >= 0) {
      onTimeUpdate(newTime)
    }
    setIsEditing(false)
  }

  const handleTimeCancel = () => {
    setIsEditing(false)
    setEditValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTimeSubmit()
    } else if (e.key === 'Escape') {
      handleTimeCancel()
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
              <input
                type="text"
                value={editValue}
                onChange={handleTimeEdit}
                onBlur={handleTimeSubmit}
                onKeyDown={handleKeyPress}
                className="bg-transparent border-none outline-none text-center w-full text-6xl sm:text-7xl md:text-8xl font-light tracking-tight"
                autoFocus
                placeholder="MM:SS"
              />
            ) : (
              formatTime(remaining)
            )}
          </div>
          <div className="text-base sm:text-lg font-normal">
            Cycle total: {formatTime(totalCycleSeconds)}
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
