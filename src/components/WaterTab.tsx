import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Activity, 
  Waves,
  ClipboardList,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Settings,
  X,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  TrendingUp,
  Save,
  Grid,
  Check,
  Zap
} from 'lucide-react';
import { 
  User, 
  WaterLog, 
  Location, 
  Person, 
  WaterSamplingPoint, 
  WaterSourceType, 
  WaterSourceParameter, 
  WaterLogParameterValue 
} from '../types';

// Initial preloaded water source types requested by the user
const DEFAULT_WATER_SOURCES: WaterSourceType[] = [
  {
    id: 'src_drinking',
    name: 'Drinking fountain',
    intervalMonths: 3,
    parameters: [
      { name: 'pH', unit: 'pH', reportingLevel: 6.5, referenceLevel: 8.5 },
      { name: 'Residual Chlorine', unit: 'ppm', reportingLevel: 0.2, referenceLevel: 2.0 },
      { name: 'Turbidity', unit: 'NTU', reportingLevel: 0.3, referenceLevel: 1.0 }
    ]
  },
  {
    id: 'src_dental',
    name: 'Dental',
    intervalMonths: 6,
    parameters: [
      { name: 'Bacteria Count', unit: 'CFU/mL', reportingLevel: 100, referenceLevel: 500 },
      { name: 'Residual Chlorine', unit: 'ppm', reportingLevel: 0.1, referenceLevel: 1.5 }
    ]
  },
  {
    id: 'src_other_potable',
    name: 'Other potables source',
    intervalMonths: 6,
    parameters: [
      { name: 'pH', unit: 'pH', reportingLevel: 6.0, referenceLevel: 9.0 },
      { name: 'Residual Chlorine', unit: 'ppm', reportingLevel: 0.2, referenceLevel: 1.5 }
    ]
  },
  {
    id: 'src_swimming',
    name: 'Swimming pool',
    intervalMonths: 1,
    parameters: [
      { name: 'pH', unit: 'pH', reportingLevel: 7.2, referenceLevel: 7.8 },
      { name: 'Free Chlorine', unit: 'ppm', reportingLevel: 1.0, referenceLevel: 3.0 },
      { name: 'Legionella', unit: 'CFU/L', reportingLevel: 10, referenceLevel: 100 }
    ]
  },
  {
    id: 'src_decorative',
    name: 'Decorative fountains',
    intervalMonths: 3,
    parameters: [
      { name: 'Legionella', unit: 'CFU/L', reportingLevel: 50, referenceLevel: 1000 },
      { name: 'Temperature', unit: '°C', reportingLevel: 20.0, referenceLevel: 35.0 }
    ]
  }
];

// Initial preloaded water sampling points directory
const DEFAULT_SAMPLING_POINTS: WaterSamplingPoint[] = [
  {
    id: 'sp_1',
    name: 'Main Lobby Drinking Fountain',
    type: 'Drinking fountain',
    department: 'Facilities Engineering',
    status: 'Active',
    latestSampleDate: '2026-06-15',
    latestStatus: 'Pass'
  },
  {
    id: 'sp_2',
    name: 'Dental Clinic Unit A Tap',
    type: 'Dental',
    department: 'Health Services',
    status: 'Active',
    latestSampleDate: '2026-05-10',
    latestStatus: 'Pass'
  },
  {
    id: 'sp_3',
    name: 'Staff Pantry Sink (Potable)',
    type: 'Other potables source',
    department: 'President\'s Office',
    status: 'Active',
    latestSampleDate: '2026-04-12',
    latestStatus: 'Pass'
  },
  {
    id: 'sp_4',
    name: 'Sports Complex Swimming Pool',
    type: 'Swimming pool',
    department: 'Athletics & Recreation',
    status: 'Active',
    latestSampleDate: '2026-07-01',
    latestStatus: 'Pass'
  },
  {
    id: 'sp_5',
    name: 'Central Plaza Decorative Fountain',
    type: 'Decorative fountains',
    department: 'Landscaping & Grounds',
    status: 'Inactive',
    latestSampleDate: '2026-03-20',
    latestStatus: 'Failed'
  }
];

interface WaterTabProps {
  currentUser: User;
  waterLogs: WaterLog[];
  locations: Location[];
  persons: Person[];
  onAddWaterLog: (log: WaterLog, logDetails: string) => void;
  onBatchAddWaterLogs?: (logs: WaterLog[], logDetails: string) => void;
}

interface BatchRowState {
  pointId: string;
  checked: boolean;
  testDate: string;
  labReportNo: string;
  status: 'Pass' | 'Failed';
  paramValues: Record<string, { tested: boolean; isAbove: boolean; value: string }>;
}

