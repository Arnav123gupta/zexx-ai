'use client'

import { useEffect, useRef } from 'react'

export function ParallaxEffect({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if touch device (mobile fallback)
    const isTouchDevice = () => {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window || navigator.maxTouchPoints > 0)) ||
        false
      )
    }

    if (isTouchDevice()) {
      // No parallax on mobile
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxRef.current) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      // Calculate mouse position relative to center
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const offsetX = (mouseX - centerX) * 0.02
      const offsetY = (mouseY - centerY) * 0.02

      // Apply subtle 3D transform to background
      parallaxRef.current.style.transform = `
        perspective(1000px)
        rotateX(${offsetY * 0.1}deg)
        rotateY(${offsetX * 0.1}deg)
        translateZ(10px)
      `
    }

    const handleMouseLeave = () => {
      if (!parallaxRef.current) return
      parallaxRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    }

    container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  let container: HTMLDivElement | null = null

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        ref={parallaxRef}
        className="w-full h-full transition-transform duration-150"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  )
}
