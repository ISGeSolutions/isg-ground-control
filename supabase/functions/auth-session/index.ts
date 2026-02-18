import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * POST /auth/session
 * Exchanges OIDC authorization code + PKCE verifier for a backend session.
 * Sets httpOnly cookie. No tokens returned in response body.
 *
 * TODO: Implement actual OIDC token exchange:
 * 1. Validate code + code_verifier against tenant OIDC provider
 * 2. Exchange for id_token + access_token at provider's /token endpoint
 * 3. Validate id_token signature + claims
 * 4. Create server-side session in DB
 * 5. Set httpOnly, Secure, SameSite=Lax cookie with session ID
 * 6. Return { ok: true, expiresIn: <seconds> }
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

  try {
    const { code, code_verifier, redirect_uri } = await req.json();

    if (!code || !code_verifier) {
      return new Response(JSON.stringify({
        error: 'INVALID_CODE',
        message: 'Authorization code and code_verifier are required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TODO: Exchange code with OIDC provider
    // TODO: Create session in DB
    // TODO: Set httpOnly cookie

    console.log('[auth-session] TODO: Exchange code for session', { code: code.slice(0, 8) + '...', redirect_uri });

    return new Response(JSON.stringify({
      ok: true,
      expiresIn: 3600,
      _todo: 'Backend token exchange not yet implemented',
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        // TODO: 'Set-Cookie': `session=<id>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'INTERNAL',
      message: 'Session exchange failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
