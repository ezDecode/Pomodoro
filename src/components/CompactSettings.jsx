import { useState } from 'react'
import { Settings, Download, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import { exportSettings, importSettings } from '../utils/helpers'

export function CompactSettings({ 
  settings, 
  onSettingsUpdate, 
  onImportSettings 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { preset, autoStartNext, delayNext, volume } = settings

  const handleImportSettings = (event) => {
    importSettings(event, onImportSettings)
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="border-t border-gray-300 pt-4 mt-6">
      {/* Settings Toggle Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors py-2"
        title={isExpanded ? "Hide settings" : "Show settings"}
      >
        <Settings size={16} />
        <span className="text-sm font-medium">Quick Settings</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Collapsible Settings Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
          {/* Timer Configuration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Timer Settings</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Work (min)</span>
                <input 
                  className="input-brutal text-sm h-8" 
                  type="number" 
                  min={1} 
                  max={999} 
                  value={Math.floor(preset.work/60)} 
                  onChange={(e) => onSettingsUpdate({
                    preset: { ...preset, work: Math.max(1, Number(e.target.value)) * 60 }
                  })} 
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Short break (min)</span>
                <input 
                  className="input-brutal text-sm h-8" 
                  type="number" 
                  min={1} 
                  max={999} 
                  value={Math.floor(preset.shortBreak/60)} 
                  onChange={(e) => onSettingsUpdate({
                    preset: { ...preset, shortBreak: Math.max(1, Number(e.target.value)) * 60 }
                  })} 
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Long break (min)</span>
                <input 
                  className="input-brutal text-sm h-8" 
                  type="number" 
                  min={1} 
                  max={999} 
                  value={Math.floor(preset.longBreak/60)} 
                  onChange={(e) => onSettingsUpdate({
                    preset: { ...preset, longBreak: Math.max(1, Number(e.target.value)) * 60 }
                  })} 
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-600">Cycle sessions</span>
                <input 
                  className="input-brutal text-sm h-8" 
                  type="number" 
                  min={1} 
                  max={99} 
                  value={preset.cycle} 
                  onChange={(e) => onSettingsUpdate({
                    preset: { ...preset, cycle: Math.max(1, Number(e.target.value)) }
                  })} 
                />
              </label>
            </div>
          </div>

          {/* Behavior Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Behavior</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto-start next session</span>
                <input 
                  type="checkbox" 
                  checked={autoStartNext} 
                  onChange={(e) => onSettingsUpdate({ autoStartNext: e.target.checked })}
                  className="w-4 h-4"
                />
              </label>
              {autoStartNext && (
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delay (seconds)</span>
                  <input 
                    className="input-brutal text-sm h-8 w-20" 
                    type="number" 
                    min={0} 
                    max={60} 
                    value={delayNext} 
                    onChange={(e) => onSettingsUpdate({ delayNext: Math.max(0, Number(e.target.value)) })} 
                  />
                </label>
              )}
            </div>
          </div>

          {/* Audio Settings */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Audio</h3>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600">Volume</span>
              <div className="flex items-center gap-2 flex-1 max-w-32">
                <input 
                  className="flex-1" 
                  type="range" 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  value={volume} 
                  onChange={(e) => onSettingsUpdate({ volume: Number(e.target.value) })} 
                />
                <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
              </div>
            </label>
          </div>

          {/* Import/Export */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Data</h3>
            <div className="flex gap-2">
              <button 
                className="btn-brutal btn-success flex items-center gap-1 flex-1 text-sm py-2"
                onClick={() => exportSettings(settings)}
                title="Export settings"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
              <label className="btn-brutal btn-secondary flex items-center gap-1 flex-1 cursor-pointer text-sm py-2" title="Import settings">
                <Upload size={14} />
                <span>Import</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
