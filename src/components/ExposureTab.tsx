import React, { useState } from 'react';
import { 
  Activity, Plus, Search, Edit, Trash2, X, Save, Filter, Calendar, FileText, 
  ClipboardList, MapPin, Wrench, User as UserIcon, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { User, Equipment, ExposureRecord, Location, Person } from '../types';

interface ExposureTabProps {
  currentUser: User;
  exposureRecords: ExposureRecord[];
  equipment: Equipment[];
  locations: Location[];
  persons: Person[];
  onAddRecord: (record: ExposureRecord, logDetails: string) => void;
  onUpdateRecord: (record: ExposureRecord, logDetails: string) => void;
  onDeleteRecord: (recordId: string, logDetails: string) => void;
}

const PARAMETER_TYPES = ['Total Dust', 'PM10', 'PM2.5', 'tVOC', 'Ammonia', 'Noise', 'NIR'];

// Map parameter type to equipment category for filtering
const PARAM_CATEGORY_MAP: Record<string, string[]> = {
  'Total Dust': ['Dust Monitor', 'Air Sampler'],
  'PM10': ['Dust Monitor', 'Air Sampler'],
  'PM2.5': ['Dust Monitor', 'Air Sampler'],
  'tVOC': ['Gas Detector', 'VOC Meter'],
  'Ammonia': ['Gas Detector'],
  'Noise': ['Noise Dosimeter'],
  'NIR': ['NIR Sensor']
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ExposureTab({
  currentUser, exposureRecords, equipment, locations, persons,
  onAddRecord, onUpdateRecord, onDeleteRecord
}: ExposureTabProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExposureRecord | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Filters
  const [filterParam, setFilterParam] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Add form states
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addLocationId, setAddLocationId] = useState('');
  const [addParamType, setAddParamType] = useState(PARAMETER_TYPES[0]);
  const [addEquipmentId, setAddEquipmentId] = useState('');
  const [addTesterId, setAddTesterId] = useState('');
  const [addResults, setAddResults] = useState<{name: string; value: string; unit: string}[]>([]);
  const [addFloorPlan, setAddFloorPlan] = useState('');
  const [addDuration, setAddDuration] = useState('');
  const [addStatus, setAddStatus] = useState<ExposureRecord['status']>('Pending');
  const [addFollowUp, setAddFollowUp] = useState('');
  const [addNotes, setAddNotes] = useState('');

  const resetAddForm = () => {
    setAddDate(new Date().toISOString().split('T')[0]); setAddLocationId('');
    setAddParamType(PARAMETER_TYPES[0]); setAddEquipmentId(''); setAddTesterId('');
    setAddResults([]); setAddFloorPlan(''); setAddDuration('');
    setAddStatus('Pending'); setAddFollowUp(''); setAddNotes('');
  };

  const getPersonName = (id: string) => persons.find(p => p.id === id)?.name || 'Unknown';
  const getEquipment = (id: string) => equipment.find(e => e.id === id);
  const getLocation = (id: string) => locations.find(l => l.id === id);

  // Auto-generate floor plan ref when location + date change
  React.useEffect(() => {
    if (addLocationId && addDate) {
      const loc = getLocation(addLocationId);
      if (loc) {
        const d = new Date(addDate);
        const monthStr = MONTH_NAMES[d.getMonth()] || String(d.getMonth()+1).padStart(2,'0');
        setAddFloorPlan(`${loc.spaceID}-${d.getFullYear()}${monthStr}${String(d.getDate()).padStart(2,'0')}`);
      }
    }
  }, [addLocationId, addDate]);

  // Filtered equipment by parameter type
  const filteredEquipment = React.useMemo(() => {
    const cats = PARAM_CATEGORY_MAP[addParamType] || [];
    return cats.length > 0 ? equipment.filter(e => cats.includes(e.category)) : equipment;
  }, [addParamType, equipment]);

  // Computed filtered records
  const displayRecords = React.useMemo(() => {
    return exposureRecords.filter(r => {
      if (filterParam && r.parameterType !== filterParam) return false;
      if (filterLocation && r.locationId !== filterLocation) return false;
      if (filterYear && !r.samplingDate?.startsWith(filterYear)) return false;
      if (filterMonth && r.samplingDate?.slice(5, 7) !== filterMonth) return false;
      return true;
    }).sort((a, b) => (b.samplingDate || '').localeCompare(a.samplingDate || ''));
  }, [exposureRecords, filterParam, filterLocation, filterYear, filterMonth]);

  const availableYears = React.useMemo(() =>
    Array.from(new Set(exposureRecords.map(r => r.samplingDate?.slice(0, 4)).filter(Boolean))).sort((a, b) => Number(b) - Number(a)),
    [exposureRecords]
  );
  const availableMonths = React.useMemo(() => {
    const logs = filterYear ? exposureRecords.filter(r => r.samplingDate?.startsWith(filterYear)) : exposureRecords;
    return Array.from(new Set(logs.map(r => r.samplingDate?.slice(5, 7)).filter(Boolean))).sort();
  }, [exposureRecords, filterYear]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLocationId || !addParamType || !addTesterId) { alert('Location, Parameter Type and Tester are required.'); return; }
    const loc = getLocation(addLocationId);
    const record: ExposureRecord = {
      id: `exp_${Date.now()}`, samplingDate: addDate, locationId: addLocationId,
      spaceID: loc?.spaceID || '', parameterType: addParamType, equipmentId: addEquipmentId,
      testerId: addTesterId, results: addResults.filter(r => r.name), floorPlanRef: addFloorPlan,
      sampledDuration: addDuration, status: addStatus, followUp: addFollowUp, notes: addNotes
    };
    onAddRecord(record, `Logged exposure monitoring for ${addParamType} at ${loc?.spaceID || addLocationId}.`);
    resetAddForm(); setIsAdding(false);
  };

  const startEdit = (record: ExposureRecord) => {
    setEditingRecord(record);
    setAddDate(record.samplingDate); setAddLocationId(record.locationId);
    setAddParamType(record.parameterType); setAddEquipmentId(record.equipmentId);
    setAddTesterId(record.testerId); setAddResults([...record.results]);
    setAddFloorPlan(record.floorPlanRef); setAddDuration(record.sampledDuration);
    setAddStatus(record.status); setAddFollowUp(record.followUp); setAddNotes(record.notes);
    setIsAdding(true); setSelectedRecordId(null);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const loc = getLocation(addLocationId);
    const updated: ExposureRecord = {
      ...editingRecord, samplingDate: addDate, locationId: addLocationId,
      spaceID: loc?.spaceID || editingRecord.spaceID, parameterType: addParamType,
      equipmentId: addEquipmentId, testerId: addTesterId,
      results: addResults.filter(r => r.name), floorPlanRef: addFloorPlan,
      sampledDuration: addDuration, status: addStatus, followUp: addFollowUp, notes: addNotes
    };
    onUpdateRecord(updated, `Updated exposure record for ${addParamType} at ${loc?.spaceID || addLocationId}.`);
    setEditingRecord(null); setIsAdding(false);
  };

  const statusBadge = (status: ExposureRecord['status']) => {
    const styles: Record<string, string> = {
      'Compliant': 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30',
      'Exceedance': 'bg-rose-950/40 text-rose-400 border-rose-900/30',
      'Pending': 'bg-amber-950/40 text-amber-400 border-amber-900/30'
    };
    return <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${styles[status]}`}>{status}</span>;
  };

  // Add measurement row
  const addResultRow = () => setAddResults([...addResults, { name: '', value: '', unit: '' }]);
  const removeResultRow = (idx: number) => setAddResults(addResults.filter((_, i) => i !== idx));
  const updateResultRow = (idx: number, field: string, val: string) => {
    const copy = [...addResults];
    copy[idx] = { ...copy[idx], [field]: val };
    setAddResults(copy);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Exposure Monitoring</span>
          <span className="text-xs text-slate-300">
            {isAdding ? 'Recording new exposure monitoring data.' : `Showing ${displayRecords.length} exposure records.`}
          </span>
        </div>
        <div className="flex gap-2">
          {!isAdding && (
            <button onClick={() => { setIsAdding(true); setEditingRecord(null); resetAddForm(); }}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition">
              <Plus className="h-4 w-4" /> Log Exposure
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form onSubmit={editingRecord ? handleEdit : handleAdd} className="bg-slate-900 border border-cyan-500/20 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              {editingRecord ? 'Edit Exposure Record' : 'Log New Exposure Record'}
            </h3>
            <button type="button" onClick={() => { setIsAdding(false); setEditingRecord(null); }} className="text-slate-400 hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sampling Date *</label>
              <input type="date" required value={addDate} onChange={(e) => setAddDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Location *</label>
              <select required value={addLocationId} onChange={(e) => setAddLocationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
                <option value="">-- Select Location --</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.spaceID} - {l.roomNature}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Parameter Type *</label>
              <select required value={addParamType} onChange={(e) => { setAddParamType(e.target.value); setAddEquipmentId(''); }}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
                {PARAMETER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Equipment</label>
              <select value={addEquipmentId} onChange={(e) => setAddEquipmentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
                <option value="">-- Select Equipment --</option>
                {filteredEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>)}
              </select>
            </div>
            {addEquipmentId && (() => {
              const eq = getEquipment(addEquipmentId);
              return eq ? (
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Last Calibrated</label>
                  <div className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-400 font-mono">{eq.lastCalibrationDate || 'N/A'}</div>
                </div>
              ) : null;
            })()}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Tester *</label>
              <select required value={addTesterId} onChange={(e) => setAddTesterId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
                <option value="">-- Select Tester --</option>
                {persons.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Floor Plan Ref</label>
              <input value={addFloorPlan} onChange={(e) => setAddFloorPlan(e.target.value)} placeholder="Auto-generated"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sampled Duration</label>
              <input value={addDuration} onChange={(e) => setAddDuration(e.target.value)} placeholder="e.g. 8 hours"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status</label>
              <select value={addStatus} onChange={(e) => setAddStatus(e.target.value as ExposureRecord['status'])}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none">
                <option value="Compliant">Compliant</option>
                <option value="Exceedance">Exceedance</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Dynamic Results */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Measurements / Results</span>
              <button type="button" onClick={addResultRow}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition">
                <Plus className="h-3 w-3" /> Add Measurement
              </button>
            </div>
            {addResults.length > 0 && (
              <div className="space-y-2">
                {addResults.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={r.name} onChange={(e) => updateResultRow(idx, 'name', e.target.value)} placeholder="Parameter name"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" />
                    <input value={r.value} onChange={(e) => updateResultRow(idx, 'value', e.target.value)} placeholder="Value"
                      className="w-24 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono" />
                    <input value={r.unit} onChange={(e) => updateResultRow(idx, 'unit', e.target.value)} placeholder="Unit"
                      className="w-20 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" />
                    <button type="button" onClick={() => removeResultRow(idx)} className="p-1 text-slate-500 hover:text-rose-400 transition">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Follow-up Actions</label>
              <textarea value={addFollowUp} onChange={(e) => setAddFollowUp(e.target.value)} rows={2}
                placeholder="Any follow-up actions required..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Notes</label>
              <textarea value={addNotes} onChange={(e) => setAddNotes(e.target.value)} rows={2}
                placeholder="Additional notes..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
            <button type="button" onClick={() => { setIsAdding(false); setEditingRecord(null); }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition">Cancel</button>
            <button type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition">
              <Save className="h-3.5 w-3.5 inline mr-1" /> {editingRecord ? 'Save Changes' : 'Log Record'}
            </button>
          </div>
        </form>
      )}

      {/* Summary Table + Detail Panel (master-detail) */}
      {!isAdding && (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Filters:</span>
            </div>
            <select value={filterParam} onChange={(e) => setFilterParam(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer">
              <option value="">All Parameters</option>
              {PARAMETER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer">
              <option value="">All Locations</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.spaceID}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterMonth(''); }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer">
              <option value="">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer">
              <option value="">All Months</option>
              {availableMonths.map(m => <option key={m} value={m}>{MONTH_NAMES[Number(m)-1] || m}</option>)}
            </select>
            {(filterParam || filterLocation || filterYear || filterMonth) && (
              <button onClick={() => { setFilterParam(''); setFilterLocation(''); setFilterYear(''); setFilterMonth(''); }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold transition">Clear</button>
            )}
            <span className="text-[10px] text-slate-500 ml-auto">{displayRecords.length} records</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* LEFT: Summary table */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-4 py-3 w-28">Sampling Date</th>
                      <th className="px-4 py-3">Location (SpaceID)</th>
                      <th className="px-4 py-3 w-28">Parameter</th>
                      <th className="px-4 py-3 text-center w-24">Status</th>
                      <th className="px-4 py-3 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {displayRecords.length > 0 ? displayRecords.map(record => {
                      const isSelected = selectedRecordId === record.id;
                      return (
                        <tr key={record.id} onClick={() => setSelectedRecordId(record.id)}
                          className={`cursor-pointer transition ${isSelected ? 'bg-cyan-950/30 border-l-2 border-l-cyan-500' : 'hover:bg-slate-800/20'}`}>
                          <td className="px-4 py-3 font-mono text-slate-400">{record.samplingDate}</td>
                          <td className="px-4 py-3 font-semibold text-slate-100">{record.spaceID}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-cyan-400 font-mono">
                              {record.parameterType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">{statusBadge(record.status)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); startEdit(record); }} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete this record?')) onDeleteRecord(record.id, `Deleted exposure record.`); }}
                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                          <Activity className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                          <p>No exposure records found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Detail panel */}
            <div className="lg:col-span-2">
              {selectedRecordId ? (() => {
                const record = exposureRecords.find(r => r.id === selectedRecordId);
                if (!record) return <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-xs">Record not found.</div>;
                const eq = getEquipment(record.equipmentId);
                const tester = persons.find(p => p.id === record.testerId);
                const loc = getLocation(record.locationId);
                return (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-cyan-400" /> Exposure Details
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">ID: {record.id}</p>
                      </div>
                      <button onClick={() => setSelectedRecordId(null)} className="text-slate-500 hover:text-slate-300 p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {statusBadge(record.status)}
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-cyan-400 font-mono">
                        {record.parameterType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Sampling Date</span>
                        <span className="font-mono text-slate-200">{record.samplingDate}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Duration</span>
                        <span className="text-slate-200">{record.sampledDuration || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Location</span>
                        <span className="font-semibold text-slate-100">{loc?.roomNature || record.spaceID}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">SpaceID</span>
                        <span className="font-mono text-slate-400">{record.spaceID}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Equipment</span>
                        <span className="text-slate-200">{eq ? `${eq.name}` : '—'}</span>
                        {eq && <span className="text-[9px] text-slate-500 block font-mono">S/N: {eq.serialNumber}</span>}
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Last Calibrated</span>
                        <span className="font-mono text-slate-400">{eq?.lastCalibrationDate || '—'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Tester</span>
                        <span className="text-slate-200">{tester?.name || 'Unknown'} <span className="text-[9px] text-slate-500">({tester?.role})</span></span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold">Floor Plan Ref</span>
                        <span className="font-mono text-indigo-400 text-[11px]">{record.floorPlanRef || '—'}</span>
                      </div>
                    </div>

                    {/* Results table */}
                    {record.results.length > 0 && (
                      <div className="border-t border-slate-800 pt-3">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Measurements</span>
                        <table className="w-full text-[11px] border-collapse">
                          <thead>
                            <tr className="text-slate-500 uppercase text-[9px]">
                              <th className="text-left pb-1">Parameter</th>
                              <th className="text-right pb-1">Value</th>
                              <th className="text-right pb-1">Unit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40">
                            {record.results.map((r, i) => (
                              <tr key={i}>
                                <td className="py-1 text-slate-300">{r.name}</td>
                                <td className="py-1 text-right font-mono text-cyan-400">{r.value}</td>
                                <td className="py-1 text-right text-slate-500">{r.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {record.followUp && (
                      <div className="border-t border-slate-800 pt-3">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-400" /> Follow-up
                        </span>
                        <p className="text-[11px] text-amber-300/80">{record.followUp}</p>
                      </div>
                    )}

                    {record.notes && (
                      <div className="border-t border-slate-800 pt-3">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Notes</span>
                        <p className="text-[11px] text-slate-400">{record.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                  <ClipboardList className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                  <p className="text-xs text-slate-500">Select a record to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
