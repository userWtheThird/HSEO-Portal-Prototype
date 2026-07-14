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
  IeqSample,
  Equipment,
  ExposureRecord 
} from './types';

export const SIMULATED_USERS: User[] = [
  {
    id: 'user_pi_1',
    name: 'Dr. John Smith',
    email: 'john.smith@hseo-portal.net',
    role: 'PI',
    avatarColor: 'bg-cyan-600 text-white',
    title: 'Principal Investigator'
  },
  {
    id: 'user_ftm_1',
    name: 'WOO Chun Fai',
    email: 'wcf@hseo-portal.net',
    role: 'FTM',
    avatarColor: 'bg-teal-600 text-white',
    title: 'Field Team Member'
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@hseo-portal.net',
    role: 'admin',
    avatarColor: 'bg-emerald-600 text-white',
    title: 'HSE Director & Chief Compliance Officer'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@hseo-portal.net',
    role: 'inspector',
    avatarColor: 'bg-indigo-600 text-white',
    title: 'Principal HSE Auditor'
  },
  {
    id: 'user_elena',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@hseo-portal.net',
    role: 'radiation_officer',
    avatarColor: 'bg-amber-600 text-white',
    title: 'Radiation & Laser Protection Officer'
  },
  {
    id: 'user_james',
    name: 'James Rodriguez',
    email: 'james.rodriguez@hseo-portal.net',
    role: 'operator',
    avatarColor: 'bg-rose-600 text-white',
    title: 'Senior Operations Supervisor'
  },
  {
    id: 'user_nisha',
    name: 'Nisha Patel',
    email: 'nisha.patel@hseo-portal.net',
    role: 'facilities',
    avatarColor: 'bg-cyan-600 text-white',
    title: 'Lead Utilities & Facilities Engineer'
  }
];

// Persons Registry
export const SIMULATED_PERSONS: Person[] = [
  {
    id: 'pers_ftm_1',
    name: 'FTM Person 1',
    role: 'Field Team Member',
    department: 'HSEO',
    assignedDepartments: ['PHYS'],
    email: 'ftm1@hseo-portal.net',
    phone: '+1 (555) 000-0001',
    title: 'Field Team Member 1'
  },
  {
    id: 'pers_ftm_2',
    name: 'FTM Person 2',
    role: 'Field Team Member',
    department: 'HSEO',
    assignedDepartments: ['CHEM'],
    email: 'ftm2@hseo-portal.net',
    phone: '+1 (555) 000-0002',
    title: 'Field Team Member 2'
  },
  {
    id: 'pers_ftm_3',
    name: 'FTM Person 3',
    role: 'Field Team Member',
    department: 'HSEO',
    assignedDepartments: ['OKT'],
    email: 'ftm3@hseo-portal.net',
    phone: '+1 (555) 000-0003',
    title: 'Field Team Member 3'
  },
  {
    id: 'pers_ftm_4',
    name: 'FTM Person 4',
    role: 'Field Team Member',
    department: 'HSEO',
    assignedDepartments: ['LIFS'],
    email: 'ftm4@hseo-portal.net',
    phone: '+1 (555) 000-0004',
    title: 'Field Team Member 4'
  },
  {
    id: 'pers_lifs_1',
    name: 'Marcus YAN',
    role: 'Staff',
    department: 'LIFS',
    email: 'lifs1@hseo-portal.net',
    phone: '+1 (555) 000-0005',
    title: 'STO'
  },
  {
    id: 'pers_lifs_2',
    name: 'Ting XIE',
    role: 'Principal Investigator (PI)',
    department: 'LIFS',
    email: 'lifs2@hseo-portal.net',
    phone: '+1 (555) 000-0006',
    title: 'Professor'
  },
  {
    id: 'pers_lifs_3',
    name: 'Momo WONG',
    role: 'Staff',
    department: 'LIFS',
    email: 'ftm7@hseo-portal.net',
    phone: '+1 (555) 000-0007',
    title: 'TO'
  },
  {
    id: 'pers_phys_1',
    name: 'Laserman TAN',
    role: 'Principal Investigator (PI)',
    department: 'PHYS',
    email: 'phys1@hseo-portal.net',
    phone: '+1 (555) 000-0008',
    title: 'Professor'
  },
  {
    id: 'pers_phys_2',
    name: 'TK Cheung',
    role: 'Staff',
    department: 'PHYS',
    email: 'phys2@hseo-portal.net',
    phone: '+1 (555) 000-0009',
    title: 'Manager'
  },
  {
    id: 'pers_phys_3',
    name: 'Someone LING',
    role: 'Staff',
    department: 'PHYS',
    email: 'phys3@hseo-portal.net',
    phone: '+1 (555) 000-0010',
    title: 'TO'
  },
  {
    id: 'pers_chem_1',
    name: 'Chemist GONG',
    role: 'Staff',
    department: 'CHEM',
    email: 'chem1@hseo-portal.net',
    phone: '+1 (555) 000-0011',
    title: 'TO'
  },
  {
    id: 'pers_sarah',
    name: 'Sarah Jenkins',
    role: 'Principal Investigator (PI)',
    department: 'CHEM',
    email: 'sarah.jenkins@hseo-portal.net',
    phone: '+1 (555) 019-2831',
    title: 'Professor'
  },
  {
    id: 'pers_elena',
    name: 'Elena Rostova',
    role: 'Staff',
    department: 'OKT',
    email: 'elena.rostova@hseo-portal.net',
    phone: '+1 (555) 019-4822',
    title: 'Admin'
  },
  {
    id: 'pers_MJ',
    name: 'MJ Dancer',
    role: 'HSEO Management',
    department: 'OKT',
    email: 'mjj@hseo-portal.net',
    phone: '+1 (555) 019-3841',
    title: 'Senior Manager'
  },
  {
    id: 'pers_james',
    name: 'James Rodriguez',
    role: 'Staff',
    department: 'OKT',
    email: 'james.rodriguez@hseo-portal.net',
    phone: '+1 (555) 019-5833',
    title: 'Senior Operations Supervisor'
  },
  {
    id: 'pers_nisha',
    name: 'Nisha Patel',
    role: 'HSEO Management',
    department: 'HSEO',
    email: 'nisha.patel@hseo-portal.net',
    phone: '+1 (555) 019-6844',
    title: 'Senior Manager'
  },
  {
    id: 'pers_robert',
    name: 'Robert Vance',
    role: 'Staff',
    department: 'PHYS',
    email: 'robert.vance@hseo-portal.net',
    phone: '+1 (555) 019-7811',
    title: 'Research Associate'
  },
  {
    id: 'pers_john',
    name: 'John Thompson',
    role: 'Staff',
    department: 'PHYS',
    email: 'john.thompson@hseo-portal.net',
    phone: '+1 (555) 019-8900',
    title: 'Office Administrator'
  }
];

