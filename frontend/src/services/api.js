const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export async function analyzeAudio(audioBlob, sessionId) {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('session_id', sessionId || '')

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Server error: ${response.status}`)
  }

  return response.json()
}

export async function fetchProgress(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/progress/${sessionId}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to fetch progress')
  }

  return response.json()
}

export function getAudioUrl(requestId) {
  return `${API_BASE_URL}/api/audio/${requestId}`
}
