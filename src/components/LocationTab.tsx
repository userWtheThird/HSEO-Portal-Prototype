import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  User, 
  Users, 
  Phone, 
  Mail, 
  Building, 
  Plus, 
  Search, 
  Shield, 
  ArrowRight, 
  Bookmark,
  Briefcase,
  Zap,
  Radio,
  Flame,
  Trash2,
  Droplets,
  Wind,
  ClipboardCheck,
  X,
  FileText,
  Edit2
} from 'lucide-react';
import { 
  Person, 
  Location, 
  User as AuthUser,
  Inspection,
  RadiationSource,
  LaserDevice,
  HotWorkPermit,
  HazardousWasteRequest,
  WaterLog,
  IeqLog,
  IeqComplaint
} from '../types';

interface LocationTabProps {
  currentUser: AuthUser;
  locations: Location[];
  persons: Person[];
  inspections: Inspection[];
  radiationSources: RadiationSource[];
  laserDevices: LaserDevice[];
  permits: HotWorkPermit[];
  wasteRequests: HazardousWasteRequest[];
  waterLogs: WaterLog[];
  ieqLogs: IeqLog[];
  ieqComplaints: IeqComplaint[];
  onAddLocation: (loc: Location) => void;
  onAddPerson: (pers: Person) => void;
  onUpdateLocation: (loc: Location) => void;
  onNavigateToPerson: (personId: string) => void;
}

