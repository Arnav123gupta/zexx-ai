'use client'

import { useEffect, useRef } from 'react'

interface MatrixColumn {
  x: number
  y: number
  speed: number
  chars: string[]
  opacity: number
}

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン !'
const NEON_GREEN = '#00ff88'
const CHAR_SIZE = 20

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const columnsRef = useRef<MatrixColumn[]>([])
  const animationIdRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    // Initialize columns
    const initColumns = () => {
      columnsRef.current = []
      const cols = Math.ceil(canvas.width / CHAR_SIZE)
      
      for (let i = 0; i < cols; i++) {
        columnsRef.current.push({
          x: i * CHAR_SIZE,
          y: Math.random() * canvas.height,
          speed: Math.random() * 2 + 1,
          chars: Array.from(
            { length: Math.random() * 15 + 5 },
            () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          ),
          opacity: Math.random() * 0.3 + 0.3,
        })
      }
    }
    initColumns()

    // Animation loop
    const animate = () => {
      // Clear with semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw columns
      ctx.font = `bold ${CHAR_SIZE}px "JetBrains Mono", monospace`
      ctx.textAlign = 'center'

      columnsRef.current.forEach((column) => {
        // Update position
        column.y += column.speed

        // Reset column if it goes off screen
        if (column.y > canvas.height + CHAR_SIZE * column.chars.length) {
          column.y = -CHAR_SIZE * column.chars.length
          column.chars = Array.from(
            { length: Math.random() * 15 + 5 },
            () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          )
          column.speed = Math.random() * 2 + 1
        }

        // Draw characters
        column.chars.forEach((char, index) => {
          const charY = column.y + index * CHAR_SIZE
          
          // Skip if character is off-screen
          if (charY < -CHAR_SIZE || charY > canvas.height) return

          // Calculate opacity (fade at bottom, bright at top)
          const distanceFromTop = charY / canvas.height
          let charOpacity = column.opacity

          if (distanceFromTop > 0.8) {
            charOpacity *= (1 - (distanceFromTop - 0.8) / 0.2)
          }

          // Draw character with glow effect
          ctx.fillStyle = `rgba(0, 255, 136, ${charOpacity})`
          ctx.fillText(char, column.x + CHAR_SIZE / 2, charY)

          // Add glow for top character
          if (index === 0) {
            ctx.shadowColor = NEON_GREEN
            ctx.shadowBlur = 15
            ctx.fillStyle = `rgba(0, 255, 136, ${Math.min(charOpacity * 1.5, 1)})`
            ctx.fillText(char, column.x + CHAR_SIZE / 2, charY)
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  )
}
