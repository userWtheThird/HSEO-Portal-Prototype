export type Role = 'superadmin' | 'admin' | 'hseo_management' | 'staff' | 'PI' | 'Contact' | 'field_team_member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  title: string;
}

export interface Person {
  id: string;
  name: string;
  role: 'Principal Investigator (PI)' | 'Staff' | 'Student' | 'Field Team Member' | 'HSEO Management' | 'Viewer' | 'PI' | 'Contact' | 'Officer' | 'HSEO management' | 'Superadmin';
  department: string;
  assignedDepartments?: string[]; // for FTMs
  assignedFocalPoints?: string[]; // for FTMs — program focal points
  email: string;
  phone: string;
  title?: string;
  status?: 'Active' | 'Inactive';
  dso?: 'Yes' | 'No';
  dwa?: 'Yes' | 'No';
}

export interface Building {
  id: string;
  code: string;
  name: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  code?: string; // short form e.g. "CHEM", "PHYS"
  type: 'vp' | 'school' | 'department' | 'office' | 'facility' | 'institute' | 'subsidiary' | 'other';
  parentId?: string; // references parent OrgUnit id
}

export interface Location {
  id: string;
  building: string;
  roomNumber: string;
  spaceID: string;
  roomNature: string; // e.g. Chemical Lab, Office, Storage
  spaceType?: 'Lab' | 'Non-lab';
  inspectionFrequency?: number; // inspections per year (default: 2 for Lab, 1 for Non-lab)
  inspectionStartMonth?: string; // e.g. "2026-12" — first month inspections begin
  piIds: string[]; // Refs to Person (PIs) - can have multiple
  department: string;
  piDelegateIds: string[]; // Refs to Person (PI's delegates / Contact persons for the room)
  status: 'Active' | 'Inactive/Renovation' | 'Decommissioned';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  program: string; // 'Inspection' | 'Radiation' | 'Laser' | 'Hot Work' | 'Hazardous Waste' | 'Water Sanitation' | 'IEQ' | 'System'
}

export interface Finding {
  id: string;
  category: string; // e.g. 'fire safety', 'biosafety', 'chemical safety', 'housekeeping'
  findingCode?: string; // Auto-generated from standardized findings, e.g. 'FS-001'
  description: string;
  status: 'open' | 'resolved';
  severity: 'low' | 'medium' | 'high';
  correctiveAction?: string;
  actionLevel?: 1 | 2 | 3;
  referredContactId?: string;
  rectificationRecord?: string;
  photoUrl?: string;
  followUpActions?: string;
}

export interface Inspection {
  id: string;
  title: string;
  date: string;
  inspectorId: string;
  inspectorName: string;
  status: 'completed' | 'pending' | 'overdue';
  score: number; // percentage, e.g. 92
  findings: Finding[];
  locationId?: string;
  piId?: string;
  scheduledMonth?: string;
  appointmentDate?: string;
  ftmId?: string;
  reportIssuedDate?: string;
  inspectionStatus?: 'scheduled' | 'ready_to_go' | 'drafting_report' | 'supervisor_review' | 'issued' | 'pending_rectification' | 'closed';
  inspectionType?: 'scheduled' | 'night';
  department?: string;
}

export interface InspectionBooking {
  id: string;
  date: string;
  time: string;
  locationIds: string[]; // one or more locations visited in this single time slot
  bookedBy: string; // person id
  bookedByName: string;
  inspectionIds?: string[]; // linked inspection records (one per location)
}

export interface InspectionWindow {
  id: string;
  department: string;
  title: string; // e.g. "Week of Aug 4–8"
  startDate: string;
  endDate: string;
  timeSlots: string[]; // e.g. ["09:00", "10:00", "14:00", "15:00"]
  openedBy: string; // FTM name
  openedById: string;
  status: 'open' | 'closed';
  bookings: InspectionBooking[];
}

export interface LicenceRecord {
  id: string;
  licenceNumber: string;
  changedDate: string; // When the licence number was changed
  changedBy: string; // User who made the change
  fileName?: string; // Uploaded PDF filename
  notes?: string;
}

export interface RadiationSource {
  id: string;
  category?: 'sealed' | 'unsealed' | 'apparatus'; // separates the inventory further
  sourceName?: string;
  isotope?: string;
  activity?: string; // e.g. "37 GBq" or current radioactivity
  location?: string;
  spaceID?: string; // SpaceID linked to location's SpaceID
  lastLeakTest?: string;
  nextLeakTest?: string;
  status?: 'safe' | 'alert' | 'due_test';
  custodian?: string;

  // New Sealed Source fields
  lastInventoryCheckDate?: string;
  activityReference?: string;
  referenceDate?: string;
  checkHistory?: string[]; // keep all previous check dates in database

  // New Irradiating Apparatus fields
  licenceNumber?: string;
  licenceFile?: string; // Current licence PDF filename
  licenceHistory?: LicenceRecord[]; // History of licence number changes
  department?: string;
  equipmentDescription?: string;
  xrayTubeSerialNumbers?: string;
  licenceExpiryDate?: string;
  notificationDate?: string; // 4 months before expiry

