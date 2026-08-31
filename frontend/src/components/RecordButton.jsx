import React from 'react'

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
  </svg>
)

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
)

const SpinnerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

export default function RecordButton({ onStart, onStop, status, error }) {
  const isIdle       = status === 'idle'
  const isRecording  = status === 'recording'
  const isProcessing = status === 'processing'

  const handleClick = () => {
    if (isIdle)       onStart()
    if (isRecording)  onStop()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <span className="absolute inline-flex h-32 w-32 rounded-full bg-red-400 opacity-30 animate-pulse-ring" />
        )}

        <button
          onClick={handleClick}
          disabled={isProcessing}
          aria-label={
            isIdle       ? 'Start recording'  :
            isRecording  ? 'Stop recording'   :
            'Processing your audio...'
          }
          className={`
            relative z-10 w-28 h-28 rounded-full
            flex items-center justify-center
            shadow-xl transition-all duration-300
            focus:outline-none focus:ring-4 focus:ring-offset-2
            ${isIdle
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-400 hover:scale-105 active:scale-95'
              : isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 scale-105'
              : 'bg-gray-400 text-white cursor-not-allowed'
            }
          `}
        >
          {isIdle       && <MicIcon />}
          {isRecording  && <StopIcon />}
          {isProcessing && <SpinnerIcon />}
        </button>
      </div>

      <div className="text-center">
        {isIdle && (
          <p className="text-gray-600 font-medium text-lg">
            Click the mic and speak a sentence
          </p>
        )}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 font-semibold text-lg">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            Recording... Click to stop
          </div>
        )}
        {isProcessing && (
          <p className="text-indigo-600 font-medium text-lg animate-pulse">
            Analyzing your sentence...
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-sm">
          <span className="text-red-500 text-lg mt-0.5">⚠️</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