// Locations Registry
export const INITIAL_BUILDINGS: Building[] = [
  { id: 'bld_1', code: 'UST', name: 'Academic Building' },
  { id: 'bld_2', code: 'CYT', name: 'Cheng Yu Tung Building' },
  { id: 'bld_3', code: 'LSK', name: 'Lee Shau Kee Business Building' },
  { id: 'bld_4', code: 'IB', name: 'Martin Ka Shing Lee Innovation Building' },
  { id: 'bld_5', code: 'CML', name: 'Costal Marine Laboratory' }
];

export const SIMULATED_LOCATIONS: Location[] = [
  {
    id: 'loc_chem_prep',
    building: 'UST',
    roomNumber: '1302',
    spaceID: 'UST1302',
    roomNature: 'Chemical Prep Lab',
    piIds: ['pers_elena'],
    department: 'CHEM',
    piDelegateIds: ['pers_james', 'pers_chem1'],
    status: 'Active'
  },
  {
    id: 'loc_phys_lab',
    building: 'UST',
    roomNumber: '1105',
    spaceID: 'UST1105',
    roomNature: 'Nuclear Physics Lab Storage B',
    piIds: ['pers_phys_1'],
    department: 'Physics',
    piDelegateIds: ['pers_phys_2'],
    status: 'Active'
  },
  {
    id: 'loc_quantum_optics',
    building: 'UST',
    roomNumber: 'B114',
    spaceID: 'USTB114',
    roomNature: 'Quantum Optics Lab B-14',
    piIds: ['pers_elena'],
    department: 'Physics',
    piDelegateIds: ['pers_robert', 'pers_marcus'],
    status: 'Active'
  },
  {
    id: 'loc_ultrafast_laser',
    building: 'UST',
    roomNumber: 'USTB118',
    spaceID: 'USTB118',
    roomNature: 'Ultrafast Laser Lab B-18',
    piIds: ['pers_elena'],
    department: 'Physics',
    piDelegateIds: ['pers_robert'],
    status: 'Inactive/Renovation'
  },
  {
    id: 'loc_boiler_room',
    building: 'LSK',
    roomNumber: 'Basement B-10',
    spaceID: 'LSKBasement B-10',
    roomNature: 'Boiler & Steam Room',
    piIds: ['pers_sarah'],
    department: 'Facilities',
    piDelegateIds: ['pers_james', 'pers_nisha'],
    status: 'Active'
  },
  {
    id: 'loc_cooling_tower',
    building: 'CYT',
    roomNumber: 'Roof Platform',
    spaceID: 'CYTRoof Platform',
    roomNature: 'Main Cooling Tower',
    piIds: ['pers_sarah'],
    department: 'Facilities',
    piDelegateIds: ['pers_nisha'],
    status: 'Active'
  },
  {
    id: 'loc_chem_storage',
    building: 'CML',
    roomNumber: '108',
    spaceID: 'CML108',
    roomNature: 'Chemical Storage Handling Area D',
    piIds: ['pers_sarah'],
    department: 'Chemistry',
    piDelegateIds: ['pers_james'],
    status: 'Active'
  },
  {
    id: 'loc_office_space',
    building: 'UST',
    roomNumber: 'Floor 1 Open Area',
    spaceID: 'USTFloor 1 Open Area',
    roomNature: 'Main Office Floor Open Space',
    piIds: ['pers_john'],
    department: 'Administration',
    piDelegateIds: ['pers_john', 'pers_marcus'],
    status: 'Decommissioned'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-07-12T02:15:00Z',
    userId: 'user_sarah',
    userName: 'Sarah Jenkins',
    userRole: 'admin',
    action: 'Approved Hot Work Permit',
    details: 'Permit #HWP-2026-004 approved for welding in Wing C Mechanical Room.',
    program: 'Hot Work'
  },
  {
    id: 'log_2',
    timestamp: '2026-07-11T16:30:00Z',
    userId: 'user_nisha',
    userName: 'Nisha Patel',
    userRole: 'facilities',
    action: 'Logged Water Quality Measurement',
    details: 'Legionella testing completed at Main Cooling Tower (Negative). Cl2 level optimal.',
    program: 'Water Sanitation'
  },
  {
    id: 'log_3',
    timestamp: '2026-07-11T11:45:00Z',
    userId: 'user_elena',
    userName: 'Dr. Elena Rostova',
    userRole: 'radiation_officer',
    action: 'Conducted Laser Interlock Safety Test',
    details: 'Coherent Verdi laser (LSR-03) interlock system successfully verified.',
    program: 'Laser'
  },
  {
    id: 'log_4',
    timestamp: '2026-07-10T14:20:00Z',
    userId: 'user_marcus',
    userName: 'Marcus Chen',
    userRole: 'inspector',
    action: 'Completed Monthly Site Audit',
    details: 'HSE Monthly Inspection completed for Chemical Prep Lab. Found 2 minor violations.',
    program: 'Inspection'
  },
  {
    id: 'log_5',
    timestamp: '2026-07-10T09:10:00Z',
    userId: 'user_james',
    userName: 'James Rodriguez',
    userRole: 'operator',
    action: 'Submitted Hazardous Waste Pickup Request',
    details: 'Request #HW-2026-042 submitted for 5 gallons of mixed organic solvents.',
    program: 'Hazardous Waste'
  },
  {
    id: 'log_6',
    timestamp: '2026-07-09T15:05:00Z',
    userId: 'user_elena',
    userName: 'Dr. Elena Rostova',
    userRole: 'radiation_officer',
    action: 'Updated Dosimeter Log',
    details: 'Uploaded Q2 2026 dosimeter data. All personnel within ALARA thresholds.',
    program: 'Radiation'
  },
  {
    id: 'log_7',
    timestamp: '2026-07-08T10:30:00Z',
    userId: 'user_nisha',
    userName: 'Nisha Patel',
    userRole: 'facilities',
    action: 'Resolved IEQ Ventilation Complaint',
    details: 'Adjusted damper position in Conference Room 3B to resolve stuffiness and lower CO2.',
    program: 'IEQ'
  }
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp_1',
    title: 'Chemical Prep Lab Monthly Inspection',
    date: '2026-07-10',
    inspectorId: 'user_marcus',
    inspectorName: 'Marcus Chen',
    status: 'completed',
    score: 88,
    findings: [
      {
        id: 'find_1',
        category: 'Chemical Storage',
        description: 'Flammable solvents found stored outside of rated safety cabinet.',
        status: 'open',
        severity: 'high',
        correctiveAction: 'Move solvents to safety cabinet #F-02 immediately.'
      },
      {
        id: 'find_2',
        category: 'Emergency equipment',
        description: 'Eyewash station pathway partially obstructed by equipment cart.',
        status: 'resolved',
        severity: 'medium',
        correctiveAction: 'Relocated equipment cart. Pathway cleared and tested.'
      }
    ],
    locationId: 'loc_chem_prep',
    piId: 'pers_elena'
  },
  {
    id: 'insp_2',
    title: 'Radiation Laboratory Annual Audit',
    date: '2026-07-05',
    inspectorId: 'user_sarah',
    inspectorName: 'Sarah Jenkins',
    status: 'completed',
    score: 96,
    findings: [
      {
        id: 'find_3',
        category: 'Signage',
        description: 'Caution - Radiation Area sign faded at secondary exit door.',
        status: 'resolved',
        severity: 'low',
        correctiveAction: 'Affixed new high-contrast regulatory sign.'
      }
    ],
    locationId: 'loc_phys_lab',
    piId: 'pers_elena'
  },
  {
    id: 'insp_3',
    title: 'Wing B Maintenance Bay Safety Inspection',
    date: '2026-07-15',
    inspectorId: 'user_marcus',
    inspectorName: 'Marcus Chen',
    status: 'pending',
    score: 0,
    findings: [],
    locationId: 'loc_cooling_tower',
    piId: 'pers_sarah'
  },
  {
    id: 'insp_4',
    title: 'Laser Facility Compliance Audit',
    date: '2026-06-20',
    inspectorId: 'user_elena',
    inspectorName: 'Dr. Elena Rostova',
    status: 'completed',
    score: 100,
    findings: [],
    locationId: 'loc_quantum_optics',
    piId: 'pers_elena'
  }
];

