import { useState } from 'react'
import { Download, Upload, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import { exportSettings, importSettings, formatTime } from '../utils/helpers'

export function Settings({ 
  settings, 
  onSettingsUpdate, 
  onImportSettings 
}) {
  const { preset, autoStartNext, delayNext, volume } = settings
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showTimes, setShowTimes] = useState(true)
  const [showBehavior, setShowBehavior] = useState(true)

  const handleImportSettings = (event) => {
    importSettings(event, onImportSettings)
  }

  const handleTimeInputChange = (field, value) => {
    const seconds = Math.max(60, Number(value) * 60) // Minimum 1 minute
    onSettingsUpdate({
      preset: { ...preset, [field]: seconds }
    })
  }

  const DurationSelect = ({ label, field, value, options }) => {
    const currentMinutes = Math.floor(value / 60)
    const uniqueOptions = Array.from(new Set([...
      options,
      currentMinutes
    ])).sort((a, b) => a - b)
    return (
      <label className="flex flex-col gap-2">
        <span className="font-normal">{label}</span>
        <select
          className="input-brutal"
          value={currentMinutes}
          onChange={(e) => handleTimeInputChange(field, e.target.value)}
        >
          {uniqueOptions.map((m) => (
            <option key={`${field}-${m}`} value={m}>{m} min</option>
          ))}
        </select>
        <div className="text-xs text-gray-500 text-center">
          {formatTime(value)}
        </div>
      </label>
    )
  }

  return (
    <div className="card-brutal">
      <div className="mb-6">
        <h2 className="text-2xl font-normal">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Tune your focus and break durations. Advanced options are tucked away.</p>
      </div>

      <div className="space-y-6">
        {/* Focus & Breaks */}
        <section>
          <button
            className="w-full flex items-center justify-between text-left mb-2"
            onClick={() => setShowTimes((v) => !v)}
            title="Toggle Focus & Breaks"
          >
            <h3 className="text-base font-medium">Focus & Breaks</h3>
            {showTimes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showTimes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DurationSelect 
              label="Work (min)" 
              field="work" 
              value={preset.work} 
              options={[1,2,3,5,10,15,20,25,30,45,50,60,90,120]} 
            />
            <DurationSelect 
              label="Short break (min)" 
              field="shortBreak" 
              value={preset.shortBreak} 
              options={[1,2,3,5,10,15,20,30]} 
            />
            <DurationSelect 
              label="Long break (min)" 
              field="longBreak" 
              value={preset.longBreak} 
              options={[5,10,15,20,25,30,45,60]} 
            />
            <label className="flex flex-col gap-2">
              <span className="font-normal">Cycle (sessions)</span>
              <select
                className="input-brutal"
                value={preset.cycle}
                onChange={(e) => onSettingsUpdate({
                  preset: { ...preset, cycle: Math.max(1, Number(e.target.value)) }
                })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).concat(preset.cycle > 12 ? [preset.cycle] : []).map((c) => (
                  <option key={`cycle-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          )}
        </section>

        {/* Behavior */}
        <section>
          <button
            className="w-full flex items-center justify-between text-left mb-2"
            onClick={() => setShowBehavior((v) => !v)}
            title="Toggle Behavior"
          >
            <h3 className="text-base font-medium">Behavior</h3>
            {showBehavior ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showBehavior && (
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center justify-between gap-4">
              <span className="font-normal">Auto-start next</span>
              <input 
                type="checkbox" 
                checked={autoStartNext} 
                onChange={(e) => onSettingsUpdate({ autoStartNext: e.target.checked })}
                className="w-6 h-6"
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
                onChange={(e) => onSettingsUpdate({ volume: Number(e.target.value) })} 
              />
            </label>
          </div>
          )}
        </section>

        {/* Advanced & Data */}
        <section>
          <button
            className="w-full flex items-center justify-between text-left mb-2"
            onClick={() => setShowAdvanced((v) => !v)}
            title="Toggle Advanced & Data"
          >
            <h3 className="text-base font-medium">Advanced & Data</h3>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAdvanced && (
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4">
                <span className="font-normal">Delay before next (sec)</span>
                <input 
                  className="input-brutal w-28" 
                  type="number" 
                  min={0} 
                  max={60} 
                  value={delayNext} 
                  onChange={(e) => onSettingsUpdate({ delayNext: Math.max(0, Number(e.target.value)) })} 
                />
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="btn-brutal btn-success flex items-center justify-center gap-2 flex-1"
                  onClick={() => exportSettings(settings)}
                  title="Export settings"
                >
                  <Download size={16} />
                  Export
                </button>
                <label className="btn-brutal btn-secondary flex items-center justify-center gap-2 flex-1 cursor-pointer" title="Import settings">
                  <Upload size={16} />
                  Import
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
