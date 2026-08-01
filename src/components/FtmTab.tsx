import React, { useState } from 'react';
import { Person } from '../types';
import { Shield, Building2, User, UserCheck, X, Target, ClipboardCheck, Radio, Zap, Flame, Lock, Plane, Activity, Droplets, Wind } from 'lucide-react';

interface FtmTabProps {
  persons: Person[];
  departments: string[];
  onUpdatePerson: (person: Person) => void;
}

const FOCAL_POINTS = [
  { id: 'Inspection', icon: ClipboardCheck, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/30' },
  { id: 'Radiation', icon: Radio, color: 'text-amber-300 border-amber-500/30 bg-amber-950/30' },
  { id: 'Laser', icon: Zap, color: 'text-purple-300 border-purple-500/30 bg-purple-950/30' },
  { id: 'Hot Work Permits', icon: Flame, color: 'text-orange-300 border-orange-500/30 bg-orange-950/30' },
  { id: 'Confined Space Entry', icon: Lock, color: 'text-sky-300 border-sky-500/30 bg-sky-950/30' },
  { id: 'UAV', icon: Plane, color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/30' },
  { id: 'Exposure Monitoring', icon: Activity, color: 'text-rose-300 border-rose-500/30 bg-rose-950/30' },
  { id: 'Water Sanitation', icon: Droplets, color: 'text-blue-300 border-blue-500/30 bg-blue-950/30' },
  { id: 'IEQ', icon: Wind, color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/30' }
];

export default function FtmTab({ persons, departments, onUpdatePerson }: FtmTabProps) {
  const [subTab, setSubTab] = useState<'departments' | 'focalpoints'>('departments');

  // Use the managed departments list
  const allDepartments = [...departments].sort();

  // Get all FTMs
  const ftms = persons.filter(p => p.role === 'Field Team Member' || p.role === 'FTM');

  // --- Department Assignment logic ---
  const assignedDepts = new Set(ftms.flatMap(f => f.assignedDepartments || []));
  const unassignedDepartments = allDepartments.filter(d => !assignedDepts.has(d));

  const handleDragStart = (e: React.DragEvent, department: string) => {
    e.dataTransfer.setData('department', department);
  };

  const handleDrop = (e: React.DragEvent, ftmId: string) => {
    e.preventDefault();
    const department = e.dataTransfer.getData('department');
    if (!department) return;
    const targetFtm = ftms.find(f => f.id === ftmId);
    if (!targetFtm) return;
    if (targetFtm.assignedDepartments?.includes(department)) return;

    // Remove from old FTM (1:1 for departments)
    const oldFtm = ftms.find(f => f.assignedDepartments?.includes(department));
    if (oldFtm && oldFtm.id !== ftmId) {
      onUpdatePerson({ ...oldFtm, assignedDepartments: oldFtm.assignedDepartments?.filter(d => d !== department) || [] });
    }
    onUpdatePerson({ ...targetFtm, assignedDepartments: [...(targetFtm.assignedDepartments || []), department] });
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleRemoveDept = (ftmId: string, department: string) => {
    const targetFtm = ftms.find(f => f.id === ftmId);
    if (!targetFtm) return;
    onUpdatePerson({ ...targetFtm, assignedDepartments: targetFtm.assignedDepartments?.filter(d => d !== department) || [] });
  };

  // --- Focal Point Assignment logic (many-to-many) ---
  const toggleFocalPoint = (ftmId: string, focalPoint: string) => {
    const ftm = ftms.find(f => f.id === ftmId);
    if (!ftm) return;
    const current = ftm.assignedFocalPoints || [];
    const next = current.includes(focalPoint)
      ? current.filter(fp => fp !== focalPoint)
      : [...current, focalPoint];
    onUpdatePerson({ ...ftm, assignedFocalPoints: next });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/40 rounded-lg w-fit mb-4">
        <button onClick={() => setSubTab('departments')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold transition ${
            subTab === 'departments' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'}`}>
          <Building2 className="h-3.5 w-3.5" /> Department Assignment
        </button>
        <button onClick={() => setSubTab('focalpoints')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold transition ${
            subTab === 'focalpoints' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'}`}>
          <Target className="h-3.5 w-3.5" /> Focal Point Assignment
        </button>
      </div>

      {/* ===== DEPARTMENT ASSIGNMENT ===== */}
      {subTab === 'departments' && (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* Unassigned Departments */}
          <div className="w-full md:w-80 flex flex-col bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden min-h-[200px] md:min-h-0">
            <div className="bg-slate-800 p-4 border-b border-slate-700">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" /> Unassigned Departments
              </h2>
              <p className="text-xs text-slate-400 mt-1">Drag departments to assign them to FTMs</p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {unassignedDepartments.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-700 rounded-lg">All departments assigned.</div>
              ) : (
                unassignedDepartments.map(dept => (
                  <div key={dept} draggable onDragStart={(e) => handleDragStart(e, dept)}
                    className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 cursor-grab active:cursor-grabbing transition text-sm font-medium text-slate-200 shadow-sm">
                    {dept}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FTMs Board */}
          <div className="flex-1 flex flex-col bg-slate-900/40 border border-slate-800/50 rounded-xl overflow-hidden">
            <div className="bg-slate-800/50 p-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" /> Field Team Members
              </h2>
              <p className="text-xs text-slate-400 mt-1">Drop departments into an FTM's box. One department = one FTM.</p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {ftms.map(ftm => (
                  <div key={ftm.id} onDrop={(e) => handleDrop(e, ftm.id)} onDragOver={handleDragOver}
                    className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col h-[260px] shadow-sm transition hover:border-indigo-500/50">
                    <div className="flex items-center gap-3 mb-3 border-b border-slate-700 pb-3">
                      <div className="h-10 w-10 bg-indigo-900/50 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">{ftm.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{ftm.title || 'FTM'}</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 bg-slate-900/50 rounded-lg p-2 border border-slate-800 custom-scrollbar">
                      {(!ftm.assignedDepartments || ftm.assignedDepartments.length === 0) ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-4 border-2 border-dashed border-slate-800 rounded-lg">
                          Drop departments here
                        </div>
                      ) : (
                        ftm.assignedDepartments.map(dept => (
                          <div key={dept} draggable onDragStart={(e) => handleDragStart(e, dept)}
                            className="bg-indigo-900/20 border border-indigo-500/30 text-indigo-300 rounded px-2.5 py-2 text-xs flex justify-between items-center group cursor-grab active:cursor-grabbing">
                            <span className="truncate pr-2 font-medium">{dept}</span>
                            <button onClick={() => handleRemoveDept(ftm.id, dept)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                {ftms.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                    <User className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No FTMs found in directory.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOCAL POINT ASSIGNMENT ===== */}
      {subTab === 'focalpoints' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-emerald-400" /> Focal Point Assignment
            </h2>
            <p className="text-xs text-slate-400">Assign program focal points to FTMs. Multiple FTMs can share a focal point, and each FTM can have multiple focal points.</p>
          </div>

          {/* Focal point grid — each focal point shows its assigned FTMs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {FOCAL_POINTS.map(fp => {
              const assignedFtms = ftms.filter(f => f.assignedFocalPoints?.includes(fp.id));
              const Icon = fp.icon;
              return (
                <div key={fp.id} className={`bg-slate-900/60 border rounded-xl p-4 ${assignedFtms.length > 0 ? fp.color : 'border-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-bold text-slate-200">{fp.id}</span>
                    <span className="ml-auto text-[9px] font-mono text-slate-500">{assignedFtms.length} assigned</span>
                  </div>
                  {assignedFtms.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {assignedFtms.map(f => (
                        <span key={f.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-semibold text-slate-300">
                          {f.name}
                          <button onClick={() => toggleFocalPoint(f.id, fp.id)} className="text-slate-500 hover:text-rose-300 transition"><X className="h-2.5 w-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* FTM toggle buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {ftms.map(f => {
                      const isActive = f.assignedFocalPoints?.includes(fp.id);
                      return (
                        <button key={f.id} onClick={() => toggleFocalPoint(f.id, fp.id)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold border transition ${
                            isActive
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                          }`}>
                          {f.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {ftms.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
              <User className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No FTMs found in directory.</p>
            </div>
          )}

          {/* Per-FTM summary */}
          {ftms.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">FTM Focal Point Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {ftms.map(ftm => (
                  <div key={ftm.id} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">{ftm.name}</span>
                    </div>
                    {(ftm.assignedFocalPoints || []).length === 0 ? (
                      <span className="text-[10px] text-slate-500">No focal points assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {ftm.assignedFocalPoints!.map(fpId => {
                          const fp = FOCAL_POINTS.find(f => f.id === fpId);
                          const Icon = fp?.icon || Target;
                          return (
                            <span key={fpId} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${fp?.color || 'text-slate-400 border-slate-700 bg-slate-800'}`}>
                              <Icon className="h-2.5 w-2.5" /> {fpId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