export const INITIAL_RADIATION_SOURCES: RadiationSource[] = [
  {
    id: 'rad_1',
    category: 'sealed',
    sourceName: 'Calibration Source Alpha',
    isotope: 'Americium-241',
    activity: '37 kBq',
    location: 'Physics Lab Vault Cabinet A',
    spaceID: 'LSK105',
    lastLeakTest: '2026-05-10',
    nextLeakTest: '2026-11-10',
    status: 'safe',
    custodian: 'Dr. Elena Rostova',
    locationId: 'loc_phys_lab',
    piId: 'pers_elena',
    lastInventoryCheckDate: '2026-07-01',
    activityReference: '37 kBq',
    referenceDate: '2026-01-01',
    checkHistory: ['2026-01-01', '2026-07-01']
  },
  {
    id: 'rad_2',
    category: 'sealed',
    sourceName: 'Industrial Gauge Head Gamma',
    isotope: 'Cesium-137',
    activity: '185 MBq',
    location: 'Material Testing Wing D',
    spaceID: 'UST302',
    lastLeakTest: '2026-01-15',
    nextLeakTest: '2026-07-15',
    status: 'due_test',
    custodian: 'James Rodriguez',
    locationId: 'loc_chem_prep',
    piId: 'pers_sarah',
    lastInventoryCheckDate: '2026-06-15',
    activityReference: '185 MBq',
    referenceDate: '2025-12-15',
    checkHistory: ['2025-12-15', '2026-06-15']
  },
  {
    id: 'rad_3',
    category: 'sealed',
    sourceName: 'Neutron Moderator Rod',
    isotope: 'Californium-252',
    activity: '5.2 MBq',
    location: 'Nuclear Physics Lab Storage B',
    spaceID: 'LSK105',
    lastLeakTest: '2025-12-01',
    nextLeakTest: '2026-06-01',
    status: 'alert',
    custodian: 'Dr. Elena Rostova',
    locationId: 'loc_phys_lab',
    piId: 'pers_elena',
    lastInventoryCheckDate: '2026-05-20',
    activityReference: '5.5 MBq',
    referenceDate: '2025-11-20',
    checkHistory: ['2025-11-20', '2026-05-20']
  },
  {
    id: 'rad_unsealed_1',
    category: 'unsealed',
    sourceName: 'Tritium Aqueous Tracer',
    isotope: 'Tritium (H-3)',
    activity: '250 MBq',
    location: 'Nuclear Medicine Suite',
    spaceID: 'CYT114',
    status: 'safe',
    custodian: 'Dr. Elena Rostova',
    locationId: 'loc_quantum_optics',
    piId: 'pers_elena'
  },
  {
    id: 'rad_apparatus_1',
    category: 'apparatus',
    sourceName: 'Diagnostic X-Ray Unit-A',
    equipmentDescription: 'High-frequency digital diagnostic radiography system',
    licenceNumber: 'RAD-LIC-2026-8842',
    department: 'Physics',
    location: 'LSK Rm 105',
    spaceID: 'LSK105',
    xrayTubeSerialNumbers: 'XRAY-TUBE-9921-A, XRAY-TUBE-9921-B',
    custodian: 'Dr. Elena Rostova',
    licenceExpiryDate: '2026-11-30',
    notificationDate: '2026-07-30', // 4 months prior
    status: 'safe',
    locationId: 'loc_phys_lab',
    piId: 'pers_elena'
  }
];

