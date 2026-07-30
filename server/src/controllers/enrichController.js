async function fetchWikipedia(country) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TravelCraftBot/1.0' } });
  if (!res.ok) return null;
  const d = await res.json();
  return {
    title: d.title,
    description: d.extract || '',
    image: d.thumbnail?.source || null,
    url: d.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(country)}`,
  };
}

async function fetchUnesco(country) {
  const url = `https://whc.unesco.org/api/sites/?format=json&fields=site,states,short_description,image_url&search=${encodeURIComponent(country)}&limit=5`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TravelCraftBot/1.0' } });
  if (!res.ok) return null;
  const d = await res.json();
  const sites = (d.results || []).slice(0, 5).map(s => ({
    name: s.site,
    description: s.short_description || '',
    image: s.image_url || null,
  }));
  return {
    sites,
    url: `https://whc.unesco.org/en/list/?search=${encodeURIComponent(country)}`,
    count: d.count || sites.length,
  };
}

async function enrichCountry(req, res) {
  const { country } = req.query;
  if (!country) return res.status(400).json({ error: 'country is required' });

  const [wikiResult, unescoResult] = await Promise.allSettled([
    fetchWikipedia(country),
    fetchUnesco(country),
  ]);

  return res.json({
    wikipedia: wikiResult.status === 'fulfilled' ? wikiResult.value : null,
    unesco: unescoResult.status === 'fulfilled' ? unescoResult.value : null,
  });
}

module.exports = { enrichCountry };
