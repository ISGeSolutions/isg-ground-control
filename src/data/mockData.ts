import { ActivityTemplate, Departure, Activity, Series, User, ActivityStatus, TaskSource, SLARule, SLAReferenceDate } from '@/types/operations';
import { addDays, format, subDays } from 'date-fns';

// ─── SLA Hierarchy Rules ───────────────────────────────────────────────────────
// Global defaults — can be overridden at TG, TS, TD levels
export const GLOBAL_SLA_RULES: SLARule[] = [
  { level: 'global', activityCode: 'HB', offsetDays: 14, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'HC', offsetDays: 7, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'TR', offsetDays: 10, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'TC', offsetDays: 5, referenceDate: 'departure', required: true, critical: false },
  { level: 'global', activityCode: 'FT', offsetDays: 21, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'FC', offsetDays: 7, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'VI', offsetDays: 30, referenceDate: 'departure', required: false, critical: false },
  { level: 'global', activityCode: 'IN', offsetDays: 14, referenceDate: 'departure', required: false, critical: false },
  { level: 'global', activityCode: 'BD', offsetDays: 3, referenceDate: 'departure', required: true, critical: false },
  { level: 'global', activityCode: 'FN', offsetDays: 2, referenceDate: 'ji_exists', required: true, critical: false },
];

// Example overrides at Tour Series level
export const SERIES_SLA_OVERRIDES: SLARule[] = [
  { level: 'tour_series', activityCode: 'HB', offsetDays: 21, referenceDate: 'departure', required: true, critical: true }, // WA24 needs hotels earlier
  { level: 'tour_series', activityCode: 'VI', offsetDays: 45, referenceDate: 'departure', required: true, critical: true }, // CE24 visa is required+critical
];

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  { code: 'HB', name: 'Hotel Booking', required: true, critical: true, slaOffsetDays: 14, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'HC', name: 'Hotel Confirmation', required: true, critical: true, slaOffsetDays: 7, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'TR', name: 'Transfer Arrangement', required: true, critical: true, slaOffsetDays: 10, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'TC', name: 'Transfer Confirmation', required: true, critical: false, slaOffsetDays: 5, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'FT', name: 'Flight Ticketing', required: true, critical: true, slaOffsetDays: 21, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'FC', name: 'Flight Confirmation', required: true, critical: true, slaOffsetDays: 7, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'VI', name: 'Visa Check', required: false, critical: false, slaOffsetDays: 30, referenceDate: 'departure', source: 'TG' },
  { code: 'IN', name: 'Insurance', required: false, critical: false, slaOffsetDays: 14, referenceDate: 'departure', source: 'TG' },
  { code: 'BD', name: 'Boarding Docs', required: true, critical: false, slaOffsetDays: 3, referenceDate: 'departure', source: 'TS' },
  { code: 'FN', name: 'Final Notification', required: true, critical: false, slaOffsetDays: 2, referenceDate: 'ji_exists', source: 'GLOBAL' },
];

export const SERIES: Series[] = [
  { id: 's1', name: 'Summer Mediterranean', code: 'SM24' },
  { id: 's2', name: 'Winter Alps', code: 'WA24' },
  { id: 's3', name: 'Caribbean Explorer', code: 'CE24' },
  { id: 's4', name: 'Nordic Fjords', code: 'NF24' },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Sarah Chen', initials: 'SC', role: 'ops_manager' },
  { id: 'u2', name: 'James Miller', initials: 'JM', role: 'ops_exec' },
  { id: 'u3', name: 'Ama Osei', initials: 'AO', role: 'ops_exec' },
];

const DESTINATIONS = [
  { name: 'Antalya', code: 'AYT' },
  { name: 'Palma de Mallorca', code: 'PMI' },
  { name: 'Tenerife', code: 'TFS' },
  { name: 'Innsbruck', code: 'INN' },
  { name: 'Geneva', code: 'GVA' },
  { name: 'Cancún', code: 'CUN' },
  { name: 'Montego Bay', code: 'MBJ' },
  { name: 'Bergen', code: 'BGO' },
  { name: 'Tromsø', code: 'TOS' },
  { name: 'Rhodes', code: 'RHO' },
];

const TOUR_GENERICS = ['Beach & Sun', 'Mountain & Ski', 'Cultural Explorer', 'Adventure'];

