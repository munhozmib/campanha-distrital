// Netlify Function: save-contact-message
// Saves a "Fale com o pré-candidato" message to Supabase via REST API.
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

  const SUPABASE_URL      = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase env vars not configured — message not saved.');
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, warning: 'db_not_configured' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!payload.nome || !payload.contato || !payload.mensagem) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing_fields' }) };
  }

  // Sanitize: keep only expected fields
  const row = {
    nome:       String(payload.nome).slice(0, 200),
    contato:    String(payload.contato).slice(0, 100),
    tipo:       payload.tipo ? String(payload.tipo).slice(0, 50) : null,
    mensagem:   String(payload.mensagem).slice(0, 4000),
    user_agent: String(payload.user_agent || '').slice(0, 512),
    ip:         event.headers['x-forwarded-for']?.split(',')[0]?.trim() || null
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
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
