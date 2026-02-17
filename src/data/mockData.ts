import { ActivityTemplate, Departure, Activity, Series, User, ActivityStatus, TaskSource, SLARule, SLAReferenceDate } from '@/types/operations';
import { addDays, format, subDays } from 'date-fns';

// ─── SLA Hierarchy Rules ───────────────────────────────────────────────────────
// Global defaults — can be overridden at TG, TS, TD levels
export const GLOBAL_SLA_RULES: SLARule[] = [
  { level: 'global', activityCode: 'CQ', offsetDays: 365, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'CC', offsetDays: 300, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'PV', offsetDays: 90, referenceDate: 'departure', required: false, critical: false },
  { level: 'global', activityCode: 'TR', offsetDays: 150, referenceDate: 'departure', required: true, critical: false },
  { level: 'global', activityCode: 'FR', offsetDays: 180, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'FT', offsetDays: 90, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'HB', offsetDays: 365, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'HR', offsetDays: 540, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'LG', offsetDays: 60, referenceDate: 'departure', required: true, critical: false },
  { level: 'global', activityCode: 'TL', offsetDays: 30, referenceDate: 'departure', required: true, critical: false },
  { level: 'global', activityCode: 'LI', offsetDays: 120, referenceDate: 'departure', required: false, critical: false },
  { level: 'global', activityCode: 'RL', offsetDays: 42, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'JI', offsetDays: 28, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'IF', offsetDays: 180, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'AP', offsetDays: 28, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'FC', offsetDays: 42, referenceDate: 'departure', required: true, critical: true },
  { level: 'global', activityCode: 'RN', offsetDays: 84, referenceDate: 'departure', required: true, critical: false },
  { level: 'global', activityCode: 'PL', offsetDays: 7, referenceDate: 'return', required: true, critical: false },
];

// Example overrides at Tour Series level
export const SERIES_SLA_OVERRIDES: SLARule[] = [
  { level: 'tour_series', activityCode: 'HB', offsetDays: 400, referenceDate: 'departure', required: true, critical: true },
  { level: 'tour_series', activityCode: 'LI', offsetDays: 150, referenceDate: 'departure', required: true, critical: true },
];

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  { code: 'CQ', name: 'Agent Costings Requested', required: true, critical: true, slaOffsetDays: 365, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'CC', name: 'Agent Costings Confirmed', required: true, critical: true, slaOffsetDays: 300, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'PV', name: 'Pre-Visit', required: false, critical: false, slaOffsetDays: 90, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'TR', name: 'Trains', required: true, critical: false, slaOffsetDays: 150, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'FR', name: 'Domestic Flights Requested', required: true, critical: true, slaOffsetDays: 180, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'FT', name: 'Domestic Flights Ticketed', required: true, critical: true, slaOffsetDays: 90, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'HB', name: 'Hotels Booked', required: true, critical: true, slaOffsetDays: 365, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'HR', name: 'Hotels Requested', required: true, critical: true, slaOffsetDays: 540, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'LG', name: 'Local Guides', required: true, critical: false, slaOffsetDays: 60, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'TL', name: 'Tour Leader Pre-Tour', required: true, critical: false, slaOffsetDays: 30, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'LI', name: 'Letter of Invitation', required: false, critical: false, slaOffsetDays: 120, referenceDate: 'departure', source: 'TG' },
  { code: 'RL', name: 'Rooming List', required: true, critical: true, slaOffsetDays: 42, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'JI', name: 'Joining Instructions', required: true, critical: true, slaOffsetDays: 28, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'IF', name: 'International Flight', required: true, critical: true, slaOffsetDays: 180, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'AP', name: 'Agent Paid', required: true, critical: true, slaOffsetDays: 28, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'FC', name: 'Final Check', required: true, critical: true, slaOffsetDays: 42, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'RN', name: 'Confirmed Running', required: true, critical: false, slaOffsetDays: 84, referenceDate: 'departure', source: 'GLOBAL' },
  { code: 'PL', name: 'Tour Leader Post-Tour', required: true, critical: false, slaOffsetDays: 7, referenceDate: 'return', source: 'GLOBAL' },
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

  // Generate departures on Saturdays only
  const todayDay = today.getDay(); // 0=Sun, 6=Sat
  const daysUntilSat = (6 - todayDay + 7) % 7;
  const firstSat = addDays(today, daysUntilSat === 0 && todayDay === 6 ? 0 : daysUntilSat);

  for (let w = -2; w < 6; w++) {
    const depDate = addDays(firstSat, w * 7);
    const i = Math.round((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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

  // Add a second departure on some Saturdays
  for (let w = 0; w < 6; w += 2) {
    const depDate = addDays(firstSat, w * 7);
    const i2 = Math.round((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
      activities: generateActivities(dateStr, i2),
      notes: '',
      opsManager: managers[Math.floor(Math.random() * managers.length)].initials,
      opsExec: execs[Math.floor(Math.random() * execs.length)].initials,
    });
  }

  return departures.sort((a, b) => a.date.localeCompare(b.date));
}
