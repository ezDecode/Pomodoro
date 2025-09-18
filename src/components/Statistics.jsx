import { useMemo, useState } from 'react'
import { formatTime } from '../utils/helpers'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function Statistics({ settings }) {
  const { completedSessions, totalWorkTime, totalBreakTime, pauseCount, sessionHistory } = settings

  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const DEFAULT_LIMIT = 10

  const recentHistory = useMemo(() => {
    const base = Array.isArray(sessionHistory) ? sessionHistory : []
    return base.slice(-DEFAULT_LIMIT).reverse()
  }, [sessionHistory])

  return (
    <div className="card-brutal">
      <div className="mb-4">
        <h2 className="text-2xl font-normal tracking-tight">Statistics</h2>
      </div>
      
      <div className="space-y-6">
        {/* Summary Section */}
        <section>
          <button
            className="w-full flex items-center justify-between text-left mb-2"
            onClick={() => setIsSummaryOpen(v => !v)}
            title="Toggle summary"
          >
            <h3 className="text-base font-normal tracking-tight">Summary</h3>
            {isSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isSummaryOpen && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-light text-green-500">{completedSessions}</div>
                  <div className="text-sm font-normal tracking-tight">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-blue-500">{formatTime(totalWorkTime)}</div>
                  <div className="text-sm font-normal tracking-tight">Work time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-red-500">{pauseCount || 0}</div>
                  <div className="text-sm font-normal tracking-tight">Pauses</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-orange-500">{formatTime(totalBreakTime)}</div>
                <div className="text-sm font-normal tracking-tight">Pause time</div>
              </div>
            </div>
          )}
        </section>

        {/* History Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <button
              className="flex items-center gap-2 self-start"
              onClick={() => setIsHistoryOpen(v => !v)}
              title="Toggle history"
            >
              <h3 className="text-base font-normal tracking-tight">Recent sessions</h3>
              {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isHistoryOpen && recentHistory.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentHistory.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-2 border-2 border-black bg-gray-100">
                  <span className="font-normal text-sm capitalize tracking-tight">{session.type}</span>
                  <span className="font-normal text-sm tracking-tight">{formatTime(session.duration)}</span>
                </div>
              ))}
            </div>
          )}
          {isHistoryOpen && recentHistory.length === 0 && (
            <div className="text-sm text-gray-500 tracking-tight">No sessions yet.</div>
          )}
        </section>
      </div>
    </div>
  )
}
