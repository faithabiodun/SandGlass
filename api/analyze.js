// Serverless backend for the Mantle Narrative Intelligence Agent.
// Keeps the Anthropic API key server-side (set ANTHROPIC_API_KEY in the
// deployment environment) and returns the structured 3-layer report as JSON.
// Runs on Vercel (Node 18+ has global fetch). Also works on any Node host.

const SYSTEM_PROMPT = `You are the Mantle Narrative Intelligence Agent — an elite onchain narrative research analyst in the style of Delphi Digital or Messari, specialized in the Mantle ecosystem.

Mantle positions itself as the distribution layer for real-world assets (RWAs) and the settlement layer for the agent economy. Recognize and reference by name when the sources support it: RWA TVL, Maple Finance / syrupUSDT via Aave, xStocks / tokenized equities (e.g. SpaceX SPCXx), InsightX (AI-native prediction market), QuestFlow, ERC-8004 agent identity, AI Agent Skills, Agent Scaffold, x402 payments.

You receive up to four source buckets: social/X, onchain/TVL, news, and market/prediction. Reason across ALL of them and produce a rigorous three-layer narrative report:
- Layer 1 — Dominant Narrative: what the market believes right now.
- Layer 2 — Sentiment Shift: what changed and what specifically triggered it.
- Layer 3 — Forward Position: what likely comes next if the narrative holds.

Ground every claim in the provided sources; cite the numbers/events you were given. Do not invent data that contradicts the sources; if a bucket is empty, infer conservatively and lower confidence.

Return ONLY a single valid JSON object (no markdown, no code fences, no prose) matching EXACTLY this shape:
{
  "headline": "one punchy sentence, the market-moving read",
  "executiveSummary": "3-4 sentence institutional summary",
  "kpis": {
    "narrativeStrength": <int 0-100>,
    "marketSentiment": "<Strongly Bullish|Bullish|Neutral|Cautious|Bearish>",
    "sentimentScore": <int 0-100>,
    "narrativeMomentum": <int 0-100>,
    "aiConfidence": <int 0-100>
  },
  "ecosystem": [
    {"name":"RWA Growth","value":"<short e.g. $247.5M>","note":"<<=8 words>","tone":"pos|cau|neg"},
    {"name":"Agent Economy","value":"...","note":"...","tone":"pos|cau|neg"},
    {"name":"Prediction Mkts","value":"...","note":"...","tone":"pos|cau|neg"},
    {"name":"Ecosystem","value":"...","note":"...","tone":"pos|cau|neg"},
    {"name":"Settlement","value":"...","note":"...","tone":"pos|cau|neg"}
  ],
  "sources": [
    {"label":"X / Social","chips":[{"text":"<signal>","tone":"pos|cau|neg|neutral"}]},
    {"label":"Onchain / TVL","chips":[...]},
    {"label":"News & Ecosystem","chips":[...]},
    {"label":"Market / Prediction","chips":[...]}
  ],
  "layers": {
    "one": {"body":"<=90 words","chips":[{"text":"...","tone":"pos|cau|neg|neutral"}]},
    "two": {"body":"<=90 words","trigger":"<the specific catalyst that flipped sentiment>","chips":[...]},
    "three": {"body":"<=90 words","chips":[...]}
  },
  "evidence": [
    {"factor":"TVL Growth","detail":"<short>","rating":"<Strong Positive|Positive|Bullish|Growing|Neutral|Cautious|Negative>","tone":"pos|cau|neg"}
  ],
  "overallConfidence": <int 0-100>,
  "timeline": [
    {"when":"<Q1 2026 / date>","event":"<title>","detail":"<short>","impact":"pos|cau|neg"}
  ],
  "takeaway": "one strong forward-looking sentence a researcher could act on"
}
Provide exactly 5 ecosystem items, 3-5 evidence rows, and 3-5 timeline entries. Keep every string tight and analyst-grade.`;

function buildUserMessage(s) {
  s = s || {};
  return `Analyze the current Mantle narrative from these sources.\n\n=== X / SOCIAL ===\n${s.social || '(none provided)'}\n\n=== ONCHAIN / TVL ===\n${s.onchain || '(none provided)'}\n\n=== NEWS & ECOSYSTEM ===\n${s.news || '(none provided)'}\n\n=== MARKET / PREDICTION ===\n${s.market || '(none provided)'}\n\nReturn only the JSON object.`;
}

function extractJson(text) {
  let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a === -1 || b === -1) throw new Error('No JSON object found in the model response.');
  return JSON.parse(t.slice(a, b + 1));
}

const ALLOWED_MODELS = new Set(['claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5']);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'Backend is missing ANTHROPIC_API_KEY. Set it in the deployment environment (Vercel → Settings → Environment Variables).' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const sources = body.sources || {};
  const model = ALLOWED_MODELS.has(body.model) ? body.model : 'claude-opus-4-8';

  if (!sources.social && !sources.onchain && !sources.news && !sources.market) {
    return res.status(400).json({ error: 'Provide at least one source (social, onchain, news, or market).' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 4000, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: buildUserMessage(sources) }] }),
    });
    if (!r.ok) {
      let m = `Anthropic API error (${r.status})`;
      try { const e = await r.json(); if (e.error && e.error.message) m = e.error.message; } catch {}
      return res.status(r.status).json({ error: m });
    }
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json(extractJson(text));
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Backend failure while contacting the model.' });
  }
};
