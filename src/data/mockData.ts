import { ActivityTemplate, Departure, Activity, Series, User, ActivityStatus } from '@/types/operations';
import { addDays, format, subDays } from 'date-fns';

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  { code: 'HB', name: 'Hotel Booking', required: true, critical: true, slaOffsetDays: 14 },
  { code: 'HC', name: 'Hotel Confirmation', required: true, critical: true, slaOffsetDays: 7 },
  { code: 'TR', name: 'Transfer Arrangement', required: true, critical: true, slaOffsetDays: 10 },
  { code: 'TC', name: 'Transfer Confirmation', required: true, critical: false, slaOffsetDays: 5 },
  { code: 'FT', name: 'Flight Ticketing', required: true, critical: true, slaOffsetDays: 21 },
  { code: 'FC', name: 'Flight Confirmation', required: true, critical: true, slaOffsetDays: 7 },
  { code: 'VI', name: 'Visa Check', required: false, critical: false, slaOffsetDays: 30 },
  { code: 'IN', name: 'Insurance', required: false, critical: false, slaOffsetDays: 14 },
  { code: 'BD', name: 'Boarding Docs', required: true, critical: false, slaOffsetDays: 3 },
  { code: 'FN', name: 'Final Notification', required: true, critical: false, slaOffsetDays: 2 },
];

export const SERIES: Series[] = [
  { id: 's1', name: 'Summer Mediterranean', code: 'SM24' },
  { id: 's2', name: 'Winter Alps', code: 'WA24' },
  { id: 's3', name: 'Caribbean Explorer', code: 'CE24' },
  { id: 's4', name: 'Nordic Fjords', code: 'NF24' },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Sarah Chen', initials: 'SC' },
  { id: 'u2', name: 'James Miller', initials: 'JM' },
  { id: 'u3', name: 'Ama Osei', initials: 'AO' },
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

const statuses: ActivityStatus[] = ['not_started', 'in_progress', 'waiting', 'complete', 'overdue'];

function randomStatus(daysOut: number, slaOffset: number): ActivityStatus {
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
  return ACTIVITY_TEMPLATES.map((t, i) => {
    const dueDate = format(subDays(new Date(departureDate), t.slaOffsetDays), 'yyyy-MM-dd');
    return {
      id: `act-${departureDate}-${t.code}`,
      templateCode: t.code,
      status: randomStatus(daysOut, t.slaOffsetDays),
      notes: '',
      updatedAt: format(subDays(new Date(), Math.floor(Math.random() * 5)), 'yyyy-MM-dd'),
      updatedBy: USERS[Math.floor(Math.random() * USERS.length)].initials,
      dueDate,
    };
  });
}

export function generateMockDepartures(): Departure[] {
  const today = new Date();
  const departures: Departure[] = [];

  for (let i = -3; i < 25; i++) {
    const depDate = addDays(today, i);
    const dateStr = format(depDate, 'yyyy-MM-dd');
    const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const series = SERIES[Math.floor(Math.random() * SERIES.length)];

    departures.push({
      id: `dep-${dateStr}-${dest.code}`,
      date: dateStr,
      destination: dest.name,
      destinationCode: dest.code,
      series: series.code,
      paxCount: 20 + Math.floor(Math.random() * 180),
      bookingCount: 5 + Math.floor(Math.random() * 60),
      activities: generateActivities(dateStr, i),
      travelSystemLink: `https://bookings.example.com/departure/${dateStr}/${dest.code}`,
      notes: '',
    });
  }

  // Add a second departure on some days
  for (let i = 2; i < 15; i += 3) {
    const depDate = addDays(today, i);
    const dateStr = format(depDate, 'yyyy-MM-dd');
    const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
    const series = SERIES[Math.floor(Math.random() * SERIES.length)];

    departures.push({
      id: `dep-${dateStr}-${dest.code}-2`,
      date: dateStr,
      destination: dest.name,
      destinationCode: dest.code,
      series: series.code,
      paxCount: 10 + Math.floor(Math.random() * 100),
      bookingCount: 3 + Math.floor(Math.random() * 30),
      activities: generateActivities(dateStr, i),
      notes: '',
    });
  }

  return departures.sort((a, b) => a.date.localeCompare(b.date));
}
