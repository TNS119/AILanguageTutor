import React from 'react'

export default function ScoreBadge({ score, isCorrect }) {
  const colorConfig = (() => {
    if (score === 10) return {
      bg: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200',
      label: 'Perfect!',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (score >= 8) return {
      bg: 'from-teal-500 to-cyan-600',
      shadow: 'shadow-teal-200',
      label: 'Great Job',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200'
    }
    if (score >= 5) return {
      bg: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-200',
      label: 'Needs Practice',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return {
      bg: 'from-rose-500 to-red-600',
      shadow: 'shadow-rose-200',
      label: 'Needs Work',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  })()

  return (
    <div className="flex items-center gap-3 bg-white/80 backdrop-blur border border-gray-100 p-2.5 pr-4 rounded-2xl shadow-sm">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorConfig.bg} text-white flex flex-col items-center justify-center shadow-md ${colorConfig.shadow}`}>
        <span className="text-xl font-extrabold leading-none">{score}</span>
        <span className="text-[10px] font-medium opacity-80 mt-0.5">/10</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</p>
        <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-bold rounded-md border ${colorConfig.badgeBg}`}>
          {colorConfig.label}
        </span>
      </div>
    </div>
  )
}
