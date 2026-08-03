import React, { useState, useMemo } from 'react';
import { OrgUnit, Location } from '../types';
import {
  Building2, Plus, Trash2, AlertTriangle, Search, MapPin,
  ChevronDown, ChevronRight, Landmark, School, FolderOpen,
  X, Pencil, Check, Factory, GraduationCap, Globe, Layers,
  Network, List, Users, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';

interface DepartmentTabProps {
  orgUnits: OrgUnit[];
  locations: Location[];
  onUpdateOrgUnits: (units: OrgUnit[]) => void;
}

/* ─── colour palette per type ─── */
const TYPE_STYLE: Record<string, { bg: string; border: string; text: string; badge: string; line: string }> = {
  vp:          { bg: 'bg-amber-950/30',    border: 'border-amber-700/30',   text: 'text-amber-300',   badge: 'bg-amber-900/60 text-amber-200 border-amber-700/40',   line: 'bg-amber-700/30' },
  school:      { bg: 'bg-sky-950/30',      border: 'border-sky-700/30',     text: 'text-sky-300',     badge: 'bg-sky-900/60 text-sky-200 border-sky-700/40',       line: 'bg-sky-700/30' },
  department:  { bg: 'bg-indigo-950/30',   border: 'border-indigo-700/30',  text: 'text-indigo-300',  badge: 'bg-indigo-900/60 text-indigo-200 border-indigo-700/40', line: 'bg-indigo-700/20' },
  office:      { bg: 'bg-slate-800/30',    border: 'border-slate-600/30',   text: 'text-slate-300',   badge: 'bg-slate-700/60 text-slate-200 border-slate-600/40',  line: 'bg-slate-600/20' },
  facility:    { bg: 'bg-emerald-950/30',  border: 'border-emerald-700/30', text: 'text-emerald-300', badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/40', line: 'bg-emerald-700/20' },
  institute:   { bg: 'bg-violet-950/30',   border: 'border-violet-700/30',  text: 'text-violet-300',  badge: 'bg-violet-900/60 text-violet-200 border-violet-700/40', line: 'bg-violet-700/20' },
  subsidiary:  { bg: 'bg-rose-950/30',     border: 'border-rose-700/30',    text: 'text-rose-300',    badge: 'bg-rose-900/60 text-rose-200 border-rose-700/40',     line: 'bg-rose-700/20' },
  other:       { bg: 'bg-zinc-800/30',     border: 'border-zinc-600/30',    text: 'text-zinc-400',    badge: 'bg-zinc-700/60 text-zinc-300 border-zinc-600/40',     line: 'bg-zinc-600/20' },
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  vp: Landmark, school: School, department: FolderOpen, office: Building2,
  facility: Factory, institute: GraduationCap, subsidiary: Globe, other: Layers
};

const TYPE_LABEL: Record<string, string> = {
  vp: 'VP Office', school: 'School', department: 'Department', office: 'Office',
  facility: 'Facility', institute: 'Institute', subsidiary: 'Subsidiary', other: 'Other'
};

export default function DepartmentTab({ orgUnits, locations, onUpdateOrgUnits }: DepartmentTabProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Start with VP nodes expanded
    return new Set(orgUnits.filter(u => u.type === 'vp').map(u => u.id));
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<OrgUnit['type']>('department');
  const [newParentId, setNewParentId] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editType, setEditType] = useState<OrgUnit['type']>('department');
  const [editParentId, setEditParentId] = useState('');

  const departments = orgUnits.filter(u => u.type !== 'vp' && u.type !== 'school');
  const schools = orgUnits.filter(u => u.type === 'school');
  const vps = orgUnits.filter(u => u.type === 'vp');

  const getLocationsForDept = (dept: OrgUnit) => locations.filter(l => l.department === dept.code);
  const getChildren = (parent: OrgUnit) => orgUnits.filter(u => u.parentId === parent.id);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedNodes(new Set(orgUnits.map(u => u.id)));
  const collapseAll = () => setExpandedNodes(new Set(['org_op']));

  // Filtered tree for search
  const matchingIds = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const ids = new Set<string>();
    orgUnits.forEach(u => {
      if (u.name.toLowerCase().includes(q) || (u.code || '').toLowerCase().includes(q)) {
        ids.add(u.id);
        // Also include ancestors so the tree path is visible
        let cur = orgUnits.find(o => o.id === u.parentId);
        while (cur) { ids.add(cur.id); cur = orgUnits.find(o => o.id === cur!.parentId); }
      }
    });
    return ids;
  }, [search, orgUnits]);

  // Stats
  const totalLocations = locations.length;
  const assignedLocations = locations.filter(l => orgUnits.some(u => u.code === l.department)).length;

  // ─── CRUD handlers ───
  const parentName = (id?: string) => orgUnits.find(u => u.id === id)?.name || '';

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (orgUnits.some(u => u.name.toLowerCase() === trimmed.toLowerCase())) return;
    const unit: OrgUnit = {
      id: 'org_' + Date.now(), name: trimmed,
      code: newCode.trim().toUpperCase() || undefined,
      type: newType, parentId: newParentId || undefined
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
      if (selectedId === id) setSelectedId(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const startEdit = (unit: OrgUnit) => {
    setEditingId(unit.id);
    setEditName(unit.name);
    setEditCode(unit.code || '');
    setEditType(unit.type);
    setEditParentId(unit.parentId || '');
  };

  const cancelEdit = () => { setEditingId(null); setEditName(''); setEditCode(''); setEditType('department'); setEditParentId(''); };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    const updated = orgUnits.map(u => u.id !== editingId ? u : {
      ...u, name: editName.trim(), code: editCode.trim().toUpperCase() || undefined,
      type: editType, parentId: editParentId || undefined
    });
    onUpdateOrgUnits(updated);
    cancelEdit();
  };

  const editParentOptions = editType === 'vp' ? [] : editType === 'school' ? vps : [...vps, ...schools];
  const addParentOptions = newType === 'vp' ? [] : newType === 'school' ? vps : [...vps, ...schools];

  const getUnitLabel = (u: OrgUnit) => u.code === 'OP' ? 'President' : (TYPE_LABEL[u.type] || u.type);

  /* ─── Org Chart Node ─── */
  const ChartNode = ({ unit, depth = 0 }: { unit: OrgUnit; depth?: number }) => {
    const children = getChildren(unit).sort((a, b) => {
      // Offices (Dean's) first, then schools, then departments, then the rest
      const order: Record<string, number> = { office: 0, school: 1, department: 2, institute: 3, facility: 4, subsidiary: 5, other: 6 };
      return (order[a.type] ?? 9) - (order[b.type] ?? 9);
    });
    const isExpanded = expandedNodes.has(unit.id);
    const hasChildren = children.length > 0;
    const style = TYPE_STYLE[unit.type] || TYPE_STYLE.other;
    const Icon = TYPE_ICON[unit.type] || Layers;
    const locCount = locations.filter(l => l.department === unit.code).length;
    const isSelected = selectedId === unit.id;
    const isEditing = editingId === unit.id;
    const isMatching = matchingIds === null || matchingIds.has(unit.id);

    if (matchingIds !== null && !isMatching) return null;

    return (
      <div className="flex flex-col items-center">
        {/* Node card */}
        <div
          onClick={() => { if (!isEditing) { setSelectedId(isSelected ? null : unit.id); if (hasChildren) toggleNode(unit.id); } }}
          className={`relative group cursor-pointer rounded-xl border px-3 py-2 transition-all duration-200 min-w-[140px] max-w-[200px]
            ${style.bg} ${style.border}
            ${isSelected ? 'ring-2 ring-offset-1 ring-offset-slate-950 ring-indigo-500/60 scale-[1.02]' : 'hover:scale-[1.01] hover:brightness-110'}
          `}
        >
          {/* Type indicator dot */}
          <div className="flex items-start gap-2">
            <div className={`p-1 rounded-lg ${style.badge} border shrink-0`}>
              <Icon className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              {unit.code && (
                <span className={`text-[9px] font-mono font-bold ${style.text} block truncate`}>{unit.code}</span>
              )}
              <span className="text-[11px] font-semibold text-slate-200 block truncate leading-tight">{unit.name}</span>
            </div>
          </div>

          {/* Footer: locations + type label */}
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-800/30">
            <span className="text-[8px] text-slate-500 uppercase tracking-wider">{getUnitLabel(unit)}</span>
            {locCount > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-slate-500">
                <MapPin className="h-2.5 w-2.5" /> {locCount}
              </span>
            )}
          </div>

          {/* Expand indicator */}
          {hasChildren && (
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${style.bg} ${style.border}`}>
                {isExpanded
                  ? <ChevronDown className={`h-3 w-3 ${style.text}`} />
                  : <ChevronRight className={`h-3 w-3 ${style.text} rotate-90`} />
                }
              </div>
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button onClick={e => { e.stopPropagation(); startEdit(unit); }}
              className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-300 transition">
              <Pencil className="h-2.5 w-2.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); handleDelete(unit.id); }}
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${confirmDelete === unit.id ? 'bg-rose-600 border-rose-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-300'}`}>
              {confirmDelete === unit.id ? <AlertTriangle className="h-2.5 w-2.5" /> : <Trash2 className="h-2.5 w-2.5" />}
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center mt-0">
            {/* Vertical line from parent to horizontal bar */}
            <div className={`w-px h-4 ${style.line}`} />

            {/* Horizontal connector bar + children */}
            <div className="flex items-start gap-3 relative">
              {/* Horizontal line across children */}
              {children.length > 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-slate-700/30"
                  style={{ width: `calc(100% - 100px)` }} />
              )}
              {children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical line from horizontal bar to child */}
                  <div className={`w-px h-4 ${TYPE_STYLE[child.type]?.line || 'bg-slate-700/20'}`} />
                  <ChartNode unit={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─── Edit panel (side panel when a node is selected) ─── */
  const selectedUnit = selectedId ? orgUnits.find(u => u.id === selectedId) : null;
  const selectedChildren = selectedUnit ? getChildren(selectedUnit) : [];
  const selectedLocations = selectedUnit ? locations.filter(l => l.department === selectedUnit.code) : [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="shrink-0 px-4 pt-4 pb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-900/50 text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-500/20">
            <Network className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-200">Organization</h1>
            <p className="text-[10px] text-slate-500">
              {orgUnits.length} units · {assignedLocations}/{totalLocations} locations mapped
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-slate-800/60 rounded-lg border border-slate-700/50 p-0.5">
            <button onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition ${viewMode === 'chart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <Network className="h-3 w-3" /> Chart
            </button>
            <button onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <List className="h-3 w-3" /> List
            </button>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      {/* ─── Search + controls ─── */}
      <div className="shrink-0 px-4 pb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search units by name or code…"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {viewMode === 'chart' && (
          <div className="flex gap-1 items-center">
            <button onClick={expandAll} className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded border border-slate-800 transition">Expand all</button>
            <button onClick={collapseAll} className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded border border-slate-800 transition">Collapse</button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="p-1.5 text-slate-500 hover:text-slate-300 rounded border border-slate-800 transition" title="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-slate-500 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))} className="p-1.5 text-slate-500 hover:text-slate-300 rounded border border-slate-800 transition" title="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setZoom(1)} className="p-1.5 text-slate-500 hover:text-slate-300 rounded border border-slate-800 transition" title="Reset zoom">
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Legend ─── */}
      <div className="shrink-0 px-4 pb-2 flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(TYPE_STYLE).map(([type, s]) => {
          const Icon = TYPE_ICON[type];
          return (
            <span key={type} className="flex items-center gap-1 text-[9px] text-slate-500">
              {Icon && <Icon className={`h-2.5 w-2.5 ${s.text}`} />}
              {TYPE_LABEL[type]}
            </span>
          );
        })}
      </div>

      {/* ─── Main content area ─── */}
      <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4">

        {/* Chart or List view */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {viewMode === 'chart' ? (
            /* ─── ORG CHART VIEW ─── */
            <div className="inline-flex flex-col items-center min-w-full py-4 px-8" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
              {/* Render all top-level nodes (no parent) — President is the root */}
              {orgUnits.filter(u => !u.parentId).map(u => (
                <div key={u.id} className="mb-8">
                  <ChartNode unit={u} />
                </div>
              ))}
            </div>
          ) : (
            /* ─── LIST VIEW ─── */
            <div className="space-y-1 py-2">
              {departments
                .filter(d => !matchingIds || matchingIds.has(d.id))
                .sort((a, b) => {
                  const order: Record<string, number> = { office: 0, department: 1, institute: 2, facility: 3, subsidiary: 4, other: 5 };
                  return (order[a.type] ?? 9) - (order[b.type] ?? 9);
                })
                .map(dept => {
                  const deptLocations = getLocationsForDept(dept);
                  const school = parentName(dept.parentId);
                  const style = TYPE_STYLE[dept.type] || TYPE_STYLE.other;
                  const Icon = TYPE_ICON[dept.type] || Layers;
                  return (
                    <div key={dept.id} className={`${style.bg} border ${style.border} rounded-lg overflow-hidden group`}>
                      <div className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:brightness-110 transition"
                        onClick={() => setSelectedId(dept.id)}>
                        <div className={`p-1 rounded-lg ${style.badge} border shrink-0`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className={`inline-flex items-center justify-center w-12 h-6 rounded ${style.badge} border text-[10px] font-mono font-bold shrink-0`}>
                          {dept.code || '—'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-200 truncate block">{dept.name}</span>
                          {school && <span className="text-[9px] text-slate-500">{school}</span>}
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                          <MapPin className="h-3 w-3" /> {deptLocations.length}
                        </span>
                        <button onClick={e => { e.stopPropagation(); startEdit(dept); }}
                          className="p-1 rounded text-slate-600 hover:text-indigo-300 transition shrink-0 opacity-0 group-hover:opacity-100">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDelete(dept.id); }}
                          className={`p-1 rounded transition shrink-0 ${confirmDelete === dept.id ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-300 opacity-0 group-hover:opacity-100'}`}>
                          {confirmDelete === dept.id ? <AlertTriangle className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {/* Inline edit */}
                      {editingId === dept.id && (
                        <div className="border-t border-slate-800/50 px-4 py-3 bg-slate-950/30 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Name</label>
                              <input value={editName} onChange={e => setEditName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Code</label>
                              <input value={editCode} onChange={e => setEditCode(e.target.value.toUpperCase())} maxLength={6}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Type</label>
                              <select value={editType} onChange={e => { setEditType(e.target.value as OrgUnit['type']); setEditParentId(''); }}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                                <option value="vp">Vice President</option>
                                <option value="school">School / Division</option>
                                <option value="department">Department</option>
                                <option value="office">Office / Admin</option>
                                <option value="facility">Central Facility</option>
                                <option value="institute">Research Institute</option>
                                <option value="subsidiary">Subsidiary</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Parent</label>
                              <select value={editParentId} onChange={e => setEditParentId(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                                <option value="">None (top-level)</option>
                                {editParentOptions.map(p => <option key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ''}{p.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button onClick={cancelEdit} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-1.5 rounded-lg transition">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={!editName.trim()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold py-1.5 rounded-lg transition">Save</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ─── Detail side panel ─── */}
        {selectedUnit && (
          <div className="w-72 shrink-0 bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 overflow-y-auto custom-scrollbar space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Unit Details</span>
              <button onClick={() => setSelectedId(null)} className="text-slate-600 hover:text-slate-300"><X className="h-3.5 w-3.5" /></button>
            </div>

            {/* Unit header */}
            {(() => {
              const style = TYPE_STYLE[selectedUnit.type] || TYPE_STYLE.other;
              const Icon = TYPE_ICON[selectedUnit.type] || Layers;
              return (
                <div className={`${style.bg} border ${style.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${style.badge} border`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      {selectedUnit.code && <span className={`text-xs font-mono font-bold ${style.text} block`}>{selectedUnit.code}</span>}
                      <span className="text-sm font-bold text-slate-100 block truncate">{selectedUnit.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span>{getUnitLabel(selectedUnit)}</span>
                    <span>·</span>
                    <span>{parentName(selectedUnit.parentId) || 'Top-level'}</span>
                  </div>
                </div>
              );
            })()}

            {/* Children */}
            {selectedChildren.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3" /> Direct Reports ({selectedChildren.length})
                </span>
                <div className="mt-1.5 space-y-1">
                  {selectedChildren.map(child => {
                    const cs = TYPE_STYLE[child.type] || TYPE_STYLE.other;
                    const CI = TYPE_ICON[child.type] || Layers;
                    return (
                      <div key={child.id} onClick={() => { setSelectedId(child.id); if (!expandedNodes.has(selectedUnit.id)) toggleNode(selectedUnit.id); }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${cs.bg} border ${cs.border} cursor-pointer hover:brightness-110 transition`}>
                        <CI className={`h-3 w-3 ${cs.text} shrink-0`} />
                        <span className="text-[10px] font-mono font-bold text-slate-400">{child.code || '—'}</span>
                        <span className="text-xs text-slate-300 truncate">{child.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Locations */}
            {selectedLocations.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Locations ({selectedLocations.length})
                </span>
                <div className="mt-1.5 space-y-1">
                  {selectedLocations.map(loc => (
                    <div key={loc.id} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/40 rounded-lg px-2.5 py-1.5 border border-slate-800/50">
                      <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="font-semibold">{loc.spaceID}</span>
                      <span className="text-slate-500 truncate">{loc.roomNature}</span>
                      <span className={`ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded ${loc.spaceType === 'Lab' ? 'bg-amber-950/40 text-amber-300' : 'bg-sky-950/40 text-sky-300'}`}>
                        {loc.spaceType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800/50">
              <button onClick={() => startEdit(selectedUnit)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold py-2 rounded-lg transition border border-indigo-600/20">
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => handleDelete(selectedUnit.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition border
                  ${confirmDelete === selectedUnit.id
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border-rose-600/20'
                  }`}>
                {confirmDelete === selectedUnit.id ? <><AlertTriangle className="h-3 w-3" /> Confirm</> : <><Trash2 className="h-3 w-3" /> Delete</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add modal ─── */}
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
                    <option value="department">Department</option>
                    <option value="office">Office / Admin</option>
                    <option value="facility">Central Facility</option>
                    <option value="institute">Research Institute</option>
                    <option value="subsidiary">Subsidiary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Parent</label>
                  <select value={newParentId} onChange={e => setNewParentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                    <option value="">None (top-level)</option>
                    {addParentOptions.map(p => <option key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ''}{p.name}</option>)}
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
