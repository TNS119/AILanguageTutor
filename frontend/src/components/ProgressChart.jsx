import React from 'react'

function scoreColor(score) {
  if (score === 10) return 'bg-green-500'
  if (score >= 8)  return 'bg-teal-500'
  if (score >= 5)  return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function ProgressChart({ progress, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center animate-pulse">
        <p className="text-gray-400">Loading your progress...</p>
      </div>
    )
  }

  if (!progress || progress.total_sessions === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-gray-500 font-medium">No sessions yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Record your first sentence to start tracking progress!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fade-in space-y-4">
      <h3 className="font-bold text-gray-800 text-lg">📊 My Progress</h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-indigo-700">{progress.total_sessions}</p>
          <p className="text-xs text-indigo-500 font-medium mt-1">Sessions</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-teal-700">{progress.average_score}</p>
          <p className="text-xs text-teal-500 font-medium mt-1">Avg Score</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{progress.perfect_count}</p>
          <p className="text-xs text-green-500 font-medium mt-1">Perfect 🌟</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium">
        {progress.improvement_trend}
      </div>

      {progress.recent_sessions?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Recent Sessions (newest first)
          </p>
          <div className="space-y-2">
            {progress.recent_sessions.map((session, i) => (
              <div key={session.id} className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreColor(session.score)}`}
                    style={{ width: `${session.score * 10}%` }}
                  />
                </div>
                <span className={`
                  text-xs font-bold w-5 text-center
                  ${session.score === 10 ? 'text-green-600' :
                    session.score >= 7  ? 'text-teal-600' :
                    session.score >= 5  ? 'text-yellow-600' : 'text-red-600'}
                `}>
                  {session.score}
                </span>
                {session.score === 10 && <span className="text-xs">🌟</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
