import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * POST /support/request
 * Submits a help/support request with optional screenshot attachment.
 *
 * TODO:
 * 1. Validate session from cookie
 * 2. Parse message + optional screenshotBase64
 * 3. Validate screenshot size (max 5MB base64)
 * 4. Create support ticket in DB / forward to ticketing system
 * 5. Store screenshot in storage bucket if provided
 * 6. Return { ticketId, status: 'created' }
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
    const { message, screenshotBase64, page, tenant } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'VALIDATION',
        message: 'Message is required',
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check screenshot size (~5MB base64 ≈ 6.67MB string)
    if (screenshotBase64 && screenshotBase64.length > 7_000_000) {
      return new Response(JSON.stringify({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Screenshot exceeds 5MB',
      }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TODO: Create ticket in DB, store screenshot
    const ticketId = `SUP-${Date.now().toString(36).toUpperCase()}`;
    console.log(`[support] Ticket ${ticketId} created for tenant ${tenant} on page ${page} (TODO: persist)`);

    return new Response(JSON.stringify({ ticketId, status: 'created' }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'BAD_REQUEST', message: 'Invalid payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
