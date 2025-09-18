import { Download, Upload } from 'lucide-react'
import { exportSettings, importSettings } from '../utils/helpers'

export function Settings({ 
  settings, 
  onSettingsUpdate, 
  onImportSettings 
}) {
  const { preset, autoStartNext, delayNext, volume } = settings

  const handleImportSettings = (event) => {
    importSettings(event, onImportSettings)
  }

  return (
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
              onChange={(e) => onSettingsUpdate({
                preset: { ...preset, work: Math.max(0, Number(e.target.value)) * 60 }
              })} 
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
              onChange={(e) => onSettingsUpdate({
                preset: { ...preset, shortBreak: Math.max(0, Number(e.target.value)) * 60 }
              })} 
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
              onChange={(e) => onSettingsUpdate({
                preset: { ...preset, longBreak: Math.max(0, Number(e.target.value)) * 60 }
              })} 
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
              onChange={(e) => onSettingsUpdate({
                preset: { ...preset, cycle: Math.max(1, Number(e.target.value)) }
              })} 
            />
          </label>
        </div>

        <div className="space-y-4">
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
            <span className="font-normal">Delay (sec)</span>
            <input 
              className="input-brutal w-24" 
              type="number" 
              min={0} 
              max={60} 
              value={delayNext} 
              onChange={(e) => onSettingsUpdate({ delayNext: Math.max(0, Number(e.target.value)) })} 
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

        <div className="flex gap-4">
          <button 
            className="btn-brutal btn-success flex items-center gap-2 sm:gap-2 flex-1 btn-icon-only"
            onClick={() => exportSettings(settings)}
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
              onChange={handleImportSettings}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  )
}
