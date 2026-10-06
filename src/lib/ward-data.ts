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
export function clearStreak(patient: Patient) {
  let count = 0;
  for (const reading of [...patient.history].reverse()) {
    if (reading.temp >= 38) break;
    count++;
  }
  return Math.min(3, count);
}
export function displayTemp(value: number, unit: 'C' | 'F') { return `${(unit === 'C' ? value : value * 9 / 5 + 32).toFixed(1)}°${unit}`; }