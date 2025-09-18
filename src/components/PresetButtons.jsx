import { PRESETS } from '../utils/constants'

export function PresetButtons({ onPresetSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-normal text-center">Quick Presets</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {PRESETS.map((preset) => (
          <button 
            key={preset.name}
            className="btn-brutal btn-success preset-compact"
            onClick={() => onPresetSelect(preset)}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  )
}
