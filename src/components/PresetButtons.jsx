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
    <div className="space-y-4">
      <h3 className="text-lg font-normal text-center">Quick Presets</h3>

      {/* Only show two presets to keep UI uncluttered */}
      <div className="grid grid-cols-2 gap-3 place-items-stretch">
        {PRESETS.slice(0, 2).map((preset) => (
          <button 
            key={preset.name}
            className="btn-brutal btn-success preset-compact w-full"
            onClick={() => {
              onPresetSelect(preset)
              if (onAddCustomPreset) onAddCustomPreset()
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Add Custom Preset */}
      <div className="flex justify-center">
        <button 
          className="btn-brutal btn-neutral preset-compact flex items-center gap-2"
          onClick={handleAddPreset}
          title="Add custom preset"
        >
          <Plus size={16} />
          <span className="hide-text-mobile">Add custom preset</span>
        </button>
      </div>
    </div>
  )
}
