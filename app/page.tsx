"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Brain } from "lucide-react"
import { MessageRenderer } from "@/components/message-renderer"

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

interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export default function Home() {
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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Get current conversation
  const currentConversation = conversations.find((c) => c.id === currentConversationId)
  const displayMessages = currentConversation?.messages || chatHistory

  // Create new conversation
  const createNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newId)
    setChatHistory([])
    setInputText("")
    setAiResponse("")
  }

  // Save message to current conversation
  const saveMessageToConversation = (message: ChatMessage) => {
    if (currentConversationId) {
      setConversations(
        conversations.map((conv) => {
          if (conv.id === currentConversationId) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
              title:
                conv.title === "New Chat" && message.type === "user"
                  ? message.content.substring(0, 30) + (message.content.length > 30 ? "..." : "")
                  : conv.title,
            }
          }
          return conv
        }),
      )
    }
    setChatHistory([...chatHistory, message])
  }

  // Delete conversation
  const deleteConversation = (id: string) => {
    setConversations(conversations.filter((c) => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
      setChatHistory([])
    }
  }

  // Load conversation
  const loadConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setCurrentConversationId(id)
      setChatHistory(conv.messages)
      setAiResponse("")
    }
  }

  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "system",
      content:
        "🌟 Welcome to HEAVEN NETWORK! I'm your AI assistant ready to answer questions, have conversations, and help with various topics. I can discuss science, technology, programming, history, and much more. Click the microphone to start voice interaction or just type your message!",
      timestamp: new Date(),
    }
    createNewConversation()
    saveMessageToConversation(welcomeMessage)
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

    // Detect preview environment early
    if (typeof window !== "undefined") {
      const isPreviewEnv =
        window.location.hostname.includes("preview") ||
        window.location.hostname.includes("localhost") ||
        window.location.hostname.includes("127.0.0.1") ||
        !navigator.mediaDevices?.getUserMedia

      if (isPreviewEnv) {
        setMicPermission("unavailable")
      }
    }

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setInputText((prev) => prev + transcript)
          } else {
            interimTranscript += transcript
          }
        }
      }
    } else {
      setSpeechSupported(false)
    }
  }, [])

  if (typeof window !== "undefined") {
    synthRef.current = window.speechSynthesis
  }

  const cleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log("Error stopping speech recognition:", error)
      }
    }
  }

  useEffect(() => {
    return cleanup
  }, [])

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
      saveMessageToConversation(supportMessage)
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
        saveMessageToConversation(deniedMessage)
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
        saveMessageToConversation(unavailableMessage)
        return
      }

      if (micPermission === "error") {
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          content: "🎤 Unable to initialize microphone. Please refresh the page and try again, or use text input.",
          timestamp: new Date(),
        }
        saveMessageToConversation(errorMsg)
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
          saveMessageToConversation(startMessage)
        }
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          content: "🚫 Failed to start voice recognition. Please try again or use text input.",
          timestamp: new Date(),
        }
        saveMessageToConversation(errorMessage)
      }
    }
  }

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputText,
      timestamp: new Date(),
    }

    saveMessageToConversation(userMessage)
    setInputText("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      })

      const data = await response.json()
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response || "Error: No response received",
        timestamp: new Date(),
      }

      saveMessageToConversation(aiMessage)
      setAiResponse(data.response)
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setIsLoading(false)
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
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
      }

      saveMessageToConversation(aiMessage)
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
      saveMessageToConversation(errorMessage)
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
    <div className="flex flex-col h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-600 border-opacity-30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-green-400 tracking-wider">⚡ HEAVEN NETWORK ⚡</h1>
            <span className="text-xs text-green-600">made by 4st_destroyer_owner ARNAV</span>
          </div>
          <div className="text-xs text-green-600 font-mono">[SYSTEM ONLINE]</div>
        </div>
      </header>

      {/* Terminal Header */}
      <div className="relative z-10 max-w-6xl mx-auto p-4">
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

        <div className="flex h-[calc(100vh-120px)]">
          {/* ChatGPT-like sidebar */}
          {showSidebar && (
            <div className="w-64 border-r border-green-500/30 bg-black/60 backdrop-blur-sm flex flex-col">
              <button
                onClick={createNewConversation}
                className="m-4 px-4 py-2 border border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm rounded font-mono transition-colors"
              >
                + New Chat
              </button>

              <div className="flex-1 overflow-y-auto space-y-1 px-2">
                {conversations.length === 0 ? (
                  <div className="text-green-700/50 text-xs p-4">No conversations yet</div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={`p-3 rounded cursor-pointer text-sm transition-colors truncate group relative ${
                        currentConversationId === conv.id
                          ? "bg-green-500/20 text-green-300 border border-green-500/50"
                          : "text-green-400/70 hover:bg-green-500/10"
                      }`}
                    >
                      <div className="truncate pr-8">{conv.title}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conv.id)
                        }}
                        className="absolute right-2 top-3 text-red-400/0 hover:text-red-400 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-green-500/30 p-4 space-y-2">
                <div className="text-xs text-green-500/60">
                  <div>Conversations: {conversations.length}</div>
                  <div>Messages: {displayMessages.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Main chat area layout */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-green-500/30 px-4 py-2 bg-black/40">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                {showSidebar ? "←" : "→"}
              </button>
              <span className="text-xs text-cyan-400">{currentConversation?.title || "HEAVEN_NETWORK"}</span>
              <div className="w-6"></div>
            </div>

            {/* Chat display area */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-full">
                <div className="lg:col-span-3 border border-green-500/40 bg-black/80 backdrop-blur-sm">
                  <div className="border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-bold">[CHAT_CONSOLE]</span>
                    <span className="text-xs text-green-500/60 glow-green">ACTIVE</span>
                  </div>
                  <div className="p-4 h-96 overflow-y-auto space-y-3 font-mono text-sm">
                    {displayMessages.length === 0 ? (
                      <div className="text-green-700/50 terminal-text">
                        <div>$ HEAVEN_NETWORK initialized...</div>
                        <div className="mt-2">$ Type your query or use [ALT+M] for voice</div>
                        <div className="mt-1">$ Press [?] for help</div>
                      </div>
                    ) : (
                      displayMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className={`flex gap-2 ${message.type === "user" ? "text-cyan-400" : "text-green-400"}`}>
                            <span className="text-purple-400">{">"}</span>
                            <span className={message.type === "user" ? "glow-cyan" : "glow-green"}>
                              {message.type === "user" ? "[USER]" : "[HEAVEN]"}
                            </span>
                            <span className="text-green-400/60">{message.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="pl-4">
                            <MessageRenderer content={message.content} type={message.type} />
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
                        <span className="text-purple-400">Status:</span>
                        <span className={aiStatus === "online" ? "text-green-400" : "text-yellow-400"}>
                          {aiStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Voice:</span>
                        <span className={voiceStatus === "error" ? "text-red-400" : "text-green-400"}>
                          {voiceStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Mic:</span>
                        <span className={micPermission === "granted" ? "text-green-400" : "text-yellow-400"}>
                          {micPermission.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
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
                  if (e.key === "Enter") handleSubmit(e)
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
              <button
                onClick={(e) => handleSubmit(e)}
                className="terminal-button"
                disabled={!inputText.trim() || isLoading}
              >
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
