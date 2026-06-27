/* ===================================================
   NEXUS — Advanced AI Engine
   Multi-agent simulation with EmotiSense™ NLP
   =================================================== */

const NexusAI = (() => {

  // ─── EmotiSense™ — Emotional State Detector ─────────
  const EMOTION_PATTERNS = {
    crisis: [/suicid/i, /kill myself/i, /end my life/i, /don't want to (be|live)/i, /self.harm/i, /cut myself/i, /no point (in living|anymore)/i, /want to die/i, /hopeless/i, /worthless/i],
    stressed: [/stressed/i, /overwhelm/i, /can't cope/i, /breaking down/i, /too much/i, /freaking out/i, /panic/i, /anxiety/i, /anxious/i, /nervous/i, /scared/i, /worry/i, /worried/i],
    sad: [/sad/i, /depressed/i, /down/i, /crying/i, /lonely/i, /alone/i, /nobody/i, /low/i, /hurt/i, /pain/i, /miss/i, /lost/i, /heartbroken/i],
    happy: [/happy/i, /excited/i, /great/i, /amazing/i, /awesome/i, /love/i, /grateful/i, /thankful/i, /proud/i, /motivated/i, /inspired/i, /hopeful/i, /confident/i],
    confused: [/confused/i, /don't know/i, /no idea/i, /lost/i, /what do i do/i, /help me/i, /not sure/i, /idk/i, /clueless/i, /stuck/i, /uncertain/i],
    financial_stress: [/can't afford/i, /broke/i, /no money/i, /debt/i, /poor/i, /hungry/i, /can't pay/i, /unemployed/i, /lost.*(job|work)/i, /food/i],
    career_worry: [/career/i, /job/i, /college/i, /major/i, /future/i, /graduate/i, /interview/i, /resume/i, /scholarship/i, /what.*do.*life/i]
  };

  function detectEmotion(text) {
    if (!text) return 'neutral';
    for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
      if (patterns.some(p => p.test(text))) return emotion;
    }
    return 'neutral';
  }

  function getEmotionColor(emotion) {
    const colors = {
      crisis: '#ff6b9d', stressed: '#ff9f43', sad: '#6c63ff',
      happy: '#06d6a0', confused: '#00d4ff', financial_stress: '#ffd166',
      career_worry: '#00d4ff', neutral: '#6c63ff'
    };
    return colors[emotion] || '#6c63ff';
  }

  function getEmotionLabel(emotion) {
    const labels = {
      crisis: '⚠️ Crisis Detected', stressed: '😰 Stressed', sad: '😢 Feeling Low',
      happy: '😊 Positive', confused: '🤔 Uncertain', financial_stress: '💸 Financial Stress',
      career_worry: '🎯 Career Focused', neutral: '💬 Chatting'
    };
    return labels[emotion] || '💬 Chatting';
  }

  // ─── Agent Router ────────────────────────────────────
  const AGENT_KEYWORDS = {
    mental: ['sad', 'anxious', 'anxiety', 'depressed', 'stress', 'feel', 'emotion', 'mental', 'therapy', 'grounding', 'breathe', 'overwhelm', 'mood', 'cry', 'hurt', 'lonely', 'panic'],
    career: ['career', 'job', 'college', 'major', 'resume', 'interview', 'scholarship', 'internship', 'skill', 'work', 'profession', 'graduate', 'linkedin', 'study', 'university'],
    finance: ['money', 'budget', 'expense', 'save', 'savings', 'afford', 'cost', 'pay', 'debt', 'income', 'spend', 'financial', 'bank', 'broke', 'earn', 'scholarship', 'aid'],
    creator: ['youtube', 'tiktok', 'content', 'creator', 'followers', 'channel', 'video', 'post', 'brand', 'sponsor', 'monetize', 'instagram', 'social media', 'influencer'],
    community: ['resource', 'food bank', 'help', 'local', 'community', 'support', 'counselor', 'clinic', 'tutoring', 'volunteer', 'service']
  };

  function routeToAgent(text) {
    const lower = text.toLowerCase();
    let scores = { mental: 0, career: 0, finance: 0, creator: 0, community: 0 };
    for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
      scores[agent] = keywords.filter(kw => lower.includes(kw)).length;
    }
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return top[1] > 0 ? top[0] : 'general';
  }

  // ─── Knowledge Base ──────────────────────────────────
  const KB = {
    crisis: {
      prefix: "💙 I hear you, and I'm really glad you reached out. What you're feeling is valid, and you don't have to face this alone.",
      resources: "\n\n**If you're in crisis right now, please reach out:**\n- 📞 **988 Suicide & Crisis Lifeline** — Call or text **988** (free, 24/7)\n- 💬 **Crisis Text Line** — Text HOME to **741741**\n- 🌐 **crisistextline.org** — Chat online\n- 🚨 **Emergency** — Call **911**\n\nYou matter, and there are people ready to help right now.",
      followup: "Would you like to talk about what's going on? I'm here to listen without judgment."
    },
    
    careers: [
      { id: 'software', title: 'Software Engineer', emoji: '💻', salary: '$95K–$185K/yr', outlook: 'Excellent (25% growth)', skills: ['Python', 'JavaScript', 'Problem-solving'], desc: 'Build apps, websites, and systems that power the world.' },
      { id: 'data', title: 'Data Scientist', emoji: '📊', salary: '$85K–$165K/yr', outlook: 'Excellent (28% growth)', skills: ['Statistics', 'Python', 'SQL', 'Machine Learning'], desc: 'Turn data into insights that drive business decisions.' },
      { id: 'designer', title: 'UX Designer', emoji: '🎨', salary: '$70K–$140K/yr', outlook: 'Good (13% growth)', skills: ['Figma', 'User Research', 'Prototyping'], desc: 'Design products that are beautiful and easy to use.' },
      { id: 'doctor', title: 'Physician / Doctor', emoji: '🩺', salary: '$200K–$400K+/yr', outlook: 'Excellent (3–7% growth)', skills: ['Biology', 'Chemistry', 'Communication', 'Empathy'], desc: 'Diagnose and treat patients, improving lives daily.' },
      { id: 'psychologist', title: 'Psychologist / Counselor', emoji: '🧠', salary: '$60K–$120K/yr', outlook: 'Excellent (22% growth)', skills: ['Empathy', 'Communication', 'Psychology', 'Research'], desc: 'Help people navigate mental health challenges and grow.' },
      { id: 'teacher', title: 'Teacher / Educator', emoji: '📚', salary: '$45K–$80K/yr', outlook: 'Stable (5% growth)', skills: ['Communication', 'Patience', 'Subject Expertise', 'Creativity'], desc: 'Shape the next generation and inspire lifelong learning.' },
      { id: 'entrepreneur', title: 'Entrepreneur', emoji: '🚀', salary: 'Varies widely', outlook: 'Self-determined', skills: ['Leadership', 'Finance', 'Marketing', 'Resilience'], desc: 'Build your own company and solve problems you care about.' },
      { id: 'nurse', title: 'Registered Nurse', emoji: '💊', salary: '$60K–$110K/yr', outlook: 'Excellent (15% growth)', skills: ['Healthcare', 'Empathy', 'Critical Thinking'], desc: 'Provide compassionate patient care on the frontlines.' },
      { id: 'accountant', title: 'Accountant / CPA', emoji: '🧾', salary: '$55K–$130K/yr', outlook: 'Good (6% growth)', skills: ['Math', 'Attention to Detail', 'Excel', 'Tax Law'], desc: 'Manage finances, taxes, and audits for individuals and businesses.' },
      { id: 'journalist', title: 'Journalist / Writer', emoji: '✍️', salary: '$40K–$90K/yr', outlook: 'Changing (digital focus)', skills: ['Writing', 'Research', 'Interviewing', 'Storytelling'], desc: 'Tell stories that inform, inspire, and hold power accountable.' }
    ],

    scholarships: [
      { name: 'Gates Scholarship', org: 'Bill & Melinda Gates Foundation', amount: 'Full tuition', deadline: 'September 15', desc: 'For exceptional minority students with significant financial need', url: '#', tags: ['STEM', 'Need-based', 'Minority'] },
      { name: 'Coca-Cola Scholars Program', org: 'Coca-Cola Foundation', amount: '$20,000', deadline: 'October 1', desc: 'For students who demonstrate leadership and service', url: '#', tags: ['Leadership', 'Service', 'Any major'] },
      { name: 'Jack Kent Cooke Foundation', org: 'Jack Kent Cooke Foundation', amount: 'Up to $55,000/yr', deadline: 'November 30', desc: 'For high-achieving students with financial need', url: '#', tags: ['Need-based', 'Academic', 'Leadership'] },
      { name: 'Dell Scholars Program', org: 'Michael & Susan Dell Foundation', amount: '$20,000', deadline: 'December 1', desc: 'For students who have overcome significant obstacles', url: '#', tags: ['Need-based', 'First-gen', 'Resilience'] },
      { name: 'Ron Brown Scholar Program', org: 'Ron Brown Foundation', amount: '$40,000', deadline: 'January 9', desc: 'For African-American students demonstrating academic excellence', url: '#', tags: ['African-American', 'Leadership', 'Community'] },
      { name: 'Hispanic Scholarship Fund', org: 'HSF', amount: '$500–$5,000', deadline: 'February 15', desc: 'For Hispanic students pursuing higher education', url: '#', tags: ['Hispanic', 'Need-based', 'Any major'] },
      { name: 'STEM Scholarship', org: 'Society of Women Engineers', amount: '$1,000–$15,000', deadline: 'February 1', desc: 'For women pursuing STEM fields', url: '#', tags: ['Women', 'STEM', 'Engineering'] }
    ],

    cbt_exercises: [
      { title: 'Thought Reframing', emoji: '🔄', duration: '3 min', desc: 'Challenge negative thoughts with evidence-based questioning', steps: ['Identify the negative thought', 'Ask: What evidence supports this?', 'Ask: What evidence contradicts this?', 'Create a more balanced thought', 'Notice how you feel after'] },
      { title: '5-4-3-2-1 Grounding', emoji: '🌍', duration: '5 min', desc: 'Use your senses to anchor yourself in the present moment', steps: ['5 things you can SEE', '4 things you can TOUCH', '3 things you can HEAR', '2 things you can SMELL', '1 thing you can TASTE'] },
      { title: 'Box Breathing', emoji: '🫁', duration: '4 min', desc: 'Used by Navy SEALs to reduce stress instantly', steps: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 4 counts', 'Hold for 4 counts', 'Repeat 4 times'] },
      { title: 'Gratitude Scan', emoji: '💛', duration: '2 min', desc: 'Shift perspective by finding 3 good things', steps: ['Close your eyes', 'Think of 3 specific things you\'re grateful for', 'For each one, feel it fully for 10 seconds', 'Notice the shift in your body', 'Take one deep breath'] },
      { title: 'Progressive Muscle Relaxation', emoji: '💪', duration: '8 min', desc: 'Release physical tension to calm your mind', steps: ['Start with your feet — tense for 5 sec, release', 'Move to your calves — tense, release', 'Continue up: thighs, stomach, hands, arms, shoulders', 'Tense your face — scrunch, release', 'Notice the calm in your body'] }
    ],

    local_resources: [
      { name: 'City Food Bank', type: 'food', emoji: '🍱', desc: 'Free food assistance, no ID required', hours: 'Mon–Fri 9am–5pm', open: true, distance: '0.3 mi', color: '#ffd166' },
      { name: 'Youth Mental Health Clinic', type: 'mental_health', emoji: '💚', desc: 'Free counseling for ages 13–24', hours: 'Mon–Sat 8am–8pm', open: true, distance: '0.7 mi', color: '#06d6a0' },
      { name: 'Public Library Learning Center', type: 'tutoring', emoji: '📚', desc: 'Free tutoring and WiFi', hours: 'Daily 9am–9pm', open: true, distance: '1.1 mi', color: '#00d4ff' },
      { name: 'Community Health Center', type: 'health', emoji: '🏥', desc: 'Sliding scale healthcare', hours: 'Mon–Fri 8am–6pm', open: false, distance: '1.4 mi', color: '#ff9f43' },
      { name: 'Workforce Development Center', type: 'career', emoji: '💼', desc: 'Free job training & resume help', hours: 'Mon–Fri 9am–5pm', open: true, distance: '1.8 mi', color: '#6c63ff' },
      { name: 'Emergency Shelter Network', type: 'shelter', emoji: '🏠', desc: 'Safe temporary housing', hours: '24/7', open: true, distance: '2.1 mi', color: '#ff6b9d' }
    ]
  };

  // ─── Response Generators ─────────────────────────────

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate typing delay
  async function thinkingDelay(text) {
    const baseDelay = Math.min(800, 300 + text.length * 2);
    await delay(baseDelay);
  }

  const agents = {
    // Mental Health Agent
    mental: {
      name: 'NEXUS MindSpace',
      responses: {
        stressed: [
          "I can hear that you're really stressed right now — that takes a lot out of you. **You're not alone in feeling this way.** Let's take it one breath at a time.\n\nCan I ask — what's the main thing that's weighing on you most right now? Sometimes just naming it helps.",
          "Stress is exhausting, especially when it piles up. Your feelings make complete sense given everything you're dealing with.\n\nI have a quick **3-minute breathing exercise** that can help calm your nervous system right now. Want to try it? Or would you rather just talk it through?",
          "Hey, I see you. Feeling overwhelmed is real, and it's okay to not be okay sometimes. You reached out — that already takes courage.\n\nLet me suggest something: **the 5-4-3-2-1 grounding technique**. It's been shown to interrupt the anxiety spiral. Want to do it together?"
        ],
        sad: [
          "I'm really sorry you're feeling this way. Feeling low is incredibly hard, and I want you to know that what you're experiencing is valid.\n\nCan you tell me a little more about what's been going on? I'm here to listen — no judgment, no rush.",
          "Sadness has a way of making everything feel heavier than it is. But these feelings are temporary, even when they don't feel that way.\n\nYou reached out, which tells me something important: there's a part of you that wants to feel better. **What's one small thing that made you smile this week?** Even something tiny counts.",
          "Sometimes we just need someone to see us in the low moments. I see you. 💙\n\nWould you like to try a **gratitude scan** — it's just 2 minutes and research shows it genuinely shifts your emotional state? Or we can just talk."
        ],
        neutral: [
          "Hi there! I'm your NEXUS MindSpace companion 💚 I'm here whenever you need to process emotions, work through stress, or just have a non-judgmental space to think out loud.\n\nWhat's on your mind today?",
          "Welcome to MindSpace — your personal mental health companion. How are you doing today, really? Not the \"I'm fine\" version — the real version. 😊"
        ]
      }
    },

    // Career Agent
    career: {
      name: 'NEXUS CareerLab',
      responses: {
        default: [
          "Great question about careers! Let me help you navigate this. The job market in 2026 is heavily AI-shaped, but don't worry — **human skills like empathy, creativity, and leadership are more valuable than ever.**\n\nWhat aspect of career planning would you like to explore?\n- 🎯 Discover what careers fit you\n- 📄 Build your resume\n- 🎤 Practice interview skills\n- 🎓 Find scholarships",
          "Career planning can feel overwhelming, but let's break it down into something manageable.\n\n**The 3 questions that matter most:**\n1. What are you naturally good at?\n2. What problems do you love solving?\n3. What kind of life do you want?\n\nWhen those three align, you've found your path. Which one do you want to start with?"
        ],
        resume: [
          "Let's build your resume! A strong resume tells a story — it's not just a list of jobs, it's proof that you can deliver value.\n\n**For your age, focus on:**\n- School projects that show skills\n- Volunteer work and extracurriculars\n- Part-time jobs (any job shows reliability!)\n- Personal projects (apps you built, events you organized)\n\nWhat's your name and what grade/year are you in? Let's start there.",
          "Resume building! Smart move. Here's the thing most teens don't know: **ATS (Applicant Tracking Systems) scan resumes before humans see them.**\n\nThat means:\n✅ Use keywords from the job description\n✅ Use clean formatting (no fancy tables)\n✅ Quantify everything (\"Led team of 5\" not just \"Led team\")\n\nLet's build yours. What's your target job or internship?"
        ],
        interview: [
          "Interview practice — smart! Here's your first behavioral question:\n\n**\"Tell me about a time you faced a challenge and how you overcame it.\"**\n\nUse the **STAR method**: Situation → Task → Action → Result.\n\nTake your time and answer it as if you're in the real interview. I'll give you detailed feedback!",
          "Let's do a mock interview! I'll play the interviewer.\n\n**Question 1:** \"Tell me about yourself.\"\n\n*(This is your 60-second elevator pitch. Share: who you are, what you've done, and what you're excited about. Keep it focused and enthusiastic!)*\n\nGo ahead whenever you're ready!"
        ],
        scholarship: [
          "Scholarships are life-changing — and most students don't apply because they think they won't qualify. **You almost certainly qualify for more than you think.**\n\nHere are key scholarships I've matched to your profile. For each one, I can help you write a personalized application essay.\n\nWhich one interests you most?",
          "Let me find scholarships that match your profile! To give you the best matches, tell me:\n1. What's your GPA (roughly)?\n2. Do you have any heritage/background (first-gen, specific ethnicity, disability)?\n3. What do you want to study?\n\nThere are over 1.7 billion dollars in unclaimed scholarships every year — let's find yours."
        ]
      }
    },

    // Finance Agent
    finance: {
      name: 'NEXUS MoneyIQ',
      responses: {
        default: [
          "Let's talk money — and I promise to keep it real, not boring! 💰\n\nThe #1 thing nobody teaches teens: **your money habits right now will determine your financial freedom at 30.**\n\nWhat's on your mind?\n- 💵 Understand your paycheck\n- 📊 Build a budget\n- 🎯 Save for something specific\n- 😰 Dealing with financial stress",
          "Financial stress is real, especially when nobody taught you how money works. But you're here — which means you're already ahead.\n\n**One thing that will change your finances forever:** Pay yourself first. Before anything else, move 10% of every paycheck to savings automatically.\n\nWhat's your current financial situation? Let's build from there."
        ],
        paycheck: [
          "First paycheck! This is a big deal — congratulations! 🎉\n\nHere's what all those deductions mean:\n- **Federal Income Tax**: Goes to the government (rate depends on your bracket)\n- **State Tax**: Varies by state\n- **FICA (Social Security + Medicare)**: ~7.65% of your gross — you're building future benefits!\n- **Net Pay**: What you actually take home\n\nA good starting rule: **50/30/20**\n- 50% needs (food, transport, necessities)\n- 30% wants (fun, clothes, hobbies)\n- 20% savings\n\nWhat was your gross pay? I can calculate a personalized breakdown.",
          "First paycheck decoded! The confusion is totally normal — nobody teaches this in school. 😅\n\n**Quick formula:**\nGross Pay × 0.765 = approximate take-home (after typical taxes)\n\nBut more importantly: **before you spend a dollar**, decide where it goes. Intentional spending is the secret to never feeling broke."
        ],
        budget: [
          "Budget time! The best budget is one you actually stick to — so let's make yours realistic.\n\n**Step 1:** What's your monthly income? (Part-time job, allowance, gigs)\n**Step 2:** What are your fixed costs? (Phone bill, transportation)\n**Step 3:** What's your savings goal?\n\nOnce I have those numbers, I'll build you a personalized weekly spending plan.",
          "Let's build your budget! I use the **anti-budget method for teens** — it's simpler:\n1. Set aside your savings goal FIRST\n2. Pay any bills\n3. Everything left = guilt-free spending\n\nNo complicated spreadsheets needed. What's your monthly take-home pay?"
        ],
        stress: [
          "Financial stress is heavy — I want you to know you're not alone. **Many teens and young adults face the same pressures, and resources exist specifically to help.**\n\nLet me connect you with some immediate options:\n\n🍱 **Food assistance**: Local food banks often serve anyone regardless of income\n💊 **Health**: Community health centers offer sliding-scale care (pay what you can)\n📚 **Tutoring/WiFi**: Public libraries are free\n💼 **Job help**: Workforce development centers offer free training\n\nWhich of these would be most helpful right now?"
        ]
      }
    },

    // Creator Agent
    creator: {
      name: 'NEXUS Creator Studio',
      responses: {
        default: [
          "Creator mode activated! 🎬 The creator economy is massive right now — and you're in the perfect generation to build something real.\n\n**The creators who win in 2026:**\n- Use AI to produce faster without losing their voice\n- Build community, not just audience\n- Understand their data\n- Diversify revenue (merch, courses, brand deals, etc.)\n\nWhat are you creating, or want to create?",
          "You're thinking about content creation — smart! The market is huge but crowded. **The key is to niche down:**\n- Instead of \"fitness\", try \"fitness for teen athletes with limited equipment\"\n- Instead of \"cooking\", try \"5-minute meals for college students\"\n\nSpecificity builds loyal audiences faster than broad appeal.\n\nWhat's your niche or passion area?"
        ],
        ideas: [
          "Content idea generation engaged! Let me give you 10 ideas for your niche.\n\nBut first — who's your target audience, what platform, and what's the goal (growth, monetization, community)?\n\nThe more specific you are, the better the ideas I can generate."
        ],
        brand_deal: [
          "Brand deal analysis mode! This is important — most creators undervalue themselves. Let me break it down:\n\n**Industry standard rates:**\n- YouTube: ~$20–50 per 1,000 views\n- TikTok: ~$2–5 per 1,000 followers\n- Instagram: ~$10 per 1,000 followers\n\nSo 5K followers = roughly $50–200 per post.\n\n**$200 for 5K followers is on the higher end — but check:**\n1. How much work is it? (Just a mention vs. dedicated video)\n2. Do they want exclusivity?\n3. Is the brand aligned with your values?\n\nWhat's the full deal offer? I'll help you evaluate it."
        ]
      }
    },

    // General Agent
    general: {
      responses: [
        "Hi! I'm NEXUS, your AI life navigator. I can help you with:\n\n💚 **MindSpace** — Mental health support, stress tools, grounding exercises\n💼 **CareerLab** — Resume building, career exploration, scholarships, interview prep\n💰 **MoneyIQ** — Budgeting, first paycheck explained, financial literacy\n🎨 **Creator Studio** — Content ideas, brand deals, growing your platform\n🌐 **Community** — Local resources for food, health, tutoring and more\n\nWhat do you need help with today?",
        "I'm here for you! Whether you need career guidance, financial advice, mental health support, or just someone to talk to — NEXUS has you covered.\n\nWhat's your biggest challenge right now?",
        "Great question! Let me think through this with you. NEXUS is designed to give you the kind of guidance that students from privileged backgrounds take for granted — but available to everyone, for free.\n\nTell me more about what you're dealing with and I'll connect you with the right resources."
      ]
    }
  };

  // ─── Main Chat Function ──────────────────────────────
  async function chat(userMessage, module = 'general', conversationHistory = []) {
    const emotion = detectEmotion(userMessage);
    const agent = routeToAgent(userMessage);
    const lowerMsg = userMessage.toLowerCase();

    // Crisis detection — always highest priority
    if (emotion === 'crisis') {
      return {
        text: agents.mental.responses.stressed[0] + '\n\n' + KB.crisis.resources + '\n\n' + KB.crisis.followup,
        emotion,
        agent: 'mental',
        isCrisis: true,
        emotionLabel: getEmotionLabel('crisis'),
        emotionColor: getEmotionColor('crisis')
      };
    }

    let responseText = '';
    let activeAgent = agent;

    // Route to appropriate agent
    if (agent === 'mental' || module === 'mindspace') {
      const type = ['stressed', 'sad'].includes(emotion) ? emotion : 'neutral';
      const pool = agents.mental.responses[type] || agents.mental.responses.neutral;
      responseText = pool[Math.floor(Math.random() * pool.length)];
    } else if (agent === 'career' || module === 'careerlab') {
      if (lowerMsg.includes('resume') || lowerMsg.includes('cv')) {
        responseText = agents.career.responses.resume[Math.floor(Math.random() * agents.career.responses.resume.length)];
      } else if (lowerMsg.includes('interview')) {
        responseText = agents.career.responses.interview[Math.floor(Math.random() * agents.career.responses.interview.length)];
      } else if (lowerMsg.includes('scholarship') || lowerMsg.includes('financial aid')) {
        responseText = agents.career.responses.scholarship[Math.floor(Math.random() * agents.career.responses.scholarship.length)];
      } else {
        responseText = agents.career.responses.default[Math.floor(Math.random() * agents.career.responses.default.length)];
      }
    } else if (agent === 'finance' || module === 'moneyiq') {
      if (lowerMsg.includes('paycheck') || lowerMsg.includes('payslip') || lowerMsg.includes('salary')) {
        responseText = agents.finance.responses.paycheck[Math.floor(Math.random() * agents.finance.responses.paycheck.length)];
      } else if (lowerMsg.includes('budget') || lowerMsg.includes('plan')) {
        responseText = agents.finance.responses.budget[Math.floor(Math.random() * agents.finance.responses.budget.length)];
      } else if (emotion === 'financial_stress' || lowerMsg.includes('broke') || lowerMsg.includes('can\'t afford')) {
        responseText = agents.finance.responses.stress[0];
      } else {
        responseText = agents.finance.responses.default[Math.floor(Math.random() * agents.finance.responses.default.length)];
      }
    } else if (agent === 'creator' || module === 'creator') {
      if (lowerMsg.includes('idea') || lowerMsg.includes('content')) {
        responseText = agents.creator.responses.ideas[0];
      } else if (lowerMsg.includes('brand') || lowerMsg.includes('sponsor') || lowerMsg.includes('deal')) {
        responseText = agents.creator.responses.brand_deal[0];
      } else {
        responseText = agents.creator.responses.default[Math.floor(Math.random() * agents.creator.responses.default.length)];
      }
    } else {
      responseText = agents.general.responses[Math.floor(Math.random() * agents.general.responses.length)];
      activeAgent = 'general';
    }

    // Inject emotion-aware prefix for negative emotions
    if (emotion === 'stressed' && activeAgent !== 'mental') {
      responseText = "I notice you might be feeling stressed — I've got you. Let me help.\n\n" + responseText;
    }

    return {
      text: responseText,
      emotion,
      agent: activeAgent,
      isCrisis: false,
      emotionLabel: getEmotionLabel(emotion),
      emotionColor: getEmotionColor(emotion)
    };
  }

  // ─── Journal Analyzer ────────────────────────────────
  function analyzeJournalEntry(text) {
    const emotion = detectEmotion(text);
    const wordCount = text.split(/\s+/).length;
    
    const sentimentMap = {
      happy: 'positive', crisis: 'negative', sad: 'negative',
      stressed: 'negative', financial_stress: 'negative',
      confused: 'neutral', career_worry: 'neutral', neutral: 'neutral'
    };
    const sentiment = sentimentMap[emotion] || 'neutral';
    
    const aiPrompts = {
      positive: [
        "It sounds like things are going well — I love hearing that! 🌟 What's been the biggest contributor to this positive energy?",
        "This entry radiates some real hope and progress. You should feel proud of how you're showing up for yourself."
      ],
      negative: [
        "Thank you for being honest with yourself in writing. Processing hard feelings through journaling is genuinely healing. 💙\n\nOne reflection to sit with: **Is this feeling temporary or a pattern?** Often naming it helps us see it more clearly.",
        "Writing during tough times takes courage. I see something important in what you've shared — a person trying to make sense of a hard situation.\n\n*Journal prompt for tomorrow:* What's one small thing you can control in this situation?"
      ],
      neutral: [
        "Solid reflection today! Regular journaling builds incredible self-awareness over time. Your future self will thank you for documenting this.\n\n*Next prompt to try:* What's one thing you wish someone had told you 6 months ago?",
        "I notice you're processing something. Sometimes our best insights come when we're in that 'in-between' space.\n\n*A question to sit with:* What does your gut tell you about this situation, beyond what your mind is saying?"
      ]
    };
    
    const pool = aiPrompts[sentiment];
    const aiResponse = pool[Math.floor(Math.random() * pool.length)];
    
    return { sentiment, emotion, wordCount, aiResponse };
  }

  // ─── Resume Generator ────────────────────────────────
  function generateResume(data) {
    const { name, grade, interests, experience, skills, goal } = data;
    return {
      name: name || 'Your Name',
      contact: `yourname@email.com | (555) 000-0000 | linkedin.com/in/yourname`,
      objective: `Motivated ${grade || 'high school'} student passionate about ${interests || 'technology and innovation'}. Seeking opportunities to apply skills in ${goal || 'a challenging environment'} while continuing to grow professionally.`,
      education: [
        { school: 'Your High School', degree: 'High School Diploma', year: '2026', gpa: '3.8' }
      ],
      experience: experience || [
        { title: 'Volunteer Tutor', org: 'Community Center', period: 'Jan 2025 – Present', bullets: ['Tutored 10+ students weekly in math and science', 'Improved student test scores by average of 15%', 'Coordinated scheduling and lesson planning independently'] }
      ],
      skills: skills || ['JavaScript', 'Python basics', 'Microsoft Office', 'Teamwork', 'Communication', 'Problem-solving'],
      activities: ['Student Government (Secretary)', 'Debate Club', 'Coding Club (President)', 'Volunteer at local food bank (50+ hours)']
    };
  }

  // ─── Content Ideas Generator ─────────────────────────
  function generateContentIdeas(niche, platform, goal) {
    const ideas = [
      { hook: '\"Nobody talks about this but...\"', title: `Hidden truths about ${niche} that changed everything`, format: 'Talking head + text overlay' },
      { hook: '\"I tried this for 30 days...\"', title: `30-day ${niche} challenge results`, format: 'Before/after transformation' },
      { hook: '\"Day in my life as...\"', title: `Realistic day in the life: ${niche} edition`, format: 'Vlog-style' },
      { hook: '\"The mistake EVERYONE makes...\"', title: `Top 3 ${niche} mistakes beginners make`, format: 'List video' },
      { hook: '\"Reacting to viral...\"', title: `Reacting to the most popular ${niche} content`, format: 'Duet / reaction' },
      { hook: '\"Here\'s what they don\'t show you...\"', title: `Behind the scenes of ${niche}`, format: 'Authentic BTS footage' },
      { hook: '\"This ONE tip changed my...\"', title: `Single most impactful ${niche} insight`, format: 'Short, punchy' },
      { hook: '\"Rating viral ${niche} advice...\"', title: `Testing popular ${niche} tips: what actually works?`, format: 'Educational + entertaining' },
      { hook: '\"From beginner to...\"', title: `My ${niche} journey: 6 months in`, format: 'Story-driven' },
      { hook: '\"The ${niche} nobody tells you about\"', title: `Unpopular opinion: ${niche} truths`, format: 'Opinion piece' }
    ];
    return ideas.map((idea, i) => ({ ...idea, tags: [`#${niche}`, `#${platform}`, '#contentcreator'], id: i + 1 }));
  }

  // ─── Interview Feedback ──────────────────────────────
  function evaluateInterviewAnswer(question, answer) {
    const wordCount = answer.split(/\s+/).length;
    const hasSTAR = /situation|task|action|result/i.test(answer);
    const hasNumbers = /\d+/.test(answer);
    const isSpecific = wordCount > 30;
    
    let score = 0;
    const feedback = [];
    const strengths = [];
    
    if (wordCount < 20) { feedback.push('Your answer is quite short. Aim for 60–120 words for behavioral questions.'); }
    else { score += 20; strengths.push('Good answer length'); }
    
    if (hasSTAR) { score += 30; strengths.push('Uses STAR method elements'); }
    else { feedback.push('Try structuring with STAR: Situation → Task → Action → Result'); }
    
    if (hasNumbers) { score += 25; strengths.push('Quantifies with specific numbers'); }
    else { feedback.push('Add specific numbers or metrics (e.g., "increased by 30%", "led a team of 5")'); }
    
    if (isSpecific) { score += 25; strengths.push('Specific and detailed'); }
    
    const rating = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Developing' : 'Needs Work';
    
    return { score, rating, strengths, improvements: feedback, 
      improved_version: answer.length > 10 ? `Strong start! One way to strengthen this: "In my role as [title], I faced [situation]. My responsibility was to [task]. I [specific action I took]. As a result, [measurable result]." Try rewriting with that structure.` : 'Please provide an answer to evaluate!'
    };
  }

  return {
    chat,
    detectEmotion,
    getEmotionColor,
    getEmotionLabel,
    analyzeJournalEntry,
    generateResume,
    generateContentIdeas,
    evaluateInterviewAnswer,
    getKB: () => KB,
    thinkingDelay
  };
})();

window.NexusAI = NexusAI;
