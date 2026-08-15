// Ionizing Radiation Safety Program — Waste Tracking tab
// Collected containers, disposal records (standardized PDF), all-time summary, annual report.

import React, { useMemo, useState } from 'react';
import type { WasteContainer, IrpRua } from '../../types';
import { Card, SectionTitle, Note, Empty, Badge, BtnPrimary, BtnOutline, IconBtn, tblWrap, tbl, th, td, mono, inpCls, selCls } from './ui';
import {
  fmtDate, fmtUCi, currentActivityUCi, activityAtUCi, disposalInstances, recordNoOf,
  exportDisposalPDF, downloadCSV, annualWasteData, printAnnualWaste, type DisposalInstance
} from './utils';
import { UCII_TO_MBQ, WASTE_CLASSES } from './constants';

export type WasteSub = 'collected' | 'disposed' | 'summary' | 'annual';

export interface WasteProps {
  waste: WasteContainer[];
  ruas: IrpRua[];
  sub: WasteSub;
  onSub: (s: WasteSub) => void;
  onLog: () => void;
  onDispose: (c: WasteContainer) => void;
  onDelete: (c: WasteContainer) => void;
}

const classBadge = (c: WasteContainer['wasteClass']) =>
  c === 'Alpha' ? <Badge kind="alpha">Alpha</Badge> : c === 'Gamma' ? <Badge kind="gamma">Gamma</Badge> : <Badge kind="beta">Beta</Badge>;

export function WasteView(p: WasteProps) {
  const sub = p.sub;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-1.5">
        {([['collected', '🛢 In Storage'], ['disposed', '📤 Disposal Records'], ['summary', 'Σ All-time Summary'], ['annual', '📅 Annual Report']] as [WasteSub, string][]).map(([k, label]) => (
          <button key={k} onClick={() => p.onSub(k)}
            className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-colors ${sub === k ? 'bg-amber-700/20 border-amber-600/50 text-amber-400' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}>
            {label}
          </button>
        ))}
      </div>
      {sub === 'collected' && <CollectedView {...p} />}
      {sub === 'disposed' && <DisposedView waste={p.waste} />}
      {sub === 'summary' && <SummaryView waste={p.waste} />}
      {sub === 'annual' && <AnnualView waste={p.waste} />}
    </div>
  );
}

