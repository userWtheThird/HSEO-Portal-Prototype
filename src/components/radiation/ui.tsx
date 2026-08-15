// Ionizing Radiation Safety Program — shared UI primitives (dark slate/amber Tailwind)

import React from 'react';
import type { BadgeKind } from './utils';

const BADGE: Record<BadgeKind, string> = {
  safe: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  alert: 'bg-red-500/15 text-red-400 border-red-500/30',
  due: 'bg-red-500/15 text-red-400 border-red-500/30',
  expired: 'bg-red-500/15 text-red-400 border-red-500/30',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
  expiring: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  caution: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  valid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  ok: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  normal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  mute: 'bg-slate-700/40 text-slate-400 border-slate-600/50',
  communal: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  individual: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  alpha: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  beta: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  gamma: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
};

export const Badge: React.FC<{ kind: BadgeKind; children: React.ReactNode; className?: string }> = ({ kind, children, className }) => {
  return (
    <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${BADGE[kind]} ${className || ''}`}>
      {children}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => {
  return <div className={`bg-slate-900 border border-slate-800 rounded-lg ${className || ''}`} onClick={onClick}>{children}</div>;
};

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{children}</div>;
}

export function Note({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[11px] text-slate-500 leading-relaxed ${className || ''}`}>{children}</div>;
}

export function Empty({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div className="text-center py-10 text-slate-500 text-xs">
      {icon && <div className="text-3xl mb-3">{icon}</div>}
      <div>{children}</div>
    </div>
  );
}

export function Modal({ title, icon, onClose, children, footer, wide }: {
  title: React.ReactNode; icon?: string; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-start justify-center overflow-y-auto p-6" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-8`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-slate-100">{icon && <span className="text-amber-500 mr-2">{icon}</span>}{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg leading-none">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-800">{footer}</div>}
      </div>
    </div>
  );
}

export function ErrorBox({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-md px-3 py-2 text-[11px]">{msg}</div>;
}

// ── form field styles ──
export const inpCls = 'w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-600 placeholder:text-slate-600';
export const selCls = inpCls;

export function Field({ label, children, hint, required }: { label: React.ReactNode; children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}{required && <span className="text-amber-500"> *</span>}</label>
      {children}
      {hint && <div className="text-[10px] text-slate-600">{hint}</div>}
    </div>
  );
}

export function FormGrid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

export function BtnPrimary({ children, onClick, type, className, disabled }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; className?: string; disabled?: boolean }) {
  return <button type={type || 'button'} disabled={disabled} onClick={onClick} className={`bg-amber-700 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold px-4 py-2 rounded-md inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${className || ''}`}>{children}</button>;
}
export function BtnOutline({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" onClick={onClick} className={`border border-slate-600 hover:border-amber-500 hover:text-amber-400 text-slate-300 text-xs font-bold px-4 py-2 rounded-md inline-flex items-center justify-center gap-1.5 transition-colors ${className || ''}`}>{children}</button>;
}
export function BtnGreen({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" onClick={onClick} className={`bg-emerald-700 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-md inline-flex items-center justify-center gap-1.5 transition-colors ${className || ''}`}>{children}</button>;
}
export function BtnDanger({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" onClick={onClick} className={`bg-red-800/70 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-md inline-flex items-center justify-center gap-1.5 transition-colors ${className || ''}`}>{children}</button>;
}
export function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title?: string; danger?: boolean }) {
  return <button type="button" title={title} onClick={onClick} className={`text-sm px-1.5 py-0.5 rounded hover:bg-slate-800 ${danger ? 'text-red-400' : 'text-slate-400'}`}>{children}</button>;
}

// ── table helpers ──
export const tblWrap = 'overflow-x-auto border border-slate-800 rounded-lg';
export const tbl = 'w-full text-xs border-collapse';
export const th = 'text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950/60 px-3 py-2 border-b border-slate-800 whitespace-nowrap';
export const td = 'px-3 py-2 border-b border-slate-800/60 text-slate-300 align-top';
export const trSel = 'cursor-pointer hover:bg-slate-800/40 transition-colors';
export const trHl = 'bg-amber-500/10';
export const mono = 'font-mono';

export function KV({ k, children }: { k: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-3 text-xs">
      <span className="text-slate-500">{k}</span>
      <span className="text-right text-slate-200">{children}</span>
    </div>
  );
}

export function HistoryList({ items }: { items: React.ReactNode[] }) {
  if (!items.length) return <Note>No records yet</Note>;
  return (
    <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
      {items.map((x, i) => <div key={i} className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/70 rounded px-2.5 py-1.5 leading-relaxed">{x}</div>)}
    </div>
  );
}

export function Chip({ n, label, hot }: { n: number | string; label: string; hot?: boolean }) {
  return (
    <div className={`bg-slate-950 border rounded-lg px-3.5 py-2 min-w-[118px] ${hot && n ? 'border-red-500/50' : 'border-slate-800'}`}>
      <div className={`font-mono text-xl font-extrabold ${hot && n ? 'text-red-400' : 'text-slate-100'}`}>{n}</div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
