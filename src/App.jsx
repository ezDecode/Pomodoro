import { useState, useCallback } from 'react'
import { Header, Timer, Settings, Statistics } from './components'
import { useSettings } from './hooks/useSettings'
import { useTimer } from './hooks/useTimer'

function App() {
  const [sessionIndex, setSessionIndex] = useState(0)
  const [showStats, setShowStats] = useState(false)

  const { 
    settings, 
    updateSettings, 
    updatePreset, 
    addSessionToHistory, 
    importSettings 
  } = useSettings()

  const handleSessionComplete = useCallback((sessionData, autoStartNext, delayNext) => {
    addSessionToHistory(sessionData)
    
    if (autoStartNext) {
      setTimeout(() => {
        setSessionIndex((i) => i + 1)
      }, Math.max(0, delayNext) * 1000)
    }
  }, [addSessionToHistory])

  const { 
    remaining, 
    isRunning, 
    progress, 
    startTimer, 
    pauseTimer, 
    resetTimer 
  } = useTimer(sessionIndex, settings, handleSessionComplete)

  const handleSkip = () => {
    setSessionIndex((i) => i + 1)
    pauseTimer()
  }

  const handleToggleStats = () => {
    setShowStats((prev) => !prev)
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
          <Timer
            sessionIndex={sessionIndex}
            remaining={remaining}
            isRunning={isRunning}
            progress={progress}
            settings={settings}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onSkip={handleSkip}
            onPresetSelect={updatePreset}
            onSettingsUpdate={updateSettings}
            onImportSettings={importSettings}
          />

          {showStats && (
            <Statistics settings={settings} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
