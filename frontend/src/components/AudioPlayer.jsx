import React, { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ audioUrl, correctedText }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load()
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Auto-play blocked:', err.message)
        })
    }
  }, [audioUrl])

  const handlePlay = () => {
    audioRef.current?.play()
    setIsPlaying(true)
  }

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  if (!audioUrl) return null

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-indigo-500 text-xl mt-0.5">🔊</span>
        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">
            Corrected Version
          </p>
          <p className="text-gray-800 font-medium text-lg leading-snug">
            "{correctedText}"
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      >
        <source src={audioUrl} type="audio/mpeg" />
      </audio>

      <div className="flex gap-2">
        <button
          onClick={isPlaying ? undefined : handlePlay}
          disabled={isPlaying}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            transition-all duration-200
            ${isPlaying
              ? 'bg-indigo-200 text-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95'
            }
          `}
        >
          {isPlaying ? '🔊 Playing...' : '▶ Play'}
        </button>

        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     bg-white border border-indigo-200 text-indigo-600
                     hover:bg-indigo-50 hover:scale-105 active:scale-95
                     transition-all duration-200"
        >
          🔁 Replay
        </button>
      </div>
    </div>
  )
}
