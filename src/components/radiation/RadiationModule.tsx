// Ionizing Radiation Safety Program — module shell
// Tabs, header stat strip, state ownership (RUA / waste / dosimetry / documents in local
// storage; radiation sources flow through App.tsx so the portal audit trail stays intact).

import React, { useEffect, useMemo, useState } from 'react';
import type {
  RadiationSource, IrpRua, WasteContainer, DoseReading, DoseRosterEntry,
  BoardDocument, DosimeterLog, User, LeakTestRecord, SwipeTestRecord, UsageLogEntry
} from '../../types';
import { Badge, Chip } from './ui';
import {
  uid, todayISO, currentMonth, daysUntil, addDateDays, addYearISO, doseStatusOf,
  iaStage, checkStatus, diffRuaGroups
} from './utils';
import {
  LS_KEYS, LEAK_INTERVAL_DAYS, SWIPE_INTERVAL_DAYS, LICENCE_ALERT_MONTHS, RUA_ALERT_DAYS
} from './constants';
import { SEED_LOCATIONS, SEED_PERSONS, SEED_RUAS, SEED_WASTE, SEED_DOSES, SEED_DOSE_ROSTER, SEED_DOCS } from './seeds';
import { InventoryView, type InvSub, type UnsealedSub } from './InventoryView';
import { RuaView, RuaEditor } from './RuaView';
import { DosimetryView } from './DosimetryView';
import { WasteView, type WasteSub } from './WasteView';
import { MonthlyView } from './MonthlyView';
import { DocumentsView } from './DocumentsView';
import { IsotopesView } from './IsotopesView';
import { SourceForm, type SourceFormResult } from './SourceForm';
import {
  LeakTestModal, SwipeTestModal, LicenceChangeModal, PossessUseModal, DecommissionModal,
  UsageModal, WasteFormModal, DisposeModal, DocModal
} from './modals';

export interface RadiationModuleProps {
  currentUser: User;
  radiationSources: RadiationSource[];
  onAddDosimeterLog: (log: DosimeterLog, details: string) => void;
  onAddRadiationSource: (s: RadiationSource, details: string) => void;
  onUpdateRadiationSource: (s: RadiationSource, details: string) => void;
  onBatchUpdateRadiationSources: (s: RadiationSource[], details: string) => void;
}

type Tab = 'inventory' | 'rua' | 'dosimetry' | 'waste' | 'monthly' | 'docs' | 'isotopes';

function loadLS<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return seed;
    const v = JSON.parse(raw);
    return (Array.isArray(v) && v.length ? v : seed) as T;
  } catch { return seed; }
}
const saveLS = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } };

