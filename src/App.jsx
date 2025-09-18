import { useState, useCallback } from 'react'
import { Header, Timer, Statistics, CustomPresetModal, CompletionModal } from './components'
import { useSettings } from './hooks/useSettings'
import { useTimer } from './hooks/useTimer'

function App() {
  const [sessionIndex, setSessionIndex] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completedSessionData, setCompletedSessionData] = useState(null)
  const [carryoverBreakTime, setCarryoverBreakTime] = useState(0)

  const { 
    settings, 
    customPresets,
    updateSettings, 
    updatePreset, 
    addSessionToHistory,
    incrementPauseCount,
    saveCustomPreset
  } = useSettings()

  const handleCarryoverUsed = useCallback(() => {
    setCarryoverBreakTime(0)
  }, [])

  const handleSessionComplete = useCallback((sessionData, autoStartNext, delayNext) => {
    // Capture statistics BEFORE updating them for accurate "previous session" display
    const previousStats = {
      completedSessions: settings.completedSessions,
      pauseCount: settings.pauseCount,
      totalBreakTime: settings.totalBreakTime
    }
    
    addSessionToHistory(sessionData)
    setCompletedSessionData({
      ...sessionData,
      previousStats // Include previous stats with session data
    })
    setShowCompletionModal(true)
    
    // Set the break time from this session as carryover for next session
    setCarryoverBreakTime(sessionData.breakTime)
    
    if (autoStartNext) {
      setTimeout(() => {
        setSessionIndex((i) => i + 1)
      }, Math.max(0, delayNext) * 1000)
    }
  }, [addSessionToHistory, settings.completedSessions, settings.pauseCount, settings.totalBreakTime])

  const { 
    remaining, 
    isRunning, 
    progress,
    breakTime,
    carryoverBreakTime: currentCarryover,
    startTimer, 
    pauseTimer, 
    resetTimer,
    setRemaining,
    setRemainingManual
  } = useTimer(sessionIndex, settings, handleSessionComplete, carryoverBreakTime, handleCarryoverUsed)

  const handleTimeUpdate = useCallback((newTime, shouldPause = true) => {
    // Only pause if explicitly requested (default behavior for manual edits)
    // Quick adjustments can choose not to pause
    if (shouldPause && isRunning) {
      pauseTimer()
      incrementPauseCount()
    }
    setRemainingManual(newTime)
  }, [pauseTimer, incrementPauseCount, setRemainingManual, isRunning])

  const handlePause = useCallback(() => {
    pauseTimer()
    incrementPauseCount()
  }, [pauseTimer, incrementPauseCount])

  const handleSkip = useCallback(() => {
    setSessionIndex((i) => i + 1)
    pauseTimer()
  }, [pauseTimer])

  const handleToggleStats = () => {
    setShowStats((prev) => !prev)
  }

  // Removed header presets toggle to simplify UI

  const handleAddCustomPreset = () => {
    setShowPresetModal(true)
  }

  const handleSaveCustomPreset = (preset, deleteName) => {
    saveCustomPreset(preset, deleteName)
  }

  const handleCloseCompletionModal = () => {
    setShowCompletionModal(false)
    setCompletedSessionData(null)
  }

  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800 p-4">
      {/* Crosshatch Art - Light Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
        repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
      `,
        }}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        <Header
          showStats={showStats}
          onToggleStats={handleToggleStats}
        />

        <div className={`grid grid-cols-1 gap-8 ${showStats ? 'lg:grid-cols-2' : ''}`}>
          <div className="space-y-8">
            <Timer
              sessionIndex={sessionIndex}
              remaining={remaining}
              isRunning={isRunning}
              progress={progress}
              breakTime={breakTime}
              carryoverBreakTime={currentCarryover}
              settings={settings}
              customPresets={customPresets}
              onStart={startTimer}
              onPause={handlePause}
              onReset={resetTimer}
              onSkip={handleSkip}
              onPresetSelect={updatePreset}
              onAddCustomPreset={handleAddCustomPreset}
              onTimeUpdate={handleTimeUpdate}
              onSettingsUpdate={updateSettings}
            />

            {/* Session Completion Modal - Now Inline */}
            <CompletionModal
              isOpen={showCompletionModal}
              onClose={handleCloseCompletionModal}
              sessionData={completedSessionData}
              totalStats={completedSessionData?.previousStats || {
                completedSessions: settings.completedSessions,
                pauseCount: settings.pauseCount,
                totalBreakTime: settings.totalBreakTime
              }}
            />
          </div>

          {showStats && (
            <Statistics settings={settings} />
          )}
        </div>
      </div>

      {/* Custom Preset Modal */}
      <CustomPresetModal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        onSave={handleSaveCustomPreset}
        customPresets={customPresets}
      />

    </div>
  )
}

export default App
