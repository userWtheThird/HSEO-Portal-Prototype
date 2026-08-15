// Ionizing Radiation Safety Program — seed data (same records as the standalone HTML app)

import type {
  RadiationSource, IrpRua, DoseReading, DoseRosterEntry, WasteContainer, BoardDocument
} from '../../types';

export interface IrpLocation {
  id: string; building: string; roomNumber: string; spaceID: string; department: string;
}
export interface IrpPerson {
  id: string; name: string; title: string; role: 'PI' | 'Staff' | 'Student' | 'Officer'; department: string;
}

export const SEED_LOCATIONS: IrpLocation[] = [
  { id: 'loc1', building: 'LSK', roomNumber: '105', spaceID: 'LSK105', department: 'Physics' },
  { id: 'loc2', building: 'LSK', roomNumber: 'G023', spaceID: 'LSKG023', department: 'Physics' },
  { id: 'loc3', building: 'UST', roomNumber: '302', spaceID: 'UST302', department: 'Chemistry' },
  { id: 'loc4', building: 'UST', roomNumber: '415', spaceID: 'UST415', department: 'Chemistry' },
  { id: 'loc5', building: 'CYT', roomNumber: '201', spaceID: 'CYT201', department: 'Biology' },
  { id: 'loc6', building: 'CYT', roomNumber: 'B18', spaceID: 'CYTB18', department: 'Biology' },
  { id: 'loc7', building: 'MTR', roomNumber: '012', spaceID: 'MTR012', department: 'Materials' },
  { id: 'loc8', building: 'MED', roomNumber: 'G05', spaceID: 'MEDG05', department: 'Nuclear Medicine' },
  { id: 'loc9', building: 'LSK', roomNumber: '218', spaceID: 'LSK218', department: 'Physics' },
  { id: 'loc10', building: 'ENV', roomNumber: '309', spaceID: 'ENV309', department: 'Civil Engineering' }
];

export const SEED_PERSONS: IrpPerson[] = [
  { id: 'p1', name: 'Dr. Elena Rostova', title: 'Professor', role: 'PI', department: 'Physics' },
  { id: 'p2', name: 'Dr. Wei Zhang', title: 'Associate Professor', role: 'PI', department: 'Chemistry' },
  { id: 'p3', name: 'Dr. Mary Osei', title: 'Assistant Professor', role: 'PI', department: 'Biology' },
  { id: 'p4', name: 'Dr. Karl Berg', title: 'Professor', role: 'PI', department: 'Materials' },
  { id: 'p5', name: 'Dr. Lucia Ferrer', title: 'Associate Professor', role: 'PI', department: 'Nuclear Medicine' },
  { id: 'p6', name: 'James Ho', title: 'Lab Manager', role: 'Staff', department: 'Physics' },
  { id: 'p7', name: 'Sarah Lim', title: 'Research Assistant', role: 'Staff', department: 'Chemistry' },
  { id: 'p8', name: 'David Park', title: 'Technician', role: 'Staff', department: 'Biology' },
  { id: 'p9', name: 'Alice Wong', title: 'PhD Student', role: 'Student', department: 'Physics' },
  { id: 'p10', name: 'Brian Tan', title: 'PhD Student', role: 'Student', department: 'Chemistry' },
  { id: 'p11', name: 'Chloe Ng', title: 'MPhil Student', role: 'Student', department: 'Biology' },
  { id: 'p12', name: 'Ethan Lee', title: 'PhD Student', role: 'Student', department: 'Materials' },
  { id: 'p13', name: 'Marcus Chen', title: 'Radiation Safety Officer', role: 'Officer', department: 'HSEO' }
];