export const INITIAL_DOSIMETER_LOGS: DosimeterLog[] = [
  {
    id: 'dos_1',
    employeeName: 'Dr. Elena Rostova',
    department: 'Radiation Safety',
    exposure: 0.12,
    period: 'Q2 2026',
    status: 'normal',
    personId: 'pers_elena'
  },
  {
    id: 'dos_2',
    employeeName: 'James Rodriguez',
    department: 'Material Testing',
    exposure: 1.45,
    period: 'Q2 2026',
    status: 'caution',
    personId: 'pers_james'
  },
  {
    id: 'dos_3',
    employeeName: 'Marcus Chen',
    department: 'Audits',
    exposure: 0.01,
    period: 'Q2 2026',
    status: 'normal',
    personId: 'pers_marcus'
  },
  {
    id: 'dos_4',
    employeeName: 'Robert Vance',
    department: 'Physics Lab',
    exposure: 4.85,
    period: 'Q2 2026',
    status: 'critical',
    personId: 'pers_robert'
  }
];

export const INITIAL_LASER_DEVICES: LaserDevice[] = [
  {
    id: 'lsr_1',
    identifier: 'LSR-4220',
    model: 'Coherent Verdi-G5',
    laserClass: 'Class 4',
    wavelength: '532 nm (Green)',
    power: '5 W',
    location: 'Quantum Optics Lab B-14',
    interlockStatus: 'passed',
    trainingStatus: 'all_trained',
    custodian: 'Dr. Elena Rostova',
    locationId: 'loc_quantum_optics',
    piId: 'pers_elena'
  },
  {
    id: 'lsr_2',
    identifier: 'LSR-1104',
    model: 'Spectra-Physics Ti-Sapphire',
    laserClass: 'Class 4',
    wavelength: '800 nm (Infrared)',
    power: '2.5 W',
    location: 'Ultrafast Laser Lab B-18',
    interlockStatus: 'passed',
    trainingStatus: 'all_trained',
    custodian: 'Dr. Elena Rostova',
    locationId: 'loc_ultrafast_laser',
    piId: 'pers_elena'
  },
  {
    id: 'lsr_3',
    identifier: 'LSR-0319',
    model: 'JDSU Helium-Neon',
    laserClass: 'Class 3B',
    wavelength: '632.8 nm (Red)',
    power: '15 mW',
    location: 'Undergrad Optics Lab C-12',
    interlockStatus: 'untested',
    trainingStatus: 'training_needed',
    custodian: 'James Rodriguez',
    locationId: 'loc_chem_prep',
    piId: 'pers_elena'
  }
];

