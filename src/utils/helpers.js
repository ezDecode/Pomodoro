export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const hh = hours > 0 ? String(hours).padStart(2, '0') + ':' : ''
  return `${hh}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Simple controllable notification beep
let __beepCtx = null
let __beepOsc = null
let __beepGain = null

export function startNotificationBeep(durationMs = 200) {
  stopNotificationBeep()
  try {
    __beepCtx = new (window.AudioContext || window.webkitAudioContext)()
    __beepOsc = __beepCtx.createOscillator()
    __beepGain = __beepCtx.createGain()
    __beepOsc.type = 'square'
    __beepOsc.frequency.value = 880
    __beepGain.gain.value = 1.0
    __beepOsc.connect(__beepGain)
    __beepGain.connect(__beepCtx.destination)
    __beepOsc.start()
    if (durationMs && durationMs > 0) {
      setTimeout(() => {
        stopNotificationBeep()
      }, durationMs)
    }
  } catch {
    // Ignore audio errors
  }
}

export function stopNotificationBeep() {
  try {
    if (__beepOsc) {
      __beepOsc.stop()
    }
  } catch {}
  try {
    if (__beepCtx) {
      __beepCtx.close()
    }
  } catch {}
  __beepOsc = null
  __beepGain = null
  __beepCtx = null
}

// Backward compatibility: legacy named export used before refactor
export function playNotificationBeep() {
  startNotificationBeep(200)
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

export function importSettings(event, onSettingsImport) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        onSettingsImport(imported)
      } catch (error) {
        alert('Invalid settings file')
      }
    }
    reader.readAsText(file)
  }
}


export function validateTimeInput(input) {
  if (!input || typeof input !== 'string') return { isValid: false, error: 'Invalid input' }
  
  const trimmed = input.trim()
  if (!trimmed) return { isValid: false, error: 'Empty input' }
  
  // Remove any non-digit, non-colon characters and handle common input mistakes
  const cleaned = trimmed.replace(/[^\d:]/g, '')
  if (!cleaned) return { isValid: false, error: 'No valid numbers found' }
  
  const parts = cleaned.split(':').map(part => {
    const num = parseInt(part, 10)
    return isNaN(num) ? 0 : num
  }).filter((_, index, arr) => index === 0 || arr[index - 1] !== undefined)
  
  // Handle empty parts after colon
  if (parts.some(isNaN)) return { isValid: false, error: 'Invalid number format' }
  
  // Use consistent time limits (imported at top of function to avoid circular imports)
  const maxHours = 8
  const maxMinutes = 480 // 8 hours worth of minutes  
  const maxSeconds = 28800 // 8 hours worth of seconds
  
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    if (hours < 0 || minutes < 0 || seconds < 0) return { isValid: false, error: 'Negative values not allowed' }
    if (minutes >= 60 || seconds >= 60) return { isValid: false, error: 'Minutes/seconds must be less than 60' }
    if (hours > maxHours) return { isValid: false, error: `Hours must be less than ${maxHours + 1}` }
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    if (totalSeconds === 0) return { isValid: false, error: 'Time cannot be zero' }
    if (totalSeconds > maxSeconds) return { isValid: false, error: `Total time cannot exceed ${maxHours} hours` }
    
    return { isValid: true, seconds: totalSeconds }
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts
    if (minutes < 0 || seconds < 0) return { isValid: false, error: 'Negative values not allowed' }
    if (seconds >= 60) return { isValid: false, error: 'Seconds must be less than 60' }
    if (minutes > maxMinutes) return { isValid: false, error: `Minutes must be less than ${maxMinutes + 1}` }
    
    const totalSeconds = minutes * 60 + seconds
    if (totalSeconds === 0) return { isValid: false, error: 'Time cannot be zero' }
    
    return { isValid: true, seconds: totalSeconds }
  } else if (parts.length === 1) {
    const value = parts[0]
    if (value < 0) return { isValid: false, error: 'Negative values not allowed' }
    if (value === 0) return { isValid: false, error: 'Time cannot be zero' }
    if (value > maxMinutes) return { isValid: false, error: `Value must be less than ${maxMinutes + 1}` }
    
    // Interpret single numbers as minutes if under 60, otherwise as seconds
    const seconds = value <= 60 ? value * 60 : value
    if (seconds > maxSeconds) return { isValid: false, error: `Total time cannot exceed ${maxHours} hours` }
    
    return { isValid: true, seconds }
  }
  
  return { isValid: false, error: 'Invalid format. Use MM:SS, HH:MM:SS, or minutes' }
}