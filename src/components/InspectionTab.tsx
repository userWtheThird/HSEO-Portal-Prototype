import React, { useState } from 'react';
import {
  ClipboardCheck, Plus, Calendar, Check, X,
  ChevronRight, Download, Camera, Clock,
  Image as ImageIcon, ArrowLeft, Moon, Sun, Building2, CheckCircle2, Circle, Bell, AlertTriangle, CalendarClock, Lock, Unlock
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Inspection, User as AppUser, Location, Person, Finding, InspectionWindow } from '../types';

interface InspectionTabProps {
  currentUser: AppUser;
  inspections: Inspection[];
  locations: Location[];
  persons: Person[];
  windows: InspectionWindow[];
  onAddInspection: (inspection: Inspection, logDetails: string) => void;
  onUpdateFindings: (inspectionId: string, findingId: string, status: 'open' | 'resolved', correctiveAction?: string) => void;
  onUpdateInspection: (updated: Inspection) => void;
  onAddWindow: (w: InspectionWindow) => void;
  onUpdateWindow: (w: InspectionWindow) => void;
}

const CATEGORIES = ['fire safety', 'biosafety', 'chemical safety', 'housekeeping', 'electrical', 'general'];
const CURRENT_YEAR = String(new Date().getFullYear());

// Determine required inspections per year based on location's inspectionFrequency or room nature fallback
const getRequiredInspections = (loc: Location): number => {
  if (loc.inspectionFrequency) return loc.inspectionFrequency;
  const lower = loc.roomNature.toLowerCase();
  if (lower.includes('lab')) return 2;
  return 1;
};

// Interval in months between inspections based on frequency
const getIntervalMonths = (loc: Location): number => {
  const freq = getRequiredInspections(loc);
  return Math.round(12 / freq);
};

// Calculate next inspection due date for a location (only scheduled inspections count)
const getNextInspectionDue = (loc: Location, inspections: Inspection[]): string | null => {
  const locInspections = inspections
    .filter(i => i.locationId === loc.id && i.date && i.inspectionType !== 'night')
    .sort((a, b) => b.date.localeCompare(a.date));
  if (locInspections.length === 0) {
    // If there's a start month, use that; otherwise overdue
    return loc.inspectionStartMonth ? loc.inspectionStartMonth + '-01' : null;
  }
  const lastDate = new Date(locInspections[0].date);
  const interval = getIntervalMonths(loc);
  const next = new Date(lastDate);
  next.setMonth(next.getMonth() + interval);
  return next.toISOString().split('T')[0];
};

const formatMonthYear = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString('en', { month: 'short', year: 'numeric' });
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  ready_to_go: 'Ready to Go',
  drafting_report: 'Drafting Report',
  supervisor_review: 'Supervisor Review',
  issued: 'Issued',
  pending_rectification: 'Pending Rectification',
  closed: 'Closed'
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-slate-900/80 text-sky-300 border-sky-500/30',
  ready_to_go: 'bg-slate-900/80 text-emerald-300 border-emerald-500/30',
  drafting_report: 'bg-slate-900/80 text-amber-300 border-amber-500/30',
  supervisor_review: 'bg-slate-900/80 text-purple-300 border-purple-500/30',
  issued: 'bg-slate-900/80 text-indigo-300 border-indigo-500/30',
  pending_rectification: 'bg-slate-900/80 text-rose-300 border-rose-500/30',
  closed: 'bg-slate-900/80 text-slate-400 border-slate-600/30'
};

