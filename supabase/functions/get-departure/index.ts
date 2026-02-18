import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'No auth token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'BAD_REQUEST', message: 'id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data, error } = await supabase
      .from('departures')
      .select(`*, activities (*), destination:destinations(name), series_rel:series(name)`)
      .eq('id', id)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'NOT_FOUND', message: 'Departure not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mapped = {
      id: data.id,
      date: data.date,
      returnDate: data.return_date,
      jiSentDate: data.ji_sent_date,
      destination: data.destination?.name || data.destination_code,
      destinationCode: data.destination_code,
      series: data.series_code,
      tourGeneric: data.tour_generic,
      paxCount: data.pax_count,
      bookingCount: data.booking_count,
      activities: (data.activities || []).map((a: any) => ({
        id: a.id,
        templateCode: a.template_code,
        status: a.status,
        notes: a.notes,
        updatedAt: a.updated_at,
        updatedBy: a.updated_by,
        dueDate: a.due_date,
        source: a.source,
      })),
      travelSystemLink: data.travel_system_link,
      notes: data.notes,
      gtd: data.gtd,
      opsManager: data.ops_manager_id,
      opsExec: data.ops_exec_id,
    };

    return new Response(JSON.stringify({ data: mapped }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[get-departure] unexpected', err);
    return new Response(JSON.stringify({ error: 'INTERNAL', message: 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
