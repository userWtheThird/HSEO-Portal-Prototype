import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  User, 
  Users, 
  Phone, 
  Mail, 
  Building as BuildingIcon, 
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
  Edit2,
  Download,
  Upload
} from 'lucide-react';
import { 
  Person, 
  Location, 
  Building,
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
  buildings: Building[];
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
  onAddBuilding: (building: Building, logDetails: string) => void;
  onUpdateBuilding: (building: Building, logDetails: string) => void;
  onDeleteBuilding: (buildingId: string, logDetails: string) => void;
  onNavigateToPerson: (personId: string) => void;
}

export default function LocationTab({
  currentUser,
  locations,
  persons,
  buildings,
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
  onAddBuilding,
  onUpdateBuilding,
  onDeleteBuilding,
  onNavigateToPerson
}: LocationTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bldFileInputRef = useRef<HTMLInputElement>(null);
  
  // Sub-tab toggle: locations or buildings
  const [locSubTab, setLocSubTab] = useState<'locations' | 'buildings'>('locations');
  
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
  const [newLocContacts, setNewLocContacts] = useState<string>('');
  const [newLocStatus, setNewLocStatus] = useState<'Active' | 'Inactive/Renovation' | 'Decommissioned'>('Active');

  // Editing location states
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editLocBuilding, setEditLocBuilding] = useState('');
  const [editLocRoom, setEditLocRoom] = useState('');
  const [editLocSpaceID, setEditLocSpaceID] = useState('');
  const [editLocNature, setEditLocNature] = useState('');
  const [editLocDept, setEditLocDept] = useState('');
  const [editLocPI, setEditLocPI] = useState('');
  const [editLocContacts, setEditLocContacts] = useState<string>('');
  const [editLocStatus, setEditLocStatus] = useState<'Active' | 'Inactive/Renovation' | 'Decommissioned'>('Active');

  // Buildings sub-tab states
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [newBldCode, setNewBldCode] = useState('');
  const [newBldName, setNewBldName] = useState('');
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editBldCode, setEditBldCode] = useState('');
  const [editBldName, setEditBldName] = useState('');
  const [bldSearchQuery, setBldSearchQuery] = useState('');

  // Auto-generate SpaceID for creation form when Building or Room changes
  useEffect(() => {
    if (!newLocSpaceID || newLocSpaceID === `${newLocBuilding}${newLocRoom}`.replace(/\s+/g, '')) {
      setNewLocSpaceID(`${newLocBuilding}${newLocRoom}`.replace(/\s+/g, ''));
    }
  }, [newLocBuilding, newLocRoom]);

  // Download locations as CSV
  const handleDownloadCSV = () => {
    const headers = ['id', 'building', 'roomNumber', 'spaceID', 'roomNature', 'department', 'piIds', 'piDelegateIds', 'status'];
    const rows = locations.map(loc => [
      loc.id,
      loc.building,
      loc.roomNumber,
      loc.spaceID,
      loc.roomNature,
      loc.department,
      loc.piIds.join(';'),
      (loc.piDelegateIds || []).join(';'),
      loc.status
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `locations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Upload CSV to replace locations
  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { alert('CSV file is empty or invalid.'); return; }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      let added = 0, updated = 0, errors = 0;
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
          
          const loc: Location = {
            id: row.id || `loc_${Date.now()}_${i}`,
            building: row.building || '',
            roomNumber: row.roomNumber || '',
            spaceID: row.spaceID || '',
            roomNature: row.roomNature || '',
            department: row.department || '',
            piIds: row.piIds ? row.piIds.split(';').filter(Boolean) : [],
            piDelegateIds: row.piDelegateIds ? row.piDelegateIds.split(';').filter(Boolean) : [],
            status: (row.status as Location['status']) || 'Active'
          };
          
          const existing = locations.find(l => l.id === loc.id);
          if (existing) {
            onUpdateLocation(loc);
            updated++;
          } else {
            onAddLocation(loc);
            added++;
          }
        } catch (err) {
          errors++;
        }
      }
      
      alert(`CSV Import Complete\n\nAdded: ${added}\nUpdated: ${updated}\nErrors: ${errors}`);
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Building CSV download
  const handleDownloadBuildingCSV = () => {
    const headers = ['id', 'code', 'name'];
    const rows = buildings.map(b => [b.id, b.code, b.name]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buildings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Building CSV upload
  const handleUploadBuildingCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { alert('CSV file is empty or invalid.'); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      let added = 0, updated = 0, errors = 0;
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
          const bld: Building = { id: row.id || `bld_${Date.now()}_${i}`, code: row.code || '', name: row.name || '' };
          const existing = buildings.find(b => b.id === bld.id);
          if (existing) { onUpdateBuilding(bld, `Updated building ${bld.code} via CSV`); updated++; }
          else { onAddBuilding(bld, `Added building ${bld.code} via CSV`); added++; }
        } catch { errors++; }
      }
      alert(`Building CSV Import\n\nAdded: ${added}\nUpdated: ${updated}\nErrors: ${errors}`);
    };
    reader.readAsText(file);
    if (bldFileInputRef.current) bldFileInputRef.current.value = '';
  };

  // Add building submit
  const handleAddBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBldCode.trim() || !newBldName.trim()) { alert('Code and Name are required.'); return; }
    if (buildings.some(b => b.code === newBldCode.trim())) { alert('A building with this code already exists.'); return; }
    const newBld: Building = { id: `bld_${Date.now()}`, code: newBldCode.trim(), name: newBldName.trim() };
    onAddBuilding(newBld, `Added building "${newBld.code}" - ${newBld.name}`);
    setNewBldCode(''); setNewBldName(''); setShowAddBuilding(false);
  };

  // Update building submit
  const handleUpdateBuildingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuilding) return;
    if (!editBldCode.trim() || !editBldName.trim()) { alert('Code and Name are required.'); return; }
    const updated: Building = { ...editingBuilding, code: editBldCode.trim(), name: editBldName.trim() };
    onUpdateBuilding(updated, `Updated building "${updated.code}" - ${updated.name}`);
    setEditingBuilding(null);
  };

  // Delete building
  const handleDeleteBuildingClick = (bld: Building) => {
    const linkedCount = locations.filter(l => l.building === bld.code).length;
    if (linkedCount > 0) {
      alert(`Cannot delete "${bld.code}": ${linkedCount} location(s) still reference this building. Update or remove those locations first.`);
      return;
    }
    if (confirm(`Delete building "${bld.code} - ${bld.name}"?`)) {
      onDeleteBuilding(bld.id, `Deleted building "${bld.code}" - ${bld.name}`);
    }
  };

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
      piDelegateIds: newLocContacts ? [newLocContacts] : [],
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
    setNewLocContacts('');
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
      piDelegateIds: editLocContacts ? [editLocContacts] : [],
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
    setEditLocContacts(loc.piDelegateIds?.[0] || '');
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
      const contactNames = (loc.piDelegateIds || []).map(getPersonName).join(' ').toLowerCase();
      
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

        {/* Sub-tab Toggle */}
        <div className="mt-4 flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit">
          <button
            onClick={() => setLocSubTab('locations')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              locSubTab === 'locations' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setLocSubTab('buildings')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              locSubTab === 'buildings' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Buildings
          </button>
        </div>
      </div>

      {/* LOCATIONS SUB-TAB CONTENT */}
      {locSubTab === 'locations' && (<>
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              Download CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-semibold transition shrink-0"
            >
              <Upload className="h-3.5 w-3.5 text-amber-400" />
              Upload CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadCSV}
              className="hidden"
            />
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
                  <select
                    required
                    value={newLocBuilding}
                    onChange={(e) => setNewLocBuilding(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select building...</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.code}>{b.code} - {b.name}</option>
                    ))}
                  </select>
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
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Contact Person (PI's Delegate)</label>
                  <select
                    value={newLocContacts}
                    onChange={(e) => setNewLocContacts(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Select Delegate --</option>
                    {persons.filter(p => !newLocDept || p.department.toLowerCase().trim() === newLocDept.toLowerCase().trim()).map(pers => (
                      <option key={pers.id} value={pers.id}>{pers.name} ({pers.role})</option>
                    ))}
                  </select>
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
                      <select
                        required
                        value={editLocBuilding}
                        onChange={(e) => setEditLocBuilding(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">Select building...</option>
                        {buildings.map(b => (
                          <option key={b.id} value={b.code}>{b.code} - {b.name}</option>
                        ))}
                      </select>
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
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Contact Person (PI's Delegate)</label>
                      <select
                        value={editLocContacts}
                        onChange={(e) => setEditLocContacts(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Select Delegate --</option>
                        {persons.filter(p => !editLocDept || p.department.toLowerCase().trim() === editLocDept.toLowerCase().trim()).map(pers => (
                          <option key={pers.id} value={pers.id}>{pers.name} ({pers.role})</option>
                        ))}
                      </select>
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

                  {/* Contact Person (PI's Delegate) */}
                  <div className="space-y-1.5 mt-2 border-t border-slate-800/50 pt-2.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">Contact Person (PI's Delegate):</span>
                    {(selectedLoc.piDelegateIds || []).length > 0 ? (
                      <div className="grid grid-cols-1 gap-1 pl-1">
                        {(selectedLoc.piDelegateIds || []).map(id => {
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
                      <span className="text-slate-500 italic block text-[10px] pl-1">No contact person assigned</span>
                    )}
                  </div>

                  {/* HSEO Contact - derived from Field Team Assignment */}
                  <div className="space-y-1.5 mt-2 border-t border-slate-800/50 pt-2.5">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider">HSEO Contact (Field Team):</span>
                    <div className="grid grid-cols-1 gap-1 pl-1">
                      {persons.filter(p => 
                        (p.role === 'Field Team Member' || p.role === 'FTM') && 
                        p.assignedDepartments?.includes(selectedLoc.department)
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
                        (p.role === 'Field Team Member' || p.role === 'FTM') && 
                        p.assignedDepartments?.includes(selectedLoc.department)
                      ).length === 0 && (
                        <span className="text-slate-500 italic block text-[10px] pl-1">No FTM assigned to this department</span>
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
              <BuildingIcon className="h-10 w-10 mx-auto text-slate-700 mb-3" />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Spatial Association Panel</h3>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Click on any Room in the Registry table to inspect spatial specifications, emergency HSEO contact lists, delegate rosters, and dynamic links to safety program telemetry.
              </p>
            </div>
          )}

        </div>

      </div>
      </>)}

      {/* BUILDINGS SUB-TAB CONTENT */}
      {locSubTab === 'buildings' && (
        <div className="space-y-4">
          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
            <div className="relative w-48">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={bldSearchQuery}
                onChange={(e) => setBldSearchQuery(e.target.value)}
                placeholder="Search buildings..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadBuildingCSV} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-semibold transition">
                <Download className="h-3.5 w-3.5 text-emerald-400" /> CSV
              </button>
              <button onClick={() => bldFileInputRef.current?.click()} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-semibold transition">
                <Upload className="h-3.5 w-3.5 text-amber-400" /> CSV
              </button>
              <input ref={bldFileInputRef} type="file" accept=".csv" onChange={handleUploadBuildingCSV} className="hidden" />
            </div>
            <button onClick={() => setShowAddBuilding(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition">
              <Plus className="h-4 w-4" /> Add Building
            </button>
          </div>

          {/* Add Building Form */}
          {showAddBuilding && (
            <form onSubmit={handleAddBuildingSubmit} className="bg-slate-900 border-2 border-indigo-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Add New Building</span>
                <button type="button" onClick={() => setShowAddBuilding(false)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Code *</label>
                  <input type="text" value={newBldCode} onChange={(e) => setNewBldCode(e.target.value)} placeholder="e.g. UST, PWB" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Full Name *</label>
                  <input type="text" value={newBldName} onChange={(e) => setNewBldName(e.target.value)} placeholder="e.g. University Science Tower" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">Save Building</button>
            </form>
          )}

          {/* Edit Building Modal */}
          {editingBuilding && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditingBuilding(null)}>
              <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-100">Edit Building</h3>
                  <button onClick={() => setEditingBuilding(null)} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleUpdateBuildingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Code *</label>
                    <input type="text" value={editBldCode} onChange={(e) => setEditBldCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Full Name *</label>
                    <input type="text" value={editBldName} onChange={(e) => setEditBldName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
                  </div>
                  <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">Update Building</button>
                </form>
              </div>
            </div>
          )}

          {/* Buildings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-center">Linked Locations</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {buildings.filter(b => !bldSearchQuery || b.code.toLowerCase().includes(bldSearchQuery.toLowerCase()) || b.name.toLowerCase().includes(bldSearchQuery.toLowerCase())).map(bld => {
                  const linkedCount = locations.filter(l => l.building === bld.code).length;
                  return (
                    <tr key={bld.id} className="hover:bg-slate-800/20 transition">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">{bld.code}</td>
                      <td className="px-4 py-3 text-slate-200">{bld.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${linkedCount > 0 ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                          {linkedCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setEditingBuilding(bld); setEditBldCode(bld.code); setEditBldName(bld.name); }}
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-amber-600/20 hover:text-amber-400 text-slate-500 transition border border-slate-700/50 hover:border-amber-600/40"
                            title="Edit building"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteBuildingClick(bld)}
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-600/20 hover:text-rose-400 text-slate-500 transition border border-slate-700/50 hover:border-rose-600/40"
                            title="Delete building"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {buildings.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                    <BuildingIcon className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                    <p className="text-xs">No buildings registered yet.</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
