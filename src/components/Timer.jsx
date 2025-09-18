import { formatTime, calculateTotalCycleSeconds, getSessionInfo } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'
import { TimerControls } from './TimerControls'
import { PresetButtons } from './PresetButtons'

export function Timer({ 
  sessionIndex,
  remaining,
  isRunning,
  progress,
  settings,
  onStart,
  onPause,
  onReset,
  onSkip,
  onPresetSelect
}) {
  const { preset } = settings
  const { sessionLabel } = getSessionInfo(sessionIndex, preset)
  const totalCycleSeconds = calculateTotalCycleSeconds(preset)

  return (
    <div className="lg:col-span-2">
      <div className="card-brutal text-center">
        <div className="mb-8">
          <div className="text-lg sm:text-xl font-normal mb-4">{sessionLabel}</div>
          <div className="timer-display mb-4 text-6xl sm:text-7xl md:text-8xl font-light tracking-tight">
            {formatTime(remaining)}
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

        <PresetButtons onPresetSelect={onPresetSelect} />
      </div>
    </div>
  )
}
