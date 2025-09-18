import { useState } from 'react'
import { X, Plus, Minus, Edit3 } from 'lucide-react'
import { formatTime } from '../utils/helpers'
import { useAlert } from '../contexts/AlertContext'

export function CustomPresetModal({ isOpen, onClose, onSave, customPresets = [] }) {
  const { confirm } = useAlert()
  
  const [formData, setFormData] = useState({
    name: '',
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    cycle: 4
  })
  const [editingPreset, setEditingPreset] = useState(null)
  const [editValue, setEditValue] = useState('')

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
    confirm(
      'Delete Preset',
      `Are you sure you want to delete the preset "${presetName}"? This action cannot be undone.`,
      () => onSave(null, presetName) // null means delete, second param is the name to delete
    )
  }

  const handleRenameStart = (preset) => {
    setEditingPreset(preset.name)
    setEditValue(preset.name)
  }

  const handleRenameSubmit = () => {
    if (editValue.trim() && editingPreset) {
      onSave({ ...customPresets.find(p => p.name === editingPreset), name: editValue.trim() }, editingPreset)
    }
    setEditingPreset(null)
    setEditValue('')
  }

  const handleRenameCancel = () => {
    setEditingPreset(null)
    setEditValue('')
  }

  const handleTimeAdjust = (field, minutes) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(1, prev[field] + minutes)
    }))
  }

  const TimeInput = ({ label, field, value, min = 1, max = 999 }) => (
    <label className="flex flex-col gap-2">
      <span className="font-normal">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleTimeAdjust(field, -1)}
          className="btn-brutal btn-neutral btn-icon-only"
          title="Remove 1 minute"
        >
          <Minus size={14} />
        </button>
        <input 
          className="input-brutal flex-1 text-center" 
          type="number" 
          min={min} 
          max={max} 
          value={value}
          onChange={(e) => setFormData({ ...formData, [field]: Math.max(min, Number(e.target.value)) })}
        />
        <button
          onClick={() => handleTimeAdjust(field, 1)}
          className="btn-brutal btn-neutral btn-icon-only"
          title="Add 1 minute"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="text-xs text-gray-500 text-center">
        {formatTime(value * 60)}
      </div>
    </label>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative card-brutal w-full max-w-2xl max-h-[80vh] overflow-y-auto">
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
                <div key={preset.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <div className="flex-1">
                    {editingPreset === preset.name ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit()
                          if (e.key === 'Escape') handleRenameCancel()
                        }}
                        className="input-brutal text-sm w-full"
                        autoFocus
                      />
                    ) : (
                      <div className="font-normal">{preset.name}</div>
                    )}
                    <div className="text-sm text-gray-600">
                      {Math.floor(preset.work/60)}/{Math.floor(preset.shortBreak/60)}/{Math.floor(preset.longBreak/60)} - {preset.cycle} cycles
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {editingPreset === preset.name ? (
                      <>
                        <button
                          onClick={handleRenameSubmit}
                          className="btn-brutal btn-success btn-icon-only"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleRenameCancel}
                          className="btn-brutal btn-neutral btn-icon-only"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRenameStart(preset)}
                          className="btn-brutal btn-neutral btn-icon-only"
                          title="Rename preset"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDelete(preset.name)}
                          className="btn-brutal btn-danger btn-icon-only"
                          title="Delete preset"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
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
            <TimeInput 
              label="Work (min)" 
              field="work" 
              value={formData.work} 
              min={1} 
              max={999} 
            />
            <TimeInput 
              label="Short break (min)" 
              field="shortBreak" 
              value={formData.shortBreak} 
              min={1} 
              max={999} 
            />
            <TimeInput 
              label="Long break (min)" 
              field="longBreak" 
              value={formData.longBreak} 
              min={1} 
              max={999} 
            />
            <label className="flex flex-col gap-2">
              <span className="font-normal">Cycle (sessions)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFormData({ ...formData, cycle: Math.max(1, formData.cycle - 1) })}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Decrease cycle"
                >
                  <Minus size={14} />
                </button>
                <input 
                  className="input-brutal flex-1 text-center" 
                  type="number" 
                  min={1} 
                  max={99} 
                  value={formData.cycle}
                  onChange={(e) => setFormData({ ...formData, cycle: Math.max(1, Number(e.target.value)) })}
                />
                <button
                  onClick={() => setFormData({ ...formData, cycle: Math.min(99, formData.cycle + 1) })}
                  className="btn-brutal btn-neutral btn-icon-only"
                  title="Increase cycle"
                >
                  <Plus size={14} />
                </button>
              </div>
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
