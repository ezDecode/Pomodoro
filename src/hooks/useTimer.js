import { useState, useEffect, useRef } from 'react'
import { playNotificationBeep, getSessionInfo } from '../utils/helpers'

export function useTimer(sessionIndex, settings, onSessionComplete) {
  const { preset, autoStartNext, delayNext, volume } = settings
  const { sessionDuration, isWork } = getSessionInfo(sessionIndex, preset)
  
  const [remaining, setRemaining] = useState(sessionDuration)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef(null)

  // Update remaining time when session changes
  useEffect(() => {
    setRemaining(sessionDuration)
  }, [sessionDuration])

  // Reset remaining time when session index changes and timer is running
  useEffect(() => {
    if (isRunning) {
      setRemaining(sessionDuration)
    }
  }, [sessionIndex, sessionDuration, isRunning])

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
          playNotificationBeep(volume)

          // Create session data
          const sessionData = {
            type: isWork ? 'work' : 'break',
            duration: sessionDuration,
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
  }, [isRunning, autoStartNext, delayNext, volume, sessionDuration, isWork, onSessionComplete])

  const startTimer = () => setIsRunning(true)
  const pauseTimer = () => setIsRunning(false)
  const resetTimer = () => {
    setIsRunning(false)
    setRemaining(sessionDuration)
  }

  const progress = ((sessionDuration - remaining) / sessionDuration) * 100

  return {
    remaining,
    isRunning,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
    setRemaining
  }
}