export default function RadiationModule(p: RadiationModuleProps) {
  const userName = p.currentUser && p.currentUser.name ? p.currentUser.name : 'Marcus Chen';

  // ── navigation ──
  const [tab, setTab] = useState<Tab>('inventory');
  const [invSub, setInvSub] = useState<InvSub>('sealed');
  const [uSub, setUSub] = useState<UnsealedSub>('list');
  const [wasteSub, setWasteSub] = useState<WasteSub>('collected');
  const [selSource, setSelSource] = useState<string | null>(null);
  const [selRua, setSelRua] = useState<string | null>(null);

  // ── module-owned state (persisted) ──
  const [ruas, setRuas] = useState<IrpRua[]>(() => loadLS(LS_KEYS.ruas, SEED_RUAS));
  const [waste, setWaste] = useState<WasteContainer[]>(() => loadLS(LS_KEYS.waste, SEED_WASTE));
  const [doses, setDoses] = useState<DoseReading[]>(() => loadLS(LS_KEYS.doses, SEED_DOSES));
  const [roster, setRoster] = useState<DoseRosterEntry[]>(() => loadLS(LS_KEYS.doseRoster, SEED_DOSE_ROSTER));
  const [docs, setDocs] = useState<BoardDocument[]>(() => loadLS(LS_KEYS.docs, SEED_DOCS));
  useEffect(() => saveLS(LS_KEYS.ruas, ruas), [ruas]);
  useEffect(() => saveLS(LS_KEYS.waste, waste), [waste]);
  useEffect(() => saveLS(LS_KEYS.doses, doses), [doses]);
  useEffect(() => saveLS(LS_KEYS.doseRoster, roster), [roster]);
  useEffect(() => saveLS(LS_KEYS.docs, docs), [docs]);

  // ── modals ──
  const [sourceForm, setSourceForm] = useState<{ open: boolean; source: RadiationSource | null }>({ open: false, source: null });
  const [ruaEditor, setRuaEditor] = useState<{ open: boolean; rua: IrpRua | null }>({ open: false, rua: null });
  const [leakFor, setLeakFor] = useState<RadiationSource | null>(null);
  const [swipeFor, setSwipeFor] = useState<IrpRua | null>(null);
  const [licFor, setLicFor] = useState<RadiationSource | null>(null);
  const [puFor, setPuFor] = useState<RadiationSource | null>(null);
  const [decomFor, setDecomFor] = useState<RadiationSource | null>(null);
  const [usageFor, setUsageFor] = useState<RadiationSource | null>(null);
  const [wasteModal, setWasteModal] = useState(false);
  const [disposeFor, setDisposeFor] = useState<WasteContainer | null>(null);
  const [docModal, setDocModal] = useState<{ open: boolean; doc: BoardDocument | null }>({ open: false, doc: null });

  // ── toast ──
  const [toastMsg, setToastMsg] = useState('');
  const toast = (msg: string) => { setToastMsg(msg); window.setTimeout(() => setToastMsg(''), 3400); };

  const sources = p.radiationSources;

  // ══════════════ HEADER STATS ══════════════
  const stats = useMemo(() => {
    const sealed = sources.filter(s => s.category === 'sealed');
    const leakDue = sealed.filter(s => s.nextLeakTest && daysUntil(s.nextLeakTest) <= 0).length;
    const swipeDue = ruas.filter(u => u.nextSwipeTest && daysUntil(u.nextSwipeTest) <= 0).length;
    const checksOver = sources.filter(s => {
      if (s.category === 'sealed') return checkStatus(s).cls === 'overdue';
      if (s.category === 'apparatus') return iaStage(s) === 'possess-use' && checkStatus(s).cls === 'overdue';
      return false;
    }).length;
    const licAttn = sources.filter(s => s.category === 'apparatus' && iaStage(s) !== 'decommissioned' && (!s.licenceExpiryDate || daysUntil(s.licenceExpiryDate) <= LICENCE_ALERT_MONTHS * 30)).length;
    const ruaAttn = ruas.filter(u => !u.expiryDate || daysUntil(u.expiryDate) <= RUA_ALERT_DAYS).length;
    const critDose = doses.filter(d => doseStatusOf(d.exposure) === 'critical').length;
    const wasteMonth = waste.filter(w => w.status !== 'disposed' && (w.collectedDate || '').startsWith(currentMonth())).length;
    return { leakDue, swipeDue, checksOver, licAttn, ruaAttn, critDose, wasteMonth };
  }, [sources, ruas, doses, waste]);

  const goto = (t: 'inventory' | 'waste' | 'monthly', sub?: string) => {
    setTab(t);
    if (t === 'inventory' && (sub === 'quarterly' || sub === 'summary')) { setInvSub('unsealed'); setUSub(sub); }
    if (t === 'waste' && sub) setWasteSub(sub as WasteSub);
  };

  // ══════════════ SOURCE HANDLERS (via App — audit trail) ══════════════
  const nameOf = (s: RadiationSource) => s.sourceName || s.equipmentDescription || s.id;

  const submitSourceForm = (r: SourceFormResult) => {
    if (r.isNew) p.onAddRadiationSource(r.source, r.log);
    else p.onUpdateRadiationSource(r.source, r.log);
    setSourceForm({ open: false, source: null });
    setSelSource(r.source.id);
    if (r.source.category) setInvSub(r.source.category as InvSub);
    toast((r.isNew ? 'Registered ' : 'Updated ') + nameOf(r.source));
  };

  const conductLeakTest = (s: RadiationSource, r: { date: string; result: 'pass' | 'fail'; counts: number; background: number; notes: string }) => {
    const net = r.counts - r.background;
    const rec: LeakTestRecord = { id: uid('lt'), date: r.date, counts: r.counts, background: r.background, net, result: r.result, notes: r.notes || undefined };
    const updated: RadiationSource = {
      ...s,
      lastLeakTest: r.date,
      nextLeakTest: addDateDays(r.date, LEAK_INTERVAL_DAYS),
      status: r.result === 'fail' ? 'alert' : 'safe',
      leakTestCounts: r.counts, leakTestBackground: r.background, leakTestResult: r.result, leakTestNotes: r.notes || undefined,
      leakTestHistory: [rec, ...(s.leakTestHistory || [])]
    };
    p.onUpdateRadiationSource(updated, 'Leak test — ' + nameOf(s) + ': ' + r.result.toUpperCase() + ' (net ' + net.toFixed(1) + ' cpm); next due ' + updated.nextLeakTest);
    setLeakFor(null);
    toast('Leak test recorded — ' + r.result.toUpperCase());
  };

  const markChecked = (s: RadiationSource) => {
    const entry = todayISO() + ' — Verified by ' + userName;
    p.onUpdateRadiationSource({ ...s, lastInventoryCheckDate: todayISO(), checkHistory: [entry, ...(s.checkHistory || [])] }, 'Inventory check — ' + nameOf(s));
    toast('Inventory check recorded for ' + nameOf(s));
  };

  const batchCheck = (ids: string[]) => {
    const entry = todayISO() + ' — Verified by ' + userName;
    const updated = sources.filter(s => ids.includes(s.id)).map(s => ({ ...s, lastInventoryCheckDate: todayISO(), checkHistory: [entry, ...(s.checkHistory || [])] }));
    p.onBatchUpdateRadiationSources(updated, 'Batch inventory check — ' + updated.length + ' sealed sources verified');
    toast('Marked ' + updated.length + ' sources as checked');
  };

  const changeLicence = (s: RadiationSource, num: string, fileName: string, notes: string) => {
    const updated: RadiationSource = {
      ...s, licenceNumber: num, licenceFile: fileName || s.licenceFile,
      licenceHistory: [{ id: uid('lh'), licenceNumber: num, changedDate: todayISO(), changedBy: userName, fileName: fileName || undefined, notes: notes || ('Changed from ' + (s.licenceNumber || '—')) }, ...(s.licenceHistory || [])]
    };
    p.onUpdateRadiationSource(updated, 'Licence change — ' + nameOf(s) + ': ' + (s.licenceNumber || '—') + ' → ' + num);
    setLicFor(null);
    toast('Licence updated to ' + num);
  };

  const moveToPU = (s: RadiationSource, num: string, expiry: string, fileName: string, serials: string) => {
    const updated: RadiationSource = {
      ...s,
      stage: 'possess-use',
      possessLicence: { number: s.licenceNumber, expiryDate: s.licenceExpiryDate, file: s.licenceFile },
      licenceNumber: num, licenceExpiryDate: expiry, licenceFile: fileName || s.licenceFile,
      xrayTubeSerialNumbers: serials || s.xrayTubeSerialNumbers,
      licenceHistory: [{ id: uid('lh'), licenceNumber: num, changedDate: todayISO(), changedBy: userName, fileName: fileName || undefined, notes: 'Changed to possess & use licence (installation complete)' }, ...(s.licenceHistory || [])]
    };
    p.onUpdateRadiationSource(updated, 'IA lifecycle — ' + nameOf(s) + ' moved to Possess & Use; licence ' + num + ' valid until ' + expiry);
    setPuFor(null);
    toast('Moved to Possess & Use — annual cycle started');
  };

  const decommission = (s: RadiationSource, a: string, d: string, v: string, fileName: string, notes: string) => {
    const updated: RadiationSource = {
      ...s,
      stage: 'decommissioned',
      decommission: { approvalDate: a, destroyedDate: d, verifiedDate: v, approvalFile: fileName, notes: notes || undefined },
      licenceHistory: [{ id: uid('lh'), licenceNumber: s.licenceNumber || '', changedDate: todayISO(), changedBy: userName, fileName, notes: 'Licence removed on decommissioning' }, ...(s.licenceHistory || [])]
    };
    p.onUpdateRadiationSource(updated, 'IA decommissioned — ' + nameOf(s) + ': Board approved ' + a + ', tubes destroyed ' + d + ', Board verified ' + v + '; licence removed');
    setDecomFor(null);
    toast(nameOf(s) + ' decommissioned — licence removed');
  };

  const recordUsage = (s: RadiationSource, r: { date: string; volume?: string; activityUCi: number; by?: string; notes?: string }) => {
    const entry: UsageLogEntry = { id: uid('ul'), ...r };
    p.onUpdateRadiationSource({ ...s, usageLog: [entry, ...(s.usageLog || [])] }, 'Consumption — ' + nameOf(s) + ': ' + r.activityUCi + ' µCi spent on ' + r.date + (r.by ? ' by ' + r.by : ''));
    setUsageFor(null);
    toast('Consumption recorded');
  };

  const deleteSource = (s: RadiationSource) => {
    if (!window.confirm('Delete ' + nameOf(s) + ' permanently? This cannot be undone.')) return;
    // Removal flows through a batch update of everything else, keeping the App state the single source of truth
    p.onBatchUpdateRadiationSources(sources.filter(x => x.id !== s.id), 'Deleted radioactive asset — ' + nameOf(s));
    setSelSource(null);
    toast('Deleted ' + nameOf(s));
  };

  // ══════════════ RUA HANDLERS ══════════════
  const saveRua = (u: IrpRua, isNew: boolean) => {
    if (isNew) {
      setRuas(cur => [...cur, u]);
      toast('Authorization ' + u.ruaNo + ' created');
    } else {
      setRuas(cur => cur.map(x => {
        if (x.id !== u.id) return x;
        const diff = diffRuaGroups(x.groups, u.groups || []);
        if (!diff.length) return u;
        return { ...u, changeHistory: [{ id: uid('rh'), date: todayISO(), changes: diff }, ...(u.changeHistory || [])] };
      }));
      toast('Authorization ' + (u.ruaNo || u.spaceID) + ' updated');
    }
    setRuaEditor({ open: false, rua: null });
    setSelRua(u.id);
  };

  const deleteRua = (u: IrpRua) => {
    if (!window.confirm('Delete authorization ' + (u.ruaNo || u.spaceID) + '? Unsealed sources registered in this room will lose swipe-test coverage.')) return;
    setRuas(cur => cur.filter(x => x.id !== u.id));
    setSelRua(null);
    toast('Authorization deleted');
  };

  const renewRua = (u: IrpRua) => {
    const base = u.expiryDate && u.expiryDate >= todayISO() ? u.expiryDate : todayISO();
    const newExp = addYearISO(base);
    setRuas(cur => cur.map(x => x.id === u.id ? {
      ...x, expiryDate: newExp, renewedDate: todayISO(),
      changeHistory: [{ id: uid('rh'), date: todayISO(), changes: ['Renewed for 1 year — valid until ' + newExp] }, ...(x.changeHistory || [])]
    } : x));
    toast('Renewed — valid until ' + newExp);
  };

  const conductSwipe = (u: IrpRua, r: { date: string; result: 'clean' | 'positive' | 'adal'; counts: number; background: number; followUp: string }) => {
    const net = r.counts - r.background;
    const rec: SwipeTestRecord = { id: uid('sw'), date: r.date, counts: r.counts, background: r.background, net, result: r.result, followUp: r.followUp || undefined };
    setRuas(cur => cur.map(x => x.id === u.id ? { ...x, lastSwipeTest: r.date, nextSwipeTest: addDateDays(r.date, SWIPE_INTERVAL_DAYS), swipeHistory: [rec, ...(x.swipeHistory || [])] } : x));
    setSwipeFor(null);
    toast('Swipe test recorded — ' + (r.result === 'clean' ? 'CLEAN' : r.result === 'adal' ? 'ABOVE ADAL' : 'POSITIVE'));
  };

  // ══════════════ DOSIMETRY HANDLERS ══════════════
  const addDose = (r: { name: string; department: string; month: string; exposure: number; remarks: string }): boolean => {
    const status = doseStatusOf(r.exposure);
    setDoses(cur => [{ id: uid('dose'), ...r, status }, ...cur]);
    p.onAddDosimeterLog({ id: uid('dl'), employeeName: r.name, department: r.department, exposure: r.exposure, period: r.month, status },
      'Abnormal dose reading — ' + r.name + ' (' + r.department + '): ' + r.exposure.toFixed(1) + ' mSv for ' + r.month + ' [' + status.toUpperCase() + ']');
    toast(status === 'critical' ? 'CRITICAL reading logged — alert raised' : 'Reading logged — ' + status);
    return true;
  };

  const saveRoster = (entry: DoseRosterEntry | null, r: { name: string; department: string; isotopes: string[]; tld: boolean; ring: boolean; notes?: string }) => {
    if (entry) setRoster(cur => cur.map(x => x.id === entry.id ? { ...x, ...r } : x));
    else setRoster(cur => [...cur, { id: uid('dr'), ...r }]);
    toast(entry ? 'Roster entry updated' : r.name + ' added to roster');
  };

  const deleteRoster = (id: string) => {
    if (!window.confirm('Remove this person from the monitored roster?')) return;
    setRoster(cur => cur.filter(x => x.id !== id));
  };

  // ══════════════ WASTE HANDLERS ══════════════
  const logWaste = (w: Omit<WasteContainer, 'id' | 'status'>) => {
    setWaste(cur => [{ id: uid('w'), ...w, status: 'collected' as const }, ...cur]);
    setWasteModal(false);
    toast('Container ' + w.tagNo + ' logged');
  };

  const disposeWaste = (c: WasteContainer, r: { disposedDate: string; disposalMethod: string; disposedBy?: string; disposalNotes?: string }) => {
    setWaste(cur => cur.map(x => x.id === c.id ? { ...x, status: 'disposed' as const, ...r } : x));
    setDisposeFor(null);
    toast('Disposal recorded for ' + c.tagNo);
  };

  const deleteWaste = (c: WasteContainer) => {
    if (!window.confirm('Delete waste container ' + c.tagNo + '?')) return;
    setWaste(cur => cur.filter(x => x.id !== c.id));
  };

  // ══════════════ DOCUMENT HANDLERS ══════════════
  const saveDoc = (doc: BoardDocument | null, r: { date: string; direction: 'Sent' | 'Received'; subject: string; relatesTo?: string; fileName?: string; notes?: string }) => {
    if (doc) setDocs(cur => cur.map(x => x.id === doc.id ? { ...x, ...r } : x));
    else setDocs(cur => [{ id: uid('doc'), ...r }, ...cur]);
    setDocModal({ open: false, doc: null });
    toast(doc ? 'Correspondence updated' : 'Correspondence logged');
  };

  const deleteDoc = (d: BoardDocument) => {
    if (!window.confirm('Delete this correspondence entry?')) return;
    setDocs(cur => cur.filter(x => x.id !== d.id));
  };

  // ══════════════ RENDER ══════════════
  const TABS: { k: Tab; label: string }[] = [
    { k: 'inventory', label: '☢ Inventory' },
    { k: 'rua', label: '📋 RUA' },
    { k: 'dosimetry', label: '👤 Personnel Dosimetry' },
    { k: 'waste', label: '🛢 Waste Tracking' },
    { k: 'monthly', label: '📊 Monthly Summary' },
    { k: 'docs', label: '📁 Documents' },
    { k: 'isotopes', label: '📖 Isotope Reference' }
  ];

  return (
    <div className="grid gap-4">
      {/* stat strip */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setTab('inventory'); setInvSub('sealed'); }}><Chip n={stats.leakDue} label="Leak tests due" hot={stats.leakDue > 0} /></button>
        <button onClick={() => setTab('rua')}><Chip n={stats.swipeDue} label="Swipe tests due" hot={stats.swipeDue > 0} /></button>
        <button onClick={() => setTab('inventory')}><Chip n={stats.checksOver} label="Checks overdue" hot={stats.checksOver > 0} /></button>
        <button onClick={() => { setTab('inventory'); setInvSub('apparatus'); }}><Chip n={stats.licAttn} label="Licences need attention" hot={stats.licAttn > 0} /></button>
        <button onClick={() => setTab('rua')}><Chip n={stats.ruaAttn} label="RUAs need attention" hot={stats.ruaAttn > 0} /></button>
        <button onClick={() => setTab('dosimetry')}><Chip n={stats.critDose} label="Critical doses" hot={stats.critDose > 0} /></button>
        <button onClick={() => { setTab('waste'); setWasteSub('collected'); }}><Chip n={stats.wasteMonth} label="Waste collected this month" /></button>
      </div>

      {/* tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-px">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`text-xs font-bold px-3.5 py-2 rounded-t-md border-b-2 transition-colors whitespace-nowrap ${tab === t.k ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* inventory register selector (mirrors the HTML dropdown) */}
      {tab === 'inventory' && (
        <div className="flex gap-1.5">
          {([['sealed', 'Sealed Sources'], ['unsealed', 'Unsealed Sources'], ['apparatus', 'Irradiating Apparatus']] as [InvSub, string][]).map(([k, label]) => (
            <button key={k} onClick={() => { setInvSub(k); setSelSource(null); }}
              className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-colors ${invSub === k ? 'bg-amber-700/20 border-amber-600/50 text-amber-400' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'inventory' && (
        <InventoryView
          sources={sources} sub={invSub} uSub={uSub} onUSub={setUSub} ruas={ruas}
          selectedId={selSource} onSelect={setSelSource}
          onRegister={() => setSourceForm({ open: true, source: null })}
          onEdit={s => setSourceForm({ open: true, source: s })}
          onDelete={deleteSource}
          onMarkChecked={markChecked} onBatchCheck={batchCheck}
          onLeakTest={setLeakFor} onSwipeRua={setSwipeFor} onUsage={setUsageFor}
          onLicenceChange={setLicFor} onToPU={setPuFor} onDecom={setDecomFor}
        />
      )}

      {tab === 'rua' && !ruaEditor.open && (
        <RuaView
          ruas={ruas} locations={SEED_LOCATIONS} persons={SEED_PERSONS}
          selectedId={selRua} onSelect={setSelRua}
          onNew={() => setRuaEditor({ open: true, rua: null })}
          onEdit={u => setRuaEditor({ open: true, rua: u })}
          onDelete={deleteRua} onRenew={renewRua} onSwipe={setSwipeFor}
        />
      )}
      {tab === 'rua' && ruaEditor.open && (
        <RuaEditor rua={ruaEditor.rua} ruas={ruas} locations={SEED_LOCATIONS} persons={SEED_PERSONS}
          onSave={saveRua} onCancel={() => setRuaEditor({ open: false, rua: null })} />
      )}

      {tab === 'dosimetry' && (
        <DosimetryView doses={doses} roster={roster} persons={SEED_PERSONS}
          onAddDose={addDose} onRosterSave={saveRoster} onRosterDelete={deleteRoster} />
      )}

      {tab === 'waste' && (
        <WasteView waste={waste} ruas={ruas} sub={wasteSub} onSub={setWasteSub}
          onLog={() => setWasteModal(true)} onDispose={setDisposeFor} onDelete={deleteWaste} />
      )}

      {tab === 'monthly' && <MonthlyView sources={sources} ruas={ruas} waste={waste} doses={doses} roster={roster} />}

      {tab === 'docs' && (
        <DocumentsView sources={sources} docs={docs}
          onDocNew={() => setDocModal({ open: true, doc: null })}
          onDocEdit={d => setDocModal({ open: true, doc: d })}
          onDocDelete={deleteDoc} onGoto={goto} />
      )}

      {tab === 'isotopes' && <IsotopesView />}

      {/* ── modals ── */}
      {sourceForm.open && (
        <SourceForm source={sourceForm.source} locations={SEED_LOCATIONS} persons={SEED_PERSONS} ruas={ruas}
          onClose={() => setSourceForm({ open: false, source: null })} onSubmit={submitSourceForm} />
      )}
      {leakFor && <LeakTestModal source={leakFor} onClose={() => setLeakFor(null)} onSubmit={r => conductLeakTest(leakFor, r)} />}
      {swipeFor && <SwipeTestModal rua={swipeFor} onClose={() => setSwipeFor(null)} onSubmit={r => conductSwipe(swipeFor, r)} />}
      {licFor && <LicenceChangeModal source={licFor} onClose={() => setLicFor(null)} onSubmit={(num, f, n) => changeLicence(licFor, num, f, n)} />}
      {puFor && <PossessUseModal source={puFor} onClose={() => setPuFor(null)} onSubmit={(num, exp, f, ser) => moveToPU(puFor, num, exp, f, ser)} />}
      {decomFor && <DecommissionModal source={decomFor} onClose={() => setDecomFor(null)} onSubmit={(a, d, v, f, n) => decommission(decomFor, a, d, v, f, n)} />}
      {usageFor && <UsageModal source={usageFor} onClose={() => setUsageFor(null)} onSubmit={r => recordUsage(usageFor, r)} />}
      {wasteModal && <WasteFormModal waste={waste} ruas={ruas} onClose={() => setWasteModal(false)} onSubmit={logWaste} />}
      {disposeFor && <DisposeModal container={disposeFor} onClose={() => setDisposeFor(null)} onSubmit={r => disposeWaste(disposeFor, r)} />}
      {docModal.open && <DocModal doc={docModal.doc} onClose={() => setDocModal({ open: false, doc: null })} onSubmit={r => saveDoc(docModal.doc, r)} />}

      {/* toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 border border-amber-600/50 text-slate-100 text-xs font-semibold rounded-lg px-4 py-3 shadow-2xl">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
