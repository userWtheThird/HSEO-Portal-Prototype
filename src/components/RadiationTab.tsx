import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Biohazard, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ChevronRight, 
  Users, 
  Activity,
  Award,
  Search,
  Calendar,
  User as UserIcon,
  Download,
  ClipboardCheck,
  Zap,
  MapPin,
  X,
  Edit,
  Trash2,
  Shield,
  Layers,
  Network
} from 'lucide-react';
import { 
  User, 
  RadiationSource, 
  DosimeterLog, 
  Location, 
  Person,
  Rua,
  RuaGroup
} from '../types';

// Default preloaded Radiation Use Authorizations (RUA) requested by the user
const DEFAULT_RUAS: Rua[] = [
  {
    id: 'rua_1',
    spaceID: 'Physics Wing A105',
    type: 'Communal',
    department: 'Physics',
    personInCharge: 'Sarah Jenkins',
    groups: [
      {
        id: 'g_1',
        piId: 'pers_elena',
        piName: 'Dr. Elena Rostova',
        isotopes: ['Tritium (H-3)', 'Carbon-14'],
        users: [
          { id: 'u_1', name: 'John Thompson', role: 'Staff' },
          { id: 'u_2', name: 'Robert Vance', role: 'Staff' }
        ]
      },
      {
        id: 'g_2',
        piId: 'pers_sarah',
        piName: 'Sarah Jenkins',
        isotopes: ['Phosphorus-32'],
        users: [
          { id: 'u_3', name: 'Marcus Chen', role: 'HSEO Auditor' }
        ]
      }
    ]
  },
  {
    id: 'rua_2',
    spaceID: 'Main Science Building302',
    type: 'Individual',
    department: 'Chemistry',
    piId: 'pers_elena',
    piName: 'Dr. Elena Rostova',
    isotopes: ['Tritium (H-3)', 'Sulfur-35'],
    users: [
      { id: 'u_4', name: 'James Rodriguez', role: 'Staff' },
      { id: 'u_5', name: 'Nisha Patel', role: 'Staff' }
    ]
  }
];

interface RadiationTabProps {
  currentUser: User;
  radiationSources: RadiationSource[];
  dosimeterLogs: DosimeterLog[];
  locations: Location[];
  persons: Person[];
  onTriggerLeakTest: (sourceId: string, logDetails: string) => void;
  onAddDosimeterLog: (log: DosimeterLog, logDetails: string) => void;
  onAddRadiationSource: (source: RadiationSource, logDetails: string) => void;
  onUpdateRadiationSource?: (source: RadiationSource, logDetails: string) => void;
  onBatchUpdateRadiationSources?: (sources: RadiationSource[], logDetails: string) => void;
}

interface CommunalGroupInput {
  piId: string;
  piName: string;
  isotopesText: string;
  usersText: string;
}

