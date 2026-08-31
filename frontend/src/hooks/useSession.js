import { useState, useEffect } from 'react'

const SESSION_STORAGE_KEY = 'ai_tutor_session_id'

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function useSession() {
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    let id = localStorage.getItem(SESSION_STORAGE_KEY)

    if (!id) {
      id = generateSessionId()
      localStorage.setItem(SESSION_STORAGE_KEY, id)
    }

    setSessionId(id)
  }, [])

  const clearSession = () => {
    const newId = generateSessionId()
    localStorage.setItem(SESSION_STORAGE_KEY, newId)
    setSessionId(newId)
  }

  return { sessionId, clearSession }
}
