// Ionizing Radiation Safety Program — Monthly Summary tab
// Month picker + four collapsible sections: Waste, Dosimetry, Leak & Swipe Tests, New & Renewed.

import React, { useState } from 'react';
import type { RadiationSource, IrpRua, WasteContainer, DoseReading, DoseRosterEntry } from '../../types';
import { Card, SectionTitle, Note, Empty, Badge, Chip, tblWrap, tbl, th, td, mono, inpCls } from './ui';
import {
  currentMonth, fmtDate, fmtUCi, doseStatusOf, wasteMonthSummary, testSummaryData, newRenewalEvents
} from './utils';
import { UCII_TO_MBQ } from './constants';

export interface MonthlyProps {
  sources: RadiationSource[];
  ruas: IrpRua[];
  waste: WasteContainer[];
  doses: DoseReading[];
  roster: DoseRosterEntry[];
}

function MSection({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <Card>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-slate-100">
        <span>{title}</span><span>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="px-4 pb-4 grid gap-3">{children}</div>}
    </Card>
  );
}

export function MonthlyView(p: MonthlyProps) {
  const [month, setMonth] = useState(currentMonth());
  const col = wasteMonthSummary(p.waste, month, 'collected');
  const dis = wasteMonthSummary(p.waste, month, 'disposed');
  const tests = testSummaryData(p.sources, p.ruas, month, s => s.department || '—');
  const events = newRenewalEvents(p.sources, p.ruas, month);
  const monthDoses = p.doses.filter(d => d.month === month).sort((a, b) => b.exposure - a.exposure);
  const tldCount = p.roster.filter(r => r.tld).length;
  const ringCount = p.roster.filter(r => r.ring).length;

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <input type="month" className={inpCls + ' max-w-[180px]'} value={month} onChange={e => setMonth(e.target.value)} />
        <Note>Program activity for {month} — feeds the monthly radiation safety report to the Board.</Note>
      </div>

      <MSection title="🛢 Waste" defaultOpen>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="grid gap-2 content-start">
            <SectionTitle>Collected — {col.monthRows.length} container{col.monthRows.length === 1 ? '' : 's'}, {fmtUCi(col.totUCi)} µCi ({(col.totUCi * UCII_TO_MBQ).toFixed(3)} MBq)</SectionTitle>
            {col.isoKeys.length === 0 ? <Note>No collections this month.</Note> : (
              <div className={tblWrap}>
                <table className={tbl}>
                  <thead><tr><th className={th}>Isotope</th><th className={th}>Containers</th><th className={th}>Activity (µCi)</th><th className={th}>MBq</th></tr></thead>
                  <tbody>
                    {col.isoKeys.map(k => (
                      <tr key={k}><td className={td + ' ' + mono}>{k}</td><td className={td}>{col.byIso[k].containers}</td><td className={td + ' ' + mono}>{fmtUCi(col.byIso[k].uci)}</td><td className={td + ' ' + mono}>{(col.byIso[k].uci * UCII_TO_MBQ).toFixed(3)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="grid gap-2 content-start">
            <SectionTitle>Disposed — {dis.monthRows.length} container{dis.monthRows.length === 1 ? '' : 's'}, {fmtUCi(dis.totUCi)} µCi ({(dis.totUCi * UCII_TO_MBQ).toFixed(3)} MBq)</SectionTitle>
            {dis.isoKeys.length === 0 ? <Note>No disposals this month.</Note> : (
              <div className={tblWrap}>
                <table className={tbl}>
                  <thead><tr><th className={th}>Isotope</th><th className={th}>Containers</th><th className={th}>Activity (µCi)</th><th className={th}>MBq</th></tr></thead>
                  <tbody>
                    {dis.isoKeys.map(k => (
                      <tr key={k}><td className={td + ' ' + mono}>{k}</td><td className={td}>{dis.byIso[k].containers}</td><td className={td + ' ' + mono}>{fmtUCi(dis.byIso[k].uci)}</td><td className={td + ' ' + mono}>{(dis.byIso[k].uci * UCII_TO_MBQ).toFixed(3)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </MSection>

      <MSection title="👤 Dosimetry">
        <div className="flex flex-wrap gap-2">
          <Chip n={p.roster.length} label="Monitored persons" />
          <Chip n={tldCount} label="TLD badges" />
          <Chip n={ringCount} label="Finger rings" />
          <Chip n={monthDoses.length} label="Abnormal readings" hot={monthDoses.some(d => doseStatusOf(d.exposure) === 'critical')} />
        </div>
        {monthDoses.length === 0 ? <Note>No abnormal readings logged in {month}.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr><th className={th}>Name</th><th className={th}>Department</th><th className={th}>Reading (mSv)</th><th className={th}>Status</th><th className={th}>Action Taken</th></tr></thead>
              <tbody>
                {monthDoses.map(d => (
                  <tr key={d.id}>
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
      </MSection>

      <MSection title="🧫 Leak & Swipe Tests">
        <div className="flex flex-wrap gap-2">
          <Chip n={tests.leakDone} label="Leak tests done" />
          <Chip n={tests.leakPos} label="Leak positives" hot={tests.leakPos > 0} />
          <Chip n={tests.swDone} label="Swipe tests done" />
          <Chip n={tests.swPos} label="Swipe positives" hot={tests.swPos > 0} />
          <Chip n={tests.swAdal} label="Above ADAL" hot={tests.swAdal > 0} />
        </div>
        {tests.flags.length === 0 ? <Note>No positive or above-ADAL results this month.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr><th className={th}>Date</th><th className={th}>Test</th><th className={th}>Item / Room</th><th className={th}>Department</th><th className={th}>Result</th><th className={th}>Follow-up</th></tr></thead>
              <tbody>
                {tests.flags.map((f, i) => (
                  <tr key={i}>
                    <td className={td}>{fmtDate(f.date)}</td>
                    <td className={td}>{f.kind}</td>
                    <td className={td + ' font-semibold text-slate-100'}>{f.item}</td>
                    <td className={td}>{f.dept || '—'}</td>
                    <td className={td}><Badge kind="alert">{f.result}</Badge></td>
                    <td className={td + ' text-[11px]'}>{f.followUp || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MSection>

      <MSection title="📜 New & Renewed">
        {events.length === 0 ? <Note>No new registrations or renewals in {month}.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr><th className={th}>Date</th><th className={th}>Item</th><th className={th}>Category</th><th className={th}>Type</th><th className={th}>Licence</th><th className={th}>Notes</th></tr></thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i}>
                    <td className={td}>{fmtDate(e.date)}</td>
                    <td className={td + ' font-semibold text-slate-100'}>{e.item}</td>
                    <td className={td}>{e.catLabel || e.cat || '—'}</td>
                    <td className={td}><Badge kind={e.type === 'New' ? 'safe' : e.type === 'Renewal' ? 'expiring' : 'mute'}>{e.type}</Badge></td>
                    <td className={td + ' ' + mono}>{e.licence || '—'}</td>
                    <td className={td + ' text-[11px]'}>{e.notes || ''}{e.by ? ' — by ' + e.by : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MSection>
    </div>
  );
}
