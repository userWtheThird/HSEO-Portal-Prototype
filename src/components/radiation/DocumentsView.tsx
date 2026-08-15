// Ionizing Radiation Safety Program — Documents tab
// Licence register, Board correspondence log, and the reports & records index.

import React from 'react';
import type { RadiationSource, BoardDocument } from '../../types';
import { Card, SectionTitle, Note, Empty, Badge, BtnPrimary, BtnOutline, IconBtn, tblWrap, tbl, th, td, mono } from './ui';
import { fmtDate, computeLicenceState, licensedSources, iaStage } from './utils';

export interface DocumentsProps {
  sources: RadiationSource[];
  docs: BoardDocument[];
  onDocNew: () => void;
  onDocEdit: (d: BoardDocument) => void;
  onDocDelete: (d: BoardDocument) => void;
  onGoto: (tab: 'inventory' | 'waste' | 'monthly', sub?: string) => void;
}

export function DocumentsView(p: DocumentsProps) {
  const licensed = licensedSources(p.sources).filter(s => iaStage(s) !== 'decommissioned');
  const sortedDocs = [...p.docs].sort((a, b) => b.date.localeCompare(a.date));

  const reports: { icon: string; title: string; desc: string; tab: 'inventory' | 'waste' | 'monthly'; sub?: string }[] = [
    { icon: '🧪', title: 'Quarterly Unsealed Report', desc: 'Acquisitions & consumption for the selected quarter', tab: 'inventory', sub: 'quarterly' },
    { icon: '🗺', title: 'Unsealed Inventory Summary', desc: 'Location × isotope activity on hand (licence renewal)', tab: 'inventory', sub: 'summary' },
    { icon: '📅', title: 'Annual Waste Summary', desc: 'Collected / disposed / storage balance per year', tab: 'waste', sub: 'annual' },
    { icon: '📤', title: 'Waste Disposal Records', desc: 'Standardized disposal records (Record No. WD-YYMMDD)', tab: 'waste', sub: 'disposed' },
    { icon: '📊', title: 'Monthly Summary', desc: 'Waste, dosimetry, tests and renewals for a month', tab: 'monthly' }
  ];

  return (
    <div className="grid gap-4">
      <Card className="p-4 grid gap-3">
        <SectionTitle>Licence Register</SectionTitle>
        {licensed.length === 0 ? <Note>No licensed items registered.</Note> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Item</th><th className={th}>Category</th><th className={th}>Licence No.</th>
                <th className={th}>Expiry</th><th className={th}>Location</th><th className={th}>Document</th>
              </tr></thead>
              <tbody>
                {licensed.map(s => {
                  const lic = computeLicenceState(s);
                  return (
                    <tr key={s.id}>
                      <td className={td + ' font-semibold text-slate-100'}>{s.sourceName || s.equipmentDescription}</td>
                      <td className={td}>{s.category === 'apparatus' ? 'Apparatus' : s.category === 'sealed' ? 'Sealed source' : 'Unsealed source'}</td>
                      <td className={td + ' ' + mono}>{s.licenceNumber}</td>
                      <td className={td}>{s.licenceExpiryDate ? <Badge kind={lic.color}>{lic.label}</Badge> : <span className="text-slate-500">No expiry set</span>}</td>
                      <td className={td}>{s.spaceID || s.location || '—'}</td>
                      <td className={td + ' ' + mono + ' text-[11px]'}>{s.licenceFile || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Note>Decommissioned apparatus are removed from the register — their licence history remains on the inventory record.</Note>
      </Card>

      <Card className="p-4 grid gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle>Board Correspondence</SectionTitle>
          <BtnPrimary onClick={p.onDocNew}>+ Log Correspondence</BtnPrimary>
        </div>
        {sortedDocs.length === 0 ? <Empty icon="✉️">No correspondence logged.</Empty> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Date</th><th className={th}>Direction</th><th className={th}>Subject</th>
                <th className={th}>Relates To</th><th className={th}>File</th><th className={th}></th>
              </tr></thead>
              <tbody>
                {sortedDocs.map(d => (
                  <tr key={d.id}>
                    <td className={td}>{fmtDate(d.date)}</td>
                    <td className={td}><Badge kind={d.direction === 'Sent' ? 'expiring' : 'safe'}>{d.direction}</Badge></td>
                    <td className={td}><div className="font-semibold text-slate-100">{d.subject}</div>{d.notes && <div className="text-[11px] text-slate-500">{d.notes}</div>}</td>
                    <td className={td + ' ' + mono}>{d.relatesTo || '—'}</td>
                    <td className={td + ' ' + mono + ' text-[11px]'}>{d.fileName || '—'}</td>
                    <td className={td + ' text-right whitespace-nowrap'}>
                      <IconBtn title="Edit" onClick={() => p.onDocEdit(d)}>✎</IconBtn>
                      <IconBtn danger title="Delete" onClick={() => p.onDocDelete(d)}>🗑</IconBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4 grid gap-3">
        <SectionTitle>Reports &amp; Records</SectionTitle>
        <div className="grid gap-2">
          {reports.map(r => (
            <div key={r.title} className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-lg px-3.5 py-2.5">
              <span className="text-lg">{r.icon}</span>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-100">{r.title}</div>
                <div className="text-[11px] text-slate-500">{r.desc}</div>
              </div>
              <BtnOutline onClick={() => p.onGoto(r.tab, r.sub)}>Open</BtnOutline>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
