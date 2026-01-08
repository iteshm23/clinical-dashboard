// api/snomed.js
// Serverless SNOMED proxy for Vercel
// Expects SNOMED_API_URL (base URL of Snowstorm or SNOMED server) in env
// Optionally SNOMED_API_KEY (Bearer) in env

export default async function handler(req, res) {
  const term = req.query.term || '';
  const BASE_URL = process.env.SNOMED_API_URL;
  const API_KEY = process.env.SNOMED_API_KEY || '';

  if (!term) {
    res.status(400).json({ error: 'Missing query parameter: term' });
    return;
  }

  if (!BASE_URL) {
    res.status(500).json({ error: 'SNOMED_API_URL not configured in environment' });
    return;
  }

  try {
    // Build a Snowstorm-style endpoint. Adjust if your provider differs.
    const url = `${BASE_URL.replace(/\/$/, '')}/concepts?term=${encodeURIComponent(term)}&limit=1`;

    const headers = {
      'Accept': 'application/json'
    };
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

    const resp = await fetch(url, { headers });
    const text = await resp.text();
    // try parse; if not JSON, forward text.
    try {
      const json = JSON.parse(text);
      res.status(resp.status).json(json);
    } catch (err) {
      res.status(resp.status).send(text);
    }
  } catch (err) {
    console.error('SNOMED proxy error:', err);
    res.status(500).json({ error: 'SNOMED proxy error', details: err.message });
  }
}
