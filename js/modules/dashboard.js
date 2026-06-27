/* ===================================================
   NEXUS — Dashboard Module
   =================================================== */

const DashboardModule = (() => {
  let moodChart = null;

  function getMoodEmoji(score) {
    if (score >= 5) return '😄';
    if (score >= 4) return '😊';
    if (score >= 3) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  }

  function getTimeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getAIInsight(user, moods, goals, xp) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const completedGoals = (goals || []).filter(g => g.completed).length;
    const totalGoals = (goals || []).length;
    const recentMood = moods?.[0];
    
    const insights = [
      `It's ${today} — a new day full of possibility. You've completed **${completedGoals}/${totalGoals}** goals so far. Every small step builds momentum. What do you want to tackle today?`,
      `Your streak is ${NexusDB.getStreak()} days strong! 🔥 Consistency is your superpower. Even 5 minutes of progress daily compounds into something extraordinary over months.`,
      `You're at Level ${NexusDB.getLevel()} with ${xp} XP. ${xp < 200 ? 'Just getting started — the best is ahead of you!' : xp < 500 ? 'Building real momentum!' : 'You\'re a NEXUS power user — incredible dedication!'}`,
      recentMood ? `Your last mood was ${recentMood.emoji || '😊'} — ${recentMood.score >= 4 ? 'I love seeing you in a good place. Let\'s keep that energy going!' : 'I\'m here for you today. Remember: every feeling is temporary. What would help most right now?'}` : `I notice you haven't logged your mood today. Regular check-ins help me give you better, more personalized support. It only takes 10 seconds!`,
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  function renderMoodChart(container, moods) {
    if (moodChart) { moodChart.destroy(); moodChart = null; }
    
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const entry = (moods || []).find(m => new Date(m.timestamp || m.date || '').toDateString() === dateStr);
      last7.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), value: entry ? entry.score : null });
    }
    
    const ctx = container.getContext('2d');
    moodChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last7.map(d => d.label),
        datasets: [{
          data: last7.map(d => d.value),
          borderColor: '#6c63ff',
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(108,99,255,0.3)');
            gradient.addColorStop(1, 'rgba(108,99,255,0)');
            return gradient;
          },
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#6c63ff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: 'rgba(15,16,53,0.95)',
          borderColor: 'rgba(108,99,255,0.4)',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: '#aaa',
          callbacks: { label: (ctx) => ctx.raw !== null ? `Mood: ${['😢','😔','😐','😊','😄'][Math.round(ctx.raw)-1] || '?'} (${ctx.raw}/5)` : 'No check-in' }
        }},
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
          y: { min: 0, max: 5, ticks: { stepSize: 1, color: 'rgba(255,255,255,0.5)', font: { size: 11 }, callback: (v) => ['','😢','😔','😐','😊','😄'][v] || '' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  function render() {
    const user = NexusDB.getUser() || { name: 'Explorer', avatar: 'E' };
    const moods = NexusDB.getMoods();
    const goals = NexusDB.getGoals();
    const xp = NexusDB.getXP();
    const level = NexusDB.getLevel();
    const streak = NexusDB.getStreak();
    const xpData = NexusDB.getXPToNext();
    const completedGoals = goals.filter(g => g.completed).length;
    const recentMood = moods[0];
    const moodAvg = moods.length ? Math.round(moods.slice(0, 7).reduce((a, b) => a + (b.score || 3), 0) / Math.min(moods.length, 7) * 10) / 10 : null;

    return `
      <div class="page-enter">
        <!-- Welcome Banner -->
        <div class="dashboard-welcome">
          <div class="welcome-emoji">${recentMood?.emoji || '🌟'}</div>
          <div class="welcome-greeting">${getTimeGreeting()}</div>
          <h1 class="welcome-name text-gradient-purple">${user.name} 👋</h1>
          <p class="welcome-insight" id="ai-insight-text">Loading your personalized insight...</p>
          <div class="welcome-actions">
            ${!NexusDB.hasMoodToday() ? '<button class="btn-primary btn-sm" id="quick-mood-btn">📊 Log Mood</button>' : '<span class="badge badge-green">✅ Mood logged today</span>'}
            <button class="btn-secondary btn-sm" id="start-ai-chat">💬 Talk to NEXUS</button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats stagger">
          <div class="quick-stat hover-lift" onclick="NexusApp.navigate('mindspace')" style="cursor:pointer;" tabindex="0" role="button" aria-label="View mental health module">
            <div class="quick-stat-icon">💚</div>
            <div class="quick-stat-value text-gradient-purple">${moodAvg || '–'}</div>
            <div class="quick-stat-label">Avg Mood (7 days)</div>
            <div class="quick-stat-bar"><div class="quick-stat-fill" style="width:${moodAvg ? (moodAvg/5)*100 : 0}%; background: var(--grad-purple);"></div></div>
          </div>
          <div class="quick-stat hover-lift" onclick="NexusApp.navigate('achievements')" style="cursor:pointer;" tabindex="0" role="button" aria-label="View achievements">
            <div class="quick-stat-icon">🔥</div>
            <div class="quick-stat-value text-gradient-gold">${streak}</div>
            <div class="quick-stat-label">Day Streak</div>
            <div class="quick-stat-bar"><div class="quick-stat-fill" style="width:${Math.min(streak*10,100)}%; background: var(--grad-gold);"></div></div>
          </div>
          <div class="quick-stat hover-lift" onclick="NexusApp.navigate('careerlab')" style="cursor:pointer;" tabindex="0" role="button" aria-label="View career module">
            <div class="quick-stat-icon">🎯</div>
            <div class="quick-stat-value text-gradient-teal">${completedGoals}/${goals.length || 0}</div>
            <div class="quick-stat-label">Goals Completed</div>
            <div class="quick-stat-bar"><div class="quick-stat-fill" style="width:${goals.length ? (completedGoals/goals.length)*100 : 0}%; background: var(--grad-teal);"></div></div>
          </div>
          <div class="quick-stat hover-lift" tabindex="0" aria-label="Your XP and level">
            <div class="quick-stat-icon">⚡</div>
            <div class="quick-stat-value" style="background: var(--grad-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Lv.${level}</div>
            <div class="quick-stat-label">${xp} XP total</div>
            <div class="quick-stat-bar"><div class="quick-stat-fill" style="width:${xpData.percent}%; background: var(--grad-gold);"></div></div>
          </div>
        </div>

        <!-- AI Daily Insight -->
        <div class="ai-insight-card mb-xl">
          <div class="ai-insight-header">
            <div class="ai-insight-icon">N</div>
            <div>
              <div class="ai-insight-title">NEXUS Daily Insight</div>
              <div class="ai-insight-subtitle">Personalized just for you</div>
            </div>
            <button onclick="this.closest('.ai-insight-card').querySelector('.ai-insight-body').classList.toggle('typing-cursor')" style="margin-left:auto; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.8rem;">↻</button>
          </div>
          <div class="ai-insight-body" id="dashboard-insight">Loading...</div>
          <div class="ai-insight-actions">
            <button class="btn-sm btn-secondary" onclick="NexusApp.navigate('mindspace')">💚 MindSpace</button>
            <button class="btn-sm btn-secondary" onclick="NexusApp.navigate('careerlab')">💼 CareerLab</button>
            <button class="btn-sm btn-secondary" onclick="NexusApp.navigate('moneyiq')">💰 MoneyIQ</button>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="grid-2" style="margin-bottom: var(--space-xl);">
          <!-- Mood Chart -->
          <div class="mood-chart-card">
            <div class="mood-chart-header">
              <div>
                <div class="section-title" style="font-size:1rem;">7-Day Mood Trend</div>
                <div class="section-subtitle">Your emotional journey this week</div>
              </div>
              ${moodAvg ? `<span class="mood-trend-label ${moodAvg >= 3.5 ? 'up' : moodAvg >= 2.5 ? 'stable' : 'down'}">${moodAvg >= 3.5 ? '↑ Positive' : moodAvg >= 2.5 ? '→ Stable' : '↓ Support Needed'}</span>` : '<span class="badge badge-purple">No data yet</span>'}
            </div>
            <div style="height: 180px; position: relative;">
              <canvas id="mood-chart-canvas"></canvas>
            </div>
            ${!NexusDB.hasMoodToday() ? '<button class="btn-primary btn-sm" style="width:100%; margin-top: 12px;" id="log-mood-now">Log Today\'s Mood +10 XP</button>' : ''}
          </div>

          <!-- Daily Goals -->
          <div>
            <div class="section-header">
              <div>
                <div class="section-title" style="font-size: 1rem;">Today's Goals</div>
                <div class="section-subtitle">${completedGoals}/${goals.length} completed</div>
              </div>
              <button class="btn-ghost btn-sm" id="add-goal-btn" aria-label="Add new goal">+ Add</button>
            </div>
            <div id="goals-list">
              ${goals.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-title">No goals yet</div><div class="empty-state-desc">Add your first goal to start tracking progress</div></div>` :
              goals.slice(0, 5).map(g => `
                <div class="goal-item ${g.completed ? 'completed' : ''}" data-goal-id="${g.id}" role="checkbox" aria-checked="${g.completed}" tabindex="0">
                  <div class="goal-check">${g.completed ? '✓' : ''}</div>
                  <div class="goal-info">
                    <div class="goal-title">${g.title}</div>
                    <div class="goal-meta">${g.completed ? 'Completed ✨' : 'In progress'}</div>
                  </div>
                  <span class="goal-xp">+${g.xp || 10} XP</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Module Quick Access -->
        <div class="section-header mb-md">
          <div class="section-title">Explore NEXUS</div>
          <div class="section-subtitle">All your tools in one place</div>
        </div>
        <div class="grid-auto stagger mb-xl">
          ${[
            { module: 'mindspace', color: 'var(--mindspace)', emoji: '💚', title: 'MindSpace', desc: 'Mental health, CBT exercises, mood tracking', badge: !NexusDB.hasMoodToday() ? 'Check in!' : null },
            { module: 'careerlab', color: 'var(--careerlab)', emoji: '💼', title: 'CareerLab', desc: 'Resumes, careers, scholarships, interviews', badge: null },
            { module: 'moneyiq', color: 'var(--moneyiq)', emoji: '💰', title: 'MoneyIQ', desc: 'Budgeting, expenses, financial literacy', badge: null },
            { module: 'community', color: 'var(--community)', emoji: '🌐', title: 'Community', desc: 'Local resources, support networks', badge: null },
            { module: 'journal', color: 'var(--journal)', emoji: '📓', title: 'AI Journal', desc: 'Reflect, process, grow with AI guidance', badge: null },
            { module: 'achievements', color: 'var(--achievements)', emoji: '🏆', title: 'Achievements', desc: `${NexusDB.getAchievements().length} badges unlocked`, badge: null },
          ].map(m => `
            <div class="card hover-lift" style="cursor:pointer; border-left: 3px solid ${m.color};" onclick="NexusApp.navigate('${m.module}')" tabindex="0" role="button" aria-label="Go to ${m.title}">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:1.8rem;">${m.emoji}</span>
                ${m.badge ? `<span class="badge badge-rose">${m.badge}</span>` : ''}
              </div>
              <div style="font-family:var(--font-display); font-weight:700; font-size:1rem; margin-bottom:4px; color:${m.color};">${m.title}</div>
              <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.5;">${m.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- XP Progress Card -->
        <div class="xp-card">
          <div class="xp-header">
            <div>
              <div class="xp-level">Level ${level}</div>
              <div class="xp-label">NEXUS Navigator</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.875rem; font-weight:600;">${xp} XP</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">${xpData.needed - xpData.current} to Level ${level+1}</div>
            </div>
          </div>
          <div class="progress-bar mb-md">
            <div class="progress-fill savings-goal-fill" style="width:${xpData.percent}%; background: var(--grad-gold);"></div>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">
            Earn XP by logging moods 📊, completing goals 🎯, journaling 📓, exploring career paths 💼, and using NEXUS daily!
          </div>
        </div>
      </div>
    `;
  }

  function afterRender() {
    // Render mood chart
    const canvas = document.getElementById('mood-chart-canvas');
    if (canvas) renderMoodChart(canvas, NexusDB.getMoods());

    // AI Insight
    const insightEl = document.getElementById('dashboard-insight');
    if (insightEl) {
      const user = NexusDB.getUser();
      const text = getAIInsight(user, NexusDB.getMoods(), NexusDB.getGoals(), NexusDB.getXP());
      typeText(insightEl, text);
    }
    
    // Same for top insight text
    const topInsight = document.getElementById('ai-insight-text');
    if (topInsight) topInsight.textContent = 'Your AI navigator is active and learning from your patterns 🧠';

    // Goal interactions
    document.querySelectorAll('.goal-item').forEach(item => {
      const handler = () => {
        const id = parseInt(item.dataset.goalId);
        NexusDB.toggleGoal(id);
        const wasCompleted = item.classList.contains('completed');
        if (!wasCompleted) {
          NexusDB.addXP(item.querySelector('.goal-xp')?.textContent?.replace(/\D/g, '') * 1 || 10);
          NexusApp.showXPGain('+' + (item.querySelector('.goal-xp')?.textContent?.replace(/\D/g, '') || 10) + ' XP!');
          NexusApp.showToast('Goal completed! 🎉', 'success');
          NexusApp.checkAchievements();
        }
        NexusApp.navigate('dashboard'); // refresh
      };
      item.addEventListener('click', handler);
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }});
    });

    // Mood buttons
    document.getElementById('quick-mood-btn')?.addEventListener('click', () => NexusApp.showMoodOverlay());
    document.getElementById('log-mood-now')?.addEventListener('click', () => NexusApp.showMoodOverlay());
    document.getElementById('start-ai-chat')?.addEventListener('click', () => NexusApp.navigate('mindspace'));

    // Add goal
    document.getElementById('add-goal-btn')?.addEventListener('click', () => {
      const title = prompt('What\'s your goal?');
      if (title?.trim()) {
        NexusDB.addGoal({ title: title.trim(), xp: 15 });
        NexusApp.navigate('dashboard');
        NexusApp.showToast('Goal added! 🎯', 'success');
      }
    });
  }

  function typeText(el, text) {
    el.innerHTML = '';
    // Convert markdown to html
    const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    el.innerHTML = html;
    el.style.animation = 'fadeIn 0.5s ease';
  }

  return { render, afterRender };
})();

window.DashboardModule = DashboardModule;
