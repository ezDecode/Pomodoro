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
    <div className="space-y-3">
      <h3 className="text-lg font-normal text-center">Quick Presets</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {/* Default Presets */}
        {PRESETS.map((preset) => (
          <button 
            key={preset.name}
            className="btn-brutal btn-success preset-compact"
            onClick={() => onPresetSelect(preset)}
          >
            {preset.name}
          </button>
        ))}
        
        {/* Custom Presets */}
        {customPresets.map((preset) => (
          <button 
            key={`custom-${preset.name}`}
            className="btn-brutal btn-primary preset-compact"
            onClick={() => onPresetSelect(preset)}
          >
            {preset.name}
          </button>
        ))}
        
        {/* Add Custom Preset Button */}
        <button 
          className="btn-brutal btn-neutral preset-compact flex items-center justify-center"
          onClick={handleAddPreset}
          title="Add custom preset"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
