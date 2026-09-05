import React, { useState, useRef, useEffect } from 'react'

const LANGUAGE_FLAGS = {
  en: '🇬🇧',
  hi: '🇮🇳',
  te: '🇮🇳',
}

export default function LanguageSelector({ languages, selectedLanguage, onSelectLanguage }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLang = languages.find((l) => l.code === selectedLanguage) || languages[0] || {
    code: 'en',
    name: 'English',
    native_name: 'English',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 text-xs sm:text-sm font-medium transition-all duration-150 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
        aria-label="Select Target Language"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base leading-none" role="img" aria-hidden="true">
          {LANGUAGE_FLAGS[currentLang.code] || '🌐'}
        </span>
        <span className="font-semibold tracking-tight text-slate-900">{currentLang.native_name}</span>
        <span className="text-slate-400 font-normal hidden md:inline">({currentLang.name})</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in backdrop-blur-md">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Target Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === selectedLanguage
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs sm:text-sm transition-colors duration-150 ${
                  isSelected
                    ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base" role="img" aria-hidden="true">
                    {LANGUAGE_FLAGS[lang.code] || '🌐'}
                  </span>
                  <div>
                    <div className="leading-tight text-slate-900 font-medium">{lang.native_name}</div>
                    <div className="text-[11px] text-slate-400">{lang.name}</div>
                  </div>
                </div>
                {isSelected && (
                  <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
