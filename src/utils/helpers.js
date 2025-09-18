export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const hh = hours > 0 ? String(hours).padStart(2, '0') + ':' : ''
  return `${hh}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function playNotificationBeep(volume) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = 880
    g.gain.value = volume
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
