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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const url = new URL(req.url);
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const series = url.searchParams.get('series');
    const destination = url.searchParams.get('destination');
    const search = url.searchParams.get('search');
    const opsManager = url.searchParams.get('opsManager');
    const opsExec = url.searchParams.get('opsExec');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let query = supabase
      .from('departures')
      .select(`
        *,
        activities (*),
        destination:destinations(name),
        series_rel:series(name)
      `, { count: 'exact' });

    if (dateFrom) query = query.gte('date', dateFrom);
    if (dateTo) query = query.lte('date', dateTo);
    if (series) query = query.eq('series_code', series);
    if (destination) query = query.eq('destination_code', destination);
    if (opsManager) query = query.eq('ops_manager_id', opsManager);
    if (opsExec) query = query.eq('ops_exec_id', opsExec);
    if (search) query = query.or(`notes.ilike.%${search}%,destination_code.ilike.%${search}%,series_code.ilike.%${search}%`);

    const from = (page - 1) * pageSize;
    query = query.order('date', { ascending: true }).range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[get-departures]', error);
      return new Response(JSON.stringify({ error: 'DB_ERROR', message: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map to API shape
    const mapped = (data || []).map((d: any) => ({
      id: d.id,
      date: d.date,
      returnDate: d.return_date,
      jiSentDate: d.ji_sent_date,
      destination: d.destination?.name || d.destination_code,
      destinationCode: d.destination_code,
      series: d.series_code,
      tourGeneric: d.tour_generic,
      paxCount: d.pax_count,
      bookingCount: d.booking_count,
      activities: (d.activities || []).map((a: any) => ({
        id: a.id,
        templateCode: a.template_code,
        status: a.status,
        notes: a.notes,
        updatedAt: a.updated_at,
        updatedBy: a.updated_by,
        dueDate: a.due_date,
        source: a.source,
      })),
      travelSystemLink: d.travel_system_link,
      notes: d.notes,
      gtd: d.gtd,
      opsManager: d.ops_manager_id,
      opsExec: d.ops_exec_id,
    }));

    return new Response(JSON.stringify({
      data: mapped,
      meta: { total: count || 0, page, pageSize },
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[get-departures] unexpected', err);
    return new Response(JSON.stringify({ error: 'INTERNAL', message: 'Server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
