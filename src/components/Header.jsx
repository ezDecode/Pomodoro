import { BarChart3 } from 'lucide-react'

export function Header({ 
  showStats, 
  onToggleStats
}) {
  return (
    <header className="flex items-center justify-between mb-6 sm:mb-8" role="banner">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight truncate">
          Pomodoro
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-600 truncate">
          Ultra-flexible timer
        </p>
      </div>
      <div className="flex gap-3 sm:gap-4 ml-4">
        <button 
          className="btn-brutal btn-secondary flex items-center gap-2 btn-icon-only"
          onClick={onToggleStats}
          title={showStats ? "Hide Statistics" : "Show Statistics"}
          aria-label={showStats ? "Hide Statistics" : "Show Statistics"}
          aria-expanded={showStats}
        >
          <BarChart3 size={20} />
          <span className="hide-text-mobile">Stats</span>
        </button>
      </div>
    </header>
  )
}
