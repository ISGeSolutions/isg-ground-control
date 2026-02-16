import { Departure } from '@/types/operations';
import { ACTIVITY_TEMPLATES } from '@/data/mockData';
import { calculateReadiness, calculateRisk, getDaysUntilDeparture } from '@/utils/operations';

export function exportDeparturesToCSV(departures: Departure[], filename = 'departures-export.csv') {
  const activityCodes = ACTIVITY_TEMPLATES.map(t => t.code);

  const headers = [
    'Date', 'Destination', 'Code', 'Series', 'Days Out', 'Pax', 'Bookings',
    'Manager', 'Exec', 'Readiness %', 'Risk',
    ...activityCodes.map(c => `${c} Status`),
    ...activityCodes.map(c => `${c} Due`),
  ];

  const rows = departures.map(dep => {
    const daysOut = getDaysUntilDeparture(dep.date);
    const readiness = calculateReadiness(dep.activities);
    const risk = calculateRisk(dep.activities);

    const statuses = activityCodes.map(code => {
      const act = dep.activities.find(a => a.templateCode === code);
      return act ? act.status : '';
    });

    const dueDates = activityCodes.map(code => {
      const act = dep.activities.find(a => a.templateCode === code);
      return act ? act.dueDate : '';
    });

    return [
      dep.date, dep.destination, dep.destinationCode, dep.series,
      daysOut, dep.paxCount, dep.bookingCount,
      dep.opsManager || '', dep.opsExec || '',
      readiness, risk,
      ...statuses,
      ...dueDates,
    ];
  });

  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csv = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
