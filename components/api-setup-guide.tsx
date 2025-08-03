"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Key, Zap, Globe, Download } from "lucide-react"

export function ApiSetupGuide() {
  const apiProviders = [
    {
      name: "Cohere",
      description: "Free tier available, no credit card needed",
      url: "https://cohere.ai/",
      difficulty: "Easiest",
      icon: <Zap className="w-4 h-4" />,
      color: "text-green-400",
    },
    {
      name: "Groq",
      description: "Very fast responses, completely free",
      url: "https://console.groq.com/",
      difficulty: "Easy",
      icon: <Zap className="w-4 h-4" />,
      color: "text-blue-400",
    },
    {
      name: "Mistral AI",
      description: "European AI with free tier",
      url: "https://mistral.ai/",
      difficulty: "Easy",
      icon: <Globe className="w-4 h-4" />,
      color: "text-purple-400",
    },
    {
      name: "Together AI",
      description: "Free credits for open source models",
      url: "https://together.ai/",
      difficulty: "Easy",
      icon: <Globe className="w-4 h-4" />,
      color: "text-orange-400",
    },
    {
      name: "Ollama (Local)",
      description: "Run AI locally on your computer",
      url: "https://ollama.ai/",
      difficulty: "Advanced",
      icon: <Download className="w-4 h-4" />,
      color: "text-cyan-400",
    },
  ]

  return (
    <Card className="bg-slate-900/70 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-rose-300 flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-rose-200/80 mb-4">Choose any provider below to enable online AI mode:</p>
        {apiProviders.map((provider, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30"
          >
            <div className="flex items-center gap-3">
              <div className={provider.color}>{provider.icon}</div>
              <div>
                <div className="font-medium text-rose-200">{provider.name}</div>
                <div className="text-xs text-rose-300/70">{provider.description}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(provider.url, "_blank")}
              className="text-xs bg-slate-700/50 border-slate-600/50 text-rose-200 hover:bg-slate-600/50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Get Key
            </Button>
          </div>
        ))}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-200">
            💡 <strong>Tip:</strong> Start with Cohere or Groq for the easiest setup. Just sign up, get your API key,
            add it to .env.local, and restart the server!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
