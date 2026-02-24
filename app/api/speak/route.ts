import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    // Always use browser fallback for reliability
    return NextResponse.json(
      {
        error: "Using browser speech synthesis",
        fallback: true,
        text: "Hello! I am NETWORK GPT, your penetration testing and bug bounty hunting AI assistant.",
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: "Speech service unavailable",
        fallback: true,
        text: "Hello! I am NETWORK GPT, your penetration testing and bug bounty hunting AI assistant.",
      },
      { status: 200 },
    )
  }
}
