import React from 'react'

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
  </svg>
)

const StopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
)

const SpinnerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" fill="none" viewBox="0 0 24 24">
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
    <div className="relative">
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-rose-400 opacity-30 animate-pulse-ring" />
      )}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={
          isIdle       ? 'Start recording' :
          isRecording  ? 'Stop recording'  :
          'Processing audio…'
        }
        className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
          isIdle
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white focus:ring-indigo-400 hover:scale-105 active:scale-95'
            : isRecording
            ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white focus:ring-rose-400 scale-105'
            : 'bg-gray-300 text-white cursor-not-allowed'
        }`}
      >
        {isIdle       && <MicIcon />}
        {isRecording  && <StopIcon />}
        {isProcessing && <SpinnerIcon />}
      </button>
    </div>
  )
}