  // Structured leak-test record (latest)
  leakTestCounts?: number;
  leakTestBackground?: number;
  leakTestResult?: 'pass' | 'fail';
  leakTestNotes?: string;
  leakTestHistory?: LeakTestRecord[];

  // IA lifecycle — possess → possess & use → decommissioned
  stage?: IaStage;
  purchaseLicenceNo?: string;
  importLicenceNo?: string;
  floorPlanFile?: string;
  possessLicence?: { number?: string; expiryDate?: string; file?: string };
  decommission?: DecommissionRecord;

  // Unsealed source acquisition & consumption
  addedDate?: string;
  acquiredDate?: string;
  volume?: string;
  purchasedBy?: string;
  vendorName?: string;
  usageLog?: UsageLogEntry[];

  // back-refs
  locationId?: string;
  piId?: string;
}

export interface DosimeterLog {
  id: string;
  employeeName: string;
  department: string;
  exposure: number; // mSv
  period: string; // e.g. "Q2 2026"
  status: 'normal' | 'caution' | 'critical';
  personId?: string;
}

export interface LaserDevice {
  id: string;
  identifier: string;
  model: string;
  laserClass: 'Class 3B' | 'Class 4';
  wavelength: string; // e.g. "532 nm"
  power: string; // e.g. "500 mW"
  location: string;
  interlockStatus: 'passed' | 'failed' | 'untested';
  trainingStatus: 'all_trained' | 'training_needed';
  custodian: string;
  locationId?: string;
  piId?: string;
}

export interface HotWorkPermit {
  id: string;
  location: string;
  applicantName: string;
  applicantId: string;
  date: string;
  description: string;
  hazardControls: {
    gasTestDone: boolean;
    fireExtinguisherPresent: boolean;
    sprinklerProtected: boolean;
    combustiblesRemoved: boolean;
    fireWatchAssigned: boolean;
  };
  status: 'draft' | 'approved' | 'active' | 'expired' | 'completed';
  approvedBy?: string;
  fireWatchName: string;
  durationHours: number;
  createdAt: string;
  locationId?: string;
  piId?: string;
}

export interface HazardousWasteRequest {
  id: string;
  generatorName: string;
  generatorId: string;
  chemicalDescription: string;
  volume: string; // e.g. "5 Gallons"
  state: 'liquid' | 'solid' | 'gas';
  category: 'acid' | 'base' | 'solvent' | 'toxic' | 'radioactive' | 'reactive';
  compatibilityCheck: 'passed' | 'warning';
  requestDate: string;
  status: 'pending_pickup' | 'in_transit' | 'disposed';
  manifestNumber: string;
  locationId?: string;
  piId?: string;
}

export interface WaterSourceParameter {
  name: string;
  unit: string;
  reportingLevel: number;
  referenceLevel: number;
}

export interface WaterSourceType {
  id: string;
  name: string;
  intervalMonths: number;
  parameters: WaterSourceParameter[];
}

export interface WaterSamplingPoint {
  id: string;
  name: string;
  type: string; // references WaterSourceType name
  department: string;
  status: 'Active' | 'Inactive';
  latestSampleDate?: string;
  latestStatus?: 'Pass' | 'Failed';
}

export interface WaterLogParameterValue {
  name: string;
  unit: string;
  isAboveReporting: boolean;
  value?: number;
  reportingLevel: number;
  referenceLevel: number;
}

export interface WaterLog {
  id: string;
  samplePoint: string;
  testDate: string;
  testerName: string;
  pH: number;
  chlorine: number; // ppm
  legionella: 'negative' | 'positive' | 'pending';
  temperature: number; // °C
  status: 'pass' | 'fail' | 'action_required';
  locationId?: string;
  // New fields
  purpose?: 'Scheduled' | 'Ad-hoc' | 'Pre-use' | 'Re-test';
  passFailed?: 'Pass' | 'Failed';
  waterSourceType?: string;
  recordedParameters?: WaterLogParameterValue[];
  labReportNo?: string;
}

export interface IeqLog {
  id: string;
  location: string;
  timestamp: string;
  co2: number; // ppm
  voc: number; // ppb
  temperature: number; // °C
  humidity: number; // %
  ventilationStatus: 'optimal' | 'adequate' | 'poor';
  locationId?: string;
  piId?: string;
}

export interface IeqComplaint {
  id: string;
  location: string;
  description: string;
  reporterName: string;
  date: string;
  status: 'resolved' | 'active';
  assignedAction?: string;
  locationId?: string;
  piId?: string;
}

// New IEQ Sampling interfaces
export interface IeqParameter {
  id: string;
  name: string;
  unit: string;
  safeThreshold: number;
  isDefault?: boolean;
}

export interface IeqSample {
  id: string;
  locationId: string;
  location: string;
  samplingType: 'renovated' | 'adhoc';
  date: string;
  testerName: string;
  status: 'pass' | 'action_required' | 'fail';
  readings: Record<string, number>;
  notes?: string;
}

