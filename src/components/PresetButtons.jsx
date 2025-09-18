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

      {/* Default Presets */}
      <section aria-labelledby="default-presets-heading" className="space-y-2">
        <div id="default-presets-heading" className="text-sm text-gray-600 text-center">Default</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 place-items-stretch">
          {PRESETS.map((preset) => (
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
      </section>

      {/* Custom Presets */}
      <section aria-labelledby="custom-presets-heading" className="space-y-2">
        <div id="custom-presets-heading" className="text-sm text-gray-600 text-center">Custom</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 place-items-stretch">
          {customPresets && customPresets.length > 0 ? (
            customPresets.map((preset) => (
              <button 
                key={`custom-${preset.name}`}
                className="btn-brutal btn-primary preset-compact w-full"
                onClick={() => {
                  onPresetSelect(preset)
                  if (onAddCustomPreset) onAddCustomPreset()
                }}
              >
                {preset.name}
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-sm text-gray-500">No custom presets yet</div>
          )}
        </div>
      </section>

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
