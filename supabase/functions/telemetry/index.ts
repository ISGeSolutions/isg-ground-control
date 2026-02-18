import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * POST /telemetry/events
 * Accepts batched analytics + error events.
 * Stores in telemetry table / forwards to external service.
 *
 * TODO:
 * 1. Validate session from cookie
 * 2. Parse events array from body
 * 3. Apply server-side PII redaction as defense-in-depth
 * 4. Store events in telemetry DB table
 * 5. Rate-limit per tenant (429 if exceeded)
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
    const { events } = await req.json();
    const count = Array.isArray(events) ? events.length : 0;

    // TODO: Store events, apply rate limiting
    console.log(`[telemetry] Received ${count} events (TODO: persist)`);

    return new Response(JSON.stringify({ accepted: count }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'BAD_REQUEST', message: 'Invalid payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
