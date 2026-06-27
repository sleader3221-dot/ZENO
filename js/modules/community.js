/* ===================================================
   ZENO — Community Module
   Live resources, maps, creator tools, and peer support.
   =================================================== */

const CommunityModule = (() => {
  let currentTab = 'resources';
  let resourceMap = null;
  let markerLayer = null;
  let liveResources = [];
  let liveLocation = null;
  let liveWeather = null;
  let selectedFilter = 'all';

  const filters = [
    { id: 'all', label: 'All', emoji: '✨' },
    { id: 'food', label: 'Food', emoji: '🍱' },
    { id: 'mental_health', label: 'Mental Health', emoji: '💚' },
    { id: 'health', label: 'Healthcare', emoji: '💊' },
    { id: 'tutoring', label: 'Learning', emoji: '📚' },
    { id: 'career', label: 'Career', emoji: '💼' },
    { id: 'shelter', label: 'Shelter', emoji: '🏠' },
    { id: 'community', label: 'Community', emoji: '🌐' }
  ];

  function getFallbackResources() {
    return (NexusAI.getKB().local_resources || []).map((r, index) => ({
      id: `fallback-${index}`,
      name: r.name,
      type: r.type,
      label: r.type?.replace(/_/g, ' ') || 'resource',
      emoji: r.emoji,
      color: r.color,
      desc: r.desc,
      hours: r.hours,
      open: r.open,
      distance: r.distance,
      source: 'Curated demo dataset'
    }));
  }

  function visibleResources() {
    const resources = liveResources.length ? liveResources : getFallbackResources();
    return selectedFilter === 'all'
      ? resources
      : resources.filter(resource => resource.type === selectedFilter);
  }

  function render() {
    const cached = window.ZenoLive?.getCachedContext?.();
    if (cached?.location && !liveLocation) liveLocation = cached.location;
    if (cached?.weather && !liveWeather) liveWeather = cached.weather;
    if (cached?.resources?.length && !liveResources.length) liveResources = cached.resources;

    const shownResources = visibleResources();
    const resourceCount = liveResources.length || getFallbackResources().length;
    const lastLabel = liveLocation?.label || cached?.location?.label || 'Search a city or use your location';

    return `
      <div class="page-enter">
        <div class="module-hero">
          <span class="module-hero-badge badge badge-green">🌐 Community</span>
          <h1 class="module-hero" style="background: var(--grad-teal); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Live Community Intelligence</h1>
          <p>Find real nearby resources, explore support on a live map, evaluate creator opportunities, and connect with safer support flows.</p>
        </div>

        <div class="grid-4 mb-xl stagger">
          <div class="stat-card live-stat-card">
            <div class="stat-icon">🗺️</div>
            <div class="stat-value text-gradient-teal">${liveResources.length ? liveResources.length : 'Live'}</div>
            <div class="stat-label">Map Resources</div>
          </div>
          <div class="stat-card live-stat-card">
            <div class="stat-icon">📞</div>
            <div class="stat-value text-gradient-purple">6</div>
            <div class="stat-label">National Helplines</div>
          </div>
          <div class="stat-card live-stat-card">
            <div class="stat-icon">🎨</div>
            <div class="stat-value text-gradient-rose">10</div>
            <div class="stat-label">AI Content Ideas</div>
          </div>
          <div class="stat-card live-stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-value text-gradient-gold">OSM</div>
            <div class="stat-label">Live Data Source</div>
          </div>
        </div>

        <div class="tab-nav">
          <button class="tab-btn ${currentTab==='resources'?'active':''}" id="cm-tab-resources">🗺️ Live Resources</button>
          <button class="tab-btn ${currentTab==='creator'?'active':''}" id="cm-tab-creator">🎨 Creator Studio</button>
          <button class="tab-btn ${currentTab==='peer'?'active':''}" id="cm-tab-peer">🤝 Peer Support</button>
        </div>

        <div class="tab-content ${currentTab==='resources'?'active':''}" id="cm-content-resources">
          <div class="live-map-shell mb-xl">
            <div class="live-map-control">
              <div>
                <div class="live-kicker">Real Map + Open Data</div>
                <h2>Find support near you</h2>
                <p id="resource-live-status">${escapeHTML(lastLabel)}</p>
              </div>
              <div class="live-map-actions">
                <button class="btn-secondary btn-sm" id="use-my-location">📍 Use My Location</button>
                <button class="btn-ghost btn-sm" id="refresh-live-resources">↻ Refresh</button>
              </div>
            </div>

            <div class="radar-search live-search-row">
              <input type="text" placeholder="Enter ZIP, city, school area, or address..." id="resource-search" aria-label="Search by ZIP code city or address" />
              <select id="resource-radius" class="input-field" aria-label="Search radius">
                <option value="3000">3 km</option>
                <option value="6000" selected>6 km</option>
                <option value="12000">12 km</option>
              </select>
              <button class="btn-primary btn-sm" id="search-resources">Search Live Map →</button>
            </div>

            <div class="live-data-strip" id="resource-live-metrics">
              ${renderLiveMetrics(liveWeather, resourceCount)}
            </div>

            <div class="resource-map-grid">
              <div class="resource-map-panel">
                <div id="resource-map" class="resource-map" role="application" aria-label="Live community resource map"></div>
                <div class="map-source-note">Map tiles by OpenStreetMap contributors. Resource data is queried from OpenStreetMap through Overpass.</div>
              </div>
              <div class="resource-side-panel">
                <div class="section-header mb-md">
                  <div>
                    <div class="section-title" style="font-size:1rem;">Resource Filters</div>
                    <div class="section-subtitle">Filter live and curated results</div>
                  </div>
                </div>
                <div class="resource-filter-grid">
                  ${filters.map(f => `
                    <button class="resource-filter-btn ${selectedFilter === f.id ? 'active' : ''}" data-filter="${f.id}" aria-label="Filter by ${f.label}">
                      <span>${f.emoji}</span>
                      <span>${f.label}</span>
                    </button>
                  `).join('')}
                </div>
                <div class="live-safety-card mt-md">
                  <div class="live-safety-icon">🛟</div>
                  <div>
                    <div class="live-safety-title">Need help now?</div>
                    <div class="live-safety-copy">Crisis and emergency links stay visible below. For immediate danger, call 911.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-header mb-md">
            <div>
              <div class="section-title" style="font-size:1rem;">Nearby Support Results</div>
              <div class="section-subtitle" id="resource-result-subtitle">${liveResources.length ? 'Live OpenStreetMap results' : 'Curated starter resources until a live search is run'}</div>
            </div>
            <span class="badge badge-green" id="resource-count-badge">${shownResources.length} shown</span>
          </div>
          <div id="resources-list" class="stagger">
            ${renderResourceCards(shownResources)}
          </div>

          <div class="crisis-banner mt-xl">
            <div class="crisis-icon">📞</div>
            <div class="crisis-text">
              <h4>National Helplines</h4>
              <p style="font-size:0.8rem;">Free, confidential, 24/7 support lines available anywhere in the US.</p>
              <div class="crisis-actions" style="flex-wrap:wrap;">
                ${[
                  { label:'988 Suicide & Crisis', href:'tel:988' },
                  { label:'Crisis Text Line', href:'sms:741741' },
                  { label:'SAMHSA Substance Use', href:'tel:18006624357' },
                  { label:'RAINN Sexual Assault', href:'tel:18006564673' },
                  { label:'Trevor LGBTQ+', href:'tel:18664887386' },
                  { label:'Childhelp Abuse', href:'tel:18004224453' }
                ].map(r => `<a href="${r.href}" class="crisis-btn" aria-label="${r.label}">${r.label}</a>`).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="tab-content ${currentTab==='creator'?'active':''}" id="cm-content-creator">
          <div class="section-header mb-lg">
            <div>
              <div class="section-title" style="font-size:1rem;">🎨 Creator Studio</div>
              <div class="section-subtitle">AI tools for safer, smarter, more sustainable creator growth</div>
            </div>
          </div>

          <div class="grid-2" style="gap:24px;">
            <div class="card live-feature-card">
              <div class="live-kicker">Idea Engine</div>
              <div style="font-weight:700;font-family:var(--font-display);margin-bottom:4px;">💡 Content Idea Generator</div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">Enter a niche and ZENO generates 10 hook-driven ideas with formats and hashtags.</div>
              <div class="grid-3" style="gap:12px;margin-bottom:16px;">
                <div class="input-group">
                  <label class="input-label" for="creator-niche">Your Niche</label>
                  <input type="text" id="creator-niche" class="input-field" placeholder="fitness, coding, study tips..." />
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

            <div class="card live-feature-card">
              <div class="live-kicker">Deal Intelligence</div>
              <div style="font-weight:700;font-family:var(--font-display);margin-bottom:4px;">💰 Brand Deal Evaluator</div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">Estimate whether a creator offer is under market, fair, or excellent.</div>
              <div class="grid-2" style="gap:12px;margin-bottom:16px;">
                <div class="input-group">
                  <label class="input-label" for="bd-followers">Followers</label>
                  <input type="number" id="bd-followers" class="input-field" placeholder="5000" />
                </div>
                <div class="input-group">
                  <label class="input-label" for="bd-offer">Offer ($)</label>
                  <input type="number" id="bd-offer" class="input-field" placeholder="200" />
                </div>
                <div class="input-group">
                  <label class="input-label" for="bd-platform">Platform</label>
                  <select id="bd-platform" class="input-field" aria-label="Platform">
                    <option>TikTok</option><option>YouTube</option><option>Instagram</option>
                  </select>
                </div>
                <div class="input-group">
                  <label class="input-label" for="bd-deliverable">Deliverable</label>
                  <select id="bd-deliverable" class="input-field" aria-label="Deliverable">
                    <option>Dedicated video</option><option>Mention in video</option><option>Story post</option><option>Feed post</option>
                  </select>
                </div>
              </div>
              <button class="btn-primary" id="evaluate-deal">Evaluate Deal 💰</button>
            </div>
          </div>

          <div id="ideas-results" class="hidden mt-lg"></div>
          <div id="deal-result" class="hidden mt-lg"></div>

          <div class="card mt-lg" style="background:linear-gradient(135deg,rgba(255,107,157,0.08),rgba(108,99,255,0.05));border-color:rgba(255,107,157,0.2);">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <span style="font-size:2rem;">🔥</span>
              <div>
                <div style="font-weight:700;margin-bottom:4px;">Creator Burnout Scanner</div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">Check pressure signals before creativity turns into exhaustion.</div>
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;" id="burnout-questions">
                  ${[
                    'I dread opening my editing software or camera',
                    'I feel like my content is never good enough',
                    'I compare myself to bigger creators constantly',
                    'I have lost the joy I had when I first started creating',
                    'I feel pressure to post even when I do not want to'
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

        <div class="tab-content ${currentTab==='peer'?'active':''}" id="cm-content-peer">
          <div class="peer-hub">
            <div class="peer-orbit">🤝</div>
            <h2>Peer Support Community</h2>
            <p>Designed as a safer future layer for anonymous, moderated support groups around school, money, mental health, and side hustles.</p>
            <div class="peer-group-grid">
              ${[
                {emoji:'📚',name:'College Apps & Stress',members:'143 teens',tone:'study'},
                {emoji:'💰',name:'First Jobs & Money',members:'98 teens',tone:'money'},
                {emoji:'🧠',name:'Mental Health Support',members:'211 teens',tone:'mind'},
                {emoji:'🚀',name:'Side Hustles & Business',members:'77 teens',tone:'creator'}
              ].map(r => `
                <div class="peer-group-card">
                  <div style="font-size:2rem;margin-bottom:6px;">${r.emoji}</div>
                  <div style="font-weight:700;font-size:0.9rem;margin-bottom:2px;">${r.name}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted);">${r.members} active</div>
                </div>
              `).join('')}
            </div>
            <button class="btn-primary" id="join-community">Join Community →</button>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:12px;">Planned: AI-moderated • Anonymous option • No bullying policy</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderLiveMetrics(weather, resourceCount) {
    const weatherText = weather
      ? `${weather.emoji} ${weather.temperature}°F · ${weather.label}`
      : '🌦️ Weather ready after live search';
    const rainText = weather?.rainChance !== null && weather?.rainChance !== undefined
      ? `${weather.rainChance}% rain chance`
      : 'Live safety context';

    return `
      <div class="live-data-pill"><span>📍</span><strong>${resourceCount}</strong><small>resource candidates</small></div>
      <div class="live-data-pill"><span>🌦️</span><strong>${weatherText}</strong><small>${rainText}</small></div>
      <div class="live-data-pill"><span>🧭</span><strong>Open map</strong><small>directions via Google Maps</small></div>
    `;
  }

  function renderResourceCards(resources) {
    if (!resources.length) {
      return `<div class="empty-state"><div class="empty-state-icon">🗺️</div><div class="empty-state-title">No results in this filter</div><div class="empty-state-desc">Try another filter, widen the radius, or search a nearby city.</div></div>`;
    }

    return resources.map(r => {
      const website = safeUrl(r.website);
      const directions = safeUrl(r.directionsUrl);
      return `
        <div class="resource-location-card live-resource-card" data-type="${escapeHTML(r.type)}" data-resource-id="${escapeHTML(r.id)}">
          <div class="resource-loc-icon" style="background:${alpha(r.color, 0.16)};">
            <span style="font-size:1.5rem;">${r.emoji || '🌐'}</span>
          </div>
          <div class="resource-loc-info">
            <div class="resource-loc-name">${escapeHTML(r.name)}</div>
            <div class="resource-loc-type">${escapeHTML(r.desc || r.label || 'Community resource')}</div>
            <div class="resource-loc-meta">
              <span class="resource-loc-distance">📍 ${escapeHTML(r.distance || 'Nearby')}</span>
              <span class="resource-loc-hours">🕐 ${escapeHTML(r.hours || 'Hours not listed')}</span>
              <span class="resource-loc-open" style="color:${r.open === false ? 'var(--rose)' : 'var(--green)'};">${r.open === false ? '○ Closed' : '● Check details'}</span>
              <span class="resource-source">Source: ${escapeHTML(r.source || 'ZENO')}</span>
            </div>
          </div>
          <div class="resource-loc-action">
            ${directions ? `<a class="btn-secondary btn-sm" href="${directions}" target="_blank" rel="noopener" aria-label="Get directions to ${escapeHTML(r.name)}">Directions</a>` : `<button class="btn-secondary btn-sm disabled-resource-action" disabled>Directions</button>`}
            ${website ? `<a class="btn-ghost btn-sm" href="${website}" target="_blank" rel="noopener" aria-label="Open website for ${escapeHTML(r.name)}">Website</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function afterRender() {
    bindTabs();
    bindResourceControls();
    bindCreatorTools();
    bindPeerSupport();

    if (currentTab === 'resources') {
      setTimeout(initMap, 100);
    }
  }

  function bindTabs() {
    ['resources','creator','peer'].forEach(tab => {
      document.getElementById(`cm-tab-${tab}`)?.addEventListener('click', () => {
        currentTab = tab;
        document.querySelectorAll('[id^="cm-tab-"]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('[id^="cm-content-"]').forEach(c => c.classList.remove('active'));
        document.getElementById(`cm-tab-${tab}`)?.classList.add('active');
        document.getElementById(`cm-content-${tab}`)?.classList.add('active');
        if (tab === 'resources') setTimeout(initMap, 80);
      });
    });
  }

  function bindResourceControls() {
    document.querySelectorAll('.resource-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedFilter = btn.dataset.filter || 'all';
        document.querySelectorAll('.resource-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateResourceList();
        updateMarkers();
      });
    });

    document.getElementById('search-resources')?.addEventListener('click', () => {
      const query = document.getElementById('resource-search')?.value?.trim();
      runLiveSearch({ query });
    });

    document.getElementById('resource-search')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('search-resources')?.click();
      }
    });

    document.getElementById('use-my-location')?.addEventListener('click', () => {
      runLiveSearch({ useGeo: true });
    });

    document.getElementById('refresh-live-resources')?.addEventListener('click', () => {
      if (liveLocation) runLiveSearch({ location: liveLocation, silent: false });
      else {
        const query = document.getElementById('resource-search')?.value?.trim();
        runLiveSearch({ query: query || null, useGeo: !query });
      }
    });
  }

  async function runLiveSearch({ query, useGeo = false, location = null, silent = false } = {}) {
    if (!window.ZenoLive) {
      setStatus('Live integrations are unavailable in this browser session.', 'error');
      return;
    }

    const radius = parseInt(document.getElementById('resource-radius')?.value || '6000', 10);

    try {
      if (!silent) setStatus('Connecting to live map, weather, and resource data...', 'loading');

      let target = location;
      if (!target && useGeo) {
        target = await ZenoLive.getCurrentPosition();
        const label = await ZenoLive.reverseGeocode(target.lat, target.lon);
        if (label) target.label = label;
      }
      if (!target) target = await ZenoLive.geocode(query);

      liveLocation = target;
      initMap(target);

      const [resourcesResult, weatherResult] = await Promise.allSettled([
        ZenoLive.fetchResources(target.lat, target.lon, radius),
        ZenoLive.fetchWeather(target.lat, target.lon)
      ]);

      if (resourcesResult.status === 'fulfilled') {
        liveResources = resourcesResult.value;
      } else {
        liveResources = [];
      }

      if (weatherResult.status === 'fulfilled') {
        liveWeather = weatherResult.value;
      }

      ZenoLive.setCachedContext({
        location: target,
        resources: liveResources,
        weather: liveWeather
      });

      updateResourceList();
      updateMarkers();
      updateMetrics();

      const count = liveResources.length;
      const message = count
        ? `Live search complete: ${count} nearby resources found near ${shortLabel(target.label)}.`
        : `Live search complete near ${shortLabel(target.label)}, but no mapped resources were found in this radius. Showing curated starter resources.`;
      setStatus(message, count ? 'success' : 'warning');

      NexusDB.addXP(10);
      NexusApp.showToast(`Live resources updated! +10 XP 🗺️`, 'success');
      NexusApp.checkAchievements({ resource: true });
      NexusApp.updateNavStats();
    } catch (err) {
      setStatus(err.message || 'Live search failed. Try a city, ZIP code, or another radius.', 'error');
      NexusApp.showToast(err.message || 'Live search failed', 'error');
    }
  }

  function initMap(location = liveLocation) {
    const mapEl = document.getElementById('resource-map');
    if (!mapEl || !window.L) return;

    const cached = window.ZenoLive?.getCachedContext?.();
    if (!location && cached?.location) {
      liveLocation = cached.location;
      liveWeather = cached.weather || liveWeather;
      liveResources = cached.resources || liveResources;
      location = liveLocation;
      updateResourceList();
      updateMetrics();
    }

    const center = location || window.ZenoLive?.DEFAULT_LOCATION || { lat: 40.7128, lon: -74.0060, label: 'New York, NY' };

    if (resourceMap) {
      resourceMap.remove();
      resourceMap = null;
    }

    resourceMap = L.map(mapEl, {
      scrollWheelZoom: false,
      zoomControl: false
    }).setView([center.lat, center.lon], location ? 13 : 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(resourceMap);

    L.control.zoom({ position: 'bottomright' }).addTo(resourceMap);
    markerLayer = L.layerGroup().addTo(resourceMap);
    updateMarkers();

    setTimeout(() => resourceMap?.invalidateSize(), 150);
  }

  function updateMarkers() {
    if (!resourceMap || !markerLayer || !window.L) return;
    markerLayer.clearLayers();

    const resources = visibleResources().filter(r => r.lat && r.lon);

    if (liveLocation) {
      L.circleMarker([liveLocation.lat, liveLocation.lon], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#6c63ff',
        fillOpacity: 0.9
      }).bindPopup(`<strong>${escapeHTML(shortLabel(liveLocation.label))}</strong><br>Your search center`).addTo(markerLayer);
    }

    resources.forEach(resource => {
      const icon = L.divIcon({
        className: 'resource-map-pin',
        html: `<span style="background:${resource.color || '#6c63ff'}">${resource.emoji || '🌐'}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([resource.lat, resource.lon], { icon })
        .bindPopup(`
          <div class="map-popup">
            <strong>${escapeHTML(resource.name)}</strong>
            <p>${escapeHTML(resource.desc || '')}</p>
            <small>${escapeHTML(resource.distance || '')} · ${escapeHTML(resource.hours || 'Hours not listed')}</small>
            ${resource.directionsUrl ? `<a href="${safeUrl(resource.directionsUrl)}" target="_blank" rel="noopener">Open directions</a>` : ''}
          </div>
        `)
        .addTo(markerLayer);
    });

    if (resources.length) {
      const bounds = L.latLngBounds(resources.map(r => [r.lat, r.lon]));
      if (liveLocation) bounds.extend([liveLocation.lat, liveLocation.lon]);
      resourceMap.fitBounds(bounds.pad(0.18), { maxZoom: 14 });
    }
  }

  function updateResourceList() {
    const list = document.getElementById('resources-list');
    const badge = document.getElementById('resource-count-badge');
    const subtitle = document.getElementById('resource-result-subtitle');
    const resources = visibleResources();

    if (list) list.innerHTML = renderResourceCards(resources);
    if (badge) badge.textContent = `${resources.length} shown`;
    if (subtitle) subtitle.textContent = liveResources.length ? 'Live OpenStreetMap results' : 'Curated starter resources until a live search is run';
  }

  function updateMetrics() {
    const metrics = document.getElementById('resource-live-metrics');
    if (metrics) metrics.innerHTML = renderLiveMetrics(liveWeather, liveResources.length || getFallbackResources().length);
  }

  function setStatus(message, type = 'info') {
    const el = document.getElementById('resource-live-status');
    if (!el) return;
    el.textContent = message;
    el.dataset.status = type;
  }

  function bindCreatorTools() {
    document.getElementById('generate-ideas')?.addEventListener('click', () => {
      const niche = document.getElementById('creator-niche')?.value?.trim() || 'your topic';
      const platform = document.getElementById('creator-platform')?.value;
      const goal = document.getElementById('creator-goal')?.value;
      const ideas = NexusAI.generateContentIdeas(niche, platform, goal);

      const resultsEl = document.getElementById('ideas-results');
      if (!resultsEl) return;

      resultsEl.classList.remove('hidden');
      resultsEl.innerHTML = `
        <div class="section-header mb-md">
          <div class="section-title" style="font-size:1rem;">10 Ideas for ${escapeHTML(niche)} on ${escapeHTML(platform)}</div>
          <span class="badge badge-rose">AI Generated</span>
        </div>
        ${ideas.map(idea => `
          <div class="creator-idea">
            <div class="creator-idea-num">#${idea.id}</div>
            <div class="creator-idea-hook">"${escapeHTML(idea.hook)}"</div>
            <div class="creator-idea-title">${escapeHTML(idea.title)}</div>
            <div class="creator-idea-format">Format: ${escapeHTML(idea.format)}</div>
            <div class="creator-idea-tags">${idea.tags.map(t=>`<span class="badge badge-rose" style="font-size:0.65rem;">${escapeHTML(t)}</span>`).join('')}</div>
          </div>
        `).join('')}
      `;
      NexusDB.addXP(15);
      NexusApp.showToast('10 content ideas generated! +15 XP 🎨', 'success');
      NexusApp.checkAchievements({ content: true });
      NexusApp.updateNavStats();
    });

    document.getElementById('evaluate-deal')?.addEventListener('click', () => {
      const followers = parseInt(document.getElementById('bd-followers')?.value || 0, 10);
      const offer = parseFloat(document.getElementById('bd-offer')?.value || 0);
      const platform = document.getElementById('bd-platform')?.value;
      const deliverable = document.getElementById('bd-deliverable')?.value;

      if (!followers || !offer) {
        NexusApp.showToast('Please enter followers and offer amount', 'error');
        return;
      }

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
      if (!resultEl) return;

      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="card" style="background:linear-gradient(135deg,${isFair ? 'rgba(6,214,160,0.08)' : 'rgba(255,107,157,0.08)'},transparent);border-color:${isFair ? 'rgba(6,214,160,0.3)' : 'rgba(255,107,157,0.3)'};">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
            <div style="font-size:2.5rem;">${isGreat ? '🤩' : isFair ? '👍' : '🤔'}</div>
            <div>
              <div style="font-weight:700;font-size:1.1rem;color:${isFair ? 'var(--green)' : 'var(--rose)'};">${isGreat ? 'Excellent Deal!' : isFair ? 'Fair Offer' : 'Below Market Rate'}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">${followers.toLocaleString()} followers on ${escapeHTML(platform)}</div>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="font-size:0.8rem;margin-bottom:6px;"><strong style="color:var(--text-secondary);">Market Rate:</strong> <span style="color:var(--teal);">$${adjustedMin.toFixed(0)}-${adjustedMax.toFixed(0)}</span> for this ${escapeHTML(deliverable)}</div>
            <div style="font-size:0.8rem;"><strong style="color:var(--text-secondary);">You were offered:</strong> <span style="color:${isFair ? 'var(--green)' : 'var(--rose)'};">$${offer}</span></div>
          </div>
          ${!isFair ? `
            <div style="background:rgba(255,209,102,0.08);border-radius:8px;padding:12px;">
              <div style="font-size:0.8rem;font-weight:600;color:var(--gold);margin-bottom:4px;">💬 Counter-offer Script</div>
              <div style="font-size:0.8rem;color:var(--text-secondary);font-style:italic;line-height:1.6;">"Hi [Brand], I love the opportunity to work together. Based on my audience and deliverable scope, my usual rate is $${adjustedMin.toFixed(0)}-$${adjustedMax.toFixed(0)}. Could we meet at $${(adjustedMin * 0.8).toFixed(0)}?"</div>
            </div>
          ` : ''}
        </div>
      `;
      NexusDB.addXP(10);
      NexusApp.showToast('Deal analyzed! +10 XP 💰', 'success');
      NexusApp.updateNavStats();
    });

    document.getElementById('check-burnout')?.addEventListener('click', () => {
      const checked = document.querySelectorAll('[id^="bq-"]:checked').length;
      const level = checked === 0 ? 'none' : checked <= 1 ? 'low' : checked <= 3 ? 'moderate' : 'high';
      const config = {
        none: { emoji:'🌟', label:'No Burnout Detected', color:'var(--green)', msg:'You are in a healthy creative rhythm. Protect that energy with rest and playful experiments.', tips:['Keep a content ideas bank','Schedule no-pressure creative time','Celebrate what is already working'] },
        low: { emoji:'😊', label:'Low Burnout Risk', color:'var(--teal)', msg:'A few early signals are showing. Adjust now and your creativity stays sustainable.', tips:['Take one content-free day each week','Batch-create to reduce pressure','Reconnect with why you started'] },
        moderate: { emoji:'⚠️', label:'Moderate Burnout', color:'var(--gold)', msg:'There are clear signs of fatigue. Your next growth move is rest, not more pressure.', tips:['Pause posting for a few days','Lower your schedule to 2x/week','Use MindSpace to process pressure'] },
        high: { emoji:'🆘', label:'High Burnout', color:'var(--rose)', msg:'This looks serious. Rest matters. Your health is more important than any algorithm.', tips:['Take a proper break','Talk to someone you trust','Use MindSpace or crisis support if needed'] }
      };
      const c = config[level];
      const resultEl = document.getElementById('burnout-result');
      if (!resultEl) return;

      resultEl.classList.remove('hidden');
      resultEl.innerHTML = `
        <div class="card" style="border-color:${c.color};">
          <div style="text-align:center;margin-bottom:16px;">
            <div style="font-size:3rem;margin-bottom:8px;">${c.emoji}</div>
            <div style="font-weight:700;font-size:1.1rem;color:${c.color};">${c.label}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${checked}/5 burnout indicators</div>
          </div>
          <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.7;margin-bottom:16px;text-align:center;">${c.msg}</p>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${c.tips.map(t=>`<div style="display:flex;gap:8px;align-items:flex-start;font-size:0.8rem;color:var(--text-secondary);">💡 ${escapeHTML(t)}</div>`).join('')}
          </div>
          ${level === 'high' || level === 'moderate' ? `<button class="btn-primary btn-sm" style="width:100%;margin-top:16px;" onclick="NexusApp.navigate('mindspace')">Go to MindSpace →</button>` : ''}
        </div>
      `;
      NexusDB.addXP(5);
      NexusApp.updateNavStats();
    });
  }

  function bindPeerSupport() {
    document.getElementById('join-community')?.addEventListener('click', () => {
      NexusApp.showToast('Peer support roadmap saved for the next ZENO release 🤝', 'info');
    });
  }

  function shortLabel(label = '') {
    return label.split(',').slice(0, 3).join(', ') || label;
  }

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function safeUrl(value = '') {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      if (['http:', 'https:', 'tel:', 'sms:'].includes(url.protocol)) return url.href;
      return '';
    } catch {
      return '';
    }
  }

  function alpha(hex = '#6c63ff', opacity = 0.16) {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return `rgba(108,99,255,${opacity})`;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }

  return { render, afterRender };
})();

window.CommunityModule = CommunityModule;
