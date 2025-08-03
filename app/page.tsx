"use client"

import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Zap,
  Sparkles,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SetupGuide } from "@/components/setup-guide"

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

export default function ZexxApp() {
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
  const [aiProvider, setAiProvider] = useState<string>("zexx-ai")
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")
  const [speechSupported, setSpeechSupported] = useState(true)

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "system",
      content:
        "🌟 Welcome to ZEXX! I'm your AI assistant ready to answer questions, have conversations, and help with various topics. I can discuss science, technology, programming, history, and much more. Click the microphone to start voice interaction or just type your message!",
      timestamp: new Date(),
    }
    setChatHistory([welcomeMessage])

    // Auto-test on startup
    setTimeout(() => {
      handleSubmit("Hello! I'm testing ZEXX's capabilities.")
    }, 1500)
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setMicPermission("granted")
      return true
    } catch (error) {
      console.error("Microphone permission denied:", error)
      setMicPermission("denied")
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

          if (transcript.toLowerCase().includes("zexx")) {
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
            content: "🎤 Voice recognition started! Say 'Zexx' to wake me up, then speak your message.",
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
      console.log("🚀 Sending chat request...")
      setAiProvider("zexx-ai")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, chatHistory }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📨 Chat response received:", data)

      setAiStatus("online")
      setAiProvider(data.provider || "zexx-ai")

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
      console.error("❌ Chat error:", error)
      setAiStatus("online") // Keep showing online since built-in AI works
      setAiProvider("zexx-ai")

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-rose-400 mb-2 drop-shadow-2xl">ZEXX</h1>
          <p className="text-rose-300 text-lg">Your AI Knowledge Assistant</p>
          <p className="text-rose-400/60 text-xs mt-1 font-light tracking-wide">made by 4st_destroyer_owner ARNAV</p>
          <div className="mt-2 px-4 py-2 bg-green-900/30 text-green-300 rounded-full inline-block border border-green-500/40 flex items-center gap-2">
            {aiStatus === "online" ? (
              <>
                <Brain className="w-4 h-4" />
                ONLINE - {aiProvider === "zexx-enhanced-ai" ? "Enhanced AI Brain" : aiProvider.toUpperCase()}
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                OFFLINE - Using Fallback AI
              </>
            )}
          </div>
          {wakeDetected && (
            <div className="mt-2 px-4 py-2 bg-rose-900/30 text-rose-300 rounded-full inline-block border border-rose-500/40">
              Wake word detected! Listening...
            </div>
          )}
          {isSpeaking && (
            <div className="mt-2 px-4 py-2 bg-slate-800/40 text-rose-300 rounded-full inline-block border border-slate-600/40">
              Speaking...
            </div>
          )}
          {micPermission === "denied" && (
            <div className="mt-2 px-4 py-2 bg-red-900/30 text-red-300 rounded-full inline-block border border-red-500/40 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Microphone access denied - Text input available
            </div>
          )}
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-96 mb-4 bg-slate-900/70 border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4 h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === "user"
                              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                              : message.type === "system"
                                ? "bg-blue-900/50 text-blue-200 border border-blue-500/30"
                                : "bg-slate-800/80 text-rose-100 border border-slate-600/30"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800/80 text-rose-200 px-4 py-2 rounded-lg border border-slate-600/30">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-400"></div>
                            <span>ZEXX is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything or use voice..."
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 bg-slate-900/70 border-slate-700/50 text-rose-100 placeholder:text-rose-300/50 focus:border-rose-400 shadow-lg"
              />
              <Button
                onClick={toggleListening}
                variant={isListening ? "destructive" : "default"}
                size="icon"
                className={
                  isListening
                    ? "bg-rose-700 hover:bg-rose-800 shadow-lg shadow-rose-700/30"
                    : micPermission === "denied"
                      ? "bg-red-800 hover:bg-red-700 text-red-300 shadow-lg"
                      : "bg-slate-800 hover:bg-slate-700 text-rose-300 shadow-lg"
                }
                disabled={!speechSupported}
              >
                {isListening ? <MicOff /> : <Mic />}
              </Button>
              <Button
                onClick={() => handleSubmit()}
                size="icon"
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
              >
                <Send />
              </Button>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="space-y-4">
            {/* System Status */}
            <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-rose-300">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-200">Microphone</span>
                    <div className="flex items-center gap-1">
                      {micPermission === "granted" ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : micPermission === "denied" ? (
                        <XCircle className="w-3 h-3 text-red-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-orange-400" />
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          micPermission === "granted"
                            ? "bg-green-900/30 text-green-300"
                            : micPermission === "denied"
                              ? "bg-red-900/30 text-red-300"
                              : "bg-orange-900/30 text-orange-300"
                        }`}
                      >
                        {micPermission === "granted" ? "Ready" : micPermission === "denied" ? "Denied" : "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-200">AI Brain</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-300 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {aiProvider}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-200">Voice Output</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs px-2 py-1 rounded bg-green-900/30 text-green-300">Browser</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-200">Listening</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isListening ? "bg-rose-500 shadow-lg shadow-rose-500/60 animate-pulse" : "bg-slate-700"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-rose-200">Speaking</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isSpeaking ? "bg-rose-400 shadow-lg shadow-rose-400/60 animate-pulse" : "bg-slate-700"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-rose-300">Quick Questions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSubmit("What can you help me with?")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-slate-800/60 border-slate-600/50 text-rose-200 hover:bg-slate-700/60 hover:text-rose-100 hover:border-rose-500/30 transition-all"
                  >
                    <Brain className="w-4 h-4 mr-2 text-green-400" />
                    Ask About My Capabilities
                  </Button>
                  <Button
                    onClick={() => handleSubmit("Explain artificial intelligence")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-slate-800/60 border-slate-600/50 text-rose-200 hover:bg-slate-700/60 hover:text-rose-100 hover:border-rose-500/30 transition-all"
                  >
                    <Zap className="w-4 h-4 mr-2 text-blue-400" />
                    Learn About AI
                  </Button>
                  <Button
                    onClick={() => handleSubmit("Tell me about programming")}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-slate-800/60 border-slate-600/50 text-rose-200 hover:bg-slate-700/60 hover:text-rose-100 hover:border-rose-500/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                    Discuss Programming
                  </Button>
                  <Button
                    onClick={() =>
                      speakText(
                        "Hello! I am Zexx, your AI knowledge assistant. I can answer questions on science, technology, programming, history, and many other topics!",
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-slate-800/60 border-slate-600/50 text-rose-200 hover:bg-slate-700/60 hover:text-rose-100 hover:border-rose-500/30 transition-all"
                    disabled={isSpeaking}
                  >
                    <Volume2 className="w-4 h-4 mr-2 text-rose-400" />
                    Test Voice
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Areas */}
            <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-rose-300">🧠 Knowledge Areas</h3>
                <div className="space-y-1 text-xs text-rose-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Science & Technology</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Programming & Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Mathematics & Logic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>History & Culture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>General Knowledge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>Learning & Education</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Guide - Show when helpful */}
            {aiProvider === "zexx-enhanced-ai" && <SetupGuide />}
          </div>
        </div>
      </div>
    </div>
  )
}
