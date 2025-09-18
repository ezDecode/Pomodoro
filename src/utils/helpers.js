export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const hh = hours > 0 ? String(hours).padStart(2, '0') + ':' : ''
  return `${hh}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function playNotificationBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = 880
    g.gain.value = 1.0 // Use system volume (max volume, system will control)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    setTimeout(() => { o.stop(); ctx.close() }, 200)
  } catch {}
}

export function calculateTotalCycleSeconds(preset) {
  return preset.work * preset.cycle + preset.shortBreak * (preset.cycle - 1) + preset.longBreak
}

export function getSessionInfo(sessionIndex, preset) {
  const isWork = sessionIndex % 2 === 0
  const isLongBreak = !isWork && ((sessionIndex + 1) % (preset.cycle * 2) === 0)
  const sessionLabel = isWork ? 'Work' : isLongBreak ? 'Long break' : 'Short break'
  const sessionDuration = isWork ? preset.work : isLongBreak ? preset.longBreak : preset.shortBreak
  
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
  
  const parts = trimmed.split(':').map(Number)
  
  if (parts.some(isNaN)) return { isValid: false, error: 'Invalid number format' }
  
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    if (hours < 0 || minutes < 0 || seconds < 0) return { isValid: false, error: 'Negative values not allowed' }
    if (minutes >= 60 || seconds >= 60) return { isValid: false, error: 'Minutes/seconds must be less than 60' }
    if (hours > 23) return { isValid: false, error: 'Hours must be less than 24' }
    return { isValid: true, seconds: hours * 3600 + minutes * 60 + seconds }
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts
    if (minutes < 0 || seconds < 0) return { isValid: false, error: 'Negative values not allowed' }
    if (seconds >= 60) return { isValid: false, error: 'Seconds must be less than 60' }
    if (minutes > 999) return { isValid: false, error: 'Minutes must be less than 1000' }
    return { isValid: true, seconds: minutes * 60 + seconds }
  } else if (parts.length === 1) {
    const value = parts[0]
    if (value < 0) return { isValid: false, error: 'Negative values not allowed' }
    if (value > 999) return { isValid: false, error: 'Value must be less than 1000' }
    
    const seconds = value < 60 ? value * 60 : value
    return { isValid: true, seconds }
  }
  
  return { isValid: false, error: 'Invalid format. Use MM:SS, HH:MM:SS, or minutes' }
}