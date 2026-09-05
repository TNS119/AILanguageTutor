import React, { useState } from 'react'

function scoreColor(score) {
  if (score >= 8) return 'bg-emerald-500'
  if (score >= 5) return 'bg-amber-500'
  return 'bg-rose-500'
}

function scoreTextColor(score) {
  if (score >= 8) return 'text-emerald-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-rose-600'
}

// Color the star badge based on score tier (good: green/emerald, medium: amber/yellow, bad: red/rose)
function getStarColorConfig(score) {
  const numScore = Number(score) || 0
  if (numScore >= 8) {
    // Good (8-10): Bright Emerald/Green badge with shimmering Gold star
    return {
      starClass: 'text-amber-300',
      bgClass: 'bg-emerald-500/90 border-2 border-emerald-300 shadow-md shadow-emerald-500/20',
      label: 'Good',
    }
  }
  if (numScore >= 5) {
    // Medium (5-7): Warm Amber badge with bright Yellow star
    return {
      starClass: 'text-yellow-100',
      bgClass: 'bg-amber-500/90 border-2 border-amber-300 shadow-md shadow-amber-500/20',
      label: 'Medium',
    }
  }
  // Bad (1-4): High-contrast Rose/Red badge with White/Rose star
  return {
    starClass: 'text-white',
    bgClass: 'bg-rose-500/90 border-2 border-rose-300 shadow-md shadow-rose-500/20',
    label: 'Bad',
  }
}

const LANGUAGE_LABELS = {
  all: 'All Languages',
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)',
}

