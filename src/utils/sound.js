// Optimized audio utility with preloading and caching
let audioInstance = null
let isPreloaded = false

// Preload audio on module load for instant playback
function preloadAudio() {
  if (isPreloaded) return
  
  try {
    audioInstance = new Audio('/sound/completionSound.mp3')
    audioInstance.volume = 0.7
    audioInstance.preload = 'auto'
    
    // Preload the audio
    audioInstance.load()
    isPreloaded = true
  } catch (error) {
    console.warn('Audio preload failed:', error)
  }
}

// Initialize preloading immediately
preloadAudio()

export function playCompletionSound() {
  try {
    // Use preloaded instance or create new one
    if (!audioInstance || !isPreloaded) {
      audioInstance = new Audio('/sound/completionSound.mp3')
      audioInstance.volume = 0.7
    }
    
    // Stop any currently playing sound
    audioInstance.pause()
    audioInstance.currentTime = 0
    
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
    console.warn('Audio playback failed:', error)
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
