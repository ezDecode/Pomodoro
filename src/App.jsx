import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Settings, BarChart3, Download, Upload, Plus, Edit3, Trash2, Save, X } from 'lucide-react'

const defaultPreset = {
  name: '25/5/15',
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  cycle: 4,
}

const defaultSettings = {
  preset: defaultPreset,
  presets: [
    { id: '1', name: '25/5/15', work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60, cycle: 4 },
    { id: '2', name: '50/10/20', work: 50 * 60, shortBreak: 10 * 60, longBreak: 20 * 60, cycle: 3 },
    { id: '3', name: '90/20/30', work: 90 * 60, shortBreak: 20 * 60, longBreak: 30 * 60, cycle: 2 }
  ],
  autoStartNext: true,
  delayNext: 0,
  volume: 0.5,
  completedSessions: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  sessionHistory: []
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const hh = hours > 0 ? String(hours).padStart(2, '0') + ':' : ''
  return `${hh}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function PomodoroLogo({ className = "w-12 h-12" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tomato body */}
      <circle cx="50" cy="60" r="35" fill="#ef4444" stroke="#000" strokeWidth="2"/>
      {/* Tomato top */}
      <path d="M35 25 Q50 15 65 25 L60 35 Q50 30 40 35 Z" fill="#22c55e" stroke="#000" strokeWidth="2"/>
      {/* Tomato stem */}
      <rect x="48" y="20" width="4" height="8" fill="#16a34a" stroke="#000" strokeWidth="1"/>
      {/* Timer face */}
      <circle cx="50" cy="60" r="25" fill="#fff" stroke="#000" strokeWidth="2"/>
      {/* Clock hands */}
      <line x1="50" y1="60" x2="50" y2="45" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="60" x2="60" y2="60" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Center dot */}
      <circle cx="50" cy="60" r="3" fill="#000"/>
      {/* Clock numbers */}
      <text x="50" y="40" textAnchor="middle" fontSize="8" fill="#000" fontWeight="bold">12</text>
      <text x="70" y="65" textAnchor="middle" fontSize="8" fill="#000" fontWeight="bold">3</text>
      <text x="50" y="85" textAnchor="middle" fontSize="8" fill="#000" fontWeight="bold">6</text>
      <text x="30" y="65" textAnchor="middle" fontSize="8" fill="#000" fontWeight="bold">9</text>
    </svg>
  )
}

function App() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pomodoro-settings')
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
  })
  
  const [sessionIndex, setSessionIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPresetManager, setShowPresetManager] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)
  const [newPreset, setNewPreset] = useState({ name: '', work: 25, shortBreak: 5, longBreak: 15, cycle: 4 })

  const { preset, presets, autoStartNext, delayNext, volume, completedSessions, totalWorkTime, totalBreakTime, sessionHistory } = settings

  const isWork = sessionIndex % 2 === 0
  const isLongBreak = !isWork && ((sessionIndex + 1) % (preset.cycle * 2) === 0)
  const sessionLabel = isWork ? 'Work' : isLongBreak ? 'Long break' : 'Short break'
  const sessionDuration = isWork ? preset.work : isLongBreak ? preset.longBreak : preset.shortBreak

  const [remaining, setRemaining] = useState(sessionDuration)
  useEffect(() => {
    setRemaining(sessionDuration)
  }, [sessionDuration])

  const timerRef = useRef(null)
  const audioRef = useRef(null)

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings))
  }, [settings])

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
          timerRef.current?.postMessage('stop')
          timerRef.current?.terminate()
          timerRef.current = null
          
          // Play notification beep using Web Audio API (no external file)
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

          // Update statistics
          const sessionData = {
            type: isWork ? 'work' : 'break',
            duration: sessionDuration,
            completedAt: new Date().toISOString()
          }
          
          setSettings(prev => ({
            ...prev,
            completedSessions: prev.completedSessions + 1,
            totalWorkTime: isWork ? prev.totalWorkTime + sessionDuration : prev.totalWorkTime,
            totalBreakTime: !isWork ? prev.totalBreakTime + sessionDuration : prev.totalBreakTime,
            sessionHistory: [...prev.sessionHistory.slice(-99), sessionData] // Keep last 100 sessions
          }))

          if (autoStartNext) {
            setTimeout(() => {
              setSessionIndex((i) => i + 1)
              setIsRunning(true)
            }, Math.max(0, delayNext) * 1000)
          } else {
            setIsRunning(false)
          }
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
  }, [isRunning, autoStartNext, delayNext, volume, sessionDuration, isWork])

  useEffect(() => {
    if (!isRunning) return
    setRemaining(sessionDuration)
  }, [sessionIndex])

  const totalCycleSeconds = useMemo(() => {
    const oneCycle = preset.work * preset.cycle + preset.shortBreak * (preset.cycle - 1) + preset.longBreak
    return oneCycle
  }, [preset])

  const progress = ((sessionDuration - remaining) / sessionDuration) * 100

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pomodoro-settings.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          setSettings(prev => ({ ...prev, ...imported }))
        } catch (error) {
          alert('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
  }

  const addPreset = () => {
    if (!newPreset.name.trim()) {
      alert('Please enter a preset name')
      return
    }
    
    const presetData = {
      id: Date.now().toString(),
      name: newPreset.name.trim(),
      work: newPreset.work * 60,
      shortBreak: newPreset.shortBreak * 60,
      longBreak: newPreset.longBreak * 60,
      cycle: newPreset.cycle
    }
    
    setSettings(prev => ({
      ...prev,
      presets: [...prev.presets, presetData]
    }))
    
    setNewPreset({ name: '', work: 25, shortBreak: 5, longBreak: 15, cycle: 4 })
  }

  const updatePreset = (id, updatedPreset) => {
    setSettings(prev => ({
      ...prev,
      presets: prev.presets.map(p => p.id === id ? { ...p, ...updatedPreset } : p)
    }))
    setEditingPreset(null)
  }

  const deletePreset = (id) => {
    if (presets.length <= 1) {
      alert('Cannot delete the last preset')
      return
    }
    
    setSettings(prev => ({
      ...prev,
      presets: prev.presets.filter(p => p.id !== id),
      preset: prev.preset.id === id ? prev.presets[0] : prev.preset
    }))
  }

  const selectPreset = (presetData) => {
    setSettings(prev => ({
      ...prev,
      preset: presetData
    }))
    setShowPresetManager(false)
  }

  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800 p-4">
      {/* Crosshatch Art - Light Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
        repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
      `,
        }}
      />

      {/* Header */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <PomodoroLogo className="w-16 h-16" />
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight">Pomodoro</h1>
              <p className="text-base sm:text-lg md:text-xl font-normal">Ultra-flexible timer</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 btn-icon-only"
              onClick={() => {
                setShowStats((prev) => {
                  const next = !prev
                  if (next) {
                    setShowSettings(false)
                    setShowPresetManager(false)
                  }
                  return next
                })
              }}
              title="Statistics"
            >
              <BarChart3 size={20} />
              <span className="hide-text-mobile">Stats</span>
            </button>
            <button 
              className="btn-brutal btn-success flex items-center gap-2 sm:gap-2 btn-icon-only"
              onClick={() => {
                setShowPresetManager((prev) => {
                  const next = !prev
                  if (next) {
                    setShowStats(false)
                    setShowSettings(false)
                  }
                  return next
                })
              }}
              title="Manage Presets"
            >
              <Plus size={20} />
              <span className="hide-text-mobile">Presets</span>
            </button>
            <button 
              className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 btn-icon-only"
              onClick={() => {
                setShowSettings((prev) => {
                  const next = !prev
                  if (next) {
                    setShowStats(false)
                    setShowPresetManager(false)
                  }
                  return next
                })
              }}
              title="Settings"
            >
              <Settings size={20} />
              <span className="hide-text-mobile">Settings</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <div className="card-brutal text-center">
              <div className="mb-8">
                <div className="text-lg sm:text-xl font-normal mb-4">{sessionLabel}</div>
                <div className="timer-display mb-4 text-6xl sm:text-7xl md:text-8xl font-light tracking-tight">{formatTime(remaining)}</div>
                <div className="text-base sm:text-lg font-normal">Cycle total: {formatTime(totalCycleSeconds)}</div>
              </div>

              {/* Progress Bar */}
              <div className="progress-brutal mb-8">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {!isRunning ? (
                  <button 
                    className="btn-brutal btn-primary flex items-center gap-2 sm:gap-2 btn-icon-only"
                    onClick={() => setIsRunning(true)}
                    title="Start timer"
                  >
                    <Play size={20} />
                    <span className="hide-text-mobile">Start</span>
                  </button>
                ) : (
                  <button 
                    className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 btn-icon-only"
                    onClick={() => setIsRunning(false)}
                    title="Pause timer"
                  >
                    <Pause size={20} />
                    <span className="hide-text-mobile">Pause</span>
                  </button>
                )}
                <button 
                  className="btn-brutal flex items-center gap-2 sm:gap-2 btn-icon-only"
                  onClick={() => { setIsRunning(false); setRemaining(sessionDuration); }}
                  title="Reset timer"
                >
                  <RotateCcw size={20} />
                  <span className="hide-text-mobile">Reset</span>
                </button>
                <button 
                  className="btn-brutal flex items-center gap-2 sm:gap-2 btn-icon-only"
                  onClick={() => { setSessionIndex((i) => i + 1); setIsRunning(false); }}
                  title="Skip to next session"
                >
                  <SkipForward size={20} />
                  <span className="hide-text-mobile">Skip</span>
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap justify-center gap-4">
                {presets.map((presetData) => (
                  <button 
                    key={presetData.id}
                    className={`btn-brutal preset-compact ${
                      preset.id === presetData.id ? 'btn-primary' : 'btn-success'
                    }`}
                    onClick={() => selectPreset(presetData)}
                  >
                    {presetData.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="card-brutal">
              <h2 className="text-2xl font-normal mb-6">Settings</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="font-normal">Work (min)</span>
                    <input 
                      className="input-brutal" 
                      type="number" 
                      min={0} 
                      max={999} 
                      value={Math.floor(preset.work/60)} 
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preset: { ...prev.preset, work: Math.max(0, Number(e.target.value)) * 60 }
                      }))} 
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-normal">Short break (min)</span>
                    <input 
                      className="input-brutal" 
                      type="number" 
                      min={0} 
                      max={999} 
                      value={Math.floor(preset.shortBreak/60)} 
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preset: { ...prev.preset, shortBreak: Math.max(0, Number(e.target.value)) * 60 }
                      }))} 
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-normal">Long break (min)</span>
                    <input 
                      className="input-brutal" 
                      type="number" 
                      min={0} 
                      max={999} 
                      value={Math.floor(preset.longBreak/60)} 
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preset: { ...prev.preset, longBreak: Math.max(0, Number(e.target.value)) * 60 }
                      }))} 
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="font-normal">Cycle (sessions)</span>
                    <input 
                      className="input-brutal" 
                      type="number" 
                      min={1} 
                      max={99} 
                      value={preset.cycle} 
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        preset: { ...prev.preset, cycle: Math.max(1, Number(e.target.value)) }
                      }))} 
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-4">
                    <span className="font-normal">Auto-start next</span>
                    <input 
                      type="checkbox" 
                      checked={autoStartNext} 
                      onChange={(e) => setSettings(prev => ({ ...prev, autoStartNext: e.target.checked }))}
                      className="w-6 h-6"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4">
                    <span className="font-normal">Delay (sec)</span>
                    <input 
                      className="input-brutal w-24" 
                      type="number" 
                      min={0} 
                      max={60} 
                      value={delayNext} 
                      onChange={(e) => setSettings(prev => ({ ...prev, delayNext: Math.max(0, Number(e.target.value)) }))} 
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4">
                    <span className="font-normal">Volume</span>
                    <input 
                      className="w-full" 
                      type="range" 
                      min={0} 
                      max={1} 
                      step={0.01} 
                      value={volume} 
                      onChange={(e) => setSettings(prev => ({ ...prev, volume: Number(e.target.value) }))} 
                    />
                  </label>
      </div>

                <div className="flex gap-4">
                  <button 
                    className="btn-brutal btn-success flex items-center gap-2 sm:gap-2 flex-1 btn-icon-only"
                    onClick={exportSettings}
                    title="Export settings"
                  >
                    <Download size={16} />
                    <span className="hide-text-mobile">Export</span>
        </button>
                  <label className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 flex-1 cursor-pointer btn-icon-only" title="Import settings">
                    <Upload size={16} />
                    <span className="hide-text-mobile">Import</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={importSettings}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Panel */}
          {showStats && (
            <div className="card-brutal">
              <h2 className="text-2xl font-normal mb-6">Statistics</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-light text-red-500">{completedSessions}</div>
                    <div className="text-sm font-normal">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-light text-blue-500">{formatTime(totalWorkTime)}</div>
                    <div className="text-sm font-normal">Work time</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-light text-green-500">{formatTime(totalBreakTime)}</div>
                  <div className="text-sm font-normal">Break time</div>
                </div>

                {sessionHistory.length > 0 && (
                  <div>
                    <h3 className="text-lg font-normal mb-3">Recent sessions</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {sessionHistory.slice(-10).reverse().map((session, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border-2 border-black bg-gray-100">
                          <span className="font-normal text-sm">
                            {session.type}
                          </span>
                          <span className="font-normal text-sm">
                            {formatTime(session.duration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preset Manager Panel */}
          {showPresetManager && (
            <div className="card-brutal">
              <h2 className="text-2xl font-normal mb-6">Manage Presets</h2>
              
              <div className="space-y-6">
                {/* Add New Preset */}
                <div className="border-2 border-black p-4 bg-gray-50">
                  <h3 className="text-lg font-normal mb-4">Add New Preset</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Name</span>
                      <input 
                        className="input-brutal" 
                        type="text" 
                        value={newPreset.name}
                        onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., My Custom"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Work (min)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={999} 
                        value={newPreset.work}
                        onChange={(e) => setNewPreset(prev => ({ ...prev, work: Math.max(1, Number(e.target.value)) }))}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Short break (min)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={999} 
                        value={newPreset.shortBreak}
                        onChange={(e) => setNewPreset(prev => ({ ...prev, shortBreak: Math.max(1, Number(e.target.value)) }))}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Long break (min)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={999} 
                        value={newPreset.longBreak}
                        onChange={(e) => setNewPreset(prev => ({ ...prev, longBreak: Math.max(1, Number(e.target.value)) }))}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Cycle (sessions)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={99} 
                        value={newPreset.cycle}
                        onChange={(e) => setNewPreset(prev => ({ ...prev, cycle: Math.max(1, Number(e.target.value)) }))}
                      />
                    </label>
                    <div className="flex items-end">
                      <button 
                        className="btn-brutal btn-success flex items-center gap-2"
                        onClick={addPreset}
                      >
                        <Plus size={16} />
                        Add Preset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Presets */}
                <div>
                  <h3 className="text-lg font-normal mb-4">Existing Presets</h3>
                  <div className="space-y-3">
                    {presets.map((presetData) => (
                      <div key={presetData.id} className="flex items-center justify-between p-3 border-2 border-black bg-white">
                        <div className="flex-1">
                          <div className="font-normal text-lg">{presetData.name}</div>
                          <div className="text-sm text-gray-600">
                            {Math.floor(presetData.work/60)}min work, {Math.floor(presetData.shortBreak/60)}min short, {Math.floor(presetData.longBreak/60)}min long, {presetData.cycle} cycles
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn-brutal btn-secondary flex items-center gap-1 px-3 py-1 text-sm"
                            onClick={() => setEditingPreset(presetData)}
                            title="Edit preset"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn-brutal flex items-center gap-1 px-3 py-1 text-sm"
                            onClick={() => deletePreset(presetData.id)}
                            title="Delete preset"
                            disabled={presets.length <= 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Preset Modal */}
          {editingPreset && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="card-brutal max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-normal">Edit Preset</h3>
                  <button 
                    className="btn-brutal btn-secondary flex items-center gap-1 px-3 py-1"
                    onClick={() => setEditingPreset(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <label className="flex flex-col gap-2">
                    <span className="font-normal">Name</span>
                    <input 
                      className="input-brutal" 
                      type="text" 
                      value={editingPreset.name}
                      onChange={(e) => setEditingPreset(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Work (min)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={999} 
                        value={Math.floor(editingPreset.work/60)}
                        onChange={(e) => setEditingPreset(prev => ({ ...prev, work: Math.max(1, Number(e.target.value)) * 60 }))}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Short break (min)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={999} 
                        value={Math.floor(editingPreset.shortBreak/60)}
                        onChange={(e) => setEditingPreset(prev => ({ ...prev, shortBreak: Math.max(1, Number(e.target.value)) * 60 }))}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Long break (min)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={999} 
                        value={Math.floor(editingPreset.longBreak/60)}
                        onChange={(e) => setEditingPreset(prev => ({ ...prev, longBreak: Math.max(1, Number(e.target.value)) * 60 }))}
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="font-normal">Cycle (sessions)</span>
                      <input 
                        className="input-brutal" 
                        type="number" 
                        min={1} 
                        max={99} 
                        value={editingPreset.cycle}
                        onChange={(e) => setEditingPreset(prev => ({ ...prev, cycle: Math.max(1, Number(e.target.value)) }))}
                      />
                    </label>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      className="btn-brutal btn-success flex items-center gap-2 flex-1"
                      onClick={() => updatePreset(editingPreset.id, editingPreset)}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                    <button 
                      className="btn-brutal btn-secondary flex items-center gap-2 flex-1"
                      onClick={() => setEditingPreset(null)}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
