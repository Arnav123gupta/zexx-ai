'use client'

import { useState } from 'react'
import { MatrixBackground } from '@/components/matrix-background'
import { BootScreen } from '@/components/boot-screen'
import { AlertToggle } from '@/components/alert-toggle'
import { ParallaxEffect } from '@/components/parallax-effect'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [bootComplete, setBootComplete] = useState(false)
  const [isAlertMode, setIsAlertMode] = useState(false)

  return (
    <>
      {!bootComplete && <BootScreen onComplete={() => setBootComplete(true)} />}
      
      <MatrixBackground isAlertMode={isAlertMode} />
      
      <ParallaxEffect>
        <div className="relative z-10">{children}</div>
      </ParallaxEffect>
      
      {bootComplete && <AlertToggle onToggle={setIsAlertMode} />}
    </>
  )
}
