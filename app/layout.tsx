import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegister } from "./service-worker-register"
import { InstallApp } from "@/components/install-app"
import { AppWrapper } from "@/components/app-wrapper"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Network AI - Advanced AI Terminal",
  description: "Advanced AI Terminal by Zexx Tech Stack - Professional AI chatbot with real-time responses and intelligent conversation.",
  generator: "Network AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NETWORK AI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#00ff88",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HN AI" />
        <meta name="msapplication-TileColor" content="#00ff88" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-navbutton-color" content="#00ff88" />
        <meta name="theme-color" content="#00ff88" />
        <style>{`
html {
  font-family: ${jetbrainsMono.style.fontFamily};
  --font-mono: ${jetbrainsMono.variable};
}
        `}</style>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            onError={(e) => {
              console.warn('[v0] Failed to load AdSense script:', e)
            }}
          />
        )}
      </head>
      <body className="bg-black text-green-400 scanlines relative">
        <AppWrapper>
          {children}
        </AppWrapper>
        <ServiceWorkerRegister />
        <InstallApp />
      </body>
    </html>
  )
}
