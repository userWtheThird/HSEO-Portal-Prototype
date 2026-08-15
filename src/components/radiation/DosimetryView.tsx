// Ionizing Radiation Safety Program — Personnel Dosimetry tab
// Abnormal dose logging + regulatory reference + monitored-person roster.

import React, { useMemo, useState } from 'react';
import type { DoseReading, DoseRosterEntry } from '../../types';
import { Card, SectionTitle, Note, Empty, Badge, BtnPrimary, BtnOutline, IconBtn, tblWrap, tbl, th, td, trSel, mono } from './ui';
import { DoseFormCard, RosterModal } from './modals';
import { doseStatusOf, currentMonth } from './utils';
import { DOSE_CAUTION_LIMIT, DOSE_CRITICAL_LIMIT } from './constants';
import type { IrpPerson } from './seeds';

export interface DosimetryProps {
  doses: DoseReading[];
  roster: DoseRosterEntry[];
  persons: IrpPerson[];
  onAddDose: (r: { name: string; department: string; month: string; exposure: number; remarks: string }) => boolean;
  onRosterSave: (entry: DoseRosterEntry | null, r: { name: string; department: string; isotopes: string[]; tld: boolean; ring: boolean; notes?: string }) => void;
  onRosterDelete: (id: string) => void;
}

export function DosimetryView(p: DosimetryProps) {
  const [rosterOpen, setRosterOpen] = useState(false);
  const [rosterEdit, setRosterEdit] = useState<DoseRosterEntry | null>(null);
  const [rosterHidden, setRosterHidden] = useState(false);

  const sorted = useMemo(() => [...p.doses].sort((a, b) => (b.month + b.name).localeCompare(a.month + a.name)), [p.doses]);
  const tldCount = p.roster.filter(r => r.tld).length;
  const ringCount = p.roster.filter(r => r.ring).length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="p-4 grid gap-3">
          <SectionTitle>Log Abnormal Dosimeter Reading</SectionTitle>
          <Note>Enter readings that exceed normal background as soon as they are reported. Readings at or above {DOSE_CRITICAL_LIMIT.toFixed(1)} mSv raise an immediate critical alert.</Note>
          <DoseFormCard defaultDept="Physics" defaultMonth={currentMonth()} onSubmit={p.onAddDose} />
        </Card>
        <Card className="p-4 grid gap-3 content-start">
          <SectionTitle>Regulatory Reference</SectionTitle>
          <div className="grid gap-2 text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2"><span>Occupational dose limit (effective dose)</span><span className="font-mono font-bold text-slate-100">20 mSv / yr</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span>Caution threshold</span><span className="font-mono font-bold text-amber-400">≥ {DOSE_CAUTION_LIMIT.toFixed(1)} mSv</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span>Critical threshold</span><span className="font-mono font-bold text-red-400">≥ {DOSE_CRITICAL_LIMIT.toFixed(1)} mSv</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span>Monitored persons</span><span className="font-mono font-bold text-slate-100">{p.roster.length}</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-2"><span>TLD badges issued</span><span className="font-mono font-bold text-slate-100">{tldCount}</span></div>
            <div className="flex justify-between"><span>Finger rings issued</span><span className="font-mono font-bold text-slate-100">{ringCount}</span></div>
          </div>
          <Note>Caution readings trigger a work-practice review; critical readings suspend work pending investigation and require dosimeter reissue.</Note>
        </Card>
      </div>

      <Card className="p-4 grid gap-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setRosterHidden(h => !h)} className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200">
            {rosterHidden ? '▸' : '▾'} Monitored Persons Roster ({p.roster.length})
          </button>
          <BtnPrimary onClick={() => { setRosterEdit(null); setRosterOpen(true); }}>+ Add Person</BtnPrimary>
        </div>
        {!rosterHidden && (
          p.roster.length === 0 ? <Empty icon="👤">No monitored persons on the roster.</Empty> : (
            <div className={tblWrap}>
              <table className={tbl}>
                <thead><tr>
                  <th className={th}>User</th><th className={th}>Department</th><th className={th}>Isotopes</th><th className={th}>Dosimeter(s)</th><th className={th}></th>
                </tr></thead>
                <tbody>
                  {p.roster.map(r => (
                    <tr key={r.id} className={trSel}>
                      <td className={td}><div className="font-semibold text-slate-100">{r.name}</div>{r.notes && <div className="text-[11px] text-slate-500">{r.notes}</div>}</td>
                      <td className={td}>{r.department || '—'}</td>
                      <td className={td}><div className="flex flex-wrap gap-1">{(r.isotopes || []).map(i => <Badge key={i} kind="mute">{i}</Badge>)}</div></td>
                      <td className={td}>
                        <span className="inline-flex gap-2 whitespace-nowrap">
                          {r.tld && <span className="text-emerald-400">✓ TLD</span>}
                          {r.ring && <span className="text-emerald-400">✓ Finger Ring</span>}
                        </span>
                      </td>
                      <td className={td + ' text-right whitespace-nowrap'}>
                        <IconBtn title="Edit" onClick={() => { setRosterEdit(r); setRosterOpen(true); }}>✎</IconBtn>
                        <IconBtn danger title="Remove" onClick={() => p.onRosterDelete(r.id)}>🗑</IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>

      <Card className="p-4 grid gap-3">
        <SectionTitle>Abnormal Readings Log</SectionTitle>
        {sorted.length === 0 ? <Empty icon="📉">No abnormal readings recorded.</Empty> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Month</th><th className={th}>Name</th><th className={th}>Department</th><th className={th}>Reading (mSv)</th><th className={th}>Status</th><th className={th}>Remarks — Action Taken</th>
              </tr></thead>
              <tbody>
                {sorted.map(d => (
                  <tr key={d.id}>
                    <td className={td + ' ' + mono}>{d.month}</td>
                    <td className={td + ' font-semibold text-slate-100'}>{d.name}</td>
                    <td className={td}>{d.department}</td>
                    <td className={td + ' ' + mono}>{d.exposure.toFixed(1)}</td>
                    <td className={td}><Badge kind={doseStatusOf(d.exposure)}>{doseStatusOf(d.exposure)}</Badge></td>
                    <td className={td + ' text-[11px]'}>{d.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {rosterOpen && (
        <RosterModal entry={rosterEdit} persons={p.persons} onClose={() => setRosterOpen(false)}
          onSubmit={r => { p.onRosterSave(rosterEdit, r); setRosterOpen(false); }} />
      )}
    </div>
  );
}