export default function RadiationTab({
  currentUser,
  radiationSources,
  dosimeterLogs,
  locations,
  persons,
  onTriggerLeakTest,
  onAddDosimeterLog,
  onAddRadiationSource,
  onUpdateRadiationSource,
  onBatchUpdateRadiationSources
}: RadiationTabProps) {
  const [subTab, setSubTab] = useState<'inventory' | 'dosimeter'>('inventory');
  const [inventoryCategory, setInventoryCategory] = useState<'sealed' | 'unsealed' | 'apparatus'>('sealed');
  
  // Unsealed Sub-tab toggles: Standard Inventory vs Radiation Use Authorization (RUA)
  const [unsealedSubTab, setUnsealedSubTab] = useState<'inventory' | 'rua'>('inventory');

  // Unified Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIsotope, setFilterIsotope] = useState('All');
  const [filterDept, setFilterDept] = useState('All');

  // Selected item detail panel state
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Batch Selection State for Sealed Sources
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  // States for adding source (varies by category)
  const [isAddingSource, setIsAddingSource] = useState(false);

  // Editing sealed source state
  const [editingSealedSource, setEditingSealedSource] = useState<RadiationSource | null>(null);
  const [editSrcName, setEditSrcName] = useState('');
  const [editSrcIsotope, setEditSrcIsotope] = useState('');
  const [editSrcActivity, setEditSrcActivity] = useState('');
  const [editSrcLocation, setEditSrcLocation] = useState('');
  const [editSrcCustodian, setEditSrcCustodian] = useState('');
  const [editSrcActivityRef, setEditSrcActivityRef] = useState('');
  const [editSrcRefDate, setEditSrcRefDate] = useState('');
  
  // RUA Persistent State
  const [ruas, setRuas] = useState<Rua[]>([]);
  const [isAddingRua, setIsAddingRua] = useState(false);
  const [editingRua, setEditingRua] = useState<Rua | null>(null);
  const [selectedRuaId, setSelectedRuaId] = useState<string | null>(null);

  // Form fields for Source Registration
  const [sourceName, setSourceName] = useState('');
  const [isotope, setIsotope] = useState('Americium-241');
  const [activity, setActivity] = useState('');
  const [spaceID, setSpaceID] = useState('');
  const [custodian, setCustodian] = useState('');
  
  // Sealed Specifics
  const [activityReference, setActivityReference] = useState('');
  const [referenceDate, setReferenceDate] = useState('');

  // Apparatus Specifics
  const [licenceNumber, setLicenceNumber] = useState('');
  const [apparatusDept, setApparatusDept] = useState('');
  const [equipmentDescription, setEquipmentDescription] = useState('');
  const [xrayTubeSerialNumbers, setXrayTubeSerialNumbers] = useState('');
  const [licenceExpiryDate, setLicenceExpiryDate] = useState('');

  // States for adding dosimeter log
  const [isAddingDose, setIsAddingDose] = useState(false);
  const [doseEmployee, setDoseEmployee] = useState('');
  const [doseDept, setDoseDept] = useState('Physics');
  const [doseVal, setDoseVal] = useState<number>(1.2);
  const [doseThreshold, setDoseThreshold] = useState<number>(1.0);
  const [doseError, setDoseError] = useState<string | null>(null);

  // --- RUA FORM FIELDS STATES ---
  const [ruaSpaceID, setRuaSpaceID] = useState('');
  const [ruaType, setRuaType] = useState<'Communal' | 'Individual'>('Communal');
  const [ruaDept, setRuaDept] = useState('Physics');
  const [ruaPic, setRuaPic] = useState('');
  // Individual fields
  const [ruaPiId, setRuaPiId] = useState('');
  const [ruaIsotopesText, setRuaIsotopesText] = useState('');
  const [ruaUsersText, setRuaUsersText] = useState(''); // comma-separated names with optional (roles)
  // Communal fields
  const [ruaGroups, setRuaGroups] = useState<CommunalGroupInput[]>([
    { piId: '', piName: '', isotopesText: '', usersText: '' }
  ]);

  // Load RUAs on mount
  useEffect(() => {
    try {
      const storedRuas = localStorage.getItem('RADIATION_RUAS_V1');
      if (storedRuas) {
        setRuas(JSON.parse(storedRuas));
      } else {
        setRuas(DEFAULT_RUAS);
        localStorage.setItem('RADIATION_RUAS_V1', JSON.stringify(DEFAULT_RUAS));
      }
    } catch (e) {
      console.error("Error reading RUA states", e);
      setRuas(DEFAULT_RUAS);
    }
  }, []);

  const saveRuas = (updated: Rua[]) => {
    setRuas(updated);
    localStorage.setItem('RADIATION_RUAS_V1', JSON.stringify(updated));
  };

  // Auto-fill coordinates on SpaceID selection
  const handleSpaceIDChange = (selectedSpace: string) => {
    setSpaceID(selectedSpace);
    const matchedLoc = locations.find(l => l.spaceID === selectedSpace);
    if (matchedLoc) {
      // Find PI of this location to auto-custodian
      const piName = persons.find(p => matchedLoc.piIds.includes(p.id))?.name || '';
      if (piName) {
        setCustodian(piName);
      }
    }
  };

  // Submit radioactive source
  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inventoryCategory === 'sealed') {
      if (!sourceName.trim() || !activity.trim() || !spaceID) {
        alert("Please complete all required fields (Source Name, Radioactivity Current, and SpaceID).");
        return;
      }
    } else if (inventoryCategory === 'unsealed') {
      if (!sourceName.trim() || !activity.trim() || !spaceID) {
        alert("Please complete all required fields (Source Name, Radioactivity Current, and SpaceID).");
        return;
      }
    } else if (inventoryCategory === 'apparatus') {
      if (!equipmentDescription.trim() || !licenceNumber.trim() || !spaceID) {
        alert("Please complete all required fields (Equipment Description, Licence Number, and SpaceID).");
        return;
      }
    }

    const matchedLoc = locations.find(l => l.spaceID === spaceID);
    const resolvedLocationStr = matchedLoc 
      ? `Rm ${matchedLoc.roomNumber}, ${matchedLoc.building}` 
      : spaceID;

    let computedNotificationDate = undefined;
    if (licenceExpiryDate) {
      const expDate = new Date(licenceExpiryDate);
      expDate.setMonth(expDate.getMonth() - 4);
      computedNotificationDate = expDate.toISOString().split('T')[0];
    }

    const newSource: RadiationSource = {
      id: `rad_${Date.now()}`,
      category: inventoryCategory,
      sourceName: inventoryCategory === 'apparatus' ? equipmentDescription : sourceName,
      isotope: inventoryCategory === 'apparatus' ? 'X-Ray Apparatus' : isotope,
      activity: inventoryCategory === 'apparatus' ? 'N/A' : activity,
      location: resolvedLocationStr,
      spaceID: spaceID,
      custodian: custodian || 'Dr. Elena Rostova',
      status: 'safe',
      lastLeakTest: inventoryCategory === 'apparatus' ? undefined : new Date().toISOString().split('T')[0],
      nextLeakTest: inventoryCategory === 'apparatus' ? undefined : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      // Sealed Source specific
      lastInventoryCheckDate: inventoryCategory === 'sealed' ? new Date().toISOString().split('T')[0] : undefined,
      activityReference: inventoryCategory === 'sealed' ? activityReference || activity : undefined,
      referenceDate: inventoryCategory === 'sealed' ? referenceDate || new Date().toISOString().split('T')[0] : undefined,
      checkHistory: inventoryCategory === 'sealed' ? [new Date().toISOString().split('T')[0]] : undefined,

      // Apparatus specific
      licenceNumber: inventoryCategory === 'apparatus' ? licenceNumber : undefined,
      department: inventoryCategory === 'apparatus' ? apparatusDept || (matchedLoc ? matchedLoc.department : 'Physics') : undefined,
      equipmentDescription: inventoryCategory === 'apparatus' ? equipmentDescription : undefined,
      xrayTubeSerialNumbers: inventoryCategory === 'apparatus' ? xrayTubeSerialNumbers : undefined,
      licenceExpiryDate: inventoryCategory === 'apparatus' ? licenceExpiryDate : undefined,
      notificationDate: computedNotificationDate,

      locationId: matchedLoc?.id,
      piId: matchedLoc?.piIds[0]
    };

    const actionText = `Registered radioactive ${inventoryCategory} source: "${newSource.sourceName}" in Space ${spaceID}.`;
    onAddRadiationSource(newSource, actionText);

    // Reset Form fields
    setSourceName('');
    setActivity('');
    setSpaceID('');
    setCustodian('');
    setActivityReference('');
    setReferenceDate('');
    setLicenceNumber('');
    setApparatusDept('');
    setEquipmentDescription('');
    setXrayTubeSerialNumbers('');
    setLicenceExpiryDate('');
    setIsAddingSource(false);
  };

  // Submit dosimetry
  const handleAddDoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoseError(null);

    if (!doseEmployee.trim()) {
      setDoseError("Please specify employee name.");
      return;
    }

    if (doseVal <= doseThreshold) {
      setDoseError(`Dose entry rejected. Dose reading (${doseVal} mSv) does not exceed logging threshold (${doseThreshold} mSv). Per ALARA policy, only elevated doses exceeding the action threshold are logged.`);
      return;
    }

    let doseStatus: 'normal' | 'caution' | 'critical' = 'normal';
    if (doseVal >= 5.0) doseStatus = 'critical';
    else if (doseVal >= 1.0) doseStatus = 'caution';

    const newDose: DosimeterLog = {
      id: `dos_${Date.now()}`,
      employeeName: doseEmployee,
      department: doseDept,
      exposure: Number(doseVal),
      period: 'Q2 2026',
      status: doseStatus
    };

    const actionText = `Logged exposure measurement of ${doseVal} mSv for ${doseEmployee} exceeding safety threshold of ${doseThreshold} mSv.`;
    onAddDosimeterLog(newDose, actionText);

    // Reset
    setDoseEmployee('');
    setIsAddingDose(false);
  };

  // Perform a Leak Test
  const handlePerformLeakTest = (source: RadiationSource) => {
    const actionText = `Completed a radioactive leak test on source "${source.sourceName}" (${source.isotope}). Status updated to Safe.`;
    onTriggerLeakTest(source.id, actionText);
  };

  // Single inventory verification check
  const handleSaveEditSealedSource = () => {
    if (!editingSealedSource || !onUpdateRadiationSource) return;
    const updated: RadiationSource = {
      ...editingSealedSource,
      sourceName: editSrcName,
      isotope: editSrcIsotope,
      activity: editSrcActivity,
      location: editSrcLocation,
      custodian: editSrcCustodian,
      activityReference: editSrcActivityRef,
      referenceDate: editSrcRefDate,
    };
    onUpdateRadiationSource(updated, `Edited sealed source "${editSrcName}" (${editSrcIsotope}).`);
    setEditingSealedSource(null);
  };

  const handleMarkVerifiedSingle = (source: RadiationSource) => {
    if (!onUpdateRadiationSource) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updatedHistory = source.checkHistory ? [...source.checkHistory, todayStr] : [todayStr];
    const updated: RadiationSource = {
      ...source,
      lastInventoryCheckDate: todayStr,
      checkHistory: updatedHistory
    };
    onUpdateRadiationSource(updated, `Conducted inventory check for source "${source.sourceName}". Last check updated to ${todayStr}.`);
  };

  // Batch Check-Date Update for Sealed Sources
  const handleBatchUpdateCheckDate = () => {
    if (selectedSourceIds.length === 0 || !onBatchUpdateRadiationSources) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    const targets = radiationSources.filter(s => selectedSourceIds.includes(s.id) && s.category === 'sealed');
    const updatedSources = targets.map(source => {
      const updatedHistory = source.checkHistory ? [...source.checkHistory, todayStr] : [todayStr];
      return {
        ...source,
        lastInventoryCheckDate: todayStr,
        checkHistory: updatedHistory
      };
    });

    onBatchUpdateRadiationSources(
      updatedSources,
      `Batch inventory check date verification completed for ${selectedSourceIds.length} sealed sources.`
    );
    setSelectedSourceIds([]);
    alert(`Successfully batch updated the inventory verification check date to ${todayStr} for ${selectedSourceIds.length} sources.`);
  };

  // Helper parser for dynamic User Strings
  const parseUsersText = (txt: string): { id: string; name: string; role: string }[] => {
    if (!txt.trim()) return [];
    return txt.split(',').map((u, i) => {
      const cleaned = u.trim();
      const roleMatch = cleaned.match(/\(([^)]+)\)/);
      const role = roleMatch ? roleMatch[1] : 'Researcher';
      const name = cleaned.replace(/\([^)]+\)/, '').trim();
      return {
        id: `usr_${Date.now()}_${i}`,
        name,
        role
      };
    });
  };

  // Submit RUA Form (Add & Edit)
  const handleRuaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruaSpaceID) {
      alert("Please select a SpaceID.");
      return;
    }

    const matchedLoc = locations.find(l => l.spaceID === ruaSpaceID);
    const department = matchedLoc ? matchedLoc.department : ruaDept;

    if (ruaType === 'Individual') {
      const piPerson = persons.find(p => p.id === ruaPiId);
      const newRua: Rua = {
        id: editingRua ? editingRua.id : `rua_${Date.now()}`,
        spaceID: ruaSpaceID,
        type: 'Individual',
        department,
        piId: ruaPiId,
        piName: piPerson ? piPerson.name : 'Dr. Elena Rostova',
        isotopes: ruaIsotopesText.split(',').map(x => x.trim()).filter(Boolean),
        users: parseUsersText(ruaUsersText)
      };

      if (editingRua) {
        saveRuas(ruas.map(r => r.id === editingRua.id ? newRua : r));
      } else {
        saveRuas([newRua, ...ruas]);
      }
    } else {
      // Communal type
      const parsedGroups: RuaGroup[] = ruaGroups.map((g, i) => {
        const piPerson = persons.find(p => p.id === g.piId);
        return {
          id: `g_${Date.now()}_${i}`,
          piId: g.piId,
          piName: piPerson ? piPerson.name : g.piName || 'Unknown PI',
          isotopes: g.isotopesText.split(',').map(x => x.trim()).filter(Boolean),
          users: parseUsersText(g.usersText)
        };
      });

      const newRua: Rua = {
        id: editingRua ? editingRua.id : `rua_${Date.now()}`,
        spaceID: ruaSpaceID,
        type: 'Communal',
        department,
        personInCharge: ruaPic || 'Sarah Jenkins',
        groups: parsedGroups
      };

      if (editingRua) {
        saveRuas(ruas.map(r => r.id === editingRua.id ? newRua : r));
      } else {
        saveRuas([newRua, ...ruas]);
      }
    }

    // Reset Form
    setIsAddingRua(false);
    setEditingRua(null);
    setRuaSpaceID('');
    setRuaPic('');
    setRuaPiId('');
    setRuaIsotopesText('');
    setRuaUsersText('');
    setRuaGroups([{ piId: '', piName: '', isotopesText: '', usersText: '' }]);
  };

  const startEditRua = (rua: Rua) => {
    setEditingRua(rua);
    setRuaSpaceID(rua.spaceID);
    setRuaType(rua.type);
    setRuaDept(rua.department);
    
    if (rua.type === 'Individual') {
      setRuaPiId(rua.piId || '');
      setRuaIsotopesText(rua.isotopes ? rua.isotopes.join(', ') : '');
      setRuaUsersText(rua.users ? rua.users.map(u => `${u.name} (${u.role})`).join(', ') : '');
    } else {
      setRuaPic(rua.personInCharge || '');
      const grps: CommunalGroupInput[] = rua.groups ? rua.groups.map(g => ({
        piId: g.piId,
        piName: g.piName,
        isotopesText: g.isotopes.join(', '),
        usersText: g.users.map(u => `${u.name} (${u.role})`).join(', ')
      })) : [{ piId: '', piName: '', isotopesText: '', usersText: '' }];
      setRuaGroups(grps);
    }
    setIsAddingRua(true);
  };

  const deleteRua = (ruaId: string) => {
    if (window.confirm("Are you sure you want to delete this Radiation Use Authorization (RUA)?")) {
      saveRuas(ruas.filter(r => r.id !== ruaId));
      if (selectedRuaId === ruaId) setSelectedRuaId(null);
    }
  };

  // Export List by Department
  const handleExportByDepartment = () => {
    const targets = filteredSources;
    if (targets.length === 0) {
      alert("No radioactive assets to export in current filter configuration.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Source ID,Source Name,Isotope,Radioactivity (Current),SpaceID,Location,Custodian,Status";
    if (inventoryCategory === 'sealed') {
      csvContent += ",Last Inventory Check Date,Radioactivity (Reference),Reference Date\n";
    } else if (inventoryCategory === 'apparatus') {
      csvContent += ",Licence Number,Department,Expiry Date,X-Ray Serial Numbers\n";
    } else {
      csvContent += "\n";
    }

    targets.forEach(t => {
      let row = `"${t.id}","${t.sourceName || ''}","${t.isotope || ''}","${t.activity || ''}","${t.spaceID || ''}","${t.location || ''}","${t.custodian || ''}","${t.status || ''}"`;
      if (inventoryCategory === 'sealed') {
        row += `,"${t.lastInventoryCheckDate || ''}","${t.activityReference || ''}","${t.referenceDate || ''}"`;
      } else if (inventoryCategory === 'apparatus') {
        row += `,"${t.licenceNumber || ''}","${t.department || ''}","${t.licenceExpiryDate || ''}","${t.xrayTubeSerialNumbers || ''}"`;
      }
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `radiation_inventory_export_${filterDept.replace(/\s+/g, '_')}_${inventoryCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique lists for Filters
  const uniqueIsotopes = Array.from(new Set(
    radiationSources.map(s => s.isotope).filter(Boolean)
  )).sort();

  const uniqueDepartments = Array.from(new Set(
    locations.map(l => l.department)
  )).sort();

  const piPersonnelList = persons.filter(p => p.role.includes('PI') || p.title.includes('Professor') || p.title.includes('Director'));

  // Filter radiation sources
  const filteredSources = radiationSources.filter(source => {
    const sourceCategory = source.category || 'sealed';
    if (sourceCategory !== inventoryCategory) return false;

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (source.sourceName && source.sourceName.toLowerCase().includes(query)) ||
      (source.isotope && source.isotope.toLowerCase().includes(query)) ||
      (source.custodian && source.custodian.toLowerCase().includes(query)) ||
      (source.spaceID && source.spaceID.toLowerCase().includes(query)) ||
      (source.location && source.location.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (filterIsotope !== 'All' && source.isotope !== filterIsotope) return false;

    if (filterDept !== 'All') {
      let sourceDept = 'Unknown';
      if (source.category === 'apparatus') {
        sourceDept = source.department || 'Physics';
      } else {
        const matchedLoc = locations.find(l => l.spaceID === source.spaceID);
        if (matchedLoc) sourceDept = matchedLoc.department;
      }
      if (sourceDept.toLowerCase().trim() !== filterDept.toLowerCase().trim()) return false;
    }

    return true;
  });

  const selectedSource = radiationSources.find(s => s.id === selectedSourceId);
  const selectedRua = ruas.find(r => r.id === selectedRuaId);

  return (
    <div className="space-y-6">
      
      {/* Header and Sub-tab toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Radio className="text-amber-500 animate-pulse h-5.5 w-5.5" />
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Radiation Safety Program</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tracking radioactive inventories, leak test compliance records, and active personnel dosimeter logs.
            </p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button 
              onClick={() => { setSubTab('inventory'); setSelectedSourceId(null); setSelectedSourceIds([]); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'inventory' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Biohazard className="h-3.5 w-3.5" />
              Isotope Inventory
            </button>
            <button 
              onClick={() => { setSubTab('dosimeter'); setSelectedSourceId(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'dosimeter' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Personnel Dosimetry
            </button>
          </div>
        </div>

        {/* SEARCH, FILTERS AND EXPORT RAIL */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3 items-center flex-1">
            <div className="relative w-full sm:max-w-[180px]">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-[11px] focus:outline-none focus:border-amber-500 text-slate-200"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">Dept:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {subTab === 'inventory' && inventoryCategory !== 'apparatus' && unsealedSubTab !== 'rua' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">Isotope:</span>
                <select
                  value={filterIsotope}
                  onChange={(e) => setFilterIsotope(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Isotopes</option>
                  {uniqueIsotopes.map(iso => (
                    <option key={iso} value={iso}>{iso}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {subTab === 'inventory' && (
            <div className="flex items-center gap-2">
              {inventoryCategory === 'unsealed' && unsealedSubTab === 'rua' ? (
                <button 
                  onClick={() => {
                    setEditingRua(null);
                    setRuaSpaceID('');
                    setRuaType('Communal');
                    setRuaPic('');
                    setRuaPiId('');
                    setRuaIsotopesText('');
                    setRuaUsersText('');
                    setRuaGroups([{ piId: '', piName: '', isotopesText: '', usersText: '' }]);
                    setIsAddingRua(true);
                  }}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Define RUA Space
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleExportByDepartment}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV List
                  </button>
                  <button 
                    onClick={() => setIsAddingSource(true)}
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register Source
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: ISOTOPE & APPARATUS INVENTORY */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Three-Category sub-navigation bar */}
          <div className="flex border-b border-slate-800 pb-0.5 gap-6 text-xs font-semibold">
            <button 
              onClick={() => { setInventoryCategory('sealed'); setSelectedSourceId(null); setSelectedSourceIds([]); }}
              className={`pb-2.5 transition relative ${
                inventoryCategory === 'sealed' ? 'text-amber-500 border-b-2 border-amber-500 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sealed Sources
            </button>
            <button 
              onClick={() => { setInventoryCategory('unsealed'); setSelectedSourceId(null); setSelectedSourceIds([]); }}
              className={`pb-2.5 transition relative ${
                inventoryCategory === 'unsealed' ? 'text-amber-500 border-b-2 border-amber-500 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unsealed Sources
            </button>
            <button 
              onClick={() => { setInventoryCategory('apparatus'); setSelectedSourceId(null); setSelectedSourceIds([]); }}
              className={`pb-2.5 transition relative ${
                inventoryCategory === 'apparatus' ? 'text-amber-500 border-b-2 border-amber-500 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Irradiating Apparatus
            </button>
          </div>

          {/* Sub Tab selection inside Unsealed Sources tab */}
          {inventoryCategory === 'unsealed' && (
            <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800/80 w-max text-xs font-semibold">
              <button
                onClick={() => { setUnsealedSubTab('inventory'); setSelectedSourceId(null); }}
                className={`px-3 py-1.5 rounded transition ${unsealedSubTab === 'inventory' ? 'bg-amber-600 text-white shadow font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Unsealed Inventory List
              </button>
              <button
                onClick={() => { setUnsealedSubTab('rua'); setSelectedSourceId(null); }}
                className={`px-3 py-1.5 rounded transition ${unsealedSubTab === 'rua' ? 'bg-amber-600 text-white shadow font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Radiation Use Authorizations (RUA)
              </button>
            </div>
          )}

          {/* Dynamic Grid Layout that maximizes table full width if no source or RUA selected */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* MAIN DATA GRID COLUMN */}
            <div className={`${(selectedSourceId || (unsealedSubTab === 'rua' && selectedRuaId && inventoryCategory === 'unsealed')) ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              
              {/* BATCH ACTION FLOATING BAR (Only for Sealed Sources) */}
              {inventoryCategory === 'sealed' && selectedSourceIds.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-900/60 p-3 rounded-lg flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold block">{selectedSourceIds.length} sealed sources selected</span>
                  </div>
                  <button
                    onClick={handleBatchUpdateCheckDate}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1 rounded transition text-xs flex items-center gap-1 animate-pulse"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Inventory checked
                  </button>
                </div>
              )}

              {/* REGISTER SOURCE OR APPARATUS FORM */}
              {isAddingSource && (
                <form onSubmit={handleAddSourceSubmit} className="bg-slate-900 border-2 border-amber-600/30 rounded-xl p-5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      Register {inventoryCategory === 'apparatus' ? 'Irradiating Apparatus' : `${inventoryCategory} Source`}
                    </span>
                    <button type="button" onClick={() => setIsAddingSource(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventoryCategory !== 'apparatus' ? (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Source Name *</label>
                          <input 
                            type="text" 
                            value={sourceName}
                            onChange={(e) => setSourceName(e.target.value)}
                            placeholder="e.g. Cobalt Sealed Disk #1"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Radioactive Isotope *</label>
                          <select 
                            value={isotope}
                            onChange={(e) => setIsotope(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                          >
                            <option value="Americium-241">Americium-241 (Alpha)</option>
                            <option value="Cesium-137">Cesium-137 (Beta/Gamma)</option>
                            <option value="Cobalt-60">Cobalt-60 (Gamma)</option>
                            <option value="Tritium (H-3)">Tritium (Beta)</option>
                            <option value="Californium-252">Californium-252 (Neutron)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Radioactivity Current (Activity) *</label>
                          <input 
                            type="text" 
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            placeholder="e.g. 37 MBq, 10 uCi"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">SpaceID *</label>
                          <select 
                            value={spaceID}
                            onChange={(e) => handleSpaceIDChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                            required
                          >
                            <option value="">-- Choose SpaceID --</option>
                            {locations.map(loc => (
                              <option key={loc.id} value={loc.spaceID}>
                                {loc.spaceID} (Rm {loc.roomNumber}, {loc.building} - {loc.department})
                              </option>
                            ))}
                          </select>
                        </div>

                        {inventoryCategory === 'sealed' && (
                          <>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Radioactivity (Reference)</label>
                              <input 
                                type="text" 
                                value={activityReference}
                                onChange={(e) => setActivityReference(e.target.value)}
                                placeholder="e.g. 40 MBq"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Reference Date</label>
                              <input 
                                type="date" 
                                value={referenceDate}
                                onChange={(e) => setReferenceDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned Custodian</label>
                          <input 
                            type="text" 
                            value={custodian}
                            onChange={(e) => setCustodian(e.target.value)}
                            placeholder="e.g. Dr. Robert Vance"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Equipment Description *</label>
                          <input 
                            type="text" 
                            value={equipmentDescription}
                            onChange={(e) => setEquipmentDescription(e.target.value)}
                            placeholder="e.g. Diagnostic Radiographic Unit G-4"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Licence Number *</label>
                          <input 
                            type="text" 
                            value={licenceNumber}
                            onChange={(e) => setLicenceNumber(e.target.value)}
                            placeholder="e.g. RAD-LIC-2026-X84"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department</label>
                          <select 
                            value={apparatusDept}
                            onChange={(e) => {
                              const dept = e.target.value;
                              setApparatusDept(dept);
                              const deptPers = persons.filter(p => p.department.toLowerCase().trim() === dept.toLowerCase().trim());
                              if (deptPers.length > 0) {
                                setCustodian(deptPers[0].name);
                              } else {
                                setCustodian('');
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Select Department --</option>
                            {uniqueDepartments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">SpaceID *</label>
                          <select 
                            value={spaceID}
                            onChange={(e) => handleSpaceIDChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                            required
                          >
                            <option value="">-- Choose SpaceID --</option>
                            {locations.map(loc => (
                              <option key={loc.id} value={loc.spaceID}>
                                {loc.spaceID} (Rm {loc.roomNumber}, {loc.building})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">X-ray Tube Serial Number(s)</label>
                          <input 
                            type="text" 
                            value={xrayTubeSerialNumbers}
                            onChange={(e) => setXrayTubeSerialNumbers(e.target.value)}
                            placeholder="e.g. TUBE-902-A, TUBE-902-B"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned Custodian *</label>
                          <select 
                            value={custodian}
                            onChange={(e) => setCustodian(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none cursor-pointer"
                            required
                          >
                            <option value="">-- Choose Custodian --</option>
                            {persons.map(p => (
                              <option key={p.id} value={p.name}>{p.name} ({p.department})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Licence Expiry Date</label>
                          <input 
                            type="date" 
                            value={licenceExpiryDate}
                            onChange={(e) => setLicenceExpiryDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingSource(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-1.5 rounded font-semibold transition"
                    >
                      Save Asset Entry
                    </button>
                  </div>
                </form>
              )}

              {/* RUA ADD / EDIT FORM PANEL */}
              {isAddingRua && (
                <form onSubmit={handleRuaSubmit} className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      {editingRua ? 'Modify Radiation Use Authorization (RUA)' : 'Setup Radiation Use Authorization (RUA)'}
                    </span>
                    <button type="button" onClick={() => setIsAddingRua(false)} className="text-slate-500 hover:text-slate-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">SpaceID *</label>
                      <select
                        value={ruaSpaceID}
                        onChange={(e) => setRuaSpaceID(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                        required
                      >
                        <option value="">-- Choose SpaceID --</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.spaceID}>{loc.spaceID} ({loc.building} Rm {loc.roomNumber})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">RUA Authorization Type *</label>
                      <select
                        value={ruaType}
                        onChange={(e) => setRuaType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                        required
                      >
                        <option value="Communal">Communal - Person-in-charge + Small PI groups</option>
                        <option value="Individual">Individual - PI + Authorized user list</option>
                      </select>
                    </div>
                  </div>

                  {ruaType === 'Individual' ? (
                    /* INDIVIDUAL RUA FIELDS */
                    <div className="space-y-4 p-4 rounded-lg bg-slate-950/60 border border-slate-850">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Principal Investigator (PI) *</label>
                          <select
                            value={ruaPiId}
                            onChange={(e) => setRuaPiId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                            required
                          >
                            <option value="">-- Choose PI --</option>
                            {piPersonnelList.map(pi => (
                              <option key={pi.id} value={pi.id}>{pi.name} ({pi.title})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Radioisotopes Worked On (Comma-separated) *</label>
                          <input 
                            type="text"
                            value={ruaIsotopesText}
                            placeholder="e.g. Tritium (H-3), Sulfur-35"
                            onChange={(e) => setRuaIsotopesText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Authorized User List (Format: Name (Role), ...)</label>
                        <textarea
                          value={ruaUsersText}
                          onChange={(e) => setRuaUsersText(e.target.value)}
                          placeholder="e.g. Robert Vance (Staff), Nisha Patel (Researcher), Diana Prince (Student)"
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    /* COMMUNAL RUA FIELDS */
                    <div className="space-y-4 p-4 rounded-lg bg-slate-950/60 border border-slate-850">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Person In-Charge from Department *</label>
                        <input
                          type="text"
                          value={ruaPic}
                          onChange={(e) => setRuaPic(e.target.value)}
                          placeholder="e.g. Dr. Sarah Connor"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div className="border-t border-slate-800 pt-3 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Small Groups (PI-led) & Isotopes</span>
                          <button
                            type="button"
                            onClick={() => setRuaGroups([...ruaGroups, { piId: '', piName: '', isotopesText: '', usersText: '' }])}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-1 rounded flex items-center gap-1 transition"
                          >
                            <Plus className="h-3 w-3" />
                            Add PI Group
                          </button>
                        </div>

                        {ruaGroups.map((g, index) => (
                          <div key={index} className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-3 relative">
                            {ruaGroups.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setRuaGroups(ruaGroups.filter((_, i) => i !== index))}
                                className="absolute right-2 top-2 p-1 text-rose-400 hover:bg-slate-800 rounded"
                                title="Remove Group"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Principal Investigator (PI) *</label>
                                <select
                                  value={g.piId}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRuaGroups(ruaGroups.map((group, idx) => idx === index ? { ...group, piId: val } : group));
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
                                  required
                                >
                                  <option value="">-- Select PI --</option>
                                  {piPersonnelList.map(pi => (
                                    <option key={pi.id} value={pi.id}>{pi.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Isotopes Worked On *</label>
                                <input 
                                  type="text"
                                  value={g.isotopesText}
                                  placeholder="e.g. Tritium (H-3), Phosphorus-32"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRuaGroups(ruaGroups.map((group, idx) => idx === index ? { ...group, isotopesText: val } : group));
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Group Users List (Format: Name (Role), ...)</label>
                              <input 
                                type="text"
                                value={g.usersText}
                                placeholder="e.g. Robert Vance (Staff), Alice Brown (Student)"
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRuaGroups(ruaGroups.map((group, idx) => idx === index ? { ...group, usersText: val } : group));
                                }}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingRua(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-1.5 rounded font-bold transition"
                    >
                      {editingRua ? 'Update Authorization' : 'Authorize Space Use'}
                    </button>
                  </div>
                </form>
              )}

              {/* RUA OR INVENTORY MAIN PANEL */}
              {inventoryCategory === 'unsealed' && unsealedSubTab === 'rua' ? (
                /* --- RADIATION USE AUTHORIZATION (RUA) UI PANEL --- */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {ruas.map(rua => {
                    const isCommunal = rua.type === 'Communal';
                    const activeRuaStyle = selectedRuaId === rua.id 
                      ? 'border-amber-500 bg-amber-950/5 ring-1 ring-amber-500/20' 
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700';

                    return (
                      <div 
                        key={rua.id} 
                        onClick={() => setSelectedRuaId(rua.id)}
                        className={`border rounded-xl p-5 cursor-pointer transition flex flex-col justify-between space-y-4 ${activeRuaStyle}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-slate-400">SPACE RUA AUTHORIZATION</span>
                              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5 mt-0.5">
                                <MapPin className="h-4 w-4 text-amber-500" />
                                {rua.spaceID}
                              </h4>
                            </div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                              isCommunal 
                                ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40' 
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                            }`}>
                              {rua.type}
                            </span>
                          </div>

                          <div className="space-y-2 text-xs leading-normal">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Department:</span>
                              <span className="font-semibold text-slate-300">{rua.department}</span>
                            </div>

                            {isCommunal ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Person In-Charge:</span>
                                  <span className="font-bold text-slate-200">{rua.personInCharge}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-800/50 pt-2">
                                  <span className="text-slate-500">PI Groups Authorized:</span>
                                  <span className="font-bold text-amber-400">{rua.groups?.length || 0} Groups</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Authorized PI:</span>
                                  <span className="font-bold text-slate-200">{rua.piName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Radioisotopes:</span>
                                  <span className="font-semibold text-amber-400">{rua.isotopes?.join(', ')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Registered Users:</span>
                                  <span className="font-semibold text-slate-400">{rua.users?.length || 0} Users</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-xs">
                          <span className="text-[10px] text-slate-500">ID: {rua.id}</span>
                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => startEditRua(rua)}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 rounded transition"
                              title="Edit Authorization"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRua(rua.id)}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded transition"
                              title="Delete Authorization"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {ruas.length === 0 && (
                    <div className="col-span-2 p-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 space-y-2">
                      <Network className="h-8 w-8 mx-auto text-slate-700 mb-1" />
                      <p className="text-xs">No Radiation Use Authorizations (RUA) configured for any rooms.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* --- INVENTORY LISTING TABLE --- */
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {inventoryCategory === 'sealed' && (
                            <th className="px-4 py-3 w-10 text-center">
                              <input 
                                type="checkbox"
                                checked={filteredSources.length > 0 && selectedSourceIds.length === filteredSources.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSourceIds(filteredSources.map(s => s.id));
                                  } else {
                                    setSelectedSourceIds([]);
                                  }
                                }}
                                className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                              />
                            </th>
                          )}
                          {inventoryCategory === 'sealed' ? (
                            <>
                              <th className="px-4 py-3">Source Name</th>
                              <th className="px-4 py-3">Radioactive Isotope</th>
                              <th className="px-4 py-3">Radioactivity (Current)</th>
                              <th className="px-4 py-3">Department</th>
                              <th className="px-4 py-3">SpaceID</th>
                              <th className="px-4 py-3">Inv. Check Status (Annual)</th>
                              <th className="px-4 py-3 text-center">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="px-4 py-3">Source / Isotope</th>
                              <th className="px-4 py-3">Activity</th>
                              <th className="px-4 py-3">SpaceID</th>
                              <th className="px-4 py-3">Custodian</th>
                              <th className="px-4 py-3 text-right">Status</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                        {filteredSources.length > 0 ? (
                          filteredSources.map((source) => {
                            const isSelected = selectedSourceId === source.id;
                            const isBatchSelected = selectedSourceIds.includes(source.id);

                            return (
                              <tr
                                key={source.id}
                                onClick={() => setSelectedSourceId(source.id)}
                                className={`cursor-pointer transition hover:bg-slate-800/20 ${
                                  isSelected 
                                    ? 'bg-amber-950/20 text-amber-100 font-semibold border-l-2 border-l-amber-500' 
                                    : 'text-slate-300'
                                }`}
                              >
                                {inventoryCategory === 'sealed' && (
                                  <td 
                                    className="px-4 py-3 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isBatchSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSourceIds([...selectedSourceIds, source.id]);
                                        } else {
                                          setSelectedSourceIds(selectedSourceIds.filter(id => id !== source.id));
                                        }
                                      }}
                                      className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer"
                                    />
                                  </td>
                                )}

                                {inventoryCategory === 'sealed' ? (
                                  <>
                                    <td className="px-4 py-3 font-semibold text-slate-100">{source.sourceName}</td>
                                    <td className="px-4 py-3 text-amber-400 font-medium">{source.isotope}</td>
                                    <td className="px-4 py-3 font-mono text-slate-400">{source.activity}</td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {(() => {
                                        const matchedLoc = locations.find(l => l.spaceID === source.spaceID);
                                        return matchedLoc ? matchedLoc.department : 'Physics';
                                      })()}
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{source.spaceID}</td>
                                    <td className="px-4 py-3">
                                      {(() => {
                                        const matchedLoc = locations.find(l => l.spaceID === source.spaceID);
                                        const dept = matchedLoc ? matchedLoc.department : 'Physics';
                                        const ftm = persons.find(p => p.role === 'Field Team Member' && p.assignedDepartments?.includes(dept)) 
                                                 || persons.find(p => p.role === 'Field Team Member');
                                        const ftmName = ftm ? ftm.name : 'Unassigned';

                                        const lastCheck = source.lastInventoryCheckDate ? new Date(source.lastInventoryCheckDate) : null;
                                        const baseline = new Date('2026-07-12');
                                        const diffDays = lastCheck ? Math.floor((baseline.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24)) : 999;
                                        const isUpToDate = diffDays < 365;

                                        return (
                                          <div className="space-y-0.5">
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                              isUpToDate 
                                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                                                : 'bg-rose-950/40 text-rose-400 border-rose-900/30 animate-pulse font-black'
                                            }`}>
                                              {isUpToDate ? 'Up to Date' : 'Overdue'}
                                            </span>
                                            <span className="block text-[9px] text-slate-500 font-medium truncate max-w-[120px]">
                                              FTM: {ftmName}
                                            </span>
                                          </div>
                                        );
                                      })()}
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => {
                                          setEditingSealedSource(source);
                                          setEditSrcName(source.sourceName || '');
                                          setEditSrcIsotope(source.isotope || '');
                                          setEditSrcActivity(source.activity || '');
                                          setEditSrcLocation(source.location || '');
                                          setEditSrcCustodian(source.custodian || '');
                                          setEditSrcActivityRef(source.activityReference || '');
                                          setEditSrcRefDate(source.referenceDate || '');
                                        }}
                                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-amber-600/20 hover:text-amber-400 text-slate-500 transition border border-slate-700/50 hover:border-amber-600/40"
                                        title="Edit source"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                    </td>
                                  </>
                                ) : inventoryCategory === 'unsealed' ? (
                                  <>
                                    <td className="px-4 py-3">
                                      <span className="font-semibold text-slate-100 block">{source.sourceName}</span>
                                      <span className="text-[10px] text-slate-500">{source.isotope}</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-amber-400">{source.activity}</td>
                                    <td className="px-4 py-3 font-mono font-bold text-slate-400">{source.spaceID || 'N/A'}</td>
                                    <td className="px-4 py-3 text-slate-400">{source.custodian}</td>
                                    <td className="px-4 py-3 text-right">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                        source.status === 'safe' 
                                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                                          : 'bg-rose-950/40 text-rose-400 border-rose-900/30 animate-pulse'
                                      }`}>
                                        {source.status}
                                      </span>
                                    </td>
                                  </>
                                ) : (
                                  /* Irradiating Apparatus list */
                                  <>
                                    <td className="px-4 py-3 font-semibold text-slate-100">{source.sourceName || source.equipmentDescription}</td>
                                    <td className="px-4 py-3 text-amber-500 font-mono font-medium">{source.licenceNumber}</td>
                                    <td className="px-4 py-3 text-slate-400">{source.department || 'Physics'}</td>
                                    <td className="px-4 py-3 font-bold font-mono text-slate-300">{source.spaceID}</td>
                                    <td className="px-4 py-3 text-slate-400 font-medium">
                                      {source.licenceExpiryDate || 'N/A'}
                                      {source.licenceExpiryDate && new Date(source.licenceExpiryDate) < new Date() && (
                                        <span className="block text-[9px] text-rose-500 font-bold uppercase mt-0.5">Expired</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                                        source.status === 'safe' 
                                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                                          : 'bg-rose-950/40 text-rose-400 border-rose-900/30 animate-pulse'
                                      }`}>
                                        {source.status}
                                      </span>
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                              <Biohazard className="h-8 w-8 mx-auto text-slate-700 mb-2 animate-pulse" />
                              <p className="text-xs">No assets matching your search/filters are currently listed.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR PANEL */}
            {/* Renders dynamic details when a Source is selected */}
            {selectedSourceId && (
              <div className="lg:col-span-1 space-y-4">
                {selectedSource ? (
                  <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-5 space-y-4 text-left sticky top-4 shadow-xl">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded uppercase">
                          {inventoryCategory.toUpperCase()} ASSET
                        </span>
                        <h2 className="text-sm font-extrabold text-slate-100 mt-1 flex items-center gap-1.5">
                          <Radio className="h-4 w-4 text-amber-500 animate-pulse" />
                          {selectedSource.sourceName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{selectedSource.isotope}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedSourceId(null)} 
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 bg-slate-950/50 border border-slate-800/85 rounded-lg p-3 text-xs leading-normal font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-500">SpaceID:</span>
                        <span className="font-bold text-amber-400 font-mono">{selectedSource.spaceID || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Physical Location:</span>
                        <span className="font-semibold text-slate-300 truncate max-w-[150px]">{selectedSource.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Custodian In Charge:</span>
                        <span className="font-bold text-slate-300">{selectedSource.custodian}</span>
                      </div>

                      {inventoryCategory === 'sealed' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Radioactivity (Reference):</span>
                            <span className="font-mono text-slate-300">{selectedSource.activityReference || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Reference Date:</span>
                            <span className="text-slate-300">{selectedSource.referenceDate || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-800/60 pt-2">
                            <span className="text-slate-400 font-semibold">Last Checked Date:</span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {selectedSource.lastInventoryCheckDate || 'N/A'}
                            </span>
                          </div>
                        </>
                      )}

                      {inventoryCategory === 'apparatus' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Licence Number:</span>
                            <span className="font-bold font-mono text-slate-300">{selectedSource.licenceNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Department:</span>
                            <span className="font-bold text-slate-300">{selectedSource.department || 'Physics'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Licence Expiry Date:</span>
                            <span className="font-bold text-slate-300">{selectedSource.licenceExpiryDate || 'N/A'}</span>
                          </div>
                          {selectedSource.notificationDate && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Alert Notification Date:</span>
                              <span className="text-amber-500 font-semibold">{selectedSource.notificationDate} (4mo before)</span>
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5 border-t border-slate-800/60 pt-2">
                            <span className="text-slate-500 block">X-ray Tube Serial Number(s):</span>
                            <span className="font-mono text-[10px] text-slate-300 bg-slate-900 border border-slate-800 p-1 rounded mt-1 truncate">
                              {selectedSource.xrayTubeSerialNumbers || 'N/A'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      {inventoryCategory === 'sealed' && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleMarkVerifiedSingle(selectedSource)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded transition flex items-center justify-center gap-1 shadow"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Inventory checked
                          </button>
                          
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Check Dates History</span>
                            <div className="max-h-24 overflow-y-auto border border-slate-800/60 rounded p-2 bg-slate-950/40 text-[10px] text-slate-400 space-y-1 custom-scrollbar text-left">
                              {selectedSource.checkHistory && selectedSource.checkHistory.length > 0 ? (
                                selectedSource.checkHistory.map((d, index) => (
                                  <div key={index} className="flex justify-between border-b border-slate-800/40 pb-1">
                                    <span>Check #{index + 1}:</span>
                                    <span className="font-mono text-slate-300 font-semibold">{d}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-slate-600 italic">No check dates logged</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {inventoryCategory !== 'apparatus' && selectedSource.lastLeakTest && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2 font-sans text-left">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Last Leak Test:</span>
                            <span className="font-mono text-slate-300">{selectedSource.lastLeakTest}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Next Leak Test:</span>
                            <span className="font-mono text-slate-300">{selectedSource.nextLeakTest}</span>
                          </div>

                          {selectedSource.status !== 'safe' ? (
                            <button
                              onClick={() => handlePerformLeakTest(selectedSource)}
                              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded transition text-xs mt-1 shadow"
                            >
                              Conduct swipe leak test
                            </button>
                          ) : (
                            <div className="text-[10px] text-emerald-400 font-semibold text-center border border-emerald-950/60 bg-emerald-950/20 p-1.5 rounded mt-1 flex items-center justify-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Checked & Clear
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* RUA SELECTED DETAILS SIDEBAR PANEL */}
            {unsealedSubTab === 'rua' && selectedRuaId && inventoryCategory === 'unsealed' && (
              <div className="lg:col-span-1">
                {selectedRua ? (
                  <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-5 space-y-4 text-left sticky top-4 shadow-xl">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded uppercase">
                          RUA SYSTEM SPECIFICATIONS
                        </span>
                        <h2 className="text-sm font-extrabold text-slate-100 mt-1 flex items-center gap-1.5">
                          <Shield className="h-4 w-4 text-amber-500" />
                          {selectedRua.spaceID}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Type: {selectedRua.type} Authorization</p>
                      </div>
                      <button 
                        onClick={() => setSelectedRuaId(null)} 
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedRua.type === 'Communal' ? (
                        <>
                          <div className="bg-slate-950/60 p-3 rounded border border-slate-850 text-xs">
                            <span className="text-slate-500 font-medium block mb-1">Assigned Person In-Charge:</span>
                            <span className="font-bold text-slate-200 text-sm flex items-center gap-1">
                              <UserIcon className="h-4 w-4 text-amber-500" />
                              {selectedRua.personInCharge}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Authorized Small Groups (PI-led)</span>
                            {selectedRua.groups?.map((g, idx) => (
                              <div key={g.id || idx} className="bg-slate-950/40 border border-slate-800 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-1.5">
                                  <span className="font-bold text-slate-200 text-xs">{g.piName}</span>
                                  <span className="text-[9px] text-indigo-400 font-semibold uppercase">Group {idx + 1}</span>
                                </div>
                                <div className="text-[11px] leading-normal space-y-1 text-slate-400">
                                  <div>Isotopes: <span className="font-semibold text-amber-400">{g.isotopes.join(', ')}</span></div>
                                  <div className="pt-1.5 mt-1 border-t border-slate-800/40">
                                    <span className="text-[10px] text-slate-500 block mb-1">Authorized User List:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {g.users.map((u, ui) => (
                                        <span key={u.id || ui} className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 px-1.5 py-0.5 rounded">
                                          {u.name} ({u.role})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-slate-950/60 p-3 rounded border border-slate-850 text-xs text-left space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Authorized PI:</span>
                              <span className="font-bold text-slate-200">{selectedRua.piName}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800/40 pt-1.5">
                              <span className="text-slate-500">Isotopes:</span>
                              <span className="font-bold text-amber-400">{selectedRua.isotopes?.join(', ')}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Authorized Users</span>
                            <div className="flex flex-col gap-1">
                              {selectedRua.users?.map((u, ui) => (
                                <div key={u.id || ui} className="bg-slate-950 border border-slate-850 p-2 rounded flex justify-between text-xs">
                                  <span className="font-bold text-slate-300">{u.name}</span>
                                  <span className="text-[10px] text-slate-500">{u.role}</span>
                                </div>
                              ))}
                              {(!selectedRua.users || selectedRua.users.length === 0) && (
                                <span className="text-xs text-slate-500 italic">No users registered</span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

          </div>
        </div>
      )}

      {/* SUB-TAB 2: PERSONNEL DOSIMETRY */}
      {subTab === 'dosimeter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Exposure List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-amber-500" />
                Dose Log Index (Current Period: Q2 2026)
              </h3>
              <button 
                onClick={() => { setIsAddingDose(true); setDoseError(null); }}
                className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Log Dose Reading
              </button>
            </div>

            <div className="space-y-3.5">
              {dosimeterLogs.map((log) => {
                let exposureColor = 'bg-emerald-500';
                let textColor = 'text-emerald-400';
                if (log.status === 'caution') {
                  exposureColor = 'bg-amber-500';
                  textColor = 'text-amber-400';
                } else if (log.status === 'critical') {
                  exposureColor = 'bg-rose-500 animate-pulse';
                  textColor = 'text-rose-400';
                }

                const percentageOfLimit = Math.min((log.exposure / 5.0) * 100, 100);

                return (
                  <div key={log.id} className="p-3.5 bg-slate-800/20 border border-slate-800/80 rounded-xl text-left animate-fade-in">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <span className="font-bold text-slate-200 block text-xs">{log.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-medium block">{log.department} • Period: {log.period}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold block ${textColor}`}>{log.exposure} mSv</span>
                        <span className="text-[9px] text-slate-500 font-semibold block uppercase">Of Safety Threshold (5mSv)</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${exposureColor}`} style={{ width: `${percentageOfLimit}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines & Input Form with Threshold limits */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1 text-left">
            {isAddingDose ? (
              <form onSubmit={handleAddDoseSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Log Exposure</h3>
                  <button type="button" onClick={() => setIsAddingDose(false)} className="text-slate-400 text-xs hover:text-slate-200">Cancel</button>
                </div>

                {doseError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900/40 rounded text-[11px] text-rose-400 leading-relaxed font-semibold">
                    {doseError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Employee Name</label>
                  <input 
                    type="text" 
                    value={doseEmployee}
                    onChange={(e) => setDoseEmployee(e.target.value)}
                    placeholder="e.g. Dr. Frank Reynolds"
                    className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <select 
                    value={doseDept}
                    onChange={(e) => setDoseDept(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Material Testing">Material Testing</option>
                    <option value="Nuclear Medicine">Nuclear Medicine</option>
                    <option value="HSEO Compliance">HSEO Compliance</option>
                  </select>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Log-Only Threshold</span>
                    <span className="text-amber-500 font-mono">{doseThreshold} mSv</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.05" 
                    max="3.0" 
                    step="0.05"
                    value={doseThreshold}
                    onChange={(e) => {
                      setDoseThreshold(Number(e.target.value));
                      setDoseError(null);
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    * Per program mandate, only readings that **exceed** this threshold are written into the dose indexes. Low-risk background noise is automatically filtered out.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Exposure Dose (mSv)</span>
                    <span className="font-mono text-amber-400">{doseVal} mSv</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.01" 
                    max="10.0" 
                    step="0.05"
                    value={doseVal}
                    onChange={(e) => {
                      setDoseVal(Number(e.target.value));
                      setDoseError(null);
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.01 mSv</span>
                    <span>1.0 mSv (Caution)</span>
                    <span>5.0 mSv (Action Limit)</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-lg transition"
                >
                  Save Dosimeter Entry
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-500" />
                  Regulatory Dose Standards
                </h4>
                <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed font-sans">
                  <p>
                    The annual occupational exposure limit is **50 mSv/year**. 
                    However, the Portal enforces an proactive safety intervention threshold of **5.0 mSv/quarter** to enforce maximum safety margins.
                  </p>
                  <div className="border-t border-slate-800 pt-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Normal Zone:</span>
                      <span className="text-emerald-400 font-semibold">&lt; 1.0 mSv</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Caution Zone:</span>
                      <span className="text-amber-400 font-semibold">1.0 - 4.9 mSv</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Critical Zone:</span>
                      <span className="text-rose-400 font-semibold">&ge; 5.0 mSv</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Edit Sealed Source Modal */}
      {editingSealedSource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingSealedSource(null)}>
          <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-100">Edit Sealed Source</h3>
              </div>
              <button onClick={() => setEditingSealedSource(null)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Source Name</label>
                <input type="text" value={editSrcName} onChange={(e) => setEditSrcName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Isotope</label>
                  <input type="text" value={editSrcIsotope} onChange={(e) => setEditSrcIsotope(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Radioactivity</label>
                  <input type="text" value={editSrcActivity} onChange={(e) => setEditSrcActivity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Location</label>
                <input type="text" value={editSrcLocation} onChange={(e) => setEditSrcLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Custodian</label>
                <input type="text" value={editSrcCustodian} onChange={(e) => setEditSrcCustodian(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Activity (Reference)</label>
                  <input type="text" value={editSrcActivityRef} onChange={(e) => setEditSrcActivityRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Reference Date</label>
                  <input type="date" value={editSrcRefDate} onChange={(e) => setEditSrcRefDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditingSealedSource(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition">
                Cancel
              </button>
              <button onClick={handleSaveEditSealedSource}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg transition shadow">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
