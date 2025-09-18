import { useState } from 'react'
import { X } from 'lucide-react'

export function CustomPresetModal({ isOpen, onClose, onSave, customPresets = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    cycle: 4
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave({
        name: formData.name.trim(),
        work: formData.work * 60,
        shortBreak: formData.shortBreak * 60,
        longBreak: formData.longBreak * 60,
        cycle: formData.cycle
      })
      setFormData({ name: '', work: 25, shortBreak: 5, longBreak: 15, cycle: 4 })
      onClose()
    }
  }

  const handleDelete = (presetName) => {
    if (confirm(`Delete preset "${presetName}"?`)) {
      onSave(null, presetName) // null means delete, second param is the name to delete
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4">
      <div className="card-brutal max-w-md w-full h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-normal">Custom Presets</h2>
          <button 
            onClick={onClose}
            className="btn-brutal btn-neutral btn-icon-only"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Existing Custom Presets */}
        {customPresets.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-normal mb-3">Your Presets</h3>
            <div className="space-y-2">
              {customPresets.map((preset) => (
                <div key={preset.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-gray-600">
                      {Math.floor(preset.work/60)}/{Math.floor(preset.shortBreak/60)}/{Math.floor(preset.longBreak/60)} - {preset.cycle} cycles
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(preset.name)}
                    className="btn-brutal btn-danger text-sm px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Preset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-normal">Add New Preset</h3>
          
          <label className="flex flex-col gap-2">
            <span className="font-normal">Preset Name</span>
            <input 
              className="input-brutal" 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., My Focus Session"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="font-normal">Work (min)</span>
              <input 
                className="input-brutal" 
                type="number" 
                min={1} 
                max={999} 
                value={formData.work}
                onChange={(e) => setFormData({ ...formData, work: Math.max(1, Number(e.target.value)) })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-normal">Short break (min)</span>
              <input 
                className="input-brutal" 
                type="number" 
                min={1} 
                max={999} 
                value={formData.shortBreak}
                onChange={(e) => setFormData({ ...formData, shortBreak: Math.max(1, Number(e.target.value)) })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-normal">Long break (min)</span>
              <input 
                className="input-brutal" 
                type="number" 
                min={1} 
                max={999} 
                value={formData.longBreak}
                onChange={(e) => setFormData({ ...formData, longBreak: Math.max(1, Number(e.target.value)) })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-normal">Cycle (sessions)</span>
              <input 
                className="input-brutal" 
                type="number" 
                min={1} 
                max={99} 
                value={formData.cycle}
                onChange={(e) => setFormData({ ...formData, cycle: Math.max(1, Number(e.target.value)) })}
              />
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="btn-brutal btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-brutal btn-success flex-1"
            >
              Save Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
