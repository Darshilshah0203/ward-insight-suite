import { describe, expect, it } from 'vitest';
import { clearStreak, displayTemp, initialPatients } from './ward-data';
describe('ward vitals', () => {
 it('starts with the requested ward completion counts', () => {
  expect(initialPatients).toHaveLength(74);
  expect(initialPatients.filter(p => p.completed)).toHaveLength(44);
  expect(initialPatients.filter(p => (p.history.at(-1)?.temp ?? 0) >= 38)).toHaveLength(6);
 });
 it('converts display units without changing clinical values', () => {
  expect(displayTemp(38, 'F')).toBe('100.4°F');
  expect(displayTemp(38, 'C')).toBe('38.0°C');
 });
 it('resets a clear streak on a fever at exactly 38°C', () => {
  const patient = initialPatients[0];
  if (!patient) throw new Error('Missing demo patient');
  expect(clearStreak(patient)).toBe(3);
  expect(clearStreak({ ...patient, history: [...patient.history, { date: '2026-10-06', temp: 38, note: '' }] })).toBe(0);
 });
});
