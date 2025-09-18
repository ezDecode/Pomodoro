import { memo } from 'react'
import { Plus } from 'lucide-react'
import { PRESETS } from '../utils/constants'

export const PresetButtons = memo(function PresetButtons({ onPresetSelect, onAddCustomPreset, customPresets = [] }) {
  const handleAddPreset = () => {
    if (onAddCustomPreset) {
      onAddCustomPreset()
    } else {
      // Fallback placeholder
      console.log('Add custom preset clicked')
    }
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center flex-wrap" role="group" aria-label="Timer presets">
      {/* Show first 2 default presets */}
      {PRESETS.slice(0, 2).map((preset) => (
        <button 
          key={preset.name}
          className="btn-brutal btn-success preset-compact"
          onClick={() => onPresetSelect(preset)}
          title={`Switch to ${preset.name} preset`}
          aria-label={`Switch to ${preset.name} preset`}
        >
          {preset.name}
        </button>
      ))}
      
      {/* Show custom presets */}
      {customPresets.slice(0, 3).map((preset) => (
        <button 
          key={preset.name}
          className="btn-brutal btn-success preset-compact"
          onClick={() => onPresetSelect(preset)}
          title={`Switch to ${preset.name} custom preset`}
          aria-label={`Switch to ${preset.name} custom preset`}
        >
          {preset.name}
        </button>
      ))}
      
      {/* Add Custom Preset Button */}
      <button 
        className="btn-brutal btn-neutral preset-compact flex items-center gap-1 sm:gap-2"
        onClick={handleAddPreset}
        title="Create new custom preset"
        aria-label="Create new custom preset"
      >
        <Plus size={16} />
        <span className="hide-text-mobile">Add custom</span>
        <span className="hidden sm:inline">preset</span>
      </button>
    </div>
  )
})