export default function LocationTab({
  currentUser,
  locations,
  persons,
  inspections,
  radiationSources,
  laserDevices,
  permits,
  wasteRequests,
  waterLogs,
  ieqLogs,
  ieqComplaints,
  onAddLocation,
  onAddPerson,
  onUpdateLocation,
  onNavigateToPerson
}: LocationTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection details panel states
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // Filtering and sorting state
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterBuilding, setFilterBuilding] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('spaceID');

  // Creation form toggle states
  const [showAddLoc, setShowAddLoc] = useState(false);

  // New location form state
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocRoom, setNewLocRoom] = useState('');
  const [newLocSpaceID, setNewLocSpaceID] = useState('');
  const [newLocNature, setNewLocNature] = useState('');
  const [newLocPI, setNewLocPI] = useState('');
  const [newLocDept, setNewLocDept] = useState('');
  const [newLocContacts, setNewLocContacts] = useState<string[]>([]);
  const [newLocStatus, setNewLocStatus] = useState<'Active' | 'Inactive/Renovation' | 'Decommissioned'>('Active');

  // Editing location states
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editLocBuilding, setEditLocBuilding] = useState('');
  const [editLocRoom, setEditLocRoom] = useState('');
  const [editLocSpaceID, setEditLocSpaceID] = useState('');
  const [editLocNature, setEditLocNature] = useState('');
  const [editLocDept, setEditLocDept] = useState('');
  const [editLocPI, setEditLocPI] = useState('');
  const [editLocContacts, setEditLocContacts] = useState<string[]>([]);
  const [editLocStatus, setEditLocStatus] = useState<'Active' | 'Inactive/Renovation' | 'Decommissioned'>('Active');

  // Auto-generate SpaceID for creation form when Building or Room changes
  useEffect(() => {
    if (!newLocSpaceID || newLocSpaceID === `${newLocBuilding}${newLocRoom}`.replace(/\s+/g, '')) {
      setNewLocSpaceID(`${newLocBuilding}${newLocRoom}`.replace(/\s+/g, ''));
    }
  }, [newLocBuilding, newLocRoom]);

  // Handle Location submit
  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocBuilding || !newLocRoom || !newLocNature || !newLocPI || !newLocDept || !newLocSpaceID) {
      alert("Please fill in all required fields.");
      return;
    }
    const newLoc: Location = {
      id: `loc_${Date.now()}`,
      building: newLocBuilding,
      roomNumber: newLocRoom,
      spaceID: newLocSpaceID,
      roomNature: newLocNature,
      piIds: newLocPI ? [newLocPI] : [],
      department: newLocDept,
      contactPersonIds: newLocContacts,
      status: newLocStatus
    };
    onAddLocation(newLoc);
    
    // Reset Form
    setNewLocBuilding('');
    setNewLocRoom('');
    setNewLocSpaceID('');
    setNewLocNature('');
    setNewLocPI('');
    setNewLocDept('');
    setNewLocContacts([]);
    setNewLocStatus('Active');
    setShowAddLoc(false);
  };

  // Handle Edit Submit
  const handleUpdateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;
    if (!editLocBuilding || !editLocRoom || !editLocNature || !editLocPI || !editLocDept || !editLocSpaceID) {
      alert("Please fill in all required fields.");
      return;
    }
    const updated: Location = {
      ...selectedLoc,
      building: editLocBuilding,
      roomNumber: editLocRoom,
      spaceID: editLocSpaceID,
      roomNature: editLocNature,
      department: editLocDept,
      piIds: [editLocPI],
      contactPersonIds: editLocContacts,
      status: editLocStatus
    };
    onUpdateLocation(updated);
    setIsEditingRoom(false);
  };

  // Populate edit fields
  const startEditingRoom = (loc: Location) => {
    setEditLocBuilding(loc.building);
    setEditLocRoom(loc.roomNumber);
    setEditLocSpaceID(loc.spaceID || '');
    setEditLocNature(loc.roomNature);
    setEditLocDept(loc.department);
    setEditLocPI(loc.piIds[0] || '');
    setEditLocContacts(loc.contactPersonIds || []);
    setEditLocStatus(loc.status || 'Active');
    setIsEditingRoom(true);
  };

  // Resolve Person Name helper
  const getPersonName = (id: string) => {
    const p = persons.find(item => item.id === id);
    return p ? p.name : 'Unknown';
  };

  // Counting linked assets for specific locations
  const getLinkedStats = (locId: string) => {
    return {
      inspections: inspections.filter(i => i.locationId === locId).length,
      radiation: radiationSources.filter(r => r.locationId === locId).length,
      lasers: laserDevices.filter(l => l.locationId === locId).length,
      permits: permits.filter(p => p.locationId === locId).length,
      waste: wasteRequests.filter(w => w.locationId === locId).length,
      water: waterLogs.filter(w => w.locationId === locId).length,
      ieq: ieqLogs.filter(i => i.locationId === locId).length + ieqComplaints.filter(c => c.locationId === locId).length
    };
  };

  // Fetch unique filter choices from current locations list
  const uniqueDepartments = Array.from(new Set(locations.map(l => l.department))).sort();
  const uniqueBuildings = Array.from(new Set(locations.map(l => l.building))).sort();

  // Filter Locations
  const filteredLocations = locations
    .filter(loc => {
      const query = searchQuery.toLowerCase();
      const piName = loc.piIds.map(getPersonName).join(', ').toLowerCase();
      const contactNames = loc.contactPersonIds.map(getPersonName).join(' ').toLowerCase();
      
      const matchesSearch = (
        loc.building.toLowerCase().includes(query) ||
        loc.roomNumber.toLowerCase().includes(query) ||
        (loc.spaceID && loc.spaceID.toLowerCase().includes(query)) ||
        loc.roomNature.toLowerCase().includes(query) ||
        loc.department.toLowerCase().includes(query) ||
        piName.includes(query) ||
        contactNames.includes(query)
      );

      const matchesStatus = filterStatus === 'All' || loc.status === filterStatus;
      const matchesDept = filterDept === 'All' || loc.department === filterDept;
      const matchesBuilding = filterBuilding === 'All' || loc.building === filterBuilding;

      return matchesSearch && matchesStatus && matchesDept && matchesBuilding;
    })
    .sort((a, b) => {
      if (sortBy === 'spaceID') {
        return (a.spaceID || '').localeCompare(b.spaceID || '');
      } else if (sortBy === 'building') {
        return a.building.localeCompare(b.building);
      } else if (sortBy === 'roomNumber') {
        return a.roomNumber.localeCompare(b.roomNumber);
      } else if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      } else if (sortBy === 'department') {
        return a.department.localeCompare(b.department);
      }
      return 0;
    });

  const selectedLoc = locations.find(l => l.id === selectedLocationId);
  const locStats = selectedLoc ? getLinkedStats(selectedLoc.id) : null;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="h-5.5 w-5.5 text-indigo-500" />
              Locations Registry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage facility locations, rooms, status, and linked compliance programs.
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR (Compact Size) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input (Smaller) */}
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spaces..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive/Renovation">Inactive/Renovation</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Dept:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[130px]"
              >
                <option value="All">All Depts</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Building Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Building:</span>
              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[140px]"
              >
                <option value="All">All Buildings</option>
                {uniqueBuildings.map(bld => (
                  <option key={bld} value={bld}>{bld}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="spaceID">SpaceID (UID)</option>
                <option value="building">Building</option>
                <option value="roomNumber">Room Number</option>
                <option value="status">Status</option>
                <option value="department">Department</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setShowAddLoc(true);
              setIsEditingRoom(false);
            }}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            Register Space
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: TABLE FORMAT LISTING */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* LOCATION CREATION DIALOG */}
          {showAddLoc && (
            <form onSubmit={handleCreateLocation} className="bg-slate-900 border-2 border-indigo-500/30 rounded-xl p-5 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Add New Registered Room Configuration</span>
                <button type="button" onClick={() => setShowAddLoc(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Building *</label>
                  <input
                    type="text"
                    required
                    value={newLocBuilding}
                    onChange={(e) => setNewLocBuilding(e.target.value)}
                    placeholder="e.g. Science Block A"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={newLocRoom}
                    onChange={(e) => setNewLocRoom(e.target.value)}
                    placeholder="e.g. Rm 302B"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Space ID (Unique UID) *</label>
                  <input
                    type="text"
                    required
                    value={newLocSpaceID}
                    onChange={(e) => setNewLocSpaceID(e.target.value)}
                    placeholder="e.g. SciBlockA302B"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Room Nature/Usage *</label>
                  <input
                    type="text"
                    required
                    value={newLocNature}
                    onChange={(e) => setNewLocNature(e.target.value)}
                    placeholder="e.g. Radioactive Source Vault"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={newLocDept}
                    onChange={(e) => setNewLocDept(e.target.value)}
                    placeholder="e.g. Chemistry"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status *</label>
                  <select
                    value={newLocStatus}
                    onChange={(e) => setNewLocStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive/Renovation">Inactive/Renovation</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Principal Investigator (PI) *</label>
                  <select
                    required
                    value={newLocPI}
                    onChange={(e) => setNewLocPI(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Person In Charge --</option>
                    {persons.filter(p => (p.role === 'Principal Investigator (PI)' || p.role === 'PI') && (!newLocDept || p.department.toLowerCase().trim() === newLocDept.toLowerCase().trim())).map(pi => (
                      <option key={pi.id} value={pi.id}>{pi.name} ({pi.department})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">HSEO Contacts (Delegates/Contact Persons)</label>
                  <div className="max-h-24 overflow-y-auto border border-slate-800 rounded p-2 space-y-1.5 bg-slate-950 custom-scrollbar">
                    {persons.filter(p => !newLocDept || p.department.toLowerCase().trim() === newLocDept.toLowerCase().trim()).map(pers => (
                      <label key={pers.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newLocContacts.includes(pers.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewLocContacts([...newLocContacts, pers.id]);
                            } else {
                              setNewLocContacts(newLocContacts.filter(id => id !== pers.id));
                            }
                          }}
                          className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0"
                        />
                        <span>{pers.name} <span className="text-[9px] text-slate-500">({pers.role})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLoc(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition"
                >
                  Register Space
                </button>
              </div>
            </form>
          )}

          {/* TABLE VIEW OF ROOM REGISTRY */}
          <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-4 py-3.5">SpaceID (UID)</th>
                  <th className="px-4 py-3.5">Building</th>
                  <th className="px-4 py-3.5">Room</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Room Nature / Use</th>
                  <th className="px-4 py-3.5">PI</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Programs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => {
                    const stats = getLinkedStats(loc.id);
                    const totalLinked = Object.values(stats).reduce((a, b) => a + b, 0);
                    const isSelected = selectedLocationId === loc.id;
                    
                    return (
                      <tr
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocationId(loc.id);
                          setIsEditingRoom(false);
                        }}
                        className={`cursor-pointer transition hover:bg-slate-800/40 ${
                          isSelected 
                            ? 'bg-indigo-950/40 text-indigo-100 font-semibold border-l-2 border-l-indigo-500' 
                            : 'text-slate-300'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-indigo-400 font-bold truncate max-w-[140px]" title={loc.spaceID}>
                          {loc.spaceID || `${loc.building}${loc.roomNumber}`.replace(/\s+/g, '')}
                        </td>
                        <td className="px-4 py-3 truncate max-w-[130px] font-medium">{loc.building}</td>
                        <td className="px-4 py-3 font-semibold text-slate-100">{loc.roomNumber}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                            {loc.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 truncate max-w-[160px] text-slate-400" title={loc.roomNature}>{loc.roomNature}</td>
                        <td className="px-4 py-3">
                          <span 
                            className="text-indigo-400 hover:underline hover:text-indigo-300 font-semibold cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Stop row click
                              if (loc.piIds[0]) onNavigateToPerson(loc.piIds[0]);
                            }}
                          >
                            {loc.piIds.map(getPersonName).join(', ') || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            loc.status === 'Active' 
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/30'
                              : loc.status === 'Inactive/Renovation'
                              ? 'bg-amber-950/50 text-amber-500 border-amber-900/30'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}>
                            {loc.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            {stats.inspections > 0 && (
                              <span title={`${stats.inspections} Audits`} className="bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                A
                              </span>
                            )}
                            {stats.radiation > 0 && (
                              <span title={`${stats.radiation} Rad Sources`} className="bg-amber-950/50 text-amber-500 border border-amber-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                R
                              </span>
                            )}
                            {stats.lasers > 0 && (
                              <span title={`${stats.lasers} Lasers`} className="bg-purple-950/50 text-purple-400 border border-purple-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                L
                              </span>
                            )}
                            {stats.permits > 0 && (
                              <span title={`${stats.permits} Permits`} className="bg-rose-950/50 text-rose-400 border border-rose-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                P
                              </span>
                            )}
                            {stats.waste > 0 && (
                              <span title={`${stats.waste} Waste requests`} className="bg-yellow-950/50 text-yellow-500 border border-yellow-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                W
                              </span>
                            )}
                            {stats.water > 0 && (
                              <span title={`${stats.water} Water logs`} className="bg-cyan-950/50 text-cyan-400 border border-cyan-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                H2O
                              </span>
                            )}
                            {stats.ieq > 0 && (
                              <span title={`${stats.ieq} Air Logs`} className="bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-bold">
                                I
                              </span>
                            )}
                            {totalLinked === 0 && <span className="text-slate-600 text-[10px] italic">None</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 bg-slate-900/50">
                      <MapPin className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                      <p className="text-xs">No registered room configurations matching your search & filter parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: LINKED ITEMS INSPECTOR DETAILS / INLINE EDIT FORM */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* LOCATION DETAILS PANEL */}
          {selectedLoc ? (
            isEditingRoom ? (
              /* INLINE EDIT ROOM FORM */
              <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-4 text-left sticky top-4">
                <form onSubmit={handleUpdateRoomSubmit} className="space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Edit Room Configuration</span>
                    <button type="button" onClick={() => setIsEditingRoom(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Space ID (Unique UID) *</label>
                      <input
                        type="text"
                        required
                        value={editLocSpaceID}
                        onChange={(e) => setEditLocSpaceID(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Building *</label>
                      <input
                        type="text"
                        required
                        value={editLocBuilding}
                        onChange={(e) => setEditLocBuilding(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Room Number *</label>
                      <input
                        type="text"
                        required
                        value={editLocRoom}
                        onChange={(e) => setEditLocRoom(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Room Nature/Usage *</label>
                      <input
                        type="text"
                        required
                        value={editLocNature}
                        onChange={(e) => setEditLocNature(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                      <input
                        type="text"
                        required
                        value={editLocDept}
                        onChange={(e) => setEditLocDept(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status *</label>
                      <select
                        value={editLocStatus}
                        onChange={(e) => setEditLocStatus(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive/Renovation">Inactive/Renovation</option>
                        <option value="Decommissioned">Decommissioned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Principal Investigator (PI) *</label>
                      <select
                        required
                        value={editLocPI}
                        onChange={(e) => setEditLocPI(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">-- Select PI --</option>
                        {persons.filter(p => (p.role === 'Principal Investigator (PI)' || p.role === 'PI') && (!editLocDept || p.department.toLowerCase().trim() === editLocDept.toLowerCase().trim())).map(pi => (
                          <option key={pi.id} value={pi.id}>{pi.name} ({pi.department})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">HSEO Contacts (Delegates / Emergency)</label>
                      <div className="max-h-24 overflow-y-auto border border-slate-800 rounded p-2 space-y-1.5 bg-slate-950 custom-scrollbar">
                        {persons.filter(p => !editLocDept || p.department.toLowerCase().trim() === editLocDept.toLowerCase().trim()).map(pers => (
                          <label key={pers.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editLocContacts.includes(pers.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditLocContacts([...editLocContacts, pers.id]);
                                } else {
                                  setEditLocContacts(editLocContacts.filter(id => id !== pers.id));
                                }
                              }}
                              className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0"
                            />
                            <span>{pers.name} <span className="text-[9px] text-slate-500">({pers.role})</span></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingRoom(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* VIEW DETAILS PANEL (ACTIVE) */
              <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-5 text-left sticky top-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded uppercase">
                        Space Inspector
                      </span>
                      <button
                        onClick={() => startEditingRoom(selectedLoc)}
                        className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded flex items-center gap-1 transition"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                        Edit Room
                      </button>
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-100 mt-1.5 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-indigo-500" />
                      Rm {selectedLoc.roomNumber}, {selectedLoc.building}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{selectedLoc.roomNature}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedLocationId(null)} 
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Spatial Meta details */}
                <div className="space-y-3 bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 text-xs leading-normal">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SpaceID (UID):</span>
                    <span className="font-mono font-bold text-indigo-400">{selectedLoc.spaceID || `${selectedLoc.building}${selectedLoc.roomNumber}`.replace(/\s+/g, '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                      selectedLoc.status === 'Active' 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                        : selectedLoc.status === 'Inactive/Renovation'
                        ? 'bg-amber-950/40 text-amber-500 border-amber-900/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {selectedLoc.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-bold text-slate-300">{selectedLoc.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Person in Charge (PI):</span>
                    <span className="font-bold text-indigo-400 hover:underline cursor-pointer" onClick={() => {
                      if (selectedLoc.piIds[0]) onNavigateToPerson(selectedLoc.piIds[0]);
                    }}>
                      {selectedLoc.piIds.map(getPersonName).join(', ')}
                    </span>
                  </div>

                  {/* Contact Person(s) / Delegate(s) underneath PI */}
                  <div className="space-y-1.5 mt-2 border-t border-slate-800/50 pt-2.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Contact Person(s) / Delegate(s):</span>
                    {selectedLoc.contactPersonIds.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1 pl-1">
                        {selectedLoc.contactPersonIds.map(id => {
                          const person = persons.find(p => p.id === id);
                          if (!person) return null;
                          return (
                            <div 
                              key={id} 
                              onClick={() => onNavigateToPerson(id)}
                              className="text-[10px] hover:border-indigo-500/50 hover:bg-slate-900/80 cursor-pointer transition bg-slate-900 border border-slate-800/60 rounded p-1.5 flex justify-between items-center"
                            >
                              <div>
                                <span className="font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                                  <User className="h-2.5 w-2.5 text-indigo-400" /> {person.name}
                                </span>
                                <span className="text-[8px] text-slate-500">({person.role})</span>
                              </div>
                              <span className="text-[9px] text-slate-400">{person.phone}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic block text-[10px] pl-1">No contact persons or delegates assigned</span>
                    )}
                  </div>

                  {/* HSEO contacts */}
                  <div className="space-y-1.5 mt-2 border-t border-slate-800/50 pt-2.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">HSEO Contacts:</span>
                    <div className="grid grid-cols-1 gap-1 pl-1">
                      {persons.filter(p => 
                        (p.role === 'HSEO Management' || p.role === 'HSEO management' || p.role === 'Officer') && 
                        p.department.toLowerCase().trim() === selectedLoc.department.toLowerCase().trim()
                      ).map(officer => (
                        <div 
                          key={officer.id} 
                          onClick={() => onNavigateToPerson(officer.id)}
                          className="text-[10px] hover:border-indigo-500/50 hover:bg-slate-900/80 cursor-pointer transition bg-slate-900 border border-slate-800/60 rounded p-1.5 flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-indigo-400 hover:underline flex items-center gap-1">
                              <Shield className="h-2.5 w-2.5 text-indigo-400" /> {officer.name}
                            </span>
                            <span className="text-[8px] text-slate-500">{officer.department}</span>
                          </div>
                          <span className="text-[9px] text-slate-400">{officer.phone}</span>
                        </div>
                      ))}
                      {persons.filter(p => 
                        (p.role === 'HSEO Management' || p.role === 'HSEO management' || p.role === 'Officer') && 
                        p.department.toLowerCase().trim() === selectedLoc.department.toLowerCase().trim()
                      ).length === 0 && (
                        <span className="text-slate-500 italic block text-[10px] pl-1">No HSEO department contacts listed for this specific department</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Programs and Linked Database Tables */}
                <div className="space-y-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Linked Program Assets</span>
                  
                  {/* Inspections Table */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                      <ClipboardCheck className="h-4 w-4 text-indigo-400" />
                      <span>Inspection Audits ({inspections.filter(i => i.locationId === selectedLoc.id).length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {inspections.filter(i => i.locationId === selectedLoc.id).map(i => (
                        <div key={i.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 flex justify-between items-center">
                          <span className="truncate text-slate-300 font-medium">{i.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            i.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-amber-950/40 text-amber-500'
                          }`}>{i.status.toUpperCase()}</span>
                        </div>
                      ))}
                      {inspections.filter(i => i.locationId === selectedLoc.id).length === 0 && (
                        <span className="text-slate-600 italic text-[10px] block pl-1">No inspections logged for this space</span>
                      )}
                    </div>
                  </div>

                  {/* Radiation Sources */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                      <Radio className="h-4 w-4 text-amber-500" />
                      <span>Sealed Radiation Sources ({radiationSources.filter(r => r.locationId === selectedLoc.id).length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {radiationSources.filter(r => r.locationId === selectedLoc.id).map(r => (
                        <div key={r.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 flex flex-col gap-0.5">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-300">{r.sourceName}</span>
                            <span className="text-amber-500 text-[9px] font-semibold">{r.isotope}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span>Activity: {r.activity}</span>
                            <span>Leak Test: {r.nextLeakTest}</span>
                          </div>
                        </div>
                      ))}
                      {radiationSources.filter(r => r.locationId === selectedLoc.id).length === 0 && (
                        <span className="text-slate-600 italic text-[10px] block pl-1">No radiation sources registered here</span>
                      )}
                    </div>
                  </div>

                  {/* Laser Devices */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span>Laser Devices Class 3B/4 ({laserDevices.filter(l => l.locationId === selectedLoc.id).length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {laserDevices.filter(l => l.locationId === selectedLoc.id).map(l => (
                        <div key={l.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 flex justify-between items-center">
                          <div>
                            <span className="text-slate-300 font-bold block">{l.identifier}</span>
                            <span className="text-[9px] text-slate-500">{l.model} ({l.laserClass})</span>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            l.interlockStatus === 'passed' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-rose-400'
                          }`}>Intlk: {l.interlockStatus.toUpperCase()}</span>
                        </div>
                      ))}
                      {laserDevices.filter(l => l.locationId === selectedLoc.id).length === 0 && (
                        <span className="text-slate-600 italic text-[10px] block pl-1">No lasers registered for this space</span>
                      )}
                    </div>
                  </div>

                  {/* Permits & Environmental Telemetry */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                      <Flame className="h-4 w-4 text-rose-400" />
                      <span>Hot Work Permits & IEQ Telemetry</span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-400 space-y-1.5">
                      <div className="flex justify-between pl-1">
                        <span>Active Hot Work Permits:</span>
                        <span className="font-semibold text-slate-300">{permits.filter(p => p.locationId === selectedLoc.id && p.status === 'active').length} active</span>
                      </div>
                      {ieqLogs.filter(i => i.locationId === selectedLoc.id).map(log => (
                        <div key={log.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>AIR TELEMETRY LOG</span>
                            <span className={`text-[9px] ${log.ventilationStatus === 'optimal' ? 'text-emerald-400' : log.ventilationStatus === 'adequate' ? 'text-amber-500' : 'text-rose-400'}`}>{log.ventilationStatus.toUpperCase()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-400">
                            <span>CO2: <strong>{log.co2} ppm</strong></span>
                            <span>VOC: <strong>{log.voc} ppb</strong></span>
                            <span>Temp: <strong>{log.temperature}°C</strong></span>
                            <span>Humidity: <strong>{log.humidity}%</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )
          ) : (
            /* DEFAULT EMPTY PANEL STATE */
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500 sticky top-4">
              <Building className="h-10 w-10 mx-auto text-slate-700 mb-3" />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Spatial Association Panel</h3>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Click on any Room in the Registry table to inspect spatial specifications, emergency HSEO contact lists, delegate rosters, and dynamic links to safety program telemetry.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
