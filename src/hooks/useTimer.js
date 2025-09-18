import { useState, useEffect, useRef } from 'react'
import { playNotificationBeep, getSessionInfo } from '../utils/helpers'
import { TIME_LIMITS } from '../utils/constants'

export function useTimer(sessionIndex, settings, onSessionComplete) {
  const { preset, autoStartNext, delayNext } = settings
  const { sessionDuration, isWork } = getSessionInfo(sessionIndex, preset)
  
  const [remaining, setRemaining] = useState(sessionDuration)
  const [baselineSeconds, setBaselineSeconds] = useState(sessionDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [breakTime, setBreakTime] = useState(0)
  const [pauseStartTime, setPauseStartTime] = useState(null)
  const timerRef = useRef(null)
  const breakTimerRef = useRef(null)

  // Update remaining time and baseline when session changes
  useEffect(() => {
    setRemaining(sessionDuration)
    setBaselineSeconds(sessionDuration)
    setBreakTime(0) // Reset break time for new session
  }, [sessionDuration])

  // Helper function to clean up timer worker
  const cleanupTimerWorker = () => {
    if (timerRef.current) {
      timerRef.current.postMessage('stop')
      timerRef.current.terminate()
      timerRef.current = null
    }
  }

  // Main timer logic
  useEffect(() => {
    if (!isRunning) {
      cleanupTimerWorker()
      return
    }

    // Ensure any existing worker is cleaned up first
    cleanupTimerWorker()

    // Small delay to ensure cleanup is complete
    const startTimer = setTimeout(() => {
      timerRef.current = new Worker(
        URL.createObjectURL(
          new Blob([
            `let id; onmessage=(e)=>{ if(e.data==='start'){ clearInterval(id); id=setInterval(()=>postMessage('tick'),1000); } if(e.data==='stop'){ clearInterval(id); } }`,
          ], { type: 'text/javascript' })
        )
      )

      const onTick = () => {
        setRemaining((r) => {
          if (r <= 1) {
            // Timer completed
            cleanupTimerWorker()
            
            // Play notification beep
            playNotificationBeep()

            // Create session data
            const sessionData = {
              type: 'work', // All sessions are now work sessions
              duration: sessionDuration,
              breakTime: breakTime,
              completedAt: new Date().toISOString()
            }
            
            // Notify parent of session completion
            onSessionComplete(sessionData, autoStartNext, delayNext)
            
            return 0
          }
          return r - 1
        })
      }

      timerRef.current.onmessage = onTick
      timerRef.current.postMessage('start')
    }, 10) // Small delay to ensure cleanup

    return () => {
      clearTimeout(startTimer)
      cleanupTimerWorker()
    }
  }, [isRunning, autoStartNext, delayNext, sessionDuration, isWork, onSessionComplete, breakTime])

  const startTimer = () => {
    // Ensure any existing timer worker is cleaned up first
    cleanupTimerWorker()
    
    // If resuming from pause, stop break time tracking
    if (pauseStartTime) {
      const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000)
      setBreakTime(prev => prev + pauseDuration)
      setPauseStartTime(null)
    }
    
    // Stop break timer if running
    if (breakTimerRef.current) {
      breakTimerRef.current.postMessage('stop')
      breakTimerRef.current.terminate()
      breakTimerRef.current = null
    }
    
    setIsRunning(true)
  }
  
  const pauseTimer = () => {
    // Clean up main timer first
    cleanupTimerWorker()
    setIsRunning(false)
    setPauseStartTime(Date.now())
    
    // Start break time tracking
    breakTimerRef.current = new Worker(
      URL.createObjectURL(
        new Blob([
          `let id; onmessage=(e)=>{ if(e.data==='start'){ clearInterval(id); id=setInterval(()=>postMessage('tick'),1000); } if(e.data==='stop'){ clearInterval(id); } }`,
        ], { type: 'text/javascript' })
      )
    )
    
    breakTimerRef.current.onmessage = () => {
      setBreakTime(prev => prev + 1)
    }
    
    breakTimerRef.current.postMessage('start')
  }
  
  const resetTimer = () => {
    // Clean up both timers
    cleanupTimerWorker()
    setIsRunning(false)
    setRemaining(sessionDuration)
    setBaselineSeconds(sessionDuration)
    setBreakTime(0)
    setPauseStartTime(null)
    
    // Stop break timer if running
    if (breakTimerRef.current) {
      breakTimerRef.current.postMessage('stop')
      breakTimerRef.current.terminate()
      breakTimerRef.current = null
    }
  }

  const progressBase = baselineSeconds > 0 ? baselineSeconds : sessionDuration
  const progress = Math.min(100, Math.max(0, ((progressBase - remaining) / progressBase) * 100))

  // When user manually sets time (via editor or quick adjust), also update baseline
  const setRemainingManual = (seconds) => {
    const inputSeconds = Number(seconds)
    
    // Validate input
    if (isNaN(inputSeconds) || inputSeconds < 0) {
      console.warn('Invalid time input:', seconds)
      return
    }
    
    // Use consistent time limits
    const { MIN_SECONDS: minTime, MAX_SECONDS: maxTime } = TIME_LIMITS
    const safeTime = Math.min(maxTime, Math.max(minTime, inputSeconds))
    
    // Update remaining time
    setRemaining(safeTime)
    
    // Update baseline for progress calculation
    // If we're adjusting during session, use the adjusted time as new baseline
    setBaselineSeconds(safeTime)
    
    // Reset break time when manually adjusting time (fresh start)
    if (safeTime !== remaining) {
      // Clean up any running timers to prevent conflicts
      cleanupTimerWorker()
      
      setBreakTime(0)
      setPauseStartTime(null)
      
      // Stop break timer if running
      if (breakTimerRef.current) {
        breakTimerRef.current.postMessage('stop')
        breakTimerRef.current.terminate()
        breakTimerRef.current = null
      }
    }
  }

  return {
    remaining,
    isRunning,
    progress,
    breakTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setRemaining,
    setRemainingManual
  }
}
