import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  ClipboardCheck, 
  Radio, 
  Zap, 
  Flame, 
  Trash2, 
  Droplets, 
  Wind, 
  LayoutDashboard,
  LogOut,
  Bell,
  Clock,
  Menu,
  X,
  Database,
  MapPin,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Lock,
  Plane,
  Activity
} from 'lucide-react';

import { 
  User, 
  Person,
  Location,
  Building,
  AuditLog, 
  Inspection, 
  RadiationSource, 
  DosimeterLog, 
  LaserDevice, 
  HotWorkPermit, 
  HazardousWasteRequest, 
  WaterLog, 
  IeqLog, 
  IeqComplaint,
  IeqParameter,
  IeqSample 
} from './types';

import { 
  SIMULATED_USERS, 
  SIMULATED_PERSONS,
  SIMULATED_LOCATIONS,
  INITIAL_BUILDINGS,
  INITIAL_AUDIT_LOGS, 
  INITIAL_INSPECTIONS, 
  INITIAL_RADIATION_SOURCES, 
  INITIAL_DOSIMETER_LOGS, 
  INITIAL_LASER_DEVICES, 
  INITIAL_HOT_WORK_PERMITS, 
  INITIAL_HAZARDOUS_WASTE, 
  INITIAL_WATER_LOGS, 
  INITIAL_IEQ_LOGS, 
  INITIAL_IEQ_COMPLAINTS,
  INITIAL_IEQ_PARAMETERS,
  INITIAL_IEQ_SAMPLES 
} from './mockData';