export const SEED_SOURCES: RadiationSource[] = [
  { id: 'rad1', category: 'sealed', sourceName: 'Co-60 Calibration Source', isotope: 'Co-60', activity: '3.7 GBq', location: 'LSK105', spaceID: 'LSK105', lastLeakTest: '2026-05-20', nextLeakTest: '2026-11-16', status: 'safe', custodian: 'Dr. Elena Rostova', lastInventoryCheckDate: '2026-03-15', activityReference: '3.7 GBq', referenceDate: '2025-01-01', checkHistory: ['2026-03-15 — Verified by Marcus Chen', '2025-03-10 — Verified by Marcus Chen'], licenceNumber: 'IR-2024-0117', licenceFile: 'licence_IR-2024-0117.pdf', department: 'Physics', licenceHistory: [{ id: 'lh1', licenceNumber: 'IR-2024-0117', changedDate: '2024-06-01', changedBy: 'Marcus Chen', fileName: 'licence_IR-2024-0117.pdf', notes: 'Annual renewal' }, { id: 'lh2', licenceNumber: 'IR-2023-0092', changedDate: '2023-05-28', changedBy: 'Marcus Chen', fileName: 'licence_IR-2023-0092.pdf', notes: 'Initial licence' }] },
  { id: 'rad2', category: 'sealed', sourceName: 'Cs-137 Irradiator', isotope: 'Cs-137', activity: '7.4 GBq', location: 'LSKG023', spaceID: 'LSKG023', lastLeakTest: '2026-01-10', nextLeakTest: '2026-07-09', status: 'due_test', custodian: 'Dr. Elena Rostova', lastInventoryCheckDate: '2026-06-20', activityReference: '7.4 GBq', referenceDate: '2024-11-15', checkHistory: ['2026-06-20 — Verified by Marcus Chen'], licenceNumber: 'IR-2024-0143', department: 'Physics', licenceHistory: [{ id: 'lh3', licenceNumber: 'IR-2024-0143', changedDate: '2024-09-12', changedBy: 'Marcus Chen', fileName: 'licence_IR-2024-0143.pdf', notes: 'New irradiator registration' }] },
  { id: 'rad3', category: 'sealed', sourceName: 'Am-241 Smoke Detector Test Source', isotope: 'Am-241', activity: '37 MBq', location: 'ENV309', spaceID: 'ENV309', lastLeakTest: '2025-11-02', nextLeakTest: '2026-05-01', status: 'alert', custodian: 'Dr. Elena Rostova', lastInventoryCheckDate: '2025-01-08', activityReference: '37 MBq', referenceDate: '2024-06-01', checkHistory: ['2025-01-08 — Verified by Marcus Chen'], licenceNumber: 'IR-2023-0076', department: 'Civil Engineering', licenceHistory: [{ id: 'lh4', licenceNumber: 'IR-2023-0076', changedDate: '2023-02-14', changedBy: 'Marcus Chen', notes: 'Transferred from old lab' }] },
  { id: 'rad4', category: 'sealed', sourceName: 'Cf-252 Neutron Source', isotope: 'Other', activity: '185 MBq', location: 'MEDG05', spaceID: 'MEDG05', lastLeakTest: '2026-06-30', nextLeakTest: '2026-12-27', status: 'safe', custodian: 'Dr. Lucia Ferrer', lastInventoryCheckDate: '2026-07-02', activityReference: '185 MBq', referenceDate: '2026-01-20', checkHistory: ['2026-07-02 — Verified by Dr. Lucia Ferrer'], licenceNumber: 'IR-2025-0201', licenceFile: 'licence_IR-2025-0201.pdf', department: 'Nuclear Medicine', licenceHistory: [{ id: 'lh5', licenceNumber: 'IR-2025-0201', changedDate: '2025-11-03', changedBy: 'Marcus Chen', fileName: 'licence_IR-2025-0201.pdf', notes: 'New acquisition' }] },
  { id: 'rad16', category: 'sealed', sourceName: 'Na-22 PET Calibration Source', isotope: 'Na-22', activity: '3.7 MBq', location: 'MEDG05', spaceID: 'MEDG05', lastLeakTest: '2026-06-05', nextLeakTest: '2027-06-05', status: 'safe', custodian: 'Dr. Lucia Ferrer', lastInventoryCheckDate: '2026-06-05', activityReference: '3.7 MBq', referenceDate: '2026-01-15', checkHistory: ['2026-06-05 — Verified by Marcus Chen'], department: 'Nuclear Medicine', licenceHistory: [] },
  { id: 'rad17', category: 'sealed', sourceName: 'Ge-68/Ga-68 Transmission Line Source', isotope: 'Ge-68', activity: '200 MBq', location: 'MEDG05', spaceID: 'MEDG05', lastLeakTest: '2026-05-20', nextLeakTest: '2027-05-20', status: 'safe', custodian: 'Dr. Lucia Ferrer', lastInventoryCheckDate: '2026-05-20', activityReference: '200 MBq', referenceDate: '2026-03-01', checkHistory: ['2026-05-20 — Verified by Marcus Chen'], department: 'Nuclear Medicine', licenceHistory: [] },
  { id: 'rad5', category: 'unsealed', sourceName: 'H-3 Thymidine Stock', isotope: 'H-3', activity: '1.85 GBq', location: 'CYT201', spaceID: 'CYT201', status: 'safe', custodian: 'Dr. Mary Osei', department: 'Biology', acquiredDate: '2026-07-02', purchasedBy: 'Dr. Mary Osei', vendorName: 'PerkinElmer', volume: '5 mL', usageLog: [{ id: 'ul1', date: '2026-07-18', volume: '0.5 mL', activityUCi: 5000, by: 'David Park', notes: 'Cell-proliferation assay batch 3' }] },
  { id: 'rad6', category: 'unsealed', sourceName: 'C-14 Glucose Tracer', isotope: 'C-14', activity: '370 MBq', location: 'UST302', spaceID: 'UST302', status: 'safe', custodian: 'Dr. Wei Zhang', department: 'Chemistry', acquiredDate: '2026-04-18', purchasedBy: 'Dr. Wei Zhang', vendorName: 'American Radiolabeled Chemicals', volume: '2 mL', usageLog: [{ id: 'ul2', date: '2026-05-22', volume: '0.3 mL', activityUCi: 1500, by: 'Sarah Lim', notes: 'Glucose metabolic tracing' }, { id: 'ul3', date: '2026-07-29', volume: '0.2 mL', activityUCi: 1000, by: 'Brian Tan', notes: 'Tracer validation run' }] },
  { id: 'rad7', category: 'unsealed', sourceName: 'P-32 ATP Labeling Kit', isotope: 'P-32', activity: '370 MBq', location: 'CYTB18', spaceID: 'CYTB18', status: 'alert', custodian: 'Dr. Mary Osei', department: 'Biology', acquiredDate: '2026-07-21', purchasedBy: 'Dr. Mary Osei', vendorName: 'PerkinElmer', volume: '1 mL', usageLog: [] },
  { id: 'rad8', category: 'unsealed', sourceName: 'S-35 Methionine', isotope: 'S-35', activity: '740 MBq', location: 'UST415', spaceID: 'UST415', status: 'safe', custodian: 'Dr. Wei Zhang', department: 'Chemistry', acquiredDate: '2026-05-06', purchasedBy: 'Dr. Wei Zhang', vendorName: 'Hartmann Analytic', volume: '2.5 mL', usageLog: [{ id: 'ul4', date: '2026-06-10', volume: '0.4 mL', activityUCi: 3200, by: 'Sarah Lim', notes: 'Methionine pulse-labeling' }] },
  { id: 'rad12', category: 'unsealed', sourceName: 'U-238 Uranyl Nitrate Standard', isotope: 'U-238', activity: '74 kBq', location: 'ENV309', spaceID: 'ENV309', status: 'safe', custodian: 'Dr. Elena Rostova', department: 'Civil Engineering', acquiredDate: '2026-02-11', purchasedBy: 'Dr. Elena Rostova', vendorName: 'Sigma-Aldrich', volume: '10 mL', usageLog: [] },
  { id: 'rad13', category: 'unsealed', sourceName: 'F-18 FDG Production Aliquot', isotope: 'F-18', activity: '2.0 GBq', location: 'MEDG05', spaceID: 'MEDG05', status: 'safe', custodian: 'Dr. Lucia Ferrer', department: 'Nuclear Medicine', acquiredDate: '2026-08-11', purchasedBy: 'Dr. Lucia Ferrer', vendorName: 'HK PET Imaging Centre', volume: '0.8 mL', usageLog: [] },
  { id: 'rad14', category: 'unsealed', sourceName: 'Ga-68 Chloride Eluate', isotope: 'Ga-68', activity: '1.5 GBq', location: 'MEDG05', spaceID: 'MEDG05', status: 'safe', custodian: 'Dr. Lucia Ferrer', department: 'Nuclear Medicine', acquiredDate: '2026-08-13', purchasedBy: 'Dr. Lucia Ferrer', vendorName: 'HK PET Imaging Centre', volume: '0.5 mL', usageLog: [] },
  { id: 'rad15', category: 'unsealed', sourceName: 'C-11 Choline Production Aliquot', isotope: 'C-11', activity: '1.2 GBq', location: 'MEDG05', spaceID: 'MEDG05', status: 'safe', custodian: 'Dr. Lucia Ferrer', department: 'Nuclear Medicine', acquiredDate: '2026-08-14', purchasedBy: 'Dr. Lucia Ferrer', vendorName: 'HK PET Imaging Centre', volume: '0.6 mL', usageLog: [] },
  { id: 'rad9', category: 'apparatus', equipmentDescription: 'X-ray Diffractometer — Bruker D8 Advance', sourceName: undefined, location: 'MTR012', spaceID: 'MTR012', custodian: 'Dr. Karl Berg', licenceNumber: 'XA-2025-0338', licenceFile: 'xa_licence_D8.pdf', licenceExpiryDate: '2026-09-30', department: 'Materials', lastInventoryCheckDate: '2026-05-11', checkHistory: ['2026-05-11 — Verified by Marcus Chen'], licenceHistory: [{ id: 'lh6', licenceNumber: 'XA-2025-0338', changedDate: '2025-10-01', changedBy: 'Marcus Chen', fileName: 'xa_licence_D8.pdf', notes: 'Licence renewal after tube replacement' }, { id: 'lh7', licenceNumber: 'XA-2023-0291', changedDate: '2023-09-15', changedBy: 'Marcus Chen', fileName: 'xa_licence_D8_old.pdf', notes: 'Initial apparatus licence' }], xrayTubeSerialNumbers: 'SN-88231A, SN-88231B' },
  { id: 'rad10', category: 'apparatus', equipmentDescription: 'Industrial Radiography Camera — Model G-4', location: 'MEDG05', spaceID: 'MEDG05', custodian: 'Dr. Lucia Ferrer', licenceNumber: 'XA-2026-0412', licenceFile: 'xa_licence_G4.pdf', licenceExpiryDate: '2027-03-31', department: 'Nuclear Medicine', lastInventoryCheckDate: '2026-02-19', checkHistory: ['2026-02-19 — Verified by Marcus Chen'], licenceHistory: [{ id: 'lh8', licenceNumber: 'XA-2026-0412', changedDate: '2026-04-01', changedBy: 'Marcus Chen', fileName: 'xa_licence_G4.pdf', notes: 'Annual renewal' }], xrayTubeSerialNumbers: 'SN-G4-1102' },
  { id: 'rad11', category: 'apparatus', equipmentDescription: 'Portable XRF Analyzer', location: 'ENV309', spaceID: 'ENV309', custodian: 'Dr. Elena Rostova', licenceNumber: 'XA-2024-0267', licenceFile: 'xa_licence_XRF.pdf', licenceExpiryDate: '2026-06-14', department: 'Civil Engineering', lastInventoryCheckDate: '2025-07-22', checkHistory: ['2025-07-22 — Verified by Marcus Chen'], licenceHistory: [{ id: 'lh9', licenceNumber: 'XA-2024-0267', changedDate: '2024-06-20', changedBy: 'Marcus Chen', fileName: 'xa_licence_XRF.pdf', notes: '' }], xrayTubeSerialNumbers: 'SN-XRF-7745' }
];

