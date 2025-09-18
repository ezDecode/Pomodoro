import { useState, useEffect, useRef } from 'react'
import { playNotificationBeep, getSessionInfo } from '../utils/helpers'

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

  // Main timer logic
  useEffect(() => {
    if (!isRunning) return

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
          timerRef.current?.postMessage('stop')
          timerRef.current?.terminate()
          timerRef.current = null
          
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

    return () => {
      timerRef.current?.postMessage('stop')
      timerRef.current?.terminate()
      timerRef.current = null
    }
  }, [isRunning, autoStartNext, delayNext, sessionDuration, isWork, onSessionComplete])

  const startTimer = () => {
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
    const safe = Math.max(0, Number(seconds) || 0)
    setRemaining(safe)
    setBaselineSeconds(safe || sessionDuration)
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
