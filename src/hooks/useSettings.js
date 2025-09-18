import { useState, useEffect } from 'react'
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../utils/constants'

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })

  const [customPresets, setCustomPresets] = useState(() => {
    const saved = localStorage.getItem('pomodoro-custom-presets')
    return saved ? JSON.parse(saved) : []
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  // Save custom presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pomodoro-custom-presets', JSON.stringify(customPresets))
  }, [customPresets])

  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  const updatePreset = (preset) => {
    setSettings(prev => ({ ...prev, preset }))
  }

  const addSessionToHistory = (sessionData) => {
    setSettings(prev => ({
      ...prev,
      completedSessions: prev.completedSessions + 1,
      totalWorkTime: prev.totalWorkTime + sessionData.duration,
      totalBreakTime: prev.totalBreakTime + sessionData.breakTime, // Add break time from session
      sessionHistory: [...prev.sessionHistory.slice(-99), sessionData] // Keep last 100 sessions
    }))
  }

  const incrementPauseCount = () => {
    setSettings(prev => ({
      ...prev,
      pauseCount: (prev.pauseCount || 0) + 1
    }))
  }

  const importSettings = (importedSettings) => {
    setSettings(prev => ({ ...prev, ...importedSettings }))
  }

  const saveCustomPreset = (preset, deleteName = null) => {
    if (deleteName) {
      // Delete preset
      setCustomPresets(prev => prev.filter(p => p.name !== deleteName))
    } else if (preset) {
      // Add or update preset
      setCustomPresets(prev => {
        const existingIndex = prev.findIndex(p => p.name === preset.name)
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev]
          updated[existingIndex] = preset
          return updated
        } else {
          // Add new
          return [...prev, preset]
        }
      })
    }
  }

  return {
    settings,
    customPresets,
    updateSettings,
    updatePreset,
    addSessionToHistory,
    incrementPauseCount,
    importSettings,
    saveCustomPreset
  }
}
