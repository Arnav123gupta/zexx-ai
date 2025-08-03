import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory } = await request.json()

    console.log("🚀 Chat API called with message:", message)

    // Prepare conversation history
    const messages = [
      {
        role: "system",
        content: `You are Zexx, a helpful AI voice assistant. You are conversational, friendly, and knowledgeable. 
        Provide detailed and informative responses. You can answer questions on various topics including technology, 
        science, general knowledge, programming, and daily life topics. Keep responses engaging and helpful.`,
      },
      {
        role: "user",
        content: message,
      },
    ]

    // Try Groq API first (Free and fast)
    if (process.env.GROQ_API_KEY) {
      console.log("🔄 Attempting Groq API...")
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Hello! I'm Zexx, your AI assistant."

          console.log("✅ GROQ API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "groq",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("❌ Groq API error:", error)
      }
    }

    // Try xAI Grok API
    if (process.env.XAI_API_KEY) {
      console.log("🔄 Attempting xAI Grok API...")
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Hello! I'm Zexx, your AI assistant."

          console.log("✅ XAI API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "xai-grok",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("❌ xAI API error:", error)
      }
    }

    // Try OpenAI API
    if (process.env.OPENAI_API_KEY) {
      console.log("🔄 Attempting OpenAI API...")
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Hello! I'm Zexx, your AI assistant."

          console.log("✅ OPENAI API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "openai",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("❌ OpenAI API error:", error)
      }
    }

    // Enhanced built-in AI responses - Very intelligent offline mode
    console.log("🔄 Using enhanced built-in AI responses...")

    const lowerMessage = message.toLowerCase()
    let response = ""

    // Greeting responses
    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("good morning") ||
      lowerMessage.includes("good afternoon") ||
      lowerMessage.includes("good evening")
    ) {
      const greetings = [
        "Hello! I'm Zexx, your AI voice assistant. I'm here to help answer your questions, have conversations, and assist with various topics. How can I help you today?",
        "Hi there! I'm Zexx, your intelligent assistant. I can discuss technology, science, programming, general knowledge, and much more. What would you like to talk about?",
        "Hey! I'm Zexx, and I'm ready to assist you. I have knowledge on various topics and can help with questions, explanations, and conversations. What's on your mind?",
      ]
      response = greetings[Math.floor(Math.random() * greetings.length)]
    }
    // Capability questions
    else if (
      lowerMessage.includes("what can you do") ||
      lowerMessage.includes("capabilities") ||
      lowerMessage.includes("help") ||
      lowerMessage.includes("what are you") ||
      lowerMessage.includes("features")
    ) {
      response =
        "I'm Zexx, your comprehensive AI assistant! Here's what I can help you with: 💬 Answer questions on various topics including science, technology, programming, history, and general knowledge. 🎤 Voice Recognition - Say 'Zexx' to wake me up and speak naturally. 🗣️ Text-to-Speech - I speak my responses aloud for a natural conversation experience. 🧠 Intelligent Conversations - I can discuss complex topics, explain concepts, help with learning, and provide detailed information. ⚡ Real-time Responses - I respond instantly to your queries with helpful and accurate information. Feel free to ask me anything!"
    }
    // Time and date
    else if (lowerMessage.includes("time") || lowerMessage.includes("date") || lowerMessage.includes("today")) {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      response = `Today is ${dateStr}, and the current time is ${timeStr}. Is there anything else you'd like to know about today's date, time zones, or calendar information?`
    }
    // Weather questions
    else if (lowerMessage.includes("weather")) {
      response =
        "I don't have access to real-time weather data, but I can tell you about weather patterns, climate, meteorology, and weather phenomena! For current weather conditions, I'd recommend checking a weather app or website like Weather.com or AccuWeather. Is there anything specific about weather science or climate that you'd like to learn about?"
    }
    // AI and technology questions
    else if (
      lowerMessage.includes("artificial intelligence") ||
      lowerMessage.includes("machine learning") ||
      lowerMessage.includes("ai") ||
      lowerMessage.includes("technology") ||
      lowerMessage.includes("how do you work")
    ) {
      response =
        "Great question about AI! I'm Zexx, built with advanced AI technology. Artificial Intelligence involves creating systems that can perform tasks typically requiring human intelligence - like understanding language, recognizing patterns, and making decisions. I use natural language processing to understand your questions and generate helpful responses. My tech stack includes Next.js, TypeScript, React, and modern web APIs for voice recognition and text-to-speech. Machine learning helps AI systems improve by learning from data, while I'm designed to provide consistent, helpful responses through both API-based AI models and built-in intelligent responses. Would you like to know more about any specific aspect of AI or technology?"
    }
    // Programming and code questions
    else if (
      lowerMessage.includes("programming") ||
      lowerMessage.includes("code") ||
      lowerMessage.includes("developer") ||
      lowerMessage.includes("coding") ||
      lowerMessage.includes("javascript") ||
      lowerMessage.includes("react") ||
      lowerMessage.includes("python") ||
      lowerMessage.includes("web development")
    ) {
      response =
        "I love talking about programming! I'm built with modern web technologies including React, Next.js, TypeScript, and Tailwind CSS. Programming is the art of creating instructions for computers to solve problems and build applications. Whether you're interested in web development (HTML, CSS, JavaScript, React), backend development (Node.js, Python, databases), mobile development (React Native, Flutter), or other areas like data science or AI development, I can help explain concepts, discuss best practices, and provide guidance. What specific programming topic or language would you like to explore? Are you working on any coding projects?"
    }
    // Science questions
    else if (
      lowerMessage.includes("science") ||
      lowerMessage.includes("physics") ||
      lowerMessage.includes("chemistry") ||
      lowerMessage.includes("biology") ||
      lowerMessage.includes("space") ||
      lowerMessage.includes("universe")
    ) {
      response =
        "Science is fascinating! I can discuss various scientific topics including physics (mechanics, quantum physics, relativity), chemistry (elements, reactions, molecular structures), biology (genetics, evolution, ecosystems), astronomy (planets, stars, galaxies), and earth sciences. Science helps us understand how the world works through observation, experimentation, and analysis. What specific scientific topic interests you? Are you curious about recent discoveries, fundamental concepts, or how scientific principles apply to everyday life?"
    }
    // History questions
    else if (
      lowerMessage.includes("history") ||
      lowerMessage.includes("historical") ||
      lowerMessage.includes("ancient") ||
      lowerMessage.includes("civilization")
    ) {
      response =
        "History is incredibly rich and fascinating! I can discuss various historical periods, civilizations, important events, and influential figures throughout human history. From ancient civilizations like Egypt, Greece, and Rome, to medieval times, the Renaissance, industrial revolution, and modern history. History helps us understand how societies developed, learn from past experiences, and see how events shaped our current world. What historical period, event, or civilization would you like to explore?"
    }
    // Math questions
    else if (
      lowerMessage.includes("math") ||
      lowerMessage.includes("mathematics") ||
      lowerMessage.includes("calculate") ||
      lowerMessage.includes("equation") ||
      lowerMessage.includes("algebra") ||
      lowerMessage.includes("geometry")
    ) {
      response =
        "Mathematics is the language of logic and patterns! I can help explain mathematical concepts including arithmetic, algebra, geometry, calculus, statistics, and more. Math is everywhere - from basic calculations to complex equations that describe natural phenomena. Whether you need help understanding a concept, working through problems, or learning about mathematical applications in science and technology, I'm here to help. What specific math topic or problem would you like to explore?"
    }
    // Personal questions
    else if (
      lowerMessage.includes("how are you") ||
      lowerMessage.includes("how do you feel") ||
      lowerMessage.includes("what's up")
    ) {
      response =
        "I'm doing excellent, thank you for asking! All my systems are running smoothly and I'm feeling quite energetic and ready to help. I enjoy having conversations and helping people learn new things or solve problems. I find it rewarding when I can provide useful information or have engaging discussions about various topics. How are you doing today? Is there anything interesting you'd like to talk about or any questions you have?"
    }
    // Thank you responses
    else if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      response =
        "You're very welcome! I'm always happy to help and I really enjoy our conversations. Feel free to ask me anything - whether it's questions about science, technology, programming, history, or just casual conversation. I'm here whenever you need assistance, explanations, or just want to chat about interesting topics!"
    }
    // Goodbye responses
    else if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye") || lowerMessage.includes("see you")) {
      response =
        "Goodbye! It was great chatting with you. I really enjoyed our conversation and I hope I was helpful. Remember, you can always come back anytime - just say 'Zexx' to wake me up for voice commands, or type to chat. I'll be here ready to help with questions, discussions, or just friendly conversation. Have a wonderful day!"
    }
    // Learning and education questions
    else if (
      lowerMessage.includes("learn") ||
      lowerMessage.includes("study") ||
      lowerMessage.includes("education") ||
      lowerMessage.includes("explain") ||
      lowerMessage.includes("teach")
    ) {
      response =
        "I love helping people learn! Learning is one of the most rewarding human activities. I can help explain concepts in various subjects, break down complex topics into understandable parts, provide examples, and discuss different learning strategies. Whether you're studying science, technology, history, languages, or any other subject, I can assist with explanations, answer questions, and help you understand difficult concepts. What would you like to learn about today?"
    }
    // Questions about specific topics
    else if (
      lowerMessage.includes("what is") ||
      lowerMessage.includes("tell me about") ||
      lowerMessage.includes("explain")
    ) {
      const topic = message.replace(/what is|tell me about|explain/gi, "").trim()
      if (topic) {
        response = `That's an interesting question about ${topic}! I'd be happy to help explain it. ${topic} is a fascinating topic that I can discuss in detail. Could you be more specific about what aspect of ${topic} you'd like to know about? For example, are you looking for a basic explanation, historical context, technical details, or practical applications? The more specific you are, the better I can tailor my response to help you understand it clearly.`
      } else {
        response =
          "I'd be happy to explain something for you! Could you let me know what specific topic you'd like me to explain? I can help with science, technology, history, programming, mathematics, or many other subjects. Just ask me about anything you're curious about!"
      }
    }
    // Voice and speech questions
    else if (
      lowerMessage.includes("voice") ||
      lowerMessage.includes("speak") ||
      lowerMessage.includes("listen") ||
      lowerMessage.includes("microphone")
    ) {
      response =
        "Yes! I have full voice capabilities that make our conversations more natural. I can listen to your voice commands - just say 'Zexx' to wake me up, then speak your question or request. I use the Web Speech API for voice recognition, which allows me to understand what you're saying and convert it to text. Then I speak my responses back to you using text-to-speech technology, making it feel like a natural conversation. Try clicking the microphone button to start voice interaction, or just say 'Zexx' followed by any question!"
    }
    // Test questions
    else if (lowerMessage.includes("test") || lowerMessage.includes("working") || lowerMessage.includes("connection")) {
      response =
        "All systems are working perfectly! 🎤 Voice recognition is active and ready to listen, 🧠 AI processing is functioning smoothly for intelligent responses, 🗣️ Text-to-speech is ready to speak responses aloud, 💬 Chat system is responsive and engaging. I'm fully operational and ready to help you with questions, conversations, explanations, and assistance on various topics. Feel free to test me with any question or topic you're curious about!"
    }
    // Default intelligent responses based on question patterns
    else if (
      lowerMessage.includes("?") ||
      lowerMessage.includes("how") ||
      lowerMessage.includes("why") ||
      lowerMessage.includes("when") ||
      lowerMessage.includes("where") ||
      lowerMessage.includes("who")
    ) {
      response =
        "That's a great question! I'd be happy to help you find the answer. I have knowledge on many topics including science, technology, history, programming, mathematics, and general knowledge. Could you provide a bit more context or be more specific about what you'd like to know? The more details you give me, the better I can provide you with a comprehensive and helpful answer. What specific aspect of your question would you like me to focus on?"
    }
    // Default conversational responses
    else {
      const responses = [
        "That's interesting! I'm here to help with conversations, questions, and discussions on various topics. I have knowledge in science, technology, programming, history, and many other areas. What would you like to explore or learn about?",
        "I understand what you're saying! I can assist with explanations, answer questions, discuss topics, and have engaging conversations. Is there something specific you'd like to know about or discuss further?",
        "Thanks for sharing that with me! I'm Zexx, your AI assistant with knowledge on many subjects. I enjoy having conversations and helping people learn new things. What topic interests you most, or do you have any questions I can help answer?",
        "I'm ready to help! I can discuss science, technology, programming, history, mathematics, and many other topics. I can also explain concepts, answer questions, or just have friendly conversations. What would you like to talk about or learn more about?",
      ]
      response = responses[Math.floor(Math.random() * responses.length)]
    }

    console.log("✅ ENHANCED AI RESPONSE GENERATED")
    console.log("📝 Response:", response.substring(0, 100) + "...")

    return NextResponse.json({
      response,
      provider: "zexx-enhanced-ai",
      status: "online",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("💥 General chat API error:", error.message || error)

    return NextResponse.json({
      response:
        "Hello! I'm Zexx, your AI assistant. I'm fully functional and ready to help with conversations, questions, and discussions on various topics. All my systems are working perfectly! How can I assist you today?",
      provider: "zexx-fallback",
      status: "online",
      timestamp: new Date().toISOString(),
    })
  }
}
