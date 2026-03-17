// Netlify Function: get-results
// Returns aggregated counts for each survey question from Supabase.
// Required environment variables:
//   SUPABASE_URL       — e.g. https://xyzxyz.supabase.co
//   SUPABASE_ANON_KEY  — your project's anon/public key

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60' // cache 60s
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const SUPABASE_URL      = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { statusCode: 200, headers, body: JSON.stringify({ q1: {}, q3: {}, q4: {} }) };
  }

  try {
    // Fetch all responses (only the columns we need for charting)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?select=q1,q2,q3,q4,q5,q6`,
      {
        headers: {
          'apikey':        SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'db_error' }) };
    }

    const rows = await res.json();

    // Aggregate counts
    const agg = { q1: {}, q2: {}, q3: {}, q4: {}, q5: {}, q6: {} };

    rows.forEach(row => {
      ['q1', 'q2', 'q3', 'q4', 'q6'].forEach(key => {
        const v = row[key];
        if (v) agg[key][v] = (agg[key][v] || 0) + 1;
      });
      // q5 is an array
      if (Array.isArray(row.q5)) {
        row.q5.forEach(net => {
          if (net) agg.q5[net] = (agg.q5[net] || 0) + 1;
        });
      }
    });

    agg.total = rows.length;

    return { statusCode: 200, headers, body: JSON.stringify(agg) };
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
