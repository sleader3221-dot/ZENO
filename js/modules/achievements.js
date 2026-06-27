/* ===================================================
   NEXUS — Achievements Module
   =================================================== */

const AchievementsModule = (() => {
  const ALL_ACHIEVEMENTS = [
    { id: 'first_login', emoji: '🚀', name: 'First Step', desc: 'Joined NEXUS', xp: 50, category: 'milestone' },
    { id: 'first_mood', emoji: '😊', name: 'Mood Logger', desc: 'Logged your first mood', xp: 10, category: 'wellness' },
    { id: 'mood_streak_3', emoji: '🔥', name: 'On Fire', desc: '3-day mood check-in streak', xp: 30, category: 'wellness' },
    { id: 'mood_streak_7', emoji: '🌟', name: 'Week Warrior', desc: '7-day check-in streak', xp: 75, category: 'wellness' },
    { id: 'mood_streak_30', emoji: '💎', name: 'Diamond Habit', desc: '30-day check-in streak', xp: 200, category: 'wellness' },
    { id: 'first_journal', emoji: '📓', name: 'Dear Diary', desc: 'Wrote your first journal entry', xp: 20, category: 'growth' },
    { id: 'journal_5', emoji: '✍️', name: 'Wordsmith', desc: 'Wrote 5 journal entries', xp: 50, category: 'growth' },
    { id: 'journal_1000', emoji: '📚', name: 'Author in Progress', desc: 'Written 1,000 total words', xp: 100, category: 'growth' },
    { id: 'breathing', emoji: '🫁', name: 'Breathwork', desc: 'Completed a breathing exercise', xp: 15, category: 'wellness' },
    { id: 'cbt_exercise', emoji: '🧘', name: 'Mind Gym', desc: 'Completed a CBT exercise', xp: 25, category: 'wellness' },
    { id: 'resume_built', emoji: '📄', name: 'Resume Ready', desc: 'Built your first resume', xp: 30, category: 'career' },
    { id: 'career_explored', emoji: '🗺️', name: 'Explorer', desc: 'Explored a career path', xp: 10, category: 'career' },
    { id: 'interview_practiced', emoji: '🎤', name: 'Stage Fright Conquered', desc: 'Completed a mock interview', xp: 20, category: 'career' },
    { id: 'first_expense', emoji: '💸', name: 'Money Tracker', desc: 'Logged your first expense', xp: 5, category: 'finance' },
    { id: 'savings_goal', emoji: '🎯', name: 'Goal Setter', desc: 'Created a savings goal', xp: 10, category: 'finance' },
    { id: 'budget_built', emoji: '📊', name: 'Budget Boss', desc: 'Added 5+ transactions', xp: 25, category: 'finance' },
    { id: 'content_ideas', emoji: '💡', name: 'Creative Spark', desc: 'Generated content ideas', xp: 15, category: 'creator' },
    { id: 'level_5', emoji: '⭐', name: 'Rising Star', desc: 'Reached Level 5', xp: 50, category: 'milestone' },
    { id: 'level_10', emoji: '🌟', name: 'NEXUS Pro', desc: 'Reached Level 10', xp: 150, category: 'milestone' },
    { id: 'safe_space', emoji: '🔒', name: 'Safe Harbor', desc: 'Used Safe Space Mode', xp: 5, category: 'wellness' },
    { id: 'goal_completed', emoji: '✅', name: 'Goal Crusher', desc: 'Completed your first goal', xp: 15, category: 'milestone' },
    { id: 'goals_5', emoji: '🏆', name: 'Goal Machine', desc: 'Completed 5 goals', xp: 50, category: 'milestone' },
    { id: 'community_resource', emoji: '🌐', name: 'Community Hero', desc: 'Found a local resource', xp: 10, category: 'community' },
    { id: 'xp_100', emoji: '💫', name: 'XP Collector', desc: 'Earned 100 XP', xp: 0, category: 'milestone' },
    { id: 'xp_500', emoji: '🔮', name: 'Power User', desc: 'Earned 500 XP', xp: 0, category: 'milestone' },
    { id: 'xp_1000', emoji: '👑', name: 'NEXUS Champion', desc: 'Earned 1,000 XP', xp: 0, category: 'milestone' }
  ];

  const LEADERBOARD_MOCK = [
    { name: 'Maya R.', avatar: 'M', xp: 847, level: 9 },
    { name: 'Alex T.', avatar: 'A', xp: 723, level: 8 },
    { name: 'Jordan L.', avatar: 'J', xp: 651, level: 8 },
    { name: 'Sam K.', avatar: 'S', xp: 589, level: 7 },
    { name: 'Riley P.', avatar: 'R', xp: 412, level: 6 }
  ];

  function render() {
    const unlocked = NexusDB.getAchievements();
    const xp = NexusDB.getXP();
    const level = NexusDB.getLevel();
    const xpData = NexusDB.getXPToNext();
    const streak = NexusDB.getStreak();
    const user = NexusDB.getUser() || { name: 'Explorer', avatar: 'E' };
    
    // Insert user into leaderboard
    const lbWithUser = [...LEADERBOARD_MOCK, { name: user.name, avatar: user.avatar || 'U', xp, level, isUser: true }]
      .sort((a,b) => b.xp - a.xp)
      .slice(0, 6);

    const categories = ['all', 'milestone', 'wellness', 'career', 'finance', 'growth', 'creator', 'community'];
    
    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-gold">🏆 Achievements</span>
          <h1 class="module-hero" style="background: var(--grad-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Your Progress & Badges</h1>
          <p>Every action you take in NEXUS earns XP and unlocks achievements. Keep going — the best badges are just ahead.</p>
        </div>

        <!-- Profile Card -->
        <div class="card mb-xl" style="background:linear-gradient(135deg,rgba(255,209,102,0.1),rgba(255,159,67,0.05));border-color:rgba(255,209,102,0.25);">
          <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
            <div style="position:relative;">
              <div style="width:64px;height:64px;border-radius:50%;background:var(--grad-purple);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;box-shadow:var(--shadow-purple);">${user.avatar || 'E'}</div>
              <div style="position:absolute;bottom:-4px;right:-4px;background:var(--grad-gold);border-radius:99px;padding:2px 8px;font-size:0.65rem;font-weight:700;color:var(--bg-primary);">Lv.${level}</div>
            </div>
            <div style="flex:1;">
              <div style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;margin-bottom:2px;">${user.name}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">NEXUS Navigator • ${unlocked.length} badges • <span class="streak-flame">🔥</span> ${streak} day streak</div>
              <div class="progress-bar" style="margin-bottom:4px;">
                <div class="progress-fill" style="width:${xpData.percent}%;background:var(--grad-gold);"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-muted);">
                <span>${xp} XP total</span>
                <span>${xpData.needed - xpData.current} XP to Level ${level+1}</span>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:16px;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);flex-wrap:wrap;">
            ${[
              { icon:'🏆', label:'Badges Earned', value: unlocked.length + '/' + ALL_ACHIEVEMENTS.length },
              { icon:'⚡', label:'Total XP', value: xp.toLocaleString() },
              { icon:'🔥', label:'Day Streak', value: streak },
              { icon:'📓', label:'Journal Entries', value: NexusDB.getJournalEntries().length },
            ].map(s => `
              <div style="text-align:center;flex:1;min-width:60px;">
                <div style="font-size:1.3rem;">${s.icon}</div>
                <div style="font-family:var(--font-display);font-weight:700;font-size:1rem;color:var(--gold);">${s.value}</div>
                <div style="font-size:0.65rem;color:var(--text-muted);">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Badges Filter -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px;">
          ${categories.map(cat => `<button class="tab-btn ${cat==='all'?'active':''} badge-filter" data-filter="${cat}" style="padding:6px 14px;font-size:0.75rem;text-transform:capitalize;">${cat === 'all' ? 'All' : cat}</button>`).join('')}
        </div>

        <!-- Achievements Grid -->
        <div class="achievements-grid stagger" id="achievements-grid">
          ${ALL_ACHIEVEMENTS.map(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            return `
              <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} badge-card" data-category="${ach.category}" role="${isUnlocked ? 'button' : 'img'}" tabindex="${isUnlocked ? 0 : -1}" aria-label="${ach.name}: ${ach.desc}${isUnlocked ? ' (unlocked)' : ' (locked)'}">
                ${isUnlocked ? '<div style="position:absolute;top:6px;left:6px;font-size:0.65rem;color:var(--gold);">✓</div>' : ''}
                <span class="achievement-emoji" aria-hidden="true">${isUnlocked ? ach.emoji : '🔒'}</span>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${ach.xp > 0 ? `<div class="achievement-xp">+${ach.xp} XP</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Leaderboard -->
        <div style="margin-top:var(--space-xl);">
          <div class="section-header mb-md">
            <div class="section-title" style="font-size:1rem;">🏅 Community Leaderboard</div>
            <span class="badge badge-gold">This Week</span>
          </div>
          ${lbWithUser.map((user, i) => {
            const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'other';
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)+'';
            return `
              <div class="leaderboard-item ${user.isUser ? 'style="border-color:rgba(108,99,255,0.4);background:rgba(108,99,255,0.08);"' : ''}">
                <div class="lb-rank ${rankClass}">${rankEmoji}</div>
                <div class="lb-avatar" style="${user.isUser ? 'background:var(--grad-teal);color:var(--bg-primary);' : ''}">${user.avatar}</div>
                <div class="lb-info">
                  <div class="lb-name">${user.name}${user.isUser ? ' (You)' : ''}</div>
                  <div class="lb-level">Level ${user.level}</div>
                </div>
                <div class="lb-xp">${user.xp.toLocaleString()} XP</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Next Badges to Earn -->
        <div style="margin-top:var(--space-xl);">
          <div class="section-header mb-md">
            <div class="section-title" style="font-size:1rem;">🎯 Next to Earn</div>
          </div>
          <div class="grid-auto">
            ${ALL_ACHIEVEMENTS.filter(a => !unlocked.includes(a.id)).slice(0, 4).map(ach => `
              <div class="card" style="border-style:dashed;text-align:center;padding:16px;">
                <div style="font-size:2rem;margin-bottom:8px;filter:grayscale(1);opacity:0.4;">🔒</div>
                <div style="font-weight:600;font-size:0.85rem;margin-bottom:4px;">${ach.name}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.4;">${ach.desc}</div>
                ${ach.xp > 0 ? `<div style="font-size:0.7rem;color:var(--gold);margin-top:6px;font-weight:600;">+${ach.xp} XP reward</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function afterRender() {
    // Badge category filter
    document.querySelectorAll('.badge-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.badge-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.badge-card').forEach(card => {
          card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
        });
      });
    });

    // Unlocked badge clicks
    document.querySelectorAll('.achievement-card.unlocked').forEach(card => {
      card.addEventListener('click', () => {
        NexusApp.showToast(`You earned this badge! ✨`, 'success');
      });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') card.click(); });
    });
  }

  // Auto-unlock logic — called by app after XP-earning actions
  function checkAndUnlock(context = {}) {
    const unlocked = NexusDB.getAchievements();
    const xp = NexusDB.getXP();
    const level = NexusDB.getLevel();
    const moods = NexusDB.getMoods();
    const journals = NexusDB.getJournalEntries();
    const expenses = NexusDB.getExpenses();
    const streak = NexusDB.getStreak();
    const goals = NexusDB.getGoals();
    const completedGoals = goals.filter(g => g.completed).length;
    const totalWords = journals.reduce((a,b)=>a+(b.wordCount||0),0);

    const rules = [
      { id: 'first_login', condition: true },
      { id: 'first_mood', condition: moods.length >= 1 },
      { id: 'mood_streak_3', condition: streak >= 3 },
      { id: 'mood_streak_7', condition: streak >= 7 },
      { id: 'mood_streak_30', condition: streak >= 30 },
      { id: 'first_journal', condition: journals.length >= 1 },
      { id: 'journal_5', condition: journals.length >= 5 },
      { id: 'journal_1000', condition: totalWords >= 1000 },
      { id: 'first_expense', condition: expenses.length >= 1 },
      { id: 'budget_built', condition: expenses.length >= 5 },
      { id: 'goal_completed', condition: completedGoals >= 1 },
      { id: 'goals_5', condition: completedGoals >= 5 },
      { id: 'xp_100', condition: xp >= 100 },
      { id: 'xp_500', condition: xp >= 500 },
      { id: 'xp_1000', condition: xp >= 1000 },
      { id: 'level_5', condition: level >= 5 },
      { id: 'level_10', condition: level >= 10 },
      ...(context.breathing ? [{ id: 'breathing', condition: true }] : []),
      ...(context.cbt ? [{ id: 'cbt_exercise', condition: true }] : []),
      ...(context.resume ? [{ id: 'resume_built', condition: true }] : []),
      ...(context.career ? [{ id: 'career_explored', condition: true }] : []),
      ...(context.interview ? [{ id: 'interview_practiced', condition: true }] : []),
      ...(context.savings ? [{ id: 'savings_goal', condition: true }] : []),
      ...(context.content ? [{ id: 'content_ideas', condition: true }] : []),
      ...(context.resource ? [{ id: 'community_resource', condition: true }] : []),
      ...(context.safe ? [{ id: 'safe_space', condition: true }] : []),
    ];

    let newlyUnlocked = [];
    rules.forEach(rule => {
      if (rule.condition && NexusDB.unlockAchievement(rule.id)) {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === rule.id);
        if (ach) {
          newlyUnlocked.push(ach);
          if (ach.xp > 0) NexusDB.addXP(ach.xp);
        }
      }
    });

    // Show notifications for new achievements
    newlyUnlocked.forEach((ach, i) => {
      setTimeout(() => {
        NexusApp.showToast(`🏆 Badge Unlocked: ${ach.name} ${ach.emoji}!`, 'success');
      }, i * 1500);
    });

    return newlyUnlocked;
  }

  return { render, afterRender, checkAndUnlock, ALL_ACHIEVEMENTS };
})();

window.AchievementsModule = AchievementsModule;
