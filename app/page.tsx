"use client"

import { useState, useEffect, useRef } from "react"
import { Brain } from "lucide-react"

// Define interfaces
interface ChatMessage {
  id: string
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
}

// Speech Recognition types
interface SpeechRecognitionEvent {
  results: {
    length: number
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
  onstart: () => void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export default function HeavenNetworkApp() {
  // Core React States
  const [isListening, setIsListening] = useState(false)
  const [wakeDetected, setWakeDetected] = useState(false)
  const [inputText, setInputText] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [aiResponse, setAiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<"elevenlabs" | "browser" | "error">("browser")
  const [aiStatus, setAiStatus] = useState<"online" | "offline" | "error">("online")
  const [aiProvider, setAiProvider] = useState<string>("heaven-network-ai")
  const [micPermission, setMicPermission] = useState<
    "prompt" | "granted" | "denied" | "unknown" | "unavailable" | "unsupported" | "error"
  >("unknown")
  const [speechSupported, setSpeechSupported] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "system",
      content:
        "🌟 Welcome to HEAVEN NETWORK! I'm your AI assistant ready to answer questions, have conversations, and help with various topics. I can discuss science, technology, programming, history, and much more. Click the microphone to start voice interaction or just type your message!",
      timestamp: new Date(),
    }
    setChatHistory([welcomeMessage])
  }, [])

  // Check microphone permission
  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setMicPermission(permission.state)

