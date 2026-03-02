'use client'

import { useState } from 'react'
import { MatrixBackground } from '@/components/matrix-background'
import { BootScreen } from '@/components/boot-screen'
import { ParallaxEffect } from '@/components/parallax-effect'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [bootComplete, setBootComplete] = useState(false)

  return (
    <>
      {!bootComplete && <BootScreen onComplete={() => setBootComplete(true)} />}
      
      <MatrixBackground isAlertMode={true} />
      
      <ParallaxEffect>
        <div className="relative z-10">{children}</div>
      </ParallaxEffect>
    </>
  )
}