function randomStatus(daysOut: number, slaOffset: number): ActivityStatus {
  // 5% chance of N/A
  if (Math.random() < 0.05) return 'not_applicable';
  if (daysOut > slaOffset + 5) return 'not_started';
  if (daysOut < 0) return Math.random() > 0.3 ? 'complete' : 'overdue';
  if (daysOut <= slaOffset) {
    const r = Math.random();
    if (r < 0.35) return 'complete';
    if (r < 0.55) return 'in_progress';
    if (r < 0.7) return 'waiting';
    if (r < 0.85) return 'not_started';
    return 'overdue';
  }
  return Math.random() > 0.6 ? 'not_started' : Math.random() > 0.5 ? 'in_progress' : 'complete';
}

function generateActivities(departureDate: string, daysOut: number): Activity[] {
  return ACTIVITY_TEMPLATES.map((t) => {
    const dueDate = format(subDays(new Date(departureDate), t.slaOffsetDays), 'yyyy-MM-dd');
    return {
      id: `act-${departureDate}-${t.code}`,
      templateCode: t.code,
      status: randomStatus(daysOut, t.slaOffsetDays),
      notes: '',
      updatedAt: format(subDays(new Date(), Math.floor(Math.random() * 5)), 'yyyy-MM-dd'),
      updatedBy: USERS[Math.floor(Math.random() * USERS.length)].initials,
      dueDate,
      source: t.source,
    };
  });
}

export function generateMockDepartures(): Departure[] {
  const today = new Date();
  const departures: Departure[] = [];
  const managers = USERS.filter(u => u.role === 'ops_manager');
  const execs = USERS.filter(u => u.role === 'ops_exec');

  for (let i = -3; i < 25; i++) {
    const depDate = addDays(today, i);
    const dateStr = format(depDate, 'yyyy-MM-dd');
    const returnDateStr = format(addDays(depDate, 7 + Math.floor(Math.random() * 7)), 'yyyy-MM-dd');
    const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const series = SERIES[Math.floor(Math.random() * SERIES.length)];
    const tourGeneric = TOUR_GENERICS[Math.floor(Math.random() * TOUR_GENERICS.length)];
    const jiSent = i < 5 ? format(subDays(depDate, 14), 'yyyy-MM-dd') : undefined;

    departures.push({
      id: `dep-${dateStr}-${dest.code}`,
      date: dateStr,
      returnDate: returnDateStr,
      jiSentDate: jiSent,
      destination: dest.name,
      destinationCode: dest.code,
      series: series.code,
      tourGeneric,
      paxCount: 20 + Math.floor(Math.random() * 180),
      bookingCount: 5 + Math.floor(Math.random() * 60),
      activities: generateActivities(dateStr, i),
      travelSystemLink: `https://bookings.example.com/departure/${dateStr}/${dest.code}`,
      notes: '',
      opsManager: managers[Math.floor(Math.random() * managers.length)].initials,
      opsExec: execs[Math.floor(Math.random() * execs.length)].initials,
    });
  }

  // Add a second departure on some days
  for (let i = 2; i < 15; i += 3) {
    const depDate = addDays(today, i);
    const dateStr = format(depDate, 'yyyy-MM-dd');
    const returnDateStr = format(addDays(depDate, 7 + Math.floor(Math.random() * 7)), 'yyyy-MM-dd');
    const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const series = SERIES[Math.floor(Math.random() * SERIES.length)];
    const tourGeneric = TOUR_GENERICS[Math.floor(Math.random() * TOUR_GENERICS.length)];

    departures.push({
      id: `dep-${dateStr}-${dest.code}-2`,
      date: dateStr,
      returnDate: returnDateStr,
      destination: dest.name,
      destinationCode: dest.code,
      series: series.code,
      tourGeneric,
      paxCount: 10 + Math.floor(Math.random() * 100),
      bookingCount: 3 + Math.floor(Math.random() * 30),
      activities: generateActivities(dateStr, i),
      notes: '',
      opsManager: managers[Math.floor(Math.random() * managers.length)].initials,
      opsExec: execs[Math.floor(Math.random() * execs.length)].initials,
    });
  }

  return departures.sort((a, b) => a.date.localeCompare(b.date));
}
