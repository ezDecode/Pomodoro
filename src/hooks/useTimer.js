import { useState, useEffect, useRef } from 'react'
import { getSessionInfo } from '../utils/helpers'
import { playCompletionSound } from '../utils/sound'
import { TIME_LIMITS } from '../utils/constants'

export function useTimer(sessionIndex, settings, onSessionComplete, carryoverBreakTime = 0, onCarryoverUsed) {
  const { preset, autoStartNext, delayNext } = settings
  const { sessionDuration, isWork } = getSessionInfo(sessionIndex, preset)
  const totalSessionDuration = sessionDuration + carryoverBreakTime
  
  const [remaining, setRemaining] = useState(totalSessionDuration)
  const [baselineSeconds, setBaselineSeconds] = useState(totalSessionDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [breakTime, setBreakTime] = useState(0)
  const [pauseStartTime, setPauseStartTime] = useState(null)
  const timerRef = useRef(null)
  const breakTimerRef = useRef(null)
  const hasCompletedRef = useRef(false)

  // Update remaining time and baseline when session changes
  useEffect(() => {
    setRemaining(totalSessionDuration)
    setBaselineSeconds(totalSessionDuration)
    setBreakTime(0) // Reset break time for new session
    hasCompletedRef.current = false
    
    // Mark carryover as used when starting a new session
    if (carryoverBreakTime > 0 && onCarryoverUsed) {
      onCarryoverUsed()
    }
  }, [totalSessionDuration, carryoverBreakTime, onCarryoverUsed])

  // Reset completion guard when explicit session index changes
  useEffect(() => {
    hasCompletedRef.current = false
  }, [sessionIndex])

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
            // Prevent duplicate completion for the same session
            if (hasCompletedRef.current) {
              return 0
            }
            hasCompletedRef.current = true

            // Timer completed
            cleanupTimerWorker()
            setIsRunning(false)

            // Play completion sound
            playCompletionSound()

            // Create session data
            const sessionData = {
              type: 'work', // All sessions are now work sessions
              duration: totalSessionDuration,
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
    setRemaining(totalSessionDuration)
    setBaselineSeconds(totalSessionDuration)
    setBreakTime(0)
    setPauseStartTime(null)
    
    // Stop break timer if running
    if (breakTimerRef.current) {
      breakTimerRef.current.postMessage('stop')
      breakTimerRef.current.terminate()
      breakTimerRef.current = null
    }
  }

  const progressBase = baselineSeconds > 0 ? baselineSeconds : totalSessionDuration
  const progress = Math.min(100, Math.max(0, ((progressBase - remaining) / progressBase) * 100))

  // When user manually sets time (via editor or quick adjust), preserve progress where possible
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
    
    // Only update baseline if this is a major time change (like setting a completely new time)
    // or if no progress has been made yet. This preserves progress during small adjustments.
    const currentProgress = baselineSeconds > 0 ? ((baselineSeconds - remaining) / baselineSeconds) : 0
    const timeChangeRatio = Math.abs(safeTime - remaining) / (remaining || 1)
    
    // If this is a major change (>50% of current time) or no progress made, reset baseline
    if (currentProgress < 0.05 || timeChangeRatio > 0.5) {
      setBaselineSeconds(safeTime)
      
      // Reset break time when making major time adjustments (fresh start)
      setBreakTime(0)
      setPauseStartTime(null)
      
      // Clean up any running timers to prevent conflicts
      cleanupTimerWorker()
      
      // Stop break timer if running
      if (breakTimerRef.current) {
        breakTimerRef.current.postMessage('stop')
        breakTimerRef.current.terminate()
        breakTimerRef.current = null
      }
    }
    // For small adjustments, keep the original baseline to preserve progress
  }

  return {
    remaining,
    isRunning,
    progress,
    breakTime,
    carryoverBreakTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setRemaining,
    setRemainingManual
  }
}
