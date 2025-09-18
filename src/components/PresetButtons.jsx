import { Plus } from 'lucide-react'
import { PRESETS } from '../utils/constants'

export function PresetButtons({ onPresetSelect, onAddCustomPreset, customPresets = [] }) {
  const handleAddPreset = () => {
    if (onAddCustomPreset) {
      onAddCustomPreset()
    } else {
      // Fallback placeholder
      console.log('Add custom preset clicked')
    }
  }

  return (
    <div className="btn-group">
      {/* Show first 2 default presets */}
      {PRESETS.slice(0, 2).map((preset) => (
        <button 
          key={preset.name}
          className="btn-brutal btn-success preset-compact"
          onClick={() => onPresetSelect(preset)}
        >
          {preset.name}
        </button>
      ))}
      
      {/* Add Custom Preset Button */}
      <button 
        className="btn-brutal btn-neutral preset-compact flex items-center gap-2"
        onClick={handleAddPreset}
        title="Add custom preset"
      >
        <Plus size={16} />
        <span className="hide-text-mobile">Add custom preset</span>
      </button>
    </div>
  )
}
