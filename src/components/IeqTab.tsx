import React, { useState } from 'react';
import jsPDF from 'jspdf';
import {
  Wind,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Settings,
  Trash2,
  ClipboardCheck,
  Search,
  Edit,
  Download
} from 'lucide-react';
import { User, IeqParameter, IeqSample, Location, Person } from '../types';

interface IeqTabProps {
  currentUser: User;
  ieqParameters: IeqParameter[];
  ieqSamples: IeqSample[];
  locations: Location[];
  persons: Person[];
  onAddSample: (sample: IeqSample, logDetails: string) => void;
  onUpdateSample: (sample: IeqSample, logDetails: string) => void;
  onAddParameter: (param: IeqParameter, logDetails: string) => void;
  onUpdateParameter: (param: IeqParameter, logDetails: string) => void;
  onDeleteParameter: (paramId: string, logDetails: string) => void;
}

export default function IeqTab({
  currentUser,
  ieqParameters,
  ieqSamples,
  locations,
  persons,
  onAddSample,
  onUpdateSample,
  onAddParameter,
  onUpdateParameter,
  onDeleteParameter
}: IeqTabProps) {
  const [subTab, setSubTab] = useState<'samples' | 'params'>('samples');

  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'renovated' | 'adhoc'>('all');
  const [filterLocation, setFilterLocation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Add sample modal state
  const [isAddingSample, setIsAddingSample] = useState(false);
  const [sampleLocationId, setSampleLocationId] = useState('');
  const [sampleType, setSampleType] = useState<'renovated' | 'adhoc'>('adhoc');
  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);
  const [sampleTester, setSampleTester] = useState(currentUser.name);
  const [sampleNotes, setSampleNotes] = useState('');
  const [sampleReadings, setSampleReadings] = useState<Record<string, string>>({});

  // Add parameter form state
  const [isAddingParam, setIsAddingParam] = useState(false);
  const [paramName, setParamName] = useState('');
  const [paramUnit, setParamUnit] = useState('');
  const [paramThreshold, setParamThreshold] = useState('');

  // Edit parameter state
  const [editingParam, setEditingParam] = useState<IeqParameter | null>(null);
  const [editParamName, setEditParamName] = useState('');
  const [editParamUnit, setEditParamUnit] = useState('');
  const [editParamThreshold, setEditParamThreshold] = useState('');

  // Available years from data
  const availableYears = React.useMemo(() => {
    const years = new Set(ieqSamples.map(s => s.date?.slice(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [ieqSamples]);

  const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Filtered samples
  const filteredSamples = ieqSamples.filter(s => {
    if (filterType !== 'all' && s.samplingType !== filterType) return false;
    if (filterLocation !== 'All' && s.locationId !== filterLocation) return false;
    if (filterYear && !s.date?.startsWith(filterYear)) return false;
    if (filterMonth && s.date?.slice(5, 7) !== filterMonth) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.location.toLowerCase().includes(q) ||
        s.testerName.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q) ||
        s.date.includes(q)
      );
    }
    return true;
  });

  // Helpers
  const getReadingColor = (value: number, param: IeqParameter) => {
    if (value > param.safeThreshold) return 'text-rose-400';
    if (value > param.safeThreshold * 0.8) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStatusBadge = (status: IeqSample['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30';
      case 'action_required':
        return 'bg-amber-950/40 text-amber-400 border-amber-900/30';
      case 'fail':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/30';
    }
  };

  const computeStatus = (readings: Record<string, number>): IeqSample['status'] => {
    let hasFail = false;
    let hasWarning = false;
    for (const param of ieqParameters) {
      const val = readings[param.id];
      if (val !== undefined) {
        if (val > param.safeThreshold) hasFail = true;
        else if (val > param.safeThreshold * 0.8) hasWarning = true;
      }
    }
    if (hasFail) return 'fail';
    if (hasWarning) return 'action_required';
    return 'pass';
  };

  // Submit new sample
  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === sampleLocationId);
    if (!loc) return;

    const readings: Record<string, number> = {};
    for (const param of ieqParameters) {
      const val = parseFloat(sampleReadings[param.id] || '0');
      if (!isNaN(val)) readings[param.id] = val;
    }

    const status = computeStatus(readings);
    const newSample: IeqSample = {
      id: `ieq_sample_${Date.now()}`,
      locationId: sampleLocationId,
      location: `${loc.building} ${loc.roomNumber}`,
      samplingType: sampleType,
      date: sampleDate,
      testerName: sampleTester,
      status,
      readings,
      notes: sampleNotes || undefined
    };

    onAddSample(newSample, `New IEQ sample at "${newSample.location}" (${sampleType}). Status: ${status}.`);

    // Reset form
    setIsAddingSample(false);
    setSampleReadings({});
    setSampleNotes('');
  };

  // Submit new parameter
  const handleAddParam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramName.trim() || !paramUnit.trim() || !paramThreshold.trim()) return;

    const newParam: IeqParameter = {
      id: `param_${Date.now()}`,
      name: paramName.trim(),
      unit: paramUnit.trim(),
      safeThreshold: parseFloat(paramThreshold),
      isDefault: false
    };

    onAddParameter(newParam, `Added custom IEQ parameter "${newParam.name}" (${newParam.unit}, threshold: ${newParam.safeThreshold}).`);
    setParamName('');
    setParamUnit('');
    setParamThreshold('');
    setIsAddingParam(false);
  };

  // Generate and download IEQ monitoring PDF report
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let y = 20;
    const reportDate = new Date().toISOString().split('T')[0];
    const passCount = ieqSamples.filter(s => s.status === 'pass').length;
    const actionCount = ieqSamples.filter(s => s.status === 'action_required').length;
    const failCount = ieqSamples.filter(s => s.status === 'fail').length;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('IEQ Monitoring Report', 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${reportDate}  |  Generated by: ${currentUser.name}`, 14, y);
    y += 12;

    // Summary section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Samples: ${ieqSamples.length}`, 14, y);
    y += 6;
    doc.text(`Pass: ${passCount}    Action Required: ${actionCount}    Fail: ${failCount}`, 14, y);
    y += 12;

    // Parameter Thresholds
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Parameter Thresholds', 14, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Parameter', 14, y);
    doc.text('Unit', 90, y);
    doc.text('Safe Threshold', 130, y);
    doc.text('Type', 170, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    ieqParameters.forEach(param => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(param.name, 14, y);
      doc.text(param.unit, 90, y);
      doc.text(String(param.safeThreshold), 130, y);
      doc.text(param.isDefault ? 'Default' : 'Custom', 170, y);
      y += 5;
    });
    y += 10;

    // Sampling Records
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sampling Records', 14, y);
    y += 8;

    // Table header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 14, y);
    doc.text('Location', 34, y);
    doc.text('Type', 80, y);
    let colX = 100;
    const colWidth = 22;
    ieqParameters.forEach(p => {
      doc.text(`${p.name}`, colX, y);
      colX += colWidth;
    });
    doc.text('Status', colX + 2, y);
    doc.text('FTM', colX + 22, y);
    y += 4;

    // Table rows
    doc.setFont('helvetica', 'normal');
    const sortedSamples = [...ieqSamples].sort((a, b) => b.date.localeCompare(a.date));

    sortedSamples.forEach(sample => {
      if (y > 275) { doc.addPage(); y = 20; }

      doc.text(sample.date, 14, y);
      const locText = doc.splitTextToSize(sample.location, 44);
      doc.text(locText[0], 34, y);
      doc.text(sample.samplingType === 'renovated' ? 'Renovated' : 'Ad-hoc', 80, y);

      colX = 100;
      ieqParameters.forEach(param => {
        const val = sample.readings[param.id];
        const display = val !== undefined ? String(val) : '-';
        doc.text(display, colX, y);
        colX += colWidth;
      });

      doc.text(sample.status === 'pass' ? 'Pass' : sample.status === 'action_required' ? 'Action' : 'Fail', colX + 2, y);
      doc.text(sample.testerName, colX + 22, y);
      y += 5;
    });

    // Notes section
    const samplesWithNotes = ieqSamples.filter(s => s.notes);
    if (samplesWithNotes.length > 0) {
      y += 8;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sampling Notes', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      samplesWithNotes.forEach(s => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${s.location} (${s.date})`, 14, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(s.notes || '', 180);
        doc.text(noteLines, 14, y);
        y += noteLines.length * 4 + 4;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`IEQ Monitoring Report - Page ${i} of ${pageCount}`, 14, 290);
      doc.text('HSEO Portal', 180, 290);
    }

    doc.save(`IEQ_Report_${reportDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wind className="text-emerald-400 h-5 w-5" />
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">IEQ Management</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Indoor Environment Quality sampling program. Monitors Radon, CO2, TVOC, Total Dust, and Formaldehyde levels.
            </p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setSubTab('samples')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'samples' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              Sampling Records
            </button>
            <button
              onClick={() => setSubTab('params')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'params' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Parameters
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: SAMPLING RECORDS */}
      {subTab === 'samples' && (
        <div className="space-y-4">
          {/* Filter bar + Add button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search samples..."
                className="bg-transparent text-xs text-slate-200 outline-none w-40"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'renovated' | 'adhoc')}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="renovated">Renovated</option>
              <option value="adhoc">Ad-hoc</option>
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 cursor-pointer"
            >
              <option value="All">All Locations</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.building} {l.roomNumber}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 cursor-pointer"
            >
              <option value="">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 cursor-pointer"
            >
              <option value="">All Months</option>
              {MONTH_NAMES_SHORT.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
            </select>
            <div className="flex-1" />
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              Download Report
            </button>
            <button
              onClick={() => {
                setIsAddingSample(true);
                setSampleReadings({});
                setSampleLocationId(locations[0]?.id || '');
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Sample
            </button>
          </div>

          {/* Samples Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Type</th>
                    {ieqParameters.map(p => (
                      <th key={p.id} className="px-4 py-3 text-right">{p.name} ({p.unit})</th>
                    ))}
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Field Team Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {filteredSamples.length > 0 ? (
                    filteredSamples.map(sample => (
                      <tr key={sample.id} className="hover:bg-slate-800/20 transition">
                        <td className="px-4 py-3 font-mono text-slate-400">{sample.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-100">{sample.location}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            sample.samplingType === 'renovated'
                              ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700/30'
                          }`}>
                            {sample.samplingType === 'renovated' ? 'Renovated' : 'Ad-hoc'}
                          </span>
                        </td>
                        {ieqParameters.map(param => {
                          const val = sample.readings[param.id];
                          return (
                            <td key={param.id} className={`px-4 py-3 text-right font-mono font-medium ${
                              val !== undefined ? getReadingColor(val, param) : 'text-slate-600'
                            }`}>
                              {val !== undefined ? val : '-'}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusBadge(sample.status)}`}>
                            {sample.status === 'pass' ? 'Pass' : sample.status === 'action_required' ? 'Action Req.' : 'Fail'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{sample.testerName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5 + ieqParameters.length} className="px-4 py-12 text-center text-slate-500">
                        <Wind className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                        <p className="text-xs">No sampling records match your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Notes (if any selected record details) */}
          {filteredSamples.some(s => s.notes) && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Sampling Notes</h3>
              <div className="space-y-2">
                {filteredSamples.filter(s => s.notes).map(s => (
                  <div key={s.id} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-300">{s.location}</span>
                      <span className="text-slate-500">{s.date}</span>
                    </div>
                    <p className="text-slate-400 italic">{s.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PARAMETERS */}
      {subTab === 'params' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-2">
                <Settings className="text-emerald-400 h-4 w-4" />
                IEQ Parameters
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Configure measured parameters and their safe thresholds.</p>
            </div>
            <button
              onClick={() => setIsAddingParam(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Parameter
            </button>
          </div>

          {/* Parameters Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Parameter Name</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3 text-right">Safe Threshold</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {ieqParameters.map(param => (
                  <tr key={param.id} className="hover:bg-slate-800/20 transition">
                    <td className="px-4 py-3 font-semibold text-slate-100">{param.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{param.unit}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">{param.safeThreshold}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        param.isDefault
                          ? 'bg-slate-800/60 text-slate-400 border-slate-700/30'
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                      }`}>
                        {param.isDefault ? 'Default' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingParam(param);
                            setEditParamName(param.name);
                            setEditParamUnit(param.unit);
                            setEditParamThreshold(String(param.safeThreshold));
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-amber-600/20 hover:text-amber-400 text-slate-500 transition border border-slate-700/50 hover:border-amber-600/40"
                          title="Edit parameter"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        {!param.isDefault && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete parameter "${param.name}"?`)) {
                                onDeleteParameter(param.id, `Deleted custom IEQ parameter "${param.name}".`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-600/20 hover:text-rose-400 text-slate-500 transition border border-slate-700/50 hover:border-rose-600/40"
                            title="Delete parameter"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD SAMPLE MODAL */}
      {isAddingSample && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAddingSample(false)}>
          <div className="bg-slate-900 border border-emerald-600/30 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-100">Add IEQ Results</h3>
              </div>
              <button onClick={() => setIsAddingSample(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSample} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Location</label>
                  <select
                    value={sampleLocationId}
                    onChange={(e) => setSampleLocationId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select location...</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.building} - {l.roomNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sampling Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSampleType('adhoc')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold border transition ${
                        sampleType === 'adhoc'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Ad-hoc
                    </button>
                    <button
                      type="button"
                      onClick={() => setSampleType('renovated')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold border transition ${
                        sampleType === 'renovated'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Renovated
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={sampleDate}
                    onChange={(e) => setSampleDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Field Team Member</label>
                  <select
                    value={sampleTester}
                    onChange={(e) => setSampleTester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {persons.filter(p => p.department === 'HSEO').map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Parameter readings */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-2">Parameter Readings</label>
                <div className="grid grid-cols-2 gap-3">
                  {ieqParameters.map(param => (
                    <div key={param.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 font-semibold">{param.name}</span>
                        <span className="text-[9px] text-slate-600">max: {param.safeThreshold} {param.unit}</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        value={sampleReadings[param.id] || ''}
                        onChange={(e) => setSampleReadings(prev => ({ ...prev, [param.id]: e.target.value }))}
                        placeholder={`0 ${param.unit}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Notes (optional)</label>
                <textarea
                  value={sampleNotes}
                  onChange={(e) => setSampleNotes(e.target.value)}
                  placeholder="e.g. Post-renovation baseline, ventilation upgrade needed..."
                  className="w-full h-16 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingSample(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition shadow">
                  Save Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PARAMETER MODAL */}
      {isAddingParam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsAddingParam(false)}>
          <div className="bg-slate-900 border border-emerald-600/30 rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-100">Add Custom Parameter</h3>
              </div>
              <button onClick={() => setIsAddingParam(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddParam} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Parameter Name</label>
                <input
                  type="text"
                  value={paramName}
                  onChange={(e) => setParamName(e.target.value)}
                  placeholder="e.g. PM2.5, Benzene"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    value={paramUnit}
                    onChange={(e) => setParamUnit(e.target.value)}
                    placeholder="e.g. ug/m3, ppm"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Safe Threshold</label>
                  <input
                    type="number"
                    step="any"
                    value={paramThreshold}
                    onChange={(e) => setParamThreshold(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingParam(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition shadow">
                  Add Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PARAMETER MODAL */}
      {editingParam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingParam(null)}>
          <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-100">Edit Parameter</h3>
              </div>
              <button onClick={() => setEditingParam(null)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editParamName.trim() || !editParamUnit.trim() || !editParamThreshold.trim()) return;
              const updated: IeqParameter = {
                ...editingParam,
                name: editParamName.trim(),
                unit: editParamUnit.trim(),
                safeThreshold: parseFloat(editParamThreshold)
              };
              onUpdateParameter(updated, `Updated IEQ parameter "${updated.name}" (unit: ${updated.unit}, threshold: ${updated.safeThreshold}).`);
              setEditingParam(null);
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Parameter Name</label>
                <input
                  type="text"
                  value={editParamName}
                  onChange={(e) => setEditParamName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    value={editParamUnit}
                    onChange={(e) => setEditParamUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Safe Threshold</label>
                  <input
                    type="number"
                    step="any"
                    value={editParamThreshold}
                    onChange={(e) => setEditParamThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {editingParam.isDefault && (
                <p className="text-[10px] text-slate-500 italic">Default parameters can be edited but not deleted.</p>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingParam(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg transition shadow">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
