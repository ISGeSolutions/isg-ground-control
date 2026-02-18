import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * POST /auth/refresh
 * Rotates refresh token and extends the session.
 *
 * TODO:
 * 1. Read session ID from httpOnly cookie
 * 2. Look up session in DB, verify not expired
 * 3. Generate new session token (rotation)
 * 4. Update DB with new token + extended expiry
 * 5. Set new httpOnly cookie
 * 6. Return { ok: true, expiresIn }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // TODO: Read cookie, validate session, rotate token
  console.log('[auth-refresh] TODO: Implement session rotation');

  return new Response(JSON.stringify({
    ok: true,
    expiresIn: 3600,
    _todo: 'Session rotation not yet implemented',
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
