import React, { useState, useMemo } from 'react';
import { OrgUnit, Location } from '../types';
import { Building2, Plus, Trash2, AlertTriangle, Search, MapPin, ChevronDown, ChevronRight, Landmark, School, FolderOpen, X } from 'lucide-react';

interface DepartmentTabProps {
  orgUnits: OrgUnit[];
  locations: Location[];
  onUpdateOrgUnits: (units: OrgUnit[]) => void;
}

export default function DepartmentTab({ orgUnits, locations, onUpdateOrgUnits }: DepartmentTabProps) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Add form
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<OrgUnit['type']>('department');
  const [newParentId, setNewParentId] = useState('');

  const departments = orgUnits.filter(u => u.type === 'department');
  const schools = orgUnits.filter(u => u.type === 'school');
  const vps = orgUnits.filter(u => u.type === 'vp');

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(d =>
      d.name.toLowerCase().includes(q) || (d.code || '').toLowerCase().includes(q)
    );
  }, [departments, search]);

  // Locations per department
  const getLocationsForDept = (deptName: string) => locations.filter(l => l.department === deptName);

  // Parent name helper
  const parentName = (id?: string) => orgUnits.find(u => u.id === id)?.name || '';

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (orgUnits.some(u => u.name.toLowerCase() === trimmed.toLowerCase())) return;
    const unit: OrgUnit = {
      id: 'org_' + Date.now(),
      name: trimmed,
      code: newCode.trim().toUpperCase() || undefined,
      type: newType,
      parentId: newParentId || undefined
    };
    onUpdateOrgUnits([...orgUnits, unit]);
    setNewName(''); setNewCode(''); setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      const toRemove = new Set<string>();
      const collect = (uid: string) => { toRemove.add(uid); orgUnits.filter(u => u.parentId === uid).forEach(c => collect(c.id)); };
      collect(id);
      onUpdateOrgUnits(orgUnits.filter(u => !toRemove.has(u.id)));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const parentOptions = newType === 'vp' ? [] : newType === 'school' ? vps : [...vps, ...schools];

  const TYPE_ICON = { vp: Landmark, school: School, department: FolderOpen };

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-900/50 text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/20">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-200">Departments</h1>
            <p className="text-[10px] text-slate-500">{departments.length} departments · {orgUnits.length} total units</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition">
          <Plus className="h-4 w-4" /> Add Unit
        </button>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or code (e.g. CHEM, Physics)…"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Department list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">No departments match "{search}".</div>
        ) : (
          filtered.map(dept => {
            const deptLocations = getLocationsForDept(dept.name);
            const isExpanded = expandedId === dept.id;
            const school = parentName(dept.parentId);
            return (
              <div key={dept.id} className="bg-slate-900/40 border border-slate-800/50 rounded-lg overflow-hidden">
                {/* Department row */}
                <div
                  className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-slate-800/40 transition group"
                  onClick={() => setExpandedId(isExpanded ? null : dept.id)}
                >
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                  <span className="inline-flex items-center justify-center w-12 h-6 rounded bg-indigo-950/50 border border-indigo-800/40 text-[10px] font-mono font-bold text-indigo-300 shrink-0">
                    {dept.code || '—'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-200 truncate block">{dept.name}</span>
                    {school && <span className="text-[9px] text-slate-500">{school}</span>}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                    <MapPin className="h-3 w-3" /> {deptLocations.length}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }}
                    className={`p-1 rounded transition shrink-0 ${confirmDelete === dept.id ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-300 opacity-0 group-hover:opacity-100'}`}
                  >
                    {confirmDelete === dept.id ? <AlertTriangle className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Expanded: locations */}
                {isExpanded && (
                  <div className="border-t border-slate-800/50 px-4 py-3 bg-slate-950/30">
                    {deptLocations.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No locations assigned to this department.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {deptLocations.map(loc => (
                          <div key={loc.id} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 rounded px-2.5 py-1.5 border border-slate-800/50">
                            <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                            <span className="font-semibold">{loc.building} Rm {loc.roomNumber}</span>
                            <span className="text-slate-500 truncate">— {loc.roomNature}</span>
                            <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${loc.spaceType === 'Lab' ? 'bg-amber-950/40 text-amber-300' : 'bg-sky-950/40 text-sky-300'}`}>
                              {loc.spaceType || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Hierarchy overview (compact) */}
      <div className="shrink-0 bg-slate-900/40 border border-slate-800/50 rounded-lg p-3">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hierarchy</span>
        <div className="mt-1.5 space-y-1 text-[10px] text-slate-400">
          {vps.map(vp => {
            const Icon = TYPE_ICON.vp;
            const vpSchools = schools.filter(s => s.parentId === vp.id);
            const vpDepts = departments.filter(d => d.parentId === vp.id);
            return (
              <div key={vp.id}>
                <span className="flex items-center gap-1.5 font-semibold text-slate-300"><Icon className="h-3 w-3 text-amber-400" /> {vp.name}</span>
                {vpSchools.map(s => (
                  <div key={s.id} className="ml-4">
                    <span className="flex items-center gap-1.5 text-sky-300"><School className="h-2.5 w-2.5" /> {s.name} ({s.code})</span>
                    <span className="ml-4 text-slate-500">
                      {departments.filter(d => d.parentId === s.id).map(d => d.code).join(', ') || '—'}
                    </span>
                  </div>
                ))}
                {vpDepts.length > 0 && (
                  <span className="ml-4 text-slate-500">{vpDepts.map(d => d.code).join(', ')}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-slate-900 border border-indigo-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-100">Add Organizational Unit</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Name *</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Department of Chemistry"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Code</label>
                  <input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="CHEM" maxLength={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Type</label>
                  <select value={newType} onChange={e => { setNewType(e.target.value as OrgUnit['type']); setNewParentId(''); }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                    <option value="vp">Vice President</option>
                    <option value="school">School / Division</option>
                    <option value="department">Department / Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Parent</label>
                  <select value={newParentId} onChange={e => setNewParentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                    <option value="">None (top-level)</option>
                    {parentOptions.map(p => <option key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ''}{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">Cancel</button>
                <button onClick={handleAdd} disabled={!newName.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold py-2 rounded-lg transition">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