export default function WaterTab({
  currentUser,
  waterLogs,
  locations,
  persons,
  onAddWaterLog,
  onBatchAddWaterLogs
}: WaterTabProps) {
  // Navigation tabs
  const [subTab, setSubTab] = useState<'logs' | 'points' | 'sources'>('logs');

  // Persistence States
  const [samplingPoints, setSamplingPoints] = useState<WaterSamplingPoint[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSourceType[]>([]);

  // Modals / forms visible states
  const [isLoggingResult, setIsLoggingResult] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [editingPoint, setEditingPoint] = useState<WaterSamplingPoint | null>(null);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [editingSource, setEditingSource] = useState<WaterSourceType | null>(null);

  // --- LOG REPORT FORM STATES (SINGLE MODE) ---
  const [logSpId, setLogSpId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logPassFailed, setLogPassFailed] = useState<'Pass' | 'Failed'>('Pass');
  const [logLabReportNo, setLogLabReportNo] = useState('');
  const [logPurpose, setLogPurpose] = useState<'Scheduled' | 'Ad-hoc' | 'Pre-use' | 'Re-test'>('Scheduled');
  // Record structure supporting tested checkbox & above-reporting checkbox and numeric input value
  const [logParamsState, setLogParamsState] = useState<Record<string, { tested: boolean; isAbove: boolean; value: string }>>({});

  // --- BATCH MODE ENTRY STATES ---
  const [batchRows, setBatchRows] = useState<BatchRowState[]>([]);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkLabNo, setBulkLabNo] = useState('');

  // --- SAMPLING POINT FORM STATES ---
  const [pointName, setPointName] = useState('');
  const [pointType, setPointType] = useState('');
  const [pointDept, setPointDept] = useState('');
  const [pointStatus, setPointStatus] = useState<'Active' | 'Inactive'>('Active');

  // --- WATER SOURCE FORM STATES ---
  const [sourceName, setSourceName] = useState('');
  const [sourceInterval, setSourceInterval] = useState<number>(3);
  const [sourceParams, setSourceParams] = useState<WaterSourceParameter[]>([
    { name: 'pH', unit: 'pH', reportingLevel: 6.5, referenceLevel: 8.5 }
  ]);

  // --- SELECTED LOG FOR DETAIL PANEL ---
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // --- SAMPLING PERIOD FILTER ---
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');

  // Compute filtered logs based on selected period
  const filteredLogs = React.useMemo(() => {
    return waterLogs.filter(l => {
      if (filterYear && !l.testDate?.startsWith(filterYear)) return false;
      if (filterMonth && l.testDate?.slice(5, 7) !== filterMonth) return false;
      return true;
    });
  }, [waterLogs, filterYear, filterMonth]);

  // Build display list: latest sampling instance per point, merged with actual logs
  const displayLogs = React.useMemo(() => {
    // For each sampling point, find the latest matching log
    const pointLatestMap = new Map<string, WaterLog>();
    const matchedLogIds = new Set<string>();

    samplingPoints.forEach(point => {
      const logsForPoint = waterLogs
        .filter(l => l.samplePoint === point.name)
        .sort((a, b) => (b.testDate || '').localeCompare(a.testDate || ''));
      if (logsForPoint.length > 0) {
        pointLatestMap.set(point.id, logsForPoint[0]);
        matchedLogIds.add(logsForPoint[0].id);
      }
    });

    // Build merged list: one row per sampling point (latest log or point metadata)
    const merged: WaterLog[] = samplingPoints.map(point => {
      const latestLog = pointLatestMap.get(point.id);
      if (latestLog) return latestLog;
      // Synthetic entry for points with no matching log
      return {
        id: `sp_synthetic_${point.id}`,
        samplePoint: point.name,
        testDate: point.latestSampleDate || '',
        testerName: '',
        pH: 0,
        chlorine: 0,
        legionella: 'pending' as const,
        temperature: 0,
        status: point.latestStatus === 'Failed' ? 'fail' as const : 'pass' as const,
        waterSourceType: point.type,
        passFailed: point.latestStatus || 'Pass',
        _isSynthetic: true
      } as WaterLog & { _isSynthetic: boolean };
    });

    // Also include logs that don't match any sampling point (orphan logs)
    waterLogs.forEach(log => {
      if (!matchedLogIds.has(log.id)) {
        merged.push(log);
      }
    });

    // Apply period filter
    const periodFiltered = merged.filter(l => {
      if (filterYear && !l.testDate?.startsWith(filterYear)) return false;
      if (filterMonth && l.testDate?.slice(5, 7) !== filterMonth) return false;
      return true;
    });

    // Sort by date descending
    return periodFiltered.sort((a, b) => (b.testDate || '').localeCompare(a.testDate || ''));
  }, [samplingPoints, waterLogs, filterYear, filterMonth]);

  // Available years/months derived from actual log data
  const availableYears = React.useMemo(() => 
    Array.from(new Set(waterLogs.map(l => l.testDate?.slice(0, 4)).filter(Boolean))).sort((a, b) => Number(b) - Number(a)),
    [waterLogs]
  );
  const availableMonths = React.useMemo(() => {
    const logs = filterYear ? waterLogs.filter(l => l.testDate?.startsWith(filterYear)) : waterLogs;
    return Array.from(new Set(logs.map(l => l.testDate?.slice(5, 7)).filter(Boolean))).sort();
  }, [waterLogs, filterYear]);

  // Load water configurations on mount
  useEffect(() => {
    try {
      const storedPoints = localStorage.getItem('WATER_SAMPLING_POINTS_V1');
      if (storedPoints) {
        setSamplingPoints(JSON.parse(storedPoints));
      } else {
        setSamplingPoints(DEFAULT_SAMPLING_POINTS);
        localStorage.setItem('WATER_SAMPLING_POINTS_V1', JSON.stringify(DEFAULT_SAMPLING_POINTS));
      }

      const storedSources = localStorage.getItem('WATER_SOURCES_V1');
      if (storedSources) {
        setWaterSources(JSON.parse(storedSources));
      } else {
        setWaterSources(DEFAULT_WATER_SOURCES);
        localStorage.setItem('WATER_SOURCES_V1', JSON.stringify(DEFAULT_WATER_SOURCES));
      }
    } catch (e) {
      console.error("Error reading water state from localStorage", e);
      setSamplingPoints(DEFAULT_SAMPLING_POINTS);
      setWaterSources(DEFAULT_WATER_SOURCES);
    }
  }, []);

  // Sync sampling points and water sources to localStorage when updated
  const savePoints = (updated: WaterSamplingPoint[]) => {
    setSamplingPoints(updated);
    localStorage.setItem('WATER_SAMPLING_POINTS_V1', JSON.stringify(updated));
  };

  const saveSources = (updated: WaterSourceType[]) => {
    setWaterSources(updated);
    localStorage.setItem('WATER_SOURCES_V1', JSON.stringify(updated));
  };

  // Departments for pulldown lists
  const uniqueDepartments = Array.from(new Set([
    ...locations.map(l => l.department),
    ...persons.map(p => p.department),
    'Facilities Engineering', 'Health Services', 'President\'s Office', 'Athletics & Recreation', 'Landscaping & Grounds'
  ])).sort();

  // Helper: calculate next due date based on previous sampling month and water source interval
  const getNextDueDate = (latestSampleDate: string | undefined, typeName: string) => {
    if (!latestSampleDate) return { text: 'Immediate Action Required', isOverdue: true };
    
    const matchedSource = waterSources.find(s => s.name === typeName);
    const intervalMonths = matchedSource ? matchedSource.intervalMonths : 3;

    const baseDate = new Date(latestSampleDate);
    if (isNaN(baseDate.getTime())) return { text: 'Immediate Action Required', isOverdue: true };

    baseDate.setMonth(baseDate.getMonth() + intervalMonths);
    const nextDateStr = baseDate.toISOString().split('T')[0];

    const today = new Date('2026-07-12'); // Fixed system baseline date
    const isOverdue = baseDate < today;

    return { text: nextDateStr, isOverdue };
  };

  // Handle selected sampling point change to load associated parameters
  const handleLogSpChange = (spId: string) => {
    setLogSpId(spId);
    const point = samplingPoints.find(p => p.id === spId);
    if (!point) return;

    const matchedSource = waterSources.find(s => s.name === point.type);
    if (!matchedSource) return;

    // Reset parameters state
    const initialParams: Record<string, { tested: boolean; isAbove: boolean; value: string }> = {};
    matchedSource.parameters.forEach(p => {
      initialParams[p.name] = { tested: true, isAbove: false, value: '' };
    });
    setLogParamsState(initialParams);
  };

  // Initialize Batch Row list
  const initializeBatchMode = () => {
    const activePoints = samplingPoints.filter(p => p.status === 'Active');
    const rows: BatchRowState[] = activePoints.map(point => {
      const matchedSource = waterSources.find(s => s.name === point.type);
      const paramVals: Record<string, { tested: boolean; isAbove: boolean; value: string }> = {};
      
      if (matchedSource) {
        matchedSource.parameters.forEach(p => {
          paramVals[p.name] = { tested: true, isAbove: false, value: '' };
        });
      }

      return {
        pointId: point.id,
        checked: false,
        testDate: bulkDate,
        labReportNo: bulkLabNo,
        status: 'Pass',
        paramValues: paramVals
      };
    });
    setBatchRows(rows);
    setIsBatchMode(true);
    setIsLoggingResult(true);
  };

  // Apply bulk date and report no to all checked batch rows
  const handleApplyBulkValues = () => {
    setBatchRows(prev => prev.map(row => {
      if (!row.checked) return row;
      return {
        ...row,
        testDate: bulkDate,
        labReportNo: bulkLabNo
      };
    }));
  };

  // Mark all selected batch rows as Pass
  const handleBulkPassAll = () => {
    setBatchRows(prev => prev.map(row => {
      if (!row.checked) return row;
      return {
        ...row,
        status: 'Pass'
      };
    }));
  };

  // Submit Single Result Log
  const handleLogResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!logSpId) {
      alert("Please select a sampling point.");
      return;
    }

    const point = samplingPoints.find(p => p.id === logSpId);
    if (!point) return;

    const matchedSource = waterSources.find(s => s.name === point.type);
    if (!matchedSource) return;

    // Collect parameter values (only for chosen/tested parameters)
    const recordedParams: WaterLogParameterValue[] = [];
    matchedSource.parameters.forEach(param => {
      const state = logParamsState[param.name] || { tested: false, isAbove: false, value: '' };
      if (state.tested) {
        recordedParams.push({
          name: param.name,
          unit: param.unit,
          isAboveReporting: state.isAbove,
          value: state.isAbove && state.value !== '' ? Number(state.value) : undefined,
          reportingLevel: param.reportingLevel,
          referenceLevel: param.referenceLevel
        });
      }
    });

    const newLog: WaterLog = {
      id: `wtr_${Date.now()}`,
      samplePoint: point.name,
      waterSourceType: point.type,
      testDate: logDate,
      testerName: currentUser.name,
      pH: 7.2, // Backwards-compatibility
      chlorine: 1.2, // Backwards-compatibility
      legionella: 'negative', // Backwards-compatibility
      temperature: 22.0, // Backwards-compatibility
      status: logPassFailed === 'Pass' ? 'pass' : 'fail',
      passFailed: logPassFailed,
      purpose: logPurpose,
      labReportNo: logLabReportNo || undefined,
      recordedParameters: recordedParams
    };

    // Callback to App.tsx
    onAddWaterLog(newLog, `Logged Water Sanitation report for "${point.name}" with status "${logPassFailed.toUpperCase()}" (Lab No: ${logLabReportNo || 'N/A'}).`);

    // Update the sampling point's latest sample details
    const updatedPoints = samplingPoints.map(sp => {
      if (sp.id === point.id) {
        return {
          ...sp,
          latestSampleDate: logDate,
          latestStatus: logPassFailed
        };
      }
      return sp;
    });
    savePoints(updatedPoints);

    // Reset & close
    setIsLoggingResult(false);
    setLogSpId('');
    setLogLabReportNo('');
  };

  // Submit Batch Logs
  const handleBatchLogsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSelectedRows = batchRows.filter(r => r.checked);
    if (activeSelectedRows.length === 0) {
      alert("Please select at least one sampling point to log results.");
      return;
    }

    const createdLogs: WaterLog[] = [];
    const updatedPoints = [...samplingPoints];

    activeSelectedRows.forEach(row => {
      const point = samplingPoints.find(p => p.id === row.pointId);
      if (!point) return;

      const matchedSource = waterSources.find(s => s.name === point.type);
      const recordedParams: WaterLogParameterValue[] = [];

      if (matchedSource) {
        matchedSource.parameters.forEach(param => {
          const pState = row.paramValues[param.name] || { tested: false, isAbove: false, value: '' };
          if (pState.tested) {
            recordedParams.push({
              name: param.name,
              unit: param.unit,
              isAboveReporting: pState.isAbove,
              value: pState.isAbove && pState.value !== '' ? Number(pState.value) : undefined,
              reportingLevel: param.reportingLevel,
              referenceLevel: param.referenceLevel
            });
          }
        });
      }

      const logEntry: WaterLog = {
        id: `wtr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        samplePoint: point.name,
        waterSourceType: point.type,
        testDate: row.testDate,
        testerName: currentUser.name,
        pH: 7.2,
        chlorine: 1.2,
        legionella: 'negative',
        temperature: 22.0,
        status: row.status === 'Pass' ? 'pass' : 'fail',
        passFailed: row.status,
        labReportNo: row.labReportNo || undefined,
        recordedParameters: recordedParams
      };

      createdLogs.push(logEntry);

      // Update point in our array
      const pIndex = updatedPoints.findIndex(p => p.id === point.id);
      if (pIndex !== -1) {
        updatedPoints[pIndex] = {
          ...updatedPoints[pIndex],
          latestSampleDate: row.testDate,
          latestStatus: row.status
        };
      }
    });

    // Save logs (we can submit them sequentially or via batch callback if provided)
    if (onBatchAddWaterLogs) {
      onBatchAddWaterLogs(createdLogs, `Batch logged ${createdLogs.length} water quality test reports.`);
    } else {
      // Fallback: save individually
      createdLogs.forEach(log => {
        onAddWaterLog(log, `Logged Water Sanitation report for "${log.samplePoint}" in batch entry.`);
      });
    }

    // Save modified points
    savePoints(updatedPoints);

    // Reset & close
    setIsLoggingResult(false);
    setIsBatchMode(false);
    setBatchRows([]);
    alert(`Successfully batch entered results for ${createdLogs.length} sampling points.`);
  };

  // Add Sampling Point
  const handleAddPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointName.trim() || !pointType) {
      alert("Please fill in Name and Water Source Type.");
      return;
    }

    const newPoint: WaterSamplingPoint = {
      id: `sp_${Date.now()}`,
      name: pointName,
      type: pointType,
      department: pointDept || uniqueDepartments[0] || 'Facilities Engineering',
      status: pointStatus,
      latestStatus: undefined,
      latestSampleDate: undefined
    };

    savePoints([newPoint, ...samplingPoints]);
    setIsAddingPoint(false);
    setPointName('');
  };

  // Edit Sampling Point
  const handleEditPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    const updated = samplingPoints.map(sp => {
      if (sp.id === editingPoint.id) {
        return {
          ...sp,
          name: pointName,
          type: pointType,
          department: pointDept,
          status: pointStatus
        };
      }
      return sp;
    });

    savePoints(updated);
    setEditingPoint(null);
    setPointName('');
  };

  // Setup edit point mode
  const startEditPoint = (sp: WaterSamplingPoint) => {
    setEditingPoint(sp);
    setPointName(sp.name);
    setPointType(sp.type);
    setPointDept(sp.department);
    setPointStatus(sp.status);
  };

  // Add or Edit Water Source Type
  const handleAddSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim()) {
      alert("Please provide a water source type name.");
      return;
    }

    if (sourceParams.length === 0) {
      alert("Please add at least one test parameter.");
      return;
    }

    if (editingSource) {
      // Edit mode
      const updated = waterSources.map(src => {
        if (src.id === editingSource.id) {
          return {
            ...src,
            name: sourceName,
            intervalMonths: Number(sourceInterval),
            parameters: sourceParams
          };
        }
        return src;
      });
      saveSources(updated);
      setEditingSource(null);
      alert(`Updated water source type: "${sourceName}"`);
    } else {
      // Add mode
      const newSource: WaterSourceType = {
        id: `src_${Date.now()}`,
        name: sourceName,
        intervalMonths: Number(sourceInterval),
        parameters: sourceParams
      };
      saveSources([...waterSources, newSource]);
      setIsAddingSource(false);
      alert(`Created water source type: "${sourceName}"`);
    }

    // Reset Form
    setSourceName('');
    setSourceInterval(3);
    setSourceParams([{ name: 'pH', unit: 'pH', reportingLevel: 6.5, referenceLevel: 8.5 }]);
  };

  // Setup edit source mode
  const startEditSource = (src: WaterSourceType) => {
    setEditingSource(src);
    setSourceName(src.name);
    setSourceInterval(src.intervalMonths);
    setSourceParams(src.parameters);
    setIsAddingSource(false);
  };

  // Manage source parameters dynamically
  const addParamRow = () => {
    setSourceParams([...sourceParams, { name: '', unit: '', reportingLevel: 0, referenceLevel: 0 }]);
  };

  const removeParamRow = (index: number) => {
    setSourceParams(sourceParams.filter((_, i) => i !== index));
  };

  const updateParamRow = (index: number, field: keyof WaterSourceParameter, value: any) => {
    const updated = sourceParams.map((param, i) => {
      if (i === index) {
        return {
          ...param,
          [field]: field === 'reportingLevel' || field === 'referenceLevel' ? Number(value) : value
        };
      }
      return param;
    });
    setSourceParams(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Navigation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Droplets className="text-cyan-400 animate-pulse h-5.5 w-5.5" />
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">Water Sanitation Program</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Legionella control, drinking water safety, pool biocide tracking, and customized parameter limit triggers.
            </p>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button 
              onClick={() => { setSubTab('logs'); setIsLoggingResult(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'logs' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Assessment Logs
            </button>
            <button 
              onClick={() => { setSubTab('points'); setIsLoggingResult(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'points' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Sampling Points Directory
            </button>
            <button 
              onClick={() => { setSubTab('sources'); setIsLoggingResult(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                subTab === 'sources' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Water Sources Configurator
            </button>
          </div>
        </div>

        {/* Dynamic Context Header Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Active Monitor State</span>
            <span className="text-xs text-slate-300">
              {subTab === 'logs' && `Showing ${waterLogs.length} historical logs & chemical test assessments.`}
              {subTab === 'points' && `Managing ${samplingPoints.length} active/inactive sanitation sampling nodes.`}
              {subTab === 'sources' && `Tracking ${waterSources.length} water source types with compliance benchmarks.`}
            </span>
          </div>
          
          <div className="flex gap-2">
            {subTab === 'logs' && !isLoggingResult && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setIsBatchMode(false);
                    setIsLoggingResult(true);
                    if (samplingPoints.length > 0) {
                      handleLogSpChange(samplingPoints.filter(p => p.status === 'Active')[0]?.id || samplingPoints[0].id);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="h-3.5 w-3.5 text-cyan-400" />
                  Enter Single Sample
                </button>
                <button 
                  onClick={initializeBatchMode}
                  className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-md"
                >
                  <Grid className="h-3.5 w-3.5" />
                  Batch Enter Results
                </button>
              </div>
            )}
            {subTab === 'points' && (
              <button 
                onClick={() => {
                  setPointName('');
                  setPointType(waterSources[0]?.name || '');
                  setPointDept(uniqueDepartments[0] || '');
                  setPointStatus('Active');
                  setEditingPoint(null);
                  setIsAddingPoint(true);
                }}
                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Sampling Point
              </button>
            )}
            {subTab === 'sources' && (
              <button 
                onClick={() => {
                  setEditingSource(null);
                  setSourceName('');
                  setSourceInterval(3);
                  setSourceParams([{ name: 'pH', unit: 'pH', reportingLevel: 6.5, referenceLevel: 8.5 }]);
                  setIsAddingSource(true);
                }}
                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Define Water Source
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- SUB-TAB 1: ASSESSMENT LOGS --- */}
      {subTab === 'logs' && (
        <div className="w-full">
          
          {isLoggingResult ? (
            /* --- ENTER SAMPLE RESULTS PANEL (SINGLE OR BATCH MODE) --- */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    {isBatchMode ? "Batch Enter Water Sample Results" : "Enter Single Water Sample Results"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isBatchMode 
                      ? "Record multiple test outcomes simultaneously. Check points, configure details, and save in bulk." 
                      : "Record values only for parameters exceeding their Reporting Levels."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-slate-950 p-0.5 rounded border border-slate-850 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchMode(false);
                        if (samplingPoints.length > 0) {
                          handleLogSpChange(samplingPoints.filter(p => p.status === 'Active')[0]?.id || samplingPoints[0].id);
                        }
                      }}
                      className={`px-2 py-1 rounded ${!isBatchMode ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-500'}`}
                    >
                      Single Point
                    </button>
                    <button
                      type="button"
                      onClick={initializeBatchMode}
                      className={`px-2 py-1 rounded ${isBatchMode ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-500'}`}
                    >
                      Batch Points
                    </button>
                  </div>
                  <button 
                    onClick={() => { setIsLoggingResult(false); setIsBatchMode(false); }}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!isBatchMode ? (
                /* --- SINGLE POINT ENTRY FORM --- */
                <form onSubmit={handleLogResultSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Water Sampling Point *</label>
                      <select 
                        value={logSpId}
                        onChange={(e) => handleLogSpChange(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
                        required
                      >
                        <option value="">-- Select Active Sampling Point --</option>
                        {samplingPoints.filter(p => p.status === 'Active').map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sampling Date *</label>
                      <input 
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Lab Report No.</label>
                      <input 
                        type="text"
                        value={logLabReportNo}
                        onChange={(e) => setLogLabReportNo(e.target.value)}
                        placeholder="e.g. LAB-2026-9024"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sampling Purpose *</label>
                      <select
                        value={logPurpose}
                        onChange={(e) => setLogPurpose(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
                        required
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Ad-hoc">Ad-hoc</option>
                        <option value="Pre-use">Pre-use</option>
                        <option value="Re-test">Re-test</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Report Outcome (Pass / Failed) *</label>
                      <select 
                        value={logPassFailed}
                        onChange={(e) => setLogPassFailed(e.target.value as any)}
                        className={`w-full border rounded px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer ${
                          logPassFailed === 'Pass' 
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' 
                            : 'bg-rose-950/40 border-rose-800 text-rose-400'
                        }`}
                        required
                      >
                        <option value="Pass" className="bg-slate-950 text-emerald-400">PASS - Sample complies with thresholds</option>
                        <option value="Failed" className="bg-slate-950 text-rose-400">FAILED - Out of compliance</option>
                      </select>
                    </div>
                  </div>

                  {/* CHOOSE PARAMETERS WORKFLOW (SINGLE MODE) */}
                  {logSpId && (
                    <div className="bg-slate-950/60 rounded-lg border border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Tested Chemical & Biological Parameters (Choose which were tested)
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {waterSources.find(s => s.name === (samplingPoints.find(p => p.id === logSpId)?.type))?.parameters.map(param => {
                          const state = logParamsState[param.name] || { tested: true, isAbove: false, value: '' };

                          return (
                            <div key={param.name} className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded border transition ${state.tested ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-950/30 border-slate-900 opacity-50'}`}>
                              <div className="flex items-center gap-3 text-left">
                                <input 
                                  type="checkbox"
                                  checked={state.tested}
                                  onChange={(e) => setLogParamsState({
                                    ...logParamsState,
                                    [param.name]: { ...state, tested: e.target.checked }
                                  })}
                                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 cursor-pointer h-4 w-4"
                                />
                                <div>
                                  <span className="font-semibold text-xs text-slate-200 block">{param.name}</span>
                                  <span className="text-[10px] text-slate-500">
                                    Reporting: &gt; {param.reportingLevel} {param.unit} • Reference: &lt; {param.referenceLevel} {param.unit}
                                  </span>
                                </div>
                              </div>

                              {state.tested && (
                                <div className="flex items-center gap-4 shrink-0">
                                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={state.isAbove}
                                      onChange={(e) => setLogParamsState({
                                        ...logParamsState,
                                        [param.name]: { ...state, isAbove: e.target.checked }
                                      })}
                                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                                    />
                                    <span>Above reporting level?</span>
                                  </label>

                                  {state.isAbove && (
                                    <div className="flex items-center gap-1">
                                      <input 
                                        type="number"
                                        step="0.01"
                                        value={state.value}
                                        placeholder="Value"
                                        onChange={(e) => setLogParamsState({
                                          ...logParamsState,
                                          [param.name]: { ...state, value: e.target.value }
                                        })}
                                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 text-center font-mono focus:border-cyan-500 focus:outline-none"
                                        required
                                      />
                                      <span className="text-[10px] text-slate-500 font-mono">{param.unit}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsLoggingResult(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-1.5 rounded font-bold transition"
                    >
                      Save Single Result
                    </button>
                  </div>
                </form>
              ) : (
                /* --- BATCH ENTRY FORM --- */
                <form onSubmit={handleBatchLogsSubmit} className="space-y-6">
                  {/* Bulk Controls Panel */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-end justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:max-w-xl text-left">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Bulk Date Entry</label>
                        <input 
                          type="date"
                          value={bulkDate}
                          onChange={(e) => setBulkDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Bulk Lab Report No.</label>
                        <input 
                          type="text"
                          value={bulkLabNo}
                          onChange={(e) => setBulkLabNo(e.target.value)}
                          placeholder="LAB-2026-X"
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleApplyBulkValues}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded font-semibold transition"
                      >
                        Apply to Selected Rows
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkPassAll}
                        className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs px-3 py-1.5 rounded font-bold transition"
                      >
                        Pass Selected Rows
                      </button>
                    </div>
                  </div>

                  {/* Batch Nodes Table */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="p-3 w-10 text-center">
                              <input 
                                type="checkbox"
                                checked={batchRows.length > 0 && batchRows.every(r => r.checked)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  setBatchRows(prev => prev.map(r => ({ ...r, checked: isChecked })));
                                }}
                                className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                              />
                            </th>
                            <th className="p-3">Sampling point</th>
                            <th className="p-3 w-40">Date</th>
                            <th className="p-3 w-40">Lab Report No.</th>
                            <th className="p-3 w-32">Status</th>
                            <th className="p-3">Tested parameters & levels</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {batchRows.map((row, rowIndex) => {
                            const point = samplingPoints.find(p => p.id === row.pointId);
                            if (!point) return null;

                            return (
                              <tr key={row.pointId} className={`hover:bg-slate-900/30 transition ${row.checked ? 'bg-cyan-950/5' : 'opacity-60'}`}>
                                <td className="p-3 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={row.checked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setBatchRows(prev => prev.map(r => r.pointId === row.pointId ? { ...r, checked } : r));
                                    }}
                                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                                  />
                                </td>
                                <td className="p-3">
                                  <span className="font-semibold text-slate-200 block">{point.name}</span>
                                  <span className="text-[10px] text-cyan-400 font-mono">{point.type}</span>
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="date"
                                    value={row.testDate}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setBatchRows(prev => prev.map(r => r.pointId === row.pointId ? { ...r, testDate: val } : r));
                                    }}
                                    disabled={!row.checked}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 w-full"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="text"
                                    value={row.labReportNo}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setBatchRows(prev => prev.map(r => r.pointId === row.pointId ? { ...r, labReportNo: val } : r));
                                    }}
                                    placeholder="LAB-XXX"
                                    disabled={!row.checked}
                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 w-full"
                                  />
                                </td>
                                <td className="p-3">
                                  <select 
                                    value={row.status}
                                    onChange={(e) => {
                                      const val = e.target.value as any;
                                      setBatchRows(prev => prev.map(r => r.pointId === row.pointId ? { ...r, status: val } : r));
                                    }}
                                    disabled={!row.checked}
                                    className={`bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-bold focus:outline-none w-full cursor-pointer ${
                                      row.status === 'Pass' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    <option value="Pass">Pass</option>
                                    <option value="Failed">Failed</option>
                                  </select>
                                </td>
                                <td className="p-3 space-y-2">
                                  {/* Parameters choices */}
                                  <div className="flex flex-col gap-1.5 max-w-sm">
                                    {Object.keys(row.paramValues).map(pName => {
                                      const pState = row.paramValues[pName];
                                      return (
                                        <div key={pName} className="flex items-center justify-between gap-2 bg-slate-900/50 p-1.5 rounded border border-slate-800/40">
                                          <label className="flex items-center gap-1.5 text-[10px] text-slate-300 cursor-pointer shrink-0">
                                            <input 
                                              type="checkbox"
                                              checked={pState.tested}
                                              disabled={!row.checked}
                                              onChange={(e) => {
                                                const checked = e.target.checked;
                                                setBatchRows(prev => prev.map(r => {
                                                  if (r.pointId !== row.pointId) return r;
                                                  return {
                                                    ...r,
                                                    paramValues: {
                                                      ...r.paramValues,
                                                      [pName]: { ...pState, tested: checked }
                                                    }
                                                  };
                                                }));
                                              }}
                                              className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                                            />
                                            <span>{pName}</span>
                                          </label>

                                          {pState.tested && (
                                            <div className="flex items-center gap-2 shrink-0">
                                              <label className="flex items-center gap-1 text-[9px] text-slate-400">
                                                <input 
                                                  type="checkbox"
                                                  checked={pState.isAbove}
                                                  disabled={!row.checked}
                                                  onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setBatchRows(prev => prev.map(r => {
                                                      if (r.pointId !== row.pointId) return r;
                                                      return {
                                                        ...r,
                                                        paramValues: {
                                                          ...r.paramValues,
                                                          [pName]: { ...pState, isAbove: checked }
                                                        }
                                                      };
                                                    }));
                                                  }}
                                                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 scale-75"
                                                />
                                                <span>Above Rep?</span>
                                              </label>
                                              {pState.isAbove && (
                                                <input 
                                                  type="number"
                                                  step="0.01"
                                                  value={pState.value}
                                                  placeholder="Val"
                                                  disabled={!row.checked}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setBatchRows(prev => prev.map(r => {
                                                      if (r.pointId !== row.pointId) return r;
                                                      return {
                                                        ...r,
                                                        paramValues: {
                                                          ...r.paramValues,
                                                          [pName]: { ...pState, value: val }
                                                        }
                                                      };
                                                    }));
                                                  }}
                                                  className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-200 text-center font-mono focus:outline-none"
                                                  required
                                                />
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Submission and Action Buttons */}
                  <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsLoggingResult(false); setIsBatchMode(false); }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-2 rounded font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-5 py-2 rounded font-bold transition shadow-lg"
                    >
                      Save Batch Results ({batchRows.filter(r => r.checked).length} selected)
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* --- ASSESSMENT LOGS: MASTER-DETAIL LAYOUT --- */
            <div className="space-y-3">

              {/* Sampling Period Filter Bar */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sampling Period:</span>
                </div>
                <select
                  value={filterYear}
                  onChange={(e) => { setFilterYear(e.target.value); }}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">All Years</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">All Months</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1] || m}</option>
                  ))}
                </select>
                {(filterYear || filterMonth) && (
                  <button
                    onClick={() => { setFilterYear(''); setFilterMonth(''); }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold transition"
                  >
                    Clear Filter
                  </button>
                )}
                <span className="text-[10px] text-slate-500 ml-auto">{displayLogs.length} sampling instances</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* LEFT: Simplified logs table */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3 w-28">Sampling Date</th>
                        <th className="px-4 py-3">Sampling Point</th>
                        <th className="px-4 py-3 w-36">Water Source Type</th>
                        <th className="px-4 py-3 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {displayLogs.length > 0 ? (
                        displayLogs.map((log) => {
                          const isPass = log.passFailed ? log.passFailed === 'Pass' : log.status === 'pass';
                          const isSelected = selectedLogId === log.id;
                          return (
                            <tr
                              key={log.id}
                              onClick={() => setSelectedLogId(log.id)}
                              className={`cursor-pointer transition ${
                                isSelected
                                  ? 'bg-cyan-950/30 border-l-2 border-l-cyan-500'
                                  : 'hover:bg-slate-800/20'
                              }`}
                            >
                              <td className="px-4 py-3 font-mono text-slate-400">{log.testDate}</td>
                              <td className="px-4 py-3 font-semibold text-slate-100">{log.samplePoint}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-cyan-400 font-mono">
                                  {log.waterSourceType || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                                  isPass
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                                    : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                                }`}>
                                  {log.passFailed || (log.status === 'pass' ? 'Pass' : 'Failed')}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                            <Droplets className="h-8 w-8 mx-auto text-slate-700 mb-2 animate-bounce" />
                            <p>No sampling instances found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT: Detail panel for selected log */}
              <div className="lg:col-span-2">
                {selectedLogId ? (() => {
                  const log = displayLogs.find(l => l.id === selectedLogId);
                  if (!log) return <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-xs">Log not found.</div>;
                  const isSynthetic = log.id.startsWith('sp_synthetic_');
                  const isPass = log.passFailed ? log.passFailed === 'Pass' : log.status === 'pass';
                  const isNewLog = !!log.recordedParameters;
                  if (isSynthetic) {
                    // Sampling point with no detailed log record
                    return (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-1.5">
                              <Droplets className="h-4 w-4 text-cyan-400" />
                              Sampling Point
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">No log record</p>
                          </div>
                          <button onClick={() => setSelectedLogId(null)} className="text-slate-500 hover:text-slate-300 p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs uppercase font-bold border ${
                            isPass
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                              : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                          }`}>
                            {log.passFailed || 'N/A'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-bold">Last Sample Date</span>
                            <span className="font-mono text-slate-200">{log.testDate || 'No date'}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 uppercase font-bold">Water Source Type</span>
                            <span className="font-mono text-cyan-400">{log.waterSourceType || 'N/A'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold">Sampling Point</span>
                            <span className="font-semibold text-slate-100">{log.samplePoint}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-3">No detailed parameter data available for this sampling instance.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-4">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-100 tracking-wider flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-cyan-400" />
                            Sample Details
                          </h3>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">ID: {log.id}</p>
                        </div>
                        <button onClick={() => setSelectedLogId(null)} className="text-slate-500 hover:text-slate-300 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs uppercase font-bold border ${
                          isPass
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                            : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                        }`}>
                          {log.passFailed || (log.status === 'pass' ? 'Pass' : 'Failed')}
                        </span>
                        {log.purpose && (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400">
                            {log.purpose}
                          </span>
                        )}
                      </div>

                      {/* Key fields */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Sampling Date</span>
                          <span className="font-mono text-slate-200">{log.testDate}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Water Source Type</span>
                          <span className="font-mono text-cyan-400">{log.waterSourceType || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Sampling Point</span>
                          <span className="font-semibold text-slate-100">{log.samplePoint}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Lab Report No.</span>
                          {log.labReportNo ? (
                            <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-indigo-400">{log.labReportNo}</span>
                          ) : (
                            <span className="text-slate-600 italic">No Report No</span>
                          )}
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 uppercase font-bold">Tester Name</span>
                          <span className="text-slate-200">{log.testerName}</span>
                        </div>
                      </div>

                      {/* Parameters */}
                      <div className="border-t border-slate-800 pt-3">
                        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Tested Parameters</span>
                        {!isNewLog ? (
                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                              <span className="text-slate-500 block text-[9px]">pH</span>
                              <span className="text-slate-200 font-bold">{log.pH}</span>
                            </div>
                            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                              <span className="text-slate-500 block text-[9px]">Chlorine</span>
                              <span className="text-slate-200 font-bold">{log.chlorine} ppm</span>
                            </div>
                            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                              <span className="text-slate-500 block text-[9px]">Legionella</span>
                              <span className="text-slate-200 font-bold">{log.legionella}</span>
                            </div>
                            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
                              <span className="text-slate-500 block text-[9px]">Temperature</span>
                              <span className="text-slate-200 font-bold">{log.temperature}°C</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {log.recordedParameters && log.recordedParameters.length > 0 ? (
                              log.recordedParameters.map(param => (
                                <div
                                  key={param.name}
                                  className={`flex items-center justify-between p-2 rounded border text-xs ${
                                    param.isAboveReporting
                                      ? 'bg-amber-950/30 border-amber-900/30'
                                      : 'bg-slate-950/60 border-slate-800'
                                  }`}
                                >
                                  <span className="font-semibold text-slate-200">{param.name}</span>
                                  <div className="flex items-center gap-2 font-mono">
                                    {param.isAboveReporting ? (
                                      <span className="text-amber-400 font-bold">{param.value} {param.unit}</span>
                                    ) : (
                                      <span className="text-slate-500">&lt; {param.reportingLevel} {param.unit}</span>
                                    )}
                                    <span className="text-[9px] text-slate-600">ref: {param.referenceLevel}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-600 italic text-xs">No parameters recorded</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                    <ClipboardList className="h-8 w-8 mx-auto text-slate-700 mb-2" />
                    <p className="text-xs text-slate-500">Select a sampling record to view details</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}

        </div>
      )}

      {/* --- SUB-TAB 2: SAMPLING POINTS DIRECTORY --- */}
      {subTab === 'points' && (
        <div className="space-y-4">
          
          {/* SAMPLING POINT MODAL / ADD & EDIT FORM PANEL */}
          {(isAddingPoint || editingPoint) && (
            <div className="bg-slate-900 border-2 border-cyan-500/20 rounded-xl p-5 text-left max-w-2xl mx-auto space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  {editingPoint ? `Edit Sampling Point: ${editingPoint.name}` : 'Add New Water Sampling Point'}
                </h3>
                <button 
                  onClick={() => { setIsAddingPoint(false); setEditingPoint(null); }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={editingPoint ? handleEditPointSubmit : handleAddPointSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Sampling Point Name *</label>
                  <input 
                    type="text"
                    value={pointName}
                    placeholder="e.g. Science Wing A 2nd Floor Fountain"
                    onChange={(e) => setPointName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Water Source Type *</label>
                    <select 
                      value={pointType}
                      onChange={(e) => setPointType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Select Water Source Type --</option>
                      {waterSources.map(src => (
                        <option key={src.id} value={src.name}>{src.name} (every {src.intervalMonths} mo.)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                    <select 
                      value={pointDept}
                      onChange={(e) => setPointDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Point Status *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input 
                        type="radio" 
                        name="point_status"
                        checked={pointStatus === 'Active'}
                        onChange={() => setPointStatus('Active')}
                        className="border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                      />
                      <span>Active (In regular service & tested periodically)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input 
                        type="radio" 
                        name="point_status"
                        checked={pointStatus === 'Inactive'}
                        onChange={() => setPointStatus('Inactive')}
                        className="border-slate-800 bg-slate-950 text-rose-500 focus:ring-0"
                      />
                      <span>Inactive (Decommissioned or out of service)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => { setIsAddingPoint(false); setEditingPoint(null); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-1.5 rounded font-bold transition"
                  >
                    {editingPoint ? 'Save Changes' : 'Register Sampling Point'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MAIN DIRECTORY TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="px-5 py-3.5">Point Name</th>
                    <th className="px-5 py-3.5">Water Source Type</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Latest Test Date</th>
                    <th className="px-5 py-3.5">Next Due Date</th>
                    <th className="px-5 py-3.5">Latest Status</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {samplingPoints.map(sp => {
                    const dueObj = getNextDueDate(sp.latestSampleDate, sp.type);
                    const isInactive = sp.status === 'Inactive';

                    return (
                      <tr key={sp.id} className="hover:bg-slate-800/20 text-slate-300 transition">
                        <td className="px-5 py-4 font-bold text-slate-100">{sp.name}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800/80 rounded px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 font-mono">
                            {sp.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{sp.department}</td>
                        <td className="px-5 py-4 font-mono text-slate-400">{sp.latestSampleDate || 'Not Sampled'}</td>
                        <td className="px-5 py-4 font-mono">
                          {isInactive ? (
                            <span className="text-slate-500 italic">Testing Suspended</span>
                          ) : (
                            <span className={dueObj.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {dueObj.text}
                              {dueObj.isOverdue && (
                                <span className="block text-[8px] bg-rose-950/40 text-rose-400 border border-rose-900/20 rounded font-bold uppercase px-1 py-0.2 w-max mt-1">
                                  OVERDUE
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-bold">
                          {sp.latestStatus ? (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] uppercase ${
                              sp.latestStatus === 'Pass' 
                                ? 'bg-emerald-950/40 text-emerald-400' 
                                : 'bg-rose-950/40 text-rose-400'
                            }`}>
                              {sp.latestStatus}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sp.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-900/30' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-900/30'
                          }`}>
                            {sp.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => startEditPoint(sp)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition"
                            title="Edit point"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 3: WATER SOURCES CONFIGURATOR --- */}
      {subTab === 'sources' && (
        <div className="space-y-4">
          
          {/* DEFINE / EDIT WATER SOURCE MODAL / FORM PANEL */}
          {(isAddingSource || editingSource) && (
            <div className="bg-slate-900 border-2 border-cyan-500/20 rounded-xl p-5 text-left max-w-3xl mx-auto space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  {editingSource ? `Edit Water Source: ${editingSource.name}` : 'Define New Water Source & Tested Levels'}
                </h3>
                <button 
                  onClick={() => { setIsAddingSource(false); setEditingSource(null); }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddSourceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Water Source Name *</label>
                    <input 
                      type="text"
                      value={sourceName}
                      placeholder="e.g. Reverse Osmosis Dialysis Feed, Distilled Basin"
                      onChange={(e) => setSourceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Testing Interval (Months) *</label>
                    <input 
                      type="number"
                      min="1"
                      max="36"
                      value={sourceInterval}
                      onChange={(e) => setSourceInterval(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* PARAMETERS CONFIGURATOR LIST */}
                <div className="bg-slate-950/60 rounded-lg border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Tested Chemical & Bio Parameters & Limits (Reporting vs Reference Levels)
                    </span>
                    <button
                      type="button"
                      onClick={addParamRow}
                      className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded transition"
                    >
                      <Plus className="h-3 w-3" />
                      Add Parameter Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sourceParams.map((param, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end bg-slate-900/40 p-2.5 rounded border border-slate-800/60">
                        <div className="md:col-span-4 text-left">
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Parameter Name</label>
                          <input 
                            type="text"
                            value={param.name}
                            placeholder="e.g. pH, Legionella, Lead"
                            onChange={(e) => updateParamRow(index, 'name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="md:col-span-2 text-left">
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Unit</label>
                          <input 
                            type="text"
                            value={param.unit}
                            placeholder="e.g. ppm, cfu/L"
                            onChange={(e) => updateParamRow(index, 'unit', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                            required
                          />
                        </div>

                        <div className="md:col-span-2 text-left">
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Reporting Level</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={param.reportingLevel}
                            placeholder="0.2"
                            onChange={(e) => updateParamRow(index, 'reportingLevel', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-mono"
                            required
                          />
                        </div>

                        <div className="md:col-span-3 text-left">
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">Reference Level</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={param.referenceLevel}
                            placeholder="1.5"
                            onChange={(e) => updateParamRow(index, 'referenceLevel', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none font-mono"
                            required
                          />
                        </div>

                        <div className="md:col-span-1 text-center pb-0.5">
                          {sourceParams.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParamRow(index)}
                              className="p-1.5 hover:bg-slate-800 text-rose-400 rounded transition"
                              title="Remove parameter"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => { setIsAddingSource(false); setEditingSource(null); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-1.5 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-1.5 rounded font-bold transition"
                  >
                    {editingSource ? 'Update Water Source Type' : 'Save Water Source Type'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LIST OF WATER SOURCES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waterSources.map(src => (
              <div key={src.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1">
                        <Waves className="h-4 w-4 text-cyan-400 shrink-0" />
                        {src.name}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        ID: {src.id}
                      </span>
                    </div>
                    <span className="bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      Every {src.intervalMonths} mo.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tested Parameters Limits:</span>
                    <div className="space-y-1.5">
                      {src.parameters.map(p => (
                        <div key={p.name} className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-950/40 border border-slate-850">
                          <span className="text-slate-300 font-medium">{p.name}</span>
                          <div className="flex gap-2 font-mono text-[10px]">
                            <span className="text-slate-500">
                              Rep: <strong className="text-slate-400">{p.reportingLevel}{p.unit !== 'pH' ? ` ${p.unit}` : ''}</strong>
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-500">
                              Ref: <strong className="text-cyan-400 font-bold">{p.referenceLevel}{p.unit !== 'pH' ? ` ${p.unit}` : ''}</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/40 flex justify-end">
                  <button
                    onClick={() => startEditSource(src)}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 hover:text-cyan-400 text-slate-300 text-xs px-2.5 py-1 rounded transition font-semibold"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Config
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
