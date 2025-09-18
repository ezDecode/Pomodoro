import React from 'react'

export function Settings({ 
  settings, 
  onSettingsUpdate
}) {
  const { autoStartNext } = settings

  return (
    <div className="card-brutal">
      <div className="mb-6">
        <h2 className="text-2xl font-normal">Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure timer behavior and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Behavior */}
        <section>
          <h3 className="text-base font-medium mb-4">Behavior</h3>
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center justify-between gap-4">
              <span className="font-normal">Auto-start next</span>
              <input 
                type="checkbox" 
                checked={autoStartNext} 
                onChange={(e) => onSettingsUpdate({ autoStartNext: e.target.checked })}
                className="w-6 h-6"
              />
            </label>

          </div>
        </section>

      </div>
    </div>
  )
}
