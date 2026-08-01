import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  User, 
  Users, 
  Phone, 
  Mail, 
  Building as BuildingIcon, 
  Plus, 
  Search, 
  Zap,
  Radio,
  Flame,
  ClipboardCheck,
  X,
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

interface DirectoryTabProps {
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
  onUpdatePerson: (person: Person) => void;
  externalSelectedPersonId?: string | null;
  onClearExternalSelectedPerson?: () => void;
}

export default function DirectoryTab({
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
  onUpdatePerson,
  externalSelectedPersonId,
  onClearExternalSelectedPerson
}: DirectoryTabProps) {
  const subTab = 'persons';
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Selection details panel states
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  React.useEffect(() => {
    if (externalSelectedPersonId) {
      setSelectedPersonId(externalSelectedPersonId);
      setSelectedLocationId(null);
      if (onClearExternalSelectedPerson) {
        onClearExternalSelectedPerson();
      }
    }
  }, [externalSelectedPersonId, onClearExternalSelectedPerson]);

  // Download persons as CSV
  const handleDownloadCSV = () => {
    const headers = ['id', 'name', 'role', 'department', 'email', 'phone', 'title', 'status', 'dso', 'dwa', 'assignedDepartments'];
    const rows = persons.map(p => [
      p.id,
      p.name,
      p.role,
      p.department,
      p.email,
      p.phone,
      p.title || '',
      p.status || 'Active',
      p.dso || '',
      p.dwa || '',
      (p.assignedDepartments || []).join(';')
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personnel_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Upload CSV to import/update persons
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
          
          const person: Person = {
            id: row.id || `pers_${Date.now()}_${i}`,
            name: row.name || '',
            role: (row.role as Person['role']) || 'Staff',
            department: row.department || '',
            email: row.email || '',
            phone: row.phone || '',
            title: row.title || undefined,
            status: (row.status as Person['status']) || 'Active',
            dso: (row.dso as Person['dso']) || undefined,
            dwa: (row.dwa as Person['dwa']) || undefined,
            assignedDepartments: row.assignedDepartments ? row.assignedDepartments.split(';').filter(Boolean) : undefined
          };
          
          const existing = persons.find(p => p.id === person.id);
          if (existing) {
            onUpdatePerson(person);
            updated++;
          } else {
            onAddPerson(person);
            added++;
          }
        } catch (err) {
          errors++;
        }
      }
      
      alert(`CSV Import Complete\n\nAdded: ${added}\nUpdated: ${updated}\nErrors: ${errors}`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  // Creation form toggle states
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  // New location form state
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocRoom, setNewLocRoom] = useState('');
  const [newLocNature, setNewLocNature] = useState('');
  const [newLocPI, setNewLocPI] = useState('');
  const [newLocDept, setNewLocDept] = useState('');
  const [newLocContacts, setNewLocContacts] = useState<string>('');

  // New person form state
  const [newPersName, setNewPersName] = useState('');
  const [newPersRole, setNewPersRole] = useState<'PI' | 'Staff' | 'Contact' | 'Officer' | 'Field Team Member' | 'HSEO management'>('Staff');
  const [newPersDept, setNewPersDept] = useState('');
  const [newPersEmail, setNewPersEmail] = useState('');
  const [newPersPhone, setNewPersPhone] = useState('');
  const [newPersTitle, setNewPersTitle] = useState('');
  const [newPersDso, setNewPersDso] = useState<'Yes' | 'No'>('No');
  const [newPersDwa, setNewPersDwa] = useState<'Yes' | 'No'>('No');

  // Edit person form state
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [editPersName, setEditPersName] = useState('');
  const [editPersRole, setEditPersRole] = useState<'PI' | 'Staff' | 'Contact' | 'Officer' | 'Field Team Member' | 'HSEO management'>('Staff');
  const [editPersDept, setEditPersDept] = useState('');
  const [editPersEmail, setEditPersEmail] = useState('');
  const [editPersPhone, setEditPersPhone] = useState('');
  const [editPersTitle, setEditPersTitle] = useState('');
  const [editPersStatus, setEditPersStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editPersDso, setEditPersDso] = useState<'Yes' | 'No'>('No');
  const [editPersDwa, setEditPersDwa] = useState<'Yes' | 'No'>('No');

  // Directory sorting & filtering state
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'role' | 'department' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: 'name' | 'role' | 'department' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'role' | 'department' | 'status') => {
    if (sortField !== field) return <span className="text-slate-600">↕</span>;
    return sortOrder === 'asc' ? <span className="text-indigo-400">↑</span> : <span className="text-indigo-400">↓</span>;
  };

  // Handle Location submit
  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocBuilding || !newLocRoom || !newLocNature || !newLocPI || !newLocDept) {
      alert("Please fill in all required fields.");
      return;
    }
    const newLoc: Location = {
      id: `loc_${Date.now()}`,
      building: newLocBuilding,
      roomNumber: newLocRoom,
      spaceID: `${newLocBuilding}${newLocRoom}`,
      roomNature: newLocNature,
      piIds: newLocPI ? [newLocPI] : [],
      department: newLocDept,
      piDelegateIds: newLocContacts ? [newLocContacts] : [],
      status: 'Active'
    };
    onAddLocation(newLoc);
    
    // Reset Form
    setNewLocBuilding('');
    setNewLocRoom('');
    setNewLocNature('');
    setNewLocPI('');
    setNewLocDept('');
    setNewLocContacts([]);
    setShowAddLoc(false);
  };

  const handleUpdatePersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) return;
    const selectedPers = persons.find(p => p.id === selectedPersonId);
    if (!selectedPers) return;
    
    if (!editPersName || !editPersDept) {
      alert("Please fill in required fields.");
      return;
    }
    const updated: Person = {
      ...selectedPers,
      name: editPersName,
      role: editPersRole,
      department: editPersDept,
      email: editPersEmail,
      phone: editPersPhone,
      title: editPersTitle,
      status: editPersStatus,
      dso: editPersDso,
      dwa: editPersDwa
    };
    onUpdatePerson(updated);
    setIsEditingPerson(false);
  };

  // Handle Person submit
  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersName || !newPersDept || !newPersEmail) {
      alert("Please fill in Name, Department, and Email.");
      return;
    }
    const newPers: Person = {
      id: `pers_${Date.now()}`,
      name: newPersName,
      role: newPersRole,
      department: newPersDept,
      email: newPersEmail,
      phone: newPersPhone || 'N/A',
      title: newPersTitle || undefined,
      dso: newPersDso,
      dwa: newPersDwa,
      status: 'Active'
    };
    onAddPerson(newPers);

    // Reset Form
    setNewPersName('');
    setNewPersRole('Staff');
    setNewPersDept('');
    setNewPersEmail('');
    setNewPersPhone('');
    setNewPersTitle('');
    setNewPersDso('No');
    setNewPersDwa('No');
    setShowAddPerson(false);
  };

  // Resolve Person Name helper
  const getPersonName = (id: string) => {
    const p = persons.find(item => item.id === id);
    return p ? p.name : 'Unknown';
  };

  // Resolve Location label helper
  const getLocationLabel = (loc: Location) => {
    return `${loc.building}, Rm ${loc.roomNumber} (${loc.roomNature})`;
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

  // Counting linked assets for specific PIs
  const getPiStats = (piId: string) => {
    return {
      managedRooms: locations.filter(l => l.piIds.includes(piId)).length,
      inspections: inspections.filter(i => i.piId === piId).length,
      radiation: radiationSources.filter(r => r.piId === piId).length,
      lasers: laserDevices.filter(l => l.piId === piId).length,
      permits: permits.filter(p => p.piId === piId).length,
      waste: wasteRequests.filter(w => w.piId === piId).length
    };
  };

  // Filter Locations
  const filteredLocations = locations.filter(loc => {
    const query = searchQuery.toLowerCase();
    const piName = loc.piIds.map(getPersonName).join(', ') || 'Unknown'.toLowerCase();
    const contactNames = (loc.piDelegateIds || []).map(getPersonName).join(' ').toLowerCase();
    return (
      loc.building.toLowerCase().includes(query) ||
      loc.roomNumber.toLowerCase().includes(query) ||
      (loc.spaceID && loc.spaceID.toLowerCase().includes(query)) ||
      loc.roomNature.toLowerCase().includes(query) ||
      loc.department.toLowerCase().includes(query) ||
      piName.includes(query) ||
      contactNames.includes(query)
    );
  });

  // Filter and Sort Persons
  const filteredPersons = persons
    .filter(p => {
      // 1. Search Query filter
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        p.name.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        (p.title && p.title.toLowerCase().includes(query))
      );

      // 2. Role filter
      const matchesRole = filterRole === 'All' || 
        p.role === filterRole || 
        (filterRole === 'Principal Investigator (PI)' && p.role === 'PI') ||
        (filterRole === 'Field Team Member' && p.role === 'Field Team Member') ||
        (filterRole === 'HSEO Management' && (p.role === 'Officer' || p.role === 'HSEO management'));

      // 3. Department filter
      const matchesDept = filterDept === 'All' || p.department.toLowerCase() === filterDept.toLowerCase();

      return matchesSearch && matchesRole && matchesDept;
    })
    .sort((a, b) => {
      // Sort Logic
      let valA = (a[sortField] || '').toLowerCase();
      let valB = (b[sortField] || '').toLowerCase();
      
      // Special sorting translations for cleaner alphabetical comparison
      if (sortField === 'role') {
        valA = a.role === 'PI' ? 'principal investigator' : a.role.toLowerCase();
        valB = b.role === 'PI' ? 'principal investigator' : b.role.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const selectedLoc = locations.find(l => l.id === selectedLocationId);
  const locStats = selectedLoc ? getLinkedStats(selectedLoc.id) : null;

  const selectedPers = persons.find(p => p.id === selectedPersonId);
  const persStats = selectedPers ? getPiStats(selectedPers.id) : null;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-indigo-500" />
              Personnel Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage personnel, safety officers, workstation assessors, and department assignments.
            </p>
          </div>
        </div>

        {/* SEARCH AND ACTION BAR */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
            {/* Search Input - Smaller Size */}
            <div className="relative w-full sm:max-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search personnel..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Dept:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Departments</option>
                {Array.from(new Set(persons.map(p => p.department))).filter(Boolean).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Role:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Roles</option>
                <option value="Principal Investigator (PI)">Principal Investigator (PI)</option>
                <option value="Staff">Staff</option>
                <option value="Student">Student</option>
                <option value="Field Team Member">Field Team Member</option>
                <option value="HSEO Management">HSEO Management</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-semibold transition shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              Download CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-semibold transition shrink-0"
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
            onClick={() => setShowAddPerson(true)}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-semibold transition shrink-0 self-start lg:self-auto"
          >
            <Plus className="h-4 w-4" />
            Register Person
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: MAIN LISTING */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* LOCATION CREATION DIALOG / EXPANDABLE */}
          {showAddLoc && (
            <form onSubmit={handleCreateLocation} className="bg-slate-900 border-2 border-indigo-500/30 rounded-xl p-5 space-y-4">
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
                    placeholder="e.g. 1234, 302B"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
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
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Affiliated Department *</label>
                  <input
                    type="text"
                    required
                    value={newLocDept}
                    onChange={(e) => setNewLocDept(e.target.value)}
                    placeholder="e.g. CHEM, ECE"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
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
                    {persons.filter(p => p.role === 'PI').map(pi => (
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
                    {persons.map(pers => (
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

          {/* PERSON CREATION DIALOG / EXPANDABLE */}
          {showAddPerson && (
            <form onSubmit={handleCreatePerson} className="bg-slate-900 border-2 border-indigo-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Register New Staff/PI Personnel</span>
                <button type="button" onClick={() => setShowAddPerson(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPersName}
                    onChange={(e) => setNewPersName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Pendelton"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={newPersTitle}
                    onChange={(e) => setNewPersTitle(e.target.value)}
                    placeholder="e.g. Assistant Professor"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={newPersDept}
                    onChange={(e) => setNewPersDept(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Role *</label>
                  <select
                    value={newPersRole}
                    onChange={(e) => setNewPersRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Principal Investigator (PI)">Principal Investigator (PI)</option>
                    <option value="Staff">Staff</option>
                    <option value="Student">Student</option>
                    <option value="Field Team Member">Field Team Member</option>
                    <option value="HSEO Management">HSEO Management</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={newPersEmail}
                    onChange={(e) => setNewPersEmail(e.target.value)}
                    placeholder="e.g. arthur.p@hseo-portal.net"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Contact number</label>
                  <input
                    type="text"
                    value={newPersPhone}
                    onChange={(e) => setNewPersPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 012-3456"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">DSO (Departmental Safety Officer) *</label>
                  <select
                    value={newPersDso}
                    onChange={(e) => setNewPersDso(e.target.value as 'Yes' | 'No')}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">DWA (Departmental Workstation Assessor) *</label>
                  <select
                    value={newPersDwa}
                    onChange={(e) => setNewPersDwa(e.target.value as 'Yes' | 'No')}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPerson(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition"
                >
                  Register Person
                </button>
              </div>
            </form>
          )}

          {/* TABLE LISTINGS CONTAINER */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-slate-900 transition-colors select-none" 
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        Name {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-slate-900 transition-colors select-none" 
                      onClick={() => toggleSort('role')}
                    >
                      <div className="flex items-center gap-1.5">
                        Role {getSortIcon('role')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-slate-900 transition-colors select-none" 
                      onClick={() => toggleSort('department')}
                    >
                      <div className="flex items-center gap-1.5">
                        Department {getSortIcon('department')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">DSO</th>
                    <th className="px-4 py-3 text-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">DWA</th>
                    <th 
                      className="px-4 py-3 cursor-pointer hover:bg-slate-900 transition-colors select-none text-right" 
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center gap-1.5 justify-end">
                        Status {getSortIcon('status')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredPersons.length > 0 ? (
                    filteredPersons.map((pers) => {
                      const isSelected = selectedPersonId === pers.id;
                      return (
                        <tr
                          key={pers.id}
                          onClick={() => {
                            setSelectedPersonId(pers.id);
                            setSelectedLocationId(null);
                            setIsEditingPerson(false);
                          }}
                          className={`cursor-pointer transition hover:bg-slate-800/30 ${
                            isSelected 
                              ? 'bg-indigo-950/40 text-indigo-100 font-semibold border-l-2 border-l-indigo-500' 
                              : 'text-slate-300'
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-slate-100">
                            <div className="flex items-center gap-2">
                              <User className={`h-4 w-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                              <div>
                                <span className="hover:text-indigo-400 transition">{pers.name}</span>
                                {pers.title && <span className="block text-[10px] text-slate-500 font-normal italic mt-0.5">{pers.title}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              pers.role === 'HSEO Management' || pers.role === 'Officer' || pers.role === 'HSEO management'
                                ? 'bg-slate-700 text-white border-slate-600'
                                : pers.role === 'Field Team Member'
                                ? 'bg-white text-blue-600 border-blue-200'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}>
                              {pers.role === 'PI' ? 'Principal Investigator (PI)' : pers.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{pers.department}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                              pers.dso === 'Yes' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 font-extrabold' 
                                : 'bg-slate-950 text-slate-500 border-slate-800 font-medium'
                            }`}>
                              {pers.dso === 'Yes' ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                              pers.dwa === 'Yes' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 font-extrabold' 
                                : 'bg-slate-950 text-slate-500 border-slate-800 font-medium'
                            }`}>
                              {pers.dwa === 'Yes' ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                              pers.status === 'Inactive'
                                ? 'bg-slate-950 text-slate-500 border-slate-800 font-medium'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 font-extrabold'
                            }`}>
                              {pers.status === 'Inactive' ? 'Inactive' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        <User className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                        <p className="text-xs">No personnel registered matching your query.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LINKED ITEMS INSPECTOR DETAILS */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* LOCATION DETAILS PANEL */}
          {selectedLoc ? (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-5 text-left sticky top-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded uppercase">
                    Space Inspector
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-100 mt-1 flex items-center gap-1">
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
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-300">{selectedLoc.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Person in Charge (PI):</span>
                  <span className="font-bold text-indigo-400 hover:underline cursor-pointer" onClick={() => {
                    setSelectedPersonId(selectedLoc.piIds[0] || null);
                    setSelectedLocationId(null);
                  }}>
                    {selectedLoc.piIds.map(getPersonName).join(', ')}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Contact Person (PI's Delegate):</span>
                  {(selectedLoc.piDelegateIds || []).length > 0 ? (
                    <div className="grid grid-cols-1 gap-1.5 pl-1.5">
                      {(selectedLoc.piDelegateIds || []).map(id => {
                        const person = persons.find(p => p.id === id);
                        if (!person) return null;
                        return (
                          <div key={id} className="text-[11px] bg-slate-900 border border-slate-800/60 rounded p-1.5 flex flex-col">
                            <span className="font-semibold text-slate-300 flex items-center gap-1"><User className="h-3 w-3 text-indigo-400" /> {person.name} <span className="text-[9px] text-slate-500">({person.role})</span></span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="h-2.5 w-2.5" /> {person.email}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="h-2.5 w-2.5" /> {person.phone}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-slate-500 italic block">No secondary contacts</span>
                  )}
                </div>
              </div>

              {/* Programs and Linked Database Tables */}
              <div className="space-y-3">
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
                  <div className="space-y-1.5 text-[10px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
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
          ) : selectedPers ? (
            /* PERSON DETAILS PANEL */
            <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 space-y-5 text-left sticky top-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex gap-2">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedPers.role === 'PI' 
                        ? 'bg-amber-950/40 text-amber-500 border-amber-900/50' 
                        : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50'
                    }`}>
                      {selectedPers.role === 'PI' ? 'Principal Investigator' : selectedPers.role}
                    </span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedPers.status === 'Inactive' 
                        ? 'bg-rose-950/40 text-rose-500 border-rose-900/50' 
                        : 'bg-emerald-950/40 text-emerald-500 border-emerald-900/50'
                    }`}>
                      {selectedPers.status === 'Inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-100 mt-1.5 flex items-center gap-1.5">
                    <User className="h-4.5 w-4.5 text-indigo-500" />
                    {selectedPers.name}
                  </h2>
                  {selectedPers.title && <p className="text-xs text-slate-400 mt-0.5 italic">{selectedPers.title}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditPersName(selectedPers.name);
                      setEditPersRole(selectedPers.role);
                      setEditPersDept(selectedPers.department);
                      setEditPersEmail(selectedPers.email);
                      setEditPersPhone(selectedPers.phone);
                      setEditPersTitle(selectedPers.title || '');
                      setEditPersStatus(selectedPers.status || 'Active');
                      setEditPersDso(selectedPers.dso || 'No');
                      setEditPersDwa(selectedPers.dwa || 'No');
                      setIsEditingPerson(true);
                    }}
                    className="text-xs bg-indigo-900/50 text-indigo-400 hover:bg-indigo-900 px-2 py-1 rounded transition border border-indigo-500/30 font-semibold"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setSelectedPersonId(null)} 
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isEditingPerson ? (
                <form onSubmit={handleUpdatePersonSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Full Name *</label>
                      <input type="text" required value={editPersName} onChange={e => setEditPersName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                      <input type="text" required value={editPersDept} onChange={e => setEditPersDept(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Role</label>
                      <select value={editPersRole} onChange={e => setEditPersRole(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none">
                        <option value="Principal Investigator (PI)">Principal Investigator (PI)</option>
                        <option value="Staff">Staff</option>
                        <option value="Student">Student</option>
                        <option value="Field Team Member">Field Team Member</option>
                        <option value="HSEO Management">HSEO Management</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Title</label>
                      <input type="text" value={editPersTitle} onChange={e => setEditPersTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Email *</label>
                      <input type="email" required value={editPersEmail} onChange={e => setEditPersEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Phone</label>
                      <input type="text" value={editPersPhone} onChange={e => setEditPersPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">DSO (Departmental Safety Officer)</label>
                      <select value={editPersDso} onChange={e => setEditPersDso(e.target.value as 'Yes' | 'No')} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">DWA (Departmental Workstation Assessor)</label>
                      <select value={editPersDwa} onChange={e => setEditPersDwa(e.target.value as 'Yes' | 'No')} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Status</label>
                      <select value={editPersStatus} onChange={e => setEditPersStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditingPerson(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded transition">Save Changes</button>
                  </div>
                </form>
              ) : (
                <>
              {/* Personal Contact Details */}
              <div className="space-y-2 bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs leading-normal">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-300">{selectedPers.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3 text-slate-500" /> Email:</span>
                  <span className="font-semibold text-slate-300 truncate max-w-[150px]">{selectedPers.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3 text-slate-500" /> Phone:</span>
                  <span className="font-semibold text-slate-300">{selectedPers.phone}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/60 pt-1.5 mt-1.5">
                  <span className="text-slate-500">DSO (Safety Officer):</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${selectedPers.dso === 'Yes' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    {selectedPers.dso || 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">DWA (Workstation Assessor):</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${selectedPers.dwa === 'Yes' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    {selectedPers.dwa || 'No'}
                  </span>
                </div>
              </div>

              {/* Linkages stats and databases */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Compliance Roles</span>
                
                {/* Managed Spatial Rooms */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                    <BuildingIcon className="h-4 w-4 text-indigo-400" />
                    <span>In-Charge (PI) Rooms ({locations.filter(l => l.piIds.includes(selectedPers.id)).length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {locations.filter(l => l.piIds.includes(selectedPers.id)).map(l => (
                      <div 
                        key={l.id} 
                        onClick={() => {
                          setSelectedLocationId(l.id);
                          setSelectedPersonId(null);
                        }}
                        className="p-1.5 bg-slate-950/40 hover:bg-slate-900 rounded text-[10px] border border-slate-800/50 flex justify-between items-center cursor-pointer transition"
                      >
                        <span className="truncate text-slate-300 font-bold">{l.building}, Rm {l.roomNumber}</span>
                        <span className="text-[9px] text-slate-500 italic">{l.roomNature}</span>
                      </div>
                    ))}
                    {locations.filter(l => l.piIds.includes(selectedPers.id)).length === 0 && (
                      <span className="text-slate-600 italic text-[10px] block pl-1">Not assigned as PI to any active rooms</span>
                    )}
                  </div>
                </div>

                {/* Custodian for Radiation assets */}
                {selectedPers.role === 'PI' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                      <Radio className="h-4 w-4 text-amber-500 animate-pulse" />
                      <span>Radiation Safety Custodian ({radiationSources.filter(r => r.piId === selectedPers.id).length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {radiationSources.filter(r => r.piId === selectedPers.id).map(r => (
                        <div key={r.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 flex justify-between items-center">
                          <span className="text-slate-300 font-semibold truncate">{r.sourceName}</span>
                          <span className="text-[9px] font-bold text-amber-500 bg-amber-950/30 px-1.5 py-0.5 rounded">{r.isotope}</span>
                        </div>
                      ))}
                      {radiationSources.filter(r => r.piId === selectedPers.id).length === 0 && (
                        <span className="text-slate-600 italic text-[10px] block pl-1">No radioactive assets registered to this PI</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Laser Custodian */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span>Laser Safety Custodian ({laserDevices.filter(l => l.piId === selectedPers.id).length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {laserDevices.filter(l => l.piId === selectedPers.id).map(l => (
                      <div key={l.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">{l.identifier}</span>
                        <span className="text-[9px] text-slate-500 italic">{l.wavelength}</span>
                      </div>
                    ))}
                    {laserDevices.filter(l => l.piId === selectedPers.id).length === 0 && (
                      <span className="text-slate-600 italic text-[10px] block pl-1">No laser devices registered under this custodian</span>
                    )}
                  </div>
                </div>

                {/* Inspections Associated */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                    <ClipboardCheck className="h-4 w-4 text-indigo-400" />
                    <span>Audit Inspections ({inspections.filter(i => i.piId === selectedPers.id).length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {inspections.filter(i => i.piId === selectedPers.id).map(i => (
                      <div key={i.id} className="p-1.5 bg-slate-950/40 rounded text-[10px] border border-slate-800/50 flex justify-between items-center">
                        <span className="truncate text-slate-300 font-medium">{i.title}</span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 rounded ${i.status === 'completed' ? 'text-emerald-400 bg-emerald-950/30' : 'text-amber-500 bg-amber-950/30'}`}>{i.status}</span>
                      </div>
                    ))}
                    {inspections.filter(i => i.piId === selectedPers.id).length === 0 && (
                      <span className="text-slate-600 italic text-[10px] block pl-1">No inspections linked to this PI</span>
                    )}
                  </div>
                </div>
              </div>
              </>
            )}
            </div>
          ) : (
            /* DEFAULT EMPTY PANEL STATE */
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-8 text-center text-slate-500 sticky top-4">
              <BuildingIcon className="h-10 w-10 mx-auto text-slate-700 mb-3" />
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Spatial Association Panel</h3>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Click on any Registered Room Location or registered Person/PI to inspect spatial configurations, emergency phone lists, and dynamic links to safety programs.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
