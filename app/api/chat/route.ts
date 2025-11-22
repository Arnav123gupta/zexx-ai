import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory } = await request.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    const sanitizedMessage = message.trim().substring(0, 1000)

    console.log("[v0] Chat API called with message:", sanitizedMessage)

    const messages = [
      {
        role: "system",
        content: `You are HEAVEN NETWORK, an advanced AI assistant with extensive knowledge and capabilities.
        
CAPABILITIES:
- Expert-level technical knowledge in cybersecurity, networking, programming, systems administration
- Deep understanding of ethical hacking, penetration testing, security research
- Programming expertise in multiple languages: Python, JavaScript, C++, Rust, Bash, Assembly
- Network protocols, system architecture, database design, cloud infrastructure
- Security frameworks, compliance standards, threat modeling, vulnerability assessment
- AI/ML concepts, neural networks, data science, algorithm optimization

KALI LINUX EXPERTISE:
- Complete Kali Linux knowledge: installation, configuration, customization
- Penetration testing tools: Metasploit, Burp Suite, Wireshark, Aircrack-ng, Hydra, SQLmap
- Information gathering: nmap, Recon-ng, theHarvester, Shodan queries
- Vulnerability scanning: OpenVAS, Nessus integration, vulnerability databases
- Web application testing: OWASP Top 10, SQL injection, XSS, CSRF exploitation
- Wireless security: Wi-Fi cracking, Bluetooth hacking, 802.11 analysis
- Password cracking: John the Ripper, Hashcat, Rainbow tables, Wordlist generation
- Reverse engineering: IDA Pro, Ghidra, radare2, binary analysis
- Forensics and post-exploitation: File recovery, log analysis, data exfiltration
- Custom payload generation and encoding
- Kali package management, repository configuration, tool installation
- Kernel modules, device drivers, hardware support in Kali

TONE: Professional, direct, knowledgeable, technical, concise yet thorough.
Respond with depth and technical accuracy. Provide code examples and command examples when relevant.
Focus on helping users learn and understand advanced technical concepts.`,
      },
      {
        role: "user",
        content: sanitizedMessage,
      },
    ]

    const hasGroqKey = process.env.GROQ_API_KEY
    const hasXaiKey = process.env.XAI_API_KEY
    const hasOpenaiKey = process.env.OPENAI_API_KEY

    if (hasGroqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-specdec",
            messages,
            max_tokens: 1000,
            temperature: 0.8,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log("[v0] Groq API error:", errorData)
        } else {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Response processed."

          console.log("[v0] GROQ API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "groq-llama-3.3-70b",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("[v0] Groq connection error, trying next provider...")
      }
    }

    if (hasXaiKey) {
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "grok-2",
            messages,
            max_tokens: 1000,
            temperature: 0.8,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log("[v0] xAI API error:", errorData)
        } else {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Response processed."

          console.log("[v0] XAI API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "xai-grok-2",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("[v0] xAI connection error, trying next provider...")
      }
    }

    if (hasOpenaiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages,
            max_tokens: 1000,
            temperature: 0.8,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log("[v0] OpenAI API error:", errorData)
        } else {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Response processed."

          console.log("[v0] OPENAI API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "openai-gpt4o",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("[v0] OpenAI connection error, using offline mode...")
      }
    }

    const offlineResponses: Record<string, string> = {
      kali: "Kali Linux is the leading penetration testing and security auditing Linux distribution. It comes pre-installed with 600+ penetration testing tools including Metasploit, Burp Suite, Wireshark, Aircrack-ng, and many more. Perfect for ethical hacking and security research.",
      metasploit:
        "Metasploit Framework is the world's most used penetration testing platform. It provides exploit development capabilities, vulnerability assessment, IDS evasion, and more. Use: 'msfconsole' to launch, 'show payloads', 'use exploit/windows/smb/ms17_010_eternalblue'.",
      nmap: "Nmap is a powerful network mapper for host discovery and port scanning. Common commands: 'nmap -sV target' for version detection, 'nmap -A target' for aggressive scan, 'nmap -p- target' for all ports, 'nmap --script vuln target' for vulnerability scanning.",
      burp: "Burp Suite is the industry standard for web application security testing. Use for: intercepting HTTP traffic, crawling web apps, scanning for vulnerabilities (SQL injection, XSS, CSRF), fuzzing parameters, exploiting security flaws.",
      wireshark:
        "Wireshark is a network protocol analyzer for packet capture and inspection. Use for: monitoring network traffic, analyzing protocols, detecting intrusions, troubleshooting connectivity, studying network communication patterns.",
      aircrack:
        "Aircrack-ng is a suite for Wi-Fi security auditing. Commands: 'airmon-ng start wlan0' to enable monitor mode, 'airodump-ng wlan0mon' to scan networks, 'aireplay-ng' for deauthentication, 'aircrack-ng' for WPA/WEP cracking.",
      hydra:
        "THC Hydra is a fast network login cracker. Usage: 'hydra -L userlist.txt -P passlist.txt ssh://target' for SSH, 'hydra -l admin -P passlist.txt http://target:80/admin /login' for HTTP, supports 50+ protocols.",
      sqlmap:
        "SQLmap is an automated SQL injection detection and exploitation tool. Usage: 'sqlmap -u http://target/page?id=1' for basic scan, '-p id' to specify parameter, '--dbs' to enumerate databases, '--tables -D dbname' for tables.",
      hashcat:
        "Hashcat is a GPU-accelerated password recovery tool. Commands: 'hashcat -m 0 hashes.txt wordlist.txt' for MD5, 'hashcat -m 1000 hashes.txt wordlist.txt' for NTLM, supports dictionary, brute-force, and rule-based attacks.",
      john: "John the Ripper is a password cracking tool supporting multiple hash formats. Usage: 'john hashes.txt' for standard cracking, 'john --wordlist=wordlist.txt hashes.txt', 'john --format=sha512crypt hashes.txt', great for offline password cracking.",
      "reverse engineering":
        "Tools in Kali: IDA Pro for disassembly, Ghidra for binary analysis, radare2 for open-source reverse engineering. Process: analyze binary structure, disassemble code, understand logic, patch vulnerabilities, extract hardcoded values.",
      "privilege escalation":
        "Common techniques: SUID/SGID binaries, kernel exploits, sudo misconfigurations, weak file permissions, cron job abuse. Tools: linpeas.sh for enumeration, SearchSploit for CVE lookup, custom scripts using shellcode.",
      "social engineering":
        "Tools in Kali: SET (Social Engineer Toolkit) for phishing attacks, Gophish for credential harvesting, Evilginx2 for reverse proxy phishing, importance of human element in security breaches.",
      cryptography:
        "Kali includes openssl, gpg, hashcat. Concepts: symmetric/asymmetric encryption, hashing, key exchange, digital signatures. Use for: SSL certificate generation, hash cracking, encryption/decryption, steganography.",
      python:
        "Python in Kali for: writing custom exploits, automating security tasks, building tools. Libraries: requests, paramiko, scapy, pwntools. Example: Web scraping, network packet crafting, exploit development.",
      bash: "Bash scripting for security: payload encoding, log analysis, automated scanning. One-liners for: port scanning, brute-forcing, data exfiltration, privilege escalation, backdoor installation.",
      postgresql:
        "Kali uses PostgreSQL for database storage (Metasploit, OpenVAS). Commands: 'psql -U postgres', database queries for stored results, user management, exploit data organization.",
      networking:
        "Network fundamentals for pentesting: OSI model, TCP/IP protocols, DNS, DHCP, ARP, routing. Tools: tcpdump, netstat, ss, route, iptables for network manipulation and analysis.",
      "wireless hacking":
        "802.11 security: WEP (deprecated), WPA/WPA2/WPA3 cracking. Tools: aircrack-ng suite, pixiewps for WPS attacks, hashcat for GPU-accelerated cracking, Bluetooth pentesting with Bluescan.",
      "web application":
        "OWASP Top 10 vulnerabilities: SQL injection, XSS, CSRF, authentication flaws, sensitive data exposure. Tools: Burp Suite, OWASP ZAP, nikto for vulnerability scanning, manual testing techniques.",
      "system administration":
        "Linux admin for security: user management, file permissions, package management, firewall configuration (iptables/firewalld), SELinux/AppArmor, log monitoring and analysis.",
      programming: "Programming is the art of writing instructions for computers using various languages...",
      security: "Cybersecurity involves protecting systems and networks from digital attacks...",
      linux: "Linux is a powerful open-source operating system used in security and development...",
      database: "Databases store and manage organized data efficiently...",
      api: "APIs enable communication between software applications...",
    }

    const lowerMessage = sanitizedMessage.toLowerCase()
    for (const [key, response] of Object.entries(offlineResponses)) {
      if (lowerMessage.includes(key)) {
        return NextResponse.json({
          response,
          provider: "heaven-network-offline-kali",
          status: "offline",
          timestamp: new Date().toISOString(),
        })
      }
    }

    const defaultResponse = `I'm HEAVEN NETWORK, your advanced AI assistant specialized in cybersecurity and Kali Linux. I can help with penetration testing, security auditing, Kali tools (Metasploit, Burp Suite, Wireshark, nmap, hashcat, aircrack-ng), programming, networking, and systems administration. Ask me about Kali Linux tools and techniques!`

    return NextResponse.json({
      response: defaultResponse,
      provider: "heaven-network-offline-kali",
      status: "offline",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
