export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const hh = hours > 0 ? String(hours).padStart(2, '0') + ':' : ''
  return `${hh}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}


export function calculateTotalCycleSeconds(preset) {
  // Since we removed breaks, cycle is just work sessions
  return preset.work * preset.cycle
}

export function getSessionInfo(sessionIndex, preset) {
  // All sessions are now work sessions
  const isWork = true
  const isLongBreak = false
  const sessionLabel = `Work Session ${Math.floor(sessionIndex) + 1}`
  const sessionDuration = preset.work
  
  return { isWork, isLongBreak, sessionLabel, sessionDuration }
}

export function exportSettings(settings) {
  const dataStr = JSON.stringify(settings, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pomodoro-settings.json'
  link.click()
  URL.revokeObjectURL(url)
}

export function importSettings(event, onSettingsImport, showError) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        onSettingsImport(imported)
      } catch (error) {
        if (showError) {
          showError('Import Error', 'The selected file is not a valid settings file. Please try again.')
        } else {
          // Fallback to browser alert if no custom alert function provided
          alert('Invalid settings file')
        }
      }
    }
    reader.readAsText(file)
  }
}


export function validateTimeInput(input) {
  if (!input || typeof input !== 'string') return { isValid: false, error: 'Invalid input' }
  
  const trimmed = input.trim()
  if (!trimmed) return { isValid: false, error: 'Empty input' }
  
  const cleaned = trimmed.replace(/[^\d:]/g, '')
  if (!cleaned) return { isValid: false, error: 'No valid numbers found' }
  
  const parts = cleaned.split(':').map(part => parseInt(part, 10) || 0)
  if (parts.some(isNaN)) return { isValid: false, error: 'Invalid number format' }
  
  const MAX_HOURS = 8, MAX_SECONDS = 28800
  
  if (parts.length === 3) {
    const [h, m, s] = parts
    if (m >= 60 || s >= 60) return { isValid: false, error: 'Minutes/seconds must be < 60' }
    if (h > MAX_HOURS) return { isValid: false, error: `Hours must be ≤ ${MAX_HOURS}` }
    const total = h * 3600 + m * 60 + s
    return total === 0 ? { isValid: false, error: 'Time cannot be zero' } : { isValid: true, seconds: total }
  } 
  
  if (parts.length === 2) {
    const [m, s] = parts
    if (s >= 60) return { isValid: false, error: 'Seconds must be < 60' }
    const total = m * 60 + s
    return total === 0 ? { isValid: false, error: 'Time cannot be zero' } : { isValid: true, seconds: total }
  }
  
  if (parts.length === 1) {
    const value = parts[0]
    if (value === 0) return { isValid: false, error: 'Time cannot be zero' }
    const seconds = value <= 60 ? value * 60 : value
    return seconds > MAX_SECONDS ? { isValid: false, error: `Max ${MAX_HOURS} hours` } : { isValid: true, seconds }
  }
  
  return { isValid: false, error: 'Invalid format. Use MM:SS, HH:MM:SS, or minutes' }
}