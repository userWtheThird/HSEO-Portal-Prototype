// Ionizing Radiation Safety Program — modal forms (ported from the standalone HTML workflow)

import React, { useMemo, useState } from 'react';
import type { RadiationSource, IrpRua, DoseRosterEntry, WasteContainer, BoardDocument } from '../../types';
import {
  Modal, Field, FormGrid2, ErrorBox, inpCls, selCls, BtnPrimary, BtnOutline, BtnDanger, Note
} from './ui';
import {
  todayISO, addDateDays, fmtDate, fmtUCi, doseStatusOf, nextTagNo, isoNamesOf
} from './utils';
import {
  LEAK_INTERVAL_DAYS, SWIPE_INTERVAL_DAYS, LICENCE_ALERT_MONTHS, UCII_TO_MBQ,
  WASTE_CLASSES, WASTE_FORMS, DISPOSAL_METHODS, ISOTOPE_OPTIONS, DOSIMETRY_DEPARTMENTS,
  DOSE_CAUTION_LIMIT, DOSE_CRITICAL_LIMIT
} from './constants';
import type { IrpPerson } from './seeds';

// ══════════════ LEAK TEST ══════════════
export function LeakTestModal({ source, onClose, onSubmit }: {
  source: RadiationSource; onClose: () => void;
  onSubmit: (r: { date: string; result: 'pass' | 'fail'; counts: number; background: number; notes: string }) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [result, setResult] = useState<'pass' | 'fail'>('pass');
  const [counts, setCounts] = useState('');
  const [bg, setBg] = useState('');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const net = useMemo(() => {
    const m = parseFloat(counts); const b = parseFloat(bg) || 0;
    return isNaN(m) ? '' : (m - b).toFixed(1);
  }, [counts, bg]);

  const submit = () => {
    const c = parseFloat(counts); const b = parseFloat(bg) || 0;
    if (!date || isNaN(c) || c < 0) return setErr('Test date and a non-negative measured count (cpm) are required.');
    if (result === 'fail' && !notes.trim()) return setErr('A follow-up action is required when a leak test is positive (fail).');
    onSubmit({ date, result, counts: c, background: b, notes: notes.trim() });
  };

  return (
    <Modal title={`Conduct Leak Test — ${source.sourceName || source.equipmentDescription || ''}`} icon="🧫" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Record Leak Test</BtnPrimary></>}>
      <div className="grid gap-3">
        <Note>Record the wipe/swipe count measured for this sealed source. The net count (measured − background) is the leak indicator and is stored with the result. Next test due +{LEAK_INTERVAL_DAYS} days.</Note>
        <FormGrid2>
          <Field label="Test Date" required><input type="date" className={inpCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Result" required>
            <select className={selCls} value={result} onChange={e => setResult(e.target.value as 'pass' | 'fail')}>
              <option value="pass">Pass</option><option value="fail">Fail</option>
            </select>
          </Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Measured Count (cpm)" required><input type="number" min="0" step="any" className={inpCls} value={counts} onChange={e => setCounts(e.target.value)} placeholder="e.g., 32" /></Field>
          <Field label="Background Count (cpm)"><input type="number" min="0" step="any" className={inpCls} value={bg} onChange={e => setBg(e.target.value)} placeholder="e.g., 25" /></Field>
        </FormGrid2>
        <Field label="Net Count (cpm)" hint="Measured − background, computed automatically">
          <input readOnly tabIndex={-1} className={inpCls + ' bg-slate-900'} value={net} />
        </Field>
        <Field label="Notes / Follow-up Action (required if Fail)">
          <input className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Action taken if positive, e.g., source quarantined" />
        </Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ SWIPE TEST ══════════════
export function SwipeTestModal({ rua, onClose, onSubmit }: {
  rua: IrpRua; onClose: () => void;
  onSubmit: (r: { date: string; result: 'clean' | 'positive' | 'adal'; counts: number; background: number; followUp: string }) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [result, setResult] = useState<'clean' | 'positive' | 'adal'>('clean');
  const [counts, setCounts] = useState('');
  const [bg, setBg] = useState('');
  const [follow, setFollow] = useState('');
  const [err, setErr] = useState('');
  const net = useMemo(() => {
    const m = parseFloat(counts); const b = parseFloat(bg) || 0;
    return isNaN(m) ? '' : (m - b).toFixed(1);
  }, [counts, bg]);

  const submit = () => {
    const c = parseFloat(counts); const b = parseFloat(bg) || 0;
    if (!date || isNaN(c) || c < 0) return setErr('Test date and a non-negative measured count (cpm) are required.');
    if (result !== 'clean' && !follow.trim()) return setErr('A follow-up action is required when the swipe result is positive or above ADAL.');
    onSubmit({ date, result, counts: c, background: b, followUp: follow.trim() });
  };

  return (
    <Modal title={`Conduct Swipe Test — ${rua.spaceID}`} icon="🧫" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Record Swipe Test</BtnPrimary></>}>
      <div className="grid gap-3">
        <Note>Record the swipe survey count for this room. Net count (measured − background) supports the result classification — flag results that are positive or above ADAL. Next test due +{SWIPE_INTERVAL_DAYS} days.</Note>
        <FormGrid2>
          <Field label="Test Date" required><input type="date" className={inpCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Result" required>
            <select className={selCls} value={result} onChange={e => setResult(e.target.value as 'clean' | 'positive' | 'adal')}>
              <option value="clean">Clean</option><option value="positive">Positive</option><option value="adal">Above ADAL</option>
            </select>
          </Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Measured Count (cpm)" required><input type="number" min="0" step="any" className={inpCls} value={counts} onChange={e => setCounts(e.target.value)} placeholder="e.g., 28" /></Field>
          <Field label="Background Count (cpm)"><input type="number" min="0" step="any" className={inpCls} value={bg} onChange={e => setBg(e.target.value)} placeholder="e.g., 25" /></Field>
        </FormGrid2>
        <Field label="Net Count (cpm)" hint="Measured − background, computed automatically">
          <input readOnly tabIndex={-1} className={inpCls + ' bg-slate-900'} value={net} />
        </Field>
        <Field label="Follow-up Action (required if Positive / Above ADAL)">
          <input className={inpCls} value={follow} onChange={e => setFollow(e.target.value)} placeholder="e.g., area decontaminated and re-surveyed" />
        </Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ LICENCE CHANGE ══════════════
export function LicenceChangeModal({ source, onClose, onSubmit }: {
  source: RadiationSource; onClose: () => void;
  onSubmit: (num: string, fileName: string, notes: string) => void;
}) {
  const [num, setNum] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!num.trim()) return setErr('New licence number is required.');
    onSubmit(num.trim(), file ? file.name : '', notes.trim());
  };
  return (
    <Modal title="Change Licence Number" icon="📜" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Save Change</BtnPrimary></>}>
      <div className="grid gap-3">
        <Note>Current: <span className="font-mono text-slate-200">{source.licenceNumber || '—'}</span> — the change is recorded in the licence audit trail.</Note>
        <Field label="New Licence Number" required><input className={inpCls} value={num} onChange={e => setNum(e.target.value)} placeholder="XA-2026-XXXX" /></Field>
        <Field label="New Licence Document (PDF)"><input type="file" accept=".pdf" className={inpCls} onChange={e => setFile(e.target.files && e.target.files[0] || null)} /></Field>
        <Field label="Notes"><textarea rows={2} className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason for change, e.g., annual renewal" /></Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ IA LIFECYCLE: POSSESS → POSSESS & USE ══════════════
export function PossessUseModal({ source, onClose, onSubmit }: {
  source: RadiationSource; onClose: () => void;
  onSubmit: (num: string, expiry: string, fileName: string, serials: string) => void;
}) {
  const [num, setNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [serials, setSerials] = useState(source.xrayTubeSerialNumbers || '');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!num.trim() || !expiry) return setErr('Licence number and expiry date are required.');
    const fname = file ? file.name : '';
    if (fname && !fname.toLowerCase().endsWith('.pdf')) return setErr('Licence document must be a PDF file.');
    onSubmit(num.trim(), expiry, fname, serials.trim());
  };
  return (
    <Modal title="Change to Possess & Use Licence" icon="⚙" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Save Change</BtnPrimary></>}>
      <div className="grid gap-3">
        <Note>Equipment installed — the possess licence ({source.licenceNumber || '—'}) is archived and replaced by the possess &amp; use licence. The annual renewal cycle and annual checks begin.</Note>
        <FormGrid2>
          <Field label="Possess & Use Licence Number" required><input className={inpCls} value={num} onChange={e => setNum(e.target.value)} placeholder="XA-2026-XXXX" /></Field>
          <Field label="Expiry Date" required><input type="date" className={inpCls} value={expiry} onChange={e => setExpiry(e.target.value)} /></Field>
        </FormGrid2>
        <Field label="New Licence Document (PDF)" hint="Leave empty to keep the current file on record.">
          <input type="file" accept=".pdf" className={inpCls} onChange={e => setFile(e.target.files && e.target.files[0] || null)} />
        </Field>
        <Field label="X-ray Tube Serial Number(s)" hint="Now known after installation — comma-separated if multiple tubes.">
          <input className={inpCls} value={serials} onChange={e => setSerials(e.target.value)} />
        </Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ IA LIFECYCLE: DECOMMISSION ══════════════
export function DecommissionModal({ source, onClose, onSubmit }: {
  source: RadiationSource; onClose: () => void;
  onSubmit: (approvalDate: string, destroyedDate: string, verifiedDate: string, fileName: string, notes: string) => void;
}) {
  const [a, setA] = useState(''); const [d, setD] = useState(''); const [v, setV] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!a || !d || !v) return setErr('Approval, destruction and Board verification dates are all required.');
    if (!file) return setErr('The Board-approved disposal document (PDF) is required.');
    if (!file.name.toLowerCase().endsWith('.pdf')) return setErr('Disposal approval document must be a PDF file.');
    onSubmit(a, d, v, file.name, notes.trim());
  };
  return (
    <Modal title={`Decommission — ${source.equipmentDescription || source.sourceName || ''}`} icon="🗑" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnDanger onClick={submit}>Decommission &amp; Remove Licence</BtnDanger></>}>
      <div className="grid gap-3">
        <Note>Disposal sequence: Board approval → X-ray tubes destroyed → Board verification → licence removed. The record is kept for audit but leaves the active compliance counts.</Note>
        <FormGrid2>
          <Field label="Disposal Approval Date" required><input type="date" className={inpCls} value={a} onChange={e => setA(e.target.value)} /></Field>
          <Field label="Tubes Destroyed Date" required><input type="date" className={inpCls} value={d} onChange={e => setD(e.target.value)} /></Field>
        </FormGrid2>
        <Field label="Board Verification Date" required><input type="date" className={inpCls} value={v} onChange={e => setV(e.target.value)} /></Field>
        <Field label="Disposal Approval Document (PDF)" required hint="The Board-approved IA disposal document.">
          <input type="file" accept=".pdf" className={inpCls} onChange={e => setFile(e.target.files && e.target.files[0] || null)} />
        </Field>
        <Field label="Notes"><textarea rows={2} className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Approval reference, destruction contractor, Board letter ref…" /></Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ UNSEALED CONSUMPTION ══════════════
export function UsageModal({ source, onClose, onSubmit }: {
  source: RadiationSource; onClose: () => void;
  onSubmit: (r: { date: string; volume?: string; activityUCi: number; by?: string; notes?: string }) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [volume, setVolume] = useState('');
  const [uci, setUci] = useState('');
  const [by, setBy] = useState('');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    const u = parseFloat(uci);
    if (!date || !(u > 0)) return setErr('Date and a positive spent activity (µCi) are required.');
    onSubmit({ date, volume: volume.trim() || undefined, activityUCi: u, by: by.trim() || undefined, notes: notes.trim() || undefined });
  };
  return (
    <Modal title={`Record Consumption — ${source.sourceName || ''}`} icon="🧪" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Save Consumption</BtnPrimary></>}>
      <div className="grid gap-3">
        <Note>Log isotope spent from this stock. Entries feed the quarterly report.</Note>
        <FormGrid2>
          <Field label="Date" required><input type="date" className={inpCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Volume Used"><input className={inpCls} value={volume} onChange={e => setVolume(e.target.value)} placeholder="e.g., 0.5 mL" /></Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Activity Spent (µCi)" required><input type="number" min="0" step="any" className={inpCls} value={uci} onChange={e => setUci(e.target.value)} placeholder="micro-Ci" /></Field>
          <Field label="Spent By"><input className={inpCls} value={by} onChange={e => setBy(e.target.value)} placeholder="Name" /></Field>
        </FormGrid2>
        <Field label="Notes"><textarea rows={2} className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Experiment / purpose" /></Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ DOSIMETRY ROSTER ══════════════
export function RosterModal({ entry, persons, onClose, onSubmit }: {
  entry: DoseRosterEntry | null; persons: IrpPerson[]; onClose: () => void;
  onSubmit: (r: { name: string; department: string; isotopes: string[]; tld: boolean; ring: boolean; notes?: string }) => void;
}) {
  const [name, setName] = useState(entry ? entry.name : '');
  const [dept, setDept] = useState(entry && entry.department ? entry.department : DOSIMETRY_DEPARTMENTS[0]);
  const [isos, setIsos] = useState<string[]>(entry ? (entry.isotopes || []) : []);
  const [tld, setTld] = useState(entry ? entry.tld : true);
  const [ring, setRing] = useState(entry ? entry.ring : false);
  const [notes, setNotes] = useState(entry && entry.notes ? entry.notes : '');
  const [err, setErr] = useState('');
  const depts = [...new Set([...DOSIMETRY_DEPARTMENTS, 'HSEO', ...(entry && entry.department ? [entry.department] : [])])];
  const isoChecks = ISOTOPE_OPTIONS.filter(i => i !== 'Other');
  const submit = () => {
    if (!name.trim()) return setErr('Name is required.');
    if (!tld && !ring) return setErr('Select at least one dosimeter type — TLD and/or finger ring.');
    onSubmit({ name: name.trim(), department: dept, isotopes: isos, tld, ring, notes: notes.trim() || undefined });
  };
  return (
    <Modal title={`${entry ? 'Edit' : 'Add'} Monitored Person`} icon="🪪" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>{entry ? 'Save Changes' : 'Add to Roster'}</BtnPrimary></>}>
      <div className="grid gap-3">
        <FormGrid2>
          <Field label="Name" required>
            <input className={inpCls} list="rfNames" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
            <datalist id="rfNames">{persons.map(p => <option key={p.id} value={p.name} />)}</datalist>
          </Field>
          <Field label="Department" required>
            <select className={selCls} value={dept} onChange={e => setDept(e.target.value)}>{depts.map(d => <option key={d}>{d}</option>)}</select>
          </Field>
        </FormGrid2>
        <Field label="Isotopes Handled">
          <div className="flex flex-wrap gap-x-3.5 gap-y-2 py-1">
            {isoChecks.map(i => (
              <label key={i} className="inline-flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
                <input type="checkbox" checked={isos.includes(i)} onChange={e => setIsos(e.target.checked ? [...isos, i] : isos.filter(x => x !== i))} /> {i}
              </label>
            ))}
          </div>
        </Field>
        <FormGrid2>
          <label className="inline-flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={tld} onChange={e => setTld(e.target.checked)} /> Whole-body TLD badge</label>
          <label className="inline-flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={ring} onChange={e => setRing(e.target.checked)} /> Finger ring dosimeter</label>
        </FormGrid2>
        <Field label="Notes"><input className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., quarterly TLD exchange; reissued after investigation" /></Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ ABNORMAL DOSE READING ══════════════
export function DoseFormCard({ defaultDept, defaultMonth, onSubmit }: {
  defaultDept: string; defaultMonth: string;
  onSubmit: (r: { name: string; department: string; month: string; exposure: number; remarks: string }) => boolean;
}) {
  const [name, setName] = useState('');
  const [dept, setDept] = useState(defaultDept);
  const [month, setMonth] = useState(defaultMonth);
  const [dose, setDose] = useState('');
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    const v = parseFloat(dose);
    if (!name.trim()) return setErr('Name is required.');
    if (!month) return setErr('Month is required.');
    if (isNaN(v) || v < 0) return setErr('Enter a valid exposure reading.');
    if (onSubmit({ name: name.trim(), department: dept, month, exposure: v, remarks: remarks.trim() })) {
      setName(''); setDose(''); setRemarks(''); setErr('');
    }
  };
  return (
    <div className="grid gap-3">
      <FormGrid2>
        <Field label="Name" required><input className={inpCls} value={name} onChange={e => setName(e.target.value)} placeholder="Full name (staff or student)" /></Field>
        <Field label="Department" required>
          <select className={selCls} value={dept} onChange={e => setDept(e.target.value)}>{DOSIMETRY_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select>
        </Field>
      </FormGrid2>
      <FormGrid2>
        <Field label="Month" required><input type="month" className={inpCls} value={month} onChange={e => setMonth(e.target.value)} /></Field>
        <Field label="Reading (mSv)" required><input type="number" step="0.1" min="0" className={inpCls} value={dose} onChange={e => setDose(e.target.value)} placeholder="0.0" /></Field>
      </FormGrid2>
      <Field label="Remarks — Action Taken">
        <textarea rows={3} className={inpCls} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g., work suspended pending investigation; shielding added; retraining completed…" />
      </Field>
      <Note>Status is classified automatically: &lt; {DOSE_CAUTION_LIMIT.toFixed(1)} normal · {DOSE_CAUTION_LIMIT.toFixed(1)}–{(DOSE_CRITICAL_LIMIT - 0.1).toFixed(1)} caution · ≥ {DOSE_CRITICAL_LIMIT.toFixed(1)} critical (mSv).</Note>
      <ErrorBox msg={err} />
      <BtnPrimary onClick={submit} className="w-full">Log Abnormal Reading</BtnPrimary>
    </div>
  );
}

// ══════════════ WASTE COLLECTION ══════════════
export function WasteFormModal({ waste, ruas, onClose, onSubmit }: {
  waste: WasteContainer[]; ruas: IrpRua[]; onClose: () => void;
  onSubmit: (w: { tagNo: string; wasteClass: WasteContainer['wasteClass']; form: WasteContainer['form']; isotope: string; activityUCi: number; department: string; spaceID: string; collectedDate: string; collectedBy?: string; notes?: string }) => void;
}) {
  const [tag, setTag] = useState(nextTagNo(waste));
  const [date, setDate] = useState(todayISO());
  const [wClass, setWClass] = useState<WasteContainer['wasteClass']>('Alpha');
  const [form, setForm] = useState<WasteContainer['form']>('Solid');
  const [iso, setIso] = useState(ISOTOPE_OPTIONS[0]);
  const [ruaId, setRuaId] = useState('');
  const [uci, setUci] = useState('');
  const [mbq, setMbq] = useState('');
  const [by, setBy] = useState('Marcus Chen');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const rua = ruas.find(u => u.id === ruaId);

  const submit = () => {
    const v = parseFloat(uci);
    if (!tag.trim()) return setErr('Tag number is required.');
    if (waste.some(w => w.tagNo === tag.trim())) return setErr('Tag number ' + tag.trim() + ' is already in use — each container tag must be unique.');
    if (!date) return setErr('Collection date is required.');
    if (!rua) return setErr('Select the RUA (department / location) the waste was collected from.');
    if (isNaN(v) || v < 0) return setErr('Enter a valid estimated activity in µCi or MBq.');
    const auth = [...new Set((rua.groups || []).flatMap(g => isoNamesOf(g)))];
    if (!auth.includes(iso)) return setErr(iso + ' is not authorized in the RUA for ' + rua.spaceID + '. Authorized isotopes: ' + (auth.join(', ') || 'none') + '. Update the RUA first.');
    onSubmit({ tagNo: tag.trim(), wasteClass: wClass, form, isotope: iso, activityUCi: v, department: rua.department, spaceID: rua.spaceID, collectedDate: date, collectedBy: by.trim() || undefined, notes: notes.trim() || undefined });
  };

  return (
    <Modal title="Log Waste Collection" icon="🛢" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Log Collection</BtnPrimary></>}>
      <div className="grid gap-3">
        <FormGrid2>
          <Field label="Tag No." required><input className={inpCls + ' font-mono'} value={tag} onChange={e => setTag(e.target.value)} /></Field>
          <Field label="Collection Date" required><input type="date" className={inpCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Waste Class" required hint="Alpha · Beta · Gamma">
            <select className={selCls} value={wClass} onChange={e => setWClass(e.target.value as WasteContainer['wasteClass'])}>{WASTE_CLASSES.map(c => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Physical Form" required>
            <select className={selCls} value={form} onChange={e => setForm(e.target.value as WasteContainer['form'])}>{WASTE_FORMS.map(f => <option key={f}>{f}</option>)}</select>
          </Field>
        </FormGrid2>
        <Field label="Isotope" required hint="Containers are segregated by isotope">
          <select className={selCls} value={iso} onChange={e => setIso(e.target.value)}>{ISOTOPE_OPTIONS.map(i => <option key={i}>{i}</option>)}</select>
        </Field>
        <Field label="Collected From (RUA)" required hint="Department & location are taken from the RUA register">
          <select className={selCls} value={ruaId} onChange={e => setRuaId(e.target.value)}>
            <option value="">— Select RUA (location / department) —</option>
            {ruas.map(u => <option key={u.id} value={u.id}>{u.spaceID} — {u.department}{u.type === 'Individual' && u.personInCharge ? ' (' + u.personInCharge + ')' : ''}</option>)}
          </select>
        </Field>
        <FormGrid2>
          <Field label="Department"><input readOnly className={inpCls + ' opacity-60'} value={rua ? rua.department : ''} placeholder="Auto-filled from RUA" /></Field>
          <Field label="Location (Space ID)"><input readOnly className={inpCls + ' opacity-60'} value={rua ? rua.spaceID : ''} placeholder="Auto-filled from RUA" /></Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Estimated Activity (µCi)" required>
            <input type="number" step="0.01" min="0" className={inpCls} value={uci} placeholder="0.00"
              onChange={e => { setUci(e.target.value); const v = parseFloat(e.target.value); setMbq(isNaN(v) ? '' : (v * UCII_TO_MBQ).toFixed(4)); }} />
          </Field>
          <Field label="Estimated Activity (MBq)">
            <input type="number" step="0.0001" min="0" className={inpCls} value={mbq} placeholder="0.0000"
              onChange={e => { setMbq(e.target.value); const v = parseFloat(e.target.value); setUci(isNaN(v) ? '' : (v / UCII_TO_MBQ).toFixed(2)); }} />
          </Field>
        </FormGrid2>
        <Note>Enter either unit — the other converts automatically (1 µCi = {UCII_TO_MBQ} MBq).</Note>
        <FormGrid2>
          <Field label="Collected By"><input className={inpCls} value={by} onChange={e => setBy(e.target.value)} /></Field>
          <Field label="Notes"><input className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., scintillation vials, gloves" /></Field>
        </FormGrid2>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ WASTE DISPOSAL ══════════════
export function DisposeModal({ container, onClose, onSubmit }: {
  container: WasteContainer; onClose: () => void;
  onSubmit: (r: { disposedDate: string; disposalMethod: string; disposedBy?: string; disposalNotes?: string }) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState(DISPOSAL_METHODS[0]);
  const [by, setBy] = useState('Marcus Chen');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!date) return setErr('Disposal date is required.');
    if ((container.collectedDate || '') && date < container.collectedDate) return setErr('Disposal date cannot be before the collection date (' + container.collectedDate + ').');
    onSubmit({ disposedDate: date, disposalMethod: method, disposedBy: by.trim() || undefined, disposalNotes: notes.trim() || undefined });
  };
  return (
    <Modal title={<>Record Disposal — <span className="font-mono">{container.tagNo}</span></>} icon="📤" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>Record Disposal</BtnPrimary></>}>
      <div className="grid gap-3">
        <Note>{container.wasteClass} · {container.form} · {container.isotope} · {(container.activityUCi || 0).toFixed(2)} µCi ({((container.activityUCi || 0) * UCII_TO_MBQ).toFixed(4)} MBq) · collected {fmtDate(container.collectedDate)} from {container.spaceID}</Note>
        <FormGrid2>
          <Field label="Disposal Date" required><input type="date" className={inpCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Disposal Method" required>
            <select className={selCls} value={method} onChange={e => setMethod(e.target.value)}>{DISPOSAL_METHODS.map(m => <option key={m}>{m}</option>)}</select>
          </Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Disposed By"><input className={inpCls} value={by} onChange={e => setBy(e.target.value)} /></Field>
          <Field label="Notes"><input className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., manifest no., contractor name" /></Field>
        </FormGrid2>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// ══════════════ BOARD CORRESPONDENCE ══════════════
export function DocModal({ doc, onClose, onSubmit }: {
  doc: BoardDocument | null; onClose: () => void;
  onSubmit: (r: { date: string; direction: 'Sent' | 'Received'; subject: string; relatesTo?: string; fileName?: string; notes?: string }) => void;
}) {
  const [date, setDate] = useState(doc ? doc.date : todayISO());
  const [dir, setDir] = useState<'Sent' | 'Received'>(doc ? doc.direction : 'Sent');
  const [subject, setSubject] = useState(doc ? doc.subject : '');
  const [relates, setRelates] = useState(doc && doc.relatesTo ? doc.relatesTo : '');
  const [fileName, setFileName] = useState(doc && doc.fileName ? doc.fileName : '');
  const [notes, setNotes] = useState(doc && doc.notes ? doc.notes : '');
  const [err, setErr] = useState('');
  const submit = () => {
    if (!date) return setErr('Date is required.');
    if (!subject.trim()) return setErr('Subject is required.');
    onSubmit({ date, direction: dir, subject: subject.trim(), relatesTo: relates.trim() || undefined, fileName: fileName.trim() || undefined, notes: notes.trim() || undefined });
  };
  return (
    <Modal title={`${doc ? 'Edit' : 'Log'} Radiation Board Correspondence`} icon="✉️" onClose={onClose}
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>{doc ? 'Save Changes' : 'Log Correspondence'}</BtnPrimary></>}>
      <div className="grid gap-3">
        <FormGrid2>
          <Field label="Date" required><input type="date" className={inpCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Direction" required>
            <select className={selCls} value={dir} onChange={e => setDir(e.target.value as 'Sent' | 'Received')}><option>Sent</option><option>Received</option></select>
          </Field>
        </FormGrid2>
        <Field label="Subject" required><input className={inpCls} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Licence renewal application — sealed sources" /></Field>
        <FormGrid2>
          <Field label="Relates To"><input className={inpCls + ' font-mono'} value={relates} onChange={e => setRelates(e.target.value)} placeholder="Licence no. / Space ID" /></Field>
          <Field label="PDF File Name"><input className={inpCls + ' font-mono'} value={fileName} onChange={e => setFileName(e.target.value)} placeholder="letter_2026.pdf" /></Field>
        </FormGrid2>
        <Field label="Notes"><input className={inpCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., submitted with annual return" /></Field>
        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}

// keep doseStatusOf referenced for consumers classifying readings
export { doseStatusOf };