export const SEED_DOSES: DoseReading[] = [
  { id: 'dose1', name: 'James Ho', department: 'Physics', month: '2026-06', exposure: 2.4, status: 'caution', remarks: 'Work practice reviewed; additional shielding installed at Cs-137 irradiator.' },
  { id: 'dose2', name: 'David Park', department: 'Biology', month: '2026-03', exposure: 5.2, status: 'critical', remarks: 'Work suspended pending investigation; RSO notified, dosimeter reissued.' },
  { id: 'dose3', name: 'Alice Wong', department: 'Physics', month: '2026-07', exposure: 1.6, status: 'caution', remarks: 'Refresher training on H-3 handling completed; monthly follow-up reading scheduled.' },
  { id: 'dose4', name: 'Sarah Lim', department: 'Chemistry', month: '2026-06', exposure: 1.6, status: 'caution', remarks: 'Glove change frequency increased; fume-hood sash height corrected.' }
];

export const SEED_DOSE_ROSTER: DoseRosterEntry[] = [
  { id: 'dr1', name: 'Marcus Chen', department: 'HSEO', isotopes: ['Co-60', 'Cs-137', 'Am-241', 'H-3', 'P-32', 'C-14', 'S-35', 'F-18'], tld: true, ring: true, notes: 'RSO — conducts surveys, leak and swipe tests' },
  { id: 'dr2', name: 'Dr. Elena Rostova', department: 'Physics', isotopes: ['Cs-137', 'Am-241', 'U-238'], tld: true, ring: false },
  { id: 'dr3', name: 'Dr. Wei Zhang', department: 'Chemistry', isotopes: ['C-14', 'P-32', 'S-35'], tld: true, ring: true },
  { id: 'dr4', name: 'Dr. Mary Osei', department: 'Biology', isotopes: ['H-3', 'P-32', 'S-35'], tld: true, ring: true },
  { id: 'dr5', name: 'Dr. Karl Berg', department: 'Materials', isotopes: ['Co-60'], tld: true, ring: false },
  { id: 'dr6', name: 'Dr. Lucia Ferrer', department: 'Nuclear Medicine', isotopes: ['F-18', 'Ga-68', 'C-11'], tld: true, ring: true },
  { id: 'dr7', name: 'James Ho', department: 'Physics', isotopes: ['Cs-137', 'Co-60'], tld: true, ring: false },
  { id: 'dr8', name: 'Sarah Lim', department: 'Chemistry', isotopes: ['C-14', 'S-35'], tld: true, ring: true },
  { id: 'dr9', name: 'David Park', department: 'Biology', isotopes: ['H-3', 'S-35'], tld: true, ring: true },
  { id: 'dr10', name: 'Alice Wong', department: 'Physics', isotopes: ['Cs-137', 'Am-241'], tld: true, ring: false },
  { id: 'dr11', name: 'Brian Tan', department: 'Chemistry', isotopes: ['P-32'], tld: true, ring: true },
  { id: 'dr12', name: 'Chloe Ng', department: 'Biology', isotopes: ['H-3'], tld: true, ring: true },
  { id: 'dr13', name: 'Ethan Lee', department: 'Materials', isotopes: ['Co-60'], tld: true, ring: false }
];

