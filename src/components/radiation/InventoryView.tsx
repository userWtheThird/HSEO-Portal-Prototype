// Ionizing Radiation Safety Program — Inventory tab
// Three registers (sealed / unsealed / apparatus), detail panel with IA lifecycle,
// quarterly report and location × isotope summary for unsealed sources.

import React, { useMemo, useState } from 'react';
import type { RadiationSource, IrpRua } from '../../types';
import {
  Card, SectionTitle, Note, Empty, Badge, KV, HistoryList,
  BtnPrimary, BtnOutline, BtnGreen, IconBtn,
  tblWrap, tbl, th, td, trSel, trHl, mono, inpCls, selCls
} from './ui';
import {
  daysUntil, fmtDate, iaStage, STAGE_LABEL, STAGE_BADGE, checkStatus, computeLicenceState,
  swipeRuaState, parseActivityToUCi, fmtUCi, leakEntryText, swipeEntryText,
  quarterlyData, unsealedSummaryData, downloadCSV, printQuarterly, printUnsealedSummary,
  isoEntries
} from './utils';
import { CHECK_INTERVAL_DAYS, UCII_TO_MBQ } from './constants';

export type InvSub = 'sealed' | 'unsealed' | 'apparatus';
export type UnsealedSub = 'list' | 'quarterly' | 'summary';

