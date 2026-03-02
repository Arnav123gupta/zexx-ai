'use client'

import { useState, useEffect } from 'react'

export function AlertToggle({
  onToggle,
}: {
  onToggle: (isActive: boolean) => void
}) {
  const [isAlertMode, setIsAlertMode] = useState(false)
  const [flickering, setFlickering] = useState(false)

  useEffect(() => {
    onToggle(isAlertMode)

    if (isAlertMode) {
      // Trigger flickering effect
      const flickerInterval = setInterval(() => {
        setFlickering(prev => !prev)
      }, 80)

      return () => clearInterval(flickerInterval)
    }
  }, [isAlertMode, onToggle])

  const toggleAlert = () => {
    setIsAlertMode(!isAlertMode)
  }

  return (
    <button
      onClick={toggleAlert}
      className={`fixed bottom-8 right-8 z-40 px-6 py-3 font-mono font-bold text-sm rounded-lg transition-all duration-300 ${
        isAlertMode
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse'
          : 'bg-green-600 text-black shadow-lg shadow-green-400/50 hover:shadow-green-400/80'
      } ${flickering && isAlertMode ? 'opacity-40' : 'opacity-100'}`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isAlertMode ? 'bg-red-200 animate-pulse' : 'bg-green-200'}`} />
        {isAlertMode ? 'RED ALERT: ON' : 'RED ALERT: OFF'}
      </span>
    </button>
  )
}
