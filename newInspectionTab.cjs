const fs = require('fs');
const content = `
import React, { useState } from 'react';
import { ClipboardCheck, FileCheck, Search, Plus, Calendar, AlertTriangle, Check, X, ShieldCheck, Clock, User, ChevronRight } from 'lucide-react';
import { Inspection, User as AppUser, Location, Person, Finding } from '../types';

interface InspectionTabProps {
  currentUser: AppUser;
  inspections: Inspection[];
  locations: Location[];
  persons: Person[];
  onAddInspection: (inspection: Inspection, logDetails: string) => void;
  onUpdateFindings: (inspectionId: string, findingId: string, status: 'open' | 'resolved', correctiveAction?: string) => void;
  onUpdateInspection: (updated: Inspection) => void;
}

const CATEGORIES = ['fire safety', 'biosafety', 'chemical safety', 'housekeeping', 'electrical', 'general'];

export default function InspectionTab({
  currentUser,
  inspections,
  locations,
  persons,
  onAddInspection,
  onUpdateFindings,
  onUpdateInspection
}: InspectionTabProps) {
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(inspections[0]?.id || null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Schedule Form State
  const [newLocationId, setNewLocationId] = useState(locations[0]?.id || '');
  const [scheduledMonth, setScheduledMonth] = useState('June 2026');
  const [appointmentDate, setAppointmentDate] = useState('');

  const selectedInspection = inspections.find(i => i.id === selectedInspectionId);
  const selectedLocation = locations.find(l => l.id === selectedInspection?.locationId);

  // Finding draft state
  const [isDraftingFinding, setIsDraftingFinding] = useState(false);
  const [newFindingCat, setNewFindingCat] = useState(CATEGORIES[0]);
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingLevel, setNewFindingLevel] = useState<1|2|3>(1);
  const [newFindingContactId, setNewFindingContactId] = useState('');
  
  // Rectification draft states
  const [rectificationInputs, setRectificationInputs] = useState<Record<string, string>>({});

  const filteredInspections = inspections.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === newLocationId);
    if (!loc) return;

    const newInsp: Inspection = {
      id: 'insp_' + Date.now(),
      title: \`\${loc.building} Rm \${loc.roomNumber} Inspection\`,
      date: new Date().toISOString().split('T')[0],
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      ftmId: currentUser.id, // FTM scheduling
      status: 'pending',
      inspectionStatus: 'scheduled',
      score: 100,
      findings: [],
      locationId: loc.id,
      scheduledMonth,
      appointmentDate
    };

    onAddInspection(newInsp, \`Scheduled inspection for \${loc.building} Rm \${loc.roomNumber} for \${scheduledMonth}\`);
    setIsScheduling(false);
    setSelectedInspectionId(newInsp.id);
  };

  const handleAddFinding = () => {
    if (!selectedInspection || !newFindingDesc.trim()) return;
    
    const newFinding: Finding = {
      id: 'finding_' + Date.now(),
      category: newFindingCat,
      description: newFindingDesc,
      status: 'open',
      severity: newFindingLevel === 3 ? 'high' : newFindingLevel === 2 ? 'medium' : 'low',
      actionLevel: newFindingLevel,
      referredContactId: newFindingContactId || undefined
    };

    const updated = {
      ...selectedInspection,
      score: Math.max(0, selectedInspection.score - (newFindingLevel * 5)),
      findings: [...selectedInspection.findings, newFinding]
    };
    onUpdateInspection(updated);
    setIsDraftingFinding(false);
    setNewFindingDesc('');
    setNewFindingLevel(1);
  };

  const handleStatusChange = (status: Inspection['inspectionStatus']) => {
    if (!selectedInspection) return;
    onUpdateInspection({ ...selectedInspection, inspectionStatus: status });
  };

  const handleRectifyFinding = (findingId: string) => {
    if (!selectedInspection) return;
    const recText = rectificationInputs[findingId];
    if (!recText) return;

    const nextFindings = selectedInspection.findings.map(f => {
      if (f.id === findingId) {
        return { ...f, status: 'resolved' as const, rectificationRecord: recText };
      }
      return f;
    });

    onUpdateInspection({ ...selectedInspection, findings: nextFindings });
  };

  const getPersonName = (id: string) => persons.find(p => p.id === id)?.name || 'Unknown';

  const renderFindingList = (insp: Inspection) => {
    return insp.findings.map(finding => {
      const isResolved = finding.status === 'resolved';
      const referredName = finding.referredContactId ? getPersonName(finding.referredContactId) : 'None';
      
      return (
        <div key={finding.id} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{finding.category}</span>
              <span className={\`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold \${finding.actionLevel === 3 ? 'bg-rose-500/10 text-rose-400' : finding.actionLevel === 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}\`}>
                Level {finding.actionLevel || 1}
              </span>
              <span className="ml-2 text-[10px] text-slate-400">Ref: {referredName}</span>
            </div>
            {isResolved ? (
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" /> Resolved
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                <Clock className="h-3 w-3" /> Open
              </span>
            )}
          </div>
          <p className="text-xs text-slate-200">{finding.description}</p>
          
          {/* Rectification / Resolution details */}
          {isResolved ? (
            <div className="p-2 bg-emerald-900/10 rounded border border-emerald-500/20 text-xs">
              <span className="text-emerald-400 font-bold">Rectification Record: </span>
              <span className="text-slate-300">{finding.rectificationRecord || finding.correctiveAction}</span>
            </div>
          ) : insp.inspectionStatus === 'pending_rectification' && (currentUser.role === 'PI' || currentUser.role === 'admin' || currentUser.role === 'Contact') ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Enter rectification taken..."
                value={rectificationInputs[finding.id] || ''}
                onChange={e => setRectificationInputs(prev => ({...prev, [finding.id]: e.target.value}))}
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
              />
              <button 
                onClick={() => handleRectifyFinding(finding.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs"
              >
                Sign Off
              </button>
            </div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 flex flex-col gap-3 bg-slate-800/20 p-3 rounded-xl border border-slate-800/50">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Inspections Tracker</h2>
          <button
            onClick={() => setIsScheduling(true)}
            className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-md transition"
            title="Schedule Inspection"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search inspections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredInspections.map((insp) => (
            <div
              key={insp.id}
              onClick={() => { setSelectedInspectionId(insp.id); setIsScheduling(false); }}
              className={\`p-3 rounded-lg cursor-pointer transition border \${
                selectedInspectionId === insp.id
                  ? 'bg-indigo-600/10 border-indigo-500/50'
                  : 'bg-slate-800/40 border-transparent hover:bg-slate-800'
              }\`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={\`text-xs font-bold truncate \${selectedInspectionId === insp.id ? 'text-indigo-400' : 'text-slate-300'}\`}>
                  {insp.title}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {insp.scheduledMonth || insp.date}
                </span>
                <span className={\`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase \${
                  insp.inspectionStatus === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                  insp.inspectionStatus === 'drafting_report' ? 'bg-amber-500/10 text-amber-400' :
                  insp.inspectionStatus === 'supervisor_review' ? 'bg-purple-500/10 text-purple-400' :
                  insp.inspectionStatus === 'pending_rectification' ? 'bg-orange-500/10 text-orange-400' :
                  insp.inspectionStatus === 'closed' || insp.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-slate-700 text-slate-300'
                }\`}>
                  {(insp.inspectionStatus || insp.status).replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 md:p-6 flex flex-col overflow-hidden relative">
        {isScheduling ? (
          <form onSubmit={handleScheduleSubmit} className="flex-1 overflow-y-auto space-y-5">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">Schedule New Inspection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <select 
                  value={newLocationId} 
                  onChange={e => setNewLocationId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.building} - Rm {l.roomNumber} ({l.roomNature})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Month</label>
                  <input
                    type="month"
                    value={scheduledMonth}
                    onChange={e => setScheduledMonth(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Specific Appointment (Optional)</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                onClick={() => setIsScheduling(false)}
                className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
              >
                Schedule Inspection
              </button>
            </div>
          </form>
        ) : selectedInspection ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header info */}
            <div className="border-b border-slate-800 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-200">{selectedInspection.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span>FTM / Inspector: {selectedInspection.inspectorName}</span>
                    <span>•</span>
                    <span>Month: {selectedInspection.scheduledMonth}</span>
                    {selectedInspection.appointmentDate && (
                      <><span>•</span><span>Appt: {selectedInspection.appointmentDate}</span></>
                    )}
                  </div>
                  {selectedLocation && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                      <span>PIs: {selectedLocation.piIds.map(id => getPersonName(id)).join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={\`inline-block px-3 py-1 rounded text-xs font-bold uppercase \${
                    selectedInspection.inspectionStatus === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    selectedInspection.inspectionStatus === 'drafting_report' ? 'bg-amber-500/20 text-amber-400' :
                    selectedInspection.inspectionStatus === 'supervisor_review' ? 'bg-purple-500/20 text-purple-400' :
                    selectedInspection.inspectionStatus === 'pending_rectification' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }\`}>
                    {(selectedInspection.inspectionStatus || selectedInspection.status).replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Controls depending on status & role */}
            <div className="mb-4 flex flex-wrap gap-2">
              {(selectedInspection.inspectionStatus === 'scheduled' || !selectedInspection.inspectionStatus) && (currentUser.role === 'admin' || currentUser.role === 'inspector' || currentUser.role === 'FTM') && (
                <button 
                  onClick={() => handleStatusChange('drafting_report')}
                  className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Start Drafting Report
                </button>
              )}
              {selectedInspection.inspectionStatus === 'drafting_report' && (currentUser.role === 'admin' || currentUser.role === 'inspector' || currentUser.role === 'FTM') && (
                <button 
                  onClick={() => handleStatusChange('supervisor_review')}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Submit to Supervisor
                </button>
              )}
              {selectedInspection.inspectionStatus === 'supervisor_review' && (currentUser.role === 'admin') && (
                <button 
                  onClick={() => handleStatusChange('pending_rectification')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg"
                >
                  Issue Report to PI
                </button>
              )}
              {selectedInspection.inspectionStatus === 'pending_rectification' && (currentUser.role === 'admin' || currentUser.role === 'inspector' || currentUser.role === 'FTM') && (
                <button 
                  onClick={() => handleStatusChange('closed')}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Close Inspection
                </button>
              )}
            </div>

            {/* Findings Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Findings & Actions</h4>
                {selectedInspection.inspectionStatus === 'drafting_report' && !isDraftingFinding && (
                  <button onClick={() => setIsDraftingFinding(true)} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add Finding
                  </button>
                )}
              </div>

              {isDraftingFinding && (
                <div className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                      <select value={newFindingCat} onChange={e => setNewFindingCat(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Action Level (1-3)</label>
                      <select value={newFindingLevel} onChange={e => setNewFindingLevel(Number(e.target.value) as 1|2|3)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                        <option value={1}>Level 1 (Minor)</option>
                        <option value={2}>Level 2 (Moderate)</option>
                        <option value={3}>Level 3 (Urgent)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Refer to Contact Person</label>
                    <select value={newFindingContactId} onChange={e => setNewFindingContactId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white">
                      <option value="">-- Optional --</option>
                      {selectedLocation?.contactPersonIds.map(id => (
                        <option key={id} value={id}>{getPersonName(id)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Finding Description</label>
                    <textarea value={newFindingDesc} onChange={e => setNewFindingDesc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white" rows={2}></textarea>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setIsDraftingFinding(false)} className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                    <button onClick={handleAddFinding} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Save Finding</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {selectedInspection.findings.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                     <ShieldCheck className="h-8 w-8 mb-2 opacity-50" />
                     <p className="text-xs">No findings recorded yet.</p>
                   </div>
                ) : (
                  renderFindingList(selectedInspection)
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <ClipboardCheck className="h-12 w-12 text-slate-700 mb-2" />
            <p className="text-xs">Select an inspection or schedule a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/InspectionTab.tsx', content);