export const SEED_DOCS: BoardDocument[] = [
  { id: 'doc1', date: '2026-01-15', direction: 'Sent', subject: 'Annual return — sealed source inventory 2025', relatesTo: 'IR-2024-0143', fileName: 'annual_return_sealed_2025.pdf', notes: 'Submitted with leak-test and stocktaking records' },
  { id: 'doc2', date: '2026-03-10', direction: 'Received', subject: 'Licence renewal approval — Cs-137 irradiator', relatesTo: 'IR-2024-0143', fileName: 'licence_IR-2024-0143_renewal.pdf', notes: '' },
  { id: 'doc3', date: '2026-04-01', direction: 'Sent', subject: 'Apparatus licence renewal application — X-ray Diffractometer', relatesTo: 'XA-2025-0338', fileName: 'xa_renewal_D8_2026.pdf', notes: 'Tube replacement declared in application' },
  { id: 'doc4', date: '2026-07-05', direction: 'Sent', subject: 'Import notification — F-18 / Ga-68 / C-11 radiopharmaceuticals', relatesTo: 'MEDG05', fileName: 'import_notice_medg05_20260705.pdf', notes: '' }
];

export const SEED_RUAS: IrpRua[] = [
  {
    id: 'rua1', ruaNo: 'RUA-2025-001', spaceID: 'LSK105', type: 'Communal', department: 'Physics',
    expiryDate: '2027-03-31', addedDate: '2025-04-10', renewedDate: '2026-04-10',
    changeHistory: [
      { id: 'rh1', date: '2026-04-10', changes: ['Renewed for 1 year — valid until 2027-03-31'] },
      { id: 'rh2', date: '2025-06-18', changes: ['Dr. Karl Berg: added isotope Co-60 (limit 100000 µCi)', 'Dr. Karl Berg: added user Ethan Lee (Student)'] },
      { id: 'rh3', date: '2025-04-10', changes: ['Authorization created'] }
    ],
    lastSwipeTest: '2026-07-16', nextSwipeTest: '2026-08-14',
    swipeHistory: ['2026-07-16 — Swipe survey conducted by Marcus Chen — below background', '2026-06-16 — Swipe survey conducted by Marcus Chen — below background'],
    safetyControls: ['Absorbent paper', 'Lab coat', 'Disposable gloves', 'Survey meter', 'Swipe test', 'Decontaminant'],
    groups: [
      {
        id: 'g1', piId: 'p1', piName: 'Dr. Elena Rostova',
        isotopes: [
          { iso: 'H-3', description: 'Tritiated thymidine cell-proliferation assays', limit: 50, chemicalForm: 'Tritiated water / labeled nucleoside', physicalForm: 'Liquid', expUCi: 12, possUCi: 30 },
          { iso: 'C-14', description: 'C-14 glucose metabolic tracing', limit: 25, chemicalForm: 'Labeled glucose in aqueous buffer', physicalForm: 'Liquid', expUCi: 5, possUCi: 12 }
        ],
        users: [{ id: 'p9', name: 'Alice Wong', role: 'Student' }, { id: 'p6', name: 'James Ho', role: 'Staff' }]
      },
      {
        id: 'g2', piId: 'p4', piName: 'Dr. Karl Berg',
        isotopes: [
          { iso: 'Co-60', description: 'Gamma irradiation of polymer samples (sealed irradiator)', limit: 100000, chemicalForm: 'Sealed metal source', physicalForm: 'Solid', expUCi: 0, possUCi: 100000 }
        ],
        users: [{ id: 'p12', name: 'Ethan Lee', role: 'Student' }]
      }
    ]
  },
  {
    id: 'rua3', ruaNo: 'RUA-2026-001', spaceID: 'MEDG05', type: 'Communal', department: 'Nuclear Medicine',
    expiryDate: '2027-07-01', addedDate: '2026-07-01', renewedDate: '',
    changeHistory: [{ id: 'rh6', date: '2026-07-01', changes: ['Authorization created'] }],
    lastSwipeTest: '2026-08-10', nextSwipeTest: '2026-09-09',
    swipeHistory: ['2026-08-10 — Swipe survey conducted by Marcus Chen — below background'],
    safetyControls: ['Absorbent paper', 'Lab coat', 'Lead shield', 'Disposable gloves', 'Survey meter', 'Swipe test', 'Decontaminant', 'Eye protection'],
    groups: [
      {
        id: 'g5', piId: 'p5', piName: 'Dr. Lucia Ferrer',
        isotopes: [
          { iso: 'F-18', description: 'FDG radiopharmaceutical production and QC', limit: 100000, chemicalForm: 'FDG in sterile saline', physicalForm: 'Liquid', expUCi: 54000, possUCi: 100000 },
          { iso: 'Ga-68', description: 'Ga-68 chloride eluate for PET tracer labeling', limit: 60000, chemicalForm: 'Gallium chloride in HCl', physicalForm: 'Liquid', expUCi: 40000, possUCi: 60000 },
          { iso: 'C-11', description: 'C-11 choline synthesis for PET imaging', limit: 60000, chemicalForm: 'C-11 choline in sterile solution', physicalForm: 'Liquid', expUCi: 32000, possUCi: 60000 }
        ],
        users: [{ id: 'p5', name: 'Dr. Lucia Ferrer', role: 'PI' }]
      }
    ]
  },
  {
    id: 'rua2', ruaNo: 'RUA-2025-002', spaceID: 'UST302', type: 'Individual', department: 'Chemistry',
    personInCharge: 'Dr. Wei Zhang', expiryDate: '2026-09-05', addedDate: '2025-09-05', renewedDate: '2025-09-05',
    changeHistory: [{ id: 'rh4', date: '2025-09-05', changes: ['Renewed for 1 year — valid until 2026-09-05', 'Authorization created'] }],
    lastSwipeTest: '2026-08-01', nextSwipeTest: '2026-08-31',
    swipeHistory: ['2026-08-01 — Swipe survey conducted by Marcus Chen — below background'],
    safetyControls: ['Absorbent paper', 'Lab coat', 'Beta shield', 'Disposable gloves', 'Survey meter', 'Eye protection', 'Shield waste container', 'Decontaminant'],
    groups: [
      {
        id: 'g3', piId: 'p2', piName: 'Dr. Wei Zhang',
        isotopes: [
          { iso: 'P-32', description: 'ATP end-labeling of nucleic acids', limit: 10, chemicalForm: 'Sodium phosphate buffer', physicalForm: 'Liquid', expUCi: 3.7, possUCi: 7.4 },
          { iso: 'S-35', description: 'Methionine pulse-labeling of proteins', limit: 20, chemicalForm: 'L-methionine in aqueous solution', physicalForm: 'Liquid', expUCi: 5, possUCi: 10 }
        ],
        users: [{ id: 'p7', name: 'Sarah Lim', role: 'Staff' }, { id: 'p10', name: 'Brian Tan', role: 'Student' }]
      }
    ]
  }
];

