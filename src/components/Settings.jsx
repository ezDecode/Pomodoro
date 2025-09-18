import { useState } from 'react'
import { Download, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import { exportSettings, importSettings } from '../utils/helpers'

export function Settings({ 
  settings, 
  onSettingsUpdate, 
  onImportSettings 
}) {
  const { autoStartNext, delayNext, volume } = settings
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleImportSettings = (event) => {
    importSettings(event, onImportSettings)
  }

  return (
    <div className="card-brutal">
      <div className="mb-6">
        <h2 className="text-2xl font-normal">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure timer behavior and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Behavior */}
        <section>
          <h3 className="text-base font-medium mb-4">Behavior</h3>
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
