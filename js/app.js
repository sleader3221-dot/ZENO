/* ===================================================
   ZENO — Main Application Controller & Router
   World's most advanced AI Life Navigator for Youth
   Youth Code x AI Hackathon 2026
   =================================================== */

const NexusApp = (() => {
  const APP_NAME = 'ZENO';

  const MODULES = {
    dashboard:    DashboardModule,
    mindspace:    MindspaceModule,
    careerlab:    CareerlabModule,
    moneyiq:      MoneyiqModule,
    community:    CommunityModule,
    journal:      JournalModule,
    achievements: AchievementsModule
  };

  const MODULE_TITLES = {
    dashboard:    'Dashboard',
    mindspace:    'MindSpace — Mental Health',
    careerlab:    'CareerLab — Career Planning',
    moneyiq:      'MoneyIQ — Financial Literacy',
    community:    'Community — Local Resources',
    journal:      'AI Journal',
    achievements: 'Achievements & Progress'
  };

  let currentModule    = 'dashboard';
  let isSidebarOpen    = false;
  let isHighContrast   = false;
  let isSafeSpaceOpen  = false;
  let clockInterval    = null;
  let sessionStart     = Date.now();

  // ─── App Init ─────────────────────────────────────────
  function init() {
    updateNavStats();
    startLiveClock();
    startSessionTracker();

    // Hash routing
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigate(hash in MODULES ? hash : 'dashboard');

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h in MODULES && h !== currentModule) navigate(h);
    });

    // Setup all global interactions
    setupSidebar();
    setupSafeSpace();
    setupAccessibility();
    setupRipple();
    setupKeyboardNav();

    // Restore accessibility setting
    if (NexusDB.getSettings().highContrast) {
      isHighContrast = true;
      document.body.classList.add('high-contrast');
    }

    // Achievement boot check
    setTimeout(() => {
      AchievementsModule.checkAndUnlock();
      if (!NexusDB.hasAchievement('first_login')) {
        NexusDB.unlockAchievement('first_login');
        showAchievementPopup({ emoji: '🚀', name: 'First Step' });
        NexusDB.addXP(50);
        updateNavStats();
      }
    }, 2000);

    // Auto mood check-in prompt
    setTimeout(() => {
      if (!NexusDB.hasMoodToday()) {
        showMoodOverlay();
        // Show alert badge on MindSpace
        document.getElementById('mood-alert-badge')?.classList.remove('hidden');
      }
    }, 3500);

    // Service worker (PWA offline)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Streak notification
    const streak = NexusDB.getStreak();
    if (streak > 1) {
      setTimeout(() => showToast(`🔥 ${streak}-day streak! Keep it up!`, 'success'), 5000);
    }

    console.log(`%c🔮 ${APP_NAME} — AI Life Navigator`, 'color:#6c63ff;font-size:1.4rem;font-weight:900;');
    console.log('%cYouth Code x AI Hackathon 2026 | Built for real youth impact', 'color:#00d4ff;font-size:0.85rem;');
  }

  // ─── Navigation ───────────────────────────────────────
  function navigate(moduleName) {
    if (!(moduleName in MODULES)) moduleName = 'dashboard';
    currentModule = moduleName;
    window.location.hash = moduleName;

    const container = document.getElementById('module-container');
    if (!container) return;

    // Update nav active states
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.module === moduleName);
    });

    // Fade out → render → fade in
    container.style.opacity = '0';
    container.style.transform = 'translateY(8px)';
    container.style.transition = 'opacity 0.15s ease, transform 0.15s ease';

    setTimeout(() => {
      const module = MODULES[moduleName];
      container.innerHTML = module.render();

      requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        if (module.afterRender) module.afterRender();
      });
    }, 150);

    closeMobileSidebar();
    document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${APP_NAME} — ${MODULE_TITLES[moduleName] || 'AI Life Navigator'}`;

    // Clear mood badge when visiting mindspace
    if (moduleName === 'mindspace') {
      document.getElementById('mood-alert-badge')?.classList.add('hidden');
    }
  }

  // ─── Live Clock ────────────────────────────────────────
  function startLiveClock() {
    function updateClock() {
      const now = new Date();
      const timeEl = document.getElementById('clock-time');
      const dateEl = document.getElementById('clock-date');
      const mobileStreakEl = document.getElementById('mobile-streak');

      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric'
        });
      }
      if (mobileStreakEl) {
        const streak = NexusDB.getStreak();
        mobileStreakEl.textContent = streak > 0 ? `🔥${streak}` : '';
      }
    }
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  // ─── Session Tracker ───────────────────────────────────
  function startSessionTracker() {
    // Award XP for time spent (once per session after 5 min)
    setTimeout(() => {
      NexusDB.addXP(5);
      updateNavStats();
    }, 5 * 60 * 1000);
  }

  // ─── Sidebar ──────────────────────────────────────────
  function setupSidebar() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const mod = item.dataset.module;
        if (mod) navigate(mod);
      });
    });

    document.getElementById('mobile-menu-btn')?.addEventListener('click', toggleMobileSidebar);

    // Create and inject overlay
    if (!document.getElementById('sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      document.getElementById('main-app')?.appendChild(overlay);
      overlay.addEventListener('click', closeMobileSidebar);
    }
  }

  function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    isSidebarOpen = !isSidebarOpen;
    sidebar?.classList.toggle('mobile-open', isSidebarOpen);
    overlay?.classList.toggle('visible', isSidebarOpen);
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
  }

  function closeMobileSidebar() {
    isSidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // ─── Nav Stats (Real-time) ─────────────────────────────
  function updateNavStats() {
    const user    = NexusDB.getUser() || { name: 'Navigator', avatar: 'Z' };
    const level   = NexusDB.getLevel();
    const xp      = NexusDB.getXP();
    const xpData  = NexusDB.getXPToNext();
    const moods   = NexusDB.getMoods();
    const lastMood = moods[0];

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    set('nav-username', user.name || 'Navigator');
    set('nav-avatar',   user.avatar || 'Z');
    set('nav-level',    `Level ${level}`);
    set('nav-xp',       `${xp.toLocaleString()} XP`);
    set('nav-mood',     lastMood?.emoji || '😊');
    set('mobile-mood',  lastMood?.emoji || '😊');

    // Animate XP bar
    const xpBar = document.getElementById('nav-xp-bar');
    if (xpBar) {
      requestAnimationFrame(() => { xpBar.style.width = `${xpData.percent}%`; });
    }
  }

  // ─── Mood Overlay ─────────────────────────────────────
  function showMoodOverlay() {
    const overlay = document.getElementById('mood-overlay');
    if (!overlay) return;

    // Show current date
    const dateEl = document.getElementById('mood-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    let selectedMood = null;

    // Clear previous handlers by cloning
    document.querySelectorAll('.mood-btn').forEach(btn => {
      const clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
    });

    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = {
          score: parseInt(btn.dataset.mood),
          emoji: btn.dataset.emoji,
          label: btn.dataset.label
        };
        const submitBtn = document.getElementById('mood-submit');
        if (submitBtn) submitBtn.disabled = false;
      });
    });

    // Submit handler — replace to avoid duplicates
    const submitBtn = document.getElementById('mood-submit');
    if (submitBtn) {
      const newSubmit = submitBtn.cloneNode(true);
      submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
      newSubmit.addEventListener('click', () => {
        if (!selectedMood) return;
        const note = document.getElementById('mood-note')?.value?.trim() || '';
        NexusDB.addMood({ ...selectedMood, note, timestamp: new Date().toISOString() });
        NexusDB.updateStreak();
        NexusDB.addXP(10);
        overlay.classList.add('hidden');
        showToast(`Mood logged! +10 XP 💙`, 'success');
        showXPGain('+10 XP');
        checkAchievements({ mood: true });
        updateNavStats();
        // Hide alert badge
        document.getElementById('mood-alert-badge')?.classList.add('hidden');
        if (currentModule === 'dashboard') navigate('dashboard');
      });
    }

    const skipBtn = document.getElementById('mood-skip');
    if (skipBtn) {
      const newSkip = skipBtn.cloneNode(true);
      skipBtn.parentNode.replaceChild(newSkip, skipBtn);
      newSkip.addEventListener('click', () => {
        overlay.classList.add('hidden');
      });
    }
  }

  // ─── Safe Space ───────────────────────────────────────
  function setupSafeSpace() {
    document.getElementById('btn-safe-space')?.addEventListener('click', toggleSafeSpace);
    document.getElementById('safe-close')?.addEventListener('click', closeSafeSpace);
    document.getElementById('safe-send')?.addEventListener('click', sendSafeMessage);
    document.getElementById('safe-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSafeMessage(); }
    });
  }

  function toggleSafeSpace() {
    isSafeSpaceOpen = !isSafeSpaceOpen;
    const overlay = document.getElementById('safe-space-overlay');
    if (isSafeSpaceOpen) {
      overlay?.classList.remove('hidden');
      document.getElementById('safe-input')?.focus();
      NexusDB.unlockAchievement('safe_space');
      checkAchievements({ safe: true });
    } else {
      overlay?.classList.add('hidden');
    }
  }

  function closeSafeSpace() {
    isSafeSpaceOpen = false;
    document.getElementById('safe-space-overlay')?.classList.add('hidden');
  }

  async function sendSafeMessage() {
    const input = document.getElementById('safe-input');
    const text  = input?.value?.trim();
    if (!text) return;

    const chat = document.getElementById('safe-chat');
    if (!chat) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'safe-msg user';
    userMsg.textContent = text;
    chat.appendChild(userMsg);
    if (input) input.value = '';

    // Disable input during AI response
    if (input) input.disabled = true;

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'safe-msg ai typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    const emotion   = NexusAI.detectEmotion(text);
    const isCrisis  = emotion === 'crisis';

    await NexusAI.thinkingDelay(text);

    let response;
    if (isCrisis) {
      response = '💙 I hear you. I\'m so glad you\'re talking to me. You\'re not alone in this. Please consider texting 741741 or calling 988 — they\'re available 24/7 and genuinely want to help. Can you tell me a little more about what\'s going on?';
    } else {
      const res = await NexusAI.chat(text, 'mindspace');
      response  = res.text.replace(/\*\*(.*?)\*\*/g, '$1');
    }

    typing.className = 'safe-msg ai';
    typing.innerHTML = '';
    typing.textContent = response;
    chat.scrollTop = chat.scrollHeight;
    if (input) input.disabled = false;
    input?.focus();
  }

  // ─── Accessibility (High Contrast Only) ───────────────
  function setupAccessibility() {
    document.getElementById('btn-accessibility')?.addEventListener('click', () => {
      isHighContrast = !isHighContrast;
      document.body.classList.toggle('high-contrast', isHighContrast);
      NexusDB.setSetting('highContrast', isHighContrast);
      showToast(isHighContrast ? 'High contrast mode enabled ♿' : 'High contrast mode disabled', 'info');
    });

    if (NexusDB.getSettings().highContrast) {
      isHighContrast = true;
      document.body.classList.add('high-contrast');
    }
  }

  // ─── Button Ripple Effect ─────────────────────────────
  function setupRipple() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-gold');
      if (!btn) return;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.cssText = `
        left:${e.clientX - rect.left}px;
        top:${e.clientY - rect.top}px;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // ─── Keyboard Navigation ──────────────────────────────
  function setupKeyboardNav() {
    document.addEventListener('keydown', e => {
      // Escape closes overlays
      if (e.key === 'Escape') {
        if (isSafeSpaceOpen) closeSafeSpace();
        document.getElementById('mood-overlay')?.classList.add('hidden');
        if (isSidebarOpen) closeMobileSidebar();
      }
      // Ctrl+1-7 to navigate modules
      if (e.ctrlKey && !e.shiftKey) {
        const mods = Object.keys(MODULES);
        const idx  = parseInt(e.key) - 1;
        if (idx >= 0 && idx < mods.length) { e.preventDefault(); navigate(mods[idx]); }
      }
    });
  }

  // ─── Toast Notifications ──────────────────────────────
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `<span class="toast-msg">${message}</span><button class="toast-close" aria-label="Dismiss">&times;</button>`;
    container.appendChild(toast);

    // Manual dismiss
    toast.querySelector('.toast-close')?.addEventListener('click', () => {
      toast.classList.add('toast-leaving');
      setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-leaving');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // ─── XP Gain Animation ────────────────────────────────
  function showXPGain(text) {
    const popup = document.getElementById('xp-popup');
    if (!popup) return;
    popup.textContent = text;
    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    void popup.offsetWidth; // reflow
    popup.style.animation = 'xpFloat 2s ease forwards';
    setTimeout(() => popup.classList.add('hidden'), 2000);
  }

  // ─── Achievement Popup ─────────────────────────────────
  function showAchievementPopup(ach) {
    const popup  = document.getElementById('achievement-popup');
    const icon   = document.getElementById('aup-icon');
    const name   = document.getElementById('aup-name');
    if (!popup) return;
    if (icon) icon.textContent = ach.emoji || '🏆';
    if (name) name.textContent = ach.name  || 'Achievement';
    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    void popup.offsetWidth;
    popup.style.animation = 'achieveIn 3.5s ease forwards';
    setTimeout(() => popup.classList.add('hidden'), 3500);
  }

  // ─── Achievement Check ────────────────────────────────
  function checkAchievements(context = {}) {
    const newOnes = AchievementsModule.checkAndUnlock(context);
    if (newOnes.length > 0) {
      updateNavStats();
      newOnes.forEach((ach, i) => {
        setTimeout(() => showAchievementPopup(ach), i * 1800);
      });
    }
  }

  // ─── Loading Screen ───────────────────────────────────
  function showLoading() {
    const fill = document.getElementById('loading-fill');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 4;
      if (fill) fill.style.width = Math.min(progress, 95) + '%';
      if (progress >= 95) clearInterval(interval);
    }, 120);
    return interval;
  }

  function hideLoading(interval) {
    clearInterval(interval);
    const fill = document.getElementById('loading-fill');
    if (fill) fill.style.width = '100%';
    setTimeout(() => {
      const ls = document.getElementById('loading-screen');
      if (ls) {
        ls.style.transition = 'opacity 0.6s ease';
        ls.style.opacity    = '0';
        setTimeout(() => ls.classList.add('hidden'), 600);
      }
    }, 400);
  }

  return {
    init,
    navigate,
    showToast,
    showXPGain,
    showAchievementPopup,
    showMoodOverlay,
    checkAchievements,
    updateNavStats,
    toggleSafeSpace,
    closeSafeSpace,
    showLoading,
    hideLoading,
    APP_NAME
  };
})();

// ─── App Bootstrap ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const loadInterval = NexusApp.showLoading();

  setTimeout(() => {
    NexusApp.hideLoading(loadInterval);

    setTimeout(() => {
      const isOnboarded = NexusDB.get('onboarded');

      if (!isOnboarded) {
        document.getElementById('onboarding-screen')?.classList.remove('hidden');
        OnboardingModule.init();
      } else {
        document.getElementById('onboarding-screen')?.classList.add('hidden');
        document.getElementById('main-app')?.classList.remove('hidden');
        NexusApp.init();
      }
    }, 200);
  }, 1800);
});

window.NexusApp = NexusApp;
