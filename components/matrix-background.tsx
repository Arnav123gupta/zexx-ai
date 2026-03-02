'use client'

import { useEffect, useRef, useState } from 'react'

interface MatrixColumn {
  x: number
  y: number
  speed: number
  chars: string[]
  opacity: number
  layer: number // 0 = slow, 1 = medium, 2 = fast
}

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン!@#$%^&*()'
const NEON_GREEN = '#00ff88'
const CHAR_SIZE = 20
const LAYER_SPEEDS = [0.5, 1.2, 2.0] // Multi-layer depth effect

export function MatrixBackground({ isAlertMode = false }: { isAlertMode?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const columnsRef = useRef<MatrixColumn[]>([])
  const animationIdRef = useRef<number>()
  const [glitchIntensity, setGlitchIntensity] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    // Initialize columns with multiple layers
    const initColumns = () => {
      columnsRef.current = []
      const cols = Math.ceil(canvas.width / CHAR_SIZE)
      
      // Create 3 layers with different speeds for depth
      for (let layer = 0; layer < 3; layer++) {
        for (let i = 0; i < cols; i++) {
          columnsRef.current.push({
            x: i * CHAR_SIZE,
            y: Math.random() * canvas.height,
            speed: LAYER_SPEEDS[layer] * (Math.random() * 0.5 + 0.75),
            chars: Array.from(
              { length: Math.random() * 20 + 8 },
              () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
            ),
            opacity: (0.6 - layer * 0.15) * (Math.random() * 0.3 + 0.7),
            layer,
          })
        }
      }
    }
    initColumns()

    // Animation loop
    const animate = () => {
      // Create motion blur trail effect
      ctx.fillStyle = isAlertMode ? 'rgba(40, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Apply glitch effect in alert mode
      let glitchOffset = 0
      if (isAlertMode && glitchIntensity > 0) {
        glitchOffset = (Math.random() - 0.5) * glitchIntensity * 10
        setGlitchIntensity(prev => Math.max(0, prev - 0.05))
      }

      // Draw columns sorted by layer
      ctx.font = `bold ${CHAR_SIZE}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'

      columnsRef.current.forEach((column) => {
        // Update position with layer-specific speed
        column.y += column.speed

        // Reset column if it goes off screen
        if (column.y > canvas.height + CHAR_SIZE * column.chars.length) {
          column.y = -CHAR_SIZE * column.chars.length
          column.chars = Array.from(
            { length: Math.random() * 20 + 8 },
            () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          )
        }

        // Draw characters
        column.chars.forEach((char, index) => {
          const charY = column.y + index * CHAR_SIZE
          
          // Skip if character is off-screen
          if (charY < -CHAR_SIZE || charY > canvas.height) return

          // Calculate opacity with fade effect
          const distanceFromTop = charY / canvas.height
          let charOpacity = column.opacity * 0.6

          if (distanceFromTop > 0.75) {
            charOpacity *= (1 - (distanceFromTop - 0.75) / 0.25)
          }

          // Color based on mode
          const color = isAlertMode ? '255, 0, 0' : '0, 255, 136'
          
          // Draw character
          ctx.fillStyle = `rgba(${color}, ${charOpacity})`
          ctx.fillText(char, column.x + CHAR_SIZE / 2 + glitchOffset, charY)

          // Enhanced glow for leading character
          if (index === 0) {
            ctx.shadowColor = isAlertMode ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 136, 0.8)'
            ctx.shadowBlur = 20
            ctx.fillStyle = `rgba(${color}, ${Math.min(charOpacity * 2, 1)})`
            ctx.fillText(char, column.x + CHAR_SIZE / 2 + glitchOffset, charY)
            ctx.shadowBlur = 0
          }
        })
      })

      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      resizeCanvas()
      initColumns()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isAlertMode])

  // Trigger glitch effect when alert mode activates
  useEffect(() => {
    if (isAlertMode) {
      setGlitchIntensity(5)
    }
  }, [isAlertMode])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  )
}
