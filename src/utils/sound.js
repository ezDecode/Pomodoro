// Simple audio utility for playing completion sound
let audioInstance = null

export function playCompletionSound() {
  try {
    // Stop any currently playing sound
    if (audioInstance) {
      audioInstance.pause()
      audioInstance.currentTime = 0
    }
    
    // Create new audio instance
    audioInstance = new Audio('/sound/completionSound.mp3')
    audioInstance.volume = 0.7 // Set reasonable volume
    
    // Play the sound
    const playPromise = audioInstance.play()
    
    // Handle promise-based play() method
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Audio playback failed:', error)
        // Fallback to programmatic beep if MP3 fails
        fallbackBeep()
      })
    }
  } catch (error) {
    console.warn('Audio initialization failed:', error)
    // Fallback to programmatic beep if MP3 fails
    fallbackBeep()
  }
}

// Simplified fallback beep (much shorter than original)
function fallbackBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = 'square'
    osc.frequency.value = 880
    gain.gain.value = 0.3
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start()
    osc.stop(ctx.currentTime + 0.2) // 200ms beep
    
    // Clean up after beep
    setTimeout(() => ctx.close(), 250)
  } catch {
    // Silent fail if no audio support
  }
}