export const INITIAL_HOT_WORK_PERMITS: HotWorkPermit[] = [
  {
    id: 'HWP-2026-003',
    location: 'Wing B Cooling Tower Platform',
    applicantName: 'James Rodriguez',
    applicantId: 'user_james',
    date: '2026-07-10',
    description: 'Grinding and structural pipe repairs on structural water channels.',
    hazardControls: {
      gasTestDone: true,
      fireExtinguisherPresent: true,
      sprinklerProtected: false,
      combustiblesRemoved: true,
      fireWatchAssigned: true
    },
    status: 'completed',
    approvedBy: 'Sarah Jenkins',
    fireWatchName: 'Marcus Chen',
    durationHours: 4,
    createdAt: '2026-07-10T08:00:00Z',
    locationId: 'loc_cooling_tower',
    piId: 'pers_sarah'
  },
  {
    id: 'HWP-2026-004',
    location: 'Wing C Basement Boiler Room',
    applicantName: 'James Rodriguez',
    applicantId: 'user_james',
    date: '2026-07-12',
    description: 'Arc welding on a fractured steam return bypass valve system.',
    hazardControls: {
      gasTestDone: true,
      fireExtinguisherPresent: true,
      sprinklerProtected: true,
      combustiblesRemoved: true,
      fireWatchAssigned: true
    },
    status: 'active',
    approvedBy: 'Sarah Jenkins',
    fireWatchName: 'John Davis (Contractor)',
    durationHours: 8,
    createdAt: '2026-07-12T05:30:00Z',
    locationId: 'loc_boiler_room',
    piId: 'pers_sarah'
  },
  {
    id: 'HWP-2026-005',
    location: 'Loading Bay Exterior Fence',
    applicantName: 'James Rodriguez',
    applicantId: 'user_james',
    date: '2026-07-13',
    description: 'Plasma cutting damaged metal gate hinge poles for lock realignment.',
    hazardControls: {
      gasTestDone: false,
      fireExtinguisherPresent: true,
      sprinklerProtected: false,
      combustiblesRemoved: true,
      fireWatchAssigned: false
    },
    status: 'draft',
    fireWatchName: 'Pending',
    durationHours: 2,
    createdAt: '2026-07-12T03:15:00Z',
    locationId: 'loc_boiler_room',
    piId: 'pers_sarah'
  }
];