export default function ProgressChart({ progress, isLoading, activeFilter, onFilterChange }) {
  const [localFilter, setLocalFilter] = useState('all')
  const currentFilter = activeFilter !== undefined ? activeFilter : localFilter

  const handleFilter = (code) => {
    if (onFilterChange) {
      onFilterChange(code)
    } else {
      setLocalFilter(code)
    }
  }

  // Language filter navbar component to display in both empty state and data state
  const LanguageFilterBar = () => (
    <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 text-[11px] font-semibold">
      {[
        { code: 'all', label: 'All' },
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'te', label: 'తెలుగు' },
      ].map((tab) => {
        const isSelected = currentFilter === tab.code
        return (
          <button
            key={tab.code}
            type="button"
            onClick={() => handleFilter(tab.code)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all duration-150 text-center ${
              isSelected
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-3 mt-1">
        <LanguageFilterBar />
        <div className="flex flex-col gap-3 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const breakdown = progress?.languages_breakdown || {}
  const activeStats = currentFilter === 'all' ? progress : breakdown[currentFilter]
  const hasDataForFilter = activeStats && activeStats.total_sessions > 0

  // If no sessions at all or no sessions for this language filter
  if (!progress || progress.total_sessions === 0 || !hasDataForFilter) {
    return (
      <div className="space-y-4 mt-1">
        {/* ── ALWAYS PRESENT LANGUAGE NAVBAR ─────────────────────────── */}
        <LanguageFilterBar />

        {/* ── EMPTY STATE CARD ───────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center h-56 text-center px-4 bg-white/70 rounded-2xl border border-slate-200/60 p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {currentFilter === 'all'
              ? 'No progress data recorded yet'
              : `No ${LANGUAGE_LABELS[currentFilter] || currentFilter} practice data yet`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
            {currentFilter === 'all'
              ? 'Record sentences in English, Hindi, or Telugu to unlock detailed skill analytics.'
              : `Switch to ${LANGUAGE_LABELS[currentFilter]} in the top bar and speak a sentence to see results!`}
          </p>
        </div>
      </div>
    )
  }

  const scoreValue = activeStats.average_score || 0
  const starConfig = getStarColorConfig(scoreValue)

  return (
    <div className="space-y-4 mt-1">
      {/* ── 1. LANGUAGE-WISE FILTER TABS ─────────────────────────────────── */}
      <LanguageFilterBar />

      {/* ── 2. OVERALL MASTERY HERO CARD ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-4 text-white shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                {LANGUAGE_LABELS[currentFilter] || 'Language'} Mastery
              </p>
            </div>
            <h4 className="text-2xl font-extrabold tracking-tight mt-0.5">
              {scoreValue}{' '}
              <span className="text-xs text-indigo-200 font-normal">/ 10</span>
            </h4>
          </div>

          {/* Dynamic Star Colored by Score (Good / Medium / Bad) */}
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-inner transition-colors duration-200 ${starConfig.bgClass}`}
            title={`Performance: ${starConfig.label}`}
          >
            <svg
              className={`w-6 h-6 transition-colors duration-200 ${starConfig.starClass}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs bg-black/20 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
          <span className="text-indigo-100 font-medium">Trajectory</span>
          <span className="font-semibold text-emerald-300 text-[11px] truncate max-w-[180px]">
            {progress.improvement_trend || 'Active learner'}
          </span>
        </div>
      </div>

      {/* ── 3. SKILL METRICS BREAKDOWN ──────────────────────────────────── */}
      <div className="space-y-3 bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Evaluation Breakdown
          </span>
          <span className="text-[10px] font-semibold text-indigo-600 uppercase">
            {currentFilter}
          </span>
        </div>

        {/* Grammar Accuracy */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Grammar Accuracy
            </span>
            <span className="font-bold text-emerald-700">{scoreValue}/10</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(scoreValue / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Vocabulary Richness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Vocabulary Richness
            </span>
            <span className="font-bold text-purple-700">
              {activeStats.average_vocab_score || 8}/10
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((activeStats.average_vocab_score || 8) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Speaking Confidence */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Speaking Confidence
            </span>
            <span className="font-bold text-sky-700">
              {activeStats.average_confidence_score || 8}/10
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((activeStats.average_confidence_score || 8) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 4. KEY STATS PILLS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-indigo-50/80 rounded-2xl p-2.5 border border-indigo-100 text-center">
          <p className="text-lg font-bold text-indigo-700">{activeStats.total_sessions || 0}</p>
          <p className="text-[10px] text-indigo-500 font-medium uppercase tracking-wider">
            {currentFilter === 'all' ? 'Total Sessions' : 'Sessions'}
          </p>
        </div>
        <div className="bg-emerald-50/80 rounded-2xl p-2.5 border border-emerald-100 text-center">
          <p className="text-lg font-bold text-emerald-700">
            {activeStats.perfect_count || 0}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
            Flawless
          </p>
        </div>
      </div>

      {/* ── 5. LANGUAGE BREAKDOWN TILES (When viewing all) ───────────────── */}
      {currentFilter === 'all' && Object.keys(breakdown).length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Language Breakdown
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {['en', 'hi', 'te'].map((code) => {
              const langStats = breakdown[code] || { total_sessions: 0, average_score: 0 }
              const nameMap = { en: 'EN', hi: 'HI', te: 'TE' }
              return (
                <div
                  key={code}
                  onClick={() => handleFilter(code)}
                  className="bg-white border border-slate-200/80 hover:border-indigo-300 p-2 rounded-xl text-center cursor-pointer transition-all duration-150"
                >
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {nameMap[code]}
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {langStats.total_sessions} <span className="text-[9px] font-normal text-slate-400">sess</span>
                  </p>
                  <span className="text-[10px] font-semibold text-indigo-600">
                    {langStats.average_score || 0}/10
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 6. RECENT EVALUATION LOG ────────────────────────────────────── */}
      {progress.recent_sessions?.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Recent Evaluation Log
          </span>
          <div className="space-y-2">
            {progress.recent_sessions.slice(0, 8).map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-slate-100 p-2.5 hover:border-indigo-200 transition-all duration-150 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <p className="font-semibold text-slate-800 truncate max-w-[170px]">
                    "{session.original_text}"
                  </p>
                  <span className={`font-bold text-[11px] ${scoreTextColor(session.score)}`}>
                    {session.score}/10
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-50 rounded-lg p-1.5 border border-slate-100 justify-between">
                  <span className="uppercase font-bold px-1 py-0.2 rounded bg-white text-slate-600 text-[9px] border border-slate-200/60">
                    {session.language || 'en'}
                  </span>
                  <span>
                    Vocab: <strong className="text-purple-700">{session.vocabulary_score || 8}</strong>
                  </span>
                  <span>
                    Conf: <strong className="text-sky-700">{session.confidence_score || 8}</strong>
                  </span>
                  <span>{session.error_count === 0 ? '✨ Flawless' : `${session.error_count} err`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
