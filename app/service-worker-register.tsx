'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[v0] Service Worker registered:', registration)
          })
          .catch((error) => {
            console.log('[v0] Service Worker registration failed:', error)
          })
      })
    }
  }, [])

  return null
}
