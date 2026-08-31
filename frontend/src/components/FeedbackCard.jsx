import React from 'react'

const ERROR_TYPE_STYLES = {
  grammar:    'bg-rose-100 text-rose-700 border-rose-200',
  vocabulary: 'bg-purple-100 text-purple-700 border-purple-200',
  spelling:   'bg-amber-100 text-amber-700 border-amber-200',
  word_order: 'bg-sky-100 text-sky-700 border-sky-200',
}

export default function FeedbackCard({ error, index }) {
  const badgeStyle = ERROR_TYPE_STYLES[error.error_type] || ERROR_TYPE_STYLES.grammar
  const badgeLabel = error.error_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Grammar'

  return (
    <div
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle}`}>
          {badgeLabel}
        </span>
        <span className="text-xs text-gray-300 font-mono">#{index + 1}</span>
      </div>

      <div className="bg-gray-50/80 rounded-xl p-3.5 mb-3 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <span className="text-xs font-semibold text-gray-400 w-10 flex-shrink-0">Said:</span>
          <span className="line-through text-rose-500 font-semibold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
            {error.original}
          </span>
        </div>
        <span className="text-gray-300 hidden sm:inline">→</span>
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <span className="text-xs font-semibold text-gray-400 w-10 flex-shrink-0">Fix:</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
            <span className="text-xs">✓</span> {error.corrected}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-xs leading-relaxed bg-amber-50/50 rounded-xl p-3 border border-amber-100/60 flex items-start gap-2">
        <span className="text-amber-500 flex-shrink-0 mt-0.5">💡</span>
        <span>{error.explanation}</span>
      </p>
    </div>
  )
}
