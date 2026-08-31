import React from 'react'

function scoreColor(score) {
  if (score === 10) return 'bg-emerald-500'
  if (score >= 8) return 'bg-teal-500'
  if (score >= 5) return 'bg-amber-500'
  return 'bg-red-500'
}

function scoreTextColor(score) {
  if (score === 10) return 'text-emerald-600'
  if (score >= 8) return 'text-teal-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-red-600'
}

export default function ProgressChart({ progress, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!progress || progress.total_sessions === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <span className="text-4xl mb-3 opacity-60">📊</span>
        <p className="text-sm text-gray-500 font-medium">No progress data yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Complete your first speaking session to unlock your skill dashboard!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-1">
      {/* 1. OVERALL MASTERY HERO CARD */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
              Overall Skill Level
            </p>
            <h4 className="text-2xl font-extrabold tracking-tight mt-0.5">
              {progress.average_score} <span className="text-xs text-indigo-200 font-normal">/ 10</span>
            </h4>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center bg-white/10 shadow-inner">
            <span className="text-lg">⭐</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-black/20 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
          <span className="text-indigo-100 font-medium">Status</span>
          <span className="font-bold text-emerald-300">{progress.improvement_trend}</span>
        </div>
      </div>

      {/* 2. DETAILED SKILLS BREAKDOWN */}
      <div className="space-y-3 bg-white/90 rounded-2xl border border-indigo-100/80 p-3.5 shadow-sm">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Skill Performance
        </p>

        {/* Grammar Accuracy */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Grammar Accuracy
            </span>
            <span className="font-bold text-emerald-600">{progress.average_score}/10</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(progress.average_score / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Vocabulary Richness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Vocabulary Richness 📚
            </span>
            <span className="font-bold text-purple-600">
              {progress.average_vocab_score || 8}/10
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((progress.average_vocab_score || 8) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Speaking Confidence */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Speaking Confidence 🗣️
            </span>
            <span className="font-bold text-sky-600">
              {progress.average_confidence_score || 8}/10
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((progress.average_confidence_score || 8) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. KEY STATS PILLS */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-indigo-50/80 rounded-xl p-2.5 border border-indigo-100 text-center">
          <p className="text-lg font-bold text-indigo-700">{progress.total_sessions}</p>
          <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">
            Sessions
          </p>
        </div>
        <div className="bg-emerald-50/80 rounded-xl p-2.5 border border-emerald-100 text-center">
          <p className="text-lg font-bold text-emerald-700">{progress.perfect_count} 🌟</p>
          <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">
            Flawless
          </p>
        </div>
      </div>

      {/* 4. RECENT SESSION SCORE BREAKDOWNS */}
      {progress.recent_sessions?.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Recent Evaluation Log
          </p>
          <div className="space-y-2">
            {progress.recent_sessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-gray-100 p-2.5 hover:border-indigo-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <p className="font-semibold text-gray-800 truncate max-w-[170px]">
                    "{session.original_text}"
                  </p>
                  <span className={`font-bold text-[11px] ${scoreTextColor(session.score)}`}>
                    {session.score}/10
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-lg p-1.5 border border-gray-100 justify-between">
                  <span className="flex items-center gap-1">
                    <span>📚 Vocab:</span>
                    <strong className="text-purple-700">{session.vocabulary_score || 8}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🗣️ Conf:</span>
                    <strong className="text-sky-700">{session.confidence_score || 8}</strong>
                  </span>
                  <span>{session.error_count === 0 ? '✨ Perfect' : `${session.error_count} err`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
