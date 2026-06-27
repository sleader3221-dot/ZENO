/* ===================================================
   NEXUS — Onboarding Module
   =================================================== */

const OnboardingModule = (() => {
  let currentStep = 0;
  let selections = { name: '', challenge: '', track: '', age: '' };

  const steps = [
    { id: 'welcome', type: 'welcome' },
    { id: 'name', type: 'input', title: 'What\'s your name?', subtitle: 'I\'ll personalize your experience just for you.', placeholder: 'Your first name...', field: 'name' },
    { id: 'challenge', type: 'options', title: 'What\'s your biggest challenge right now?', subtitle: 'Be honest — NEXUS is a judgment-free zone.', field: 'challenge', options: [
      { value: 'mental', emoji: '💚', title: 'Mental Health & Stress', desc: 'Anxiety, overwhelm, or just needing someone to talk to' },
      { value: 'career', emoji: '💼', title: 'Career & Future', desc: 'College, majors, jobs, or "what do I even do with my life?"' },
      { value: 'finance', emoji: '💰', title: 'Money & Finances', desc: 'Budgeting, first paycheck, affording college, financial stress' },
      { value: 'creator', emoji: '🎨', title: 'Content Creation', desc: 'Growing my channel, brand deals, or building an audience' },
      { value: 'all', emoji: '🌟', title: 'All of the above', desc: 'I could use help with everything honestly' }
    ]},
    { id: 'track', type: 'options', title: 'What describes you best?', subtitle: 'This helps me give you the most relevant advice.', field: 'track', options: [
      { value: 'student', emoji: '📚', title: 'Still in school (K-12)', desc: 'Working on grades, extracurriculars, and figuring out college' },
      { value: 'college', emoji: '🎓', title: 'College student or applicant', desc: 'Navigating higher education and career prep' },
      { value: 'working', emoji: '⚡', title: 'Working part-time', desc: 'Balancing school + work or just starting my career' },
      { value: 'creator_track', emoji: '🎬', title: 'Creator or entrepreneur', desc: 'Building something online or my own business' }
    ]},
    { id: 'ready', type: 'ready' }
  ];

  function render() {
    const container = document.getElementById('onboarding-container');
    if (!container) return;
    const step = steps[currentStep];
    container.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'onboard-card';

    if (step.type === 'welcome') {
      card.innerHTML = `
        <div class="onboard-logo">
          <div class="onboard-logo-icon">
            <div class="onboard-logo-ring"></div>
            <div class="onboard-logo-core">N</div>
          </div>
          <div class="onboard-logo-text">NEXUS</div>
        </div>
        <h1 class="onboard-title">Your AI Life Navigator</h1>
        <p class="onboard-subtitle">
          One AI for every challenge youth face — mental health, career planning, financial literacy, and community support. Built <em>for</em> you, <em>with</em> you.
        </p>
        <div style="background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">💚 Mental Health Support</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">💼 Career Planning</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">💰 Financial Literacy</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">🌐 Community Resources</span>
          </div>
        </div>
        <div class="onboard-actions">
          <button class="btn-primary" id="onboard-next" style="width:100%; font-size: 1rem; padding: 14px;">
            Get Started — It's Free ✨
          </button>
        </div>
        <p style="text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 12px;">
          🔒 Your data stays on your device. We never sell your information.
        </p>
      `;
    } else if (step.type === 'input') {
      card.innerHTML = `
        <div class="onboard-step-indicator">${steps.map((s, i) => `<div class="step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>`).join('')}</div>
        <h1 class="onboard-title">${step.title}</h1>
        <p class="onboard-subtitle">${step.subtitle}</p>
        <div class="onboard-input-group">
          <input type="text" class="onboard-input" id="onboard-input-field" placeholder="${step.placeholder}" value="${selections[step.field] || ''}" maxlength="40" autocomplete="off" />
        </div>
        <div class="onboard-actions">
          <button class="btn-ghost" id="onboard-back" aria-label="Go back">←</button>
          <button class="btn-primary" id="onboard-next" style="flex:1;">Continue →</button>
        </div>
      `;
      setTimeout(() => document.getElementById('onboard-input-field')?.focus(), 100);
    } else if (step.type === 'options') {
      card.innerHTML = `
        <div class="onboard-step-indicator">${steps.map((s, i) => `<div class="step-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}"></div>`).join('')}</div>
        <h1 class="onboard-title">${step.title}</h1>
        <p class="onboard-subtitle">${step.subtitle}</p>
        <div class="onboard-options">
          ${step.options.map(opt => `
            <button class="onboard-option ${selections[step.field] === opt.value ? 'selected' : ''}" data-value="${opt.value}" aria-label="${opt.title}" role="radio" aria-checked="${selections[step.field] === opt.value}">
              <span class="onboard-option-icon">${opt.emoji}</span>
              <div class="onboard-option-text">
                <div class="onboard-option-title">${opt.title}</div>
                <div class="onboard-option-desc">${opt.desc}</div>
              </div>
              <div class="onboard-check">${selections[step.field] === opt.value ? '✓' : ''}</div>
            </button>
          `).join('')}
        </div>
        <div class="onboard-actions">
          <button class="btn-ghost" id="onboard-back" aria-label="Go back">←</button>
          <button class="btn-primary" id="onboard-next" style="flex:1;" ${!selections[step.field] ? 'disabled' : ''}>Continue →</button>
        </div>
      `;
    } else if (step.type === 'ready') {
      const name = selections.name || 'there';
      const challengeMap = { mental: 'mental wellness', career: 'career clarity', finance: 'financial confidence', creator: 'creator success', all: 'every challenge you face' };
      const challenge = challengeMap[selections.challenge] || 'everything';
      card.innerHTML = `
        <div style="text-align: center; padding: 16px 0;">
          <div style="font-size: 4rem; margin-bottom: 16px; animation: floatUp 3s ease-in-out infinite;">🚀</div>
          <h1 class="onboard-title">Welcome, ${name}!</h1>
          <p class="onboard-subtitle">NEXUS is ready to help you with ${challenge}. Your personalized AI life navigator is set up and waiting.</p>
          <div style="background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left;">
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.8;">
              ✅ Your daily mood check-in is set up<br>
              ✅ Career exploration tools are ready<br>
              ✅ Financial literacy modules loaded<br>
              ✅ Community resources indexed<br>
              ✅ 36+ features activated
            </div>
          </div>
          <button class="btn-primary" id="onboard-finish" style="width:100%; font-size: 1rem; padding: 14px;">
            Enter NEXUS ✨
          </button>
        </div>
      `;
    }

    container.appendChild(card);
    bindEvents(step);
  }

  function bindEvents(step) {
    const nextBtn = document.getElementById('onboard-next');
    const backBtn = document.getElementById('onboard-back');
    const finishBtn = document.getElementById('onboard-finish');
    const inputField = document.getElementById('onboard-input-field');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (step.type === 'input') {
          const val = inputField?.value.trim();
          if (val) { selections[step.field] = val; next(); }
          else inputField?.focus();
        } else if (step.type === 'welcome') {
          next();
        } else {
          next();
        }
      });
    }

    if (backBtn) backBtn.addEventListener('click', prev);
    if (finishBtn) finishBtn.addEventListener('click', complete);

    if (inputField) {
      inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') nextBtn?.click();
      });
    }

    // Option selection
    document.querySelectorAll('.onboard-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        selections[step.field] = val;
        document.querySelectorAll('.onboard-option').forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
          b.querySelector('.onboard-check').textContent = '';
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
        btn.querySelector('.onboard-check').textContent = '✓';
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  }

  function next() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      render();
    }
  }

  function prev() {
    if (currentStep > 0) {
      currentStep--;
      render();
    }
  }

  function complete() {
    const user = {
      name: selections.name || 'Explorer',
      challenge: selections.challenge,
      track: selections.track,
      avatar: (selections.name || 'E')[0].toUpperCase(),
      joined: new Date().toISOString()
    };
    NexusDB.setUser(user);
    NexusDB.set('onboarded', true);
    NexusDB.updateStreak();
    
    // Set initial goals based on challenge
    const defaultGoals = {
      mental: [{ title: 'Complete daily mood check-in', xp: 10 }, { title: 'Try one CBT exercise', xp: 25 }],
      career: [{ title: 'Explore 3 career paths', xp: 20 }, { title: 'Start your resume', xp: 30 }],
      finance: [{ title: 'Set up your first budget', xp: 25 }, { title: 'Add 3 expenses', xp: 15 }],
      all: [{ title: 'Complete your mood check-in', xp: 10 }, { title: 'Explore one module', xp: 15 }]
    };
    const goals = defaultGoals[user.challenge] || defaultGoals.all;
    goals.forEach(g => NexusDB.addGoal(g));
    
    // Add welcome XP
    NexusDB.addXP(50);
    
    // Launch app
    document.getElementById('onboarding-screen')?.classList.add('hidden');
    document.getElementById('main-app')?.classList.remove('hidden');
    NexusApp?.init();
  }

  return {
    init: () => {
      currentStep = 0;
      render();
    }
  };
})();

window.OnboardingModule = OnboardingModule;
