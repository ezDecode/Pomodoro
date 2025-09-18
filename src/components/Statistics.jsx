import { formatTime } from '../utils/helpers'

export function Statistics({ settings }) {
  const { completedSessions, totalWorkTime, totalBreakTime, sessionHistory } = settings

  return (
    <div className="card-brutal">
      <h2 className="text-2xl font-normal mb-6">Statistics</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-light text-red-500">{completedSessions}</div>
            <div className="text-sm font-normal">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-blue-500">{formatTime(totalWorkTime)}</div>
            <div className="text-sm font-normal">Work time</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-light text-green-500">{formatTime(totalBreakTime)}</div>
          <div className="text-sm font-normal">Break time</div>
        </div>

        {sessionHistory.length > 0 && (
          <div>
            <h3 className="text-lg font-normal mb-3">Recent sessions</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sessionHistory.slice(-10).reverse().map((session, index) => (
                <div key={index} className="flex justify-between items-center p-2 border-2 border-black bg-gray-100">
                  <span className="font-normal text-sm">
                    {session.type}
                  </span>
                  <span className="font-normal text-sm">
                    {formatTime(session.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}