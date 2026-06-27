/* ===================================================
   NEXUS — CareerLab Module
   =================================================== */

const CareerlabModule = (() => {
  let currentTab = 'explore';
  let resumeStep = 0;
  let resumeData = {};
  let interviewStep = 0;
  let selectedCareer = null;
  let currentInterviewAnswer = '';

  const interviewQuestions = [
    { q: 'Tell me about yourself.', tip: 'Keep it 60 seconds: who you are, what you\'ve done, and what you\'re excited about.' },
    { q: 'What is your greatest strength?', tip: 'Be specific. "I\'m a quick learner" is weak. "I taught myself Python in 3 months" is powerful.' },
    { q: 'Tell me about a time you faced a challenge and overcame it.', tip: 'Use STAR: Situation → Task → Action → Result. Quantify your impact.' },
    { q: 'Where do you see yourself in 5 years?', tip: 'Show ambition but be realistic. Connect it to the role you\'re interviewing for.' },
    { q: 'Why do you want this internship/job?', tip: 'Research the company. Be specific about their mission and how it aligns with yours.' },
    { q: 'What\'s your greatest weakness?', tip: 'Pick a real weakness and show how you\'re actively working on it.' }
  ];

  function render() {
    const careers = NexusAI.getKB().careers;
    const scholarships = NexusAI.getKB().scholarships;
    const savedResume = NexusDB.getResumeData();
    const careerProfile = NexusDB.getCareerProfile();

    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-teal">💼 CareerLab</span>
          <h1 class="module-hero" style="background: var(--grad-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Career Planning & Tools</h1>
          <p>Explore careers, build your resume, practice interviews, and find scholarships — everything you need to plan your future with confidence.</p>
        </div>

        <!-- Stats Row -->
        <div class="grid-4 mb-xl stagger">
          <div class="stat-card" style="border-top: 3px solid var(--teal);">
            <div class="stat-icon">🎯</div>
            <div class="stat-value text-gradient-teal">${careers.length}+</div>
            <div class="stat-label">Career Paths</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--gold);">
            <div class="stat-icon">🎓</div>
            <div class="stat-value text-gradient-gold">${scholarships.length}</div>
            <div class="stat-label">Scholarships</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--green);">
            <div class="stat-icon">📄</div>
            <div class="stat-value" style="background: var(--grad-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${savedResume.name ? '1' : '0'}</div>
            <div class="stat-label">Resume Drafted</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--purple);">
            <div class="stat-icon">🎤</div>
            <div class="stat-value text-gradient-purple">${interviewQuestions.length}</div>
            <div class="stat-label">Interview Qs</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-nav" role="tablist">
          <button class="tab-btn ${currentTab === 'explore' ? 'active' : ''}" id="cl-tab-explore" role="tab" aria-selected="${currentTab === 'explore'}">🗺️ Explore</button>
          <button class="tab-btn ${currentTab === 'resume' ? 'active' : ''}" id="cl-tab-resume" role="tab" aria-selected="${currentTab === 'resume'}">📄 Resume</button>
          <button class="tab-btn ${currentTab === 'interview' ? 'active' : ''}" id="cl-tab-interview" role="tab" aria-selected="${currentTab === 'interview'}">🎤 Interview</button>
          <button class="tab-btn ${currentTab === 'scholarship' ? 'active' : ''}" id="cl-tab-scholarship" role="tab" aria-selected="${currentTab === 'scholarship'}">🎓 Scholarships</button>
          <button class="tab-btn ${currentTab === 'chat' ? 'active' : ''}" id="cl-tab-chat" role="tab" aria-selected="${currentTab === 'chat'}">💬 AI Coach</button>
        </div>

        <!-- Explore Careers -->
        <div class="tab-content ${currentTab === 'explore' ? 'active' : ''}" id="cl-content-explore">
          <div style="display:flex; gap:12px; align-items:center; margin-bottom:20px; flex-wrap:wrap;">
            <input type="text" id="career-search" class="input-field" placeholder="🔍 Search careers..." style="max-width:300px;" aria-label="Search careers" />
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${['All','Tech','Healthcare','Business','Creative','Education'].map((f,i) => `<button class="tab-btn ${i===0?'active':''} career-filter" data-filter="${f.toLowerCase()}" style="padding:6px 14px; font-size:0.78rem;">${f}</button>`).join('')}
            </div>
          </div>
          <div class="grid-auto stagger" id="careers-grid">
            ${careers.map(c => `
              <div class="career-path-card" data-career-id="${c.id}" tabindex="0" role="button" aria-label="View ${c.title} career">
                <div class="career-icon">${c.emoji}</div>
                <div class="career-title">${c.title}</div>
                <div class="career-salary">💰 ${c.salary}</div>
                <div class="career-outlook">📈 ${c.outlook}</div>
                <div class="career-tags">
                  ${c.skills.slice(0,3).map(s => `<span class="badge badge-teal">${s}</span>`).join('')}
                </div>
                <div style="margin-top:12px; font-size:0.8rem; color:var(--text-muted); line-height:1.5;">${c.desc}</div>
                <button class="btn-secondary btn-sm" style="margin-top:12px; width:100%;" data-career="${c.id}">Explore Path →</button>
              </div>
            `).join('')}
          </div>
          
          <!-- Career Detail Modal -->
          <div id="career-modal" class="hidden" style="position:fixed;inset:0;background:rgba(10,11,30,0.95);backdrop-filter:blur(10px);z-index:1500;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;">
            <div style="max-width:540px;width:100%;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-2xl);padding:var(--space-2xl);animation:scaleIn 0.3s var(--ease-spring);" id="career-modal-content"></div>
          </div>
        </div>

        <!-- Resume Builder -->
        <div class="tab-content ${currentTab === 'resume' ? 'active' : ''}" id="cl-content-resume">
          <div class="grid-2" style="gap:24px;">
            <div>
              <div class="section-header mb-md">
                <div class="section-title" style="font-size:1rem;">Build Your Resume</div>
                <span class="badge badge-teal">AI-Powered</span>
              </div>
              <div id="resume-builder-form">
                ${renderResumeForm(savedResume)}
              </div>
            </div>
            <div>
              <div class="section-header mb-md">
                <div class="section-title" style="font-size:1rem;">Live Preview</div>
                <button class="btn-ghost btn-sm" id="resume-download" aria-label="Download resume as text">⬇ Download</button>
              </div>
              <div class="resume-preview" id="resume-preview">
                ${renderResumePreview(savedResume)}
              </div>
              <div style="margin-top:12px;">
                <div class="card" style="padding:12px;">
                  <div style="font-size:0.78rem; font-weight:600; color:var(--teal); margin-bottom:6px;">✅ ATS Optimization Tips</div>
                  <div style="font-size:0.75rem; color:var(--text-muted); line-height:1.6;">
                    • Use keywords from job descriptions<br>
                    • Avoid images, tables, or columns<br>
                    • Use standard fonts (Arial, Calibri)<br>
                    • Quantify achievements with numbers<br>
                    • Save as .docx or .pdf
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interview Coach -->
        <div class="tab-content ${currentTab === 'interview' ? 'active' : ''}" id="cl-content-interview">
          <div class="section-header mb-lg">
            <div>
              <div class="section-title" style="font-size:1rem;">AI Mock Interview</div>
              <div class="section-subtitle">Question ${interviewStep + 1} of ${interviewQuestions.length}</div>
            </div>
            <button class="btn-ghost btn-sm" id="reset-interview">Reset</button>
          </div>
          
          <div class="interview-question mb-lg">
            <div class="iq-label">Interview Question ${interviewStep + 1}</div>
            <div class="iq-question" id="current-question">${interviewQuestions[interviewStep]?.q || 'All questions complete!'}</div>
            <div class="iq-tip" id="current-tip">💡 ${interviewQuestions[interviewStep]?.tip || ''}</div>
          </div>
          
          <div class="input-group mb-md">
            <label class="input-label" for="interview-answer">Your Answer</label>
            <textarea class="input-field" id="interview-answer" placeholder="Type your answer here... Take your time. Structure it well." style="min-height:160px; resize:vertical;" aria-label="Your interview answer"></textarea>
          </div>
          <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px;">
            <button class="btn-primary" id="submit-answer">Get AI Feedback →</button>
            <button class="btn-ghost" id="next-question">Skip Question</button>
          </div>
          
          <div id="interview-feedback" class="hidden"></div>
          
          <!-- Progress tracker -->
          <div class="progress-bar mt-lg">
            <div class="progress-fill" style="width:${((interviewStep)/interviewQuestions.length)*100}%;"></div>
          </div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">${interviewStep}/${interviewQuestions.length} questions practiced</div>
        </div>

        <!-- Scholarships -->
        <div class="tab-content ${currentTab === 'scholarship' ? 'active' : ''}" id="cl-content-scholarship">
          <div class="card mb-lg" style="background: linear-gradient(135deg, rgba(255,209,102,0.1), rgba(255,159,67,0.05)); border-color: rgba(255,209,102,0.25);">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
              <span style="font-size:2rem;">🎓</span>
              <div>
                <div style="font-weight:700; margin-bottom:2px;">$1.7 Billion in Unclaimed Scholarships</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">Every year. Most students don't apply because they think they won't qualify. You probably do.</div>
              </div>
            </div>
            <button class="btn-sm btn-gold" id="find-scholarships" style="background: var(--grad-gold); color: var(--bg-primary); font-weight: 700; padding: 8px 20px; border-radius: 99px; border: none; cursor: pointer; font-family: var(--font-body);">Find My Scholarships →</button>
          </div>
          
          <div class="grid-auto stagger" id="scholarship-list">
            ${scholarships.map(s => `
              <div class="scholarship-card">
                <div class="scholarship-amount">${s.amount}</div>
                <div class="scholarship-name">${s.name}</div>
                <div class="scholarship-org">${s.org}</div>
                <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; margin-bottom:12px;">${s.desc}</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
                  ${s.tags.map(t => `<span class="badge badge-gold">${t}</span>`).join('')}
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <span class="scholarship-deadline deadline-${s.deadline.includes('October') || s.deadline.includes('September') ? 'soon' : 'ok'}">📅 ${s.deadline}</span>
                  <button class="btn-secondary btn-sm draft-essay-btn" data-scholarship="${s.name}" aria-label="Draft essay for ${s.name}">Draft Essay</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Career Chat -->
        <div class="tab-content ${currentTab === 'chat' ? 'active' : ''}" id="cl-content-chat">
          <div class="chat-container" id="career-chat-container">
            <div class="chat-header">
              <div class="chat-ai-avatar">N</div>
              <div class="chat-ai-info">
                <div class="chat-ai-name">NEXUS Career Coach</div>
                <div class="chat-ai-status">● Expert guidance for your career journey</div>
              </div>
            </div>
            <div class="chat-messages" id="career-messages" aria-live="polite">
              <div class="chat-msg ai">
                <div class="msg-avatar">N</div>
                <div class="msg-bubble">
                  Hey! I'm your AI career coach. I can help you with:<br><br>
                  • Finding careers that match your interests and values<br>
                  • Building and optimizing your resume<br>
                  • Practicing for interviews<br>
                  • Finding scholarships and financial aid<br>
                  • Creating a career roadmap<br><br>
                  What's on your career mind today?
                </div>
              </div>
            </div>
            <div class="chat-input-area">
              <div class="chat-suggestions">
                <button class="cl-suggestion" data-text="What careers match someone who loves helping people?">🤝 People-oriented careers</button>
                <button class="cl-suggestion" data-text="How do I write a strong resume with no experience?">📄 No-experience resume</button>
                <button class="cl-suggestion" data-text="What scholarships can I get as a first-gen student?">🎓 First-gen scholarships</button>
              </div>
              <div class="chat-input-row" style="margin-top:8px;">
                <textarea class="chat-input" id="career-input" placeholder="Ask me anything about your career..." rows="1" aria-label="Career question" maxlength="500"></textarea>
                <button class="chat-send-btn" id="career-send" aria-label="Send">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderResumeForm(saved) {
    return `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="input-group">
          <label class="input-label" for="res-name">Full Name</label>
          <input type="text" id="res-name" class="input-field" placeholder="Alex Johnson" value="${saved.name || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="res-email">Email</label>
          <input type="email" id="res-email" class="input-field" placeholder="alex@email.com" value="${saved.email || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="res-grade">Grade / Year</label>
          <input type="text" id="res-grade" class="input-field" placeholder="11th grade / Sophomore" value="${saved.grade || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="res-interests">Interests & Strengths</label>
          <input type="text" id="res-interests" class="input-field" placeholder="Technology, leadership, art..." value="${saved.interests || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="res-goal">Career Goal</label>
          <input type="text" id="res-goal" class="input-field" placeholder="Software Engineer at a startup" value="${saved.goal || ''}" />
        </div>
        <div class="input-group">
          <label class="input-label" for="res-experience">Experience / Activities (one per line)</label>
          <textarea id="res-experience" class="input-field" placeholder="Volunteer at food bank&#10;Coding club president&#10;Part-time job at café" style="min-height:100px;" aria-label="Experience and activities">${saved.experience || ''}</textarea>
        </div>
        <div class="input-group">
          <label class="input-label" for="res-skills">Skills (comma-separated)</label>
          <input type="text" id="res-skills" class="input-field" placeholder="Python, Excel, Public Speaking" value="${saved.skills || ''}" />
        </div>
        <button class="btn-primary" id="generate-resume">✨ Generate AI Resume</button>
        <button class="btn-ghost btn-sm" id="clear-resume">Clear</button>
      </div>
    `;
  }

  function renderResumePreview(data) {
    if (!data.name) return '<div style="text-align:center; color:#999; padding:40px 20px; font-size:0.875rem;">Fill in the form and click Generate to see your resume here</div>';
    const resume = NexusAI.generateResume(data);
    const expLines = typeof data.experience === 'string' ? data.experience.split('\n').filter(l => l.trim()) : [];
    return `
      <h1>${resume.name}</h1>
      <div class="resume-contact">${data.email || 'youremail@email.com'} | linkedin.com/in/${(data.name || 'yourname').toLowerCase().replace(/\s/g,'')} | (555) 000-0000</div>
      <h2>Objective</h2>
      <p>${resume.objective}</p>
      <h2>Education</h2>
      <p><strong>Your High School</strong> — Expected 2026 | GPA: 3.8+</p>
      ${expLines.length > 0 ? `<h2>Experience & Activities</h2><ul>${expLines.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
      <h2>Skills</h2>
      <p>${(data.skills || 'JavaScript, Microsoft Office, Communication, Leadership').split(',').map(s => s.trim()).filter(Boolean).join(' • ')}</p>
    `;
  }

  function afterRender() {
    // Tab switching
    ['explore','resume','interview','scholarship','chat'].forEach(tab => {
      document.getElementById(`cl-tab-${tab}`)?.addEventListener('click', () => {
        currentTab = tab;
        document.querySelectorAll('[id^="cl-tab-"]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        document.querySelectorAll('[id^="cl-content-"]').forEach(c => c.classList.remove('active'));
        document.getElementById(`cl-tab-${tab}`)?.classList.add('active');
        document.getElementById(`cl-tab-${tab}`)?.setAttribute('aria-selected','true');
        document.getElementById(`cl-content-${tab}`)?.classList.add('active');
      });
    });

    // Career search
    const searchInput = document.getElementById('career-search');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('.career-path-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });

    // Career filter
    document.querySelectorAll('.career-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.career-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Career card clicks
    document.querySelectorAll('[data-career]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.career;
        const career = NexusAI.getKB().careers.find(c => c.id === id);
        if (!career) return;
        const modal = document.getElementById('career-modal');
        const content = document.getElementById('career-modal-content');
        if (!modal || !content) return;
        content.innerHTML = `
          <div style="font-size:4rem;text-align:center;margin-bottom:16px;">${career.emoji}</div>
          <h2 style="font-family:var(--font-display);text-align:center;margin-bottom:8px;">${career.title}</h2>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
            <span class="badge badge-green">💰 ${career.salary}</span>
            <span class="badge badge-teal">📈 ${career.outlook}</span>
          </div>
          <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:20px;">${career.desc}</p>
          <div style="margin-bottom:20px;">
            <div style="font-weight:600;margin-bottom:8px;font-size:0.875rem;">Key Skills Needed</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">${career.skills.map(s=>`<span class="badge badge-purple">${s}</span>`).join('')}</div>
          </div>
          <div style="background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:16px;margin-bottom:20px;">
            <div style="font-size:0.8rem;font-weight:600;color:var(--teal);margin-bottom:8px;">🗺️ Typical Path</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.6;">
              High School (relevant classes) → College degree → Entry-level role → 2–5 years experience → Senior/Lead → Management or Specialization
            </div>
          </div>
          <div style="display:flex;gap:12px;">
            <button class="btn-primary" style="flex:1;" onclick="document.getElementById('career-modal').classList.add('hidden')">Close</button>
            <button class="btn-secondary" style="flex:1;" onclick="NexusApp.navigate('careerlab');setTimeout(()=>document.getElementById('cl-tab-chat')?.click(),100)">Ask AI →</button>
          </div>
        `;
        modal.classList.remove('hidden');
        NexusDB.addXP(10);
        NexusApp.updateNavStats();
      });
    });

    document.getElementById('career-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'career-modal') document.getElementById('career-modal').classList.add('hidden');
    });

    // Resume builder
    const generateBtn = document.getElementById('generate-resume');
    generateBtn?.addEventListener('click', () => {
      const data = {
        name: document.getElementById('res-name')?.value || '',
        email: document.getElementById('res-email')?.value || '',
        grade: document.getElementById('res-grade')?.value || '',
        interests: document.getElementById('res-interests')?.value || '',
        goal: document.getElementById('res-goal')?.value || '',
        experience: document.getElementById('res-experience')?.value || '',
        skills: document.getElementById('res-skills')?.value || ''
      };
      NexusDB.setResumeData(data);
      const preview = document.getElementById('resume-preview');
      if (preview) preview.innerHTML = renderResumePreview(data);
      NexusDB.addXP(30);
      NexusApp.showToast('Resume generated! +30 XP 📄', 'success');
      NexusApp.checkAchievements();
      NexusApp.updateNavStats();
    });

    document.getElementById('clear-resume')?.addEventListener('click', () => {
      NexusDB.setResumeData({});
      document.getElementById('resume-builder-form').innerHTML = renderResumeForm({});
      document.getElementById('resume-preview').innerHTML = renderResumePreview({});
      bindResumeEvents();
    });

    function bindResumeEvents() {
      document.getElementById('generate-resume')?.addEventListener('click', generateBtn?.onclick || (() => {}));
    }

    document.getElementById('resume-download')?.addEventListener('click', () => {
      const preview = document.getElementById('resume-preview')?.innerText || '';
      const blob = new Blob([preview], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'my-nexus-resume.txt';
      a.click();
      NexusApp.showToast('Resume downloaded! 📥', 'success');
    });

    // Interview coach
    document.getElementById('submit-answer')?.addEventListener('click', () => {
      const answer = document.getElementById('interview-answer')?.value?.trim();
      if (!answer) { NexusApp.showToast('Please type an answer first', 'error'); return; }
      const feedback = NexusAI.evaluateInterviewAnswer(interviewQuestions[interviewStep]?.q || '', answer);
      const feedbackEl = document.getElementById('interview-feedback');
      if (feedbackEl) {
        feedbackEl.classList.remove('hidden');
        feedbackEl.innerHTML = `
          <div class="card" style="border-color:rgba(${feedback.score>=70?'6,214,160':'255,209,102'},0.3); background:rgba(${feedback.score>=70?'6,214,160':'255,209,102'},0.05);">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
              <div style="font-size:2rem;">${feedback.score>=80?'🌟':feedback.score>=60?'👍':'💪'}</div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;">${feedback.rating}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">Score: ${feedback.score}/100</div>
              </div>
              <div style="margin-left:auto;">
                <div class="progress-bar" style="width:100px;"><div class="progress-fill" style="width:${feedback.score}%;"></div></div>
              </div>
            </div>
            ${feedback.strengths.length ? `<div style="margin-bottom:12px;"><div style="font-weight:600;font-size:0.8rem;color:var(--green);margin-bottom:6px;">✅ Strengths</div>${feedback.strengths.map(s=>`<div style="font-size:0.8rem;padding:4px 0;color:var(--text-secondary);">• ${s}</div>`).join('')}</div>` : ''}
            ${feedback.improvements.length ? `<div style="margin-bottom:12px;"><div style="font-weight:600;font-size:0.8rem;color:var(--gold);margin-bottom:6px;">💡 Improvements</div>${feedback.improvements.map(i=>`<div style="font-size:0.8rem;padding:4px 0;color:var(--text-secondary);">• ${i}</div>`).join('')}</div>` : ''}
            <div style="background:rgba(108,99,255,0.08);border-radius:8px;padding:12px;font-size:0.8rem;color:var(--text-secondary);font-style:italic;line-height:1.6;">${feedback.improved_version}</div>
            <button class="btn-primary btn-sm" style="margin-top:16px;width:100%;" id="next-q-btn">${interviewStep < interviewQuestions.length - 1 ? 'Next Question →' : '🎉 All Done!'}</button>
          </div>
        `;
        document.getElementById('next-q-btn')?.addEventListener('click', () => {
          interviewStep = Math.min(interviewStep + 1, interviewQuestions.length - 1);
          NexusDB.addXP(20);
          NexusApp.showToast(`+20 XP! ${feedback.rating} answer! 🎤`, 'success');
          NexusApp.checkAchievements();
          NexusApp.updateNavStats();
          currentTab = 'interview';
          NexusApp.navigate('careerlab');
        });
      }
    });

    document.getElementById('next-question')?.addEventListener('click', () => {
      interviewStep = Math.min(interviewStep + 1, interviewQuestions.length - 1);
      currentTab = 'interview';
      NexusApp.navigate('careerlab');
    });

    document.getElementById('reset-interview')?.addEventListener('click', () => {
      interviewStep = 0;
      currentTab = 'interview';
      NexusApp.navigate('careerlab');
    });

    // Scholarship draft essay
    document.querySelectorAll('.draft-essay-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.scholarship;
        NexusApp.showToast(`Drafting essay for ${name}... +15 XP 📝`, 'success');
        NexusDB.addXP(15);
        NexusApp.updateNavStats();
        currentTab = 'chat';
        NexusApp.navigate('careerlab');
        setTimeout(() => {
          const input = document.getElementById('career-input');
          if (input) { input.value = `Help me write a scholarship essay for the "${name}" scholarship. I'm a motivated student who...`; input.focus(); }
        }, 300);
      });
    });

    document.getElementById('find-scholarships')?.addEventListener('click', () => {
      NexusApp.showToast('Matching scholarships to your profile... ✨', 'info');
      NexusDB.addXP(5);
      NexusApp.updateNavStats();
    });

    // Career AI chat
    const careerInput = document.getElementById('career-input');
    const careerSend = document.getElementById('career-send');
    
    if (careerInput) {
      careerInput.addEventListener('input', () => {
        careerInput.style.height = 'auto';
        careerInput.style.height = Math.min(careerInput.scrollHeight, 120) + 'px';
      });
      careerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); careerSend?.click(); }});
    }

    careerSend?.addEventListener('click', async () => {
      const text = careerInput?.value.trim();
      if (!text) return;
      const messages = document.getElementById('career-messages');
      if (!messages) return;
      
      appendChatMsg(messages, 'user', text);
      if (careerInput) { careerInput.value = ''; careerInput.style.height = 'auto'; }
      careerSend.disabled = true;
      
      const typing = addTyping(messages);
      messages.scrollTop = messages.scrollHeight;
      await NexusAI.thinkingDelay(text);
      const res = await NexusAI.chat(text, 'careerlab');
      typing.remove();
      appendChatMsg(messages, 'ai', res.text);
      messages.scrollTop = messages.scrollHeight;
      careerSend.disabled = false;
      NexusDB.addXP(5);
      NexusApp.updateNavStats();
    });

    document.querySelectorAll('.cl-suggestion').forEach(chip => {
      chip.addEventListener('click', () => {
        if (careerInput) careerInput.value = chip.dataset.text;
        careerSend?.click();
        chip.closest('.chat-suggestions')?.remove();
      });
    });
  }

  function appendChatMsg(container, role, text) {
    const user = NexusDB.getUser();
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>').replace(/• /g, '<li style="margin-left:16px;">');
    div.innerHTML = `<div class="msg-avatar">${role==='ai'?'N':user?.avatar||'U'}</div><div class="msg-bubble">${html}</div>`;
    container.appendChild(div);
  }

  function addTyping(container) {
    const div = document.createElement('div');
    div.className = 'chat-msg ai';
    div.innerHTML = `<div class="msg-avatar">N</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    container.appendChild(div);
    return div;
  }

  return { render, afterRender };
})();

window.CareerlabModule = CareerlabModule;
