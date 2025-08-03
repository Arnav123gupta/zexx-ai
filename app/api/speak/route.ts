import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    // Always use browser fallback for reliability
    console.log("Using browser speech synthesis for maximum compatibility")

    return NextResponse.json(
      {
        error: "Using browser speech synthesis",
        fallback: true,
        text: text,
      },
      { status: 200 },
    )
  } catch (error) {
    console.log("Speech API error:", error)

    return NextResponse.json(
      {
        error: "Speech service unavailable",
        fallback: true,
        text: "Hello! I am Zexx, your AI assistant.",
      },
      { status: 200 },
    )
  }
}
