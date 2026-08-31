import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useAudioRecorder } from './hooks/useAudioRecorder'
import { useSession } from './hooks/useSession'
import { analyzeAudio, fetchProgress, getAudioUrl } from './services/api'
import FeedbackCard from './components/FeedbackCard'
import ScoreBadge from './components/ScoreBadge'

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
  </svg>
)

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
)

const SpinnerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

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

export default function App() {
  const [appStatus, setAppStatus] = useState('idle')
  const [results, setResults] = useState(null)
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [progress, setProgress] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('sessions')
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)

  const {
    startRecording, stopRecording, resetRecording,
    isRecording, audioBlob, error: micError
  } = useAudioRecorder()

  const { sessionId } = useSession()

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

  useEffect(() => {
    if (audioBlob && appStatus === 'recording') {
      sendAudioForAnalysis(audioBlob)
    }
  }, [audioBlob]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendAudioForAnalysis = async (blob) => {
    setAppStatus('processing')
    setApiError(null)
    try {
      const data = await analyzeAudio(blob, sessionId)
      setResults(data)
      setSelectedSessionId(data.request_id || null)
      setAudioUrl(getAudioUrl(data.request_id))
      setAppStatus('results')
      loadProgress()
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
      setAppStatus('error')
    }
  }

  const loadProgress = useCallback(async () => {
    if (!sessionId) return
    setProgressLoading(true)
    try {
      const data = await fetchProgress(sessionId)
      setProgress(data)
    } catch (err) {
      console.warn('Could not load progress:', err.message)
    } finally {
      setProgressLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionId) loadProgress()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load()
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {})
    }
  }, [audioUrl])

  const handleSelectSession = (session) => {
    setSelectedSessionId(session.id)
    let parsedErrors = session.errors
    if (typeof parsedErrors === 'string') {
      try {
        parsedErrors = JSON.parse(parsedErrors)
      } catch (e) {
        parsedErrors = []
      }
    }

    setResults({
      request_id: session.id,
      transcribed_text: session.original_text,
      corrected_text: session.corrected_text,
      is_correct: Boolean(session.is_correct),
      overall_score: session.score,
      vocabulary_score: session.vocabulary_score || 8,
      confidence_score: session.confidence_score || 8,
      errors: parsedErrors || [],
      encouragement: session.encouragement || "Keep practicing — consistency builds fluency!",
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
    appStatus === 'recording'  ? 'recording'  :
    appStatus === 'processing' ? 'processing' : 'idle'

  const isIdle           = buttonStatus === 'idle'
  const isRecordingState = buttonStatus === 'recording'
  const isProcessing     = buttonStatus === 'processing'

  const handleMicClick = () => {
    if (isIdle)           handleStartRecording()
    if (isRecordingState) handleStopRecording()
  }

  const handlePlay = () => { audioRef.current?.play(); setIsPlaying(true) }
  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 overflow-hidden">

      {/* HEADER */}
      <header className="flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-indigo-100/80 shadow-sm z-20">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-lg">🎙️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">AI Language Tutor</h1>
              <p className="text-xs text-indigo-500 font-medium leading-tight">English Speaking Practice</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {progress && (
              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 bg-indigo-50/70 border border-indigo-100 rounded-xl px-3.5 py-1.5">
                <span>🏆 <span className="font-semibold text-indigo-700">{progress.total_sessions}</span> sessions</span>
                <span>⭐ <span className="font-semibold text-indigo-700">{progress.average_score || 0}</span> avg score</span>
                <span>📚 Vocab <span className="font-semibold text-indigo-700">{progress.average_vocab_score || 8}</span></span>
                <span>🗣️ Confidence <span className="font-semibold text-indigo-700">{progress.average_confidence_score || 8}</span></span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow">
              A
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm border-r border-indigo-100/80 flex flex-col overflow-hidden">
          <div className="flex border-b border-indigo-100 flex-shrink-0">
            <button
              onClick={() => setSidebarTab('sessions')}
              className={`flex-1 py-3 text-xs font-semibold transition-colors duration-200
                ${sidebarTab === 'sessions'
                  ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                  : 'text-gray-400 hover:text-gray-600'}`}
            >
              📋 Sessions
            </button>
            <button
              onClick={() => setSidebarTab('progress')}
              className={`flex-1 py-3 text-xs font-semibold transition-colors duration-200
                ${sidebarTab === 'progress'
                  ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                  : 'text-gray-400 hover:text-gray-600'}`}
            >
              📊 Progress
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sidebarTab === 'sessions' && (
              <>
                {progressLoading ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : !progress || progress.total_sessions === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                    <span className="text-4xl mb-3 opacity-60">🗂️</span>
                    <p className="text-sm text-gray-500 font-medium">No sessions yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start practicing to see your history here</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
                      Select Session ({progress.recent_sessions?.length})
                    </p>
                    {progress.recent_sessions?.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={`rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                          selectedSessionId === session.id
                            ? 'bg-indigo-50/90 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                            : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs text-gray-800 font-semibold truncate flex-1 min-w-0">{session.original_text}</p>
                          <span className={`ml-2 flex-shrink-0 text-xs font-bold ${scoreTextColor(session.score)}`}>
                            {session.score}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${scoreColor(session.score)} transition-all duration-500`} style={{ width: `${session.score * 10}%` }} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-between">
                          <span>{session.error_count === 0 ? '✅ Perfect' : `${session.error_count} error${session.error_count !== 1 ? 's' : ''}`}</span>
                          <span className="text-[10px] text-indigo-500 font-semibold">Click to view →</span>
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}

            {sidebarTab === 'progress' && (
              <>
                {progressLoading ? (
                  <div className="flex flex-col gap-3 mt-2">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : !progress || progress.total_sessions === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                    <span className="text-4xl mb-3 opacity-60">📊</span>
                    <p className="text-sm text-gray-500 font-medium">No data yet</p>
                    <p className="text-xs text-gray-400 mt-1">Complete sessions to track progress</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-50/70 rounded-xl p-3 text-center border border-indigo-100/50">
                        <p className="text-xl font-bold text-indigo-700">{progress.total_sessions}</p>
                        <p className="text-[11px] text-indigo-500 font-medium mt-0.5">Sessions</p>
                      </div>
                      <div className="bg-teal-50/70 rounded-xl p-3 text-center border border-teal-100/50">
                        <p className="text-xl font-bold text-teal-700">{progress.average_score}</p>
                        <p className="text-[11px] text-teal-500 font-medium mt-0.5">Avg Score</p>
                      </div>
                      <div className="bg-purple-50/70 rounded-xl p-3 text-center border border-purple-100/50">
                        <p className="text-xl font-bold text-purple-700">{progress.average_vocab_score || 8}</p>
                        <p className="text-[11px] text-purple-500 font-medium mt-0.5">Avg Vocab 📚</p>
                      </div>
                      <div className="bg-sky-50/70 rounded-xl p-3 text-center border border-sky-100/50">
                        <p className="text-xl font-bold text-sky-700">{progress.average_confidence_score || 8}</p>
                        <p className="text-[11px] text-sky-500 font-medium mt-0.5">Avg Confidence 🗣️</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-medium border border-indigo-100">
                      {progress.improvement_trend}
                    </div>
                    {progress.recent_sessions?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Score history</p>
                        <div className="space-y-1.5">
                          {progress.recent_sessions.slice(0, 8).map((session) => (
                            <div key={session.id} className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${scoreColor(session.score)}`} style={{ width: `${session.score * 10}%` }} />
                              </div>
                              <span className={`text-xs font-bold w-6 text-right ${scoreTextColor(session.score)}`}>{session.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* RIGHT WORKSPACE AREA (FULL AVAILABLE SPACE UTILIZATION) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">

          {/* Results scroll area - Full Width */}
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">

            {appStatus === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto animate-fade-in py-12">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-5 shadow-inner">
                  <span className="text-4xl">🎙️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to practice?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Click the microphone button below to record your sentence or select a session from the sidebar to inspect detailed feedback.
                </p>
              </div>
            )}

            {appStatus === 'processing' && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-12">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
                <p className="text-indigo-600 font-semibold text-lg">Analyzing your speech...</p>
                <p className="text-gray-400 text-xs mt-1">Groq Whisper STT → LLaMA Grammar & Vocab AI → Microsoft Edge TTS</p>
              </div>
            )}

            {appStatus === 'error' && apiError && !results && (
              <div className="w-full my-8 animate-fade-in">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">❌</span>
                    <div>
                      <p className="font-semibold text-rose-700 mb-1">Processing Error</p>
                      <p className="text-rose-600 text-sm">{apiError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FULL WIDTH ADAPTIVE RESULTS PANEL */}
            {(appStatus === 'results') && results && (
              <div className="w-full space-y-6 animate-slide-up">

                {/* 1. TOP HERO CONTAINER (FULL WIDTH) */}
                <div className="w-full bg-white rounded-3xl border border-indigo-100/80 shadow-sm p-6 lg:p-8 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">

                    {/* Left: Original vs Corrected sentence view */}
                    <div className="flex-1 space-y-4 w-full">
                      {/* You Said */}
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          You Said
                        </span>
                        <p className="text-gray-800 text-lg lg:text-xl font-medium bg-gray-50/80 border border-gray-100 rounded-2xl px-5 py-3">
                          "{results.transcribed_text}"
                        </p>
                      </div>

                      {/* Corrected Version */}
                      <div>
                        <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                          Corrected Version
                        </span>
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-indigo-950 text-lg lg:text-xl font-semibold leading-relaxed">
                            "{results.corrected_text}"
                          </p>

                          {/* Audio Player Controls */}
                          {audioUrl && (
                            <div className="flex items-center gap-2 flex-shrink-0">
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                                  isPlaying
                                    ? 'bg-indigo-200 text-indigo-500 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95'
                                }`}
                              >
                                {isPlaying ? '🔊 Playing...' : '▶ Listen'}
                              </button>
                              <button
                                onClick={handleReplay}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                              >
                                🔁 Replay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Badges Breakdown (Overall, Vocab, Confidence) */}
                    <div className="flex flex-col items-center lg:items-end justify-center gap-3 w-full lg:w-auto flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      <ScoreBadge score={results.overall_score} isCorrect={results.is_correct} />

                      {/* Sub-Scores: Vocabulary & Speaking Confidence */}
                      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 w-full">
                        <div className="bg-purple-50/90 border border-purple-100 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-purple-700 shadow-sm">
                          <span>📚 Vocab Score:</span>
                          <span className="font-bold text-purple-900">{results.vocabulary_score || 8}/10</span>
                        </div>
                        <div className="bg-sky-50/90 border border-sky-100 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-sky-700 shadow-sm">
                          <span>🗣️ Confidence:</span>
                          <span className="font-bold text-sky-900">{results.confidence_score || 8}/10</span>
                        </div>
                      </div>

                      {results.is_correct && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-1 text-center">
                          <p className="text-emerald-700 font-bold text-xs">🌟 Flawless Sentence!</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* 2. FULL-WIDTH RECTANGULAR BOXES FOR GRAMMAR MISTAKES */}
                {results.errors && results.errors.length > 0 ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Detailed Feedback ({results.errors.length} {results.errors.length === 1 ? 'Error' : 'Errors'})
                      </h3>
                    </div>

                    {/* FULL WIDTH RECTANGULAR BOXES LIST */}
                    <div className="flex flex-col gap-3.5 w-full">
                      {results.errors.map((error, i) => (
                        <FeedbackCard key={i} error={error} index={i} />
                      ))}
                    </div>
                  </div>
                ) : results.is_correct ? (
                  <div className="w-full bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 text-center">
                    <p className="text-emerald-800 font-semibold text-base">🎉 No errors detected in your response!</p>
                    <p className="text-emerald-600 text-xs mt-1">Your sentence structure and word usage were spot on.</p>
                  </div>
                ) : (
                  <div className="w-full bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 text-center">
                    <p className="text-indigo-800 font-semibold text-sm">Practiced Session ({results.overall_score}/10)</p>
                    <p className="text-indigo-600 text-xs mt-1">Full breakdown loaded. Speak a new sentence below for real-time AI evaluation!</p>
                  </div>
                )}

                {/* 3. ENCOURAGEMENT BANNER (FULL WIDTH) */}
                {results.encouragement && (
                  <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 lg:p-5 text-white shadow-sm flex items-center gap-3.5">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Tutor Advice</p>
                      <p className="text-sm font-medium leading-snug">{results.encouragement}</p>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* BOTTOM FIXED BAR (FULL WIDTH UTILIZATION) */}
          <div className="flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-indigo-100/80 px-6 lg:px-10 py-3.5 z-10 shadow-lg">
            <div className="w-full flex items-center gap-4">

              {/* Status & Input Info Box */}
              <div className={`flex-1 relative rounded-2xl border-2 px-5 py-3 transition-all duration-300 flex items-center justify-between ${
                isRecordingState ? 'border-rose-400 bg-rose-50/70' : isProcessing ? 'border-indigo-300 bg-indigo-50/70' : 'border-indigo-100 bg-gray-50/50 hover:border-indigo-200'
              }`}>
                {isIdle && !results && (
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Try Speaking</p>
                    <p className="text-gray-600 text-xs font-medium truncate">"Yesterday I go to market" or "She don't like coffee"</p>
                  </div>
                )}
                {isIdle && results && (
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Viewing Session</p>
                    <p className="text-gray-700 text-xs font-medium truncate">"{results.transcribed_text}"</p>
                  </div>
                )}
                {isRecordingState && (
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                    <p className="text-rose-600 font-semibold text-xs">Recording audio... Click stop when finished</p>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <p className="text-indigo-600 font-semibold text-xs">Evaluating grammar, vocabulary and confidence...</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {results && appStatus === 'results' && (
                  <button
                    onClick={handleTryAgain}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 transition-all duration-200 shadow-sm"
                  >
                    New Practice
                  </button>
                )}

                <div className="relative">
                  {isRecordingState && (
                    <span className="absolute inset-0 rounded-full bg-rose-400 opacity-30 animate-pulse-ring" />
                  )}
                  <button
                    onClick={handleMicClick}
                    disabled={isProcessing}
                    aria-label={isIdle ? 'Start recording' : isRecordingState ? 'Stop recording' : 'Processing…'}
                    className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                      isIdle
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white focus:ring-indigo-400 hover:scale-105 active:scale-95'
                        : isRecordingState
                        ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white focus:ring-rose-400 scale-105'
                        : 'bg-gray-300 text-white cursor-not-allowed'
                    }`}
                  >
                    {isIdle           && <MicIcon />}
                    {isRecordingState && <StopIcon />}
                    {isProcessing     && <SpinnerIcon />}
                  </button>
                </div>
              </div>

            </div>

            {micError && (
              <div className="w-full mt-1.5">
                <p className="text-rose-600 text-[11px] flex items-center gap-1"><span>⚠️</span> {micError}</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  )
}
