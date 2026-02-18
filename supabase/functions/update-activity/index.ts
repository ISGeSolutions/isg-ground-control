import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_STATUSES = ['not_started', 'in_progress', 'waiting', 'complete', 'overdue', 'not_applicable'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'PATCH' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'No auth token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { activityId, status, notes } = await req.json();

    if (!activityId || !status) {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: 'activityId and status are required' }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: 'VALIDATION', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updatePayload: Record<string, unknown> = {
      status,
      updated_by: user.id,
    };
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await supabase
      .from('activities')
      .update(updatePayload)
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      console.error('[update-activity]', error);
      if (error.code === '42501') {
        return new Response(JSON.stringify({ error: 'FORBIDDEN', message: 'You do not have permission to update this activity' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'DB_ERROR', message: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      data: {
        id: data.id,
        templateCode: data.template_code,
        status: data.status,
        notes: data.notes,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
        dueDate: data.due_date,
        source: data.source,
      }
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[update-activity] unexpected', err);
    return new Response(JSON.stringify({ error: 'INTERNAL', message: 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