export default function InspectionTab({
  currentUser, inspections, locations, persons, windows,
  onAddInspection, onUpdateFindings, onUpdateInspection, onAddWindow, onUpdateWindow
}: InspectionTabProps) {
  // View navigation: dashboard → department → detail
  const [view, setView] = useState<'dashboard' | 'department' | 'detail'>('dashboard');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

  // Schedule form
  const [isScheduling, setIsScheduling] = useState(false);
  const [schedLocationId, setSchedLocationId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedType, setSchedType] = useState<'scheduled' | 'night'>('scheduled');

  // Booking window creation
  const [selectedLocIds, setSelectedLocIds] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bwStart, setBwStart] = useState('');
  const [bwEnd, setBwEnd] = useState('');
  const [bwSlots, setBwSlots] = useState<string[]>(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
  const [bwCustomSlot, setBwCustomSlot] = useState('');

  const toggleLocSelection = (id: string) => {
    setSelectedLocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOpenBookingWindow = () => {
    if (!selectedDept || !bwStart || !bwEnd || selectedLocIds.length === 0) return;
    const locNames = selectedLocIds.map(id => {
      const l = locations.find(x => x.id === id);
      return l ? `${l.building} Rm ${l.roomNumber}` : '';
    }).filter(Boolean).join(', ');
    const newWindow: InspectionWindow = {
      id: 'iwin_' + Date.now(),
      department: selectedDept,
      title: `Inspection Booking: ${locNames}`,
      startDate: bwStart,
      endDate: bwEnd,
      timeSlots: bwSlots.length > 0 ? bwSlots : ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      openedBy: currentUser.name,
      openedById: currentUser.id,
      status: 'open',
      bookings: []
    };
    onAddWindow(newWindow);
    setShowBookingModal(false);
    setBwStart(''); setBwEnd(''); setSelectedLocIds([]);
  };

  // Finding draft
  const [isDraftingFinding, setIsDraftingFinding] = useState(false);
  const [newFindingCat, setNewFindingCat] = useState(CATEGORIES[0]);
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingLevel, setNewFindingLevel] = useState<1|2|3>(1);
  const [newFindingContactId, setNewFindingContactId] = useState('');
  const [newFindingFollowUp, setNewFindingFollowUp] = useState('');
  const [newFindingPhoto, setNewFindingPhoto] = useState<string | null>(null);
  const [rectificationInputs, setRectificationInputs] = useState<Record<string, string>>({});

  // --- Data computations ---
  // Get current user's assigned departments (from Person record as FTM)
  const currentPerson = persons.find(p => p.name === currentUser.name || p.id === currentUser.id);
  const assignedDepartments = currentPerson?.assignedDepartments || [];

  // All departments (fallback if user has no assigned departments)
  const allDepartments = Array.from(new Set(locations.map(l => l.department))).filter(Boolean).sort();
  const myDepartments = assignedDepartments.length > 0 ? assignedDepartments : allDepartments;

  // Department progress computation
  const deptProgress = React.useMemo(() => {
    return myDepartments.map(dept => {
      const deptLocations = locations.filter(l => l.department === dept);
      const totalRequired = deptLocations.reduce((sum, l) => sum + getRequiredInspections(l), 0);
      const yearInspections = inspections.filter(i => {
        const loc = locations.find(l => l.id === i.locationId);
        return loc?.department === dept && i.date?.startsWith(CURRENT_YEAR) && i.inspectionType !== 'night';
      });
      const completed = yearInspections.filter(i => i.status === 'completed' || i.inspectionStatus === 'closed' || i.inspectionStatus === 'issued').length;
      const scheduled = yearInspections.filter(i => i.inspectionStatus === 'scheduled' || i.inspectionStatus === 'ready_to_go').length;
      const nightCount = inspections.filter(i => {
        const loc = locations.find(l => l.id === i.locationId);
        return loc?.department === dept && i.date?.startsWith(CURRENT_YEAR) && i.inspectionType === 'night';
      }).length;
      return { dept, locationCount: deptLocations.length, totalRequired, completed, scheduled, nightCount, yearInspections };
    });
  }, [myDepartments, locations, inspections]);

  // Reminders / Outstanding items computation
  const reminders = React.useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = todayStr.slice(0, 7); // "2026-07"
    const items: { type: 'overdue' | 'unconfirmed' | 'upcoming'; message: string; locationId?: string; inspectionId?: string; dept: string; dueDate?: string }[] = [];

    const myLocations = locations.filter(l => myDepartments.includes(l.department));

    for (const loc of myLocations) {
      const nextDue = getNextInspectionDue(loc, inspections);
      const locLabel = `${loc.building} Rm ${loc.roomNumber}`;

      if (!nextDue) {
        // Never inspected — overdue
        items.push({ type: 'overdue', message: `${locLabel} has never been inspected — schedule now`, locationId: loc.id, dept: loc.department });
        continue;
      }

      if (nextDue <= todayStr) {
        // Check if there's already a scheduled/pending inspection for this location
        const hasScheduled = inspections.some(i =>
          i.locationId === loc.id &&
          (i.inspectionStatus === 'scheduled' || i.inspectionStatus === 'ready_to_go') &&
          i.status !== 'completed'
        );
        if (!hasScheduled) {
          items.push({ type: 'overdue', message: `${locLabel} — next inspection was due ${formatMonthYear(nextDue)}, not yet scheduled`, locationId: loc.id, dept: loc.department, dueDate: nextDue });
        }
      } else if (nextDue.slice(0, 7) === currentMonth) {
        // Due this month — upcoming
        const hasScheduled = inspections.some(i =>
          i.locationId === loc.id &&
          (i.inspectionStatus === 'scheduled' || i.inspectionStatus === 'ready_to_go') &&
          i.status !== 'completed'
        );
        if (!hasScheduled) {
          items.push({ type: 'upcoming', message: `${locLabel} — inspection due this month (${formatMonthYear(nextDue)})`, locationId: loc.id, dept: loc.department, dueDate: nextDue });
        }
      }
    }

    // Unconfirmed inspections: scheduled but month has arrived and not yet "ready_to_go"
    for (const insp of inspections) {
      if (insp.inspectionStatus !== 'scheduled') continue;
      const loc = locations.find(l => l.id === insp.locationId);
      if (!loc || !myDepartments.includes(loc.department)) continue;
      const inspMonth = (insp.appointmentDate || insp.date || '').slice(0, 7);
      if (inspMonth && inspMonth <= currentMonth) {
        const locLabel = `${loc.building} Rm ${loc.roomNumber}`;
        items.push({ type: 'unconfirmed', message: `${locLabel} — inspection on ${insp.appointmentDate || insp.date} still "Scheduled", confirm with contact to set "Ready to Go"`, inspectionId: insp.id, dept: loc.department, dueDate: insp.appointmentDate || insp.date });
      }
    }

    // Sort: overdue first, then unconfirmed, then upcoming
    const order = { overdue: 0, unconfirmed: 1, upcoming: 2 };
    return items.sort((a, b) => order[a.type] - order[b.type]);
  }, [locations, inspections, myDepartments]);

  // Selected department data
  const deptLocations = locations.filter(l => l.department === selectedDept);
  const deptInspections = inspections.filter(i => {
    const loc = locations.find(l => l.id === i.locationId);
    return loc?.department === selectedDept;
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const selectedInspection = inspections.find(i => i.id === selectedInspectionId);
  const selectedLocation = locations.find(l => l.id === selectedInspection?.locationId);

  // --- Handlers ---
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = locations.find(l => l.id === schedLocationId);
    if (!loc || !schedDate) return;

    const contactPerson = persons.find(p => loc.piDelegateIds?.includes(p.id));
    const newInsp: Inspection = {
      id: 'insp_' + Date.now(),
      title: `${loc.building} Rm ${loc.roomNumber} — ${schedType === 'night' ? 'Night' : 'Scheduled'} Inspection`,
      date: schedDate,
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      ftmId: currentUser.id,
      status: 'pending',
      inspectionStatus: 'scheduled',
      inspectionType: schedType,
      department: loc.department,
      score: 100,
      findings: [],
      locationId: loc.id,
      scheduledMonth: `${new Date(schedDate).toLocaleString('en', { month: 'long' })} ${CURRENT_YEAR}`,
      appointmentDate: schedDate
    };

    onAddInspection(newInsp, `Scheduled ${schedType} inspection for ${loc.building} Rm ${loc.roomNumber} on ${schedDate}. Contact: ${contactPerson?.name || 'N/A'}`);
    setIsScheduling(false);
    setSchedDate('');
    setSchedLocationId('');
  };

  const handleStatusChange = (status: Inspection['inspectionStatus']) => {
    if (!selectedInspection) return;
    onUpdateInspection({ ...selectedInspection, inspectionStatus: status });
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
      referredContactId: newFindingContactId || undefined,
      followUpActions: newFindingFollowUp,
      photoUrl: newFindingPhoto || undefined
    };
    onUpdateInspection({
      ...selectedInspection,
      score: Math.max(0, selectedInspection.score - (newFindingLevel * 5)),
      findings: [...selectedInspection.findings, newFinding]
    });
    setIsDraftingFinding(false);
    setNewFindingDesc('');
    setNewFindingLevel(1);
    setNewFindingFollowUp('');
    setNewFindingPhoto(null);
  };

  const handleRectifyFinding = (findingId: string) => {
    if (!selectedInspection) return;
    const recText = rectificationInputs[findingId];
    if (!recText) return;
    const nextFindings = selectedInspection.findings.map(f =>
      f.id === findingId ? { ...f, status: 'resolved' as const, rectificationRecord: recText } : f
    );
    onUpdateInspection({ ...selectedInspection, findings: nextFindings });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > 480) { height *= 480 / width; width = 480; }
        if (height > 960) { width *= 960 / height; height = 960; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        setNewFindingPhoto(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadReport = () => {
    if (!selectedInspection) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text(`INSPECTION REPORT: ${selectedInspection.title}`, 14, y); y += 10;
    doc.setFontSize(12);
    doc.text(`Date: ${selectedInspection.date}`, 14, y); y += 7;
    doc.text(`Inspector: ${selectedInspection.inspectorName}`, 14, y); y += 7;
    doc.text(`Type: ${selectedInspection.inspectionType === 'night' ? 'Night Inspection' : 'Scheduled Inspection'}`, 14, y); y += 7;
    doc.text(`Status: ${STATUS_LABELS[selectedInspection.inspectionStatus || ''] || selectedInspection.status}`, 14, y); y += 15;
    doc.setFontSize(14);
    doc.text('FINDINGS:', 14, y); y += 10;
    doc.setFontSize(10);
    if (selectedInspection.findings.length === 0) {
      doc.text('No findings recorded.', 14, y);
    } else {
      selectedInspection.findings.forEach((f, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${idx + 1}. [${f.category}] ${f.description} (Severity: ${f.severity})`, 14, y); y += 6;
        if (f.followUpActions) { doc.text(`   Follow-up: ${f.followUpActions}`, 14, y); y += 6; }
      });
    }
    doc.save(`Inspection_${selectedInspection.title.replace(/\s+/g, '_')}.pdf`);
  };

  // --- RENDER ---
  return (
    <div className="space-y-4">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button onClick={() => { setView('dashboard'); setSelectedDept(''); }}
          className="hover:text-slate-200 font-semibold transition flex items-center gap-1">
          <ClipboardCheck className="h-3.5 w-3.5 text-indigo-400" /> Inspection Dashboard
        </button>
        {view !== 'dashboard' && (
          <>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => { setView('department'); setSelectedInspectionId(null); }}
              className="hover:text-slate-200 font-semibold transition">{selectedDept}</button>
          </>
        )}
        {view === 'detail' && selectedInspection && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300 font-semibold">{selectedInspection.title}</span>
          </>
        )}
      </div>

      {/* ===== DASHBOARD VIEW ===== */}
      {view === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-100">Inspection Dashboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {assignedDepartments.length > 0
                  ? `Showing departments assigned to ${currentUser.name}.`
                  : `No departments assigned — showing all departments.`}
              </p>
            </div>
          </div>

          {/* Reminders / Outstanding Items */}
          {reminders.length > 0 && (
            <div className="bg-slate-900 border border-amber-800/40 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-900/30 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-300" />
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Outstanding Items ({reminders.length})</span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
                {reminders.map((r, idx) => (
                  <button key={idx}
                    onClick={() => {
                      if (r.inspectionId) { setSelectedDept(r.dept); setSelectedInspectionId(r.inspectionId); setView('detail'); }
                      else if (r.locationId) { setSelectedDept(r.dept); setView('department'); }
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-800/30 transition text-left">
                    {r.type === 'overdue' && <AlertTriangle className="h-3.5 w-3.5 text-rose-300 shrink-0" />}
                    {r.type === 'unconfirmed' && <Clock className="h-3.5 w-3.5 text-amber-300 shrink-0" />}
                    {r.type === 'upcoming' && <Calendar className="h-3.5 w-3.5 text-sky-300 shrink-0" />}
                    <span className={`text-[11px] ${r.type === 'overdue' ? 'text-rose-300' : r.type === 'unconfirmed' ? 'text-amber-300' : 'text-sky-300'}`}>{r.message}</span>
                    <span className="ml-auto text-[9px] text-slate-600 font-mono shrink-0">{r.dept}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Department Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {deptProgress.map(dp => {
              const pct = dp.totalRequired > 0 ? Math.round((dp.completed / dp.totalRequired) * 100) : 0;
              const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <button key={dp.dept}
                  onClick={() => { setSelectedDept(dp.dept); setView('department'); }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left hover:border-indigo-500/50 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition">{dp.dept}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition" />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3">
                    <span>{dp.locationCount} locations</span>
                    <span>{dp.completed}/{dp.totalRequired} inspections done</span>
                    {dp.scheduled > 0 && <span className="text-sky-300">{dp.scheduled} scheduled</span>}
                    {dp.nightCount > 0 && <span className="text-purple-300">{dp.nightCount} night</span>}
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="text-right text-[10px] text-slate-500 mt-1 font-mono">{pct}%</div>
                </button>
              );
            })}
          </div>

          {deptProgress.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No departments found. Assign departments via Field Team Assignment.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== DEPARTMENT VIEW ===== */}
      {view === 'department' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('dashboard')} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-100">{selectedDept}</h2>
                <p className="text-xs text-slate-400">{deptLocations.length} locations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedLocIds.length > 0 && (
                <button onClick={() => setShowBookingModal(true)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition">
                  <CalendarClock className="h-4 w-4" /> Open Booking Window ({selectedLocIds.length})
                </button>
              )}
              <button onClick={() => { setIsScheduling(true); setSchedLocationId(deptLocations[0]?.id || ''); }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition">
                <Plus className="h-4 w-4" /> Schedule Inspection
              </button>
            </div>
          </div>

          {/* Locations in this department */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Locations</div>
            <div className="divide-y divide-slate-800/60">
              {deptLocations.map(loc => {
                const locInspections = deptInspections.filter(i => i.locationId === loc.id && i.date?.startsWith(CURRENT_YEAR) && i.inspectionType !== 'night');
                const required = getRequiredInspections(loc);
                const done = locInspections.filter(i => i.status === 'completed' || i.inspectionStatus === 'closed' || i.inspectionStatus === 'issued').length;
                const contact = persons.find(p => loc.piDelegateIds?.includes(p.id));
                const nextDue = getNextInspectionDue(loc, inspections);
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = nextDue ? nextDue <= todayStr : true;
                const isSelected = selectedLocIds.includes(loc.id);
                const isActive = loc.status === 'Active';
                return (
                  <div key={loc.id} className={`px-4 py-3 flex items-center justify-between transition ${isSelected ? 'bg-emerald-950/20' : 'hover:bg-slate-800/20'} ${!isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isSelected} disabled={!isActive} onChange={() => toggleLocSelection(loc.id)}
                        className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40" title={isActive ? 'Select for booking window' : 'Inactive locations cannot be booked'} />
                      {done >= required ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Circle className="h-4 w-4 text-slate-600" />}
                      <div>
                        <span className="text-xs font-semibold text-slate-200">{loc.building} Rm {loc.roomNumber}</span>
                        <span className="text-[10px] text-slate-500 ml-2">{loc.roomNature}</span>
                        {!isActive && <span className="text-[9px] font-bold uppercase text-rose-300 bg-slate-900/80 border border-rose-500/30 rounded px-1.5 py-0.5 ml-2">{loc.status}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400">
                      <span className="font-mono">{done}/{required} done</span>
                      {nextDue && (
                        <span className={`font-mono px-1.5 py-0.5 rounded border ${isOverdue ? 'text-rose-300 border-rose-500/30 bg-slate-900/80' : 'text-slate-400 border-slate-700/40 bg-slate-900/80'}`}>
                          Next: {formatMonthYear(nextDue)}{isOverdue ? ' (overdue)' : ''}
                        </span>
                      )}
                      {!nextDue && <span className="text-rose-300 font-mono">Never inspected</span>}
                      {contact && <span className="text-slate-500">Contact: {contact.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking windows for this department */}
          {(() => {
            const deptWindows = windows.filter(w => w.department === selectedDept);
            if (deptWindows.length === 0) return null;
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-emerald-400" /> Booking Windows
                </div>
                <div className="divide-y divide-slate-800/60">
                  {deptWindows.map(w => (
                    <div key={w.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {w.status === 'open' ? <Unlock className="h-4 w-4 text-emerald-300" /> : <Lock className="h-4 w-4 text-slate-600" />}
                        <div>
                          <span className="text-xs font-semibold text-slate-200">{w.title}</span>
                          <span className="text-[10px] text-slate-500 block">{w.startDate} → {w.endDate} · {w.timeSlots.join(', ')} · {w.bookings.length} booked</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${w.status === 'open' ? 'text-emerald-300 border-emerald-500/30 bg-slate-900/80' : 'text-slate-500 border-slate-700/40 bg-slate-900/80'}`}>
                          {w.status}
                        </span>
                        <button onClick={() => onUpdateWindow({ ...w, status: w.status === 'open' ? 'closed' : 'open' })}
                          className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 transition">
                          {w.status === 'open' ? 'Close' : 'Re-open'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Inspections list for this department */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inspection Records ({CURRENT_YEAR})</div>
            {deptInspections.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500">No inspections recorded for this department.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {deptInspections.map(insp => {
                  const loc = locations.find(l => l.id === insp.locationId);
                  return (
                    <button key={insp.id}
                      onClick={() => { setSelectedInspectionId(insp.id); setView('detail'); }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/20 transition text-left">
                      <div className="flex items-center gap-3">
                        {insp.inspectionType === 'night' ? <Moon className="h-3.5 w-3.5 text-purple-400" /> : <Sun className="h-3.5 w-3.5 text-amber-300" />}
                        <div>
                          <span className="text-xs font-semibold text-slate-200">{loc ? `${loc.building} Rm ${loc.roomNumber}` : insp.title}</span>
                          <span className="text-[10px] text-slate-500 block">{insp.date} — {insp.inspectorName}</span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_COLORS[insp.inspectionStatus || ''] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {STATUS_LABELS[insp.inspectionStatus || ''] || insp.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== DETAIL VIEW ===== */}
      {view === 'detail' && selectedInspection && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => { setView('department'); setSelectedInspectionId(null); }} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-100">{selectedInspection.title}</h2>
                <p className="text-xs text-slate-400">{selectedInspection.date} — {selectedInspection.inspectorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadReport}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                <Download className="h-3.5 w-3.5 text-indigo-400" /> Report
              </button>
            </div>
          </div>

          {/* Status + Type + Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Status</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_COLORS[selectedInspection.inspectionStatus || ''] || ''}`}>
                {STATUS_LABELS[selectedInspection.inspectionStatus || ''] || selectedInspection.status}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Type</span>
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                {selectedInspection.inspectionType === 'night' ? <Moon className="h-3.5 w-3.5 text-purple-400" /> : <Sun className="h-3.5 w-3.5 text-amber-300" />}
                {selectedInspection.inspectionType === 'night' ? 'Night Inspection' : 'Scheduled Inspection'}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Score</span>
              <span className={`text-lg font-bold ${selectedInspection.score >= 80 ? 'text-emerald-300' : selectedInspection.score >= 60 ? 'text-amber-300' : 'text-rose-300'}`}>
                {selectedInspection.score}%
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Location</span>
              <span className="text-xs font-semibold text-slate-200">{selectedLocation ? `${selectedLocation.building} Rm ${selectedLocation.roomNumber}` : '—'}</span>
              {selectedLocation && <span className="text-[10px] text-slate-500 block">{selectedLocation.spaceID}</span>}
            </div>
          </div>

          {/* Status workflow buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">Update Status</span>
            <div className="flex flex-wrap gap-2">
              {(['scheduled', 'ready_to_go', 'drafting_report', 'supervisor_review', 'issued', 'pending_rectification', 'closed'] as const).map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                    selectedInspection.inspectionStatus === s
                      ? STATUS_COLORS[s]
                      : 'bg-slate-800/40 text-slate-500 border-slate-700/50 hover:text-slate-300 hover:border-slate-600'
                  }`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Findings ({selectedInspection.findings.length})</span>
              <button onClick={() => setIsDraftingFinding(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition">
                <Plus className="h-3 w-3" /> Add Finding
              </button>
            </div>

            {selectedInspection.findings.length === 0 && !isDraftingFinding && (
              <p className="text-xs text-slate-500 py-4 text-center">No findings recorded.</p>
            )}

            {selectedInspection.findings.map(f => (
              <div key={f.id} className={`p-3 rounded-lg border ${f.status === 'resolved' ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-slate-800/40 border-slate-800'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                      f.severity === 'high' ? 'bg-slate-900/80 text-rose-300 border-rose-500/30' :
                      f.severity === 'medium' ? 'bg-slate-900/80 text-amber-300 border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>{f.category} — L{f.actionLevel}</span>
                    <p className="text-xs text-slate-300 mt-1.5">{f.description}</p>
                    {f.followUpActions && <p className="text-[10px] text-slate-500 mt-1">Follow-up: {f.followUpActions}</p>}
                    {f.rectificationRecord && <p className="text-[10px] text-emerald-300 mt-1">Rectified: {f.rectificationRecord}</p>}
                  </div>
                  {f.status === 'resolved' ? (
                    <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                  ) : (
                    <div className="flex gap-1 shrink-0">
                      <input value={rectificationInputs[f.id] || ''} onChange={e => setRectificationInputs({ ...rectificationInputs, [f.id]: e.target.value })}
                        placeholder="Rectification note..." className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-200 w-32 focus:border-emerald-500 focus:outline-none" />
                      <button onClick={() => handleRectifyFinding(f.id)} className="p-1 text-emerald-300 hover:bg-emerald-950/40 rounded transition">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {f.photoUrl && <img src={f.photoUrl} alt="Finding" className="mt-2 rounded-lg border border-slate-700 max-h-40" />}
              </div>
            ))}

            {/* Add finding form */}
            {isDraftingFinding && (
              <div className="border border-indigo-500/30 rounded-lg p-4 bg-indigo-950/10 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select value={newFindingCat} onChange={e => setNewFindingCat(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={newFindingLevel} onChange={e => setNewFindingLevel(Number(e.target.value) as 1|2|3)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                    <option value={1}>Level 1 (Low)</option>
                    <option value={2}>Level 2 (Medium)</option>
                    <option value={3}>Level 3 (High)</option>
                  </select>
                </div>
                <textarea value={newFindingDesc} onChange={e => setNewFindingDesc(e.target.value)} rows={2} placeholder="Describe the finding..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none" />
                <input value={newFindingFollowUp} onChange={e => setNewFindingFollowUp(e.target.value)} placeholder="Follow-up actions (optional)"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                    <Camera className="h-3.5 w-3.5" /> Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {newFindingPhoto && <ImageIcon className="h-3.5 w-3.5 text-emerald-300" />}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsDraftingFinding(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-semibold hover:bg-slate-700 transition">Cancel</button>
                  <button onClick={handleAddFinding} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-bold hover:bg-indigo-500 transition">Add Finding</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== SCHEDULE MODAL ===== */}
      {isScheduling && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsScheduling(false)}>
          <div className="bg-slate-900 border border-indigo-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Schedule Inspection — {selectedDept}</h3>
              </div>
              <button onClick={() => setIsScheduling(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Location</label>
                <select value={schedLocationId} onChange={e => setSchedLocationId(e.target.value)} required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                  {deptLocations.map(l => <option key={l.id} value={l.id}>{l.building} Rm {l.roomNumber} ({l.roomNature})</option>)}
                </select>
                {schedLocationId && (() => {
                  const loc = locations.find(l => l.id === schedLocationId);
                  const contact = persons.find(p => loc?.piDelegateIds?.includes(p.id));
                  const req = loc ? getRequiredInspections(loc) : 1;
                  return (
                    <div className="mt-2 p-2 bg-slate-800/40 rounded-lg text-[10px] text-slate-400 space-y-0.5">
                      <p>Contact Person: <span className="text-slate-200 font-semibold">{contact?.name || 'Not assigned'}</span></p>
                      <p>Required inspections/year: <span className="text-amber-300 font-bold">{req}</span> {loc?.spaceType === 'Lab' ? '(Lab)' : ''}</p>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Inspection Date</label>
                <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Inspection Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSchedType('scheduled')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      schedType === 'scheduled' ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                    <Sun className="h-3.5 w-3.5" /> Scheduled
                  </button>
                  <button type="button" onClick={() => setSchedType('night')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                      schedType === 'night' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                    <Moon className="h-3.5 w-3.5" /> Night
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsScheduling(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== BOOKING WINDOW MODAL ===== */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowBookingModal(false)}>
          <div className="bg-slate-900 border border-emerald-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Open Booking Window — {selectedDept}</h3>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Selected Locations ({selectedLocIds.length})</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLocIds.map(id => {
                    const l = locations.find(x => x.id === id);
                    return l ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                        {l.building} Rm {l.roomNumber}
                        <button onClick={() => toggleLocSelection(id)} className="text-emerald-500 hover:text-rose-300"><X className="h-2.5 w-2.5" /></button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Booking Opens *</label>
                  <input type="date" value={bwStart} onChange={e => setBwStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Booking Closes *</label>
                  <input type="date" value={bwEnd} onChange={e => setBwEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Available Time Slots</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {bwSlots.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                      {s}
                      <button onClick={() => setBwSlots(bwSlots.filter(x => x !== s))} className="text-slate-500 hover:text-rose-300"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="time" value={bwCustomSlot} onChange={e => setBwCustomSlot(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none" />
                  <button onClick={() => { if (bwCustomSlot && !bwSlots.includes(bwCustomSlot)) { setBwSlots([...bwSlots, bwCustomSlot].sort()); setBwCustomSlot(''); } }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-semibold transition">Add</button>
                </div>
              </div>

              <p className="text-[10px] text-slate-500">Department users will be able to pick a date & time within this window for the selected locations.</p>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">Cancel</button>
                <button onClick={handleOpenBookingWindow} disabled={!bwStart || !bwEnd}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition">Open Window</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
