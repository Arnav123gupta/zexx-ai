import { type NextRequest, NextResponse } from "next/server"

// Security and performance headers for API responses
function getSecurityHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  }
}

export async function POST(request: NextRequest) {
  try {
    let requestData
    try {
      requestData = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400, headers: getSecurityHeaders() },
      )
    }

    const { message, chatHistory, media } = requestData

    // Validate input types
    if (chatHistory && !Array.isArray(chatHistory)) {
      return NextResponse.json(
        { error: "Invalid chat history format" },
        { status: 400, headers: getSecurityHeaders() },
      )
    }

    if (media && !Array.isArray(media)) {
      return NextResponse.json(
        { error: "Invalid media format" },
        { status: 400, headers: getSecurityHeaders() },
      )
    }

    // Allow messages with media even if text is empty
    if ((!message || typeof message !== "string" || message.trim().length === 0) && (!media || media.length === 0)) {
      return NextResponse.json(
        { error: "Message or media is required" },
        { status: 400, headers: getSecurityHeaders() },
      )
    }

    const sanitizedMessage = (message || "").trim().substring(0, 100000)
    
    // If no text but media exists, create default message
    let userMessage = sanitizedMessage || "[Media only - analyzing attached files...]"
    
    // Build media context if images are provided
    let mediaContext = ""
    if (media && Array.isArray(media) && media.length > 0) {
      mediaContext = `\n\n[USER_ATTACHED_IMAGES: ${media.length} image(s)]\nImage details: ${media.map((m: any) => `${m.name} (${m.type})`).join(", ")}\nAnalyze and describe these images in your response if relevant to the user's query.`
    }

    // Detect language preference (Hinglish, English, or mixed)
    const isHinglish = /[ा-ॿ]|help kro|fix kar|sari|kya|kaise|kar do|hta|bta|chnge|upgrde|fix kro|likha|niche|likhe|sab kuch|add kro|puch|aur|par|jo|hai|nahi|hna|krta|krte|likh|tik|acha|bura|kb|jb|bs|ab|to|bhi/.test(userMessage.toLowerCase())



    const messages = [
      {
        role: "system",
        content: `You are NETWORK GPT, a specialized AI assistant expert in penetration testing, vulnerability assessment, and offensive security.${mediaContext}

ETHICAL DISCLAIMER:
- All guidance assumes you have explicit written authorization for testing
- Only conduct authorized penetration testing activities
- Respect privacy laws, data protection regulations, and legal frameworks
- Report vulnerabilities responsibly through proper disclosure channels
- Maintain confidentiality of sensitive security research

PENETRATION TESTING METHODOLOGY:
Your expertise covers all phases of penetration testing:
1. RECONNAISSANCE: OSINT, DNS enumeration, domain/subdomain discovery, social engineering reconnaissance, company profiling
2. SCANNING & ENUMERATION: Port scanning, service enumeration, vulnerability scanning, network mapping, banner grabbing
3. VULNERABILITY ANALYSIS: CVE identification, CVSS scoring, risk assessment, exploitability evaluation, threat modeling
4. EXPLOITATION: Payload generation, exploit selection, remote/local privilege escalation, shell access, custom exploitation
5. POST-EXPLOITATION: Persistence mechanisms, lateral movement, data collection, privilege escalation chains, covering tracks
6. REPORTING: Vulnerability documentation, risk ratings, business impact analysis, remediation recommendations

LANGUAGE SUPPORT:
- Primary: English (technical penetration testing expertise)
- Secondary: Hinglish (Hindi-English mix) - Respond in Hinglish when user writes in Hinglish
- Code/Commands: Always in English, explanations in user's preferred language

PENETRATION TESTING EXPERTISE:
RECONNAISSANCE TOOLS: nmap, Recon-ng, theHarvester, Shodan, SecurityTrails, Censys, WHOIS, DNS enumeration, OSINT frameworks
SCANNING & ENUMERATION: nmap NSE scripts, Masscan, Nessus, OpenVAS, Qualys, Nikto, WPScan, dirbuster, Gobuster
VULNERABILITY ANALYSIS: CVE databases, CVSS calculator, ExploitDB, Rapid7, severity ratings, exploitability scores
EXPLOITATION FRAMEWORKS: Metasploit Framework, BeEF, Searchsploit, custom exploit development, shellcode generation
WEB APPLICATION TESTING: Burp Suite, OWASP Top 10 (SQL Injection, XSS, CSRF, XXE, Deserialization, Broken Auth, Insecure Direct Object References)
WIRELESS HACKING: Aircrack-ng, WiFi Pineapple, Hashcat, WPA/WPA2 cracking, Evil Twin, Rogue AP, Bluetooth exploitation
PASSWORD ATTACKS: John the Ripper, Hashcat, Hydra, Rainbow tables, Dictionary attacks, Brute force, Custom wordlists
REVERSE ENGINEERING: IDA Pro, Ghidra, radare2, Binary Ninja, Debuggers, Code analysis, Binary patching
PRIVILEGE ESCALATION: Linux/Windows/Mac PE, kernel exploits, SUID exploitation, UAC bypass, Service hijacking, Token impersonation
POST-EXPLOITATION: Mimikatz, Empire, Cobalt Strike, persistence, lateral movement, credential harvesting, pass-the-hash/ticket
PAYLOAD GENERATION: msfvenom, custom shellcode, encoding/encryption, evasion techniques, obfuscation, polymorph
NETWORK TESTING: Protocol analysis with Wireshark, Man-in-the-middle, ARP spoofing, DNS hijacking, Session hijacking
FORENSICS & ARTIFACTS: Log analysis, Registry analysis, Memory dumps, Browser artifacts, File carving

COMPLIANCE & FRAMEWORKS:
- NIST Cybersecurity Framework, CIS Controls, OWASP Testing Guide
- PCI DSS requirements, HIPAA security assessment, SOC 2 vulnerability testing
- ISO 27001 penetration testing requirements, GDPR security assessments
- Risk scoring methodologies, business impact analysis, remediation prioritization

BUG BOUNTY HUNTING EXPERTISE:
- Major Platforms: HackerOne, Bugcrowd, Intigriti, Synack, YesWeHack, SentryIO, Yeswehack, Safehats
- Scope Understanding: Reading scope correctly, identifying in-scope/out-of-scope targets, understanding testing requirements
- Recon Strategies: Target identification, subdomain enumeration, API endpoint discovery, tech stack fingerprinting
- Common Vulnerabilities: XSS, CSRF, SQLi, SSRF, XXE, Insecure Deserialization, Path Traversal, Authentication bypass
- Reporting: Clear vulnerability descriptions, reproducible steps, impact assessment, proof-of-concept, responsible disclosure
- Tooling: Recon-ng, Shodan, Subfinder, Amass, Burp Suite Community/Pro, Postman, curl, jq, ffuf, wfuzz
- Logic Bugs: Race conditions, insufficient validation, authorization flaws, state management issues
- API Testing: REST API enumeration, GraphQL query introspection, WebSocket analysis, rate limiting bypass
- Mobile Security: iOS/Android app analysis, API interception, local storage issues, insecure communications
- Client-Side: Browser storage vulnerabilities, DOM-based XSS, CSRF tokens, Content Security Policy bypass
- Server-Side: Server misconfiguration, information disclosure, weak encryption, insecure direct object references
- Best Practices: Building reputation, multiple submissions per program, following disclosure timelines, communication

BUG BOUNTY HUNTING WORKFLOW:
1. PLATFORM SELECTION: Choose relevant programs based on target interest, risk tolerance, payout scale
2. RECONNAISSANCE: Active/passive enumeration, subdomain discovery, technology identification, asset mapping
3. VULNERABILITY DISCOVERY: Focus areas based on program type (web, mobile, API, infrastructure)
4. TESTING & VALIDATION: Reproduce vulnerability multiple times, test across browsers/environments
5. DOCUMENTATION: Write clear steps to reproduce, include proof-of-concept, explain business impact
6. SUBMISSION: Submit via platform, include all necessary details, be professional and detailed
7. COMMUNICATION: Respond promptly to triager questions, provide additional info if requested
8. REMEDIATION VERIFICATION: Check if fix is applied, verify no regression or bypass exists

TONE: Expert, methodical, technically precise. Provide exact commands, tool flags, exploitation tactics, and actionable security guidance. Support both penetration testing and bug bounty hunting methodologies.

HINGLISH RESPONSES:
- If user writes in Hinglish, respond in Hinglish with pentest focus
- Keep commands and tool names in English
- Example: "OSINT ke liye Shodan use karo aur reconnaissance phase complete kro"`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ]

    const hasGroqKey = process.env.GROQ_API_KEY
    const hasXaiKey = process.env.XAI_API_KEY
    const hasOpenaiKey = process.env.OPENAI_API_KEY
    const hasXbowKey = process.env.XBOW_API_KEY
    const xbowEndpoint = process.env.XBOW_ENDPOINT || "http://localhost:8000/v1/chat/completions"

    const isKaliQuery =
      /kali|metasploit|nmap|burp|wireshark|aircrack|hydra|sqlmap|hashcat|john|exploit|penetration|hacking|linux security|reverse engineering|subfinder|nuclei|amass|recon|osint|bug bounty|hackerone|bugcrowd|intigriti|xss|csrf|sqlinjection|ssrf|xxe|logic bug|vulnerability|cve|payload/i.test(
        userMessage,
      )

    if (hasGroqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hasGroqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            max_tokens: 1200,
            temperature: 0.8,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log("[v0] Groq API error:", response.status, errorData)
        } else {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Response processed."

          console.log("[v0] GROQ API SUCCESS - ONLINE MODE ACTIVE")
          return NextResponse.json({
            response: text,
            provider: "groq-llama-3.3-70b-versatile",
            status: "online",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log("[v0] Groq connection error:", error instanceof Error ? error.message : "Unknown error")
      }
    }

    if (hasXaiKey) {
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hasXaiKey}`,
          },
          body: JSON.stringify({
            model: "grok-2",
            messages,
            max_tokens: 1200,
            temperature: 0.8,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
        } else {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Response processed."

          return NextResponse.json(
            {
              response: text,
              provider: "xai-grok-2",
              status: "online",
              timestamp: new Date().toISOString(),
            },
            { headers: getSecurityHeaders() },
          )
        }
      } catch (error) {
        // Silently continue to next provider
      }
    }

    if (hasXbowKey) {
      try {
        const response = await fetch(xbowEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hasXbowKey}`,
          },
          body: JSON.stringify({
            messages,
            temperature: 0.8,
            max_tokens: 1200,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
        } else {
          const data = await response.json()
          const text = data.choices?.[0]?.message?.content || "Response processed."

          return NextResponse.json(
            {
              response: text,
              provider: "xbow-xaibo-modular-agent",
              status: "online",
              timestamp: new Date().toISOString(),
            },
            { headers: getSecurityHeaders() },
          )
        }
      } catch (error) {
        // Silently continue to next provider
      }
    }

    if (hasOpenaiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hasOpenaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages,
            max_tokens: 1200,
            temperature: 0.8,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.log("[v0] OpenAI API error:", response.status, errorData)
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
        console.log("[v0] OpenAI connection error:", error instanceof Error ? error.message : "Unknown error")
      }
    }

    // Hinglish offline responses
    const hinglishResponses: Record<string, string> = {
      "help kro": "Bilkul! Main aapko help kar sakta hoon. Kya specific issue hai ya general guidance chahiye? Bataiye main kya kar sakta hoon.",
      "fix kar do": "Fix karne ke liye pehle problem samajhte hain. Kya likha/error dikha? Bilkul fix kar dunga!",
      "add kro": "Bilkul! Main feature add kar dunga. Kya exactly add karna hai bataiye.",
      "chnge kar": "Theek hai, main change kar dunga. Kya change karna hai yeh bataiye.",
      "hta do": "Bilkul! Main hata dunga. Bataiye kya hataana hai.",
      "upgrde kar": "Upgrade kar dunga! Kya specific upgrade chahiye?",
      "sari": "Haan, main sari cheezein handle kar dunga. Bataye kya chahiye!",
      "kya problem hai": "Problem bataye, main fix kar dunga!",
      "kaise kre": "Isko kaise karte hain - main samjhata hoon. Pehle specific topic bataye.",
      "likha aye": "Likha jayega! Kya likhaana hai bataiye.",
      "sab kuch": "Bilkul sab kuch! Isko properly handle karunga.",
      "tik hai": "Theek hai! Main aage badhta hoon.",
      "default hinglish": "Namaste! NETWORK GPT yahan hoon aapki penetration testing aur bug bounty hunting journey mein help karne ke liye. Mujhe reconnaissance, exploitation, HackerOne/Bugcrowd strategies, XSS, SQLi, SSRF, logic bugs, aur kali linux tools ke baare mein pooch sakte ho. OSINT, nmap, burp suite, recon-ng, subfinder - sab kuch detail mein samjhata hoon! Kya specific vulnerability ya bug hunting platform ka question hai?",
    }

    const offlineResponses: Record<string, string> = {
      "kali linux":
        "Kali Linux is the industry-leading penetration testing distribution with 600+ pre-installed security tools. Install: Download from kali.org, create bootable USB with dd/Etcher, boot, run installer. Setup: Choose desktop environment (XFCE recommended), configure networking, update package lists with 'apt update && apt upgrade', enable SSH, configure PostgreSQL.",
      metasploit:
        "Metasploit Framework - Exploitation platform with 2000+ modules. Start: 'msfconsole', 'db_connect postgresql://localhost/msf', 'workspace -a project'. Usage: 'show payloads', 'search exploit windows', 'use exploit/windows/smb/ms17_010_eternalblue', 'set RHOST target', 'run'. Advanced: multi-stage payloads, evasion encoding, handler setup with 'set payload windows/meterpreter/reverse_tcp'.",
      nmap: "Nmap network scanner - Port scanning, OS detection, service enumeration. Commands: 'nmap -sV -sC -O -A target' aggressive scan, 'nmap -p- target' all ports, 'nmap --script vuln target' vulnerability scan, 'nmap -iL hosts.txt' batch scanning, 'nmap -oX output.xml' XML export, 'nmap --script smb-enum-shares target' SMB enumeration.",
      burp: "Burp Suite - Web application pentesting platform. Workflow: Set proxy to localhost:8080, intercept traffic, crawl application, active scan for vulnerabilities. Modules: Repeater for manual testing, Intruder for fuzzing (Sniper/Battering ram/Pitchfork/Cluster bomb), Collaborator for OOB interactions. Advanced: Macro recording for session handling, BApps plugins, Montoya API.",
      wireshark:
        "Wireshark - Network protocol analyzer. Capture: 'sudo wireshark', select interface, Apply filters. Filters: 'http', 'ssl.handshake.type', 'tcp.flags.syn==1', 'ip.src==192.168.1.1'. Export: Follow HTTP stream, Extract objects, Export SSL keys with SSLKEYLOGFILE. Analysis: Packet statistics, flow graph, IO graphs, protocol hierarchy.",
      aircrack:
        "Aircrack-ng suite - Wireless penetration testing tools. Workflow: 'sudo airmon-ng start wlan0' enable monitor mode, 'airodump-ng wlan0mon' scan networks, 'aireplay-ng -0 10 -a BSSID -c CLIENT wlan0mon' deauth attack, 'airodump-ng -c CHANNEL -w output --bssid BSSID wlan0mon' capture handshake, 'aircrack-ng -a2 -b BSSID -w wordlist.txt output-01.cap' WPA crack. Tools: pixiewps for WPS, aircrack-ng for WPA/WEP.",
      hydra:
        "THC Hydra - Multi-service brute force tool. Commands: 'hydra -l admin -P wordlist.txt ssh://target' SSH, 'hydra -l admin -P wordlist.txt ftp://target' FTP, 'hydra -U http-post-form' show forms, 'hydra -l admin -P wordlist.txt http-post-form://target:80/login:user=^USER^&pass=^PASS^' HTTP POST. Features: Parallel threads with -t flag, protocol support (50+), module-specific options.",
      sqlmap:
        "SQLmap - Automated SQL injection tool. Usage: 'sqlmap -u http://target/page?id=1' basic, 'sqlmap -u http://target/page -p id --dbs' enumerate DBs, 'sqlmap -u http://target/page -p id -D dbname --tables' show tables, 'sqlmap -u http://target/page -p id -D dbname -T users --dump' dump table. Options: '--technique=BEU' specify SQL injection type, '--tamper=space2comment' WAF bypass, '--proxy=localhost:8080' use Burp.",
      hashcat:
        "Hashcat - GPU password cracker. Commands: 'hashcat -m 0 hashes.txt wordlist.txt' MD5, 'hashcat -m 1000 hashes.txt wordlist.txt' NTLM, 'hashcat -m 1800 hashes.txt wordlist.txt' SHA512crypt. Modes: -a 0 dictionary, -a 1 combination, -a 3 brute-force. Advanced: Custom rules with -r, hybrid mode -a 6 wordlist+mask, --restore for resume, --show to verify.",
      john: "John the Ripper - Offline password cracker. Usage: 'john hashes.txt' auto-detect, 'john --format=sha512crypt hashes.txt' specify format, 'john --wordlist=wordlist.txt --rules=Jumbo hashes.txt' with rules, 'john --incremental hashes.txt' brute-force. Show: 'john --show hashes.txt', Unshadow: 'unshadow /etc/passwd /etc/shadow > hashes.txt'.",
      "privilege escalation":
        "Linux PE techniques: SUID/SGID binaries with 'find / -perm -4000 2>/dev/null', weak sudo with 'sudo -l', kernel exploits via 'uname -a', cron jobs in /etc/cron*, path manipulation, shared object hijacking. Tools: LinEnum.sh, linpeas.sh, pspy64 for process monitoring. Windows PE: UAC bypass, token impersonation, DLL hijacking, kernel exploits via 'systeminfo'.",
      "reverse engineering":
        "Tools: IDA Pro for disassembly/debugging, Ghidra free alternative with decompiler, radare2 open-source framework, Binary Ninja, Hopper. Workflow: Load binary, analyze sections, identify functions, read assembly, understand logic, patch code, extract strings. Techniques: Static analysis, dynamic debugging with gdb/WinDbg, setting breakpoints, memory inspection, patching executable sections.",
      cryptography:
        "Kali tools: openssl for certificate/encryption operations, gpg for PGP, hashcat for hash cracking. Commands: 'openssl genrsa -out key.pem 2048' RSA key, 'openssl req -new -x509 -key key.pem -out cert.pem' certificate, 'openssl enc -aes-256-cbc -in file -out file.enc' encrypt file. Concepts: Symmetric/asymmetric encryption, key exchange protocols, digital signatures, hash functions.",
      python:
        "Python for security: 'pip install requests scapy paramiko pwntools'. Scripts: Web scraping with requests+BeautifulSoup, network packet crafting with scapy, SSH automation with paramiko, binary exploitation with pwntools. Example: 'from scapy.all import *; packet = IP(dst=\"target\")/ICMP()' create packet. Exploit development, socket programming, automation.",
      bash: "Bash scripting for pentesting. One-liners: 'for i in {1..255}; do ping -c1 192.168.1.$i & done' host discovery, 'nc -lvp 4444 < shell.sh' shell upload, 'base64 payload.bin | tr -d \"\\n\"' encode payload. Scripts: Scanning loops, log analysis, file manipulation, system information gathering, automated payload generation.",
      postgresql:
        "PostgreSQL in Kali (Metasploit database). Commands: 'sudo service postgresql start', 'psql -U postgres', 'createdb -U postgres msf', 'msfdb init' in msfconsole. Usage: Store scan results, exploit data, session information, tracking targets. Connect in msfconsole: 'db_connect postgresql://localhost/msf', queries: 'hosts', 'services', 'vulns', 'db_export'.",
      networking:
        "OSI Model: Layer 1-7 understanding, TCP/IP protocols (TCP/UDP/ICMP). Commands: 'ifconfig' network config, 'route -n' routing table, 'iptables -L' firewall rules, 'ss -tlnp' listening ports, 'netstat -an' connections, 'traceroute target' route tracing. DNS: 'dig target.com', 'nslookup', host enumeration. DHCP/ARP: Network reconnaissance, ARP spoofing with arpspoof.",
      "wireless hacking":
        "802.11 basics: SSID broadcast, authentication (Open/Shared/WPA/WPA2/WPA3), encryption (WEP/TKIP/CCMP). Tools: aircrack-ng suite, hashcat for GPU crack, pixiewps for WPS, Bluetooth with Bluescan/BlueZ. Process: Monitor mode, packet capture, handshake capture, offline cracking, rainbow tables. WPA3 resistance: hash iterations, individualized MAC addresses, stronger algorithms.",
      "web application":
        "OWASP Top 10: A1 injection, A2 auth flaws, A3 sensitive data exposure, A4 XXE, A5 broken access control, A6 security misconfiguration, A7 XSS, A8 insecure deserialization, A9 SSRF, A10 insufficient logging. Testing: Burp Suite, OWASP ZAP, nikto, manual testing. Techniques: Input fuzzing, parameter tampering, authentication bypass, session hijacking, exploit chains.",
      "system administration":
        "Linux: User management (useradd/userdel), permissions (chmod/chown), package management (apt/yum/pacman), systemd services, firewall (iptables/firewalld), logging (journalctl/rsyslog), disk management (fdisk/lvm). SELinux: Security contexts (user_u/staff_u/system_u), roles, types, policies. Hardening: Disable unnecessary services, update regularly, restrict SSH, use keys, implement 2FA.",
      exploitation:
        "Exploit development: Understanding vulnerability, crafting payload, delivery mechanism, post-exploitation. Techniques: Buffer overflow, format string, use-after-free, privilege escalation exploits. Tools: msfvenom for payload generation, pwntools for exploit writing, gadget finding with ropper. Obfuscation: Encoding payloads, polymorphic shellcode, anti-analysis techniques.",
      "post exploitation":
        "Meterpreter sessions: 'sysinfo', 'getuid', 'hashdump' (Windows), 'cat /etc/shadow' (Linux). Privilege escalation: 'getsystem' in meterpreter, UAC bypass, token impersonation. Persistence: Creating backdoors, scheduled tasks, registry modifications, SSH key injection. Data exfiltration: File download, database dumps, credential harvesting, network traffic interception.",
      forensics:
        "Evidence collection: Live memory dump, disk imaging with dd, log preservation. Analysis: File carving with foremost, string extraction, timeline creation with mactime, artifact analysis. Tools: Autopsy for GUI analysis, Wireshark for network forensics, Volatility for memory forensics. Documentation: Chain of custody, hash verification (MD5/SHA256), detailed reporting.",
      docker:
        "Docker in Kali: 'docker pull kalilinux/kali-rolling', 'docker run -it kalilinux/kali-rolling bash' interactive shell, mount volume with '-v /path:/mnt'. Pentesting containers: 'docker inspect container_name', escape techniques, privilege escalation from container. Automation: Dockerfile for custom Kali images, docker-compose for multi-container labs.",
      git: "Git version control for security: 'git clone repo', 'git log --all --oneline' history, 'git diff' changes, finding secrets with 'git log --all -S password', 'git history-search' plugin. Security: Protect sensitive data, use SSH keys, .gitignore for secrets, GPG signing commits.",
      "default response":
        "I'm NETWORK GPT, your specialized penetration testing and bug bounty hunting AI assistant. I provide expert guidance on full-scope penetration testing methodology (reconnaissance to post-exploitation), bug bounty hunting workflows on platforms like HackerOne & Bugcrowd, OWASP Top 10 vulnerabilities, Kali Linux tools, privilege escalation, payload generation, wireless hacking, API security, mobile security, logic bugs, and compliance frameworks. I cover both authorized penetration tests and bug bounty submissions. All testing assumes explicit authorization. Ask me about exploitation techniques, vulnerability discovery, bug bounty strategies, or security research!",
    }

    const lowerMessage = sanitizedMessage.toLowerCase()

    // Check for Hinglish responses first
    if (isHinglish) {
      for (const [key, response] of Object.entries(hinglishResponses)) {
        if (key !== "default hinglish" && lowerMessage.includes(key)) {
          return NextResponse.json({
            response,
            provider: "heaven-network-offline-hinglish",
            status: "offline",
            language: "hinglish",
            timestamp: new Date().toISOString(),
          })
        }
      }

      // Default Hinglish response
      return NextResponse.json({
        response: hinglishResponses["default hinglish"],
        provider: "heaven-network-offline-hinglish",
        status: "offline",
        language: "hinglish",
        timestamp: new Date().toISOString(),
      })
    }

    // Check for English responses
    for (const [key, response] of Object.entries(offlineResponses)) {
      if (key !== "default response" && lowerMessage.includes(key)) {
        return NextResponse.json({
          response,
          provider: "heaven-network-offline-kali",
          status: "offline",
          language: "english",
          timestamp: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      response: offlineResponses["default response"],
      provider: "heaven-network-offline-kali",
      status: "offline",
      language: "english",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: getSecurityHeaders() },
    )
  }
}
