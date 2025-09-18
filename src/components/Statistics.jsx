import { useMemo, useState } from 'react'
import { formatTime } from '../utils/helpers'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

export function Statistics({ settings }) {
  const { completedSessions, totalWorkTime, totalBreakTime, pauseCount, sessionHistory } = settings

  const [isSummaryOpen, setIsSummaryOpen] = useState(true)
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [limit, setLimit] = useState(10)

  const filteredHistory = useMemo(() => {
    const base = Array.isArray(sessionHistory) ? sessionHistory : []
    const filtered = typeFilter === 'all' ? base : base.filter(s => s.type === typeFilter)
    return filtered.slice(-limit).reverse()
  }, [sessionHistory, typeFilter, limit])

  return (
    <div className="card-brutal">
      <div className="mb-4">
        <h2 className="text-2xl font-normal">Statistics</h2>
      </div>
      
      <div className="space-y-6">
        {/* Summary Section */}
        <section>
          <button
            className="w-full flex items-center justify-between text-left mb-2"
            onClick={() => setIsSummaryOpen(v => !v)}
            title="Toggle summary"
          >
            <h3 className="text-base font-medium">Summary</h3>
            {isSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isSummaryOpen && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-light text-green-500">{completedSessions}</div>
                  <div className="text-sm font-normal">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-blue-500">{formatTime(totalWorkTime)}</div>
                  <div className="text-sm font-normal">Work time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-red-500">{pauseCount || 0}</div>
                  <div className="text-sm font-normal">Pauses</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-orange-500">{formatTime(totalBreakTime)}</div>
                <div className="text-sm font-normal">Pause time</div>
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
              <h3 className="text-base font-medium">Recent sessions</h3>
              {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Filter size={14} />
                <span>Filter:</span>
              </div>
              <select
                className="input-brutal text-sm py-1 px-2 h-8 min-w-0"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                title="Filter by type"
              >
                <option value="all">All</option>
                <option value="work">Work</option>
              </select>
              <select
                className="input-brutal text-sm py-1 px-2 h-8 min-w-0"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                title="Limit entries"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {isHistoryOpen && filteredHistory.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredHistory.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-2 border-2 border-black bg-gray-100">
                  <span className="font-normal text-sm capitalize">{session.type}</span>
                  <span className="font-normal text-sm">{formatTime(session.duration)}</span>
                </div>
              ))}
            </div>
          )}
          {isHistoryOpen && filteredHistory.length === 0 && (
            <div className="text-sm text-gray-500">No sessions yet.</div>
          )}
        </section>
      </div>
    </div>
  )
}
