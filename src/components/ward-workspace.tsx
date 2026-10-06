import { createContext, useContext, useState, type ReactNode, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { Activity, LayoutDashboard, Users, History, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight, ChevronDown, Search, CalendarDays, Bell, ShieldCheck, Heart, Droplets, Check, Clock, Thermometer, Plus, ArrowUpRight, UserRound, X, CircleHelp, Leaf } from 'lucide-react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RoleView } from '@/components/role-views';
import { initialPatients, clearStreak, displayTemp, roundDate, type Patient } from '@/lib/ward-data';

export type Role = 'nurse' | 'doctor' | 'admin';
type WardState = { role: Role; setRole: React.Dispatch<React.SetStateAction<Role>>; reviewed: number[]; setReviewed: React.Dispatch<React.SetStateAction<number[]>>; patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>>; unit: 'C' | 'F'; setUnit: React.Dispatch<React.SetStateAction<'C' | 'F'>> };
const WardContext = createContext<WardState | null>(null);
export function WardProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState(initialPatients);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [role, setRole] = useState<Role>('nurse');
  const [reviewed, setReviewed] = useState<number[]>([]);
  return <WardContext.Provider value={{ patients, setPatients, unit, setUnit, role, setRole, reviewed, setReviewed }}>{children}</WardContext.Provider>;
}
function useWard() { const state = useContext(WardContext); if (!state) throw new Error('Ward provider is required'); return state; }
function Status({ patient }: { patient: Patient }) {
  const latest = patient.history.at(-1);
  if (!patient.completed) return <span className="badge pending"><Clock size={10} />Pending</span>;
  return latest && latest.temp >= 38 ? <span className="badge fever"><Thermometer size={10} />Fever</span> : <span className="badge normal"><Check size={10} />Completed</span>;
}
export function WardWorkspace({ view = 'dashboard' }: { view?: 'dashboard' | 'patients' | 'history' }) {
  const { patients, setPatients, unit, setUnit, role, setRole, reviewed, setReviewed } = useWard();
  const [quick, setQuick] = useState<Record<number, string>>({});
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState(view === 'patients' ? 'all' : 'pending');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('bed');
  const [selectedId, setSelectedId] = useState(1);
  const [drawer, setDrawer] = useState(true);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notices, setNotices] = useState(false);
  const [help, setHelp] = useState(false);
  const selected = patients.find(p => p.id === selectedId) ?? patients[0];
  const completed = patients.filter(p => p.completed).length;
  const feverCount = patients.filter(p => p.history.at(-1)?.temp !== undefined && (p.history.at(-1)?.temp ?? 0) >= 38).length;
  const progress = Math.round(completed / patients.length * 100);
  const tabs = [{ id: 'pending', label: 'Pending', count: patients.length - completed }, { id: 'fevers', label: 'Fevers', count: feverCount }, { id: 'completed', label: 'Completed', count: completed }, { id: 'all', label: 'All Beds', count: patients.length }];
  const isFever = (p: Patient) => (p.history.at(-1)?.temp ?? 0) >= 38;
  const urgency = (p: Patient) => isFever(p) ? 2 : !p.completed ? 1 : 0;
  const query = search.trim().toLowerCase().replace(/\s+/g, ' ');
  const filtered = patients.filter(p => {
    const matchesTab = filter === 'all' || (filter === 'pending' && !p.completed) || (filter === 'completed' && p.completed) || (filter === 'fevers' && isFever(p));
    if (!query) return matchesTab;
    const haystack = `${p.name} ${p.bed} ${p.bed.replace('-', '')} ${p.wing} wing ${p.age} ${isFever(p) ? 'fever' : p.completed ? 'completed' : 'pending'}`.toLowerCase();
    return matchesTab && query.split(' ').every(term => haystack.includes(term));
  }).sort((a, b) => {
    switch (sort) {
      case 'name': return a.name.localeCompare(b.name);
      case 'temp': return (b.history.at(-1)?.temp ?? 0) - (a.history.at(-1)?.temp ?? 0) || a.id - b.id;
      case 'isolation': return b.isolation - a.isolation || a.id - b.id;
      case 'urgency': return urgency(b) - urgency(a) || (b.history.at(-1)?.temp ?? 0) - (a.history.at(-1)?.temp ?? 0) || a.id - b.id;
      case 'south': return b.wing.localeCompare(a.wing) || a.bed.localeCompare(b.bed);
      default: return a.wing.localeCompare(b.wing) || a.bed.localeCompare(b.bed);
    }
  });
  const otherMatches = query && !filtered.length ? patients.filter(p => `${p.name} ${p.bed} ${p.wing}`.toLowerCase().includes(query)).length : 0;
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  const streak = selected ? clearStreak(selected) : 0;
  function saveReading(patient: Patient, raw: string, note: string) {
    const entered = Number(raw.replace(',', '.'));
    const celsius = unit === 'C' ? entered : (entered - 32) * 5 / 9;
    if (!raw.trim() || !Number.isFinite(entered) || celsius < 32 || celsius > 43) return `Enter a temperature between ${unit === 'C' ? '32 and 43°C' : '89.6 and 109.4°F'}.`;
    setPatients(previous => previous.map(p => p.id === patient.id ? { ...p, completed: true, history: [...p.history.filter(r => r.date !== roundDate), { date: roundDate, temp: Math.round(celsius * 10) / 10, note: note.trim() || 'No new concerns.' }].slice(-7) } : p));
    setMessage(`Recorded ${raw}°${unit} for ${patient.name} (bed ${patient.bed}). Demo changes last for this session only.`);
    return '';
  }
  function quickSave(patient: Patient) {
    const err = saveReading(patient, quick[patient.id] ?? '', '');
    if (err) { setMessage(err); return; }
    setQuick(q => ({ ...q, [patient.id]: '' }));
  }
  function record(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const err = saveReading(selected, temperature, notes);
    if (err) { setError(err); return; }
    setDialog(false);
  }
  function openRecord() { setTemperature(''); setNotes(''); setError(''); setDialog(true); }
  const nav = [{ label: 'Ward Dashboard', icon: LayoutDashboard, to: '/' as const, active: view === 'dashboard' }, { label: 'Patients', icon: Users, to: '/patients' as const, active: view === 'patients' }, { label: 'Round History', icon: History, to: '/history' as const, active: view === 'history' }];
  return <div className={`workspace ${collapsed ? 'collapsed' : ''}`}>
    <aside className="sidebar" aria-label="Ward navigation">
      <Link to="/" className="brand" aria-label="ClearDay ward dashboard"><span className="brand-mark"><Activity size={24} strokeWidth={1.8} /></span><span className="sidebar-text">ClearDay<span className="text-success">.</span></span></Link>
      <div className="ward-location"><span className="dot" />St. Mary's Hospital</div>
      <div className="ward-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{nav.map(item => <Button key={item.label} asChild variant="ghost" className={`nav-item ${item.active ? 'active' : ''}`} title={item.label}><Link to={item.to} aria-current={item.active ? 'page' : undefined}><item.icon size={17} /><span className="sidebar-text">{item.label}</span></Link></Button>)}</nav>
      <div className="sidebar-bottom"><Button variant="ghost" className="nav-item w-full" onClick={() => setHelp(true)} title="Help and support"><CircleHelp /><span className="sidebar-text">Help & support</span><ArrowUpRight className="sidebar-text ml-auto" /></Button><div className="shift-info">YOUR CURRENT SHIFT<br /><strong>Morning · 07:00 – 15:00</strong><br /><span>Ward 4 · Isolation unit</span></div></div>
    </aside>
    <div className="min-w-0">
      <header className="topbar"><div className="topbar-left"><Button variant="ghost" size="icon" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button><span className="online"><span className="dot" />Ward Online</span><span className="date"><CalendarDays size={14} />10-06-2026</span></div><div className="topbar-right"><div className="unit-switch" role="group" aria-label="Temperature unit">{(['C', 'F'] as const).map(u => <Button variant="ghost" key={u} className={unit === u ? 'selected' : ''} aria-pressed={unit === u} onClick={() => setUnit(u)}>°{u}</Button>)}</div><Button variant="ghost" size="icon" aria-label="Ward notifications" title="Ward notifications" onClick={() => setNotices(true)}><Bell size={17} /></Button><div className="profile"><span className="avatar">SL</span><div><strong>{role === 'doctor' ? 'Dr. Arjun Mehta' : role === 'admin' ? 'Priya Nair' : 'Sarah Lawson'}</strong><small>{role === 'doctor' ? 'Attending Physician' : role === 'admin' ? 'Ward Administrator' : 'Registered Nurse'}</small></div><select className="role-select" aria-label="Switch view" value={role} onChange={e => setRole(e.target.value as Role)}><option value="nurse">Nurse view</option><option value="doctor">Doctor view</option><option value="admin">Admin view</option></select></div></div></header>
      {message && <div className="toast" role="status">{message}</div>}
      <div className="page">
        <div className="page-heading"><div><div className="eyebrow">WARD 4 / ISOLATION UNIT</div><h1>{view === 'history' ? 'Round History' : view === 'patients' ? 'Ward Patients' : role === 'doctor' ? 'Physician Review' : role === 'admin' ? 'Ward Administration' : "Nurse's Morning Round"}</h1><p className="subtitle">{view === 'history' ? 'A daily record of care, one round at a time.' : 'A little care today. A step closer to home.'}</p></div><div className="round-progress"><div><strong>{completed}<span className="text-muted-foreground font-normal"> / {patients.length} beds completed</span></strong><p>Morning round in progress</p></div><svg className="progress-ring" viewBox="0 0 64 64" role="img" aria-label={`${progress}% of beds completed`}><circle className="ring-track" cx="32" cy="32" r="27" /><circle className="ring-fill" cx="32" cy="32" r="27" strokeDasharray={`${progress * 1.696} 169.6`} /><text className="ring-label" x="32" y="36">{progress}%</text></svg></div></div>
        {view !== 'history' && role !== 'nurse' ? <RoleView role={role} patients={patients} unit={unit} reviewed={reviewed} onReview={(id: number) => { setReviewed(r => r.includes(id) ? r : [...r, id]); setMessage('Discharge review signed off (demo, session only).'); }} /> : view === 'history' ? <div className="history-page"><div className="table-tools"><div className="search"><Search size={15} /><input aria-label="Search round history" placeholder="Search patient, bed, or wing..." value={search} onChange={e => setSearch(e.target.value)} /></div><span className="demo-label">Demo ward · October 2026</span></div><div className="table-scroll"><table aria-label="Ward round history"><thead><tr><th>Date</th><th>Round</th><th>Completed</th><th>Fever alerts</th><th>Status</th></tr></thead><tbody>{Array.from({ length: 7 }, (_, i) => { const day = 6 - i; const label = day > 0 ? `Oct ${String(day).padStart(2, '0')}, 2026` : 'Sep 30, 2026'; return !search || `${label} Morning round Ward 4 North South`.toLowerCase().includes(search.toLowerCase()) ? <tr key={i}><td>{label}</td><td>Morning round</td><td>{i === 0 ? completed : 74} / 74 beds</td><td>{i === 0 ? feverCount : 8 - i} patients</td><td><span className={`badge ${i === 0 ? 'pending' : 'normal'}`}>{i === 0 ? 'In progress' : 'Completed'}</span></td></tr> : null; })}</tbody></table></div></div> : <div className={`ward-content ${!drawer ? 'drawer-closed' : ''}`}>
          <section className="roster" aria-label="Patient roster"><TabsPrimitive.Root value={filter} onValueChange={value => { setFilter(value); setPage(1); }}><TabsPrimitive.List className="filter-tabs" aria-label="Filter patient beds">{tabs.map(tab => <TabsPrimitive.Trigger key={tab.id} value={tab.id} className="filter-tab inline-flex items-center" aria-label={`${tab.label}, ${tab.count} beds`}>{tab.label}<span className="tab-count">{tab.count}</span></TabsPrimitive.Trigger>)}</TabsPrimitive.List><TabsPrimitive.Content value={filter}>
            <div className="table-tools"><div className="search"><Search size={15} /><input placeholder="Search patient, bed, or wing..." aria-label="Search by patient name, bed number, or wing" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div><select className="sort" aria-label="Sort patients" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="bed">Sort: Bed (North first)</option><option value="south">Sort: Bed (South first)</option><option value="urgency">Sort: Urgency</option><option value="temp">Sort: Highest temperature</option><option value="name">Sort: Patient name A–Z</option><option value="isolation">Sort: Longest isolation</option></select></div>
            <div className="wing-heading"><strong>{visible.length && visible.every(p => p.wing === visible[0]?.wing) ? `${visible[0]?.wing} Wing` : 'Ward roster'} <span className="text-muted-foreground font-normal"> / {filtered.length} beds</span></strong><span>Updated just now</span></div>
            <div className="table-scroll"><table className="patient-table" aria-label="Patient beds and current clinical status"><thead><tr><th scope="col">Bed</th><th scope="col">Patient</th><th scope="col">Isolation Day</th><th scope="col">Latest Temp</th><th scope="col">Status</th><th scope="col">3-Day Clear Streak</th><th scope="col">Quick record (°{unit})</th></tr></thead><tbody>{visible.map(p => { const latest = p.history.at(-1); const clear = clearStreak(p); return <tr key={p.id} className={selectedId === p.id && drawer ? 'selected' : ''} tabIndex={0} aria-label={`Select ${p.name}, bed ${p.bed}${selectedId === p.id && drawer ? ', selected' : ''}`} onClick={() => { setSelectedId(p.id); setDrawer(true); }} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(p.id); setDrawer(true); } if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const row = e.key === 'ArrowDown' ? e.currentTarget.nextElementSibling : e.currentTarget.previousElementSibling; if (row instanceof HTMLElement) row.focus(); } }}><td className="bed">{p.bed}</td><td><div className="patient-name">{p.name}</div><div className="patient-meta">{p.age} years · {p.wing} Wing</div></td><td>Day {p.isolation}</td><td><div className={`temp ${latest && latest.temp >= 38 ? 'fever' : 'normal'}`}>{latest ? displayTemp(latest.temp, unit) : '—'}</div>{!p.completed && <div className="patient-meta">Yesterday</div>}</td><td><Status patient={p} /></td><td><div className="streak-cell"><div className="streak-small" aria-hidden="true">{[1, 2, 3].map(day => <span key={day} className={day <= clear ? 'clear' : ''} />)}</div><span>{clear}/3</span></div></td><td onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}><form className="quick-entry" onSubmit={e => { e.preventDefault(); quickSave(p); }}><input aria-label={`Type today's temperature for ${p.name}`} inputMode="decimal" placeholder={unit === 'C' ? '36.8' : '98.2'} value={quick[p.id] ?? ''} onChange={e => setQuick(q => ({ ...q, [p.id]: e.target.value }))} /><Button type="submit" size="icon" variant="ghost" aria-label={`Save temperature for ${p.name}`}><Check size={13} /></Button></form></td></tr>; })}</tbody></table>{!visible.length && <div className="empty" role="status">No patients match this search{otherMatches ? ` in this tab. ${otherMatches} match in other tabs — try "All Beds".` : '.'}</div>}</div>
            <div className="table-footer"><span aria-live="polite">Showing {filtered.length ? (currentPage - 1) * 8 + 1 : 0}–{Math.min(currentPage * 8, filtered.length)} of {filtered.length} beds</span><div className="pagination"><Button variant="ghost" aria-label="Previous patient page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></Button>{Array.from({ length: pageCount }, (_, i) => <Button key={i} variant="ghost" className={currentPage === i + 1 ? 'current' : ''} aria-label={`Patient page ${i + 1}`} aria-current={currentPage === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</Button>)}<Button variant="ghost" aria-label="Next patient page" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight /></Button></div></div>
          </TabsPrimitive.Content></TabsPrimitive.Root></section>
          {drawer && selected && <aside className="inspection" aria-label={`Patient inspection: ${selected.name}`}><div className="inspection-label">PATIENT OVERVIEW<Button variant="ghost" size="icon" aria-label="Close patient inspection" title="Close patient inspection" className="h-7 w-7" onClick={() => setDrawer(false)}><X size={14} /></Button></div><div className="patient-overview"><span className="patient-avatar"><UserRound size={24} strokeWidth={1.5} /></span><div><h2>{selected.name}</h2><p>Bed {selected.bed} <span className="mx-1">·</span> {selected.wing} Wing <span className="mx-1">·</span> {selected.age} years</p></div></div><div className="patient-facts"><div><div className="fact-label">Admission date</div><div className="fact-value">{selected.admitted}</div></div><div><div className="fact-label">Days in isolation</div><div className="fact-value">Day {selected.isolation} <span className="text-muted-foreground font-normal">of care</span></div></div></div><div className="vitals"><div><div className="vital-label"><Heart size={12} />Pulse rate</div><strong>{selected.pulse} <small>bpm</small></strong></div><div><div className="vital-label"><Droplets size={12} />Oxygen saturation</div><strong>{selected.oxygen}<small>% SpO₂</small></strong></div></div><h3>Three clear days. Closer to home.</h3><p className="description">Consecutive fever-free days below {displayTemp(38, unit)}.</p><div className="clear-days">{[1, 2, 3].map(day => <div className={`clear-day ${day <= streak ? 'met' : ''}`} key={day}><span className="day-icon">{day <= streak ? <Check size={13} /> : <Clock size={12} />}</span>Day {day}</div>)}</div><div className={`eligibility ${streak < 3 || !selected.completed ? 'waiting' : ''}`}>{streak === 3 && selected.completed ? <ShieldCheck size={15} className="shrink-0 mt-0.5" /> : <Clock size={15} className="shrink-0 mt-0.5" />}<span>{streak === 3 && selected.completed ? 'Fever-free criteria met. Ready for clinical discharge review.' : !selected.completed && streak === 3 ? "3 clear days recorded. Today's reading is due before clinical review." : `${3 - streak} more clear ${3 - streak === 1 ? 'day' : 'days'} needed before clinical discharge review.`}</span></div><div className="history-heading"><h3>Temperature history</h3><span>Last 7 days</span></div><svg viewBox="0 0 290 74" className="sparkline" role="img" aria-label="Seven-day temperature trend"><line x1="0" y1="23" x2="290" y2="23" className="threshold" /><polyline className="trend" points={selected.history.map((r, i) => `${8 + i * 45},${Math.max(5, Math.min(68, 23 + (38 - r.temp) * 25))}`).join(' ')} />{selected.history.map((r, i) => <circle key={r.date} cx={8 + i * 45} cy={Math.max(5, Math.min(68, 23 + (38 - r.temp) * 25))} r="3" />)}</svg><table className="history-table" aria-label={`${selected.name} seven-day temperature readings`}><thead><tr><th scope="col">Date</th><th scope="col">Temp ({unit === 'C' ? '°C' : '°F'})</th><th scope="col">Observation</th></tr></thead><tbody>{[...selected.history].reverse().map(reading => <tr key={reading.date}><td>{reading.date === roundDate ? 'Today' : `${reading.date.slice(5, 7) === '09' ? 'Sep' : 'Oct'} ${reading.date.slice(8)}`}</td><td className={`temp ${reading.temp >= 38 ? 'fever' : 'normal'}`}>{displayTemp(reading.temp, unit)}</td><td>{reading.note}</td></tr>)}</tbody></table><Button onClick={openRecord} className="record-button"><Plus size={15} />Record Today's Vitals</Button><p className="panel-footnote"><ShieldCheck size={11} />Clinical review is required for discharge</p></aside>}
        </div>}
        <footer className="page-foot"><span className="flex items-center gap-1.5"><Leaf size={12} />Every clear day is a step toward home.</span><span>Demo ward · Session-only records</span></footer>
      </div>
    </div>
    <Dialog open={dialog} onOpenChange={setDialog}><DialogContent><DialogHeader><DialogTitle>Record today's vitals</DialogTitle><DialogDescription>{selected?.name} · Bed {selected?.bed} · October 6, 2026</DialogDescription></DialogHeader><form onSubmit={record}><div className="form-field"><label htmlFor="temperature">Temperature (°{unit})</label><input id="temperature" autoFocus inputMode="decimal" type="text" placeholder={unit === 'C' ? 'e.g. 36.8' : 'e.g. 98.2'} value={temperature} onChange={e => setTemperature(e.target.value)} required /><div className="temp-chips" aria-label="Common readings">{(unit === 'C' ? ['36.5','36.8','37.0','37.5','38.0','38.5'] : ['97.7','98.2','98.6','99.5','100.4','101.3']).map(v => <button type="button" key={v} className="chip" onClick={() => setTemperature(v)}>{v}</button>)}</div><small className="text-muted-foreground">Type a value and press Enter, or tap a common reading.</small></div><div className="form-field"><label htmlFor="observations">Observation notes</label><textarea id="observations" rows={3} placeholder="Patient observations..." value={notes} onChange={e => setNotes(e.target.value)} /></div>{error && <p role="alert" className="form-error">{error}</p>}<p className="demo-label my-4">Demo record. Changes are not saved after a refresh.</p><div className="flex justify-end gap-2"><Button variant="outline" type="button" onClick={() => setDialog(false)}>Cancel</Button><Button type="submit"><Check />Save vitals</Button></div></form></DialogContent></Dialog>
    <Dialog open={notices} onOpenChange={setNotices}><DialogContent><DialogHeader><DialogTitle>Ward notifications</DialogTitle><DialogDescription>Morning round · Ward 4</DialogDescription></DialogHeader><p>{patients.length - completed} patients are awaiting today's vitals.</p><p>{feverCount} patients have a latest temperature of {displayTemp(38, unit)} or higher.</p></DialogContent></Dialog>
    <Dialog open={help} onOpenChange={setHelp}><DialogContent><DialogHeader><DialogTitle>ClearDay support</DialogTitle><DialogDescription>Ward 4 · Demo workspace</DialogDescription></DialogHeader><p>For clinical decisions, contact your ward lead. This workspace contains fictional patient records.</p><p>Three fever-free days indicate readiness for review, not automatic discharge approval.</p></DialogContent></Dialog>
  </div>;
}