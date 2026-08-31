import { useState, useRef, useCallback } from 'react'

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000)
      setIsRecording(true)

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else {
        setError(`Could not access microphone: ${err.message}`)
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setError(null)
    audioChunksRef.current = []
  }, [])

  return {
    startRecording,
    stopRecording,
    resetRecording,
    isRecording,
    audioBlob,
    error,
  }
}