export const INITIAL_HAZARDOUS_WASTE: HazardousWasteRequest[] = [
  {
    id: 'HW-2026-041',
    generatorName: 'James Rodriguez',
    generatorId: 'user_james',
    chemicalDescription: 'Isopropanol & Acetone Wash Mixture (90% Solvent, 10% Water)',
    volume: '5 Gallons',
    state: 'liquid',
    category: 'solvent',
    compatibilityCheck: 'passed',
    requestDate: '2026-07-09',
    status: 'disposed',
    manifestNumber: 'EPA-TX-489921',
    locationId: 'loc_chem_prep',
    piId: 'pers_elena'
  },
  {
    id: 'HW-2026-042',
    generatorName: 'James Rodriguez',
    generatorId: 'user_james',
    chemicalDescription: 'Chlorinated Hydrochloric Acid Etch Solution with Trace heavy metals',
    volume: '2 Gallons',
    state: 'liquid',
    category: 'acid',
    compatibilityCheck: 'passed',
    requestDate: '2026-07-10',
    status: 'pending_pickup',
    manifestNumber: 'EPA-TX-490102',
    locationId: 'loc_chem_prep',
    piId: 'pers_elena'
  },
  {
    id: 'HW-2026-043',
    generatorName: 'Dr. Elena Rostova',
    generatorId: 'user_elena',
    chemicalDescription: 'Uranyl Acetate staining agent residue and scintillation vials',
    volume: '1 Liter',
    state: 'solid',
    category: 'radioactive',
    compatibilityCheck: 'warning',
    requestDate: '2026-07-11',
    status: 'in_transit',
    manifestNumber: 'EPA-TX-490334',
    locationId: 'loc_phys_lab',
    piId: 'pers_elena'
  }
];

export const INITIAL_WATER_LOGS: WaterLog[] = [
  {
    id: 'wtr_1',
    samplePoint: 'Main Building Potable Inlet',
    testDate: '2026-07-12',
    testerName: 'Nisha Patel',
    pH: 7.2,
    chlorine: 1.2,
    legionella: 'negative',
    temperature: 18.5,
    status: 'pass',
    locationId: 'loc_office_space'
  },
  {
    id: 'wtr_2',
    samplePoint: 'Wing C Cooling Tower Basin',
    testDate: '2026-07-11',
    testerName: 'Nisha Patel',
    pH: 8.1,
    chlorine: 0.2, // Under chlorinated (target min is 0.5)
    legionella: 'pending',
    temperature: 28.2,
    status: 'action_required',
    locationId: 'loc_cooling_tower'
  },
  {
    id: 'wtr_3',
    samplePoint: 'Chemistry Lab Safety Discharge Line',
    testDate: '2026-07-08',
    testerName: 'Nisha Patel',
    pH: 5.8, // Low pH (acidic, target range is 6.5 - 8.5)
    chlorine: 0.8,
    legionella: 'negative',
    temperature: 21.0,
    status: 'fail',
    locationId: 'loc_chem_prep'
  }
];

export const INITIAL_IEQ_LOGS: IeqLog[] = [
  {
    id: 'ieq_1',
    location: 'Main Office Floor Open Space',
    timestamp: '2026-07-12T03:00:00Z',
    co2: 480, // Optimal (< 600 ppm)
    voc: 120, // Optimal (< 300 ppb)
    temperature: 22.1,
    humidity: 45,
    ventilationStatus: 'optimal',
    locationId: 'loc_office_space',
    piId: 'pers_john'
  },
  {
    id: 'ieq_2',
    location: 'Conference Room 3B (Max Occupancy)',
    timestamp: '2026-07-12T02:30:00Z',
    co2: 950, // Adequate but approaching limit (< 1000 ppm)
    voc: 280,
    temperature: 23.8,
    humidity: 58,
    ventilationStatus: 'adequate',
    locationId: 'loc_office_space',
    piId: 'pers_john'
  },
  {
    id: 'ieq_3',
    location: 'Chemical Storage Handling Area D',
    timestamp: '2026-07-12T01:00:00Z',
    co2: 410,
    voc: 850, // Poor VOC levels! (> 500 ppb is high)
    temperature: 20.5,
    humidity: 38,
    ventilationStatus: 'poor',
    locationId: 'loc_chem_storage',
    piId: 'pers_sarah'
  }
];

