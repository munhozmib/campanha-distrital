// Netlify Function: save-response
// Saves a survey response to Supabase via REST API.
// Required environment variables (set in Netlify dashboard):
//   SUPABASE_URL       — e.g. https://xyzxyz.supabase.co
//   SUPABASE_ANON_KEY  — your project's anon/public key

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SUPABASE_URL     = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase env vars not configured — response not saved.');
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, warning: 'db_not_configured' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Sanitize: keep only expected fields
  const row = {
    session_id: String(payload.session_id || '').slice(0, 64),
    q1:         payload.q1         || null,
    q2:         payload.q2         || null,
    q3:         payload.q3         || null,
    q4:         payload.q4         || null,
    q5:         Array.isArray(payload.q5) ? payload.q5 : [],
    q6:         payload.q6         || null,
    nome:       payload.nome       || null,
    telefone:   payload.telefone   || null,
    q7:         payload.q7         || null,
    q7_outro:   payload.q7_outro   || null,
    user_agent: String(payload.user_agent || '').slice(0, 512),
    ip:         event.headers['x-forwarded-for']?.split(',')[0]?.trim() || null
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(row)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'db_error', detail: err }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
