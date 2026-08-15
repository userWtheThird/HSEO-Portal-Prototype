// Ionizing Radiation Safety Program — pure helpers & report data builders
// (ported from the standalone IonizingRadiationProgram.html workflow)

import type {
  RadiationSource, IrpRua, IrpRuaGroup, IsotopeUseEntry, WasteContainer,
  IaStage, LeakTestRecord, SwipeTestRecord, LicenceRecord
} from '../../types';
import {
  CHECK_INTERVAL_DAYS, LICENCE_ALERT_MONTHS, RUA_ALERT_DAYS, UCII_TO_MBQ,
  HALF_LIFE_DAYS, DOSE_CAUTION_LIMIT, DOSE_CRITICAL_LIMIT
} from './constants';

export type BadgeKind =
  | 'safe' | 'alert' | 'due' | 'expired' | 'expiring' | 'valid' | 'mute'
  | 'normal' | 'caution' | 'critical' | 'overdue' | 'ok'
  | 'communal' | 'individual' | 'alpha' | 'beta' | 'gamma';

let uidCounter = 0;
export function uid(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + (++uidCounter) + '-' + Math.random().toString(36).slice(2, 7);
}
export function todayISO(): string { return new Date().toISOString().slice(0, 10); }
export function currentMonth(): string { return todayISO().slice(0, 7); }
export function daysUntil(dateStr?: string): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr); const t = new Date(todayISO());
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}
export function fmtDate(d?: string): string { return d || '—'; }
export function addDateDays(iso: string, days: number): string {
  const parts = iso.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2] + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function addYearISO(baseISO?: string): string {
  const d = baseISO ? new Date(baseISO) : new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function doseStatusOf(v: number): 'normal' | 'caution' | 'critical' {
  return v >= DOSE_CRITICAL_LIMIT ? 'critical' : (v >= DOSE_CAUTION_LIMIT ? 'caution' : 'normal');
}

export function computeLicenceState(source: Pick<RadiationSource, 'licenceExpiryDate'>): { label: string; color: BadgeKind; days?: number } {
  const exp = source.licenceExpiryDate;
  if (!exp) return { label: 'No Expiry Set', color: 'expired' };
  const days = daysUntil(exp);
  if (days < 0) return { label: 'Expired (' + fmtDate(exp) + ')', color: 'expired', days };
  const alertDays = LICENCE_ALERT_MONTHS * 30;
  if (days <= alertDays) return { label: 'Renewal Due in ' + days + ' days', color: 'expiring', days };
  return { label: 'Valid until ' + fmtDate(exp), color: 'valid', days };
}

export function iaStage(s: RadiationSource): IaStage { return s.stage || 'possess-use'; }
export const STAGE_LABEL: Record<IaStage, string> = { 'possess': 'Possess', 'possess-use': 'Possess & Use', 'decommissioned': 'Decommissioned' };
export const STAGE_BADGE: Record<IaStage, BadgeKind> = { 'possess': 'expiring', 'possess-use': 'safe', 'decommissioned': 'mute' };

// ── RUA helpers — isotope entries carry per-isotope use details (old records may hold plain strings) ──
export const EMPTY_ISO_ENTRY: IsotopeUseEntry = { iso: '', description: '', limit: 0, chemicalForm: '', physicalForm: '', expUCi: 0, possUCi: 0 };
export function normIsoEntry(x: IsotopeUseEntry | string): IsotopeUseEntry {
  return typeof x === 'string' ? { iso: x, description: '', limit: 0, chemicalForm: '', physicalForm: '', expUCi: 0, possUCi: 0 } : x;
}
export function isoEntries(g: IrpRuaGroup): IsotopeUseEntry[] { return (g.isotopes || []).map(normIsoEntry); }
export function isoNamesOf(g: IrpRuaGroup): string[] { return isoEntries(g).map(e => e.iso); }

export function ruaExpiryState(u: IrpRua): { label: string; color: BadgeKind; days?: number } {
  if (!u.expiryDate) return { label: 'No Expiry Set', color: 'expired' };
  const days = daysUntil(u.expiryDate);
  if (days < 0) return { label: 'Expired (' + fmtDate(u.expiryDate) + ')', color: 'expired', days };
  if (days <= RUA_ALERT_DAYS) return { label: 'Renewal Due in ' + days + ' days', color: 'expiring', days };
  return { label: 'Valid until ' + fmtDate(u.expiryDate), color: 'valid', days };
}

export function nextRuaNo(ruas: IrpRua[]): string {
  const y = new Date().getFullYear();
  let n = 1, no: string;
  do { no = 'RUA-' + y + '-' + String(n).padStart(3, '0'); n++; } while (ruas.some(u => u.ruaNo === no));
  return no;
}

// Audit trail — compare old vs new PI groups and describe every isotope-use / user change
export function diffRuaGroups(oldGroups: IrpRuaGroup[] | undefined, newGroups: IrpRuaGroup[]): string[] {
  const notes: string[] = [];
  const keyOf = (g: IrpRuaGroup) => g.piId || g.piName || '?';
  const oBy: Record<string, IrpRuaGroup> = {}, nBy: Record<string, IrpRuaGroup> = {};
  (oldGroups || []).forEach(g => oBy[keyOf(g)] = g);
  (newGroups || []).forEach(g => nBy[keyOf(g)] = g);
  Object.keys(nBy).forEach(k => { if (!oBy[k]) notes.push('Added PI group ' + (nBy[k].piName || k) + ' — isotopes: ' + (isoNamesOf(nBy[k]).join(', ') || 'none')); });
  Object.keys(oBy).forEach(k => { if (!nBy[k]) notes.push('Removed PI group ' + (oBy[k].piName || k)); });
  Object.keys(nBy).forEach(k => {
    const og = oBy[k]; if (!og) return;
    const ng = nBy[k], name = ng.piName || k;
    const oIso: Record<string, IsotopeUseEntry> = {}, nIso: Record<string, IsotopeUseEntry> = {};
    isoEntries(og).forEach(e => oIso[e.iso] = e);
    isoEntries(ng).forEach(e => nIso[e.iso] = e);
    Object.keys(nIso).forEach(iso => {
      if (!oIso[iso]) { notes.push(name + ': added isotope ' + iso + ((nIso[iso].limit) ? ' (limit ' + nIso[iso].limit + ' µCi)' : '')); return; }
      const o = oIso[iso], n = nIso[iso], ch: string[] = [];
      if ((o.limit || 0) !== (n.limit || 0)) ch.push('limit ' + (o.limit || 0) + ' → ' + (n.limit || 0) + ' µCi');
      if ((o.expUCi || 0) !== (n.expUCi || 0)) ch.push('experimental ' + (o.expUCi || 0) + ' → ' + (n.expUCi || 0) + ' µCi');
      if ((o.possUCi || 0) !== (n.possUCi || 0)) ch.push('possession ' + (o.possUCi || 0) + ' → ' + (n.possUCi || 0) + ' µCi');
      if ((o.physicalForm || '') !== (n.physicalForm || '')) ch.push('physical form ' + (o.physicalForm || '—') + ' → ' + (n.physicalForm || '—'));
      if ((o.chemicalForm || '') !== (n.chemicalForm || '')) ch.push('chemical form updated');
      if ((o.description || '') !== (n.description || '')) ch.push('experimental description updated');
      if (ch.length) notes.push(name + ' — ' + iso + ': ' + ch.join('; '));
    });
    Object.keys(oIso).forEach(iso => { if (!nIso[iso]) notes.push(name + ': removed isotope ' + iso); });
    const oU: Record<string, string> = {}, nU: Record<string, string> = {};
    (og.users || []).forEach(u => oU[u.name] = u.role);
    (ng.users || []).forEach(u => nU[u.name] = u.role);
    Object.keys(nU).forEach(nm => {
      if (!(nm in oU)) notes.push(name + ': added user ' + nm + ' (' + nU[nm] + ')');
      else if (oU[nm] !== nU[nm]) notes.push(name + ': user ' + nm + ' role ' + oU[nm] + ' → ' + nU[nm]);
    });
    Object.keys(oU).forEach(nm => { if (!(nm in nU)) notes.push(name + ': removed user ' + nm + ' (' + oU[nm] + ')'); });
  });
  return notes;
}

export function swipeRuaState(ruas: IrpRua[], spaceID?: string): { rua?: IrpRua; due: boolean; label: string } {
  const rua = ruas.find(u => u.spaceID === spaceID);
  if (!rua || !rua.nextSwipeTest) return { rua, due: false, label: '—' };
  const days = daysUntil(rua.nextSwipeTest);
  if (days <= 0) return { rua, due: true, label: fmtDate(rua.nextSwipeTest) + ' — OVERDUE' };
  return { rua, due: false, label: fmtDate(rua.nextSwipeTest) + ' (' + days + 'd)' };
}

// Parse a free-text activity string (e.g. '2.0 GBq', '37 MBq', '5 µCi') into µCi for summation
export function parseActivityToUCi(str?: string): number {
  if (!str) return 0;
  const m = String(str).replace(/,/g, '').match(/([\d.]+)\s*(TBq|GBq|MBq|kBq|Bq|µCi|μCi|uCi|mCi|Ci)/i);
  if (!m) return 0;
  const v = parseFloat(m[1]), u = m[2].toLowerCase();
  if (u === 'tbq') return v * 1e12 / 37000;
  if (u === 'gbq') return v * 1e9 / 37000;
  if (u === 'mbq') return v * 1e6 / 37000;
  if (u === 'kbq') return v * 1e3 / 37000;
  if (u === 'bq') return v / 37000;
  if (u === 'mci') return v * 1000;
  if (u === 'ci') return v * 1e6;
  return v; // already µCi
}

export function fmtUCi(x: number): string {
  if (!x) return '0';
  if (x >= 1000) return Math.round(x).toLocaleString('en-US');
  if (x >= 1) return String(Math.round(x * 10) / 10);
  return String(Math.round(x * 1000) / 1000);
}

export function checkStatus(source: RadiationSource): { label: string; cls: BadgeKind } {
  const last = source.lastInventoryCheckDate;
  if (!last) return { label: 'Overdue', cls: 'overdue' };
  const d = daysUntil(last);
  if (-d > CHECK_INTERVAL_DAYS) return { label: 'Overdue', cls: 'overdue' };
  return { label: 'Checked', cls: 'ok' };
}

export function leakEntryText(e: LeakTestRecord): string {
  return e.date + ' — Net ' + (e.net ?? 0).toFixed(1) + ' cpm (measured ' + e.counts + ', background ' + (e.background || 0) + ') — ' + (e.result === 'fail' ? 'FAIL' : 'PASS') + (e.notes ? ' — ' + e.notes : '');
}
export function swipeEntryText(e: SwipeTestRecord): string {
  const label = e.result === 'adal' ? 'ABOVE ADAL' : (e.result === 'positive' ? 'POSITIVE' : 'CLEAN');
  return e.date + ' — Net ' + (e.net ?? 0).toFixed(1) + ' cpm (measured ' + e.counts + ', background ' + (e.background || 0) + ') — ' + label + (e.followUp ? ' — Follow-up: ' + e.followUp : '');
}

// ── Waste decay correction ──
export function activityAtUCi(w: WasteContainer, asOfISO: string): number {
  const a0 = w.activityUCi || 0;
  const t12 = HALF_LIFE_DAYS[w.isotope];
  if (!t12 || !w.collectedDate) return a0;
  const days = (Date.parse(asOfISO) - Date.parse(w.collectedDate)) / 86400000;
  if (!isFinite(days) || days <= 0) return a0;
  return a0 * Math.pow(0.5, days / t12);
}
export function currentActivityUCi(w: WasteContainer): number { return activityAtUCi(w, todayISO()); }

export function recordNoOf(date?: string): string {
  const d = (date || '').replace(/-/g, '');
  return 'WD-' + (d.length === 8 ? d.slice(2) : d);
}

// One disposal instance = containers disposed together (same date, person, method)
export interface DisposalInstance {
  key: string;
  disposedDate?: string;
  disposedBy?: string;
  disposalMethod?: string;
  containers: WasteContainer[];
}
export function disposalInstances(waste: WasteContainer[]): DisposalInstance[] {
  const map: Record<string, DisposalInstance> = {};
  waste.filter(w => w.status === 'disposed').forEach(w => {
    const key = (w.disposedDate || '') + '|' + (w.disposedBy || '') + '|' + (w.disposalMethod || '');
    (map[key] = map[key] || { key, disposedDate: w.disposedDate, disposedBy: w.disposedBy, disposalMethod: w.disposalMethod, containers: [] }).containers.push(w);
  });
  return Object.values(map).sort((a, b) => (b.disposedDate || '').localeCompare(a.disposedDate || ''));
}

export function nextTagNo(waste: WasteContainer[]): string {
  const d = new Date();
  const base = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  if (!waste.some(w => w.tagNo === base)) return base;
  let n = 2;
  while (waste.some(w => w.tagNo === base + '-' + n)) n++;
  return base + '-' + n;
}

// ── Report data builders ──

// Unsealed activity per location (rows) × isotope (columns), with isotope totals
export function unsealedSummaryData(sources: RadiationSource[]) {
  const us = sources.filter(s => s.category === 'unsealed');
  const isotopes = [...new Set(us.map(s => s.isotope || '—'))].sort();
  const locs = [...new Set(us.map(s => s.spaceID || s.location || '—'))].sort();
  const grid: Record<string, Record<string, number>> = {}, isoTotals: Record<string, number> = {}, locTotals: Record<string, number> = {};
  let grand = 0;
  us.forEach(s => {
    const loc = s.spaceID || s.location || '—', iso = s.isotope || '—', a = parseActivityToUCi(s.activity);
    grid[loc] = grid[loc] || {};
    grid[loc][iso] = (grid[loc][iso] || 0) + a;
    isoTotals[iso] = (isoTotals[iso] || 0) + a;
    locTotals[loc] = (locTotals[loc] || 0) + a;
    grand += a;
  });
  return { isotopes, locs, grid, isoTotals, locTotals, grand };
}

// Quarterly acquisitions & consumption report for unsealed sources
export function quarterlyData(sources: RadiationSource[], qy: number, qq: number) {
  const qMonths = [0, 1, 2].map(i => String(qy) + '-' + String((qq - 1) * 3 + i + 1).padStart(2, '0'));
  const inQ = (d?: string) => qMonths.some(m => (d || '').startsWith(m));
  const us = sources.filter(s => s.category === 'unsealed');
  const acquired = us.filter(s => inQ(s.acquiredDate)).sort((a, b) => (a.acquiredDate || '').localeCompare(b.acquiredDate || ''));
  const spent: { date: string; volume?: string; activityUCi: number; by?: string; notes?: string; isotope?: string; sourceName?: string; location?: string }[] = [];
  us.forEach(s => (s.usageLog || []).forEach(u => { if (inQ(u.date)) spent.push({ ...u, isotope: s.isotope, sourceName: s.sourceName, location: s.spaceID || s.location }); }));
  spent.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const totA = acquired.reduce((a, s) => a + parseActivityToUCi(s.activity), 0);
  const totS = spent.reduce((a, u) => a + (u.activityUCi || 0), 0);
  return { acquired, spent, totA, totS };
}

export function annualWasteData(waste: WasteContainer[], y: number) {
  const inY = (d?: string) => (d || '').startsWith(String(y));
  const byIso: Record<string, { cn: number; cu: number; dn: number; du: number; sn: number }> = {};
  waste.forEach(w => {
    const iso = w.isotope || '—';
    byIso[iso] = byIso[iso] || { cn: 0, cu: 0, dn: 0, du: 0, sn: 0 };
    if (inY(w.collectedDate)) { byIso[iso].cn++; byIso[iso].cu += w.activityUCi || 0; }
    if (w.status === 'disposed' && inY(w.disposedDate)) { byIso[iso].dn++; byIso[iso].du += w.activityUCi || 0; }
    if (w.status !== 'disposed') byIso[iso].sn++;
  });
  const keys = Object.keys(byIso).sort((a, b) => byIso[b].cu - byIso[a].cu);
  const tot = keys.reduce((t, k) => ({ cn: t.cn + byIso[k].cn, cu: t.cu + byIso[k].cu, dn: t.dn + byIso[k].dn, du: t.du + byIso[k].du, sn: t.sn + byIso[k].sn }), { cn: 0, cu: 0, dn: 0, du: 0, sn: 0 });
  return { keys, byIso, tot };
}

export function wasteMonthSummary(waste: WasteContainer[], month: string, kind: 'collected' | 'disposed') {
  const monthRows = kind === 'collected'
    ? waste.filter(w => (w.collectedDate || '').startsWith(month))
    : waste.filter(w => w.status === 'disposed' && (w.disposedDate || '').startsWith(month));
  const byIso: Record<string, { containers: number; uci: number }> = {};
  monthRows.forEach(w => {
    byIso[w.isotope] = byIso[w.isotope] || { containers: 0, uci: 0 };
    byIso[w.isotope].containers++;
    byIso[w.isotope].uci += w.activityUCi || 0;
  });
  const isoKeys = Object.keys(byIso).sort((a, b) => byIso[b].uci - byIso[a].uci);
  const totUCi = monthRows.reduce((a, w) => a + (w.activityUCi || 0), 0);
  return { monthRows, byIso, isoKeys, totUCi };
}

export interface RenewalEvent {
  date?: string; item: string; cat?: string; catLabel?: string;
  type: 'New' | 'Renewal' | 'Updated'; licence: string; by: string; notes?: string;
}
export function newRenewalEvents(sources: RadiationSource[], ruas: IrpRua[], month: string): RenewalEvent[] {
  const events: RenewalEvent[] = [];
  sources.forEach(s => {
    let inMonth = false;
    (s.licenceHistory || []).forEach(h => {
      if ((h.changedDate || '').startsWith(month)) {
        inMonth = true;
        const n = h.notes || '';
        const type: RenewalEvent['type'] = /renew/i.test(n) ? 'Renewal' : (/initial|new/i.test(n) ? 'New' : 'Updated');
        events.push({ date: h.changedDate, item: s.sourceName || s.equipmentDescription || '—', cat: s.category, type, licence: h.licenceNumber || s.licenceNumber || '', by: h.changedBy || '', notes: n });
      }
    });
    // Items registered without a licence history (e.g., unsealed sources) show up as new via addedDate
    if (!inMonth && (s.addedDate || '').startsWith(month)) {
      events.push({ date: s.addedDate, item: s.sourceName || s.equipmentDescription || '—', cat: s.category, type: 'New', licence: s.licenceNumber || '—', by: '', notes: 'Initial registration' });
    }
  });
  // RUAs are renewed annually — new authorizations and renewals show up here too
  ruas.forEach(u => {
    const label = (u.ruaNo || 'RUA') + ' — ' + (u.spaceID || '—') + ' (' + (u.type || '') + ')';
    if ((u.renewedDate || '').startsWith(month)) {
      events.push({ date: u.renewedDate, item: label, catLabel: 'RUA', type: 'Renewal', licence: '—', by: '', notes: 'Renewed annually — valid until ' + (u.expiryDate || '—') });
    } else if ((u.addedDate || '').startsWith(month)) {
      events.push({ date: u.addedDate, item: label, catLabel: 'RUA', type: 'New', licence: '—', by: '', notes: 'New authorization — valid until ' + (u.expiryDate || '—') });
    }
  });
  return events.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export interface TestFlag { date?: string; kind: string; item: string; dept?: string; result: string; followUp?: string }
export function testSummaryData(sources: RadiationSource[], ruas: IrpRua[], month: string, deptOf: (s: RadiationSource) => string) {
  let leakDone = 0; const leakFlags: TestFlag[] = [];
  sources.filter(s => s.category === 'sealed').forEach(s => {
    (s.leakTestHistory || []).forEach(h => {
      if (!(h.date || '').startsWith(month)) return;
      leakDone++;
      if (h.result === 'fail') leakFlags.push({ date: h.date, kind: 'Leak test', item: s.sourceName || s.equipmentDescription || '—', dept: deptOf(s), result: 'Positive', followUp: h.notes });
    });
  });
  let swDone = 0; const swPosFlags: TestFlag[] = [], swAdalFlags: TestFlag[] = [];
  ruas.forEach(u => {
    (u.swipeHistory || []).forEach(x => {
      if (typeof x === 'string') { if (x.startsWith(month)) swDone++; return; }
      if (!(x.date || '').startsWith(month)) return;
      swDone++;
      if (x.result === 'positive') swPosFlags.push({ date: x.date, kind: 'Swipe test', item: u.spaceID, dept: u.department, result: 'Positive', followUp: x.followUp });
      else if (x.result === 'adal') swAdalFlags.push({ date: x.date, kind: 'Swipe test', item: u.spaceID, dept: u.department, result: 'Above ADAL', followUp: x.followUp });
    });
  });
  const flags = [...leakFlags, ...swPosFlags, ...swAdalFlags].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return { leakDone, leakPos: leakFlags.length, swDone, swPos: swPosFlags.length, swAdal: swAdalFlags.length, flags };
}

// ── Export helpers ──
export function downloadCSV(filename: string, rows: (string | number | undefined | null)[][]): void {
  const csv = rows.map(r => r.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function escHtml(s: unknown): string {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Generic print-to-PDF: opens a clean print window with the report body
export function printCard(title: string, bodyHtml: string): boolean {
  const doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + escHtml(title) + '</title><style>' +
    'body{font-family:"Segoe UI",Arial,sans-serif;color:#000;font-size:12px;padding:32px 44px}' +
    'h1{font-size:16px;text-align:center;text-decoration:underline;margin:0 0 4px}' +
    '.sub{text-align:center;color:#444;font-size:11px;margin-bottom:16px}' +
    'h2{font-size:13px;margin:16px 0 4px}' +
    'table{border-collapse:collapse;width:100%;margin:10px 0} th,td{border:1px solid #000;padding:6px 9px;font-size:11px;text-align:center} th{background:#eee} td.l,th.l{text-align:left} tfoot td{font-weight:700}' +
    'p{font-size:11px;margin:8px 0}' +
    '@media print{body{padding:18px}}' +
    '</style></head><body>' +
    '<h1>' + escHtml(title) + '</h1>' +
    '<div class="sub">Ionizing Radiation Safety Program · Generated ' + fmtDate(todayISO()) + '</div>' +
    bodyHtml +
    '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print()},300)}</scr' + 'ipt>' +
    '</body></html>';
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open(); win.document.write(doc); win.document.close();
  return true;
}

export function printQuarterly(sources: RadiationSource[], qy: number, qq: number): boolean {
  const d = quarterlyData(sources, qy, qq);
  let b = '<h2>1. Acquired in Quarter</h2>';
  b += d.acquired.length ? '<table><thead><tr><th>Date</th><th>Isotope</th><th class="l">Source</th><th class="l">Purchased By</th><th>Storage</th><th>Volume</th><th>Activity (µCi)</th><th class="l">Vendor</th></tr></thead><tbody>' +
    d.acquired.map(s => '<tr><td>' + fmtDate(s.acquiredDate) + '</td><td>' + escHtml(s.isotope) + '</td><td class="l">' + escHtml(s.sourceName) + '</td><td class="l">' + escHtml(s.purchasedBy || '—') + '</td><td>' + escHtml(s.spaceID || s.location) + '</td><td>' + escHtml(s.volume || '—') + '</td><td>' + fmtUCi(parseActivityToUCi(s.activity)) + '</td><td class="l">' + escHtml(s.vendorName || '—') + '</td></tr>').join('') +
    '<tr><td colspan="6" style="text-align:right;font-weight:700">TOTAL ACQUIRED</td><td style="font-weight:700">' + fmtUCi(d.totA) + '</td><td></td></tr></tbody></table>' : '<p>No acquisitions in this quarter.</p>';
  b += '<h2>2. Spent in Quarter</h2>';
  b += d.spent.length ? '<table><thead><tr><th>Date</th><th>Isotope</th><th class="l">Source</th><th>Storage</th><th>Volume</th><th>Activity (µCi)</th><th class="l">Spent By</th><th class="l">Notes</th></tr></thead><tbody>' +
    d.spent.map(u => '<tr><td>' + fmtDate(u.date) + '</td><td>' + escHtml(u.isotope) + '</td><td class="l">' + escHtml(u.sourceName) + '</td><td>' + escHtml(u.location) + '</td><td>' + escHtml(u.volume || '—') + '</td><td>' + fmtUCi(u.activityUCi || 0) + '</td><td class="l">' + escHtml(u.by || '—') + '</td><td class="l">' + escHtml(u.notes || '') + '</td></tr>').join('') +
    '<tr><td colspan="5" style="text-align:right;font-weight:700">TOTAL SPENT</td><td style="font-weight:700">' + fmtUCi(d.totS) + '</td><td colspan="2"></td></tr></tbody></table>' : '<p>No consumption in this quarter.</p>';
  b += '<p>Net change for the quarter: <b>' + (d.totA - d.totS >= 0 ? '+' : '−') + fmtUCi(Math.abs(d.totA - d.totS)) + ' µCi</b></p>';
  return printCard('Quarterly Unsealed Report — ' + qy + ' Q' + qq, b);
}

export function printUnsealedSummary(sources: RadiationSource[]): boolean {
  const d = unsealedSummaryData(sources);
  if (!d.locs.length) return false;
  const b = '<table><thead><tr><th class="l">Location</th>' + d.isotopes.map(i => '<th>' + escHtml(i) + '</th>').join('') + '<th>Total</th></tr></thead><tbody>' +
    d.locs.map(loc => '<tr><td class="l">' + escHtml(loc) + '</td>' + d.isotopes.map(i => '<td>' + (d.grid[loc] && d.grid[loc][i] ? fmtUCi(d.grid[loc][i]) : '—') + '</td>').join('') + '<td>' + fmtUCi(d.locTotals[loc]) + '</td></tr>').join('') +
    '</tbody><tfoot><tr><td class="l">Total (µCi)</td>' + d.isotopes.map(i => '<td>' + fmtUCi(d.isoTotals[i]) + '</td>').join('') + '<td>' + fmtUCi(d.grand) + '</td></tr></tfoot></table>' +
    '<p>All activities in µCi. Prepared for annual licence renewal.</p>';
  return printCard('Unsealed Inventory Summary — Location × Isotope', b);
}

export function printAnnualWaste(waste: WasteContainer[], y: number): boolean {
  const d = annualWasteData(waste, y);
  const b = '<table><thead><tr><th class="l">Isotope</th><th>Collected (containers)</th><th>Collected (µCi)</th><th>Disposed (containers)</th><th>Disposed (µCi)</th><th>Still in Storage</th></tr></thead><tbody>' +
    d.keys.map(k => { const r = d.byIso[k]; return '<tr><td class="l">' + escHtml(k) + '</td><td>' + r.cn + '</td><td>' + fmtUCi(r.cu) + '</td><td>' + r.dn + '</td><td>' + fmtUCi(r.du) + '</td><td>' + r.sn + '</td></tr>'; }).join('') +
    '</tbody><tfoot><tr><td class="l">Total</td><td>' + d.tot.cn + '</td><td>' + fmtUCi(d.tot.cu) + '</td><td>' + d.tot.dn + '</td><td>' + fmtUCi(d.tot.du) + '</td><td>' + d.tot.sn + '</td></tr></tfoot></table>' +
    '<p>Annual waste summary prepared for licence renewal.</p>';
  return printCard('Annual Waste Summary — ' + y, b);
}

// Standardized disposal record PDF — one per disposal instance
export function exportDisposalPDF(ins: DisposalInstance): boolean {
  const recNo = recordNoOf(ins.disposedDate);
  const grp: Record<string, { iso?: string; form?: string; n: number; mbq: number }> = {};
  ins.containers.forEach(w => {
    const k = (w.isotope || '') + '|' + (w.form || '');
    grp[k] = grp[k] || { iso: w.isotope, form: w.form, n: 0, mbq: 0 };
    grp[k].n++; grp[k].mbq += (w.activityUCi || 0) * UCII_TO_MBQ;
  });
  const rows = Object.values(grp);
  const totMBq = rows.reduce((a, r) => a + r.mbq, 0);
  const dest = /contractor/i.test(ins.disposalMethod || '') ? 'Collected by CMO Contractors as municipal waste' : (ins.disposalMethod || '');
  const doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + recNo + ' — Radioactive Waste Disposal Records</title><style>' +
    'body{font-family:"Segoe UI",Arial,sans-serif;color:#000;font-size:13px;padding:36px 48px}' +
    'h1{text-align:center;font-size:17px;text-decoration:underline;margin:0 0 30px}' +
    '.recno{float:right;border:1px solid #000;padding:4px 12px;font-size:12px}' +
    '.frow{display:flex;align-items:flex-end;gap:10px;margin:24px 0} .frow .lab{font-weight:600;white-space:nowrap}' +
    '.uline{flex:1;max-width:340px;border-bottom:1px solid #000;min-height:16px}' +
    'table{border-collapse:collapse;width:100%;margin:20px 0} th,td{border:1px solid #000;padding:7px 10px;font-size:12px;text-align:center} th{font-weight:700}' +
    '@media print{body{padding:20px}}' +
    '</style></head><body>' +
    '<h1>Radioactive Waste Disposal Records</h1>' +
    '<div class="recno">Record No.:&nbsp;&nbsp;<b>' + recNo + '</b></div><div style="clear:both"></div>' +
    '<div class="frow"><span class="lab">Date:</span><div class="uline">' + fmtDate(ins.disposedDate) + '</div></div>' +
    '<div class="frow"><span class="lab">Counting Instrument:</span><div class="uline"></div></div>' +
    '<div class="frow"><span class="lab">Worked by:</span><div class="uline">' + escHtml(ins.disposedBy || '') + '</div></div>' +
    '<table><thead><tr><th>Type of Radionuclide</th><th>Physical Form</th><th>No. of boxes / containers</th><th>Total Disposal Activity (estimated) (MBq)</th></tr></thead><tbody>' +
    rows.map(r => '<tr><td>' + escHtml(r.iso) + '</td><td>' + escHtml(r.form) + '</td><td>' + r.n + '</td><td>' + r.mbq.toFixed(2) + '</td></tr>').join('') +
    '<tr><td colspan="3" style="text-align:right;font-weight:700">Total:</td><td style="font-weight:700">' + totMBq.toFixed(2) + '</td></tr>' +
    '</tbody></table>' +
    '<div class="frow"><span class="lab">% of ALI:</span><div class="uline" style="max-width:120px"></div></div>' +
    '<div class="frow"><span class="lab">Disposal Date:</span><div class="uline" style="max-width:240px">' + fmtDate(ins.disposedDate) + '</div></div>' +
    '<div class="frow"><span class="lab">Destination:</span><div class="uline" style="max-width:320px">' + escHtml(dest) + '</div></div>' +
    '<div class="frow"><span class="lab">Disposal by:</span><div class="uline" style="max-width:260px">' + escHtml(ins.disposedBy || '') + '</div></div>' +
    '<div class="frow"><span class="lab">Signature:</span><div class="uline"></div></div>' +
    '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print()},300)}</scr' + 'ipt>' +
    '</body></html>';
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open(); win.document.write(doc); win.document.close();
  return true;
}

// LicenceRegister helper — sources that carry a licence
export function licensedSources(sources: RadiationSource[]): RadiationSource[] {
  return sources.filter(s => !!s.licenceNumber);
}

export type { LicenceRecord };