export interface RuaGroup {
  id: string;
  piId: string;
  piName: string;
  isotopes: string[];
  users: { id: string; name: string; role: string }[];
}

// ── Ionizing Radiation Program (IRP) workflow models ──

export type IaStage = 'possess' | 'possess-use' | 'decommissioned';

export interface LeakTestRecord {
  id: string;
  date: string;
  counts: number; // measured cpm
  background: number; // background cpm
  net: number; // counts − background
  result: 'pass' | 'fail';
  notes?: string;
}

export interface SwipeTestRecord {
  id: string;
  date: string;
  counts: number;
  background: number;
  net: number;
  result: 'clean' | 'positive' | 'adal'; // adal = above ADAL
  followUp?: string;
}

export interface UsageLogEntry {
  id: string;
  date: string;
  volume?: string;
  activityUCi: number;
  by?: string;
  notes?: string;
}

export interface DecommissionRecord {
  approvalDate: string;
  destroyedDate: string;
  verifiedDate: string;
  approvalFile?: string; // Board-approved disposal PDF
  notes?: string;
}

// Per-isotope use details within a PI group (rich RUA model)
export interface IsotopeUseEntry {
  iso: string;
  description?: string;
  limit: number; // radionuclide limit in µCi
  chemicalForm?: string;
  physicalForm?: string;
  expUCi?: number; // experimental quantity
  possUCi?: number; // possession quantity
}

export interface IrpRuaUser {
  id: string;
  name: string;
  role: string;
}

export interface IrpRuaGroup {
  id: string;
  piId: string;
  piName: string;
  isotopes: (IsotopeUseEntry | string)[]; // legacy records may hold plain strings
  users: IrpRuaUser[];
}

export interface RuaChangeRecord {
  id: string;
  date: string;
  changes: string[];
}

export interface IrpRua {
  id: string;
  ruaNo?: string;
  spaceID: string;
  type: 'Communal' | 'Individual';
  department: string;
  personInCharge?: string; // required for Individual
  expiryDate?: string; // renewed annually
  addedDate?: string;
  renewedDate?: string;
  lastSwipeTest?: string;
  nextSwipeTest?: string;
  swipeHistory?: (SwipeTestRecord | string)[];
  safetyControls?: string[];
  groups?: IrpRuaGroup[];
  changeHistory?: RuaChangeRecord[];
}

export interface DoseReading {
  id: string;
  name: string;
  department: string;
  month: string; // "YYYY-MM"
  exposure: number; // mSv
  status: 'normal' | 'caution' | 'critical';
  remarks?: string;
}

export interface DoseRosterEntry {
  id: string;
  name: string;
  department?: string;
  isotopes?: string[];
  tld: boolean; // whole-body TLD badge
  ring: boolean; // finger ring dosimeter
  notes?: string;
}

export interface WasteContainer {
  id: string;
  tagNo: string;
  wasteClass: 'Alpha' | 'Beta' | 'Gamma';
  form: 'Solid' | 'Liquid';
  isotope: string;
  activityUCi: number; // estimated at collection
  department: string;
  spaceID: string;
  collectedDate: string;
  collectedBy?: string;
  notes?: string;
  status?: 'collected' | 'disposed';
  disposedDate?: string;
  disposedBy?: string;
  disposalMethod?: string;
  disposalNotes?: string;
}

export interface BoardDocument {
  id: string;
  date: string;
  direction: 'Sent' | 'Received';
  subject: string;
  relatesTo?: string;
  fileName?: string;
  notes?: string;
}

export interface IsotopeRefEntry {
  iso: string;
  name: string;
  emission: string;
  halfLife: string;
  energy: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;        // 'Dust Monitor' | 'Noise Dosimeter' | 'Gas Detector' | 'NIR Sensor' | 'Air Sampler' | ...
  serialNumber: string;
  manufacturer: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  status: 'Active' | 'Calibration Due' | 'Out for calibration' | 'Out of Service';
  assignedLocation?: string;
}

export interface ExposureRecord {
  id: string;
  samplingDate: string;
  locationId: string;
  spaceID: string;
  parameterType: string;      // 'Total Dust' | 'PM10' | 'PM2.5' | 'tVOC' | 'Ammonia' | 'Noise' | 'NIR'
  equipmentId: string;
  testerId: string;
  results: { name: string; value: string; unit: string; equipmentId?: string }[];
  floorPlanRef: string;
  sampledDuration: string;
  status: 'Compliant' | 'Exceedance' | 'Pending';
  followUp: string;
  notes: string;
}

export interface FiscalYearConfig {
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number; // 1-12
  endDay: number;
}

export interface InspectionFinding {
  id: string;
  category: string; // e.g. 'Fire Safety', 'BioSafety', 'Chemical Safety', 'Air Ventilation'
  findingCode: string; // Auto-generated based on category, e.g. 'FS-001', 'BS-002'
  shortObservation: string; // Brief observation title for dropdown selection
  actionLevel: 'I' | 'II' | 'III';
  description: string;
  followUpAction: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