export interface InventoryProps {
  sources: RadiationSource[];
  sub: InvSub;
  uSub: UnsealedSub;
  onUSub: (s: UnsealedSub) => void;
  ruas: IrpRua[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRegister: () => void;
  onEdit: (s: RadiationSource) => void;
  onDelete: (s: RadiationSource) => void;
  onMarkChecked: (s: RadiationSource) => void;
  onBatchCheck: (ids: string[]) => void;
  onLeakTest: (s: RadiationSource) => void;
  onSwipeRua: (rua: IrpRua) => void;
  onUsage: (s: RadiationSource) => void;
  onLicenceChange: (s: RadiationSource) => void;
  onToPU: (s: RadiationSource) => void;
  onDecom: (s: RadiationSource) => void;
}

function StatusBadge({ s }: { s: RadiationSource }) {
  if (s.category === 'apparatus' && iaStage(s) === 'decommissioned') return <Badge kind="mute">Decommissioned</Badge>;
  if (s.status === 'alert') return <Badge kind="alert">Alert</Badge>;
  if (s.status === 'due_test') return <Badge kind="expiring">Test Due</Badge>;
  return <Badge kind="safe">Safe</Badge>;
}

function LeakCell({ s }: { s: RadiationSource }) {
  if (!s.nextLeakTest) return <span className="text-slate-500">—</span>;
  const d = daysUntil(s.nextLeakTest);
  if (d <= 0) return <span className="text-red-400 font-semibold">{fmtDate(s.nextLeakTest)} <Badge kind="overdue">OVERDUE</Badge></span>;
  return <span className="text-slate-300">{fmtDate(s.nextLeakTest)} <span className="text-slate-500">({d}d)</span></span>;
}

function CheckCell({ s }: { s: RadiationSource }) {
  const c = checkStatus(s);
  return <Badge kind={c.cls}>{c.label}</Badge>;
}

export function InventoryView(p: InventoryProps) {
  const { sources, sub, ruas } = p;
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [isoF, setIsoF] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const uSub = p.uSub;
  const [qy, setQy] = useState(new Date().getFullYear());
  const [qq, setQq] = useState(Math.floor(new Date().getMonth() / 3) + 1);

  const list = useMemo(() => sources.filter(s => s.category === sub), [sources, sub]);
  const depts = useMemo(() => [...new Set(list.map(s => s.department || '').filter(Boolean))].sort(), [list]);
  const isotopes = useMemo(() => [...new Set(list.map(s => s.isotope || '').filter(Boolean))].sort(), [list]);
  const filtered = useMemo(() => list.filter(s => {
    const text = ((s.sourceName || '') + ' ' + (s.equipmentDescription || '') + ' ' + (s.isotope || '') + ' ' + (s.spaceID || '') + ' ' + (s.custodian || '') + ' ' + (s.licenceNumber || '')).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (dept && (s.department || '') !== dept) return false;
    if (isoF && sub !== 'apparatus' && (s.isotope || '') !== isoF) return false;
    return true;
  }), [list, q, dept, isoF, sub]);

  const selected = sources.find(s => s.id === p.selectedId) || null;

  const exportCsv = () => {
    if (sub === 'apparatus') {
      downloadCSV('apparatus_inventory.csv', [
        ['Equipment', 'Stage', 'Location', 'SpaceID', 'Department', 'Custodian', 'Licence', 'Licence Expiry', 'Licence Status', 'Last Check'],
        ...filtered.map(s => [s.equipmentDescription, STAGE_LABEL[iaStage(s)], s.location, s.spaceID, s.department, s.custodian, s.licenceNumber, s.licenceExpiryDate, computeLicenceState(s).label, s.lastInventoryCheckDate])
      ]);
    } else {
      downloadCSV(sub + '_inventory.csv', [
        ['Source', 'Category', 'Isotope', 'Activity', 'Location', 'SpaceID', 'Department', 'Custodian', 'Status', 'Last Leak Test', 'Next Leak Test', 'Last Check'],
        ...filtered.map(s => [s.sourceName, s.category, s.isotope, s.activity, s.location, s.spaceID, s.department, s.custodian, s.status, s.lastLeakTest, s.nextLeakTest, s.lastInventoryCheckDate])
      ]);
    }
  };

  const toggleSel = (id: string) => setSel(cur => cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  const batchCheck = () => { p.onBatchCheck(sel); setSel([]); };

  return (
    <div className="grid gap-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input className={inpCls + ' max-w-[240px]'} placeholder="Search name / isotope / location / licence…" value={q} onChange={e => setQ(e.target.value)} />
        <select className={selCls + ' max-w-[170px]'} value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All Departments</option>{depts.map(d => <option key={d}>{d}</option>)}
        </select>
        {sub !== 'apparatus' && (
          <select className={selCls + ' max-w-[140px]'} value={isoF} onChange={e => setIsoF(e.target.value)}>
            <option value="">All Isotopes</option>{isotopes.map(i => <option key={i}>{i}</option>)}
          </select>
        )}
        <div className="flex-1" />
        <BtnOutline onClick={exportCsv}>⬇ Export CSV</BtnOutline>
        <BtnPrimary onClick={p.onRegister}>+ Register Apparatus / Source</BtnPrimary>
      </div>

      {sub === 'unsealed' && (
        <div className="flex gap-1.5">
          {(['list', 'quarterly', 'summary'] as const).map(k => (
            <button key={k} onClick={() => p.onUSub(k)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-colors ${uSub === k ? 'bg-amber-700/20 border-amber-600/50 text-amber-400' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>
              {k === 'list' ? 'Source List' : k === 'quarterly' ? 'Quarterly Report' : 'Location Summary'}
            </button>
          ))}
        </div>
      )}

      {sub === 'unsealed' && uSub === 'quarterly' && <QuarterlyView sources={sources} qy={qy} qq={qq} setQy={setQy} setQq={setQq} />}
      {sub === 'unsealed' && uSub === 'summary' && <SummaryView sources={sources} />}

      {(sub !== 'unsealed' || uSub === 'list') && (
        <div className={`grid gap-4 ${selected ? 'xl:grid-cols-[1fr_400px]' : ''}`}>
          <div className="grid gap-3 content-start">
            {/* sealed batch bar */}
            {sub === 'sealed' && sel.length > 0 && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-600/40 rounded-lg px-4 py-2.5">
                <span className="text-xs font-bold text-amber-400">{sel.length} selected</span>
                <BtnGreen onClick={batchCheck}>✔ Mark Inventory Checked</BtnGreen>
                <button className="text-xs text-slate-400 hover:text-slate-200" onClick={() => setSel([])}>Clear</button>
              </div>
            )}

            {filtered.length === 0 ? (
              <Card><Empty icon="☢">No {sub === 'apparatus' ? 'apparatus' : sub + ' sources'} registered.</Empty></Card>
            ) : sub === 'sealed' ? (
              <div className={tblWrap}>
                <table className={tbl}>
                  <thead><tr>
                    <th className={th}></th><th className={th}>Source</th><th className={th}>Isotope</th><th className={th}>Activity</th>
                    <th className={th}>Location</th><th className={th}>Leak Test</th><th className={th}>Inv. Check</th><th className={th}>Status</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className={`${trSel} ${selected && selected.id === s.id ? trHl : ''}`} onClick={() => p.onSelect(selected && selected.id === s.id ? null : s.id)}>
                        <td className={td} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={sel.includes(s.id)} onChange={() => toggleSel(s.id)} />
                        </td>
                        <td className={td}><div className="font-semibold text-slate-100">{s.sourceName}</div><div className="text-[11px] text-slate-500">{s.custodian || '—'}</div></td>
                        <td className={td + ' ' + mono}>{s.isotope}</td>
                        <td className={td}>{s.activity}</td>
                        <td className={td}>{s.spaceID || s.location}</td>
                        <td className={td}><LeakCell s={s} /></td>
                        <td className={td}><CheckCell s={s} /></td>
                        <td className={td}><StatusBadge s={s} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : sub === 'unsealed' ? (
              <div className={tblWrap}>
                <table className={tbl}>
                  <thead><tr>
                    <th className={th}>Source</th><th className={th}>Isotope</th><th className={th}>Activity</th><th className={th}>Location</th>
                    <th className={th}>Swipe Test (Room)</th><th className={th}>Custodian</th><th className={th}>Status</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => {
                      const sw = swipeRuaState(ruas, s.spaceID);
                      return (
                        <tr key={s.id} className={`${trSel} ${selected && selected.id === s.id ? trHl : ''}`} onClick={() => p.onSelect(selected && selected.id === s.id ? null : s.id)}>
                          <td className={td}><div className="font-semibold text-slate-100">{s.sourceName}</div><div className="text-[11px] text-slate-500">acq. {fmtDate(s.acquiredDate)}</div></td>
                          <td className={td + ' ' + mono}>{s.isotope}</td>
                          <td className={td}>{s.activity}</td>
                          <td className={td}>{s.spaceID || s.location}</td>
                          <td className={td}>{sw.rua ? <span className={sw.due ? 'text-red-400 font-semibold' : 'text-slate-300'}>{sw.label}</span> : <span className="text-slate-500">No RUA ⚠</span>}</td>
                          <td className={td}>{s.custodian || '—'}</td>
                          <td className={td}><StatusBadge s={s} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={tblWrap}>
                <table className={tbl}>
                  <thead><tr>
                    <th className={th}>Equipment</th><th className={th}>Location</th><th className={th}>Stage</th>
                    <th className={th}>Licence #</th><th className={th}>Licence Status</th><th className={th}>Inv. Check</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => {
                      const st = iaStage(s);
                      const lic = computeLicenceState(s);
                      return (
                        <tr key={s.id} className={`${trSel} ${selected && selected.id === s.id ? trHl : ''}`} onClick={() => p.onSelect(selected && selected.id === s.id ? null : s.id)}>
                          <td className={td}><div className="font-semibold text-slate-100">{s.equipmentDescription}</div><div className="text-[11px] text-slate-500">{s.custodian || '—'}</div></td>
                          <td className={td}>{s.spaceID || s.location}</td>
                          <td className={td}><Badge kind={STAGE_BADGE[st]}>{STAGE_LABEL[st]}</Badge></td>
                          <td className={td + ' ' + mono}>{s.licenceNumber || '—'}</td>
                          <td className={td}>{st === 'decommissioned' ? <span className="text-slate-500">Licence removed</span> : <Badge kind={lic.color}>{lic.label}</Badge>}</td>
                          <td className={td}>{st === 'possess' ? <span className="text-slate-500 text-[11px]">begins at P&amp;U</span> : <CheckCell s={s} />}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && <DetailPanel s={selected} ruas={ruas} {...p} />}
        </div>
      )}
    </div>
  );
}

// ══════════════ DETAIL PANEL ══════════════

function DetailPanel({ s, ruas, ...p }: InventoryProps & { s: RadiationSource }) {
  const st = iaStage(s);
  return (
    <div className="grid gap-3 content-start">
      {s.category === 'apparatus' ? (
        <ApparatusDetail s={s} ruas={ruas} {...p} />
      ) : s.category === 'sealed' ? (
        <>
          <Card className="p-4 grid gap-3">
            <SectionTitle>Reference Activity</SectionTitle>
            <KV k="Isotope"><span className={mono}>{s.isotope}</span></KV>
            <KV k="Current activity">{s.activity || '—'}</KV>
            <KV k="Reference activity">{s.activityReference || '—'} <span className="text-slate-500">on {fmtDate(s.referenceDate)}</span></KV>
            <KV k="Location">{s.spaceID || s.location || '—'}</KV>
            <KV k="Custodian">{s.custodian || '—'}</KV>
            {s.licenceNumber && <KV k="Licence"><span className={mono}>{s.licenceNumber}</span></KV>}
          </Card>
          <Card className="p-4 grid gap-3">
            <SectionTitle>Inventory Check</SectionTitle>
            <KV k="Last check">{fmtDate(s.lastInventoryCheckDate)}</KV>
            <KV k="Cycle">Every {CHECK_INTERVAL_DAYS} days</KV>
            <HistoryList items={(s.checkHistory || []).map((c, i) => <span key={i}>{c}</span>)} />
            <BtnGreen onClick={() => p.onMarkChecked(s)}>✔ Inventory Checked</BtnGreen>
          </Card>
          <Card className={`p-4 grid gap-3 ${s.nextLeakTest && daysUntil(s.nextLeakTest) <= 0 ? 'border-red-500/50' : ''}`}>
            <SectionTitle>Leak Test (annual)</SectionTitle>
            <KV k="Last test">{fmtDate(s.lastLeakTest)}</KV>
            <KV k="Next due"><LeakCell s={s} /></KV>
            {s.leakTestHistory && s.leakTestHistory.length > 0 && (
              <KV k="Last result">{s.leakTestHistory[0].result === 'fail' ? <Badge kind="alert">FAIL</Badge> : <Badge kind="safe">PASS</Badge>} <span className="text-slate-500">net {s.leakTestHistory[0].net.toFixed(1)} cpm</span></KV>
            )}
            <HistoryList items={(s.leakTestHistory || []).map((h, i) => <span key={i}>{leakEntryText(h)}</span>)} />
            <BtnPrimary onClick={() => p.onLeakTest(s)}>🧫 Conduct Leak Test</BtnPrimary>
          </Card>
        </>
      ) : (
        <UnsealedDetail s={s} ruas={ruas} {...p} />
      )}

      {s.category !== 'apparatus' && (
        <div className="flex gap-2">
          <BtnOutline onClick={() => p.onEdit(s)} className="flex-1">✎ Edit</BtnOutline>
          <BtnOutline onClick={() => p.onDelete(s)} className="flex-1 !border-red-800 !text-red-400 hover:!border-red-500">🗑 Delete</BtnOutline>
        </div>
      )}
      {st === 'decommissioned' && s.category === 'apparatus' && (
        <BtnOutline onClick={() => p.onDelete(s)} className="!border-red-800 !text-red-400 hover:!border-red-500">🗑 Remove Record</BtnOutline>
      )}
    </div>
  );
}

function ApparatusDetail({ s, ...p }: InventoryProps & { s: RadiationSource }) {
  const st = iaStage(s);
  const lic = computeLicenceState(s);
  const steps: { k: typeof st; label: string }[] = [
    { k: 'possess', label: '1 · Possess' },
    { k: 'possess-use', label: '2 · Possess & Use' },
    { k: 'decommissioned', label: '3 · Decommissioned' }
  ];
  const idx = st === 'possess' ? 0 : st === 'possess-use' ? 1 : 2;
  return (
    <>
      <Card className="p-4 grid gap-3">
        <SectionTitle>Apparatus Lifecycle</SectionTitle>
        <div className="flex gap-1.5">
          {steps.map((x, i) => (
            <div key={x.k} className={`flex-1 text-center text-[10px] font-bold uppercase tracking-wide rounded-md px-1 py-1.5 border ${i <= idx ? 'bg-amber-700/20 border-amber-600/50 text-amber-400' : 'border-slate-800 text-slate-600'}`}>{x.label}</div>
          ))}
        </div>
        <KV k="Equipment"><span className="text-slate-100 font-semibold">{s.equipmentDescription}</span></KV>
        <KV k="Location">{s.spaceID || s.location || '—'} · {s.department || '—'}</KV>
        <KV k="Custodian">{s.custodian || '—'}</KV>
        {st === 'possess' && (
          <>
            <KV k="Purchase licence"><span className={mono}>{s.purchaseLicenceNo || s.licenceNumber || '—'}</span></KV>
            <KV k="Import licence">{s.importLicenceNo ? <span className={mono}>{s.importLicenceNo}</span> : '—'}</KV>
            <KV k="Floor plan">{s.floorPlanFile ? <span className={mono}>{s.floorPlanFile}</span> : '—'}</KV>
            <KV k="Tube serial no.">{s.xrayTubeSerialNumbers || 'to be confirmed'}</KV>
            <Note>Purchase stage — the equipment is licensed for possession while awaiting installation. Move it to <b>Possess &amp; Use</b> once installed; the annual renewal cycle and annual checks begin then.</Note>
          </>
        )}
        {st !== 'possess' && (
          <>
            {s.possessLicence && s.possessLicence.number && (
              <KV k="Prior possess licence"><span className={mono}>{s.possessLicence.number}</span></KV>
            )}
            <KV k="Licence"><span className={mono}>{s.licenceNumber || '—'}</span>{s.licenceFile ? <span className="text-slate-500"> · {s.licenceFile}</span> : null}</KV>
            <KV k="Licence status"><Badge kind={lic.color}>{lic.label}</Badge></KV>
            <KV k="Tube serial no.">{s.xrayTubeSerialNumbers || '—'}</KV>
          </>
        )}
        {st === 'decommissioned' && s.decommission && (
          <>
            <KV k="Disposal approved">{fmtDate(s.decommission.approvalDate)}</KV>
            <KV k="Tubes destroyed">{fmtDate(s.decommission.destroyedDate)}</KV>
            <KV k="Board verified">{fmtDate(s.decommission.verifiedDate)}</KV>
            {s.decommission.approvalFile && <KV k="Approval PDF"><span className={mono}>{s.decommission.approvalFile}</span></KV>}
            {s.decommission.notes && <Note>{s.decommission.notes}</Note>}
          </>
        )}
        <div className="flex flex-wrap gap-2">
          {st === 'possess' && <BtnPrimary onClick={() => p.onToPU(s)}>⚙ Move to Possess &amp; Use</BtnPrimary>}
          {st === 'possess-use' && <BtnGreen onClick={() => p.onMarkChecked(s)}>✔ Annual Check</BtnGreen>}
          {st !== 'decommissioned' && (
            <>
              <BtnOutline onClick={() => p.onEdit(s)}>✎ Edit</BtnOutline>
              <BtnOutline onClick={() => p.onLicenceChange(s)}>📜 Change Licence</BtnOutline>
              <BtnOutline onClick={() => p.onDecom(s)} className="!border-red-800 !text-red-400 hover:!border-red-500">🗑 Decommission</BtnOutline>
            </>
          )}
        </div>
      </Card>
      <Card className="p-4 grid gap-3">
        <SectionTitle>Licence History</SectionTitle>
        <HistoryList items={(s.licenceHistory || []).map((h, i) => (
          <span key={i}><span className={mono + ' text-slate-200'}>{h.licenceNumber}</span> — {fmtDate(h.changedDate)} by {h.changedBy || '—'}{h.fileName ? <span> · {h.fileName}</span> : null}{h.notes ? <span className="text-slate-500"> — {h.notes}</span> : null}</span>
        ))} />
        {st === 'decommissioned' && <Note>The licence was removed on decommissioning — the record is kept for audit.</Note>}
      </Card>
      <Card className="p-4 grid gap-3">
        <SectionTitle>Inventory Check</SectionTitle>
        <KV k="Last check">{fmtDate(s.lastInventoryCheckDate)}</KV>
        <HistoryList items={(s.checkHistory || []).map((c, i) => <span key={i}>{c}</span>)} />
      </Card>
    </>
  );
}

function UnsealedDetail({ s, ruas, ...p }: InventoryProps & { s: RadiationSource }) {
  const sw = swipeRuaState(ruas, s.spaceID);
  const rua = ruas.find(u => u.spaceID === s.spaceID);
  const spent = (s.usageLog || []).reduce((a, u) => a + (u.activityUCi || 0), 0);
  const acquired = parseActivityToUCi(s.activity);
  const remaining = Math.max(acquired - spent, 0);
  return (
    <>
      {rua ? (
        <Card className={`p-4 grid gap-3 ${sw.due ? 'border-red-500/50' : ''}`}>
          <SectionTitle>Location Swipe Test — {rua.spaceID}</SectionTitle>
          <KV k="RUA"><span className={mono}>{rua.ruaNo || '—'}</span> ({rua.type})</KV>
          <KV k="Last swipe">{fmtDate(rua.lastSwipeTest)}</KV>
          <KV k="Next due"><span className={sw.due ? 'text-red-400 font-semibold' : 'text-slate-300'}>{sw.label}</span></KV>
          <HistoryList items={[...(rua.swipeHistory || [])].reverse().slice(0, 6).map((x, i) => <span key={i}>{typeof x === 'string' ? x : swipeEntryText(x)}</span>)} />
          <BtnPrimary onClick={() => p.onSwipeRua(rua)}>🧫 Conduct Swipe Test</BtnPrimary>
        </Card>
      ) : (
        <Card className="p-4 border-red-500/50">
          <Note className="text-red-400">⚠ No Room Use Authorization covers {s.spaceID || 'this location'} — swipe testing and waste collection are not tracked for unauthorized rooms.</Note>
        </Card>
      )}
      <Card className="p-4 grid gap-3">
        <SectionTitle>Acquisition</SectionTitle>
        <KV k="Isotope"><span className={mono}>{s.isotope}</span></KV>
        <KV k="Activity">{s.activity} <span className="text-slate-500">≈ {fmtUCi(acquired)} µCi</span></KV>
        <KV k="Acquired">{fmtDate(s.acquiredDate)}</KV>
        <KV k="Volume">{s.volume || '—'}</KV>
        <KV k="Purchased by">{s.purchasedBy || '—'}</KV>
        <KV k="Vendor">{s.vendorName || '—'}</KV>
        <KV k="Custodian">{s.custodian || '—'}</KV>
      </Card>
      <Card className="p-4 grid gap-3">
        <SectionTitle>Usage Log</SectionTitle>
        <KV k="Remaining (est.)"><span className="font-mono font-bold text-amber-400">{fmtUCi(remaining)} µCi</span> <span className="text-slate-500">({(remaining * UCII_TO_MBQ).toFixed(2)} MBq)</span></KV>
        {spent > 0 && <KV k="Total spent"><span className="font-mono">{fmtUCi(spent)} µCi</span></KV>}
        <HistoryList items={(s.usageLog || []).map(u => (
          <span key={u.id}>{fmtDate(u.date)} — <span className="font-mono">{fmtUCi(u.activityUCi)} µCi</span>{u.volume ? ' (' + u.volume + ')' : ''}{u.by ? ' by ' + u.by : ''}{u.notes ? <span className="text-slate-500"> — {u.notes}</span> : null}</span>
        ))} />
        <BtnPrimary onClick={() => p.onUsage(s)}>🧪 Record Consumption</BtnPrimary>
      </Card>
    </>
  );
}

// ══════════════ QUARTERLY REPORT ══════════════

function QuarterlyView({ sources, qy, qq, setQy, setQq }: {
  sources: RadiationSource[]; qy: number; qq: number; setQy: (y: number) => void; setQq: (q: number) => void;
}) {
  const d = quarterlyData(sources, qy, qq);
  const years = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select className={selCls + ' max-w-[110px]'} value={qy} onChange={e => setQy(Number(e.target.value))}>{years.map(y => <option key={y}>{y}</option>)}</select>
        <select className={selCls + ' max-w-[90px]'} value={qq} onChange={e => setQq(Number(e.target.value))}>{[1, 2, 3, 4].map(x => <option key={x} value={x}>Q{x}</option>)}</select>
        <div className="flex-1" />
        <BtnOutline onClick={() => printQuarterly(sources, qy, qq)}>🖨 Print / PDF</BtnOutline>
      </div>
      <Card className="p-4 grid gap-2">
        <SectionTitle>1 · Acquired in Quarter</SectionTitle>
        {d.acquired.length === 0 ? <Note>No acquisitions in this quarter.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr><th className={th}>Date</th><th className={th}>Isotope</th><th className={th}>Source</th><th className={th}>Purchased By</th><th className={th}>Storage</th><th className={th}>Volume</th><th className={th}>Activity (µCi)</th><th className={th}>Vendor</th></tr></thead>
              <tbody>
                {d.acquired.map(s => (
                  <tr key={s.id}>
                    <td className={td}>{fmtDate(s.acquiredDate)}</td><td className={td + ' ' + mono}>{s.isotope}</td>
                    <td className={td}>{s.sourceName}</td><td className={td}>{s.purchasedBy || '—'}</td>
                    <td className={td}>{s.spaceID || s.location}</td><td className={td}>{s.volume || '—'}</td>
                    <td className={td + ' ' + mono}>{fmtUCi(parseActivityToUCi(s.activity))}</td><td className={td}>{s.vendorName || '—'}</td>
                  </tr>
                ))}
                <tr><td className={td + ' font-bold text-right text-slate-100'} colSpan={6}>TOTAL ACQUIRED</td><td className={td + ' font-bold text-slate-100 ' + mono}>{fmtUCi(d.totA)}</td><td className={td}></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card className="p-4 grid gap-2">
        <SectionTitle>2 · Spent in Quarter</SectionTitle>
        {d.spent.length === 0 ? <Note>No consumption in this quarter.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr><th className={th}>Date</th><th className={th}>Isotope</th><th className={th}>Source</th><th className={th}>Storage</th><th className={th}>Volume</th><th className={th}>Activity (µCi)</th><th className={th}>Spent By</th><th className={th}>Notes</th></tr></thead>
              <tbody>
                {d.spent.map((u, i) => (
                  <tr key={i}>
                    <td className={td}>{fmtDate(u.date)}</td><td className={td + ' ' + mono}>{u.isotope}</td>
                    <td className={td}>{u.sourceName}</td><td className={td}>{u.location}</td><td className={td}>{u.volume || '—'}</td>
                    <td className={td + ' ' + mono}>{fmtUCi(u.activityUCi || 0)}</td><td className={td}>{u.by || '—'}</td><td className={td}>{u.notes || ''}</td>
                  </tr>
                ))}
                <tr><td className={td + ' font-bold text-right text-slate-100'} colSpan={5}>TOTAL SPENT</td><td className={td + ' font-bold text-slate-100 ' + mono}>{fmtUCi(d.totS)}</td><td className={td} colSpan={2}></td></tr>
              </tbody>
            </table>
          </div>
        )}
        <Note>Net change for the quarter: <span className="font-bold text-slate-200">{d.totA - d.totS >= 0 ? '+' : '−'}{fmtUCi(Math.abs(d.totA - d.totS))} µCi</span></Note>
      </Card>
    </div>
  );
}

// ══════════════ LOCATION × ISOTOPE SUMMARY ══════════════

function SummaryView({ sources }: { sources: RadiationSource[] }) {
  const d = unsealedSummaryData(sources);
  return (
    <div className="grid gap-3">
      <div className="flex justify-end"><BtnOutline onClick={() => printUnsealedSummary(sources)}>🖨 Print / PDF</BtnOutline></div>
      <Card className="p-4 grid gap-2">
        <SectionTitle>Unsealed Activity on Hand — Location × Isotope (µCi)</SectionTitle>
        {d.locs.length === 0 ? <Note>No unsealed sources registered.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr><th className={th}>Location</th>{d.isotopes.map(i => <th key={i} className={th}>{i}</th>)}<th className={th}>Total</th></tr></thead>
              <tbody>
                {d.locs.map(loc => (
                  <tr key={loc}>
                    <td className={td + ' font-semibold text-slate-200'}>{loc}</td>
                    {d.isotopes.map(i => <td key={i} className={td + ' ' + mono}>{d.grid[loc] && d.grid[loc][i] ? fmtUCi(d.grid[loc][i]) : '—'}</td>)}
                    <td className={td + ' ' + mono + ' font-bold text-slate-100'}>{fmtUCi(d.locTotals[loc])}</td>
                  </tr>
                ))}
                <tr>
                  <td className={td + ' font-bold text-slate-100'}>Total (µCi)</td>
                  {d.isotopes.map(i => <td key={i} className={td + ' ' + mono + ' font-bold text-slate-100'}>{fmtUCi(d.isoTotals[i])}</td>)}
                  <td className={td + ' ' + mono + ' font-bold text-amber-400'}>{fmtUCi(d.grand)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <Note>All activities in µCi, parsed from registered activity strings. Prepared for annual licence renewal.</Note>
      </Card>
    </div>
  );
}