function CollectedView(p: WasteProps) {
  const [q, setQ] = useState('');
  const [cls, setCls] = useState('');
  const collected = useMemo(() => p.waste
    .filter(w => w.status !== 'disposed')
    .filter(w => !cls || w.wasteClass === cls)
    .filter(w => !q || ((w.tagNo + ' ' + w.isotope + ' ' + w.spaceID + ' ' + w.department + ' ' + (w.notes || '')).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.collectedDate + b.tagNo).localeCompare(a.collectedDate + a.tagNo)), [p.waste, q, cls]);

  const exportCsv = () => downloadCSV('waste_in_storage.csv', [
    ['Tag', 'Class', 'Form', 'Isotope', 'Est. Activity (µCi)', 'Current Activity (µCi)', 'Department', 'Space ID', 'Collected', 'Collected By', 'Notes'],
    ...collected.map(w => [w.tagNo, w.wasteClass, w.form, w.isotope, w.activityUCi, currentActivityUCi(w).toFixed(3), w.department, w.spaceID, w.collectedDate, w.collectedBy, w.notes])
  ]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input className={inpCls + ' max-w-[240px]'} placeholder="Search tag / isotope / location…" value={q} onChange={e => setQ(e.target.value)} />
        <select className={selCls + ' max-w-[130px]'} value={cls} onChange={e => setCls(e.target.value)}>
          <option value="">All Classes</option>{WASTE_CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex-1" />
        <BtnOutline onClick={exportCsv}>⬇ Export CSV</BtnOutline>
        <BtnPrimary onClick={p.onLog}>+ Log Collection</BtnPrimary>
      </div>
      {collected.length === 0 ? <Card><Empty icon="🛢">No waste containers in storage.</Empty></Card> : (
        <div className={tblWrap}>
          <table className={tbl}>
            <thead><tr>
              <th className={th}>Tag</th><th className={th}>Class</th><th className={th}>Form</th><th className={th}>Isotope</th>
              <th className={th}>Est. Activity</th><th className={th}>Current (decay)</th><th className={th}>Department</th>
              <th className={th}>Location</th><th className={th}>Collected</th><th className={th}></th>
            </tr></thead>
            <tbody>
              {collected.map(w => {
                const cur = currentActivityUCi(w);
                return (
                  <tr key={w.id}>
                    <td className={td + ' ' + mono + ' font-bold text-slate-100'}>{w.tagNo}</td>
                    <td className={td}>{classBadge(w.wasteClass)}</td>
                    <td className={td}>{w.form}</td>
                    <td className={td + ' ' + mono}>{w.isotope}</td>
                    <td className={td + ' ' + mono}>{fmtUCi(w.activityUCi)} µCi</td>
                    <td className={td + ' ' + mono + ' text-cyan-400'}>{fmtUCi(cur)} µCi</td>
                    <td className={td}>{w.department}</td>
                    <td className={td}>{w.spaceID}</td>
                    <td className={td}><div>{fmtDate(w.collectedDate)}</div><div className="text-[10px] text-slate-500">{w.collectedBy || '—'}{w.notes ? ' · ' + w.notes : ''}</div></td>
                    <td className={td + ' text-right whitespace-nowrap'}>
                      <IconBtn title="Record disposal" onClick={() => p.onDispose(w)}>📤</IconBtn>
                      <IconBtn danger title="Delete" onClick={() => p.onDelete(w)}>🗑</IconBtn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Note>Current activity is decay-corrected from the collection date using the isotope half-life. {collected.length} container{collected.length === 1 ? '' : 's'} in storage.</Note>
    </div>
  );
}

function DisposedView({ waste }: { waste: WasteContainer[] }) {
  const ins = disposalInstances(waste);
  const disposed = waste.filter(w => w.status === 'disposed').sort((a, b) => (b.disposedDate || '').localeCompare(a.disposedDate || ''));
  return (
    <div className="grid gap-4">
      <Card className="p-4 grid gap-3">
        <SectionTitle>Disposal Records</SectionTitle>
        {ins.length === 0 ? <Note>No disposals recorded yet.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Record No.</th><th className={th}>Disposal Date</th><th className={th}>Disposed By</th>
                <th className={th}>Method</th><th className={th}>Containers</th><th className={th}>Total Activity</th><th className={th}></th>
              </tr></thead>
              <tbody>
                {ins.map(i => {
                  const tot = i.containers.reduce((a, w) => a + (w.activityUCi || 0), 0);
                  return (
                    <tr key={i.key}>
                      <td className={td + ' ' + mono + ' font-bold text-slate-100'}>{recordNoOf(i.disposedDate)}</td>
                      <td className={td}>{fmtDate(i.disposedDate)}</td>
                      <td className={td}>{i.disposedBy || '—'}</td>
                      <td className={td}>{i.disposalMethod || '—'}</td>
                      <td className={td}>{i.containers.length}</td>
                      <td className={td + ' ' + mono}>{fmtUCi(tot)} µCi · {(tot * UCII_TO_MBQ).toFixed(3)} MBq</td>
                      <td className={td + ' text-right'}><BtnOutline onClick={() => exportDisposalPDF(i)}>🖨 PDF</BtnOutline></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Note>Containers disposed together (same date, person and method) form one standardized disposal record.</Note>
      </Card>
      <Card className="p-4 grid gap-3">
        <SectionTitle>Disposed Containers</SectionTitle>
        {disposed.length === 0 ? <Note>No disposed containers.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Tag</th><th className={th}>Class</th><th className={th}>Isotope</th><th className={th}>Activity at Disposal</th>
                <th className={th}>Department</th><th className={th}>Location</th><th className={th}>Disposed</th>
              </tr></thead>
              <tbody>
                {disposed.map(w => (
                  <tr key={w.id}>
                    <td className={td + ' ' + mono}>{w.tagNo}</td>
                    <td className={td}>{classBadge(w.wasteClass)}</td>
                    <td className={td + ' ' + mono}>{w.isotope}</td>
                    <td className={td + ' ' + mono}>{fmtUCi(activityAtUCi(w, w.disposedDate || ''))} µCi</td>
                    <td className={td}>{w.department}</td>
                    <td className={td}>{w.spaceID}</td>
                    <td className={td}><div>{fmtDate(w.disposedDate)}</div><div className="text-[10px] text-slate-500">{w.disposalMethod || '—'}{w.disposalNotes ? ' · ' + w.disposalNotes : ''}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryView({ waste }: { waste: WasteContainer[] }) {
  const byIso: Record<string, { inN: number; inU: number; outN: number; outU: number; storeN: number }> = {};
  waste.forEach(w => {
    const iso = w.isotope || '—';
    byIso[iso] = byIso[iso] || { inN: 0, inU: 0, outN: 0, outU: 0, storeN: 0 };
    byIso[iso].inN++; byIso[iso].inU += w.activityUCi || 0;
    if (w.status === 'disposed') { byIso[iso].outN++; byIso[iso].outU += w.activityUCi || 0; }
    else byIso[iso].storeN++;
  });
  const keys = Object.keys(byIso).sort((a, b) => byIso[b].inU - byIso[a].inU);
  return (
    <Card className="p-4 grid gap-3">
      <SectionTitle>All-time Waste Balance by Isotope</SectionTitle>
      {keys.length === 0 ? <Empty icon="🛢">No waste recorded.</Empty> : (
        <div className={tblWrap}>
          <table className={tbl}>
            <thead><tr>
              <th className={th}>Isotope</th><th className={th}>Collected</th><th className={th}>Collected (µCi)</th>
              <th className={th}>Disposed</th><th className={th}>Disposed (µCi)</th><th className={th}>In Storage</th><th className={th}>Remaining (MBq)</th>
            </tr></thead>
            <tbody>
              {keys.map(k => {
                const r = byIso[k];
                const remainU = r.inU - r.outU;
                return (
                  <tr key={k}>
                    <td className={td + ' ' + mono + ' font-semibold text-slate-100'}>{k}</td>
                    <td className={td}>{r.inN}</td>
                    <td className={td + ' ' + mono}>{fmtUCi(r.inU)}</td>
                    <td className={td}>{r.outN}</td>
                    <td className={td + ' ' + mono}>{fmtUCi(r.outU)}</td>
                    <td className={td}>{r.storeN}</td>
                    <td className={td + ' ' + mono + ' text-amber-400'}>{(remainU * UCII_TO_MBQ).toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Note>Activities are the values estimated at collection — decay correction applies to current storage activity in the In Storage list.</Note>
    </Card>
  );
}

function AnnualView({ waste }: { waste: WasteContainer[] }) {
  const thisYear = new Date().getFullYear();
  const [y, setY] = useState(thisYear);
  const years = [...new Set([...waste.map(w => (w.collectedDate || '').slice(0, 4)).filter(Boolean).map(Number), thisYear])].sort().reverse();
  const d = annualWasteData(waste, y);
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <select className={selCls + ' max-w-[110px]'} value={y} onChange={e => setY(Number(e.target.value))}>{years.map(x => <option key={x}>{x}</option>)}</select>
        <div className="flex-1" />
        <BtnOutline onClick={() => printAnnualWaste(waste, y)}>🖨 Print / PDF</BtnOutline>
      </div>
      <Card className="p-4 grid gap-3">
        <SectionTitle>Annual Waste Summary — {y}</SectionTitle>
        {d.keys.length === 0 ? <Empty icon="📅">No waste activity recorded in {y}.</Empty> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Isotope</th><th className={th}>Collected (containers)</th><th className={th}>Collected (µCi)</th>
                <th className={th}>Disposed (containers)</th><th className={th}>Disposed (µCi)</th><th className={th}>Still in Storage</th>
              </tr></thead>
              <tbody>
                {d.keys.map(k => {
                  const r = d.byIso[k];
                  return (
                    <tr key={k}>
                      <td className={td + ' ' + mono + ' font-semibold text-slate-100'}>{k}</td>
                      <td className={td}>{r.cn}</td><td className={td + ' ' + mono}>{fmtUCi(r.cu)}</td>
                      <td className={td}>{r.dn}</td><td className={td + ' ' + mono}>{fmtUCi(r.du)}</td>
                      <td className={td}>{r.sn}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className={td + ' font-bold text-slate-100'}>Total</td>
                  <td className={td + ' font-bold text-slate-100'}>{d.tot.cn}</td><td className={td + ' ' + mono + ' font-bold text-slate-100'}>{fmtUCi(d.tot.cu)}</td>
                  <td className={td + ' font-bold text-slate-100'}>{d.tot.dn}</td><td className={td + ' ' + mono + ' font-bold text-slate-100'}>{fmtUCi(d.tot.du)}</td>
                  <td className={td + ' font-bold text-slate-100'}>{d.tot.sn}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <Note>Annual waste summary prepared for licence renewal.</Note>
      </Card>
    </div>
  );
}
