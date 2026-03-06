"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallApp() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setShowInstallButton(false)
      setInstalled(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") {
      setInstallPrompt(null)
      setShowInstallButton(false)
    }
  }

  const handleDismiss = () => {
    setShowInstallButton(false)
  }

  if (!showInstallButton || installed) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-black border-2 border-[#00ff88] rounded-lg p-4 shadow-2xl shadow-[#00ff88]/20">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[#00ff88] font-mono text-sm font-bold">Install NETWORK AI</p>
            <p className="text-green-300 font-mono text-xs mt-1">Add to your device</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-[#00ff88] hover:bg-[#00dd77] text-black font-bold px-4 py-2 rounded font-mono text-sm flex items-center gap-2 transition-colors"
            aria-label="Install app"
          >
            <Download size={16} />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-[#00ff88] hover:text-[#00dd77] transition-colors ml-2"
            aria-label="Dismiss install prompt"
          >
            <X size={18} />
          </button>
        </div>
        {/* Terminal cursor animation */}
        <div className="mt-2 text-[#00ff88] text-xs font-mono">
          <span className="animate-pulse">▌</span>
        </div>
      </div>
    </div>
  )
}
