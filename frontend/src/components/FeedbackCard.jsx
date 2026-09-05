import React from 'react'

const ERROR_TYPE_STYLES = {
  grammar: 'bg-rose-50 text-rose-700 border-rose-200/80',
  vocabulary: 'bg-purple-50 text-purple-700 border-purple-200/80',
  spelling: 'bg-amber-50 text-amber-700 border-amber-200/80',
  word_order: 'bg-sky-50 text-sky-700 border-sky-200/80',
}

export default function FeedbackCard({ error, index }) {
  const badgeStyle = ERROR_TYPE_STYLES[error.error_type] || ERROR_TYPE_STYLES.grammar
  const badgeLabel =
    error.error_type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Grammar'

  return (
    <div
      className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 hover:border-slate-300 transition-all duration-150 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle}`}
        >
          {badgeLabel}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">#{index + 1}</span>
      </div>

      <div className="bg-slate-50/90 rounded-xl p-3 mb-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-12 shrink-0">
            Original
          </span>
          <span className="line-through text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60 break-words">
            {error.original}
          </span>
        </div>
        <span className="text-slate-300 hidden sm:inline">→</span>
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-12 shrink-0">
            Fix
          </span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1.5 break-words">
            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error.corrected}</span>
          </span>
        </div>
      </div>

      <div className="text-slate-700 text-xs leading-relaxed bg-amber-50/60 rounded-xl p-3 border border-amber-200/50 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-.992-7.876A4.99 4.99 0 0110 5a4.99 4.99 0 012.992 1.124A4 4 0 0112 14z" />
        </svg>
        <span className="font-normal text-slate-800">{error.explanation}</span>
      </div>
    </div>
  )
}