export const INITIAL_IEQ_COMPLAINTS: IeqComplaint[] = [
  {
    id: 'comp_1',
    location: 'Wing A Cubicle Suite 4',
    description: 'Extremely dry air causing continuous coughing and headaches. Cold drafts felt during mid-morning.',
    reporterName: 'John Thompson',
    date: '2026-07-09',
    status: 'active',
    assignedAction: 'Increase room humidifier output and balance local ceiling diffusers.',
    locationId: 'loc_office_space',
    piId: 'pers_john'
  },
  {
    id: 'comp_2',
    location: 'Conference Room 3B',
    description: 'Room feels highly stuffy and hot during morning reviews. CO2 levels seem stuffy and make people sleepy.',
    reporterName: 'Sarah Jenkins',
    date: '2026-07-08',
    status: 'resolved',
    assignedAction: 'Adjusted fresh air intake damper in main air handler #AHU-2 to supply higher air volume.',
    locationId: 'loc_office_space',
    piId: 'pers_john'
  }
];

export const CHEMICAL_COMPATIBILITY_MATRIX: Record<string, string[]> = {
  acid: ['base', 'reactive', 'solvent'],
  base: ['acid', 'reactive'],
  solvent: ['acid', 'reactive'],
  radioactive: [],
  reactive: ['acid', 'base', 'solvent', 'toxic', 'radioactive'],
  toxic: ['reactive']
};

// IEQ Sampling Parameters
export const INITIAL_IEQ_PARAMETERS: IeqParameter[] = [
  { id: 'param_radon', name: 'Radon', unit: 'Bq/m\u00B3', safeThreshold: 200, isDefault: true },
  { id: 'param_co2', name: 'CO2', unit: 'ppm', safeThreshold: 1000, isDefault: true },
  { id: 'param_tvoc', name: 'TVOC', unit: 'ppb', safeThreshold: 500, isDefault: true },
  { id: 'param_dust', name: 'Total Dust', unit: 'mg/m\u00B3', safeThreshold: 0.15, isDefault: true },
  { id: 'param_formaldehyde', name: 'Formaldehyde', unit: 'ppm', safeThreshold: 0.08, isDefault: true },
];

// IEQ Sampling Records
export const INITIAL_IEQ_SAMPLES: IeqSample[] = [
  {
    id: 'ieq_sample_1',
    locationId: 'loc_office_space',
    location: 'Main Office Floor Open Space',
    samplingType: 'adhoc',
    date: '2026-07-12',
    testerName: 'Nisha Patel',
    status: 'pass',
    readings: {
      param_radon: 85,
      param_co2: 480,
      param_tvoc: 120,
      param_dust: 0.04,
      param_formaldehyde: 0.02,
    },
    notes: 'Routine quarterly sampling. All parameters within safe limits.'
  },
  {
    id: 'ieq_sample_2',
    locationId: 'loc_quantum_optics',
    location: 'Quantum Optics Lab B-14',
    samplingType: 'renovated',
    date: '2026-07-10',
    testerName: 'Nisha Patel',
    status: 'action_required',
    readings: {
      param_radon: 180,
      param_co2: 620,
      param_tvoc: 480,
      param_dust: 0.09,
      param_formaldehyde: 0.075,
    },
    notes: 'Post-renovation sampling. Formaldehyde approaching threshold; re-test in 2 weeks.'
  },
  {
    id: 'ieq_sample_3',
    locationId: 'loc_chem_storage',
    location: 'Chemical Storage Handling Area D',
    samplingType: 'adhoc',
    date: '2026-07-08',
    testerName: 'Marcus Chen',
    status: 'fail',
    readings: {
      param_radon: 95,
      param_co2: 410,
      param_tvoc: 850,
      param_dust: 0.12,
      param_formaldehyde: 0.03,
    },
    notes: 'TVOC exceeds safe threshold. Ventilation upgrade recommended.'
  },
  {
    id: 'ieq_sample_4',
    locationId: 'loc_chem_prep',
    location: 'Chemical Prep Lab (Room 302)',
    samplingType: 'renovated',
    date: '2026-07-05',
    testerName: 'Nisha Patel',
    status: 'pass',
    readings: {
      param_radon: 110,
      param_co2: 550,
      param_tvoc: 320,
      param_dust: 0.06,
      param_formaldehyde: 0.05,
    },
    notes: 'Post-renovation baseline. All clear for occupancy.'
  },
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq_1',
    name: 'DustTrak DRX 8533',
    category: 'Dust Monitor',
    serialNumber: 'DT8533-2024-001',
    manufacturer: 'TSI Incorporated',
    lastCalibrationDate: '2026-03-15',
    nextCalibrationDate: '2027-03-15',
    status: 'Active',
    assignedLocation: 'UST'
  },
  {
    id: 'eq_2',
    name: 'NoisePro DLX Dosimeter',
    category: 'Noise Dosimeter',
    serialNumber: 'NPD-2025-042',
    manufacturer: '3M',
    lastCalibrationDate: '2026-01-10',
    nextCalibrationDate: '2026-07-10',
    status: 'Calibration Due',
    assignedLocation: ''
  },
  {
    id: 'eq_3',
    name: 'MultiRAE Lite Gas Detector',
    category: 'Gas Detector',
    serialNumber: 'MRL-2024-118',
    manufacturer: 'RAE Systems',
    lastCalibrationDate: '2026-05-20',
    nextCalibrationDate: '2026-11-20',
    status: 'Active',
    assignedLocation: 'LSK'
  },
  {
    id: 'eq_4',
    name: 'MicroNIR OnLine Spectrometer',
    category: 'NIR Sensor',
    serialNumber: 'NIR-OL-2025-007',
    manufacturer: 'VIAVI Solutions',
    lastCalibrationDate: '2026-04-01',
    nextCalibrationDate: '2027-04-01',
    status: 'Active',
    assignedLocation: ''
  },
  {
    id: 'eq_5',
    name: 'MiniVol TAS Air Sampler',
    category: 'Air Sampler',
    serialNumber: 'MV-TAS-2024-033',
    manufacturer: 'Airmetrics',
    lastCalibrationDate: '2025-09-01',
    nextCalibrationDate: '2026-03-01',
    status: 'Out for calibration',
    assignedLocation: ''
  },
  {
    id: 'eq_6',
    name: 'ppbRAE 3000 VOC Meter',
    category: 'Gas Detector',
    serialNumber: 'PPB3K-2025-089',
    manufacturer: 'Honeywell',
    lastCalibrationDate: '2026-06-12',
    nextCalibrationDate: '2026-12-12',
    status: 'Active',
    assignedLocation: 'CYT'
  }
];

