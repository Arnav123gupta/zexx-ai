"use client"

import type React from "react"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface MessageRendererProps {
  content: string
  type: "user" | "ai"
}

export function MessageRenderer({ content, type }: MessageRendererProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Record<string, boolean>>({})

  const copyToClipboard = (text: string, blockId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBlocks((prev) => ({ ...prev, [blockId]: true }))
    setTimeout(() => {
      setCopiedBlocks((prev) => ({ ...prev, [blockId]: false }))
    }, 2000)
  }

  // Parse content for code blocks and commands
  const renderContent = () => {
    const parts: React.ReactNode[] = []
    const codeBlockRegex = /```(?:bash|sh|shell|cmd|command)?\n([\s\S]*?)```/g
    const commandRegex = /\$\s+([^\n]+)/g
    let lastIndex = 0
    let match

    // Handle code blocks
    const codeMatches = Array.from(content.matchAll(codeBlockRegex))
    const commandMatches = Array.from(content.matchAll(commandRegex))

    if (codeMatches.length > 0) {
      codeMatches.forEach((codeMatch, idx) => {
        const before = content.slice(lastIndex, codeMatch.index)
        if (before) {
          parts.push(
            <span key={`text-${idx}`} className="text-green-300">
              {before}
            </span>,
          )
        }

        const blockId = `code-${idx}`
        const codeContent = codeMatch[1].trim()

        parts.push(
          <div key={blockId} className="my-2 bg-black/50 rounded border border-cyan-500/30 overflow-hidden">
            <div className="flex items-center justify-between bg-black/80 px-3 py-2 border-b border-cyan-500/20">
              <span className="text-xs text-cyan-400">$ COMMAND</span>
              <button
                onClick={() => copyToClipboard(codeContent, blockId)}
                className="flex items-center gap-1 px-2 py-1 hover:bg-cyan-500/20 rounded transition-colors text-cyan-400 text-xs"
              >
                {copiedBlocks[blockId] ? (
                  <>
                    <Check size={14} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-green-300 overflow-x-auto font-mono text-sm">{codeContent}</pre>
          </div>,
        )

        lastIndex = codeMatch.index! + codeMatch[0].length
      })
    }

    // Handle inline commands ($ command)
    if (commandMatches.length > 0 && codeMatches.length === 0) {
      commandMatches.forEach((cmdMatch, idx) => {
        const before = content.slice(lastIndex, cmdMatch.index)
        if (before) {
          parts.push(
            <span key={`text-${idx}`} className="text-green-300">
              {before}
            </span>,
          )
        }

        const blockId = `cmd-${idx}`
        const cmdContent = cmdMatch[1].trim()

        parts.push(
          <div
            key={blockId}
            className="my-1 inline-flex items-center gap-2 bg-black/50 px-3 py-1 rounded border border-cyan-500/30 group"
          >
            <code className="text-green-300 font-mono text-sm">$ {cmdContent}</code>
            <button
              onClick={() => copyToClipboard(cmdContent, blockId)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-cyan-500/20 rounded"
              title="Copy command"
            >
              {copiedBlocks[blockId] ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} className="text-cyan-400" />
              )}
            </button>
          </div>,
        )

        lastIndex = cmdMatch.index! + cmdMatch[0].length
      })
    }

    // Add remaining content
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end" className="text-green-300">
          {content.slice(lastIndex)}
        </span>,
      )
    }

    // If no special formatting, just return plain text
    if (parts.length === 0) {
      return <span className={type === "user" ? "text-cyan-300" : "text-green-300"}>{content}</span>
    }

    return parts.length > 0 ? (
      parts
    ) : (
      <span className={type === "user" ? "text-cyan-300" : "text-green-300"}>{content}</span>
    )
  }

  return <div className="break-words">{renderContent()}</div>
}
