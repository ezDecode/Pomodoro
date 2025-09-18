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

  const handleTimeAdjust = (field, seconds) => {
    const currentValue = preset[field]
    const newValue = Math.max(60, currentValue + seconds) // Minimum 1 minute
    onSettingsUpdate({
      preset: { ...preset, [field]: newValue }
    })
  }

  const handleTimeInputChange = (field, value) => {
    const seconds = Math.max(60, Number(value) * 60) // Minimum 1 minute
    onSettingsUpdate({
      preset: { ...preset, [field]: seconds }
    })
  }

  const TimeInput = ({ label, field, value, min = 1, max = 999 }) => (
    <label className="flex flex-col gap-2">
      <span className="font-normal">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleTimeAdjust(field, -60)}
          className="btn-brutal btn-neutral btn-icon-only"
          title="Remove 1 minute"
        >
          <Minus size={14} />
        </button>
        <input 
          className="input-brutal flex-1 text-center" 
          type="number" 
          min={min} 
          max={max} 
          value={Math.floor(value/60)} 
          onChange={(e) => handleTimeInputChange(field, e.target.value)}
        />
        <button
          onClick={() => handleTimeAdjust(field, 60)}
          className="btn-brutal btn-neutral btn-icon-only"
          title="Add 1 minute"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="text-xs text-gray-500 text-center">
        {formatTime(value)}
      </div>
    </label>
  )

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
            <TimeInput 
              label="Work (min)" 
              field="work" 
              value={preset.work} 
              min={1} 
              max={999} 
            />
            <TimeInput 
              label="Short break (min)" 
              field="shortBreak" 
              value={preset.shortBreak} 
              min={1} 
              max={999} 
            />
            <TimeInput 
              label="Long break (min)" 
              field="longBreak" 
              value={preset.longBreak} 
              min={1} 
              max={999} 
            />
            <label className="flex flex-col gap-2">
              <span className="font-normal">Cycle (sessions)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSettingsUpdate({
                    preset: { ...preset, cycle: Math.max(1, preset.cycle - 1) }
                  })}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Decrease cycle"
                >
                  <Minus size={14} />
                </button>
                <input 
                  className="input-brutal flex-1 text-center" 
                  type="number" 
                  min={1} 
                  max={99} 
                  value={preset.cycle} 
                  onChange={(e) => onSettingsUpdate({
                    preset: { ...preset, cycle: Math.max(1, Number(e.target.value)) }
                  })} 
                />
                <button
                  onClick={() => onSettingsUpdate({
                    preset: { ...preset, cycle: Math.min(99, preset.cycle + 1) }
                  })}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Increase cycle"
                >
                  <Plus size={14} />
                </button>
              </div>
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