export const SEED_WASTE: WasteContainer[] = [
  { id: 'w1', tagNo: '260804', wasteClass: 'Beta', form: 'Solid', isotope: 'P-32', activityUCi: 4.5, department: 'Biology', spaceID: 'CYTB18', collectedDate: '2026-08-04', collectedBy: 'Marcus Chen', notes: 'Scintillation vials + pipette tips' },
  { id: 'w2', tagNo: '260804-2', wasteClass: 'Beta', form: 'Liquid', isotope: 'H-3', activityUCi: 12.0, department: 'Physics', spaceID: 'LSK105', collectedDate: '2026-08-04', collectedBy: 'Marcus Chen', notes: 'Aqueous scintillation fluid' },
  { id: 'w3', tagNo: '260811', wasteClass: 'Beta', form: 'Solid', isotope: 'C-14', activityUCi: 1.8, department: 'Chemistry', spaceID: 'UST302', collectedDate: '2026-08-11', collectedBy: 'Marcus Chen', notes: 'Gloves and absorbent paper' },
  { id: 'w4', tagNo: '260811-2', wasteClass: 'Gamma', form: 'Solid', isotope: 'I-125', activityUCi: 0.9, department: 'Biology', spaceID: 'CYT201', collectedDate: '2026-08-11', collectedBy: 'Marcus Chen', notes: 'Expired stock vials' },
  { id: 'w5', tagNo: '260722', wasteClass: 'Alpha', form: 'Solid', isotope: 'Am-241', activityUCi: 0.05, department: 'Civil Engineering', spaceID: 'ENV309', collectedDate: '2026-07-22', collectedBy: 'Marcus Chen', notes: 'Decommissioned test sources', status: 'disposed', disposedDate: '2026-08-08', disposedBy: 'Marcus Chen', disposalMethod: 'Transfer to licensed disposal contractor', disposalNotes: 'Manifest M-2026-114' },
  { id: 'w6', tagNo: '260715', wasteClass: 'Beta', form: 'Liquid', isotope: 'S-35', activityUCi: 6.2, department: 'Chemistry', spaceID: 'UST415', collectedDate: '2026-07-15', collectedBy: 'Marcus Chen', notes: 'Buffer waste', status: 'disposed', disposedDate: '2026-07-30', disposedBy: 'Marcus Chen', disposalMethod: 'Decay-in-storage', disposalNotes: 'Moved to decay storage room B02' },
  { id: 'w7', tagNo: '260812', wasteClass: 'Gamma', form: 'Liquid', isotope: 'Co-60', activityUCi: 0.3, department: 'Nuclear Medicine', spaceID: 'MEDG05', collectedDate: '2026-08-12', collectedBy: 'Marcus Chen', notes: 'Decontamination rinse' },
  { id: 'w8', tagNo: '260814', wasteClass: 'Beta', form: 'Solid', isotope: 'H-3', activityUCi: 8.4, department: 'Biology', spaceID: 'CYT201', collectedDate: '2026-08-14', collectedBy: 'Marcus Chen', notes: 'Contaminated gloves and wipe paper' },
  { id: 'w9', tagNo: '260814-2', wasteClass: 'Beta', form: 'Solid', isotope: 'H-3', activityUCi: 3.2, department: 'Chemistry', spaceID: 'UST302', collectedDate: '2026-08-14', collectedBy: 'Marcus Chen', notes: 'Used silica columns from labeling run' },
  { id: 'w10', tagNo: '260814-3', wasteClass: 'Beta', form: 'Liquid', isotope: 'H-3', activityUCi: 15.6, department: 'Biology', spaceID: 'CYTB18', collectedDate: '2026-08-14', collectedBy: 'Marcus Chen', notes: 'Scintillation cocktail from binding assay' },
  { id: 'w11', tagNo: '260814-4', wasteClass: 'Beta', form: 'Liquid', isotope: 'H-3', activityUCi: 6.8, department: 'Nuclear Medicine', spaceID: 'MEDG05', collectedDate: '2026-08-14', collectedBy: 'Marcus Chen', notes: 'Aqueous rinse waste' }
];
