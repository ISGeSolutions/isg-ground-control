import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * POST /auth/logout
 * Destroys backend session and clears httpOnly cookie.
 *
 * TODO:
 * 1. Read session ID from httpOnly cookie
 * 2. Delete session from DB
 * 3. Clear cookie by setting Max-Age=0
 * 4. Return { ok: true }
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

  // TODO: Delete session from DB, clear cookie
  console.log('[auth-logout] TODO: Implement session destruction');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      // TODO: 'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
    },
  });
});