export const INITIAL_EXPOSURE_RECORDS: ExposureRecord[] = [
  {
    id: 'exp_1',
    samplingDate: '2026-07-10',
    locationId: 'loc_chem_prep',
    spaceID: 'USTB105',
    parameterType: 'tVOC',
    equipmentId: 'eq_6',
    testerId: 'pers_nisha',
    results: [
      { name: 'tVOC', value: '185', unit: 'ppb' },
      { name: 'Benzene', value: '2.1', unit: 'ppb' }
    ],
    floorPlanRef: 'USTB105-2026Jul10',
    sampledDuration: '8 hours',
    status: 'Compliant',
    followUp: '',
    notes: 'Routine quarterly monitoring. All within limits.'
  },
  {
    id: 'exp_2',
    samplingDate: '2026-07-08',
    locationId: 'loc_chem_storage',
    spaceID: 'CML108',
    parameterType: 'Ammonia',
    equipmentId: 'eq_3',
    testerId: 'pers_nisha',
    results: [
      { name: 'Ammonia (NH3)', value: '38', unit: 'ppm' },
      { name: 'TWA', value: '25', unit: 'ppm' }
    ],
    floorPlanRef: 'CML108-2026Jul08',
    sampledDuration: '4 hours',
    status: 'Exceedance',
    followUp: 'Ventilation upgrade required. Re-test after HVAC modification.',
    notes: 'Ammonia levels above PEL during chemical transfer operation.'
  },
  {
    id: 'exp_3',
    samplingDate: '2026-07-05',
    locationId: 'loc_boiler_room',
    spaceID: 'LSKBasement B-10',
    parameterType: 'Noise',
    equipmentId: 'eq_2',
    testerId: 'pers_james',
    results: [
      { name: 'Leq (8hr)', value: '87', unit: 'dBA' },
      { name: 'Peak', value: '112', unit: 'dBC' }
    ],
    floorPlanRef: 'LSKBasement B-10-2026Jul05',
    sampledDuration: '8 hours',
    status: 'Exceedance',
    followUp: 'Hearing protection mandatory. Engineering controls review scheduled.',
    notes: 'Boiler pump noise exceeds action level.'
  },
  {
    id: 'exp_4',
    samplingDate: '2026-07-02',
    locationId: 'loc_office_space',
    spaceID: 'USTFloor 1 Open Area',
    parameterType: 'PM2.5',
    equipmentId: 'eq_1',
    testerId: 'pers_nisha',
    results: [
      { name: 'PM2.5', value: '12', unit: 'ug/m3' },
      { name: 'PM10', value: '28', unit: 'ug/m3' }
    ],
    floorPlanRef: 'USTFloor 1 Open Area-2026Jul02',
    sampledDuration: '24 hours',
    status: 'Compliant',
    followUp: '',
    notes: 'Annual baseline. Good indoor air quality.'
  }
];
