const https = require('https');

const KNOWN_PLACES = {
  samarkand: { lat: 39.6542, lng: 66.9597, displayName: 'Samarkand, Uzbekistan' },
  bukhara: { lat: 39.7681, lng: 64.4556, displayName: 'Bukhara, Uzbekistan' },
  khiva: { lat: 41.3783, lng: 60.3639, displayName: 'Khiva, Uzbekistan' },
  tashkent: { lat: 41.2995, lng: 69.2401, displayName: 'Tashkent, Uzbekistan' },
  chimgan: { lat: 41.5167, lng: 70.0167, displayName: 'Chimgan, Uzbekistan' },
  charvak: { lat: 41.8333, lng: 70.0833, displayName: 'Charvak Reservoir, Uzbekistan' },
  dubai: { lat: 25.2048, lng: 55.2708, displayName: 'Dubai, UAE' },
  thailand: { lat: 13.7563, lng: 100.5018, displayName: 'Bangkok, Thailand' },
  santorini: { lat: 36.3932, lng: 25.4615, displayName: 'Santorini, Greece' },
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'TravelCraftAI/1.0 (travel app)' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

function lookupKnown(query) {
  const key = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!key) return null;
  for (const [name, place] of Object.entries(KNOWN_PLACES)) {
    if (key === name || key.includes(name) || (key.length >= 4 && name.startsWith(key.slice(0, 6)))) {
      return place;
    }
  }
  return null;
}

async function geocodePlace(req, res) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const coordMatch = q.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      let displayName = q;
      try {
        const rev = await fetchJson(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        );
        if (rev?.display_name) displayName = rev.display_name;
      } catch (_) {}
      return res.json({ lat, lng, displayName, source: 'coordinates' });
    }

    const known = lookupKnown(q);
    if (known) {
      return res.json({ ...known, source: 'catalog' });
    }

    const searchUrl =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const results = await fetchJson(searchUrl);
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'Place not found', query: q });
    }

    const hit = results[0];
    return res.json({
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      displayName: hit.display_name,
      source: 'nominatim',
    });
  } catch (err) {
    console.error('geocodePlace error:', err.message);
    return res.status(500).json({ error: 'Geocoding failed' });
  }
}

module.exports = { geocodePlace };
