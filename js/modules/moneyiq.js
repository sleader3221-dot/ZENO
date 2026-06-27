/* ===================================================
   NEXUS — MoneyIQ Module (Financial Literacy)
   =================================================== */

const MoneyiqModule = (() => {
  let currentTab = 'budget';
  let budgetChart = null;

  const categories = [
    { id: 'food', name: 'Food & Dining', emoji: '🍔', color: '#ff9f43' },
    { id: 'transport', name: 'Transport', emoji: '🚌', color: '#00d4ff' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎮', color: '#6c63ff' },
    { id: 'clothes', name: 'Clothing', emoji: '👕', color: '#ff6b9d' },
    { id: 'savings', name: 'Savings', emoji: '💰', color: '#06d6a0' },
    { id: 'education', name: 'Education', emoji: '📚', color: '#a855f7' },
    { id: 'health', name: 'Health', emoji: '💊', color: '#ffd166' },
    { id: 'other', name: 'Other', emoji: '📦', color: '#c0c0c0' }
  ];

  function getCategoryById(id) {
    return categories.find(c => c.id === id) || categories[7];
  }

  function formatCurrency(amount) {
    return '$' + parseFloat(amount || 0).toFixed(2);
  }

  function getTotalByType(expenses, type) {
    return (expenses || []).filter(e => e.type === type).reduce((a, b) => a + parseFloat(b.amount || 0), 0);
  }

  function renderBudgetChart(container, expenses) {
    if (budgetChart) { budgetChart.destroy(); budgetChart = null; }
    if (!container || !expenses.length) return;
    
    const catTotals = {};
    (expenses || []).filter(e => e.type === 'expense').forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount || 0);
    });
    
    const labels = Object.keys(catTotals).map(id => getCategoryById(id)?.name || id);
    const data = Object.values(catTotals);
    const colors = Object.keys(catTotals).map(id => getCategoryById(id)?.color || '#6c63ff');
    
    if (!labels.length) return;
    
    const ctx = container.getContext('2d');
    budgetChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: 'rgba(10,11,30,0.8)', borderWidth: 3, hoverOffset: 8 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', font: { size: 11 }, padding: 12, usePointStyle: true } },
          tooltip: {
            backgroundColor: 'rgba(15,16,53,0.95)', borderColor: 'rgba(108,99,255,0.4)', borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)} (${Math.round(ctx.parsed/data.reduce((a,b)=>a+b,0)*100)}%)` }
          }
        },
        cutout: '65%'
      }
    });
  }

  function render() {
    const expenses = NexusDB.getExpenses();
    const savings = NexusDB.getSavings();
    const totalIncome = getTotalByType(expenses, 'income');
    const totalExpenses = getTotalByType(expenses, 'expense');
    const netBalance = totalIncome - totalExpenses;

    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-gold">💰 MoneyIQ</span>
          <h1 class="module-hero" style="background: var(--grad-gold); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Financial Literacy & Planning</h1>
          <p>Master money basics, track your spending, set savings goals, and build financial confidence — no bank account required to start.</p>
        </div>

        <!-- Balance Summary -->
        <div class="grid-3 mb-xl stagger">
          <div class="stat-card" style="border-top: 3px solid var(--green);">
            <div class="stat-icon">💵</div>
            <div class="stat-value" style="color: var(--green);">${formatCurrency(totalIncome)}</div>
            <div class="stat-label">Total Income</div>
            <div class="stat-change up">↑ This month</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--rose);">
            <div class="stat-icon">💸</div>
            <div class="stat-value" style="color: var(--rose);">${formatCurrency(totalExpenses)}</div>
            <div class="stat-label">Total Expenses</div>
          </div>
          <div class="stat-card" style="border-top: 3px solid var(--gold);">
            <div class="stat-icon">⚖️</div>
            <div class="stat-value" style="color: ${netBalance >= 0 ? 'var(--green)' : 'var(--rose)'};">${formatCurrency(Math.abs(netBalance))}</div>
            <div class="stat-label">Net Balance</div>
            <div class="stat-change ${netBalance >= 0 ? 'up' : 'down'}">${netBalance >= 0 ? '✅ Surplus' : '⚠️ Deficit'}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-nav">
          <button class="tab-btn ${currentTab === 'budget' ? 'active' : ''}" id="mq-tab-budget">📊 Budget</button>
          <button class="tab-btn ${currentTab === 'expenses' ? 'active' : ''}" id="mq-tab-expenses">📋 Expenses</button>
          <button class="tab-btn ${currentTab === 'savings' ? 'active' : ''}" id="mq-tab-savings">🎯 Savings</button>
          <button class="tab-btn ${currentTab === 'paycheck' ? 'active' : ''}" id="mq-tab-paycheck">💵 Paycheck</button>
          <button class="tab-btn ${currentTab === 'learn' ? 'active' : ''}" id="mq-tab-learn">📚 Learn</button>
        </div>

        <!-- Budget Overview -->
        <div class="tab-content ${currentTab === 'budget' ? 'active' : ''}" id="mq-content-budget">
          <div class="grid-2" style="gap:24px; margin-bottom:24px;">
            <div class="mood-chart-card">
              <div class="mood-chart-header">
                <div>
                  <div class="section-title" style="font-size:1rem;">Spending Breakdown</div>
                  <div class="section-subtitle">${expenses.filter(e=>e.type==='expense').length} expense${expenses.filter(e=>e.type==='expense').length !== 1 ? 's' : ''} tracked</div>
                </div>
              </div>
              ${expenses.filter(e=>e.type==='expense').length > 0 ? `
                <div style="height:220px;position:relative;">
                  <canvas id="budget-chart-canvas"></canvas>
                </div>
              ` : `
                <div class="empty-state" style="padding:40px 20px;">
                  <div class="empty-state-icon">📊</div>
                  <div class="empty-state-title">No expenses yet</div>
                  <div class="empty-state-desc">Add your first expense to see the breakdown</div>
                </div>
              `}
            </div>
            
            <!-- 50/30/20 Rule -->
            <div class="card" style="background: linear-gradient(135deg, rgba(255,209,102,0.08),rgba(255,159,67,0.03)); border-color: rgba(255,209,102,0.2);">
              <div style="font-weight:700; font-family:var(--font-display); margin-bottom:4px;">50/30/20 Budget Rule</div>
              <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:16px;">The most popular budgeting framework for beginners</div>
              ${[
                { label: 'Needs', percent: 50, color: 'var(--teal)', desc: 'Food, transport, rent, bills', emoji: '🏠' },
                { label: 'Wants', percent: 30, color: 'var(--purple)', desc: 'Entertainment, clothes, fun', emoji: '🎮' },
                { label: 'Savings', percent: 20, color: 'var(--green)', desc: 'Emergency fund, future goals', emoji: '💰' }
              ].map(r => `
                <div style="margin-bottom:14px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:0.8rem;font-weight:600;">${r.emoji} ${r.label}</span>
                    <span style="font-size:0.8rem;color:${r.color};font-weight:700;">${r.percent}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width:${r.percent}%;background:${r.color};"></div>
                  </div>
                  <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">${r.desc}</div>
                  ${totalIncome > 0 ? `<div style="font-size:0.7rem;color:${r.color};margin-top:1px;">= ${formatCurrency(totalIncome * r.percent / 100)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Quick Add Transaction -->
          <div class="card mb-lg">
            <div style="font-weight:700; margin-bottom:16px;">➕ Add Transaction</div>
            <div class="grid-2" style="gap:12px;">
              <div class="input-group">
                <label class="input-label" for="tx-desc">Description</label>
                <input type="text" id="tx-desc" class="input-field" placeholder="Lunch, bus fare, paycheck..." />
              </div>
              <div class="input-group">
                <label class="input-label" for="tx-amount">Amount ($)</label>
                <input type="number" id="tx-amount" class="input-field" placeholder="0.00" min="0" step="0.01" />
              </div>
              <div class="input-group">
                <label class="input-label" for="tx-type">Type</label>
                <select id="tx-type" class="input-field" aria-label="Transaction type">
                  <option value="expense">💸 Expense</option>
                  <option value="income">💵 Income</option>
                </select>
              </div>
              <div class="input-group">
                <label class="input-label" for="tx-category">Category</label>
                <select id="tx-category" class="input-field" aria-label="Transaction category">
                  ${categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <button class="btn-primary" id="add-transaction" style="margin-top:16px;">Add Transaction</button>
          </div>
        </div>

        <!-- Expenses List -->
        <div class="tab-content ${currentTab === 'expenses' ? 'active' : ''}" id="mq-content-expenses">
          <div class="section-header mb-md">
            <div class="section-title" style="font-size:1rem;">Transaction History</div>
            <span class="badge badge-gold">${expenses.length} entries</span>
          </div>
          ${expenses.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No transactions yet</div><div class="empty-state-desc">Add your first transaction to start tracking your money</div></div>` :
          expenses.map(e => {
            const cat = getCategoryById(e.category);
            return `
              <div class="expense-item" data-expense-id="${e.id}">
                <div class="expense-cat-dot" style="background:${cat.color};"></div>
                <div style="font-size:1.2rem;">${cat.emoji}</div>
                <div class="expense-info">
                  <div class="expense-name">${e.description}</div>
                  <div class="expense-cat">${cat.name} • ${new Date(e.date).toLocaleDateString()}</div>
                </div>
                <div class="expense-amount ${e.type}">${e.type === 'income' ? '+' : '-'}${formatCurrency(e.amount)}</div>
                <button class="btn-ghost btn-sm" style="padding:4px 8px;color:var(--rose);" onclick="NexusDB.deleteExpense(${e.id});NexusApp.navigate('moneyiq');" aria-label="Delete transaction">✕</button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Savings Goals -->
        <div class="tab-content ${currentTab === 'savings' ? 'active' : ''}" id="mq-content-savings">
          <div class="section-header mb-md">
            <div>
              <div class="section-title" style="font-size:1rem;">Savings Goals</div>
              <div class="section-subtitle">Set a goal, NEXUS tracks your progress</div>
            </div>
            <button class="btn-secondary btn-sm" id="add-savings-goal">+ New Goal</button>
          </div>
          
          ${savings.length === 0 ? `<div class="empty-state mb-xl"><div class="empty-state-icon">🎯</div><div class="empty-state-title">No savings goals yet</div><div class="empty-state-desc">Set your first goal — like saving for college, a laptop, or a trip</div></div>` :
          savings.map(g => `
            <div class="savings-goal">
              <div class="savings-goal-header">
                <div class="savings-goal-name">${g.emoji || '🎯'} ${g.name}</div>
                <div class="savings-goal-target">${formatCurrency(g.target)}</div>
              </div>
              <div class="savings-goal-progress progress-bar mb-md">
                <div class="progress-fill savings-goal-fill" style="width:${Math.round((g.saved/g.target)*100)}%; background: var(--grad-gold);"></div>
              </div>
              <div class="savings-goal-stats">
                <span class="savings-goal-saved">Saved: ${formatCurrency(g.saved)}</span>
                <span>${Math.round((g.saved/g.target)*100)}% complete</span>
                <span>Remaining: ${formatCurrency(g.target - g.saved)}</span>
              </div>
              <div style="margin-top:12px;display:flex;gap:8px;">
                <input type="number" class="input-field" placeholder="Add amount..." style="flex:1; padding:8px 12px;" id="add-savings-${g.id}" min="0" step="0.01" aria-label="Add to ${g.name} savings" />
                <button class="btn-secondary btn-sm" data-savings-id="${g.id}">Add</button>
              </div>
            </div>
          `).join('')}
          
          <!-- Add Savings Goal Modal -->
          <div id="savings-modal" class="hidden" style="position:fixed;inset:0;background:rgba(10,11,30,0.9);backdrop-filter:blur(10px);z-index:1500;display:flex;align-items:center;justify-content:center;padding:20px;">
            <div style="max-width:400px;width:100%;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-2xl);padding:var(--space-xl);animation:scaleIn 0.3s var(--ease-spring);">
              <h3 style="font-family:var(--font-display);margin-bottom:20px;">New Savings Goal</h3>
              <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px;">
                <div class="input-group"><label class="input-label" for="sg-name">Goal Name</label><input type="text" id="sg-name" class="input-field" placeholder="Laptop, College fund, Trip..." /></div>
                <div class="input-group"><label class="input-label" for="sg-target">Target Amount ($)</label><input type="number" id="sg-target" class="input-field" placeholder="500" min="1" /></div>
                <div class="input-group"><label class="input-label" for="sg-emoji">Emoji (optional)</label><input type="text" id="sg-emoji" class="input-field" placeholder="💻 🎓 ✈️" maxlength="2" /></div>
              </div>
              <div style="display:flex;gap:12px;">
                <button class="btn-primary" id="create-savings-goal" style="flex:1;">Create Goal</button>
                <button class="btn-ghost" id="close-savings-modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <!-- First Paycheck Wizard -->
        <div class="tab-content ${currentTab === 'paycheck' ? 'active' : ''}" id="mq-content-paycheck">
          <div class="card mb-lg" style="background:linear-gradient(135deg,rgba(255,209,102,0.1),rgba(6,214,160,0.05));border-color:rgba(255,209,102,0.25);">
            <div style="font-size:1.5rem;margin-bottom:8px;">💵 First Paycheck Decoder</div>
            <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:20px;">Enter your gross pay and we'll break it all down for you.</p>
            <div class="grid-2" style="gap:12px;margin-bottom:16px;">
              <div class="input-group">
                <label class="input-label" for="gross-pay">Gross Pay ($)</label>
                <input type="number" id="gross-pay" class="input-field" placeholder="500.00" min="0" step="0.01" />
              </div>
              <div class="input-group">
                <label class="input-label" for="state-select">State</label>
                <select id="state-select" class="input-field" aria-label="Select state">
                  <option value="0">No state income tax</option>
                  <option value="0.0495">Illinois (4.95%)</option>
                  <option value="0.0525">New Jersey (5.25%)</option>
                  <option value="0.0425">Virginia (4.25%)</option>
                  <option value="0.0133">California (1.33%)</option>
                  <option value="0.05">New York (5%)</option>
                  <option value="0.0307">Pennsylvania (3.07%)</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" id="calc-paycheck">Calculate My Paycheck →</button>
          </div>
          <div id="paycheck-result" class="hidden"></div>
          
          <!-- Financial Stress Triage -->
          <div class="stress-alert mt-lg">
            <div class="stress-alert-header">
              <span style="font-size:1.5rem;">🆘</span>
              <div class="stress-alert-title">Struggling financially right now?</div>
            </div>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:16px;">These resources are available in most communities — often free, always confidential.</p>
            <div class="resources-grid">
              ${[
                { emoji:'🍱', name:'Food Banks', desc:'Free groceries & meals, no ID required' },
                { emoji:'💊', name:'Free Healthcare', desc:'Community health centers, sliding scale' },
                { emoji:'📚', name:'Free Tutoring', desc:'Public libraries, after-school programs' },
                { emoji:'💼', name:'Job Training', desc:'Workforce development, free certifications' },
                { emoji:'🏠', name:'Housing Help', desc:'Emergency assistance, rent support' },
                { emoji:'📱', name:'Lifeline Phone', desc:'Free smartphone for low-income families' }
              ].map(r => `
                <div class="resource-card">
                  <div class="resource-card-icon">${r.emoji}</div>
                  <div class="resource-card-name">${r.name}</div>
                  <div class="resource-card-desc">${r.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Financial Education -->
        <div class="tab-content ${currentTab === 'learn' ? 'active' : ''}" id="mq-content-learn">
          <div class="grid-auto stagger">
            ${[
              { emoji:'🏦', title:'What is a bank account?', level:'Beginner', content:'A bank account is a safe place to store money. A checking account is for daily spending; a savings account earns interest over time. You need ID and a small deposit to open one.' },
              { emoji:'💳', title:'Credit cards: friend or foe?', level:'Intermediate', content:'Credit cards are tools. Used well: build credit history, earn rewards, fraud protection. Used badly: high interest (15–30% APR), debt spirals. Rule: Only charge what you can pay in full each month.' },
              { emoji:'📈', title:'Compound interest: the 8th wonder', level:'Beginner', content:'$100 invested at 7% becomes $200 in ~10 years, $400 in 20, $800 in 30 — without adding a dollar. Starting at 16 vs 26 means 2x more money at retirement. Start now.' },
              { emoji:'🏛️', title:'Taxes explained simply', level:'Beginner', content:'You pay federal + state income tax on earnings. For teens, if you earn under ~$13,850/yr, you owe $0 federal tax. But your employer still withholds — file a return to get it back!' },
              { emoji:'🎓', title:'FAFSA: Free college money', level:'Intermediate', content:'FAFSA (Free Application for Federal Student Aid) determines your eligibility for grants (FREE money), work-study, and low-interest loans. File every year. Deadline: June 30. Opens Oct 1.' },
              { emoji:'💎', title:'Emergency fund basics', level:'Beginner', content:'An emergency fund is 3–6 months of expenses saved for unexpected costs. Start with $500 as a mini-emergency fund. This prevents going into debt when life happens.' }
            ].map(lesson => `
              <div class="card hover-lift" style="cursor:pointer;" role="button" tabindex="0" onclick="this.querySelector('.lesson-content').classList.toggle('hidden');" aria-expanded="false" aria-label="Learn about ${lesson.title}">
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <div style="font-size:2rem;flex-shrink:0;">${lesson.emoji}</div>
                  <div style="flex:1;">
                    <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">${lesson.title}</div>
                    <span class="badge ${lesson.level==='Beginner'?'badge-green':'badge-gold'}" style="font-size:0.65rem;">${lesson.level}</span>
                  </div>
                  <div style="color:var(--text-muted);">▼</div>
                </div>
                <div class="lesson-content hidden" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:0.85rem;color:var(--text-secondary);line-height:1.7;">${lesson.content}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function afterRender() {
    // Tab switching
    ['budget','expenses','savings','paycheck','learn'].forEach(tab => {
      document.getElementById(`mq-tab-${tab}`)?.addEventListener('click', () => {
        currentTab = tab;
        document.querySelectorAll('[id^="mq-tab-"]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('[id^="mq-content-"]').forEach(c => c.classList.remove('active'));
        document.getElementById(`mq-tab-${tab}`)?.classList.add('active');
        document.getElementById(`mq-content-${tab}`)?.classList.add('active');
        // Render chart if switching to budget
        if (tab === 'budget') {
          setTimeout(() => {
            const canvas = document.getElementById('budget-chart-canvas');
            if (canvas) renderBudgetChart(canvas, NexusDB.getExpenses());
          }, 100);
        }
      });
    });

    // Render chart
    setTimeout(() => {
      const canvas = document.getElementById('budget-chart-canvas');
      if (canvas) renderBudgetChart(canvas, NexusDB.getExpenses());
    }, 200);

    // Add transaction
    document.getElementById('add-transaction')?.addEventListener('click', () => {
      const desc = document.getElementById('tx-desc')?.value?.trim();
      const amount = parseFloat(document.getElementById('tx-amount')?.value);
      const type = document.getElementById('tx-type')?.value;
      const category = document.getElementById('tx-category')?.value;
      
      if (!desc || !amount || isNaN(amount) || amount <= 0) {
        NexusApp.showToast('Please fill in all fields', 'error');
        return;
      }
      
      NexusDB.addExpense({ description: desc, amount, type, category });
      NexusDB.addXP(5);
      NexusApp.showToast(`${type === 'income' ? 'Income' : 'Expense'} added! +5 XP 💰`, 'success');
      NexusApp.checkAchievements();
      NexusApp.updateNavStats();
      NexusApp.navigate('moneyiq');
    });

    // Savings goals
    document.getElementById('add-savings-goal')?.addEventListener('click', () => {
      document.getElementById('savings-modal')?.classList.remove('hidden');
    });
    document.getElementById('close-savings-modal')?.addEventListener('click', () => {
      document.getElementById('savings-modal')?.classList.add('hidden');
    });
    document.getElementById('create-savings-goal')?.addEventListener('click', () => {
      const name = document.getElementById('sg-name')?.value?.trim();
      const target = parseFloat(document.getElementById('sg-target')?.value);
      const emoji = document.getElementById('sg-emoji')?.value?.trim() || '🎯';
      if (!name || !target || isNaN(target)) { NexusApp.showToast('Please fill in goal details', 'error'); return; }
      NexusDB.addSavings({ name, target, emoji });
      NexusDB.addXP(10);
      document.getElementById('savings-modal')?.classList.add('hidden');
      NexusApp.showToast('Savings goal created! +10 XP 🎯', 'success');
      NexusApp.checkAchievements();
      NexusApp.navigate('moneyiq');
    });

    // Add to savings
    document.querySelectorAll('[data-savings-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.savingsId);
        const input = document.getElementById(`add-savings-${id}`);
        const amount = parseFloat(input?.value);
        if (!amount || isNaN(amount) || amount <= 0) { NexusApp.showToast('Enter a valid amount', 'error'); return; }
        NexusDB.updateSavings(id, amount);
        NexusDB.addXP(5);
        NexusApp.showToast(`$${amount} added to savings! 💰`, 'success');
        NexusApp.navigate('moneyiq');
      });
    });

    // Paycheck calculator
    document.getElementById('calc-paycheck')?.addEventListener('click', () => {
      const gross = parseFloat(document.getElementById('gross-pay')?.value);
      const stateRate = parseFloat(document.getElementById('state-select')?.value || 0);
      if (!gross || isNaN(gross)) { NexusApp.showToast('Enter your gross pay', 'error'); return; }
      
      const fica = gross * 0.0765;
      const federal = gross < 13850/52 ? 0 : gross * 0.1;
      const state = gross * stateRate;
      const net = gross - fica - federal - state;
      
      const resultEl = document.getElementById('paycheck-result');
      if (resultEl) {
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
          <div class="card" style="background:linear-gradient(135deg,rgba(6,214,160,0.08),rgba(0,212,255,0.03));border-color:rgba(6,214,160,0.2);">
            <div style="font-weight:700;font-family:var(--font-display);font-size:1.1rem;margin-bottom:16px;">Your Paycheck Breakdown</div>
            ${[
              { label:'Gross Pay', amount: gross, color:'var(--green)', desc:'What you earned' },
              { label:'FICA (Social Security + Medicare)', amount: -fica, color:'var(--rose)', desc:'7.65% — funds your future benefits' },
              { label:'Federal Income Tax', amount: -federal, color:'var(--rose)', desc: federal === 0 ? 'You\'re under the threshold — $0!' : '~10% bracket' },
              { label:'State Income Tax', amount: -state, color:'var(--rose)', desc:`${(stateRate*100).toFixed(2)}% state rate` },
              { label:'🎉 Net (Take-Home) Pay', amount: net, color:'var(--gold)', desc:'What hits your account' }
            ].map(r => `
              <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);">
                <div>
                  <div style="font-size:0.875rem;font-weight:600;">${r.label}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">${r.desc}</div>
                </div>
                <div style="font-weight:700;color:${r.color};font-family:var(--font-display);">${r.amount >= 0 ? '' : '-'}$${Math.abs(r.amount).toFixed(2)}</div>
              </div>
            `).join('')}
            <div style="margin-top:16px;padding:12px;background:rgba(255,209,102,0.08);border-radius:8px;">
              <div style="font-size:0.8rem;font-weight:600;color:var(--gold);margin-bottom:4px;">50/30/20 Split of Your Net Pay</div>
              <div style="font-size:0.78rem;color:var(--text-secondary);">
                Needs: $${(net*0.5).toFixed(2)} | Wants: $${(net*0.3).toFixed(2)} | Savings: $${(net*0.2).toFixed(2)}
              </div>
            </div>
          </div>
        `;
        NexusDB.addXP(10);
        NexusApp.showToast('Paycheck decoded! +10 XP 💵', 'success');
        NexusApp.updateNavStats();
      }
    });
  }

  return { render, afterRender };
})();

window.MoneyiqModule = MoneyiqModule;
