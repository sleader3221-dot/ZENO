<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=900&size=42&pause=1000&color=6C63FF&center=true&vCenter=true&width=600&height=80&lines=ZENO+AI;Your+Life+Navigator;Youth+Code+x+AI+2026" alt="ZENO AI" />

<br/>

<img src="https://img.shields.io/badge/Youth%20Code%20x%20AI-2026%20Hackathon-6c63ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnoiIGZpbGw9IiM2YzYzZmYiLz48L3N2Zz4=&logoColor=white" alt="Hackathon"/>
<img src="https://img.shields.io/badge/Tracks_Covered-All_5-00d4ff?style=for-the-badge" alt="Tracks"/>
<img src="https://img.shields.io/badge/Framework-Zero_(Vanilla_JS)-06d6a0?style=for-the-badge" alt="Vanilla JS"/>
<img src="https://img.shields.io/badge/PWA-Installable-ffd166?style=for-the-badge" alt="PWA"/>
<img src="https://img.shields.io/badge/License-MIT-ff6b9d?style=for-the-badge" alt="MIT"/>

<br/><br/>

> **One AI for every challenge youth face.**
> Mental health support · Career planning · Financial literacy · Community resources · Creator tools
>
> *Free. Private. Always here. Built for you, by youth.*

<br/>

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-Open%20ZENO-6c63ff?style=for-the-badge&logo=googlechrome&logoColor=white)](https://zeno-kappa-bice.vercel.app/)

</div>

---

## 🔮 What is ZENO?

**ZENO** is a world-class, production-ready AI life navigator built specifically for youth aged 13–24. It combines five critical areas of young people's lives into a single, beautifully designed application — powered by **EmotiSense™ AI**, a custom-built natural language processing engine that understands *how you actually feel*.

Built in **100% Vanilla JavaScript** — no frameworks, no npm, no build step. Just open `index.html` and ZENO is ready.

<div align="center">

| 🧠 MindSpace | 💼 CareerLab | 💰 MoneyIQ | 🌐 Community | 📓 AI Journal |
|:---:|:---:|:---:|:---:|:---:|
| Mental health AI chat | Career explorer | Budget tracker | Local resources | Sentiment AI |
| CBT exercises | Resume builder | Savings goals | Creator studio | Daily prompts |
| Box breathing | Mock interviews | Paycheck decoder | Brand deals | 26 badges |
| Mood calendar | Scholarships | 50/30/20 Rule | Peer support | XP system |

</div>

---

## ✨ Features — 45 Advanced Capabilities

### 🧠 EmotiSense™ AI Engine
- **Multi-agent routing** — 5 specialized AI agents (Mental Health, Career, Finance, Creator, General)
- **8-state emotion detection** — crisis, stressed, sad, happy, anxious, financial worry, career anxiety, neutral
- **Always-on crisis detection** — automatically surfaces 988 / 741741 when crisis keywords detected
- **AI journal reflections** — personalized response to every journal entry based on sentiment score
- **Interview feedback** — STAR method scoring, specificity analysis, improvement suggestions
- **Content idea generation** — 10 niche-specific hooks, formats, and hashtags per query

### 💚 MindSpace — Mental Health
- AI-powered empathetic chat with emotion-aware responses
- 30-day mood calendar with visual heat-map
- 7-day mood trend chart (Chart.js)
- 5 evidence-based CBT exercises (thought reframing, 5-4-3-2-1 grounding, PMR, gratitude scan)
- Animated box breathing trainer with 4-phase counter
- **Safe Space Mode** — private overlay, zero data saved, always-on crisis resources
- Daily mood check-in with XP rewards (+10 XP/day)

### 💼 CareerLab — Career Planning
- Career explorer with 10 careers: salary, growth outlook, skills, education path
- **ATS-optimized resume builder** with live preview and one-click download
- Mock interview coach — 6 behavioral questions with STAR scoring (0–100)
- Scholarship finder — 7 scholarships with deadlines, amounts, and AI essay helper
- Career AI chat with contextual coaching

### 💰 MoneyIQ — Financial Literacy
- Real-time expense tracker with 8 spending categories
- Budget visualization (Chart.js doughnut chart)
- 50/30/20 Budget Rule with personalized dollar amounts
- Savings goals with animated progress bars
- **Paycheck decoder** — gross → net with real FICA (7.65%), federal and state tax calculation
- Financial stress triage with 6 free resource types
- 6 interactive financial education lessons

### 🌐 Community & Creator
- Local resource radar with open/closed status and directions
- **6 national crisis helplines** always visible (988, 741741, SAMHSA, RAINN, Trevor, Childhelp)
- Creator Studio: content idea generator, brand deal evaluator, burnout scanner
- Peer support groups with AI moderation

### 📓 AI Journal & Gamification
- Daily rotating prompts with voice input (Web Speech API)
- Sentiment analysis: positive / neutral / negative tagging on every entry
- **26-badge achievement system** with auto-unlock logic
- XP + Level system using √(XP/100)+1 formula
- Community leaderboard with user position
- Day streak tracker with visual flame indicator

### ⚙️ Platform & UX
- **PWA installable** — works offline via Service Worker
- **Live real-time clock** in sidebar (updates every second)
- **Animated achievement popup** on badge unlock
- Voice input (STT) + Text-to-Speech (TTS) via Web Speech API
- High contrast accessibility mode (focus rings, contrast boost)
- **Smooth page transitions** (fade + slide between modules)
- Keyboard navigation (Escape closes overlays, Ctrl+1–7 to switch modules)
- Button ripple animations
- XP gain floating animation
- Toast notification system with dismiss button
- Responsive — works on mobile, tablet, and desktop

---

## 🏗️ Architecture

```
ZENO/
├── index.html              — SPA shell, all HTML overlays, PWA meta
├── manifest.json           — PWA manifest (installable app)
├── sw.js                   — Service Worker (offline caching)
├── css/
│   ├── main.css            — Design system, CSS variables, layout, sidebar
│   ├── animations.css      — Keyframes, loading screen, micro-animations
│   └── components.css      — 60+ component styles (cards, badges, modals)
└── js/
    ├── data-store.js        — localStorage persistence API (NexusDB singleton)
    ├── ai-engine.js         — EmotiSense™ NLP + 5-agent AI router
    ├── voice.js             — Web Speech API (STT + TTS)
    ├── app.js               — SPA router, real-time clock, event controller
    └── modules/
        ├── onboarding.js    — 5-step personalized setup wizard
        ├── dashboard.js     — Home hub with mood chart and AI insights
        ├── mindspace.js     — Mental health: AI chat, CBT, breathing
        ├── careerlab.js     — Career: explorer, resume, interviews, scholarships
        ├── moneyiq.js       — Finance: budget, expenses, savings, paycheck
        ├── community.js     — Resources, creator studio, peer support
        ├── journal.js       — AI journal with sentiment analysis
        └── achievements.js  — 26 badges, XP, levels, leaderboard
```

**Total: ~370 KB of application code | 0 npm packages | 0 build step | Open index.html → it works**

---

## 🚀 Getting Started

### Instant Run (no server needed)
```bash
git clone https://github.com/sleader3221-dot/ZENO.git
cd ZENO
# Open index.html in Chrome, Edge, or Firefox
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

### With Local Server (enables PWA + offline)
```bash
# Python
python -m http.server 8000
# Then open: http://localhost:8000

# Node.js
npx serve .
# Then open: http://localhost:3000
```

### Live Deployment
Deploy for free on **GitHub Pages**:
1. Go to repo Settings → Pages
2. Set source: `main` branch, `/ (root)` folder
3. Your app is live at `https://sleader3221-dot.github.io/ZENO`

---

## 🎯 Hackathon Judging Alignment

<div align="center">

| Prize | Why ZENO Wins |
|-------|---------------|
| 🏆 **Best Original Idea** | First app to combine mental health + career + finance + community under one AI router. EmotiSense™ NLP is a novel custom-built system unique to ZENO. |
| 🎨 **Best UI/UX** | Dark glassmorphism design, 60+ animated components, breathing visualizer, animated mood calendar, smooth transitions, ripple effects, live clock |
| 💙 **Best Social Value** | Real crisis detection → real hotlines instantly. Financial stress triage with actual free resources. Covers youth's most pressing real-world challenges simultaneously. |
| 🎤 **Best Presentation** | Each module demos independently. Onboarding creates a WOW moment in 30 seconds. Achievement popups create emotional engagement during live demo. |

</div>

### Demo Flow for Judges (4 minutes)
1. **Load ZENO** → animated loading screen + branding (20s)
2. **Onboarding** → 5-step personalized wizard, goal selection (45s)
3. **Dashboard** → mood check-in, AI insight, XP system (30s)
4. **MindSpace** → type "I'm really stressed" → crisis detection + empathetic AI (45s)
5. **CareerLab** → build a resume live, then do a mock interview question (45s)
6. **MoneyIQ** → decode a paycheck, create a savings goal (30s)
7. **Achievements** → show badges unlocked during demo, leaderboard (15s)

---

## 🔒 Privacy & Safety

- **100% local storage** — all data stays on your device, never sent to a server
- **Safe Space Mode** — completely private chat with no logging whatsoever
- **Crisis detection** — always-on pattern matching, always surfaces real hotlines
- **No ads, no tracking, no accounts required**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Vanilla JavaScript (ES6+) |
| Styling | Custom CSS with CSS Variables |
| Charts | Chart.js v4.4.3 (CDN) |
| Fonts | Space Grotesk + Inter (Google Fonts) |
| Voice | Web Speech API (native browser) |
| Storage | localStorage (built-in browser API) |
| PWA | Service Worker + Web App Manifest |
| AI | EmotiSense™ (custom NLP engine) |
| Deployment | GitHub Pages (free) |

---

## 📊 By the Numbers

<div align="center">

| Metric | Value |
|--------|-------|
| Lines of code | ~5,200 |
| JS files | 12 |
| CSS rules | 700+ |
| Features | 45+ |
| AI responses | 80+ unique |
| Badges | 26 |
| Career paths | 10 |
| Scholarships | 7 |
| Crisis resources | 6 national hotlines |
| npm dependencies | **0** |
| Build steps required | **0** |

</div>

---

## 🤝 Built For

<div align="center">

**Youth Code x AI Hackathon 2026**

*Every youth deserves access to a smart, caring, always-available guide through life's hardest challenges. ZENO is that guide.*

</div>

---

## 📄 License

MIT License — free to use, share, and build upon.

---

<div align="center">

**Built with 💜 for youth, by youth**

*ZENO — Navigate anything.*

</div>
