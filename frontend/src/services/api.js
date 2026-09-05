const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export async function fetchLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/languages`)
    if (!response.ok) {
      throw new Error(`Failed to load languages: ${response.status}`)
    }
    return await response.json()
  } catch (err) {
    console.warn('Using default languages fallback:', err)
    return {
      languages: [
        {
          code: 'en',
          name: 'English',
          native_name: 'English',
          sample_phrases: [
            "She don't like coffee in the morning.",
            "Yesterday I go to market with my friend.",
            "They is playing football outside.",
          ],
        },
        {
          code: 'hi',
          name: 'Hindi',
          native_name: 'हिन्दी',
          sample_phrases: [
            "वह कल स्कूल जाता था।",
            "हम दोनों कल बाजार जाऊंगा।",
            "मुझे ठंडी पानी पीना है।",
          ],
        },
        {
          code: 'te',
          name: 'Telugu',
          native_name: 'తెలుగు',
          sample_phrases: [
            "నేను నిన్న బడికి వెళ్తాను.",
            "ఆమె నిన్న రాత్రి అన్నం తింటాడు.",
            "మేము అందరం రేపు సినిమాకి వెళ్ళాము.",
          ],
        },
      ],
      default: 'en',
    }
  }
}

export async function analyzeAudio(audioBlob, sessionId, language = 'en') {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('session_id', sessionId || '')
  formData.append('language', language || 'en')

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

export async function fetchProgress(sessionId, language = null) {
  const url = language
    ? `${API_BASE_URL}/api/progress/${sessionId}?language=${encodeURIComponent(language)}`
    : `${API_BASE_URL}/api/progress/${sessionId}`

  const response = await fetch(url)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to fetch progress')
  }

  return response.json()
}

export function getAudioUrl(requestId) {
  return `${API_BASE_URL}/api/audio/${requestId}`
}
