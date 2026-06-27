/* ===================================================
   NEXUS — MindSpace Module (Mental Health)
   =================================================== */

const MindspaceModule = (() => {
  let currentTab = 'chat';
  let breathingInterval = null;
  let breathingPhase = 'ready';
  let breathingCount = 0;

  function render() {
    const moods = NexusDB.getMoods();
    const user = NexusDB.getUser() || { name: 'Explorer' };
    const exercises = NexusAI.getKB().cbt_exercises;

    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-purple" style="background: rgba(168,85,247,0.15); color: var(--mindspace); border-color: rgba(168,85,247,0.3);">💚 MindSpace</span>
          <h1 class="module-hero">Mental Health & Wellness</h1>
          <p>Your safe, non-judgmental space to process emotions, build resilience, and find calm. NEXUS AI is always here.</p>
        </div>

        <!-- Crisis Banner (always visible) -->
        <div class="crisis-banner mb-xl" role="alert">
          <div class="crisis-icon">🆘</div>
          <div class="crisis-text">
            <h4>In crisis or need immediate help?</h4>
            <p>Reach out — real humans are available 24/7, always free.</p>
            <div class="crisis-actions">
              <a href="tel:988" class="crisis-btn" aria-label="Call 988 crisis hotline">📞 Call 988</a>
              <a href="sms:741741" class="crisis-btn" aria-label="Text crisis line">💬 Text 741741</a>
              <a href="https://www.crisistextline.org/" target="_blank" rel="noopener" class="crisis-btn" aria-label="Visit Crisis Text Line website">🌐 Chat Online</a>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-nav" role="tablist" aria-label="MindSpace sections">
          <button class="tab-btn ${currentTab === 'chat' ? 'active' : ''}" id="tab-chat" role="tab" aria-selected="${currentTab === 'chat'}" aria-controls="content-chat">💬 AI Support</button>
          <button class="tab-btn ${currentTab === 'mood' ? 'active' : ''}" id="tab-mood" role="tab" aria-selected="${currentTab === 'mood'}" aria-controls="content-mood">📊 Mood Tracker</button>
          <button class="tab-btn ${currentTab === 'exercises' ? 'active' : ''}" id="tab-exercises" role="tab" aria-selected="${currentTab === 'exercises'}" aria-controls="content-exercises">🧘 Exercises</button>
          <button class="tab-btn ${currentTab === 'breathing' ? 'active' : ''}" id="tab-breathing" role="tab" aria-selected="${currentTab === 'breathing'}" aria-controls="content-breathing">🫁 Breathing</button>
        </div>

        <!-- AI Support Chat -->
        <div class="tab-content ${currentTab === 'chat' ? 'active' : ''}" id="content-chat" role="tabpanel" aria-labelledby="tab-chat">
          <div class="chat-container" id="mindspace-chat-container">
            <div class="chat-header">
              <div class="chat-ai-avatar">N</div>
              <div class="chat-ai-info">
                <div class="chat-ai-name">NEXUS MindSpace</div>
                <div class="chat-ai-status">● Online — Always here for you</div>
              </div>
              <div class="emotion-bar" id="mindspace-emotion-bar" style="margin-left:auto; padding: 4px 12px; background: rgba(108,99,255,0.1); border-radius: 20px; border: none;">
                <div class="emotion-dot"></div>
                <span class="emotion-label" id="mindspace-emotion-label">Ready to listen</span>
              </div>
            </div>
            <div class="chat-messages" id="mindspace-messages" aria-live="polite" aria-label="Chat messages">
              <div class="chat-msg ai">
                <div class="msg-avatar">N</div>
                <div class="msg-bubble">
                  Hey ${user.name}! 💙 I'm your NEXUS mental health companion. This is a safe, private space.<br><br>
                  I can help you with:<br>
                  • Processing emotions and stress<br>
                  • Evidence-based CBT exercises<br>
                  • Grounding techniques<br>
                  • Just listening without judgment<br><br>
                  How are you feeling right now? You can be completely honest here.
                </div>
              </div>
            </div>
            <div class="chat-input-area">
              <div class="chat-suggestions" id="mindspace-suggestions">
                <button class="suggestion-chip" data-text="I'm feeling really stressed">😰 I'm stressed</button>
                <button class="suggestion-chip" data-text="I'm feeling anxious about my future">😟 Future anxiety</button>
                <button class="suggestion-chip" data-text="I just need someone to talk to">💬 Just talk</button>
                <button class="suggestion-chip" data-text="I need a grounding exercise">🌍 Ground me</button>
              </div>
              <div class="chat-input-row">
                <button class="chat-voice-btn" id="mindspace-voice-btn" aria-label="${NexusVoice.isSupported() ? 'Toggle voice input' : 'Voice not supported'}" ${NexusVoice.isSupported() ? '' : 'disabled'}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                </button>
                <textarea class="chat-input" id="mindspace-input" placeholder="Share what's on your mind..." rows="1" aria-label="Type your message" maxlength="1000"></textarea>
                <button class="chat-send-btn" id="mindspace-send" aria-label="Send message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mood Tracker -->
        <div class="tab-content ${currentTab === 'mood' ? 'active' : ''}" id="content-mood" role="tabpanel" aria-labelledby="tab-mood">
          ${!NexusDB.hasMoodToday() ? `
            <div class="mood-chart-card mb-lg" style="text-align: center; background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(108,99,255,0.05));">
              <div style="font-size: 3rem; margin-bottom: 12px;">🌟</div>
              <h3 style="font-family: var(--font-display); margin-bottom: 8px;">Log Today's Mood</h3>
              <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 20px;">How are you feeling right now? Just 10 seconds.</p>
              <button class="btn-primary" id="mindspace-mood-btn">Log My Mood +10 XP</button>
            </div>
          ` : `
            <div class="mood-chart-card mb-lg" style="background: rgba(6,214,160,0.05); border-color: rgba(6,214,160,0.2);">
              <div style="text-align: center; font-size: 2rem; margin-bottom: 8px;">${moods[0]?.emoji || '😊'}</div>
              <div style="text-align: center; font-weight: 600; margin-bottom: 4px;">Today's mood: ${moods[0]?.label || 'Logged'}</div>
              <div style="text-align: center; font-size: 0.8rem; color: var(--green);">✅ Check-in complete for today</div>
            </div>
          `}

          <!-- 30-Day Mood Calendar -->
          <div class="mood-chart-card mb-lg">
            <div class="mood-chart-header">
              <div>
                <div class="section-title" style="font-size:1rem;">30-Day Mood Calendar</div>
                <div class="section-subtitle">Tap any day to see details</div>
              </div>
            </div>
            <div id="mood-calendar" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 8px;">
              ${renderMoodCalendar(moods)}
            </div>
            <div style="display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap;">
              ${[['😄','Amazing'],['😊','Good'],['😐','Okay'],['😔','Low'],['😢','Hard']].map(([e,l]) => `<span style="font-size:0.72rem; color:var(--text-muted);">${e} ${l}</span>`).join('')}
            </div>
          </div>

          <!-- Mood History -->
          <div class="section-header mb-md">
            <div class="section-title" style="font-size:1rem;">Recent Check-ins</div>
            <span class="badge badge-purple">${moods.length} entries</span>
          </div>
          <div id="mood-history">
            ${moods.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">😊</div><div class="empty-state-title">No mood entries yet</div><div class="empty-state-desc">Log your first mood to start tracking your emotional patterns</div></div>` :
            moods.slice(0, 10).map(m => `
              <div class="goal-item" style="cursor:default;">
                <div style="font-size:1.5rem;">${m.emoji || '😊'}</div>
                <div class="goal-info">
                  <div class="goal-title">${m.label || 'Mood logged'}</div>
                  <div class="goal-meta">${m.note || 'No note added'}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.72rem; color:var(--text-muted);">${formatDate(m.timestamp)}</div>
                  <div style="font-size:0.8rem; font-weight:700; color:var(--purple-light);">${m.score}/5</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- CBT Exercises -->
        <div class="tab-content ${currentTab === 'exercises' ? 'active' : ''}" id="content-exercises" role="tabpanel" aria-labelledby="tab-exercises">
          <div class="section-header mb-md">
            <div>
              <div class="section-title" style="font-size:1rem;">Evidence-Based Tools</div>
              <div class="section-subtitle">CBT & mindfulness techniques used by therapists</div>
            </div>
          </div>
          <div class="grid-2 stagger">
            ${exercises.map((ex, i) => `
              <div class="cbt-card" data-exercise="${i}" role="button" tabindex="0" aria-label="Start ${ex.title} exercise">
                <div class="cbt-icon">${ex.emoji}</div>
                <div class="cbt-title">${ex.title}</div>
                <div class="cbt-desc">${ex.desc}</div>
                <div class="cbt-duration">⏱ ${ex.duration}</div>
                <div style="margin-top: 12px;">
                  <button class="btn-secondary btn-sm start-exercise-btn" data-index="${i}" aria-label="Start ${ex.title}">Start Exercise →</button>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- Exercise Modal -->
          <div id="exercise-modal" class="hidden" style="position:fixed;inset:0;background:rgba(10,11,30,0.95);backdrop-filter:blur(10px);z-index:1500;display:flex;align-items:center;justify-content:center;padding:20px;">
            <div class="grounding-card" id="exercise-content"></div>
          </div>
        </div>

        <!-- Breathing -->
        <div class="tab-content ${currentTab === 'breathing' ? 'active' : ''}" id="content-breathing" role="tabpanel" aria-labelledby="tab-breathing">
          <div style="max-width: 480px; margin: 0 auto;">
            <div class="card" style="text-align: center; margin-bottom: var(--space-lg);">
              <h2 style="font-family: var(--font-display); margin-bottom: 8px;">Box Breathing</h2>
              <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 24px;">Used by Navy SEALs, surgeons, and athletes to calm the nervous system instantly.</p>
              
              <div class="breathing-container">
                <div class="breathing-outer" id="breathing-visual">
                  <div class="breathing-bg"></div>
                  <div class="breathing-active" id="breathing-circle">
                    <span id="breathing-inner-text">Ready</span>
                  </div>
                </div>
                <div class="breathing-phase" id="breathing-phase">Press Start to begin</div>
                <div class="breathing-count" id="breathing-count">4</div>
              </div>
              
              <div style="display:flex; gap:12px; justify-content:center; margin-top: 24px;">
                <button class="btn-primary" id="breathing-start" aria-label="Start breathing exercise">Start Breathing</button>
                <button class="btn-ghost" id="breathing-stop" style="display:none;" aria-label="Stop breathing exercise">Stop</button>
              </div>
              
              <div style="margin-top: 24px; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
                <strong style="color: var(--text-secondary);">How it works:</strong> Inhale 4 counts → Hold 4 → Exhale 4 → Hold 4. Repeat 4 times for maximum effect.
              </div>
            </div>
            
            <!-- Benefit cards -->
            <div class="grid-2">
              ${[
                { emoji: '🧘', title: 'Reduces Cortisol', desc: 'Lowers stress hormones within 2 minutes' },
                { emoji: '❤️', title: 'Heart Rate Variability', desc: 'Improves nervous system regulation' },
                { emoji: '🧠', title: 'Prefrontal Cortex', desc: 'Activates rational thinking vs. fear response' },
                { emoji: '😴', title: 'Better Sleep', desc: 'Practice before bed for deeper sleep' }
              ].map(b => `
                <div class="card" style="text-align:center; padding: 16px;">
                  <div style="font-size:1.5rem; margin-bottom:6px;">${b.emoji}</div>
                  <div style="font-weight:600; font-size:0.85rem; margin-bottom:4px;">${b.title}</div>
                  <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4;">${b.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMoodCalendar(moods) {
    const cells = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const entry = moods.find(m => new Date(m.timestamp || '').toDateString() === dateStr);
      const colors = { 1: '#ff6b9d', 2: '#ff9f43', 3: '#ffd166', 4: '#06d6a0', 5: '#00d4ff' };
      const bg = entry ? colors[entry.score] || '#6c63ff' : 'rgba(255,255,255,0.05)';
      const label = d.getDate();
      cells.push(`<div title="${d.toLocaleDateString()} ${entry ? '— ' + entry.label : '— No check-in'}" style="width:100%;aspect-ratio:1;border-radius:6px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:${entry ? 'white' : 'var(--text-muted)'};font-weight:600;cursor:default;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${label}</div>`);
    }
    return cells.join('');
  }

  function formatDate(ts) {
    if (!ts) return 'Recently';
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }

  function startBreathing() {
    const phases = [
      { phase: 'Inhale', dur: 4, style: 'scale(1.4)' },
      { phase: 'Hold', dur: 4, style: 'scale(1.4)' },
      { phase: 'Exhale', dur: 4, style: 'scale(1)' },
      { phase: 'Hold', dur: 4, style: 'scale(1)' }
    ];
    let phaseIdx = 0;
    let count = 4;
    let cycles = 0;
    
    const circle = document.getElementById('breathing-circle');
    const phaseEl = document.getElementById('breathing-phase');
    const countEl = document.getElementById('breathing-count');
    const innerText = document.getElementById('breathing-inner-text');
    
    document.getElementById('breathing-start').style.display = 'none';
    document.getElementById('breathing-stop').style.display = 'inline-flex';
    
    function runPhase() {
      const p = phases[phaseIdx];
      if (phaseEl) phaseEl.textContent = p.phase;
      if (innerText) innerText.textContent = p.phase;
      if (circle) { circle.style.transition = `transform ${p.dur * 0.9}s ease-in-out`; circle.style.transform = p.style; }
      count = p.dur;
      if (countEl) countEl.textContent = count;
    }
    
    runPhase();
    
    breathingInterval = setInterval(() => {
      count--;
      if (countEl) countEl.textContent = count;
      if (count <= 0) {
        phaseIdx = (phaseIdx + 1) % phases.length;
        if (phaseIdx === 0) {
          cycles++;
          if (cycles >= 4) {
            stopBreathing();
            NexusApp.showToast('Breathing exercise complete! +15 XP 🫁', 'success');
            NexusDB.addXP(15);
            NexusApp.checkAchievements();
            if (phaseEl) phaseEl.textContent = 'Complete! Well done 🌟';
            if (countEl) countEl.textContent = '';
            if (innerText) innerText.textContent = '🌟';
            return;
          }
        }
        runPhase();
      }
    }, 1000);
  }

  function stopBreathing() {
    clearInterval(breathingInterval);
    const startBtn = document.getElementById('breathing-start');
    const stopBtn = document.getElementById('breathing-stop');
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';
    const circle = document.getElementById('breathing-circle');
    if (circle) circle.style.transform = 'scale(1)';
  }

  function showExercise(index) {
    const exercises = NexusAI.getKB().cbt_exercises;
    const ex = exercises[index];
    if (!ex) return;
    
    const modal = document.getElementById('exercise-modal');
    const content = document.getElementById('exercise-content');
    if (!modal || !content) return;
    
    let stepIndex = -1;
    
    function renderStep() {
      if (stepIndex === -1) {
        content.innerHTML = `
          <div class="grounding-step">${ex.emoji}</div>
          <div class="grounding-instruction">${ex.title}</div>
          <div class="grounding-prompt">${ex.desc}</div>
          <div style="background: rgba(108,99,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
            ${ex.steps.map((s, i) => `<div style="padding: 6px 0; font-size: 0.875rem; color: var(--text-secondary); border-bottom: ${i < ex.steps.length-1 ? '1px solid var(--border)' : 'none'};">⏱ Step ${i+1}: ${s}</div>`).join('')}
          </div>
          <div style="display:flex; gap:12px; justify-content:center;">
            <button class="btn-primary" id="ex-start-btn">Begin Exercise</button>
            <button class="btn-ghost" id="ex-close-btn">Cancel</button>
          </div>
        `;
        document.getElementById('ex-start-btn')?.addEventListener('click', () => { stepIndex = 0; renderStep(); });
        document.getElementById('ex-close-btn')?.addEventListener('click', () => { modal.classList.add('hidden'); });
      } else if (stepIndex < ex.steps.length) {
        const step = ex.steps[stepIndex];
        content.innerHTML = `
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:16px;">Step ${stepIndex+1} of ${ex.steps.length}</div>
          <div class="grounding-step">${ex.emoji}</div>
          <div class="grounding-instruction" style="font-size:1.2rem;">${step}</div>
          <div class="grounding-prompt">Take your time. There's no rush. When you're ready, continue.</div>
          <div class="grounding-inputs">
            <input class="grounding-input" placeholder="What do you notice? (optional)" />
          </div>
          <div style="display:flex; gap:12px; justify-content:center;">
            <button class="btn-primary" id="ex-next-btn">${stepIndex < ex.steps.length - 1 ? 'Next Step →' : 'Complete ✨'}</button>
            <button class="btn-ghost" id="ex-close2-btn">Exit</button>
          </div>
        `;
        document.getElementById('ex-next-btn')?.addEventListener('click', () => { stepIndex++; renderStep(); });
        document.getElementById('ex-close2-btn')?.addEventListener('click', () => { modal.classList.add('hidden'); });
      } else {
        NexusDB.addXP(25);
        NexusApp.checkAchievements();
        content.innerHTML = `
          <div style="font-size:3rem;margin-bottom:16px;animation:floatUp 3s ease-in-out infinite;">🌟</div>
          <div class="grounding-instruction">Exercise Complete!</div>
          <div class="grounding-prompt">You just invested in your mental health. That matters. How do you feel compared to when you started?</div>
          <div style="background:rgba(6,214,160,0.1);border:1px solid rgba(6,214,160,0.3);border-radius:12px;padding:16px;margin-bottom:24px;">
            <div style="color:var(--green);font-weight:600;margin-bottom:4px;">+25 XP Earned! 🎉</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);">Regular practice builds resilience. Try one exercise daily for best results.</div>
          </div>
          <button class="btn-primary" id="ex-done-btn" style="width:100%;">Done</button>
        `;
        NexusApp.showToast(`${ex.title} complete! +25 XP 🧘`, 'success');
        document.getElementById('ex-done-btn')?.addEventListener('click', () => { modal.classList.add('hidden'); });
      }
    }
    
    renderStep();
    modal.classList.remove('hidden');
  }

  async function sendChatMessage(msgText) {
    const messages = document.getElementById('mindspace-messages');
    const input = document.getElementById('mindspace-input');
    const sendBtn = document.getElementById('mindspace-send');
    if (!messages || !msgText.trim()) return;

    // Add user message
    appendMessage(messages, 'user', msgText, NexusDB.getUser()?.avatar || 'U');
    if (input) { input.value = ''; input.style.height = 'auto'; }
    if (sendBtn) sendBtn.disabled = true;

    // Update emotion bar
    const emotion = NexusAI.detectEmotion(msgText);
    const emotionLabel = document.getElementById('mindspace-emotion-label');
    if (emotionLabel) emotionLabel.textContent = NexusAI.getEmotionLabel(emotion);

    // Typing indicator
    const typingEl = addTypingIndicator(messages);
    messages.scrollTop = messages.scrollHeight;

    // Get AI response
    await NexusAI.thinkingDelay(msgText);
    const response = await NexusAI.chat(msgText, 'mindspace');
    
    typingEl.remove();

    // Crisis response
    if (response.isCrisis) {
      const crisisBanner = document.createElement('div');
      crisisBanner.className = 'crisis-banner';
      crisisBanner.innerHTML = `
        <div class="crisis-icon">💙</div>
        <div class="crisis-text">
          <h4>Immediate support is available</h4>
          <div class="crisis-actions">
            <a href="tel:988" class="crisis-btn">📞 988</a>
            <a href="sms:741741" class="crisis-btn">💬 Text 741741</a>
          </div>
        </div>
      `;
      messages.appendChild(crisisBanner);
    }

    appendMessage(messages, 'ai', response.text, 'N');
    messages.scrollTop = messages.scrollHeight;
    if (sendBtn) sendBtn.disabled = false;

    // Voice response
    if (NexusDB.getSettings().voice && response.text.length < 300) {
      NexusVoice.speak(response.text);
    }

    // Save conversation
    const history = NexusDB.getConversation('mindspace');
    NexusDB.saveConversation('mindspace', [...history, { role: 'user', text: msgText }, { role: 'ai', text: response.text }]);
    
    NexusDB.addXP(5);
    NexusApp.updateNavStats();
  }

  function appendMessage(container, role, text, avatar) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>').replace(/• /g, '<li style="margin-left:16px;">').replace(/- /g, '<li style="margin-left:16px;">');
    div.innerHTML = `
      <div class="msg-avatar">${avatar}</div>
      <div class="msg-bubble">${htmlText}</div>
    `;
    container.appendChild(div);
  }

  function addTypingIndicator(container) {
    const div = document.createElement('div');
    div.className = 'chat-msg ai';
    div.innerHTML = `
      <div class="msg-avatar">N</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    container.appendChild(div);
    return div;
  }

  function afterRender() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.id.replace('tab-', '');
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        document.getElementById(`content-${tab}`)?.classList.add('active');
      });
    });

    // Chat input
    const input = document.getElementById('mindspace-input');
    const sendBtn = document.getElementById('mindspace-send');
    
    if (input) {
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn?.click(); }
      });
    }
    
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const text = input?.value.trim();
        if (text) sendChatMessage(text);
      });
    }

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.text;
        if (input) input.value = text;
        sendBtn?.click();
        document.getElementById('mindspace-suggestions')?.remove();
      });
    });

    // Voice input
    const voiceBtn = document.getElementById('mindspace-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (NexusVoice.isListening()) {
          NexusVoice.stopListening();
          voiceBtn.classList.remove('recording');
        } else {
          NexusVoice.startListening(
            (transcript, isFinal) => { if (input) input.value = transcript; },
            () => { voiceBtn.classList.remove('recording'); if (input?.value) sendBtn?.click(); },
            (err) => { NexusApp.showToast('Voice error: ' + err, 'error'); voiceBtn.classList.remove('recording'); }
          );
          voiceBtn.classList.add('recording');
        }
      });
    }

    // Mood button
    document.getElementById('mindspace-mood-btn')?.addEventListener('click', () => NexusApp.showMoodOverlay());

    // Exercise buttons
    document.querySelectorAll('.start-exercise-btn').forEach(btn => {
      btn.addEventListener('click', () => showExercise(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('.cbt-card').forEach(card => {
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.querySelector('.start-exercise-btn')?.click(); });
    });

    // Breathing
    document.getElementById('breathing-start')?.addEventListener('click', startBreathing);
    document.getElementById('breathing-stop')?.addEventListener('click', stopBreathing);
  }

  return { render, afterRender };
})();

window.MindspaceModule = MindspaceModule;
