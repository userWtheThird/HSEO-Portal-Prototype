// Ionizing Radiation Safety Program — Isotope Reference tab
// Searchable reference table: emission type, half-life, principal emissions.

import React, { useMemo, useState } from 'react';
import { Card, Note, Empty, Badge, tblWrap, tbl, th, td, mono, inpCls } from './ui';
import { ISOTOPE_DATA } from './constants';
import type { BadgeKind } from './utils';

// Normalize search text so users can type 'alpha', 'beta', 'gamma', 'positron' etc.
function norm(s: string): string {
  return s.toLowerCase()
    .replace(/positron|β\+|beta\+/g, 'positron ')
    .replace(/alpha|α/g, ' alpha ')
    .replace(/gamma|γ/g, ' gamma ')
    .replace(/beta−|beta-|β−|β-/g, ' betaminus ')
    .replace(/beta|β/g, ' betaminus ');
}

function EmissionBadges({ emission }: { emission: string }) {
  const kinds: { label: string; kind: BadgeKind }[] = [];
  if (/α/.test(emission)) kinds.push({ label: 'α', kind: 'alpha' });
  if (/β/.test(emission)) kinds.push({ label: 'β', kind: 'beta' });
  if (/γ|X-ray/i.test(emission)) kinds.push({ label: 'γ', kind: 'gamma' });
  return <span className="inline-flex gap-1">{kinds.map(k => <Badge key={k.label} kind={k.kind}>{k.label}</Badge>)}</span>;
}

export function IsotopesView() {
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    if (!q.trim()) return ISOTOPE_DATA;
    const nq = norm(q);
    return ISOTOPE_DATA.filter(e =>
      norm(e.iso + ' ' + e.name + ' ' + e.emission + ' ' + e.halfLife + ' ' + e.energy).includes(nq.trim()) ||
      (e.iso + ' ' + e.name + ' ' + e.emission + ' ' + e.halfLife + ' ' + e.energy).toLowerCase().includes(q.trim().toLowerCase())
    );
  }, [q]);

  return (
    <div className="grid gap-3">
      <input className={inpCls + ' max-w-[320px]'} placeholder="Search isotope, name or emission (alpha, beta, gamma, positron…)" value={q} onChange={e => setQ(e.target.value)} />
      <Card className="p-4 grid gap-2">
        {rows.length === 0 ? <Empty icon="📖">No isotopes match your search.</Empty> : (
          <div className={tblWrap}>
            <table className={tbl}>
              <thead><tr>
                <th className={th}>Isotope</th><th className={th}>Emission</th><th className={th}>Half-life</th><th className={th}>Principal Emissions</th>
              </tr></thead>
              <tbody>
                {rows.map(e => (
                  <tr key={e.iso}>
                    <td className={td}><span className={mono + ' font-bold text-slate-100'}>{e.iso}</span> <span className="text-slate-400">{e.name}</span></td>
                    <td className={td}><EmissionBadges emission={e.emission} /> <span className="text-slate-500 text-[11px]">{e.emission}</span></td>
                    <td className={td + ' ' + mono}>{e.halfLife}</td>
                    <td className={td + ' text-[11px]'}>{e.energy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Note>Standard literature values — used as reference for shielding, survey and decay-correction decisions.</Note>
      </Card>
    </div>
  );
}
