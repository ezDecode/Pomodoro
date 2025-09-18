import { PRESETS } from '../utils/constants'

export function PresetButtons({ onPresetSelect }) {
  return (
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
  )
}
