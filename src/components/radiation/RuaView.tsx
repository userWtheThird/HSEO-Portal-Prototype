// Ionizing Radiation Safety Program — Room Use Authorization (RUA) tab
// Card grid + detail panel + full-width inline editor with PI groups & per-isotope use entries.

import React, { useState } from 'react';
import type { IrpRua, IrpRuaGroup, IsotopeUseEntry } from '../../types';
import {
  Card, SectionTitle, Note, Empty, Badge, KV, HistoryList,
  BtnPrimary, BtnOutline, BtnGreen, IconBtn, Field, FormGrid2, ErrorBox,
  tblWrap, tbl, th, td, inpCls, selCls, mono
} from './ui';
import {
  uid, todayISO, fmtDate, addYearISO, ruaExpiryState, nextRuaNo,
  isoEntries, swipeEntryText, daysUntil
} from './utils';
import { ISOTOPE_OPTIONS, SAFETY_CONTROLS, RUA_PHYSICAL_FORMS, SWIPE_INTERVAL_DAYS } from './constants';
import type { IrpLocation, IrpPerson } from './seeds';

export interface RuaViewProps {
  ruas: IrpRua[];
  locations: IrpLocation[];
  persons: IrpPerson[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onEdit: (u: IrpRua) => void;
  onDelete: (u: IrpRua) => void;
  onRenew: (u: IrpRua) => void;
  onSwipe: (u: IrpRua) => void;
}

export function RuaView(p: RuaViewProps) {
  const { ruas, selectedId } = p;
  const sel = ruas.find(u => u.id === selectedId) || null;
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <Note>Each room using unsealed radioactive material holds a Room Use Authorization, renewed annually. Isotopes, quantities and authorized users are recorded per PI group.</Note>
        <BtnPrimary onClick={p.onNew}>+ New Authorization</BtnPrimary>
      </div>
      <div className={`grid gap-4 ${sel ? 'xl:grid-cols-[1fr_400px]' : ''}`}>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3 content-start">
          {ruas.length === 0 && <Card><Empty icon="📋">No Room Use Authorizations registered.</Empty></Card>}
          {ruas.map(u => {
            const exp = ruaExpiryState(u);
            const isoSet = [...new Set((u.groups || []).flatMap(g => isoEntries(g).map(e => e.iso)))];
            const userCount = (u.groups || []).reduce((a, g) => a + (g.users || []).length, 0);
            return (
              <Card key={u.id} className={`p-4 grid gap-2 cursor-pointer transition-colors hover:border-slate-600 ${sel && sel.id === u.id ? 'border-amber-600/60 bg-amber-500/5' : ''}`}
                onClick={() => p.onSelect(sel && sel.id === u.id ? null : u.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={mono + ' text-xs font-bold text-slate-200'}>{u.ruaNo || '—'}</span>
                  <Badge kind={u.type === 'Communal' ? 'communal' : 'individual'}>{u.type}</Badge>
                </div>
                <div className="text-sm font-bold text-slate-100">{u.spaceID} <span className="text-slate-500 font-medium">· {u.department}</span></div>
                {u.type === 'Individual' && u.personInCharge && <div className="text-[11px] text-slate-400">In charge: {u.personInCharge}</div>}
                <div className="flex flex-wrap gap-1">{isoSet.map(i => <Badge key={i} kind="mute">{i}</Badge>)}</div>
                <div className="text-[11px] text-slate-500">{(u.groups || []).length} PI group{(u.groups || []).length === 1 ? '' : 's'} · {userCount} authorized user{userCount === 1 ? '' : 's'}</div>
                <div><Badge kind={exp.color}>{exp.label}</Badge></div>
              </Card>
            );
          })}
        </div>
        {sel && <RuaDetail u={sel} {...p} />}
      </div>
    </div>
  );
}

function RuaDetail({ u, ...p }: RuaViewProps & { u: IrpRua }) {
  const exp = ruaExpiryState(u);
  const swDue = u.nextSwipeTest ? daysUntil(u.nextSwipeTest) <= 0 : false;
  return (
    <div className="grid gap-3 content-start">
      <Card className="p-4 grid gap-3">
        <div className="flex items-center justify-between">
          <span className={mono + ' text-sm font-bold text-slate-100'}>{u.ruaNo || '—'}</span>
          <Badge kind={u.type === 'Communal' ? 'communal' : 'individual'}>{u.type}</Badge>
        </div>
        <KV k="Space">{u.spaceID} · {u.department}</KV>
        {u.personInCharge && <KV k="Person in charge">{u.personInCharge}</KV>}
        <KV k="Added">{fmtDate(u.addedDate)}</KV>
        <KV k="Last renewed">{u.renewedDate ? fmtDate(u.renewedDate) : '—'}</KV>
        <KV k="Expiry"><Badge kind={exp.color}>{exp.label}</Badge></KV>
        <div className="flex gap-2">
          <BtnGreen onClick={() => p.onRenew(u)} className="flex-1">↻ Renew (annual)</BtnGreen>
        </div>
        <div className="flex gap-2">
          <BtnOutline onClick={() => p.onEdit(u)} className="flex-1">✎ Edit</BtnOutline>
          <BtnOutline onClick={() => p.onDelete(u)} className="flex-1 !border-red-800 !text-red-400 hover:!border-red-500">🗑 Delete</BtnOutline>
        </div>
      </Card>

      <Card className="p-4 grid gap-3">
        <SectionTitle>Authorized PI Groups</SectionTitle>
        {(u.groups || []).length === 0 && <Note>No PI groups recorded.</Note>}
        {(u.groups || []).map(g => (
          <div key={g.id} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 grid gap-2">
            <div className="text-xs font-bold text-slate-100">{g.piName || '—'} <span className="text-slate-500 font-medium">(PI)</span></div>
            <div className={tblWrap}>
              <table className={tbl}>
                <thead><tr><th className={th}>Isotope</th><th className={th}>Limit (µCi)</th><th className={th}>Experimental</th><th className={th}>Possession</th></tr></thead>
                <tbody>
                  {isoEntries(g).map((e, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        <td className={td + ' ' + mono + ' font-semibold text-slate-200'}>{e.iso}</td>
                        <td className={td + ' ' + mono}>{e.limit ? e.limit.toLocaleString('en-US') : '—'}</td>
                        <td className={td + ' ' + mono}>{e.expUCi ? e.expUCi.toLocaleString('en-US') : '—'}</td>
                        <td className={td + ' ' + mono}>{e.possUCi ? e.possUCi.toLocaleString('en-US') : '—'}</td>
                      </tr>
                      {(e.physicalForm || e.chemicalForm || e.description) && (
                        <tr><td className={td + ' text-[10px] text-slate-500 border-t-0'} colSpan={4}>
                          {[e.physicalForm, e.chemicalForm, e.description].filter(Boolean).join(' · ')}
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {(g.users || []).length > 0 && (
              <div className="flex flex-wrap gap-1">{(g.users || []).map(usr => <Badge key={usr.id + usr.name} kind="mute">{usr.name} · {usr.role}</Badge>)}</div>
            )}
          </div>
        ))}
      </Card>

      <Card className="p-4 grid gap-2">
        <SectionTitle>Safety Controls</SectionTitle>
        <div className="flex flex-wrap gap-1">{(u.safetyControls || []).map(c => <Badge key={c} kind="ok">{c}</Badge>)}</div>
      </Card>

      <Card className={`p-4 grid gap-3 ${swDue ? 'border-red-500/50' : ''}`}>
        <SectionTitle>Swipe Test ({SWIPE_INTERVAL_DAYS}-day cycle)</SectionTitle>
        <KV k="Last swipe">{fmtDate(u.lastSwipeTest)}</KV>
        <KV k="Next due">{u.nextSwipeTest ? <span className={swDue ? 'text-red-400 font-semibold' : 'text-slate-300'}>{fmtDate(u.nextSwipeTest)}{swDue ? ' — OVERDUE' : ' (' + daysUntil(u.nextSwipeTest) + 'd)'}</span> : '—'}</KV>
        <HistoryList items={[...(u.swipeHistory || [])].reverse().slice(0, 8).map((x, i) => <span key={i}>{typeof x === 'string' ? x : swipeEntryText(x)}</span>)} />
        <BtnPrimary onClick={() => p.onSwipe(u)}>🧫 Conduct Swipe Test</BtnPrimary>
      </Card>

      <Card className="p-4 grid gap-2">
        <SectionTitle>Change History</SectionTitle>
        <HistoryList items={[...(u.changeHistory || [])].reverse().map(h => (
          <span key={h.id}><span className="text-slate-200 font-semibold">{fmtDate(h.date)}</span>{h.changes.map((c, i) => <span key={i}><br />· {c}</span>)}</span>
        ))} />
      </Card>
    </div>
  );
}

// ══════════════ INLINE EDITOR ══════════════

interface GroupDraft {
  id: string; piId: string; piName: string; usersText: string;
  entries: IsotopeUseEntry[];
}
const emptyEntry = (): IsotopeUseEntry => ({ iso: ISOTOPE_OPTIONS[0], description: '', limit: 0, chemicalForm: '', physicalForm: RUA_PHYSICAL_FORMS[0], expUCi: 0, possUCi: 0 });

export function RuaEditor({ rua, ruas, locations, persons, onSave, onCancel }: {
  rua: IrpRua | null; ruas: IrpRua[]; locations: IrpLocation[]; persons: IrpPerson[];
  onSave: (u: IrpRua, isNew: boolean) => void; onCancel: () => void;
}) {
  const isNew = !rua;
  const [ruaNo, setRuaNo] = useState(rua && rua.ruaNo ? rua.ruaNo : '');
  const [spaceID, setSpaceID] = useState(rua ? rua.spaceID : (locations[0] ? locations[0].spaceID : ''));
  const [type, setType] = useState<'Communal' | 'Individual'>(rua ? rua.type : 'Communal');
  const [pic, setPic] = useState(rua && rua.personInCharge ? rua.personInCharge : '');
  const [expiry, setExpiry] = useState(rua && rua.expiryDate ? rua.expiryDate : addYearISO());
  const [controls, setControls] = useState<string[]>(rua && rua.safetyControls ? [...rua.safetyControls] : []);
  const [groups, setGroups] = useState<GroupDraft[]>(rua && rua.groups && rua.groups.length ? rua.groups.map(g => ({
    id: g.id, piId: g.piId, piName: g.piName,
    usersText: (g.users || []).map(u => u.name + ' (' + u.role + ')').join('\n'),
    entries: isoEntries(g).map(e => ({ ...e }))
  })) : [{ id: uid('g'), piId: '', piName: '', usersText: '', entries: [emptyEntry()] }]);
  const [err, setErr] = useState('');

  const pis = persons.filter(x => x.role === 'PI');
  const loc = locations.find(l => l.spaceID === spaceID);
  const suggestedNo = nextRuaNo(ruas);

  const patchGroup = (i: number, fn: (g: GroupDraft) => GroupDraft) =>
    setGroups(cur => cur.map((g, j) => j === i ? fn({ ...g }) : g));
  const patchEntry = (gi: number, ei: number, patch: Partial<IsotopeUseEntry>) =>
    patchGroup(gi, g => { const entries = g.entries.map((e, j) => j === ei ? { ...e, ...patch } : e); return { ...g, entries }; });

  const toggleControl = (c: string) => setControls(cur => cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c]);

  const save = () => {
    if (!spaceID) return setErr('Select the room (Space ID).');
    if (type === 'Individual' && !pic.trim()) return setErr('Individual RUAs require a person in charge.');
    const cleanGroups: IrpRuaGroup[] = [];
    for (const g of groups) {
      const entries = g.entries.filter(e => e.iso);
      if (!g.piId || entries.length === 0) continue;
      const users = g.usersText.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const m = l.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
        return { id: uid('u'), name: m ? m[1].trim() : l, role: m ? m[2].trim() : 'Staff' };
      });
      cleanGroups.push({ id: g.id, piId: g.piId, piName: g.piName, isotopes: entries, users });
    }
    if (cleanGroups.length === 0) return setErr('At least one PI group with a PI and at least one isotope is required.');
    if (controls.length === 0) return setErr('Select at least one safety control.');
    const out: IrpRua = {
      id: rua ? rua.id : uid('rua'),
      ruaNo: ruaNo.trim() || suggestedNo,
      spaceID, type,
      department: loc ? loc.department : (rua ? rua.department : ''),
      personInCharge: type === 'Individual' ? pic.trim() : undefined,
      expiryDate: expiry || addYearISO(),
      addedDate: rua ? rua.addedDate : todayISO(),
      renewedDate: rua ? rua.renewedDate : undefined,
      lastSwipeTest: rua ? rua.lastSwipeTest : undefined,
      nextSwipeTest: rua ? rua.nextSwipeTest : undefined,
      swipeHistory: rua ? rua.swipeHistory : [],
      safetyControls: controls,
      groups: cleanGroups,
      changeHistory: rua ? rua.changeHistory : [{ id: uid('rh'), date: todayISO(), changes: ['Authorization created'] }]
    };
    onSave(out, isNew);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-100">📋 {isNew ? 'New Room Use Authorization' : 'Edit RUA — ' + (rua!.ruaNo || rua!.spaceID)}</h3>
        <div className="flex gap-2">
          <BtnOutline onClick={onCancel}>Cancel</BtnOutline>
          <BtnPrimary onClick={save}>{isNew ? 'Create Authorization' : 'Save Changes'}</BtnPrimary>
        </div>
      </div>

      <Card className="p-4 grid gap-3">
        <FormGrid2>
          <Field label="RUA Number" hint="Leave empty to auto-assign the next number">
            <input className={inpCls + ' font-mono'} value={ruaNo} onChange={e => setRuaNo(e.target.value)} placeholder={suggestedNo} />
          </Field>
          <Field label="Room (Space ID)" required hint={loc ? loc.building + ' ' + loc.roomNumber + ' — ' + loc.department : ''}>
            <select className={selCls} value={spaceID} onChange={e => setSpaceID(e.target.value)}>
              {locations.map(l => <option key={l.id} value={l.spaceID}>{l.spaceID} — {l.department}</option>)}
            </select>
          </Field>
        </FormGrid2>
        <FormGrid2>
          <Field label="Type" required>
            <select className={selCls} value={type} onChange={e => setType(e.target.value as 'Communal' | 'Individual')}>
              <option value="Communal">Communal — shared facility room</option>
              <option value="Individual">Individual — single research group</option>
            </select>
          </Field>
          <Field label="Expiry Date" required hint="Renewed annually">
            <input type="date" className={inpCls} value={expiry} onChange={e => setExpiry(e.target.value)} />
          </Field>
        </FormGrid2>
        {type === 'Individual' && (
          <Field label="Person in Charge" required>
            <input className={inpCls} list="rePersons" value={pic} onChange={e => setPic(e.target.value)} placeholder="Responsible researcher" />
            <datalist id="rePersons">{persons.map(x => <option key={x.id} value={x.name} />)}</datalist>
          </Field>
        )}
      </Card>

      <div className="grid gap-3">
        {groups.map((g, gi) => (
          <Card key={g.id} className="p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <SectionTitle>PI Group {gi + 1}</SectionTitle>
              {groups.length > 1 && <IconBtn danger title="Remove group" onClick={() => setGroups(cur => cur.filter((_, j) => j !== gi))}>🗑</IconBtn>}
            </div>
            <FormGrid2>
              <Field label="Principal Investigator" required>
                <select className={selCls} value={g.piId} onChange={e => {
                  const pi = pis.find(x => x.id === e.target.value);
                  patchGroup(gi, x => ({ ...x, piId: e.target.value, piName: pi ? pi.name : '' }));
                }}>
                  <option value="">— Select PI —</option>
                  {pis.map(x => <option key={x.id} value={x.id}>{x.name} — {x.department}</option>)}
                </select>
              </Field>
              <Field label="Group Users" hint="One per line: Name (Role)">
                <textarea rows={3} className={inpCls} value={g.usersText} onChange={e => patchGroup(gi, x => ({ ...x, usersText: e.target.value }))}
                  placeholder={'Alice Wong (Student)\nJames Ho (Staff)'} />
              </Field>
            </FormGrid2>
            <div className="grid gap-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authorized Isotopes</div>
              {g.entries.map((e, ei) => (
                <div key={ei} className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 grid gap-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Field label="Isotope" required>
                      <select className={selCls} value={e.iso} onChange={ev => patchEntry(gi, ei, { iso: ev.target.value })}>
                        {ISOTOPE_OPTIONS.map(i => <option key={i}>{i}</option>)}
                      </select>
                    </Field>
                    <Field label="Physical Form">
                      <select className={selCls} value={e.physicalForm || RUA_PHYSICAL_FORMS[0]} onChange={ev => patchEntry(gi, ei, { physicalForm: ev.target.value })}>
                        {RUA_PHYSICAL_FORMS.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </Field>
                    <Field label="Limit (µCi)"><input type="number" min="0" step="any" className={inpCls} value={e.limit || ''} onChange={ev => patchEntry(gi, ei, { limit: parseFloat(ev.target.value) || 0 })} /></Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Exp. (µCi)"><input type="number" min="0" step="any" className={inpCls} value={e.expUCi || ''} onChange={ev => patchEntry(gi, ei, { expUCi: parseFloat(ev.target.value) || 0 })} /></Field>
                      <Field label="Poss. (µCi)"><input type="number" min="0" step="any" className={inpCls} value={e.possUCi || ''} onChange={ev => patchEntry(gi, ei, { possUCi: parseFloat(ev.target.value) || 0 })} /></Field>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Field label="Chemical Form"><input className={inpCls} value={e.chemicalForm || ''} onChange={ev => patchEntry(gi, ei, { chemicalForm: ev.target.value })} placeholder="e.g., L-methionine in aqueous solution" /></Field>
                    <Field label="Experimental Description"><input className={inpCls} value={e.description || ''} onChange={ev => patchEntry(gi, ei, { description: ev.target.value })} placeholder="What the isotope is used for" /></Field>
                  </div>
                  {g.entries.length > 1 && <div className="flex justify-end"><IconBtn danger title="Remove isotope" onClick={() => patchGroup(gi, x => ({ ...x, entries: x.entries.filter((_, j) => j !== ei) }))}>🗑 Remove isotope</IconBtn></div>}
                </div>
              ))}
              <BtnOutline onClick={() => patchGroup(gi, x => ({ ...x, entries: [...x.entries, emptyEntry()] }))}>+ Add Isotope</BtnOutline>
            </div>
          </Card>
        ))}
        <BtnOutline onClick={() => setGroups(cur => [...cur, { id: uid('g'), piId: '', piName: '', usersText: '', entries: [emptyEntry()] }])}>+ Add PI Group</BtnOutline>
      </div>

      <Card className="p-4 grid gap-2">
        <SectionTitle>Safety Controls (select at least one)</SectionTitle>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {SAFETY_CONTROLS.map(c => (
            <label key={c} className="inline-flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap">
              <input type="checkbox" checked={controls.includes(c)} onChange={() => toggleControl(c)} /> {c}
            </label>
          ))}
        </div>
      </Card>

      <ErrorBox msg={err} />
    </div>
  );
}
