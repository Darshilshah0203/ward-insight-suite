export type Reading = { date: string; temp: number; note: string };
export type Patient = { id: number; name: string; age: number; wing: 'North' | 'South'; bed: string; admitted: string; isolation: number; pulse: number; oxygen: number; completed: boolean; history: Reading[] };
export const roundDate = '2026-10-06';
const names = ['Evelyn Thompson', 'James Wilson', 'Olivia Martinez', 'William Anderson', 'Charlotte Lee', 'Benjamin Taylor', 'Amelia Robinson', 'Henry Davis', 'Sophia Clark', 'Lucas Mitchell', 'Isabella Hall', 'Noah Walker', 'Mia Edwards', 'Alexander King', 'Harper Wright', 'Elijah Scott', 'Grace Campbell', 'Daniel Parker', 'Emily Roberts', 'Samuel Green'];
export const initialPatients: Patient[] = Array.from({ length: 74 }, (_, index) => {
  const completed = index >= 30;
  const fever = index >= 30 && index < 36;
  const temp = fever ? 38.1 + (index % 4) * 0.2 : 36.5 + (index % 8) * 0.1;
  return { id: index + 1, name: names[index % names.length] + (index >= 20 ? ` ${String.fromCharCode(65 + Math.floor(index / 20))}.` : ''), age: 32 + (index * 7) % 49, wing: index < 37 ? 'North' : 'South', bed: `${index < 37 ? 'N' : 'S'}-${String(index % 37 + 1).padStart(2, '0')}`, admitted: `Sep ${24 + index % 7}, 2026`, isolation: 6 + index % 7, pulse: 68 + index % 20, oxygen: 96 + index % 4, completed, history: Array.from({ length: 7 }, (_, day) => ({ date: `2026-10-${String(day + (completed ? 0 : -1)).padStart(2, '0')}`, temp: day < 3 ? 38.2 - day * 0.2 : temp + (day % 2) * 0.1, note: day < 3 ? 'Resting. Fluids encouraged.' : 'Comfortable, no new concerns.' })).map((reading, day) => ({ ...reading, date: day + (completed ? 0 : -1) <= 0 ? `2026-09-${30 + day + (completed ? 0 : -1)}` : reading.date })) };
});
export type DischargeRecord = { id: number; name: string; age: number; wing: 'North' | 'South'; bed: string; admitted: string; discharged: string; stay: number; outcome: 'Recovered' | 'Deceased'; cause?: string };
export const dischargeLog: DischargeRecord[] = [
  { id: 1, name: 'Margaret Hughes', age: 78, wing: 'North', bed: 'N-04', admitted: 'Sep 12, 2026', discharged: 'Oct 05, 2026', stay: 23, outcome: 'Recovered' },
  { id: 2, name: 'Robert Fletcher', age: 65, wing: 'South', bed: 'S-11', admitted: 'Sep 18, 2026', discharged: 'Oct 04, 2026', stay: 16, outcome: 'Recovered' },
  { id: 3, name: 'Anita Deshmukh', age: 54, wing: 'North', bed: 'N-19', admitted: 'Sep 21, 2026', discharged: 'Oct 03, 2026', stay: 12, outcome: 'Recovered' },
  { id: 4, name: 'George Whitfield', age: 83, wing: 'South', bed: 'S-02', admitted: 'Sep 08, 2026', discharged: 'Oct 02, 2026', stay: 24, outcome: 'Deceased', cause: 'Septic shock' },
  { id: 5, name: 'Lucia Fernandez', age: 47, wing: 'North', bed: 'N-27', admitted: 'Sep 25, 2026', discharged: 'Oct 01, 2026', stay: 6, outcome: 'Recovered' },
  { id: 6, name: 'Harold Briggs', age: 71, wing: 'South', bed: 'S-23', admitted: 'Sep 15, 2026', discharged: 'Sep 30, 2026', stay: 15, outcome: 'Recovered' },
  { id: 7, name: 'Priya Raman', age: 39, wing: 'North', bed: 'N-08', admitted: 'Sep 22, 2026', discharged: 'Sep 29, 2026', stay: 7, outcome: 'Recovered' },
  { id: 8, name: 'Edward Kowalski', age: 88, wing: 'North', bed: 'N-31', admitted: 'Sep 05, 2026', discharged: 'Sep 27, 2026', stay: 22, outcome: 'Deceased', cause: 'Respiratory failure' },
  { id: 9, name: 'Fatima Al-Sayed', age: 58, wing: 'South', bed: 'S-17', admitted: 'Sep 19, 2026', discharged: 'Sep 26, 2026', stay: 7, outcome: 'Recovered' },
  { id: 10, name: 'Thomas Bergström', age: 62, wing: 'South', bed: 'S-29', admitted: 'Sep 14, 2026', discharged: 'Sep 24, 2026', stay: 10, outcome: 'Recovered' },
];
export function mortalityRate(records: DischargeRecord[]) {
  const deaths = records.filter(r => r.outcome === 'Deceased').length;
  return { deaths, total: records.length, rate: records.length ? (deaths / records.length * 100).toFixed(1) : '0.0' };
}
export function clearStreak(patient: Patient) {
  let count = 0;
  for (const reading of [...patient.history].reverse()) {
    if (reading.temp >= 38) break;
    count++;
  }
  return Math.min(3, count);
}
export function displayTemp(value: number, unit: 'C' | 'F') { return `${(unit === 'C' ? value : value * 9 / 5 + 32).toFixed(1)}°${unit}`; }