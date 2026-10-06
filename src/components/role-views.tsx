import { Button } from '@/components/ui/button';
import { clearStreak, displayTemp, type Patient } from '@/lib/ward-data';

type Props = { role: 'nurse' | 'doctor' | 'admin'; patients: Patient[]; unit: 'C' | 'F'; reviewed: number[]; onReview: (id: number) => void };

export function RoleView({ role, patients, unit, reviewed, onReview }: Props) {
  const fever = patients.filter(p => (p.history.at(-1)?.temp ?? 0) >= 38);
  const ready = patients.filter(p => p.completed && clearStreak(p) === 3);
  if (role === 'doctor') {
    return <div className="grid gap-6 border-t pt-6 lg:grid-cols-2">
      <section aria-label="Fever alerts"><h2 className="mb-3 text-base font-semibold">Fever alerts ({fever.length})</h2><table><thead><tr><th>Bed</th><th>Patient</th><th>Latest</th></tr></thead><tbody>{fever.map(p => <tr key={p.id}><td>{p.bed}</td><td>{p.name}</td><td className="temp fever">{displayTemp(p.history.at(-1)!.temp, unit)}</td></tr>)}</tbody></table></section>
      <section aria-label="Discharge review queue"><h2 className="mb-3 text-base font-semibold">Ready for discharge review ({ready.length})</h2><table><thead><tr><th>Bed</th><th>Patient</th><th>Action</th></tr></thead><tbody>{ready.slice(0, 15).map(p => <tr key={p.id}><td>{p.bed}</td><td>{p.name}</td><td>{reviewed.includes(p.id) ? <span className="badge normal">Signed off</span> : <Button size="sm" variant="outline" onClick={() => onReview(p.id)}>Sign off review</Button>}</td></tr>)}</tbody></table></section>
    </div>;
  }
  const done = patients.filter(p => p.completed).length;
  const stats = [['Occupied beds', `${patients.length} / 80`], ['Round completed', `${done} / ${patients.length}`], ['Active fevers', String(fever.length)], ['Discharges signed off', String(reviewed.length)]];
  const wings = (['North', 'South'] as const).map(w => { const list = patients.filter(p => p.wing === w); return { w, total: list.length, done: list.filter(p => p.completed).length, fever: list.filter(p => (p.history.at(-1)?.temp ?? 0) >= 38).length }; });
  return <div className="border-t pt-6">
    <div className="mb-6 grid gap-4 sm:grid-cols-4">{stats.map(([l, v]) => <div key={l} className="rounded-lg border bg-card p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 text-2xl font-semibold text-primary">{v}</div></div>)}</div>
    <h2 className="mb-3 text-base font-semibold">Wing summary</h2>
    <table><thead><tr><th>Wing</th><th>Beds</th><th>Round completed</th><th>Fevers</th><th>Nurse on shift</th></tr></thead><tbody>{wings.map(x => <tr key={x.w}><td>{x.w} Wing</td><td>{x.total}</td><td>{x.done} / {x.total}</td><td>{x.fever}</td><td>{x.w === 'North' ? 'Sarah Lawson' : 'Daniel Okafor'}</td></tr>)}</tbody></table>
  </div>;
}