// Sub-component tabs
import OverviewTab from './components/OverviewTab';
import InspectionTab from './components/InspectionTab';
import RadiationTab from './components/RadiationTab';
import LaserTab from './components/LaserTab';
import HotWorkTab from './components/HotWorkTab';
import WasteTab from './components/WasteTab';
import WaterTab from './components/WaterTab';
import IeqTab from './components/IeqTab';
import LocationTab from './components/LocationTab';
import DirectoryTab from './components/DirectoryTab';
import FtmTab from './components/FtmTab';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Collapsible sidebar sections
  const [databasesOpen, setDatabasesOpen] = useState(true);
  const [safetyOpen, setSafetyOpen] = useState(true);
  const [permitsOpen, setPermitsOpen] = useState(true);
  const [hygieneOpen, setHygieneOpen] = useState(true);

  // States
  const [currentUser, setCurrentUser] = useState<User>(SIMULATED_USERS[0]);
  const [selectedDirectoryPersonId, setSelectedDirectoryPersonId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [radiationSources, setRadiationSources] = useState<RadiationSource[]>([]);
  const [dosimeterLogs, setDosimeterLogs] = useState<DosimeterLog[]>([]);
  const [laserDevices, setLaserDevices] = useState<LaserDevice[]>([]);
  const [permits, setPermits] = useState<HotWorkPermit[]>([]);
  const [wasteRequests, setWasteRequests] = useState<HazardousWasteRequest[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [ieqLogs, setIeqLogs] = useState<IeqLog[]>([]);
  const [ieqComplaints, setIeqComplaints] = useState<IeqComplaint[]>([]);
  const [ieqParameters, setIeqParameters] = useState<IeqParameter[]>([]);
  const [ieqSamples, setIeqSamples] = useState<IeqSample[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Local notifications simulated list
  const [notifications, setNotifications] = useState<string[]>([
    "Cesium-137 calibration source requires a routine leak test.",
    "Draft Hot Work Permit HWP-2026-005 awaits director approval.",
    "Chemical Storage Handling Area D reports poor VOC reading (850 ppb)."
  ]);
  const [showNotificationMenu, setShowNotificationMenu] = useState<boolean>(false);

  // Load and restore state from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('HSEO_PORTAL_STATE_V1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuditLogs(parsed.auditLogs || INITIAL_AUDIT_LOGS);
        setInspections(parsed.inspections || INITIAL_INSPECTIONS);
        setRadiationSources(parsed.radiationSources || INITIAL_RADIATION_SOURCES);
        setDosimeterLogs(parsed.dosimeterLogs || INITIAL_DOSIMETER_LOGS);
        setLaserDevices(parsed.laserDevices || INITIAL_LASER_DEVICES);
        setPermits(parsed.permits || INITIAL_HOT_WORK_PERMITS);
        setWasteRequests(parsed.wasteRequests || INITIAL_HAZARDOUS_WASTE);
        setWaterLogs(parsed.waterLogs || INITIAL_WATER_LOGS);
        setIeqLogs(parsed.ieqLogs || INITIAL_IEQ_LOGS);
        setIeqComplaints(parsed.ieqComplaints || INITIAL_IEQ_COMPLAINTS);
        setIeqParameters(parsed.ieqParameters || INITIAL_IEQ_PARAMETERS);
        setIeqSamples(parsed.ieqSamples || INITIAL_IEQ_SAMPLES);
        setPersons(parsed.persons || SIMULATED_PERSONS);
        // Migrate old contactPersonIds -> piDelegateIds for localStorage data
        const migratedLocations = (parsed.locations || SIMULATED_LOCATIONS).map((loc: any) => ({
          ...loc,
          piDelegateIds: loc.piDelegateIds || loc.contactPersonIds || []
        }));
        setLocations(migratedLocations);
        setBuildings(parsed.buildings || INITIAL_BUILDINGS);
        
        const storedUser = localStorage.getItem('HSEO_PORTAL_CURRENT_USER');
        if (storedUser) {
          const matchedUser = SIMULATED_USERS.find(u => u.id === storedUser);
          if (matchedUser) setCurrentUser(matchedUser);
        }
      } else {
        // First load, populate from initial mock data
        setAuditLogs(INITIAL_AUDIT_LOGS);
        setInspections(INITIAL_INSPECTIONS);
        setRadiationSources(INITIAL_RADIATION_SOURCES);
        setDosimeterLogs(INITIAL_DOSIMETER_LOGS);
        setLaserDevices(INITIAL_LASER_DEVICES);
        setPermits(INITIAL_HOT_WORK_PERMITS);
        setWasteRequests(INITIAL_HAZARDOUS_WASTE);
        setWaterLogs(INITIAL_WATER_LOGS);
        setIeqLogs(INITIAL_IEQ_LOGS);
        setIeqComplaints(INITIAL_IEQ_COMPLAINTS);
        setIeqParameters(INITIAL_IEQ_PARAMETERS);
        setIeqSamples(INITIAL_IEQ_SAMPLES);
        setPersons(SIMULATED_PERSONS);
        setLocations(SIMULATED_LOCATIONS);
        setBuildings(INITIAL_BUILDINGS);
      }
    } catch (e) {
      console.error("Error reading LocalStorage state: ", e);
    }
  }, []);

  // Save changes to localStorage
  const saveState = (updated: Partial<{
    auditLogs: AuditLog[];
    inspections: Inspection[];
    radiationSources: RadiationSource[];
    dosimeterLogs: DosimeterLog[];
    laserDevices: LaserDevice[];
    permits: HotWorkPermit[];
    wasteRequests: HazardousWasteRequest[];
    waterLogs: WaterLog[];
    ieqLogs: IeqLog[];
    ieqComplaints: IeqComplaint[];
    ieqParameters: IeqParameter[];
    ieqSamples: IeqSample[];
    persons: Person[];
    locations: Location[];
    buildings: Building[];
  }>) => {
    try {
      const currentState = {
        auditLogs: updated.auditLogs ?? auditLogs,
        inspections: updated.inspections ?? inspections,
        radiationSources: updated.radiationSources ?? radiationSources,
        dosimeterLogs: updated.dosimeterLogs ?? dosimeterLogs,
        laserDevices: updated.laserDevices ?? laserDevices,
        permits: updated.permits ?? permits,
        wasteRequests: updated.wasteRequests ?? wasteRequests,
        waterLogs: updated.waterLogs ?? waterLogs,
        ieqLogs: updated.ieqLogs ?? ieqLogs,
        ieqComplaints: updated.ieqComplaints ?? ieqComplaints,
        ieqParameters: updated.ieqParameters ?? ieqParameters,
        ieqSamples: updated.ieqSamples ?? ieqSamples,
        persons: updated.persons ?? persons,
        locations: updated.locations ?? locations,
        buildings: updated.buildings ?? buildings
      };
      localStorage.setItem('HSEO_PORTAL_STATE_V1', JSON.stringify(currentState));
    } catch (e) {
      console.error("Error saving state to LocalStorage: ", e);
    }
  };

  const handleUpdatePerson = (updated: Person) => {
    const nextPersons = persons.map(p => p.id === updated.id ? updated : p);
    setPersons(nextPersons);
    saveState({ persons: nextPersons });
  };

  const handleUpdateLocation = (updatedLoc: Location) => {
    const nextLocs = locations.map(l => l.id === updatedLoc.id ? updatedLoc : l);
    setLocations(nextLocs);
    const nextLogs = addAuditLog('Updated Room Configuration', `Modified workspace registry details for ${updatedLoc.building} Room ${updatedLoc.roomNumber} (${updatedLoc.roomNature}).`, 'System');
    saveState({ locations: nextLocs, auditLogs: nextLogs });
  };

  // Directory Handlers
  const handleAddLocation = (newLoc: Location) => {
    const nextLocs = [newLoc, ...locations];
    setLocations(nextLocs);
    const nextLogs = addAuditLog('Registered Lab/Room Configuration', `Registered space ${newLoc.building} Room ${newLoc.roomNumber} (${newLoc.roomNature}) under HSEO management directory.`, 'System');
    saveState({ locations: nextLocs, auditLogs: nextLogs });
  };

  const handleAddPerson = (newPers: Person) => {
    const nextPersons = [...persons, newPers];
    setPersons(nextPersons);
    const nextLogs = addAuditLog('Registered Personnel Directory Record', `Added personnel registry entry for ${newPers.name} (${newPers.role} - ${newPers.department})`, 'System');
    saveState({ persons: nextPersons, auditLogs: nextLogs });
  };

  // Building Handlers
  const handleAddBuilding = (building: Building, logDetails: string) => {
    const next = [...buildings, building];
    setBuildings(next);
    const nextLogs = addAuditLog('Added Building', logDetails, 'System');
    saveState({ buildings: next, auditLogs: nextLogs });
  };

  const handleUpdateBuilding = (updated: Building, logDetails: string) => {
    const next = buildings.map(b => b.id === updated.id ? updated : b);
    setBuildings(next);
    const nextLogs = addAuditLog('Updated Building', logDetails, 'System');
    saveState({ buildings: next, auditLogs: nextLogs });
  };

  const handleDeleteBuilding = (buildingId: string, logDetails: string) => {
    const next = buildings.filter(b => b.id !== buildingId);
    setBuildings(next);
    const nextLogs = addAuditLog('Deleted Building', logDetails, 'System');
    saveState({ buildings: next, auditLogs: nextLogs });
  };

  // Switch Active Sim User
  const handleUserSwitch = (userId: string) => {
    const matched = SIMULATED_USERS.find(u => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('HSEO_PORTAL_CURRENT_USER', matched.id);
      
      // Log switching action in Audit logs
      const logEntry: AuditLog = {
        id: `log_sys_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: matched.id,
        userName: matched.name,
        userRole: matched.role,
        action: 'Switched Active Session',
        details: `${matched.name} is now the active workspace operator.`,
        program: 'System'
      };
      
      const nextLogs = [logEntry, ...auditLogs];
      setAuditLogs(nextLogs);
      saveState({ auditLogs: nextLogs });
    }
  };

  // Helper to append a generic Audit Log entry
  const addAuditLog = (action: string, details: string, program: string, user: User = currentUser): AuditLog[] => {
    const newLog: AuditLog = {
      id: `log_gen_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      program
    };
    const nextLogs = [newLog, ...auditLogs];
    setAuditLogs(nextLogs);
    return nextLogs;
  };

  // Program 1: Inspection handlers
  const handleAddInspection = (newInspection: Inspection, logDetails: string) => {
    const nextInspections = [newInspection, ...inspections];
    setInspections(nextInspections);
    const nextLogs = addAuditLog('Created Inspection Checklist', logDetails, 'Inspection');
    saveState({ inspections: nextInspections, auditLogs: nextLogs });
  };

  const handleUpdateInspection = (updated: Inspection) => {
    const nextInsps = inspections.map(i => i.id === updated.id ? updated : i);
    setInspections(nextInsps);
    const nextLogs = addAuditLog("Updated Inspection", `Updated inspection status/findings for ${updated.title}`, currentUser.name);
    saveState({ inspections: nextInsps, auditLogs: nextLogs });
  };

  const handleUpdateFindings = (inspectionId: string, findingId: string, status: 'open' | 'resolved', correctiveAction?: string) => {
    const nextInspections = inspections.map(i => {
      if (i.id === inspectionId) {
        return {
          ...i,
          findings: i.findings.map(f => {
            if (f.id === findingId) {
              return { ...f, status, correctiveAction };
            }
            return f;
          })
        };
      }
      return i;
    });
    setInspections(nextInspections);
    const findingDesc = inspections.find(i => i.id === inspectionId)?.findings.find(f => f.id === findingId)?.description || '';
    const nextLogs = addAuditLog('Resolved Safety Finding', `Marked finding "${findingDesc}" as RESOLVED. Action: ${correctiveAction}`, 'Inspection');
    saveState({ inspections: nextInspections, auditLogs: nextLogs });
  };

  // Program 2: Radiation handlers
  const handleTriggerLeakTest = (sourceId: string, logDetails: string) => {
    const nextSources = radiationSources.map(s => {
      if (s.id === sourceId) {
        return {
          ...s,
          status: 'safe' as const,
          lastLeakTest: new Date().toISOString().split('T')[0],
          nextLeakTest: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 6 months later
        };
      }
      return s;
    });
    setRadiationSources(nextSources);
    const nextLogs = addAuditLog('Conducted Leak Test Survey', logDetails, 'Radiation');
    saveState({ radiationSources: nextSources, auditLogs: nextLogs });

    // Remove matching warning from notifications if checked
    setNotifications(prev => prev.filter(n => !n.includes("leak test")));
  };

  const handleAddDosimeterLog = (newLog: DosimeterLog, logDetails: string) => {
    const nextDosimeters = [newLog, ...dosimeterLogs];
    setDosimeterLogs(nextDosimeters);
    
    let nextLogs = addAuditLog('Logged Personnel Exposure Dose', logDetails, 'Radiation');
    
    // Auto-alert if critical
    if (newLog.status === 'critical') {
      const alertMsg = `CRITICAL EXPOSURE ALERT: Employee ${newLog.employeeName} exceeded dose threshold at ${newLog.exposure} mSv!`;
      setNotifications(prev => [alertMsg, ...prev]);
    }
    
    saveState({ dosimeterLogs: nextDosimeters, auditLogs: nextLogs });
  };

  const handleAddRadiationSource = (newSource: RadiationSource, logDetails: string) => {
    const nextSources = [newSource, ...radiationSources];
    setRadiationSources(nextSources);
    const nextLogs = addAuditLog('Registered Radioactive Asset', logDetails, 'Radiation');
    saveState({ radiationSources: nextSources, auditLogs: nextLogs });
  };

  const handleUpdateRadiationSource = (updatedSource: RadiationSource, logDetails: string) => {
    const nextSources = radiationSources.map(s => s.id === updatedSource.id ? updatedSource : s);
    setRadiationSources(nextSources);
    const nextLogs = addAuditLog('Updated Radioactive Asset', logDetails, 'Radiation');
    saveState({ radiationSources: nextSources, auditLogs: nextLogs });
  };

  const handleBatchUpdateRadiationSources = (updatedSources: RadiationSource[], logDetails: string) => {
    const updatedIds = new Set(updatedSources.map(s => s.id));
    const nextSources = radiationSources.map(s => updatedIds.has(s.id) ? updatedSources.find(u => u.id === s.id)! : s);
    setRadiationSources(nextSources);
    const nextLogs = addAuditLog('Batch Updated Radioactive Assets', logDetails, 'Radiation');
    saveState({ radiationSources: nextSources, auditLogs: nextLogs });
  };

  // Program 3: Laser handlers
  const handleAddLaserDevice = (newDevice: LaserDevice, logDetails: string) => {
    const nextLasers = [newDevice, ...laserDevices];
    setLaserDevices(nextLasers);
    const nextLogs = addAuditLog('Registered High-Power Laser Device', logDetails, 'Laser');
    saveState({ laserDevices: nextLasers, auditLogs: nextLogs });
  };

  const handleUpdateInterlocks = (deviceId: string, status: 'passed' | 'failed', logDetails: string) => {
    const nextLasers = laserDevices.map(d => {
      if (d.id === deviceId) {
        return { ...d, interlockStatus: status };
      }
      return d;
    });
    setLaserDevices(nextLasers);
    const nextLogs = addAuditLog('Laser Interlock Integrity Test', logDetails, 'Laser');
    saveState({ laserDevices: nextLasers, auditLogs: nextLogs });
  };

  const handleUpdateTrainingStatus = (deviceId: string, status: 'all_trained' | 'training_needed', logDetails: string) => {
    const nextLasers = laserDevices.map(d => {
      if (d.id === deviceId) {
        return { ...d, trainingStatus: status };
      }
      return d;
    });
    setLaserDevices(nextLasers);
    const nextLogs = addAuditLog('Modified Laser Operator Training Log', logDetails, 'Laser');
    saveState({ laserDevices: nextLasers, auditLogs: nextLogs });
  };

  // Program 4: Hot Work handlers
  const handleAddPermit = (newPermit: HotWorkPermit, logDetails: string) => {
    const nextPermits = [newPermit, ...permits];
    setPermits(nextPermits);
    const nextLogs = addAuditLog('Drafted Hot Work Permit Request', logDetails, 'Hot Work');
    saveState({ permits: nextPermits, auditLogs: nextLogs });

    // Append to notification
    setNotifications(prev => [`Draft permit #${newPermit.id} submitted for supervisor sign-off.`, ...prev]);
  };

  const handleApprovePermit = (permitId: string, approvedBy: string, logDetails: string) => {
    const nextPermits = permits.map(p => {
      if (p.id === permitId) {
        return { ...p, status: 'approved' as const, approvedBy };
      }
      return p;
    });
    setPermits(nextPermits);
    const nextLogs = addAuditLog('Authorized Hot Work Permit', logDetails, 'Hot Work');
    saveState({ permits: nextPermits, auditLogs: nextLogs });

    // Remove notification about draft sign-off
    setNotifications(prev => prev.filter(n => !n.includes("awaits director approval")));
  };

  const handleUpdatePermitStatus = (permitId: string, status: 'active' | 'completed' | 'expired', logDetails: string) => {
    const nextPermits = permits.map(p => {
      if (p.id === permitId) {
        return { ...p, status };
      }
      return p;
    });
    setPermits(nextPermits);
    const nextLogs = addAuditLog('Modified Hot Work Permit Status', logDetails, 'Hot Work');
    saveState({ permits: nextPermits, auditLogs: nextLogs });
  };

  // Program 5: Hazardous Waste handlers
  const handleAddWasteRequest = (newRequest: HazardousWasteRequest, logDetails: string) => {
    const nextRequests = [newRequest, ...wasteRequests];
    setWasteRequests(nextRequests);
    const nextLogs = addAuditLog('Created Hazardous Waste Manifest', logDetails, 'Hazardous Waste');
    saveState({ wasteRequests: nextRequests, auditLogs: nextLogs });
  };

  const handleUpdateWasteStatus = (requestId: string, status: 'pending_pickup' | 'in_transit' | 'disposed', logDetails: string) => {
    const nextRequests = wasteRequests.map(r => {
      if (r.id === requestId) {
        return { ...r, status };
      }
      return r;
    });
    setWasteRequests(nextRequests);
    const nextLogs = addAuditLog('Updated Waste Manifest Stage', logDetails, 'Hazardous Waste');
    saveState({ wasteRequests: nextRequests, auditLogs: nextLogs });
  };

  // Program 6: Water Sanitation handlers
  const handleAddWaterLog = (newLog: WaterLog, logDetails: string) => {
    const nextWaterLogs = [newLog, ...waterLogs];
    setWaterLogs(nextWaterLogs);
    let nextLogs = addAuditLog('Logged Water Quality Report', logDetails, 'Water Sanitation');

    // Append notification alert if failed or action required
    if (newLog.status === 'fail') {
      setNotifications(prev => [`CRITICAL: Legionella/pH Failure at ${newLog.samplePoint}! Flush required immediately.`, ...prev]);
    } else if (newLog.status === 'action_required') {
      setNotifications(prev => [`ALERT: Adjust chlorine level at ${newLog.samplePoint}. It is currently under safety index.`, ...prev]);
    }

    saveState({ waterLogs: nextWaterLogs, auditLogs: nextLogs });
  };

  const handleBatchAddWaterLogs = (newLogs: WaterLog[], logDetails: string) => {
    const nextWaterLogs = [...newLogs, ...waterLogs];
    setWaterLogs(nextWaterLogs);
    let nextLogs = addAuditLog('Batch Logged Water Quality Reports', logDetails, 'Water Sanitation');

    // Append notifications for any failed items
    const failedPoints = newLogs.filter(l => l.status === 'fail').map(l => l.samplePoint);
    if (failedPoints.length > 0) {
      setNotifications(prev => [
        `CRITICAL: Legionella/pH Failure at ${failedPoints.join(', ')}! Flush required immediately.`,
        ...prev
      ]);
    }

    saveState({ waterLogs: nextWaterLogs, auditLogs: nextLogs });
  };

  // Program 7: IEQ handlers
  const handleAddIeqSample = (newSample: IeqSample, logDetails: string) => {
    const nextSamples = [newSample, ...ieqSamples];
    setIeqSamples(nextSamples);
    const nextLogs = addAuditLog('Added IEQ Sample', logDetails, 'IEQ');
    saveState({ ieqSamples: nextSamples, auditLogs: nextLogs });
  };

  const handleUpdateIeqSample = (updatedSample: IeqSample, logDetails: string) => {
    const nextSamples = ieqSamples.map(s => s.id === updatedSample.id ? updatedSample : s);
    setIeqSamples(nextSamples);
    const nextLogs = addAuditLog('Updated IEQ Sample', logDetails, 'IEQ');
    saveState({ ieqSamples: nextSamples, auditLogs: nextLogs });
  };

  const handleAddIeqParameter = (newParam: IeqParameter, logDetails: string) => {
    const nextParams = [...ieqParameters, newParam];
    setIeqParameters(nextParams);
    const nextLogs = addAuditLog('Added IEQ Parameter', logDetails, 'IEQ');
    saveState({ ieqParameters: nextParams, auditLogs: nextLogs });
  };

  const handleUpdateIeqParameter = (updatedParam: IeqParameter, logDetails: string) => {
    const nextParams = ieqParameters.map(p => p.id === updatedParam.id ? updatedParam : p);
    setIeqParameters(nextParams);
    const nextLogs = addAuditLog('Updated IEQ Parameter', logDetails, 'IEQ');
    saveState({ ieqParameters: nextParams, auditLogs: nextLogs });
  };

  const handleDeleteIeqParameter = (paramId: string, logDetails: string) => {
    const nextParams = ieqParameters.filter(p => p.id !== paramId);
    setIeqParameters(nextParams);
    const nextLogs = addAuditLog('Deleted IEQ Parameter', logDetails, 'IEQ');
    saveState({ ieqParameters: nextParams, auditLogs: nextLogs });
  };

  const handleUpdateSensorLog = (updatedLog: IeqLog) => {
    const nextLogs = ieqLogs.map(l => {
      if (l.id === updatedLog.id) {
        return updatedLog;
      }
      return l;
    });
    setIeqLogs(nextLogs);
    saveState({ ieqLogs: nextLogs });
  };

  // Reset local state back to initial mock factory settings
  const handleFactoryReset = () => {
    if (window.confirm("Restore HSEO Portal back to clean initial factory compliance simulation states?")) {
      localStorage.removeItem('HSEO_PORTAL_STATE_V1');
      localStorage.removeItem('HSEO_PORTAL_CURRENT_USER');
      
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setInspections(INITIAL_INSPECTIONS);
      setRadiationSources(INITIAL_RADIATION_SOURCES);
      setDosimeterLogs(INITIAL_DOSIMETER_LOGS);
      setLaserDevices(INITIAL_LASER_DEVICES);
      setPermits(INITIAL_HOT_WORK_PERMITS);
      setWasteRequests(INITIAL_HAZARDOUS_WASTE);
      setWaterLogs(INITIAL_WATER_LOGS);
      setIeqLogs(INITIAL_IEQ_LOGS);
      setIeqComplaints(INITIAL_IEQ_COMPLAINTS);
      setPersons(SIMULATED_PERSONS);
      setLocations(SIMULATED_LOCATIONS);
      setCurrentUser(SIMULATED_USERS[0]);
      
      setNotifications([
        "Cesium-137 calibration source requires a routine leak test.",
        "Draft Hot Work Permit HWP-2026-005 awaits director approval.",
        "Chemical Storage Handling Area D reports poor VOC reading (850 ppb)."
      ]);
      
      setActiveTab('overview');
    }
  };

  // Check if system has any outstanding red alerts
  const totalUrgentAlerts = notifications.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow shadow-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 tracking-wide block">HSEO PORTAL</span>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Last Updated: Jul 13, 2026</span>
            </div>
          </div>
          
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          {/* Portal Overview */}
          <button 
            onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Portal Overview</span>
          </button>

          {/* Divider */}
          <div className="border-t border-slate-800 my-2" />

          {/* Databases (collapsible) */}
          <button
            onClick={() => setDatabasesOpen(!databasesOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition"
          >
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Databases</span>
            {databasesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {databasesOpen && (
            <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
              <button 
                onClick={() => { setActiveTab('location'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'location' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span>Locations</span>
              </button>
              <button 
                onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'directory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span>Personnel Directory</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ftm'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'ftm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span>Field Team Assignment</span>
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-800 my-2" />

          {/* Safety Program (collapsible) */}
          <button
            onClick={() => setSafetyOpen(!safetyOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Safety Program</span>
            {safetyOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {safetyOpen && (
            <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
              <button 
                onClick={() => { setActiveTab('inspections'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'inspections' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span>Inspection</span>
              </button>
              <button 
                onClick={() => { setActiveTab('radiation'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'radiation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Radio className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>Radiation</span>
              </button>
              <button 
                onClick={() => { setActiveTab('laser'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'laser' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Zap className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                <span>Laser</span>
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-800 my-2" />

          {/* Permits (collapsible) */}
          <button
            onClick={() => setPermitsOpen(!permitsOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition"
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Permits</span>
            {permitsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {permitsOpen && (
            <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
              <button 
                onClick={() => { setActiveTab('hotwork'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'hotwork' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Flame className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                <span>Hot Work Permits</span>
              </button>
              <button 
                onClick={() => { setActiveTab('cse'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'cse' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Lock className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                <span>Confined Space Entry</span>
              </button>
              <button 
                onClick={() => { setActiveTab('uav'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'uav' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Plane className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                <span>UAV</span>
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-800 my-2" />

          {/* Public Hygiene (collapsible) */}
          <button
            onClick={() => setHygieneOpen(!hygieneOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition"
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">Public Hygiene</span>
            {hygieneOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {hygieneOpen && (
            <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
              <button 
                onClick={() => { setActiveTab('exposure'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'exposure' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Activity className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span>Exposure Monitoring</span>
              </button>
              <button 
                onClick={() => { setActiveTab('water'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'water' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Droplets className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span>Water Sanitation</span>
              </button>
              <button 
                onClick={() => { setActiveTab('ieq'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'ieq' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Wind className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>IEQ</span>
              </button>
            </div>
          )}
        </nav>

        {/* Factory Reset button */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleFactoryReset}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-800/40 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition"
          >
            <Database className="h-3.5 w-3.5" />
            Factory Reset States
          </button>
        </div>
      </aside>

      {/* MOBILE BAR HEADWAY */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-emerald-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-bold text-xs text-slate-100 tracking-wider">HSEO PORTAL</span>
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-400 hover:text-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* PLATFORM TOP-BAR CONTROL HEADER */}
        <header className="bg-slate-900/45 border-b border-slate-800/65 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Active Title */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Local Time: <strong>11:13:11 PDT</strong>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Regulatory Period: FY2026
            </span>
          </div>

          {/* User selector, Notification alert, Settings */}
          <div className="flex items-center gap-4 relative">
            
            {/* Active Simulation Role Selector */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Simulate User Role</span>
                <span className="text-xs font-bold text-indigo-400 block mt-0.5">{currentUser.name}</span>
              </div>
              
              <div className="relative">
                <select 
                  value={currentUser.id}
                  onChange={(e) => handleUserSwitch(e.target.value)}
                  className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer font-semibold appearance-none pr-8"
                >
                  {SIMULATED_USERS.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name.split(' ')[0]} ({user.role.toUpperCase()})
                    </option>
                  ))}
                </select>
                <Users className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Notifications Alert Bell */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 rounded-lg transition relative"
              >
                <Bell className="h-4 w-4" />
                {totalUrgentAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {totalUrgentAlerts}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2.5 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Action Warnings</span>
                    <button onClick={() => setShowNotificationMenu(false)} className="text-[10px] text-slate-500 hover:text-slate-300">Dismiss</button>
                  </div>
                  {notifications.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notifications.map((note, index) => (
                        <div key={index} className="p-2 rounded bg-slate-800/50 border border-slate-800 text-[11px] text-slate-300 leading-normal flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{note}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 py-4 text-center">All regulatory items cleared. Perfect status!</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ACTIVE SUB-TAB VIEW RENDERED */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab 
              currentUser={currentUser}
              auditLogs={auditLogs}
              inspections={inspections}
              permits={permits}
              waterLogs={waterLogs}
              onQuickNavigate={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === 'inspections' && (
            <InspectionTab 
              currentUser={currentUser}
              inspections={inspections}
              locations={locations}
              persons={persons}
              onAddInspection={handleAddInspection}
              onUpdateFindings={handleUpdateFindings}
              onUpdateInspection={handleUpdateInspection}
            />
          )}

          {activeTab === 'radiation' && (
            <RadiationTab 
              currentUser={currentUser}
              radiationSources={radiationSources}
              dosimeterLogs={dosimeterLogs}
              locations={locations}
              persons={persons}
              onTriggerLeakTest={handleTriggerLeakTest}
              onAddDosimeterLog={handleAddDosimeterLog}
              onAddRadiationSource={handleAddRadiationSource}
              onUpdateRadiationSource={handleUpdateRadiationSource}
              onBatchUpdateRadiationSources={handleBatchUpdateRadiationSources}
            />
          )}

          {activeTab === 'laser' && (
            <LaserTab 
              currentUser={currentUser}
              laserDevices={laserDevices}
              onAddLaserDevice={handleAddLaserDevice}
              onUpdateInterlocks={handleUpdateInterlocks}
              onUpdateTrainingStatus={handleUpdateTrainingStatus}
            />
          )}

          {activeTab === 'hotwork' && (
            <HotWorkTab 
              currentUser={currentUser}
              permits={permits}
              onAddPermit={handleAddPermit}
              onApprovePermit={handleApprovePermit}
              onUpdatePermitStatus={handleUpdatePermitStatus}
            />
          )}

          {activeTab === 'waste' && (
            <WasteTab 
              currentUser={currentUser}
              wasteRequests={wasteRequests}
              onAddWasteRequest={handleAddWasteRequest}
              onUpdateWasteStatus={handleUpdateWasteStatus}
            />
          )}

          {activeTab === 'water' && (
            <WaterTab 
              currentUser={currentUser}
              waterLogs={waterLogs}
              locations={locations}
              persons={persons}
              onAddWaterLog={handleAddWaterLog}
              onBatchAddWaterLogs={handleBatchAddWaterLogs}
            />
          )}

          {activeTab === 'ieq' && (
            <IeqTab 
              currentUser={currentUser}
              ieqParameters={ieqParameters}
              ieqSamples={ieqSamples}
              locations={locations}
              persons={persons}
              onAddSample={handleAddIeqSample}
              onUpdateSample={handleUpdateIeqSample}
              onAddParameter={handleAddIeqParameter}
              onUpdateParameter={handleUpdateIeqParameter}
              onDeleteParameter={handleDeleteIeqParameter}
            />
          )}

                    {activeTab === 'location' && (
            <LocationTab 
              currentUser={currentUser}
              locations={locations}
              persons={persons}
              buildings={buildings}
              inspections={inspections}
              radiationSources={radiationSources}
              laserDevices={laserDevices}
              permits={permits}
              wasteRequests={wasteRequests}
              waterLogs={waterLogs}
              ieqLogs={ieqLogs}
              ieqComplaints={ieqComplaints}
              onAddLocation={handleAddLocation}
              onAddPerson={handleAddPerson}
              onUpdateLocation={handleUpdateLocation}
              onAddBuilding={handleAddBuilding}
              onUpdateBuilding={handleUpdateBuilding}
              onDeleteBuilding={handleDeleteBuilding}
              onNavigateToPerson={(personId) => {
                setActiveTab('directory');
                setSelectedDirectoryPersonId(personId);
              }}
            />
          )}

          {activeTab === 'directory' && (
            <DirectoryTab 
              currentUser={currentUser}
              locations={locations}
              persons={persons}
              buildings={buildings}
              inspections={inspections}
              radiationSources={radiationSources}
              laserDevices={laserDevices}
              permits={permits}
              wasteRequests={wasteRequests}
              waterLogs={waterLogs}
              ieqLogs={ieqLogs}
              ieqComplaints={ieqComplaints}
              onAddLocation={handleAddLocation}
              onAddPerson={handleAddPerson}
              onUpdatePerson={handleUpdatePerson}
              externalSelectedPersonId={selectedDirectoryPersonId}
              onClearExternalSelectedPerson={() => setSelectedDirectoryPersonId(null)}
            />
          )}
        
          {activeTab === 'ftm' && (
            <FtmTab 
              persons={persons}
              locations={locations}
              onUpdatePerson={handleUpdatePerson}
            />
          )}

          {activeTab === 'cse' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Lock className="h-12 w-12 text-slate-700 mb-4" />
              <h2 className="text-lg font-bold text-slate-300">Confined Space Entry</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">This module is under development. Confined space entry permits and atmospheric monitoring will be available here.</p>
            </div>
          )}

          {activeTab === 'uav' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Plane className="h-12 w-12 text-slate-700 mb-4" />
              <h2 className="text-lg font-bold text-slate-300">UAV Operations</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">This module is under development. Unmanned aerial vehicle flight logs and authorization permits will be available here.</p>
            </div>
          )}

          {activeTab === 'exposure' && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Activity className="h-12 w-12 text-slate-700 mb-4" />
              <h2 className="text-lg font-bold text-slate-300">Exposure Monitoring</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">This module is under development. Occupational exposure monitoring for chemical, biological, and physical hazards will be available here.</p>
            </div>
          )}
        </div>

      </main>

    </div>
  );
}
