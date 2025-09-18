import { PRESETS } from '../utils/constants'

export function PresetButtons({ onPresetSelect }) {
  const handleAddPreset = () => {
    // Placeholder for adding custom presets functionality
    console.log('Add custom preset clicked')
  }

  return (
<<<<<<< Current (Your changes)
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
=======
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
      <button 
        className="btn-brutal btn-neutral preset-compact"
        onClick={handleAddPreset}
        title="Add custom preset"
      >
        +
      </button>
>>>>>>> Incoming (Background Agent changes)
    </div>
  )
}
