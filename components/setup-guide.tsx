"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Key, Zap, Search, Volume2, CheckCircle } from "lucide-react"

export function SetupGuide() {
  const setupOptions = [
    {
      name: "Groq API",
      description: "Free, very fast AI responses",
      url: "https://console.groq.com/",
      benefit: "Enhanced AI conversations",
      icon: <Zap className="w-4 h-4" />,
      color: "text-blue-400",
      priority: "Recommended",
    },
    {
      name: "Google Search API",
      description: "Real web search results",
      url: "https://console.cloud.google.com/",
      benefit: "Actual search results instead of links",
      icon: <Search className="w-4 h-4" />,
      color: "text-green-400",
      priority: "Useful",
    },
    {
      name: "xAI Grok API",
      description: "Advanced AI by Elon Musk's team",
      url: "https://console.x.ai/",
      benefit: "Cutting-edge AI responses",
      icon: <Zap className="w-4 h-4" />,
      color: "text-purple-400",
      priority: "Premium",
    },
    {
      name: "ElevenLabs Voice",
      description: "Premium text-to-speech",
      url: "https://elevenlabs.io/",
      benefit: "High-quality voice output",
      icon: <Volume2 className="w-4 h-4" />,
      color: "text-orange-400",
      priority: "Optional",
    },
  ]

  return (
    <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-rose-300 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Optional Enhancements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-200">
              HEAVEN NETWORK is fully functional without any setup!
            </span>
          </div>
          <p className="text-xs text-green-200/80">
            All core features work out of the box. Add API keys below only if you want enhanced capabilities.
          </p>
        </div>

        {setupOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
          >
            <div className="flex items-center gap-3">
              <div className={option.color}>{option.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-rose-200">{option.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      option.priority === "Recommended"
                        ? "bg-blue-900/30 text-blue-300"
                        : option.priority === "Useful"
                          ? "bg-green-900/30 text-green-300"
                          : option.priority === "Premium"
                            ? "bg-purple-900/30 text-purple-300"
                            : "bg-gray-900/30 text-gray-300"
                    }`}
                  >
                    {option.priority}
                  </span>
                </div>
                <div className="text-xs text-rose-300/70">{option.description}</div>
                <div className="text-xs text-rose-400/60 mt-1">→ {option.benefit}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(option.url, "_blank")}
              className="text-xs bg-slate-700/50 border-slate-600/50 text-rose-200 hover:bg-slate-600/50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Get Key
            </Button>
          </div>
        ))}

        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-200">
            💡 <strong>Quick Start:</strong> HEAVEN NETWORK works perfectly as-is! For the best experience, add a free
            Groq API key for enhanced AI responses. All other features work without any configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