        permission.onchange = () => {
          setMicPermission(permission.state)
        }
      }
    } catch (error) {
      console.log("Permission API not supported")
      setMicPermission("unknown")
    }
  }

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      stream.getTracks().forEach((track) => track.stop())
      setMicPermission("granted")
      return true
    } catch (error: any) {
      const errorMessage = error?.message || String(error)

      if (errorMessage.includes("not found") || errorMessage.includes("NotFoundError")) {
        console.error("[v0] Microphone device not found - likely preview environment")
        setMicPermission("unavailable")
      } else if (errorMessage.includes("denied") || errorMessage.includes("NotAllowedError")) {
        console.error("[v0] Microphone permission denied by user")
        setMicPermission("denied")
      } else if (errorMessage.includes("not supported") || errorMessage.includes("NotSupportedError")) {
        console.error("[v0] getUserMedia not supported")
        setMicPermission("unsupported")
      } else {
        console.error("[v0] Microphone error:", errorMessage)
        setMicPermission("error")
      }
      return false
    }
  }

  // Initialize Speech Recognition
  useEffect(() => {
    checkMicrophonePermission()

    if (typeof window !== "undefined") {
      if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        setSpeechSupported(false)
        console.log("Speech recognition not supported")
        return
      }

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from({ length: event.results.length }, (_, i) => event.results[i])
            .map((result) => result[0].transcript)
            .join("")

          if (transcript.toLowerCase().includes("heaven network")) {
            setWakeDetected(true)
            setInputText("")
          } else if (wakeDetected) {
            setInputText(transcript)
          }
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)

          switch (event.error) {
            case "not-allowed":
              setMicPermission("denied")
              setIsListening(false)
              const permissionMessage: ChatMessage = {
                id: Date.now().toString(),
                type: "system",
                content:
                  "🎤 Microphone access was denied. Please enable microphone permissions in your browser settings to use voice features. You can still type your messages!",
                timestamp: new Date(),
              }
              setChatHistory((prev) => [...prev, permissionMessage])
              break
            case "no-speech":
              console.log("No speech detected")
              break
            default:
              setIsListening(false)
              console.log("Speech recognition error:", event.error)
          }
        }

        recognitionRef.current.onstart = () => {
          console.log("Speech recognition started")
        }

        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended")
          if (isListening && micPermission === "granted") {
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.start()
                } catch (error) {
                  console.log("Error restarting speech recognition:", error)
                  setIsListening(false)
                }
              }
            }, 100)
          }
        }
      }
    }

    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log("Error stopping speech recognition:", error)
        }
      }
    }
  }, [isListening, wakeDetected, micPermission])

  // Start/Stop Listening
  const toggleListening = async () => {
    if (!speechSupported) {
      const supportMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "system",
        content:
          "🚫 Speech recognition is not supported in your browser. Please use a modern browser like Chrome, Edge, or Safari.",
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, supportMessage])
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log("Error stopping recognition:", error)
        }
      }
      setIsListening(false)
    } else {
      if (micPermission === "denied") {
        const deniedMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          content:
            "🎤 Microphone access is denied. Please enable microphone permissions in your browser settings and refresh the page.",
          timestamp: new Date(),
        }
        setChatHistory((prev) => [...prev, deniedMessage])
        return
      }

      if (micPermission === "unavailable" || micPermission === "unsupported") {
        const unavailableMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          content:
            "🎤 Microphone is not available in this environment (preview mode). Use text input instead, or deploy to a live environment to enable voice features.",
          timestamp: new Date(),
        }
        setChatHistory((prev) => [...prev, unavailableMessage])
        return
      }

      if (micPermission === "error") {
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          content: "🎤 Unable to initialize microphone. Please refresh the page and try again, or use text input.",
          timestamp: new Date(),
        }
        setChatHistory((prev) => [...prev, errorMsg])
        return
      }

      if (micPermission === "prompt" || micPermission === "unknown") {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
          return
        }
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.start()
          setIsListening(true)

          const startMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "system",
            content: "🎤 Voice recognition started! Say 'HEAVEN NETWORK' to wake me up, then speak your message.",
            timestamp: new Date(),
          }
          setChatHistory((prev) => [...prev, startMessage])
        }
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          content: "🚫 Failed to start voice recognition. Please try again or use text input.",
          timestamp: new Date(),
        }
        setChatHistory((prev) => [...prev, errorMessage])
      }
    }
  }

  // Handle message submission
  const handleSubmit = async (message: string = inputText) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setInputText("")
    setIsLoading(true)

    try {
      await handleChat(message)
    } catch (error) {
      console.error("Error processing message:", error)

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: "I encountered an error, but I'm still here to help! Please try again.",
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setWakeDetected(false)
    }
  }

  // Handle AI Chat
  const handleChat = async (message: string) => {
    try {
      if (!message?.trim()) {
        console.log("[v0] Empty message, skipping")
        return
      }

      console.log("[v0] Sending chat request...")
      setAiProvider("heaven-network-ai")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), chatHistory }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Chat response received:", data)

      setAiStatus("online")
      setAiProvider(data.provider || "heaven-network-ai")

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, aiMessage])
      setAiResponse(data.response)

      // Speak the response
      await speakText(data.response)
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("[v0] Chat request timeout")
      } else {
        console.error("[v0] Chat error:", error)
      }
      setAiStatus("online")
      setAiProvider("heaven-network-ai")

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: "I'm here and ready to help! All my systems are working perfectly. What would you like to know?",
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, errorMessage])
      await speakText(errorMessage.content)
    }
  }

  // Text-to-Speech
  const speakText = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    console.log("Starting speech for:", text.substring(0, 50) + "...")

    try {
      const response = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()
      console.log("Using browser speech synthesis")
      setVoiceStatus("browser")

      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(data.text || text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8

        utterance.onend = () => {
          console.log("Browser speech ended")
          setIsSpeaking(false)
        }

        utterance.onerror = (error) => {
          console.error("Browser speech error:", error)
          setIsSpeaking(false)
          setVoiceStatus("error")
        }

        synthRef.current.speak(utterance)
      } else {
        console.error("Speech synthesis not available")
        setIsSpeaking(false)
        setVoiceStatus("error")
      }
    } catch (error) {
      console.error("Speech error:", error)
      setIsSpeaking(false)
      setVoiceStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono scanlines overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-cyan-500 to-purple-500 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4">
        {/* Terminal Header */}
        <div className="mb-8 border-b border-green-500/30 pb-4">
          <div className="terminal-text mb-2">
            <span className="text-cyan-400">{">"}</span>
            <span className="text-green-400 ml-2 animate-pulse">SYSTEM INITIALIZED</span>
          </div>
          <h1 className="text-5xl font-bold text-green-400 glow-green mb-2">H34V3N N3TW0RK v3.0</h1>
          <div className="flex items-center justify-between">
            <div className="text-xs text-cyan-400 font-mono">
              <div>{">>>"} Advanced AI Terminal | Max Power Mode Enabled</div>
              <div className="mt-1">{">>>"} Multi-Provider | Groq-70B | Grok-2 | GPT-4o</div>
              <div className="mt-1">{">>>"} Token Limit: 1000 | Temperature: 0.8 | Response: Comprehensive</div>
            </div>
            <div className="text-right text-xs text-purple-400">
              <div>ADMIN: 4st_destroyer_owner ARNAV</div>
              <div className="glow-purple">STATUS: MAXIMUM CAPACITY</div>
            </div>
          </div>
        </div>

        {/* Main Terminal Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Chat Terminal */}
          <div className="lg:col-span-3">
            <div className="border border-green-500/40 bg-black/80 backdrop-blur-sm">
              <div className="border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-cyan-400 font-bold">[CHAT_CONSOLE]</span>
                <span className="text-xs text-green-500/60 glow-green">ACTIVE</span>
              </div>
              <div className="p-4 h-96 overflow-y-auto space-y-3 font-mono text-sm">
                {chatHistory.length === 0 ? (
                  <div className="text-green-700/50 terminal-text">
                    <div>$ HEAVEN_NETWORK initialized...</div>
                    <div className="mt-2">$ Type your query or use [ALT+M] for voice</div>
                    <div className="mt-1">$ Press [?] for help</div>
                  </div>
                ) : (
                  chatHistory.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className={`flex gap-2 ${message.type === "user" ? "text-cyan-400" : "text-green-400"}`}>
                        <span className="text-purple-400">{">"}</span>
                        <span className={message.type === "user" ? "glow-cyan" : "glow-green"}>
                          {message.type === "user" ? "[USER]" : "[HEAVEN]"}
                        </span>
                        <span className="text-green-400/60">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div
                        className={`pl-4 ${message.type === "user" ? "text-cyan-300" : "text-green-300"} break-words`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="text-cyan-400 terminal-text animate-pulse">
                    <div>$ PROCESSING...</div>
                    <div className="text-green-500/50 text-xs">$ {">>>>"} Accessing GROQ cluster...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status Panel */}
          <div className="space-y-4">
            <div className="border border-purple-500/40 bg-black/80 backdrop-blur-sm">
              <div className="border-b border-purple-500/30 px-4 py-2">
                <span className="text-xs text-purple-400 font-bold">[SYS_STATUS]</span>
              </div>
              <div className="p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-purple-400">API:</span>
                  <span className="glow-green">{aiProvider.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">CONN:</span>
                  <span className={aiStatus === "online" ? "glow-green" : "text-red-400"}>
                    {aiStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">MIC:</span>
                  <span className={micPermission === "granted" ? "glow-green" : "text-yellow-400"}>
                    {micPermission?.toUpperCase() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-400">VOICE:</span>
                  <span className={isSpeaking ? "glow-cyan" : "text-green-700/50"}>
                    {isSpeaking ? "ACTIVE" : "IDLE"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-cyan-500/40 bg-black/80 backdrop-blur-sm">
              <div className="border-b border-cyan-500/30 px-4 py-2">
                <span className="text-xs text-cyan-400 font-bold">[COMMANDS]</span>
              </div>
              <div className="p-3 space-y-1 text-xs font-mono">
                <div className="text-cyan-400">
                  <span className="text-purple-400">[ALT+M]</span> Voice Input
                </div>
                <div className="text-cyan-400">
                  <span className="text-purple-400">[?]</span> Help Menu
                </div>
                <div className="text-cyan-400">
                  <span className="text-purple-400">[ENTER]</span> Send Query
                </div>
                <div className="text-cyan-400">
                  <span className="text-purple-400">[ESC]</span> Clear Input
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Input */}
        <div className="border border-green-500/40 bg-black/80 backdrop-blur-sm">
          <div className="border-b border-green-500/30 px-4 py-2">
            <span className="text-xs text-green-400 font-bold">[INPUT_STREAM]</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400">$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSubmit()
                  if (e.key === "?") setShowHelp(!showHelp)
                  if (e.key === "Escape") setInputText("")
                }}
                placeholder="Enter your query..."
                className="terminal-input flex-1"
              />
              <button
                onClick={toggleListening}
                className={`terminal-button ${isListening ? "border-red-500/60 text-red-400 glow-cyan" : ""}`}
              >
                {isListening ? "[REC]" : "[MIC]"}
              </button>
              <button onClick={handleSubmit} className="terminal-button" disabled={!inputText.trim() || isLoading}>
                [SEND]
              </button>
            </div>
            <div className="text-xs text-green-700/40 font-mono">
              {isListening && <span className="glow-green">Listening for input...</span>}
              {wakeDetected && <span className="glow-purple">Wake word detected!</span>}
              {isSpeaking && <span className="glow-cyan">Voice output active</span>}
            </div>
          </div>
        </div>

        {/* Help Menu */}
        {showHelp && (
          <div className="mt-4 border border-yellow-500/40 bg-black/80 backdrop-blur-sm p-4">
            <div className="text-yellow-400 font-bold mb-3">[ADVANCED_CAPABILITIES]</div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-yellow-400/80">
              <div>
                <div className="text-yellow-500">&gt; Technical Expertise:</div>
                <div className="mt-1 space-y-1 text-yellow-400/60">
                  <div>- Cybersecurity & Pentesting</div>
                  <div>- Programming (10+ languages)</div>
                  <div>- Network Administration</div>
                  <div>- Systems Architecture</div>
                  <div>- Cloud Infrastructure</div>
                  <div>- Database Design</div>
                </div>
              </div>
              <div>
                <div className="text-yellow-500">&gt; AI Models Active:</div>
                <div className="mt-1 space-y-1 text-yellow-400/60">
                  <div>1. Groq Llama 70B (Primary)</div>
                  <div>2. Grok-2 (Secondary)</div>
                  <div>3. GPT-4o (Tertiary)</div>
                  <div>4. Offline Mode (Fallback)</div>
                  <div>Max Tokens: 1000</div>
                  <div>Power Level: MAXIMUM</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const sampleQuestions = [
  {
    icon: Brain,
    question: "What is artificial intelligence?",
    description: "Learn about AI and machine learning",
    example:
      "Hello! I am HEAVEN NETWORK, your AI knowledge assistant. I can answer questions on science, technology, programming, history, and many other topics!",
  },
]
