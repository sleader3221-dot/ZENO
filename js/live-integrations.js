/* ===================================================
   ZENO Live Integrations
   No-key browser integrations for maps, weather, and resources.
   Uses OpenStreetMap/Nominatim, Overpass, Open-Meteo, and Geolocation.
   =================================================== */

const ZenoLive = (() => {
  const DEFAULT_LOCATION = {
    lat: 40.7128,
    lon: -74.0060,
    label: 'New York, NY'
  };

  const CACHE_KEY = 'zeno_live_context';
  const NOMINATIM_DELAY_MS = 1100;
  let lastGeocodeAt = 0;

  const resourceTypes = [
    { id: 'food', label: 'Food', emoji: '🍱', color: '#ffd166' },
    { id: 'mental_health', label: 'Mental Health', emoji: '💚', color: '#06d6a0' },
    { id: 'health', label: 'Healthcare', emoji: '💊', color: '#ff9f43' },
    { id: 'tutoring', label: 'Learning', emoji: '📚', color: '#00d4ff' },
    { id: 'career', label: 'Career', emoji: '💼', color: '#6c63ff' },
    { id: 'shelter', label: 'Shelter', emoji: '🏠', color: '#ff6b9d' },
    { id: 'community', label: 'Community', emoji: '🌐', color: '#a855f7' }
  ];

  const weatherCodes = {
    0: ['Clear', '☀️'],
    1: ['Mostly clear', '🌤️'],
    2: ['Partly cloudy', '⛅'],
    3: ['Cloudy', '☁️'],
    45: ['Fog', '🌫️'],
    48: ['Rime fog', '🌫️'],
    51: ['Light drizzle', '🌦️'],
    53: ['Drizzle', '🌦️'],
    55: ['Heavy drizzle', '🌧️'],
    61: ['Light rain', '🌦️'],
    63: ['Rain', '🌧️'],
    65: ['Heavy rain', '🌧️'],
    71: ['Light snow', '🌨️'],
    73: ['Snow', '🌨️'],
    75: ['Heavy snow', '❄️'],
    80: ['Rain showers', '🌦️'],
    81: ['Rain showers', '🌧️'],
    82: ['Heavy showers', '⛈️'],
    95: ['Thunderstorm', '⛈️']
  };

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getCachedContext() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setCachedContext(context) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...context, cachedAt: Date.now() }));
    } catch {}
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported in this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          label: 'Your current location'
        }),
        err => reject(new Error(err.message || 'Location permission was not granted.')),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
      );
    });
  }

  async function geocode(query) {
    const q = (query || '').trim();
    if (!q) throw new Error('Enter a city, ZIP code, or address.');

    const elapsed = Date.now() - lastGeocodeAt;
    if (elapsed < NOMINATIM_DELAY_MS) await wait(NOMINATIM_DELAY_MS - elapsed);
    lastGeocodeAt = Date.now();

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('q', q);

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error('Location search failed.');

    const data = await res.json();
    if (!data.length) throw new Error('No matching location found.');

    const place = data[0];
    return {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      label: place.display_name || q,
      source: 'Nominatim'
    };
  }

  async function reverseGeocode(lat, lon) {
    const elapsed = Date.now() - lastGeocodeAt;
    if (elapsed < NOMINATIM_DELAY_MS) await wait(NOMINATIM_DELAY_MS - elapsed);
    lastGeocodeAt = Date.now();

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    url.searchParams.set('zoom', '12');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data.display_name || null;
  }

  async function fetchWeather(lat, lon) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toFixed(5));
    url.searchParams.set('longitude', lon.toFixed(5));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('wind_speed_unit', 'mph');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '1');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Weather lookup failed.');
    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};
    const [label, emoji] = weatherCodes[current.weather_code] || ['Live weather', '🌡️'];

    return {
      label,
      emoji,
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      wind: Math.round(current.wind_speed_10m || 0),
      high: Math.round((daily.temperature_2m_max || [])[0] || current.temperature_2m || 0),
      low: Math.round((daily.temperature_2m_min || [])[0] || current.temperature_2m || 0),
      rainChance: (daily.precipitation_probability_max || [])[0] ?? null,
      updatedAt: current.time || new Date().toISOString(),
      source: 'Open-Meteo'
    };
  }

  function distanceMiles(a, b) {
    const R = 3958.8;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function toRad(deg) {
    return deg * Math.PI / 180;
  }

  function categoryFor(tags = {}) {
    const haystack = Object.values(tags).join(' ').toLowerCase();
    if (/food_bank|soup_kitchen|food|meal/.test(haystack)) return 'food';
    if (/counsell?ing|mental|psych|therapy|crisis/.test(haystack)) return 'mental_health';
    if (/clinic|hospital|doctors|pharmacy|healthcare/.test(haystack)) return 'health';
    if (/library|school|college|university|tutoring|education/.test(haystack)) return 'tutoring';
    if (/employment|job|workforce|career/.test(haystack)) return 'career';
    if (/shelter|homeless|housing/.test(haystack)) return 'shelter';
    return 'community';
  }

  function resourceMeta(category) {
    return resourceTypes.find(type => type.id === category) || resourceTypes[resourceTypes.length - 1];
  }

  function buildOverpassQuery(lat, lon, radius) {
    return `
      [out:json][timeout:25];
      (
        node(around:${radius},${lat},${lon})["amenity"~"food_bank|social_facility|clinic|hospital|doctors|pharmacy|library|school|college|university|community_centre|shelter"];
        way(around:${radius},${lat},${lon})["amenity"~"food_bank|social_facility|clinic|hospital|doctors|pharmacy|library|school|college|university|community_centre|shelter"];
        relation(around:${radius},${lat},${lon})["amenity"~"food_bank|social_facility|clinic|hospital|doctors|pharmacy|library|school|college|university|community_centre|shelter"];
        node(around:${radius},${lat},${lon})["social_facility"~"food_bank|soup_kitchen|shelter|outreach|counselling"];
        way(around:${radius},${lat},${lon})["social_facility"~"food_bank|soup_kitchen|shelter|outreach|counselling"];
        node(around:${radius},${lat},${lon})["healthcare"~"clinic|doctor|counselling|mental_health|hospital"];
        way(around:${radius},${lat},${lon})["healthcare"~"clinic|doctor|counselling|mental_health|hospital"];
        node(around:${radius},${lat},${lon})["office"="employment_agency"];
        way(around:${radius},${lat},${lon})["office"="employment_agency"];
      );
      out center tags 60;
    `;
  }

  async function fetchResources(lat, lon, radius = 6000) {
    const body = buildOverpassQuery(lat, lon, radius);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body
    });
    if (!res.ok) throw new Error('Resource lookup failed.');

    const data = await res.json();
    const origin = { lat, lon };
    const seen = new Set();

    return (data.elements || [])
      .map(el => {
        const point = el.type === 'node'
          ? { lat: el.lat, lon: el.lon }
          : { lat: el.center?.lat, lon: el.center?.lon };
        if (!point.lat || !point.lon) return null;

        const tags = el.tags || {};
        const name = tags.name || tags.operator || friendlyName(tags);
        if (!name) return null;

        const key = `${name}:${point.lat.toFixed(4)}:${point.lon.toFixed(4)}`;
        if (seen.has(key)) return null;
        seen.add(key);

        const category = categoryFor(tags);
        const meta = resourceMeta(category);
        const miles = distanceMiles(origin, point);

        return {
          id: `${el.type}-${el.id}`,
          name,
          type: category,
          label: meta.label,
          emoji: meta.emoji,
          color: meta.color,
          desc: descriptionFor(tags, meta.label),
          hours: tags.opening_hours || 'Hours not listed',
          phone: tags.phone || tags['contact:phone'] || '',
          website: tags.website || tags['contact:website'] || '',
          lat: point.lat,
          lon: point.lon,
          distance: `${miles.toFixed(1)} mi`,
          distanceValue: miles,
          source: 'OpenStreetMap',
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lon}`
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceValue - b.distanceValue)
      .slice(0, 30);
  }

  function friendlyName(tags) {
    if (tags.amenity) return titleCase(tags.amenity.replace(/_/g, ' '));
    if (tags.healthcare) return titleCase(`${tags.healthcare} resource`);
    if (tags.social_facility) return titleCase(tags.social_facility.replace(/_/g, ' '));
    return '';
  }

  function descriptionFor(tags, fallback) {
    if (tags.description) return tags.description;
    if (tags.amenity) return `${titleCase(tags.amenity.replace(/_/g, ' '))} listed in OpenStreetMap`;
    if (tags.healthcare) return `${titleCase(tags.healthcare.replace(/_/g, ' '))} healthcare resource`;
    if (tags.social_facility) return `${titleCase(tags.social_facility.replace(/_/g, ' '))} support resource`;
    return `${fallback} resource`;
  }

  function titleCase(text) {
    return (text || '').replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  return {
    DEFAULT_LOCATION,
    resourceTypes,
    getCachedContext,
    setCachedContext,
    getCurrentPosition,
    geocode,
    reverseGeocode,
    fetchWeather,
    fetchResources,
    resourceMeta,
    distanceMiles
  };
})();

window.ZenoLive = ZenoLive;
