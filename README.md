# NETWORK GPT - Advanced Penetration Testing & Bug Bounty Hunting AI

Advanced AI assistant specialized in penetration testing, vulnerability assessment, bug bounty hunting, and offensive security research.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.8-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

## Features

- **Penetration Testing**: Complete lifecycle guidance from reconnaissance to post-exploitation
- **Bug Bounty Hunting**: Expert strategies for HackerOne, Bugcrowd, Intigriti, and other platforms
- **Hinglish Support**: Native Hindi-English language mixing for better communication
- **Multi-Provider AI**: Seamless fallback between Groq, Grok, and OpenAI models
- **Voice Interaction**: Real-time speech recognition and text-to-speech conversion
- **Media Upload**: Screenshot and image analysis for vulnerability assessment
- **Security Focused**: Built-in ethical guidelines and authorization verification
- **Extended Context**: 100,000 character limit for complex penetration testing queries

## Technology Stack

- **Frontend**: React 18 + Next.js 15.2.8 with TypeScript
- **Styling**: Tailwind CSS with terminal-inspired dark theme
- **AI Integration**: Groq, xAI (Grok), OpenAI via Vercel AI Gateway
- **Voice**: ElevenLabs API for speech synthesis
- **Speech Recognition**: Web Speech API for voice input
- **Deployment**: Vercel with automatic GitHub sync

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- API keys for:
  - Groq API
  - xAI (Grok) API
  - ElevenLabs API
  - Google Search API

### Installation

```bash
git clone https://github.com/Arnav123gupta/zexx-ai.git
cd zexx-ai
npm install
```

### Environment Setup

Create `.env.local` in the root directory:

```env
GROQ_API_KEY=your_groq_api_key
XAI_API_KEY=your_xai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
```

### Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run start
```

## API Documentation

### POST /api/chat

Send penetration testing or bug bounty hunting queries.

**Request:**
```json
{
  "message": "Your penetration testing query",
  "media": [{"name": "screenshot.png", "type": "image/png"}]
}
```

**Response:**
```json
{
  "response": "Detailed expert response...",
  "provider": "groq-70b",
  "language": "english",
  "timestamp": "2026-02-24T10:30:00Z"
}
```

### POST /api/speak

Convert response text to speech.

**Request:**
```json
{
  "text": "Your text to convert to speech"
}
```

## Usage Examples

### Penetration Testing
```
"Guide me through subdomain enumeration using Shodan and Recon-ng"
```

### Bug Bounty Strategy
```
"Common authorization bypass vulnerabilities in modern web frameworks"
```

### Hinglish Query
```
"Burp Suite mein intruder attack ke liye payload generation kaise karenge?"
```

### Media Analysis
Upload screenshot → "Analyze this HTTP request for CSRF vulnerability"

## Security

- **Authorization Required**: All penetration testing assumes explicit written authorization
- **Ethical Guidelines**: Built-in reminders about responsible disclosure
- **Compliance Support**: NIST, CIS, ISO 27001, PCI DSS, HIPAA, SOC 2 frameworks
- **Input Validation**: All API endpoints validate and sanitize user input
- **Security Headers**: Implemented X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

## Limitations

- Authorized testing only - unauthorized access is illegal
- Information accuracy depends on training data currency
- Always verify tool recommendations with latest versions
- Image analysis quality depends on screenshot clarity
- Language detection optimized for English and Hinglish

## Deployment

### Deploy to Vercel

```bash
git push origin main
```

Changes automatically deploy to Vercel via GitHub integration.

### Manual Deployment

```bash
npm run build
vercel --prod
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues or questions:
- Open a GitHub Issue
- Check existing documentation
- Review API endpoint specifications

## License

This project is provided for educational and authorized security testing purposes only.

## Creator

**ARNAV** - Security Researcher & AI Developer

## Disclaimer

NETWORK GPT is designed for authorized penetration testing and bug bounty hunting only. Users must have explicit written permission before conducting any security assessments. Unauthorized access to computer systems is illegal. Always comply with applicable laws and ethical guidelines.
