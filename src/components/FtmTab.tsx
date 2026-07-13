import React from 'react';
import { Person, Location } from '../types';
import { Shield, Building2, User, UserCheck, X } from 'lucide-react';

interface FtmTabProps {
  persons: Person[];
  locations: Location[];
  onUpdatePerson: (person: Person) => void;
}

export default function FtmTab({ persons, locations, onUpdatePerson }: FtmTabProps) {
  // Get all unique departments from locations
  const allDepartments = Array.from(new Set(locations.map(l => l.department))).filter(Boolean).sort();
  
  // Get all FTMs
  const ftms = persons.filter(p => p.role === 'Field Team Member' || p.role === 'FTM');

  // Find departments that are not assigned to any FTM yet
  const assignedDepts = new Set(ftms.flatMap(f => f.assignedDepartments || []));
  const unassignedDepartments = allDepartments.filter(d => !assignedDepts.has(d));

  const handleDragStart = (e: React.DragEvent, department: string) => {
    e.dataTransfer.setData('department', department);
  };

  const handleDrop = (e: React.DragEvent, ftmId: string) => {
    e.preventDefault();
    const department = e.dataTransfer.getData('department');
    if (!department) return;

    // Find the FTM
    const targetFtm = ftms.find(f => f.id === ftmId);
    if (!targetFtm) return;

    // Avoid duplicates
    if (targetFtm.assignedDepartments?.includes(department)) return;
    
    // First, remove it from any other FTM
    const oldFtm = ftms.find(f => f.assignedDepartments?.includes(department));
    if (oldFtm && oldFtm.id !== ftmId) {
      onUpdatePerson({
        ...oldFtm,
        assignedDepartments: oldFtm.assignedDepartments?.filter(d => d !== department) || []
      });
    }

    // Now add to the new FTM
    onUpdatePerson({
      ...targetFtm,
      assignedDepartments: [...(targetFtm.assignedDepartments || []), department]
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveDept = (ftmId: string, department: string) => {
    const targetFtm = ftms.find(f => f.id === ftmId);
    if (!targetFtm) return;

    onUpdatePerson({
      ...targetFtm,
      assignedDepartments: targetFtm.assignedDepartments?.filter(d => d !== department) || []
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 overflow-hidden">
      {/* Unassigned Departments */}
      <div className="w-full md:w-80 flex flex-col bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden min-h-[250px] md:min-h-0">
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            Unassigned Departments
          </h2>
          <p className="text-xs text-slate-400 mt-1">Drag departments to assign them to FTMs</p>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {unassignedDepartments.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-4 border border-dashed border-slate-700 rounded-lg">All departments assigned.</div>
          ) : (
            unassignedDepartments.map(dept => (
              <div
                key={dept}
                draggable
                onDragStart={(e) => handleDragStart(e, dept)}
                className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 cursor-grab active:cursor-grabbing transition text-sm font-medium text-slate-200 shadow-sm"
              >
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
            <Shield className="h-5 w-5 text-indigo-400" />
            Field Team Members (FTM)
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage departmental assignments for field officers. Drop departments into their respective boxes.</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {ftms.map(ftm => (
              <div
                key={ftm.id}
                onDrop={(e) => handleDrop(e, ftm.id)}
                onDragOver={handleDragOver}
                className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col h-[300px] shadow-sm transition hover:border-indigo-500/50"
              >
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
                      <div 
                        key={dept}
                        draggable
                        onDragStart={(e) => handleDragStart(e, dept)}
                        className="bg-indigo-900/20 border border-indigo-500/30 text-indigo-300 rounded px-2.5 py-2 text-xs flex justify-between items-center group cursor-grab active:cursor-grabbing"
                      >
                        <span className="truncate pr-2 font-medium">{dept}</span>
                        <button 
                          onClick={() => handleRemoveDept(ftm.id, dept)}
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
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
  );
}
