import { BarChart3, Settings } from 'lucide-react'

export function Header({ 
  showStats, 
  onToggleStats,
  onToggleSettings
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight">Pomodoro</h1>
        <p className="text-base sm:text-lg md:text-xl font-normal">Ultra-flexible timer</p>
      </div>
      <div className="flex gap-4">
        <button 
          className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 btn-icon-only"
          onClick={onToggleSettings}
          title="Settings"
        >
          <Settings size={20} />
          <span className="hide-text-mobile">Settings</span>
        </button>
        <button 
          className="btn-brutal btn-secondary flex items-center gap-2 sm:gap-2 btn-icon-only"
          onClick={onToggleStats}
          title="Statistics"
        >
          <BarChart3 size={20} />
          <span className="hide-text-mobile">Stats</span>
        </button>
      </div>
    </div>
  )
}
