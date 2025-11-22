import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "HEAVEN NETWORK - Hacker Terminal",
  description: "Advanced AI Terminal Interface for Ethical Hackers",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${jetbrainsMono.style.fontFamily};
  --font-mono: ${jetbrainsMono.variable};
}
        `}</style>
      </head>
      <body className="bg-black text-green-400 scanlines">{children}</body>
    </html>
  )
}
