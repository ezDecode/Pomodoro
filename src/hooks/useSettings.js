import { useState, useEffect } from 'react'
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../utils/constants'

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

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
      totalWorkTime: sessionData.type === 'work' 
        ? prev.totalWorkTime + sessionData.duration 
        : prev.totalWorkTime,
      totalBreakTime: sessionData.type === 'break' 
        ? prev.totalBreakTime + sessionData.duration 
        : prev.totalBreakTime,
      sessionHistory: [...prev.sessionHistory.slice(-99), sessionData] // Keep last 100 sessions
    }))
  }

  const importSettings = (importedSettings) => {
    setSettings(prev => ({ ...prev, ...importedSettings }))
  }

  return {
    settings,
    updateSettings,
    updatePreset,
    addSessionToHistory,
    importSettings
  }
}