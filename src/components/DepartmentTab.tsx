import React, { useState } from 'react';
import { Building2, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface DepartmentTabProps {
  departments: string[];
  onUpdateDepartments: (departments: string[]) => void;
}

export default function DepartmentTab({ departments, onUpdateDepartments }: DepartmentTabProps) {
  const [newDept, setNewDept] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    if (departments.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      return; // duplicate
    }
    onUpdateDepartments([...departments, trimmed]);
    setNewDept('');
  };

  const handleDelete = (dept: string) => {
    if (confirmDelete === dept) {
      onUpdateDepartments(departments.filter(d => d !== dept));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(dept);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-900/50 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-200">Departments</h1>
          <p className="text-xs text-slate-400">Manage the master list of departments used across the portal.</p>
        </div>
      </div>

      {/* Add department */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newDept}
          onChange={(e) => setNewDept(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="Enter department name…"
          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
        />
        <button
          onClick={handleAdd}
          disabled={!newDept.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Department list */}
      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/30">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{departments.length} Department{departments.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {departments.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No departments yet. Add one above.</div>
          ) : (
            departments.map((dept) => (
              <div key={dept} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition group">
                <span className="text-sm font-medium text-slate-200">{dept}</span>
                <button
                  onClick={() => handleDelete(dept)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition ${
                    confirmDelete === dept
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-500 hover:text-rose-300 hover:bg-rose-950/30 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {confirmDelete === dept ? (
                    <><AlertTriangle className="h-3 w-3" /> Confirm?</>
                  ) : (
                    <><Trash2 className="h-3 w-3" /> Remove</>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
