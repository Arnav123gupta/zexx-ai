'use client'

import { useEffect, useState } from 'react'

const BOOT_LINES = [
  '> Initializing Network AI...',
  '> Connecting to Secure AI Core...',
  '> Loading Neural Matrix...',
  '> Authenticating Neural Pathways...',
  '> Synchronizing Quantum Processors...',
  '> Access Granted.',
]

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lineIndex = 0
    let charIndex = 0
    let lineTimer: NodeJS.Timeout

    const typeNextChar = () => {
      if (lineIndex >= BOOT_LINES.length) {
        // Boot sequence complete, start fade out
        setTimeout(() => {
          setIsVisible(false)
          setTimeout(onComplete, 500)
        }, 800)
        return
      }

      const currentLine = BOOT_LINES[lineIndex]

      if (charIndex < currentLine.length) {
        // Type character
        setDisplayedLines(prev => {
          const newLines = [...prev]
          if (!newLines[lineIndex]) {
            newLines[lineIndex] = ''
          }
          newLines[lineIndex] = currentLine.substring(0, charIndex + 1)
          return newLines
        })
        charIndex++
        lineTimer = setTimeout(typeNextChar, 40) // Typing speed
      } else {
        // Move to next line
        setProgress(prev => Math.min(prev + (100 / BOOT_LINES.length), 100))
        lineIndex++
        charIndex = 0
        lineTimer = setTimeout(typeNextChar, 400) // Delay between lines
      }
    }

    typeNextChar()

    return () => {
      if (lineTimer) clearTimeout(lineTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-8 pointer-events-none transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Terminal content */}
      <div className="w-full max-w-2xl px-8">
        <div className="font-mono text-sm text-green-400 space-y-2">
          {displayedLines.map((line, i) => (
            <div key={i} className="relative">
              {line}
              {i === displayedLines.length - 1 && (
                <span className="inline-block ml-1 w-2 h-5 bg-green-400 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-green-500/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-400 glow-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Scanning lines effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-green-500/0 via-green-500/5 to-green-500/0" />
      </div>
    </div>
  )
}
