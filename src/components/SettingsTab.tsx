import React, { useState } from 'react';
import { Settings, CalendarClock, Save, Check } from 'lucide-react';
import { FiscalYearConfig } from '../types';

interface SettingsTabProps {
  fiscalYear: FiscalYearConfig;
  onUpdateFiscalYear: (fy: FiscalYearConfig) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function computeFYLabel(fy: FiscalYearConfig): string {
  const now = new Date();
  const thisYear = now.getFullYear();
  const startMonth = fy.startMonth;

  // FY year label: the starting year — e.g. if start is Sep 2025, FY = "2025-2026"
  let fyStartYear = thisYear;
  if (startMonth > now.getMonth() + 1) {
    // FY start month hasn't arrived yet this calendar year, so FY started last year
    fyStartYear = thisYear - 1;
  }
  const fyEndYear = fyStartYear + 1;
  return `FY ${fyStartYear}-${fyEndYear}`;
}

function computeFYRange(fy: FiscalYearConfig): { start: string; end: string; startYear: number; endYear: number } {
  const now = new Date();
  const thisYear = now.getFullYear();
  const startMonth = fy.startMonth;

  let fyStartYear = thisYear;
  if (startMonth > now.getMonth() + 1) {
    fyStartYear = thisYear - 1;
  }
  const fyEndYear = fyStartYear + 1;

  const start = `${fyStartYear}-${String(fy.startMonth).padStart(2, '0')}-${String(fy.startDay).padStart(2, '0')}`;
  const end = `${fyEndYear}-${String(fy.endMonth).padStart(2, '0')}-${String(fy.endDay).padStart(2, '0')}`;
  return { start, end, startYear: fyStartYear, endYear: fyEndYear };
}

export { computeFYLabel, computeFYRange, MONTHS, MONTH_SHORT };

export default function SettingsTab({ fiscalYear, onUpdateFiscalYear }: SettingsTabProps) {
  const [draft, setDraft] = useState<FiscalYearConfig>({ ...fiscalYear });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateFiscalYear(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fyLabel = computeFYLabel(fiscalYear);
  const fyRange = computeFYRange(fiscalYear);

  const startDays = getDaysInMonth(draft.startMonth, new Date().getFullYear());
  const endDays = getDaysInMonth(draft.endMonth, new Date().getFullYear());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Portal Settings</h1>
          <p className="text-xs text-slate-400">Configure global preferences for the HSEO portal.</p>
        </div>
      </div>

      {/* Fiscal Year Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-bold text-slate-200">Fiscal Year Configuration</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Current FY display */}
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Fiscal Year</p>
              <p className="text-2xl font-bold text-black mt-0.5">{fyLabel}</p>
              <p className="text-xs text-slate-400 mt-1">
                {fyRange.startYear === fyRange.endYear - 1
                  ? `${MONTH_SHORT[fiscalYear.startMonth - 1]} ${fiscalYear.startDay}, ${fyRange.startYear} — ${MONTH_SHORT[fiscalYear.endMonth - 1]} ${fiscalYear.endDay}, ${fyRange.endYear}`
                  : `${MONTH_SHORT[fiscalYear.startMonth - 1]} ${fiscalYear.startDay} — ${MONTH_SHORT[fiscalYear.endMonth - 1]} ${fiscalYear.endDay}`}
              </p>
            </div>
          </div>

          {/* Start date config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Fiscal Year Start</label>
              <div className="flex gap-2">
                <select
                  value={draft.startMonth}
                  onChange={e => setDraft({ ...draft, startMonth: Number(e.target.value) })}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={draft.startDay}
                  onChange={e => setDraft({ ...draft, startDay: Number(e.target.value) })}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {Array.from({ length: startDays }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1.5">Fiscal Year End</label>
              <div className="flex gap-2">
                <select
                  value={draft.endMonth}
                  onChange={e => setDraft({ ...draft, endMonth: Number(e.target.value) })}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={draft.endDay}
                  onChange={e => setDraft({ ...draft, endDay: Number(e.target.value) })}
                  className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  {Array.from({ length: endDays }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
