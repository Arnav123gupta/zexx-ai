'use client'

import { useEffect } from 'react'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  responsive?: boolean
  className?: string
}

export function AdBanner({ 
  slot, 
  format = 'auto',
  responsive = true,
  className = ''
}: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    if (!clientId) {
      console.warn('[v0] Google AdSense Client ID not configured')
      return
    }

    try {
      // Push ad to Google AdSense
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error('[v0] AdSense error:', error)
    }
  }, [slot, clientId])

  if (!clientId) {
    return null
  }

  return (
    <div 
      className={`w-full ${className}`}
      style={{ minHeight: format === 'vertical' ? '600px' : format === 'rectangle' ? '250px' : 'auto' }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: format === 'vertical' ? '600px' : format === 'rectangle' ? '250px' : 'auto',
        }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
