import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Search, 
  FileText, 
  UserPlus, 
  TrendingUp,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { User, AuditLog, Inspection, HotWorkPermit, WaterLog, IeqSample, ExposureRecord } from '../types';

interface OverviewTabProps {
  currentUser: User;
  auditLogs: AuditLog[];
  inspections: Inspection[];
  permits: HotWorkPermit[];
  waterLogs: WaterLog[];
  ieqSamples: IeqSample[];
  exposureRecords: ExposureRecord[];
  onQuickNavigate: (tabId: string) => void;
}

export default function OverviewTab({
  currentUser,
  auditLogs,
  inspections,
  permits,
  waterLogs,
  ieqSamples,
  exposureRecords,
  onQuickNavigate,
}: OverviewTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');

  // Activity period selector
  const [periodMode, setPeriodMode] = useState<'month' | 'range'>('month');
  const now = new Date();
  const [activityYear, setActivityYear] = useState(String(now.getFullYear()));
  const [activityMonth, setActivityMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [rangeStart, setRangeStart] = useState(`${now.getFullYear()}-01-01`);
  const [rangeEnd, setRangeEnd] = useState(now.toISOString().split('T')[0]);

  // Calculate compliance statistics
  const completedInspections = inspections.filter(i => i.status === 'completed');
  const avgInspectionScore = completedInspections.length > 0
    ? Math.round(completedInspections.reduce((acc, curr) => acc + curr.score, 0) / completedInspections.length)
    : 100;

  const activePermitsCount = permits.filter(p => p.status === 'active').length;
  const pendingPermitsCount = permits.filter(p => p.status === 'draft').length;
  const criticalWaterLogs = waterLogs.filter(w => w.status === 'fail' || w.status === 'action_required').length;

  // Let's compute a dynamic Compliance Rating
  const totalPrograms = 7;
  // Criteria scores out of 100
  const inspectionFactor = avgInspectionScore;
  const permitFactor = permits.filter(p => p.status === 'approved' || p.status === 'active' || p.status === 'completed').length / (permits.length || 1) * 100;
  const waterFactor = (waterLogs.filter(w => w.status === 'pass').length / (waterLogs.length || 1)) * 100;
  const globalComplianceScore = Math.round((inspectionFactor + permitFactor + waterFactor + 95 * 4) / totalPrograms); // remaining programs default to 95 for mock consistency

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = programFilter === 'All' || log.program === programFilter;
    return matchesSearch && matchesProgram;
  });

  // Unique program names from audit logs for filter dropdown
  const uniquePrograms = ['All', ...Array.from(new Set(auditLogs.map(l => l.program)))];
  
  // Month names for dropdown
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  // Available years across all data sources
  const allYears = React.useMemo(() => {
    const yrs = new Set<string>();
    inspections.forEach(i => { if (i.date) yrs.add(i.date.slice(0, 4)); });
    permits.forEach(p => { if (p.date) yrs.add(p.date.slice(0, 4)); });
    waterLogs.forEach(w => { if (w.testDate) yrs.add(w.testDate.slice(0, 4)); });
    ieqSamples.forEach(s => { if (s.date) yrs.add(s.date.slice(0, 4)); });
    exposureRecords.forEach(e => { if (e.samplingDate) yrs.add(e.samplingDate.slice(0, 4)); });
    return Array.from(yrs).sort().reverse();
  }, [inspections, permits, waterLogs, ieqSamples, exposureRecords]);
  
  // Compute activity counts for the selected period
  const activityCounts = React.useMemo(() => {
    const inRange = (date: string) => {
      if (!date) return false;
      if (periodMode === 'month') {
        return date.startsWith(`${activityYear}-${activityMonth}`);
      }
      return date >= rangeStart && date <= rangeEnd;
    };
    return {
      inspections: inspections.filter(i => inRange(i.date)).length,
      permits: permits.filter(p => inRange(p.date)).length,
      water: waterLogs.filter(w => inRange(w.testDate)).length,
      ieq: ieqSamples.filter(s => inRange(s.date)).length,
      exposure: exposureRecords.filter(e => inRange(e.samplingDate)).length,
    };
  }, [periodMode, activityYear, activityMonth, rangeStart, rangeEnd, inspections, permits, waterLogs, ieqSamples, exposureRecords]);
  
  const activityTotal = activityCounts.inspections + activityCounts.permits + activityCounts.water + activityCounts.ieq + activityCounts.exposure;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-emerald-500 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Simulation Environment
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">HSEO Multi-User Portal</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Welcome back, <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.title}). 
              You have access to coordinate occupational health and safety programs, track live permits, and review simulated multi-user audits.
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-4">
            <div className="relative flex items-center justify-center w-14 h-14">
              {/* SVG Circle Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" className="stroke-slate-700" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  className="stroke-emerald-500 transition-all duration-500" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - globalComplianceScore / 100)}
                />
              </svg>
              <span className="absolute text-sm font-bold text-slate-100">{globalComplianceScore}%</span>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Compliance Rating</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">High Performance (Level A)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inspection summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 font-medium px-2 py-0.5 rounded-full">
              Score: {avgInspectionScore}%
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspection Program</span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              {completedInspections.length} Audits Completed
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              1 checklist pending review
            </p>
          </div>
          <button 
            onClick={() => onQuickNavigate('inspections')}
            className="text-left text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-4 pt-3 border-t border-slate-800 flex items-center justify-between"
          >
            Launch Audits <span>&rarr;</span>
          </button>
        </div>

        {/* Hot Work Permit summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            {activePermitsCount > 0 ? (
              <span className="text-xs bg-rose-500/15 text-rose-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                {activePermitsCount} Active
              </span>
            ) : (
              <span className="text-xs bg-slate-800 text-slate-400 font-medium px-2 py-0.5 rounded-full">
                No active permits
              </span>
            )}
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hot Work Permits</span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              {activePermitsCount} Active / {pendingPermitsCount} Draft
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Requires supervisor sign-off on fire watch safety plans.
            </p>
          </div>
          <button 
            onClick={() => onQuickNavigate('hotwork')}
            className="text-left text-xs font-semibold text-rose-400 hover:text-rose-300 mt-4 pt-3 border-t border-slate-800 flex items-center justify-between"
          >
            Manage Permits <span>&rarr;</span>
          </button>
        </div>

        {/* Water Sanitation summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="h-5 w-5" />
            </div>
            {criticalWaterLogs > 0 ? (
              <span className="text-xs bg-amber-500/15 text-amber-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                {criticalWaterLogs} Alerts
              </span>
            ) : (
              <span className="text-xs bg-emerald-500/15 text-emerald-400 font-medium px-2 py-0.5 rounded-full">
                All Passed
              </span>
            )}
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Water Sanitation</span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              {waterLogs.length} Monitoring Points
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Legionella, pH levels and Chlorine dosing active.
            </p>
          </div>
          <button 
            onClick={() => onQuickNavigate('water')}
            className="text-left text-xs font-semibold text-cyan-400 hover:text-cyan-300 mt-4 pt-3 border-t border-slate-800 flex items-center justify-between"
          >
            Review Logs <span>&rarr;</span>
          </button>
        </div>

        {/* Indoor Environmental Quality summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 font-medium px-2 py-0.5 rounded-full">
              Stable
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IEQ & HVAC Systems</span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              CO2 & VOC Tracked
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ventilation rates mapped against human occupancies.
            </p>
          </div>
          <button 
            onClick={() => onQuickNavigate('ieq')}
            className="text-left text-xs font-semibold text-emerald-400 hover:text-emerald-300 mt-4 pt-3 border-t border-slate-800 flex items-center justify-between"
          >
            Inspect Air Quality <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Program Activity Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
              <BarChart3 className="text-cyan-400 h-4 w-4" />
              Program Activity Summary
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Number of records conducted in the selected period.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period mode toggle */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              <button onClick={() => setPeriodMode('month')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${periodMode === 'month' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                <Calendar className="h-3 w-3 inline mr-1" />Month
              </button>
              <button onClick={() => setPeriodMode('range')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${periodMode === 'range' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                Date Range
              </button>
            </div>
            {/* Month selector */}
            {periodMode === 'month' && (
              <>
                <select value={activityYear} onChange={(e) => setActivityYear(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer">
                  {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={activityMonth} onChange={(e) => setActivityMonth(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 cursor-pointer">
                  {MONTH_LABELS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                </select>
              </>
            )}
            {/* Range selector */}
            {periodMode === 'range' && (
              <>
                <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5" />
                <span className="text-slate-500 text-xs">to</span>
                <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5" />
              </>
            )}
          </div>
        </div>

        {/* Activity cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Inspections', count: activityCounts.inspections, numClass: 'text-2xl font-bold text-indigo-400', borderClass: 'hover:border-indigo-500/40', tab: 'inspections' },
            { label: 'Hot Work Permits', count: activityCounts.permits, numClass: 'text-2xl font-bold text-rose-400', borderClass: 'hover:border-rose-500/40', tab: 'hotwork' },
            { label: 'Water Sanitation', count: activityCounts.water, numClass: 'text-2xl font-bold text-cyan-400', borderClass: 'hover:border-cyan-500/40', tab: 'water' },
            { label: 'IEQ Samples', count: activityCounts.ieq, numClass: 'text-2xl font-bold text-emerald-400', borderClass: 'hover:border-emerald-500/40', tab: 'ieq' },
            { label: 'Exposure Records', count: activityCounts.exposure, numClass: 'text-2xl font-bold text-amber-400', borderClass: 'hover:border-amber-500/40', tab: 'exposure' },
            { label: 'Total', count: activityTotal, numClass: 'text-2xl font-bold text-slate-300', borderClass: 'hover:border-slate-500/40', tab: '' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.tab && onQuickNavigate(item.tab)}
              className={`bg-slate-800/50 border border-slate-800 rounded-xl p-3 text-center ${item.borderClass} transition ${item.tab ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={item.numClass}>{item.count}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Program Quick Grid & Compliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Breakdown Chart / List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase mb-4 flex items-center gap-2">
            <CheckCircle className="text-indigo-400 h-4 w-4" />
            Compliance Status Index
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Inspection Program</span>
                <span className="text-emerald-400 font-bold">{inspectionFactor}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${inspectionFactor}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Radiation Safety Program</span>
                <span className="text-emerald-400 font-bold">92%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `92%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Laser Hazard Control</span>
                <span className="text-emerald-400 font-bold">85%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `85%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Hot Work Permits Controls</span>
                <span className="text-amber-400 font-bold">{Math.round(permitFactor)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${permitFactor}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Hazardous Waste Protocols</span>
                <span className="text-emerald-400 font-bold">98%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `98%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Water Sanitation Testing</span>
                <span className="text-rose-400 font-bold">{Math.round(waterFactor)}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${waterFactor}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Indoor Environmental Quality</span>
                <span className="text-emerald-400 font-bold">94%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `94%` }} />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-300">Audit Alert:</strong> System detected outstanding leak test for Cesium-137 calibration source in Wing D and a low pH log at the chemistry lab discharge line. Resolving these items improves rating.
            </div>
          </div>
        </div>

        {/* Consolidated Multi-user Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
                <Activity className="text-emerald-400 h-4 w-4" />
                Collaborative Audit & Activity Trail
              </h2>
              <p className="text-xs text-slate-400 mt-1">Real-time actions taken by multiple team members in this shared workspace.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..." 
                  className="bg-slate-800/80 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                />
              </div>
              <div className="relative">
                <select 
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="bg-slate-800/80 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  {uniquePrograms.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-2.5 h-3 w-3 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3 custom-scrollbar">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => {
                let programBadgeColor = 'bg-slate-800 text-slate-300';
                if (log.program === 'Hot Work') programBadgeColor = 'bg-rose-500/15 text-rose-400 border border-rose-500/25';
                else if (log.program === 'Radiation') programBadgeColor = 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
                else if (log.program === 'Laser') programBadgeColor = 'bg-purple-500/15 text-purple-400 border border-purple-500/25';
                else if (log.program === 'Inspection') programBadgeColor = 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25';
                else if (log.program === 'Hazardous Waste') programBadgeColor = 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25';
                else if (log.program === 'Water Sanitation') programBadgeColor = 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25';
                else if (log.program === 'IEQ') programBadgeColor = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';

                return (
                  <div key={log.id} className="p-3 bg-slate-800/40 border border-slate-800 hover:border-slate-700/60 rounded-xl transition flex flex-col sm:flex-row gap-3 items-start justify-between">
                    <div className="flex gap-3 items-start">
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs text-slate-300 uppercase shrink-0 border border-slate-700">
                        {log.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200">{log.userName}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">({log.userRole})</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${programBadgeColor}`}>
                            {log.program}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-300 mt-1">{log.action}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 whitespace-nowrap self-end sm:self-start">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <FileText className="h-10 w-10 text-slate-700 mb-2" />
                <p className="text-xs font-medium">No activity log matches your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
