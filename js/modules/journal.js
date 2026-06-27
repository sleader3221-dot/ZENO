/* ===================================================
   NEXUS — AI Journal Module
   =================================================== */

const JournalModule = (() => {
  let currentView = 'write';

  function render() {
    const entries = NexusDB.getJournalEntries();
    const prompts = [
      'What\'s one thing that surprised you about yourself today?',
      'Describe a moment from today that you want to remember.',
      'What\'s something you\'re worried about, and what\'s actually in your control?',
      'What would you tell your 10-year-old self right now?',
      'What are three things you\'re grateful for today — be specific.',
      'What\'s one belief about yourself you\'d like to challenge?',
      'Where do you want to be in 1 year, and what\'s your next step?',
      'Who showed up for you recently, and how can you show up for yourself?',
      'What emotions did you experience today? Try to name them precisely.',
      'What would you do differently if you weren\'t afraid?'
    ];
    const todayPrompt = prompts[new Date().getDate() % prompts.length];

    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-rose">📓 AI Journal</span>
          <h1 class="module-hero" style="background: var(--grad-rose); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Your Private AI Journal</h1>
          <p>Write freely, think clearly, and receive AI-powered reflections that help you grow. Your journal stays on your device — always private.</p>
        </div>

        <!-- Stats -->
        <div class="grid-3 mb-xl">
          <div class="stat-card" style="border-top:3px solid var(--rose);">
            <div class="stat-icon">📝</div>
            <div class="stat-value" style="color:var(--rose);">${entries.length}</div>
            <div class="stat-label">Journal Entries</div>
          </div>
          <div class="stat-card" style="border-top:3px solid var(--purple);">
            <div class="stat-icon">💬</div>
            <div class="stat-value text-gradient-purple">${entries.reduce((a,b)=>a+(b.wordCount||0),0)}</div>
            <div class="stat-label">Total Words Written</div>
          </div>
          <div class="stat-card" style="border-top:3px solid var(--green);">
            <div class="stat-icon">📅</div>
            <div class="stat-value" style="color:var(--green);">${getStreak(entries)}</div>
            <div class="stat-label">Writing Streak</div>
          </div>
        </div>

        <!-- View Switcher -->
        <div style="display:flex;gap:8px;margin-bottom:24px;">
          <button class="tab-btn ${currentView==='write'?'active':''}" id="jn-write-btn">✍️ Write</button>
          <button class="tab-btn ${currentView==='entries'?'active':''}" id="jn-entries-btn">📚 Past Entries (${entries.length})</button>
        </div>

        <!-- Write View -->
        <div id="jn-write-view" ${currentView !== 'write' ? 'style="display:none;"' : ''}>
          <!-- Daily Prompt -->
          <div class="card mb-lg" style="background:linear-gradient(135deg,rgba(255,107,157,0.08),rgba(108,99,255,0.05));border-color:rgba(255,107,157,0.2);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span style="font-size:1.2rem;">✨</span>
              <div style="font-size:0.8rem;font-weight:600;color:var(--rose);text-transform:uppercase;letter-spacing:0.08em;">Today's Prompt</div>
            </div>
            <div style="font-size:1rem;color:var(--text-secondary);line-height:1.7;font-style:italic;">"${todayPrompt}"</div>
            <button class="btn-ghost btn-sm" id="use-prompt" style="margin-top:8px;padding:4px 12px;">Use this prompt</button>
          </div>

          <!-- Journal Entry Area -->
          <div class="card mb-lg" style="padding:0;overflow:hidden;">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.9rem;">New Journal Entry</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
              </div>
              <select id="journal-mood-select" class="input-field" style="width:auto;padding:6px 12px;font-size:0.8rem;" aria-label="Select mood for journal entry">
                <option value="">How are you feeling? (optional)</option>
                <option value="😄">😄 Amazing</option>
                <option value="😊">😊 Good</option>
                <option value="😐">😐 Okay</option>
                <option value="😔">😔 Low</option>
                <option value="😢">😢 Struggling</option>
              </select>
            </div>
            <div style="padding:20px;">
              <textarea class="journal-write-area" id="journal-entry" placeholder="Start writing here... Your thoughts are safe. Write anything — stream of consciousness, reflections, hopes, fears. NEXUS AI will offer a thoughtful reflection when you're done." aria-label="Journal entry text"></textarea>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
                <div id="word-count" style="font-size:0.72rem;color:var(--text-muted);">0 words</div>
                <div style="display:flex;gap:8px;">
                  <button class="btn-ghost btn-sm" id="journal-voice-btn" aria-label="${NexusVoice.isSupported()?'Voice input':'Voice not supported'}" ${NexusVoice.isSupported()?'':'disabled'}>🎤 Voice</button>
                  <button class="btn-primary" id="save-journal">Save & Get AI Reflection ✨</button>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Reflection output -->
          <div id="journal-ai-output" class="hidden"></div>
        </div>

        <!-- Past Entries View -->
        <div id="jn-entries-view" ${currentView !== 'entries' ? 'style="display:none;"' : ''}>
          ${entries.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📓</div>
              <div class="empty-state-title">Your journal is empty</div>
              <div class="empty-state-desc">Write your first entry to start building self-awareness and receive AI insights</div>
              <button class="btn-primary" style="margin-top:16px;" onclick="document.getElementById('jn-write-btn').click()">Write First Entry ✍️</button>
            </div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${entries.map(e => `
                <div class="journal-entry-card" onclick="this.querySelector('.entry-full').classList.toggle('hidden');" role="button" tabindex="0" aria-expanded="false" aria-label="Journal entry from ${new Date(e.date).toLocaleDateString()}">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;">
                    <div class="journal-entry-date">${new Date(e.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      ${e.moodEmoji ? `<div class="journal-entry-mood">${e.moodEmoji}</div>` : ''}
                      ${e.sentiment ? `<div class="journal-sentiment sentiment-${e.sentiment}">${{positive:'😊 Positive',neutral:'😐 Neutral',negative:'💙 Processing'}[e.sentiment] || e.sentiment}</div>` : ''}
                    </div>
                  </div>
                  <div class="journal-entry-preview">${(e.text || '').slice(0,180)}${(e.text||'').length>180?'...':''}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">${e.wordCount || 0} words</div>
                  <div class="entry-full hidden" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
                    <div style="font-size:0.875rem;color:var(--text-secondary);line-height:1.8;white-space:pre-wrap;">${e.text || ''}</div>
                    ${e.aiReflection ? `
                      <div class="journal-ai-response" style="margin-top:12px;">
                        <div class="jar-header">
                          <div class="ai-insight-icon">N</div>
                          <div class="jar-ai-name">NEXUS Reflection</div>
                        </div>
                        <div class="jar-body">${e.aiReflection}</div>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  function getStreak(entries) {
    if (!entries.length) return 0;
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = d.toDateString();
      if (entries.some(e => new Date(e.date).toDateString() === dateStr)) {
        streak++;
      } else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  function afterRender() {
    // View switching
    document.getElementById('jn-write-btn')?.addEventListener('click', () => {
      currentView = 'write';
      document.getElementById('jn-write-view').style.display = '';
      document.getElementById('jn-entries-view').style.display = 'none';
      document.getElementById('jn-write-btn').classList.add('active');
      document.getElementById('jn-entries-btn').classList.remove('active');
    });
    document.getElementById('jn-entries-btn')?.addEventListener('click', () => {
      currentView = 'entries';
      document.getElementById('jn-write-view').style.display = 'none';
      document.getElementById('jn-entries-view').style.display = '';
      document.getElementById('jn-entries-btn').classList.add('active');
      document.getElementById('jn-write-btn').classList.remove('active');
    });

    // Use prompt
    const journalInput = document.getElementById('journal-entry');
    document.getElementById('use-prompt')?.addEventListener('click', () => {
      if (journalInput && !journalInput.value.trim()) {
        journalInput.value = '';
        journalInput.focus();
      }
    });

    // Word count
    journalInput?.addEventListener('input', () => {
      const words = journalInput.value.trim().split(/\s+/).filter(Boolean).length;
      const el = document.getElementById('word-count');
      if (el) el.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });

    // Voice input
    document.getElementById('journal-voice-btn')?.addEventListener('click', () => {
      if (NexusVoice.isListening()) {
        NexusVoice.stopListening();
      } else {
        NexusVoice.startListening(
          (t) => { if (journalInput) { journalInput.value += (journalInput.value ? ' ' : '') + t; journalInput.dispatchEvent(new Event('input')); }},
          () => {},
          (err) => NexusApp.showToast('Voice error: ' + err, 'error')
        );
      }
    });

    // Save journal entry
    document.getElementById('save-journal')?.addEventListener('click', async () => {
      const text = journalInput?.value?.trim();
      if (!text || text.length < 10) { NexusApp.showToast('Write at least a few sentences first 📝', 'error'); return; }
      
      const moodEmoji = document.getElementById('journal-mood-select')?.value;
      const analysis = NexusAI.analyzeJournalEntry(text);
      
      const entry = NexusDB.addJournalEntry({
        text,
        moodEmoji,
        sentiment: analysis.sentiment,
        emotion: analysis.emotion,
        wordCount: analysis.wordCount,
        aiReflection: analysis.aiResponse
      });
      
      // Show AI reflection
      const outputEl = document.getElementById('journal-ai-output');
      if (outputEl) {
        outputEl.classList.remove('hidden');
        outputEl.innerHTML = `
          <div class="journal-ai-response animate-fade-in">
            <div class="jar-header">
              <div class="ai-insight-icon" style="background:var(--grad-rose);">N</div>
              <div>
                <div class="jar-ai-name">NEXUS Reflection</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">Based on your entry • ${analysis.wordCount} words</div>
              </div>
              <div style="margin-left:auto;"><span class="journal-sentiment sentiment-${analysis.sentiment}">${{positive:'😊 Positive',neutral:'😐 Neutral',negative:'💙 Processing'}[analysis.sentiment]}</span></div>
            </div>
            <div class="jar-body">${analysis.aiResponse.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:8px;">
              <button class="btn-primary btn-sm" onclick="document.getElementById('journal-entry').value='';document.getElementById('journal-ai-output').classList.add('hidden');document.getElementById('word-count').textContent='0 words';">Write Another ✍️</button>
              <button class="btn-secondary btn-sm" onclick="document.getElementById('jn-entries-btn').click();">View All Entries</button>
            </div>
          </div>
        `;
      }
      
      NexusDB.addXP(20);
      NexusApp.showToast('Journal saved! +20 XP 📓', 'success');
      NexusApp.checkAchievements();
      NexusApp.updateNavStats();
    });

    // Entry keyboard handler
    document.querySelectorAll('.journal-entry-card').forEach(card => {
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.click(); });
    });
  }

  return { render, afterRender };
})();

window.JournalModule = JournalModule;
