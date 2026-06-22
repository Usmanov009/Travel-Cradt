const Groq = require('groq-sdk');

const MODEL = 'llama-3.3-70b-versatile';

function getClient() {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function langLabel(lang) {
  return lang === 'uz' ? "O'zbek tilida" : lang === 'ru' ? 'на русском языке' : 'in English';
}

async function getAiRecommendation(req, res) {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'AI service not configured' });

  const { destination, destinationType, startDate, endDate, days, travelers, budget, hotelType, transport, interests, lang } = req.body;

  const prompt = `You are a professional travel advisor. Create a warm, personalized travel recommendation ${langLabel(lang)}.

Travel preferences:
- Destination: ${destination || 'not specified'}
- Type: ${destinationType === 'domestic' ? 'Domestic (Uzbekistan)' : 'International'}
- Duration: ${days} days (${startDate || '?'} → ${endDate || '?'})
- Travelers: ${travelers} people
- Budget: ${budget || 'not specified'}
- Hotel: ${hotelType || 'not specified'}
- Transport: ${transport || 'not specified'}
- Interests: ${Array.isArray(interests) && interests.length ? interests.join(', ') : 'not specified'}

Write 3 short paragraphs (~200 words): highlight top attractions, recommended activities, and one practical tip. Be friendly and specific.`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and enthusiastic travel advisor.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
    });
    res.json({ recommendation: completion.choices[0].message.content });
  } catch (err) {
    console.error('Groq recommendation error:', err.message);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
}

async function chatWithAi(req, res) {
  const client = getClient();
  if (!client) {
    console.error('Groq client not initialized — GROQ_API_KEY missing');
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const { messages, lang } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' });
  }

  const system = `You are TravelCraft AI — a friendly, knowledgeable travel assistant specializing in Uzbekistan and international travel.
Help users with: destination info, travel tips, best seasons to visit, visa requirements, estimated prices (USD), cultural advice, packing tips, and itinerary suggestions.
Always respond ${langLabel(lang)}. Be concise and helpful (max 3 short paragraphs). Include specific price estimates when asked about costs.`;

  try {
    const history = messages.slice(-10);
    const groqMessages = [
      { role: 'system', content: system },
      ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    ];

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: groqMessages,
      max_tokens: 500,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('Groq chat error:', err.status, err.message);
    res.status(500).json({ error: 'Failed to get AI response', detail: err.message });
  }
}

async function getDestinationInfo(req, res) {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'AI service not configured' });

  const { destination, country, lang } = req.body;
  if (!destination) return res.status(400).json({ error: 'destination required' });

  const prompt = `Give a brief travel overview of ${destination}${country ? ', ' + country : ''} ${langLabel(lang)}.
Return ONLY a valid JSON object with this exact shape (no extra text, no markdown):
{
  "highlights": ["3-4 key attractions, each max 8 words"],
  "bestTime": "best months to visit (1 short sentence)",
  "prices": {
    "budget": "e.g. $30-50/day",
    "midRange": "e.g. $80-120/day",
    "luxury": "e.g. $200+/day"
  },
  "tip": "one practical tip for visitors (1 sentence)"
}`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a travel expert. Always respond with valid JSON only, no extra text, no markdown code blocks.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
    });
    const text = completion.choices[0].message.content.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const info = JSON.parse(text);
    res.json(info);
  } catch (err) {
    console.error('Groq destination info error:', err.message);
    res.status(500).json({ error: 'Failed to get destination info' });
  }
}

async function getItinerary(req, res) {
  const client = getClient();
  if (!client) return res.status(503).json({ error: 'AI service not configured' });

  const { destination, destinationType, days, travelers, budget, hotelType, transport, interests, startDate, lang, selectedTheme } = req.body;
  if (!destination || !days) return res.status(400).json({ error: 'destination and days required' });

  const langNote = lang === 'uz' ? "O'zbek tilida yoz" : lang === 'ru' ? 'Пиши на русском' : 'Write in English';
  const interestsList = Array.isArray(interests) && interests.length ? interests.join(', ') : 'general tourism';

  const prompt = `You are a professional travel planner. Create 5 distinct ${days}-day itinerary variants for ${travelers || 2} travelers visiting ${destination}.
Budget level: ${budget || 'mid-range'}. Hotel: ${hotelType || 'standard'}. Transport: ${transport || 'mixed'}. Interests: ${interestsList}.
${startDate ? `Trip starts: ${startDate}.` : ''}
${selectedTheme ? `Focus specifically on theme: "${selectedTheme}".` : ''}

${langNote}.

Return ONLY valid JSON, no markdown, no extra text:
{
  "variants": [
    {
      "id": 1,
      "theme": "Cultural Explorer",
      "emoji": "🏛️",
      "description": "1 sentence describing what makes this variant unique",
      "title": "trip title max 8 words",
      "days": [
        {
          "day": 1,
          "title": "day theme title",
          "items": [
            { "time": "09:00", "type": "visit", "place": "place name", "note": "1 sentence description" },
            { "time": "12:30", "type": "food", "place": "restaurant name", "dish": "recommended dish name" },
            { "time": "14:00", "type": "visit", "place": "place name", "note": "1 sentence description" },
            { "time": "19:00", "type": "food", "place": "restaurant or cafe name", "dish": "recommended dish" }
          ]
        }
      ]
    }
  ]
}

Rules:
- Generate EXACTLY 5 variant objects, each with a distinctly different theme/focus (e.g. Cultural, Gastro, Adventure, Relaxation, Photography)
- Each day must have 4-5 items alternating visits and meals
- type must be one of: "visit", "food", "hotel", "transport"
- Include realistic local restaurants and actual dishes
- Times must be realistic (morning start ~09:00, last item ~20:00)
- Each variant must have exactly ${days} day objects
- Variants must be meaningfully different from each other`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a travel itinerary expert. Always respond with valid JSON only, no markdown, no code blocks.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.8,
    });
    const text = completion.choices[0].message.content.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    const result = JSON.parse(text);
    res.json(result);
  } catch (err) {
    console.error('Groq itinerary error:', err.status, err.message);
    res.status(500).json({ error: 'Failed to generate itinerary', detail: err.message });
  }
}

module.exports = { getAiRecommendation, chatWithAi, getDestinationInfo, getItinerary };
