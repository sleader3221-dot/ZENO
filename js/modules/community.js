/* ===================================================
   NEXUS — Community Module
   =================================================== */

const CommunityModule = (() => {
  let currentTab = 'resources';

  function render() {
    const resources = NexusAI.getKB().local_resources;
    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-green">🌐 Community</span>
          <h1 class="module-hero" style="background: var(--grad-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Community & Local Resources</h1>
          <p>Find free local services, connect with peers, and access the support you need — because no one should have to navigate life's challenges alone.</p>
        </div>

        <div class="tab-nav">
          <button class="tab-btn ${currentTab==='resources'?'active':''}" id="cm-tab-resources">📍 Local Resources</button>
          <button class="tab-btn ${currentTab==='creator'?'active':''}" id="cm-tab-creator">🎨 Creator Studio</button>
          <button class="tab-btn ${currentTab==='peer'?'active':''}" id="cm-tab-peer">💬 Peer Support</button>
        </div>

        <!-- Local Resources -->
        <div class="tab-content ${currentTab==='resources'?'active':''}" id="cm-content-resources">
          <div class="resource-radar mb-xl">
            <div style="font-weight:700;font-family:var(--font-display);margin-bottom:4px;">📡 Local Resource Radar</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">Find free services near you. All resources verified and updated monthly.</div>
            <div class="radar-search">
              <input type="text" placeholder="Enter ZIP code or city..." id="resource-search" aria-label="Search by ZIP code or city" />
              <button class="btn-primary btn-sm" id="search-resources">Find Resources →</button>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
              ${['All','Food','Mental Health','Tutoring','Healthcare','Career','Shelter'].map((f,i) => `
                <button class="tab-btn ${i===0?'active':''} resource-filter-btn" style="padding:5px 12px;font-size:0.75rem;" data-filter="${f.toLowerCase()}" aria-label="Filter by ${f}">${f}</button>
              `).join('')}
            </div>
          </div>

          <div id="resources-list" class="stagger">
            ${resources.map(r => `
              <div class="resource-location-card" data-type="${r.type}">
                <div class="resource-loc-icon" style="background:rgba(${hexToRgb(r.color)},0.15);">
                  <span style="font-size:1.5rem;">${r.emoji}</span>
                </div>
                <div class="resource-loc-info">
                  <div class="resource-loc-name">${r.name}</div>
                  <div class="resource-loc-type">${r.desc}</div>
                  <div class="resource-loc-meta">
                    <span class="resource-loc-distance">📍 ${r.distance}</span>
                    <span class="resource-loc-hours">🕐 ${r.hours}</span>
                    <span class="resource-loc-open" style="color:${r.open?'var(--green)':'var(--rose)'};">${r.open?'● Open Now':'○ Closed'}</span>
                  </div>
                </div>
                <div class="resource-loc-action">
                  <button class="btn-secondary btn-sm" aria-label="Get directions to ${r.name}">Directions</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Crisis Resources Always Visible -->
          <div class="crisis-banner mt-xl">
            <div class="crisis-icon">📞</div>
            <div class="crisis-text">
              <h4>National Helplines</h4>
              <p style="font-size:0.8rem;">Free, confidential, 24/7 support lines available anywhere in the US.</p>
              <div class="crisis-actions" style="flex-wrap:wrap;">
                ${[
                  { label:'988 Suicide & Crisis', href:'tel:988' },
                  { label:'Crisis Text Line', href:'sms:741741' },
                  { label:'SAMHSA (Substance)', href:'tel:18006624357' },
                  { label:'RAINN (Sexual Assault)', href:'tel:18006564673' },
                  { label:'Trevor (LGBTQ+)', href:'tel:18664887386' },
                  { label:'Childhelp (Abuse)', href:'tel:18004224453' }
                ].map(r => `<a href="${r.href}" class="crisis-btn" aria-label="${r.label}">${r.label}</a>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Creator Studio -->
        <div class="tab-content ${currentTab==='creator'?'active':''}" id="cm-content-creator">
          <div class="section-header mb-lg">
            <div>
              <div class="section-title" style="font-size:1rem;">🎨 Creator Studio</div>
              <div class="section-subtitle">AI tools for the next generation of creators</div>
            </div>
          </div>

          <!-- Content Ideas Generator -->
          <div class="card mb-lg">
            <div style="font-weight:700;font-family:var(--font-display);margin-bottom:4px;">💡 Content Idea Generator</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">Tell us your niche and we'll generate 10 content ideas with hooks, formats, and hashtags.</div>
            <div class="grid-3" style="gap:12px;margin-bottom:16px;">
              <div class="input-group">
                <label class="input-label" for="creator-niche">Your Niche</label>
                <input type="text" id="creator-niche" class="input-field" placeholder="fitness, cooking, coding..." />
              </div>
              <div class="input-group">
                <label class="input-label" for="creator-platform">Platform</label>
                <select id="creator-platform" class="input-field" aria-label="Select platform">
                  <option>TikTok</option><option>YouTube</option><option>Instagram</option><option>Twitter/X</option>
                </select>
              </div>
              <div class="input-group">
                <label class="input-label" for="creator-goal">Goal</label>
                <select id="creator-goal" class="input-field" aria-label="Select goal">
                  <option>Grow followers</option><option>Monetize</option><option>Build community</option><option>Brand awareness</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" id="generate-ideas">Generate 10 Ideas ✨</button>
          </div>

          <div id="ideas-results" class="hidden"></div>

          <!-- Brand Deal Evaluator -->
          <div class="card mb-lg">
            <div style="font-weight:700;font-family:var(--font-display);margin-bottom:4px;">💰 Brand Deal Evaluator</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">Is this offer fair? Let AI analyze it for you.</div>
            <div class="grid-2" style="gap:12px;margin-bottom:16px;">
              <div class="input-group">
                <label class="input-label" for="bd-followers">Your Followers</label>
                <input type="number" id="bd-followers" class="input-field" placeholder="5000" />
              </div>
              <div class="input-group">
                <label class="input-label" for="bd-offer">Offer Amount ($)</label>
                <input type="number" id="bd-offer" class="input-field" placeholder="200" />
              </div>
              <div class="input-group">
                <label class="input-label" for="bd-platform">Platform</label>
                <select id="bd-platform" class="input-field" aria-label="Platform for brand deal">
                  <option>TikTok</option><option>YouTube</option><option>Instagram</option>
                </select>
              </div>
              <div class="input-group">
                <label class="input-label" for="bd-deliverable">Deliverable</label>
                <select id="bd-deliverable" class="input-field" aria-label="Deliverable type">
                  <option>Dedicated video</option><option>Mention in video</option><option>Story post</option><option>Feed post</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" id="evaluate-deal">Evaluate Deal 💰</button>
          </div>

          <div id="deal-result" class="hidden"></div>

          <!-- Creator Burnout Scanner -->
          <div class="card" style="background:linear-gradient(135deg,rgba(255,107,157,0.08),rgba(108,99,255,0.05));border-color:rgba(255,107,157,0.2);">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <span style="font-size:2rem;">🔥</span>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">Creator Burnout Scanner</div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">Feeling exhausted, uninspired, or dreading content creation? Take this 2-minute check.</div>
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;" id="burnout-questions">
                  ${[
                    'I dread opening my editing software or camera',
                    'I feel like my content is never good enough',
                    'I compare myself to bigger creators constantly',
                    'I\'ve lost the joy I had when I first started creating',
                    'I feel pressure to post even when I don\'t want to'
                  ].map((q, i) => `
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input type="checkbox" id="bq-${i}" style="width:16px;height:16px;accent-color:var(--purple);" aria-label="${q}" />
                      <label for="bq-${i}" style="font-size:0.8rem;color:var(--text-secondary);cursor:pointer;">${q}</label>
                    </div>
                  `).join('')}
                </div>
                <button class="btn-sm btn-secondary" id="check-burnout">Check My Burnout Level</button>
              </div>
            </div>
          </div>

          <div id="burnout-result" class="hidden mt-md"></div>
        </div>

        <!-- Peer Support -->
        <div class="tab-content ${currentTab==='peer'?'active':''}" id="cm-content-peer">
          <div style="text-align:center;padding:40px 20px;">
            <div style="font-size:4rem;margin-bottom:16px;">🤝</div>
            <h2 style="font-family:var(--font-display);margin-bottom:8px;">Peer Support Community</h2>
            <p style="color:var(--text-muted);font-size:0.875rem;line-height:1.7;max-width:480px;margin:0 auto 24px;">
              Connect with other NEXUS users who get it. Share wins, ask for advice, or just know you're not alone. AI-moderated for safety.
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:480px;margin:0 auto 24px;">
              ${[
                {emoji:'📚',name:'College Apps & Stress',members:'143 teens'},
                {emoji:'💰',name:'First Jobs & Money',members:'98 teens'},
                {emoji:'🧠',name:'Mental Health Support',members:'211 teens'},
                {emoji:'🚀',name:'Side Hustles & Business',members:'77 teens'}
              ].map(r => `
                <div class="card" style="text-align:center;padding:16px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                  <div style="font-size:2rem;margin-bottom:6px;">${r.emoji}</div>
                  <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px;">${r.name}</div>
                  <div style="font-size:0.7rem;color:var(--text-muted);">${r.members} active</div>
                </div>
              `).join('')}
            </div>
            <button class="btn-primary" id="join-community">Join Community →</button>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:12px;">AI-moderated • Anonymous option • No bullying policy</div>
          </div>
        </div>
      </div>
    `;
  }

  function hexToRgb(hex) {
    hex = hex.replace('#','');
    const r = parseInt(hex.substring(0,2),16);
    const g = parseInt(hex.substring(2,4),16);
    const b = parseInt(hex.substring(4,6),16);
    return `${r},${g},${b}`;
  }

  function afterRender() {
    // Tab switching
    ['resources','creator','peer'].forEach(tab => {
      document.getElementById(`cm-tab-${tab}`)?.addEventListener('click', () => {
        currentTab = tab;
        document.querySelectorAll('[id^="cm-tab-"]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('[id^="cm-content-"]').forEach(c => c.classList.remove('active'));
        document.getElementById(`cm-tab-${tab}`)?.classList.add('active');
        document.getElementById(`cm-content-${tab}`)?.classList.add('active');
      });
    });

    // Resource filter
    document.querySelectorAll('.resource-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.resource-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.resource-location-card').forEach(card => {
          card.style.display = filter === 'all' || card.dataset.type === filter ? '' : 'none';
        });
      });
    });

    // Resource search
    document.getElementById('search-resources')?.addEventListener('click', () => {
      const query = document.getElementById('resource-search')?.value?.trim();
      if (query) {
        NexusApp.showToast(`Finding resources in ${query}... 📍`, 'info');
        NexusDB.addXP(5);
        NexusApp.updateNavStats();
      }
    });

    // Content idea generator
    document.getElementById('generate-ideas')?.addEventListener('click', () => {
      const niche = document.getElementById('creator-niche')?.value?.trim() || 'your topic';
      const platform = document.getElementById('creator-platform')?.value;
      const goal = document.getElementById('creator-goal')?.value;
      const ideas = NexusAI.generateContentIdeas(niche, platform, goal);
      
      const resultsEl = document.getElementById('ideas-results');
      if (resultsEl) {
        resultsEl.classList.remove('hidden');
        resultsEl.innerHTML = `
          <div class="section-header mb-md">
            <div class="section-title" style="font-size:1rem;">10 Ideas for ${niche} on ${platform}</div>
            <span class="badge badge-rose">AI Generated</span>
          </div>
          ${ideas.map(idea => `
            <div class="creator-idea">
              <div class="creator-idea-num">#${idea.id}</div>
              <div class="creator-idea-hook">"${idea.hook}"</div>
              <div class="creator-idea-title">${idea.title}</div>
              <div class="creator-idea-format">Format: ${idea.format}</div>
              <div class="creator-idea-tags">${idea.tags.map(t=>`<span class="badge badge-rose" style="font-size:0.65rem;">${t}</span>`).join('')}</div>
            </div>
          `).join('')}
        `;
        NexusDB.addXP(15);
        NexusApp.showToast('10 content ideas generated! +15 XP 🎨', 'success');
        NexusApp.checkAchievements();
        NexusApp.updateNavStats();
      }
    });

    // Brand deal evaluator
    document.getElementById('evaluate-deal')?.addEventListener('click', () => {
      const followers = parseInt(document.getElementById('bd-followers')?.value || 0);
      const offer = parseFloat(document.getElementById('bd-offer')?.value || 0);
      const platform = document.getElementById('bd-platform')?.value;
      const deliverable = document.getElementById('bd-deliverable')?.value;
      
      if (!followers || !offer) { NexusApp.showToast('Please enter your followers and offer amount', 'error'); return; }
      
      const rateMap = { TikTok: 2, YouTube: 20, Instagram: 10 };
      const rate = rateMap[platform] || 5;
      const expectedMin = (followers / 1000) * rate;
      const expectedMax = expectedMin * 2.5;
      const deliverableMultiplier = deliverable === 'Dedicated video' ? 1.5 : deliverable === 'Story post' ? 0.4 : 1;
      const adjustedMin = expectedMin * deliverableMultiplier;
      const adjustedMax = expectedMax * deliverableMultiplier;
      
      const isFair = offer >= adjustedMin;
      const isGreat = offer >= adjustedMax;
      
      const resultEl = document.getElementById('deal-result');
      if (resultEl) {
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
          <div class="card" style="background:linear-gradient(135deg,rgba(${isFair?'6,214,160':'255,107,157'},0.08),transparent);border-color:rgba(${isFair?'6,214,160':'255,107,157'},0.3);">
            <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
              <div style="font-size:2.5rem;">${isGreat?'🤩':isFair?'👍':'🤔'}</div>
              <div>
                <div style="font-weight:700;font-size:1.1rem;color:${isFair?'var(--green)':'var(--rose)'};">${isGreat?'Excellent Deal!':isFair?'Fair Offer':'Below Market Rate'}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">${followers.toLocaleString()} followers on ${platform}</div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;margin-bottom:12px;">
              <div style="font-size:0.8rem;margin-bottom:6px;"><strong style="color:var(--text-secondary);">Market Rate:</strong> <span style="color:var(--teal);">$${adjustedMin.toFixed(0)}–$${adjustedMax.toFixed(0)}</span> for this ${deliverable}</div>
              <div style="font-size:0.8rem;"><strong style="color:var(--text-secondary);">You were offered:</strong> <span style="color:${isFair?'var(--green)':'var(--rose)'};">$${offer}</span></div>
            </div>
            ${!isFair ? `
              <div style="background:rgba(255,209,102,0.08);border-radius:8px;padding:12px;">
                <div style="font-size:0.8rem;font-weight:600;color:var(--gold);margin-bottom:4px;">💬 Counter-offer Script</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);font-style:italic;line-height:1.6;">"Hi [Brand], I love the opportunity to work together! Based on my engagement rate and the ${platform} market, I typically receive $${adjustedMin.toFixed(0)}–$${adjustedMax.toFixed(0)} for a ${deliverable}. Would you be able to meet at $${(adjustedMin*0.8).toFixed(0)}? I'm excited to create something great for your brand!"</div>
              </div>
            ` : ''}
            ${isGreat ? `<div style="font-size:0.8rem;color:var(--green);margin-top:8px;">✅ This is above market rate — great job negotiating your worth!</div>` : ''}
          </div>
        `;
        NexusDB.addXP(10);
        NexusApp.showToast('Deal analyzed! +10 XP 💰', 'success');
        NexusApp.updateNavStats();
      }
    });

    // Burnout checker
    document.getElementById('check-burnout')?.addEventListener('click', () => {
      const checked = document.querySelectorAll('[id^="bq-"]:checked').length;
      const total = 5;
      const level = checked === 0 ? 'none' : checked <= 1 ? 'low' : checked <= 3 ? 'moderate' : 'high';
      const config = {
        none: { emoji:'🌟', label:'No Burnout Detected', color:'var(--green)', msg:'You\'re thriving! Keep doing what you\'re doing — sustainable consistency beats short burnout sprints every time.', tips:['Celebrate your consistency!','Keep a content ideas journal for creative dry spells','Schedule "play" shoots with no pressure to post'] },
        low: { emoji:'😊', label:'Low Burnout Risk', color:'var(--teal)', msg:'A few signs of strain, but you\'re managing well. Some preventive steps will keep you in flow.', tips:['Take one day off per week from content','Batch-create to reduce daily pressure','Reconnect with why you started creating'] },
        moderate: { emoji:'⚠️', label:'Moderate Burnout', color:'var(--gold)', msg:'Clear signs of creator fatigue. Time to recharge before it gets worse. Your audience will understand a break.', tips:['Take 1–2 weeks off from posting','Reconnect with your original creative joy','Set a sustainable posting schedule (2x/week)','Talk to a friend or use NEXUS MindSpace'] },
        high: { emoji:'🆘', label:'High Burnout', color:'var(--rose)', msg:'You\'re burned out. This is serious and affects your mental health, not just your content. Please rest.', tips:['Take a proper break (1+ month is fine)','Talk to someone you trust','Explore NEXUS MindSpace for support','Remember: creators who burn out lose everything; those who rest come back stronger'] }
      };
      const c = config[level];
      
      const resultEl = document.getElementById('burnout-result');
      if (resultEl) {
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
          <div class="card" style="border-color:rgba(255,107,157,0.3);">
            <div style="text-align:center;margin-bottom:16px;">
              <div style="font-size:3rem;margin-bottom:8px;">${c.emoji}</div>
              <div style="font-weight:700;font-size:1.1rem;color:${c.color};">${c.label}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">${checked}/${total} burnout indicators</div>
            </div>
            <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.7;margin-bottom:16px;text-align:center;">${c.msg}</p>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${c.tips.map(t=>`<div style="display:flex;gap:8px;align-items:flex-start;font-size:0.8rem;color:var(--text-secondary);">💡 ${t}</div>`).join('')}
            </div>
            ${level === 'high' || level === 'moderate' ? `<button class="btn-primary btn-sm" style="width:100%;margin-top:16px;" onclick="NexusApp.navigate('mindspace')">Go to MindSpace →</button>` : ''}
          </div>
        `;
        NexusDB.addXP(5);
        NexusApp.updateNavStats();
      }
    });

    // Join community
    document.getElementById('join-community')?.addEventListener('click', () => {
      NexusApp.showToast('Community feature coming soon! 🤝', 'info');
    });

    // Directions buttons
    document.querySelectorAll('.resource-loc-action .btn-secondary').forEach(btn => {
      btn.addEventListener('click', () => {
        NexusApp.showToast('Opening maps... 📍', 'info');
        NexusDB.addXP(2);
        NexusApp.updateNavStats();
      });
    });
  }

  return { render, afterRender };
})();

window.CommunityModule = CommunityModule;
