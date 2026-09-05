import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useSession } from '../hooks/useSession'
import { analyzeAudio, fetchProgress, fetchLanguages, getAudioUrl } from '../services/api'
import FeedbackCard from '../components/FeedbackCard'
import ScoreBadge from '../components/ScoreBadge'
import ProgressChart from '../components/ProgressChart'
import RecordButton from '../components/RecordButton'
import LanguageSelector from '../components/LanguageSelector'

function getScoreColor(score) {
  if (score === 10) return 'bg-emerald-500'
  if (score >= 8) return 'bg-teal-500'
  if (score >= 5) return 'bg-amber-500'
  return 'bg-rose-500'
}

function getScoreTextColor(score) {
  if (score === 10) return 'text-emerald-600'
  if (score >= 8) return 'text-teal-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-rose-600'
}

export default function Home() {
  const [appStatus, setAppStatus] = useState('idle')
  const [results, setResults] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('sessions')
  const [languages, setLanguages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [progressFilter, setProgressFilter] = useState('all')

  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)

  const {
    startRecording,
    stopRecording,
    resetRecording,
    audioBlob,
    error: micError,
  } = useAudioRecorder()

  const { sessionId } = useSession()

  // ── Load supported languages from backend ───────────────────────────────
  useEffect(() => {
    async function initLanguages() {
      try {
        const data = await fetchLanguages()
        if (data && data.languages) {
          setLanguages(data.languages)
          if (data.default && !selectedLanguage) {
            setSelectedLanguage(data.default)
          }
        }
      } catch (err) {
        console.warn('Language load failed:', err)
      }
    }
    initLanguages()
  }, [])

  const currentLangMeta = languages.find((l) => l.code === selectedLanguage) || {
    code: 'en',
    name: 'English',
    native_name: 'English',
    sample_phrases: [
      "She don't like coffee in the morning.",
      "Yesterday I go to market with my friend.",
    ],
  }

  const handleStartRecording = useCallback(async () => {
    setResults(null)
    setSelectedSessionId(null)
    setApiError(null)
    setAudioUrl(null)
    setAppStatus('recording')
    await startRecording()
  }, [startRecording])

  const handleStopRecording = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  const loadProgress = useCallback(
    async (langFilter = progressFilter) => {
      if (!sessionId) return
      setProgressLoading(true)
      try {
        const data = await fetchProgress(sessionId, langFilter === 'all' ? null : langFilter)
        setProgress(data)
      } catch (err) {
        console.warn('Unable to load session progress:', err.message)
      } finally {
        setProgressLoading(false)
      }
    },
    [sessionId, progressFilter]
  )

  const handleProgressFilterChange = (code) => {
    setProgressFilter(code)
    loadProgress(code)
  }

  const sendAudioForAnalysis = useCallback(
    async (blob) => {
      setAppStatus('processing')
      setApiError(null)
      try {
        const data = await analyzeAudio(blob, sessionId, selectedLanguage)
        setResults(data)
        setSelectedSessionId(data.request_id || null)
        setAudioUrl(getAudioUrl(data.request_id))
        setAppStatus('results')
        loadProgress(progressFilter)
      } catch (err) {
        setApiError(err.message || 'An error occurred while analyzing audio.')
        setAppStatus('error')
      }
    },
    [sessionId, selectedLanguage, loadProgress, progressFilter]
  )

  useEffect(() => {
    if (audioBlob && appStatus === 'recording') {
      sendAudioForAnalysis(audioBlob)
    }
  }, [audioBlob, appStatus, sendAudioForAnalysis])

  useEffect(() => {
    if (sessionId) {
      loadProgress(progressFilter)
    }
  }, [sessionId, loadProgress, progressFilter])

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load()
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }, [audioUrl])

  const handleSelectSession = (session) => {
    setSelectedSessionId(session.id)
    let parsedErrors = session.errors
    if (typeof parsedErrors === 'string') {
      try {
        parsedErrors = JSON.parse(parsedErrors)
      } catch {
        parsedErrors = []
      }
    }

    setResults({
      request_id: session.id,
      language: session.language || 'en',
      transcribed_text: session.original_text,
      corrected_text: session.corrected_text,
      english_translation: session.english_translation || '',
      is_correct: Boolean(session.is_correct),
      overall_score: session.score,
      vocabulary_score: session.vocabulary_score || 8,
      confidence_score: session.confidence_score || 8,
      errors: parsedErrors || [],
      encouragement: session.encouragement || 'Keep practicing — consistency builds fluency!',
    })
    setAudioUrl(session.request_id ? getAudioUrl(session.request_id) : null)
    setAppStatus('results')
  }

  const handleTryAgain = () => {
    resetRecording()
    setResults(null)
    setSelectedSessionId(null)
    setApiError(null)
    setAudioUrl(null)
    setAppStatus('idle')
  }

  const buttonStatus =
    appStatus === 'recording' ? 'recording' : appStatus === 'processing' ? 'processing' : 'idle'
  const isIdle = buttonStatus === 'idle'
  const isRecordingState = buttonStatus === 'recording'
  const isProcessing = buttonStatus === 'processing'

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── HEADER NAVBAR ─────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs z-20 w-full">
        <div className="w-full px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xs text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  AI Language Tutor
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Multilingual
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Speaking practice with instant feedback & speech evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Target Language Selector in Navbar */}
            <LanguageSelector
              languages={
                languages.length > 0
                  ? languages
                  : [
                      { code: 'en', name: 'English', native_name: 'English' },
                      { code: 'hi', name: 'Hindi', native_name: 'हिन्दी' },
                      { code: 'te', name: 'Telugu', native_name: 'తెలుగు' },
                    ]
              }
              selectedLanguage={selectedLanguage}
              onSelectLanguage={(code) => {
                setSelectedLanguage(code)
                handleTryAgain()
              }}
            />

            {progress && (
              <div className="hidden md:flex items-center gap-3 text-xs bg-slate-100/80 border border-slate-200/60 rounded-full px-3.5 py-1 text-slate-700">
                <span>
                  Sessions: <strong className="text-indigo-700 font-semibold">{progress.total_sessions}</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Avg: <strong className="text-indigo-700 font-semibold">{progress.average_score || 0}/10</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── WORKSPACE BODY (Full width with balanced 320px sidebar & responsive main area) ──────────────── */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* ── SIDEBAR HISTORY & PROGRESS ─────────────────────────────────── */}
        <aside className="shrink-0 w-80 lg:w-96 bg-white/80 backdrop-blur-sm border-r border-slate-200/80 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-200 shrink-0 bg-slate-50/50">
            <button
              onClick={() => setSidebarTab('sessions')}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                sidebarTab === 'sessions'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Recent Practice
            </button>
            <button
              onClick={() => setSidebarTab('progress')}
              className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${
                sidebarTab === 'progress'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Progress & Mastery
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
            {sidebarTab === 'sessions' && (
              <>
                {progressLoading ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : !progress || progress.total_sessions === 0 ? (
                  <div className="flex flex-col items-center justify-center h-56 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">No practice attempts yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                      Speak a sentence in {currentLangMeta.native_name} to generate real-time feedback.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Practice History ({progress.recent_sessions?.length})
                      </span>
                      <span className="text-[10px] text-slate-400">Newest first</span>
                    </div>

                    {progress.recent_sessions?.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={`rounded-2xl border p-3 transition-all duration-150 cursor-pointer ${
                          selectedSessionId === session.id
                            ? 'bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-300'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs text-slate-900 font-semibold truncate flex-1 min-w-0 pr-2">
                            {session.original_text}
                          </p>
                          <span
                            className={`shrink-0 text-xs font-bold ${getScoreTextColor(
                              session.score
                            )}`}
                          >
                            {session.score}/10
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1.5">
                          <div
                            className={`h-full rounded-full ${getScoreColor(session.score)} transition-all duration-500`}
                            style={{ width: `${session.score * 10}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {session.language || 'en'}
                            </span>
                            <span>
                              {session.error_count === 0
                                ? 'Flawless'
                                : `${session.error_count} error${session.error_count !== 1 ? 's' : ''}`}
                            </span>
                          </span>
                          <span className="text-[10px] text-indigo-600 font-semibold hover:underline">
                            Inspect →
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {sidebarTab === 'progress' && (
              <ProgressChart
                progress={progress}
                isLoading={progressLoading}
                activeFilter={progressFilter}
                onFilterChange={handleProgressFilterChange}
              />
            )}
          </div>
        </aside>

        {/* ── MAIN TUTOR WORKSPACE (Balanced flex-1 layout without weird left offsets) ───────── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-6 max-w-5xl w-full mx-auto">
            {/* State: IDLE / ONBOARDING */}
            {appStatus === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-10 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Practice Spoken {currentLangMeta.native_name}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Speak a phrase or sentence aloud in{' '}
                  <strong className="text-slate-800 font-semibold">{currentLangMeta.name}</strong>.
                  Our AI tutor evaluates grammar, vocabulary choices, and provides spoken corrections with English translations.
                </p>

                <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 text-left shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recommended {currentLangMeta.native_name} Practice Phrases
                  </div>
                  <div className="space-y-1.5">
                    {(currentLangMeta.sample_phrases || []).map((phrase, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center gap-2"
                      >
                        <span className="text-indigo-500 font-mono text-[10px]">#{idx + 1}</span>
                        <span className="font-medium">"{phrase}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* State: PROCESSING */}
            {appStatus === 'processing' && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-16">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-indigo-600 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-bold text-base">
                  Transcribing & Analyzing {currentLangMeta.native_name}...
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Checking linguistic accuracy, grammar tense, and generating natural voice feedback
                </p>
              </div>
            )}

            {/* State: ERROR */}
            {appStatus === 'error' && apiError && !results && (
              <div className="w-full my-8 animate-fade-in">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      !
                    </div>
                    <div>
                      <p className="font-semibold text-rose-900 text-sm mb-0.5">Evaluation Error</p>
                      <p className="text-rose-700 text-xs">{apiError}</p>
                      <button
                        onClick={handleTryAgain}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* State: RESULTS */}
            {appStatus === 'results' && results && (
              <div className="w-full space-y-5 animate-slide-up pb-8">
                {/* 1. Sentence Comparison & Audio Player */}
                <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            You Spoke
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {results.language || selectedLanguage}
                          </span>
                        </div>
                        <p className="text-slate-800 text-base sm:text-lg font-medium bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 leading-relaxed">
                          "{results.transcribed_text}"
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                          Recommended Correction
                        </span>
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            {/* Target language corrected sentence */}
                            <p className="text-indigo-950 text-base sm:text-lg font-semibold leading-relaxed">
                              "{results.corrected_text}"
                            </p>
                            {/* English translation displayed clearly below in brackets */}
                            {results.language !== 'en' && results.english_translation && (
                              <p className="text-indigo-700/90 font-medium text-xs sm:text-sm bg-white/80 border border-indigo-100 rounded-xl px-3 py-1.5 inline-block">
                                <span className="font-semibold text-indigo-500 mr-1.5">English:</span>
                                <span>({results.english_translation})</span>
                              </p>
                            )}
                          </div>

                          {audioUrl && (
                            <div className="flex items-center gap-2 shrink-0">
                              <audio
                                ref={audioRef}
                                onEnded={() => setIsPlaying(false)}
                                onPause={() => setIsPlaying(false)}
                                onPlay={() => setIsPlaying(true)}
                              >
                                <source src={audioUrl} type="audio/mpeg" />
                              </audio>
                              <button
                                onClick={isPlaying ? undefined : handlePlay}
                                disabled={isPlaying}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 shadow-xs ${
                                  isPlaying
                                    ? 'bg-indigo-200 text-indigo-700 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {isPlaying ? 'Playing...' : 'Listen Audio'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center lg:items-end justify-center gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <ScoreBadge score={results.overall_score} isCorrect={results.is_correct} />

                      <div className="flex flex-wrap lg:flex-col items-center justify-center lg:justify-end gap-2 w-full">
                        <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-purple-700">
                          <span>Vocabulary:</span>
                          <span className="font-bold text-purple-900">
                            {results.vocabulary_score || 8}/10
                          </span>
                        </div>
                        <div className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-sky-700">
                          <span>Fluency / Flow:</span>
                          <span className="font-bold text-sky-900">
                            {results.confidence_score || 8}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detailed Feedback Cards (Bilingual Explanations) */}
                {results.errors && results.errors.length > 0 ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Specific Corrections ({results.errors.length}{' '}
                        {results.errors.length === 1 ? 'Error' : 'Errors'})
                      </h3>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      {results.errors.map((error, i) => (
                        <FeedbackCard key={i} error={error} index={i} />
                      ))}
                    </div>
                  </div>
                ) : results.is_correct ? (
                  <div className="w-full bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 text-center">
                    <p className="text-emerald-900 font-bold text-sm">
                      Flawless sentence in {currentLangMeta.native_name}!
                    </p>
                    <p className="text-emerald-700 text-xs mt-0.5">
                      No grammatical or structural issues were found. Excellent cadence and word selection.
                    </p>
                  </div>
                ) : null}

                {/* 3. Encouragement Advice */}
                {results.encouragement && (
                  <div className="w-full bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-xs flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                        Tutor Feedback & Guidance
                      </p>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed mt-0.5">
                        {results.encouragement}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── FOOTER RECORDING BAR (Full width container with centered controls) ──────────────────────── */}
          <div className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 sm:px-12 py-3.5 z-10 shadow-lg w-full">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div
                className={`flex-1 min-w-0 rounded-2xl border px-4 py-2.5 transition-all duration-200 flex items-center justify-between ${
                  isRecordingState
                    ? 'border-rose-400 bg-rose-50/70 ring-2 ring-rose-400/20'
                    : isProcessing
                    ? 'border-indigo-300 bg-indigo-50/70'
                    : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                {isIdle && !results && (
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Target: {currentLangMeta.native_name}
                    </span>
                    <p className="text-slate-600 text-xs font-medium truncate">
                      Try speaking: "{(currentLangMeta.sample_phrases || [])[0]}"
                    </p>
                  </div>
                )}
                {isIdle && results && (
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Sentence
                    </span>
                    <p className="text-slate-800 text-xs font-medium truncate">
                      "{results.transcribed_text}"
                    </p>
                  </div>
                )}
                {isRecordingState && (
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <p className="text-rose-700 font-semibold text-xs">
                      Recording {currentLangMeta.native_name}... Click stop when done speaking
                    </p>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-indigo-600 animate-spin shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <p className="text-indigo-700 font-semibold text-xs">
                      Evaluating with Groq Whisper & LLaMA...
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <RecordButton
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                  status={buttonStatus}
                  error={micError}
                />
              </div>
            </div>

            {micError && (
              <div className="max-w-4xl mx-auto mt-1.5">
                <p className="text-rose-600 text-[11px] font-medium flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {micError}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
