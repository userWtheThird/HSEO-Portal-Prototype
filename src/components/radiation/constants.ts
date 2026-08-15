// Ionizing Radiation Safety Program — constants & reference data
// (ported from the standalone IonizingRadiationProgram.html workflow)

import type { IsotopeRefEntry } from '../../types';

export const LS_KEYS = {
  sources: 'IRP_SOURCES_V1',
  doses: 'IRP_DOSES_V1',
  ruas: 'IRP_RUAS_V1',
  waste: 'IRP_WASTE_V1',
  doseRoster: 'IRP_DOSE_ROSTER_V1',
  docs: 'IRP_DOCS_V1'
};

export const CHECK_INTERVAL_DAYS = 365;
export const LEAK_INTERVAL_DAYS = 365; // sealed-source leak tests are annual
export const SWIPE_INTERVAL_DAYS = 30;
export const DOSE_CAUTION_LIMIT = 1.0;
export const DOSE_CRITICAL_LIMIT = 5.0;
export const LICENCE_ALERT_MONTHS = 4;
export const UCII_TO_MBQ = 0.037; // 1 µCi = 0.037 MBq
export const RUA_ALERT_DAYS = 30; // RUAs are renewed annually — alert one month before expiry

export const WASTE_CLASSES = ['Alpha', 'Beta', 'Gamma'] as const;
export const WASTE_FORMS = ['Solid', 'Liquid'] as const;
export const DISPOSAL_METHODS = [
  'Transfer to licensed disposal contractor',
  'Decay-in-storage',
  'Discharge to sewer (liquid only)',
  'Return to supplier',
  'Other'
];
export const ISOTOPE_OPTIONS = ['H-3', 'C-14', 'P-32', 'S-35', 'I-125', 'Co-60', 'Cs-137', 'Am-241', 'F-18', 'Ga-68', 'C-11', 'Na-22', 'Ge-68', 'Other'];
export const SAFETY_CONTROLS = ['Absorbent paper', 'Lab coat', 'Beta shield', 'Lead shield', 'Decontaminant', 'Shield waste container', 'Disposable gloves', 'Survey meter', 'Eye protection', 'Swipe test'];
export const RUA_PHYSICAL_FORMS = ['Solid', 'Liquid', 'Gas', 'Powder'];
export const DOSIMETRY_DEPARTMENTS = ['Physics', 'Chemistry', 'Biology', 'Materials', 'Nuclear Medicine'];

// Reference data: emission type, half-life and principal emissions (standard literature values)
export const ISOTOPE_DATA: IsotopeRefEntry[] = [
  { iso: 'H-3',    name: 'Tritium',        emission: 'β⁻',        halfLife: '12.32 y',      energy: '0.0186 MeV β (max)' },
  { iso: 'C-14',   name: 'Carbon-14',      emission: 'β⁻',        halfLife: '5,730 y',      energy: '0.156 MeV β (max)' },
  { iso: 'P-32',   name: 'Phosphorus-32',  emission: 'β⁻',        halfLife: '14.29 d',      energy: '1.71 MeV β (max)' },
  { iso: 'S-35',   name: 'Sulfur-35',      emission: 'β⁻',        halfLife: '87.4 d',       energy: '0.167 MeV β (max)' },
  { iso: 'Cl-36',  name: 'Chlorine-36',    emission: 'β⁻',        halfLife: '301,000 y',    energy: '0.709 MeV β (max)' },
  { iso: 'Ca-45',  name: 'Calcium-45',     emission: 'β⁻',        halfLife: '162.6 d',      energy: '0.257 MeV β (max)' },
  { iso: 'Ni-63',  name: 'Nickel-63',      emission: 'β⁻',        halfLife: '100.1 y',      energy: '0.0669 MeV β (max)' },
  { iso: 'Sr-90',  name: 'Strontium-90',   emission: 'β⁻',        halfLife: '28.8 y',       energy: '0.546 MeV β (max); Y-90 daughter 2.28 MeV' },
  { iso: 'I-125',  name: 'Iodine-125',     emission: 'EC, γ',     halfLife: '59.4 d',       energy: '35.5 keV γ; 27–35 keV X-rays' },
  { iso: 'Cr-51',  name: 'Chromium-51',    emission: 'EC, γ',     halfLife: '27.7 d',       energy: '0.320 MeV γ' },
  { iso: 'Mn-54',  name: 'Manganese-54',   emission: 'EC, γ',     halfLife: '312.3 d',      energy: '0.835 MeV γ' },
  { iso: 'Fe-55',  name: 'Iron-55',        emission: 'EC',        halfLife: '2.73 y',       energy: '5.9 keV X-rays' },
  { iso: 'Fe-59',  name: 'Iron-59',        emission: 'β⁻, γ',     halfLife: '44.5 d',       energy: '1.10 / 1.29 MeV γ' },
  { iso: 'Co-60',  name: 'Cobalt-60',      emission: 'β⁻, γ',     halfLife: '5.27 y',       energy: '1.17 / 1.33 MeV γ' },
  { iso: 'Zn-65',  name: 'Zinc-65',        emission: 'EC, β⁺, γ', halfLife: '244 d',        energy: '1.116 MeV γ' },
  { iso: 'Na-22',  name: 'Sodium-22',      emission: 'β⁺, γ',     halfLife: '2.60 y',       energy: '1.275 MeV γ; 0.511 MeV annihilation' },
  { iso: 'Tc-99m', name: 'Technetium-99m', emission: 'IT, γ',     halfLife: '6.01 h',       energy: '0.140 MeV γ' },
  { iso: 'F-18',   name: 'Fluorine-18',    emission: 'β⁺',        halfLife: '109.8 min',    energy: '0.634 MeV β⁺ (max); 0.511 MeV annihilation' },
  { iso: 'Ga-68',  name: 'Gallium-68',     emission: 'β⁺',        halfLife: '67.7 min',     energy: '1.90 MeV β⁺ (max); 0.511 MeV annihilation' },
  { iso: 'C-11',   name: 'Carbon-11',      emission: 'β⁺',        halfLife: '20.4 min',     energy: '0.96 MeV β⁺ (max); 0.511 MeV annihilation' },
  { iso: 'Ge-68',  name: 'Germanium-68',   emission: 'EC',        halfLife: '270.8 d',      energy: 'Electron capture → Ga-68; 0.511 MeV annihilation photons' },
  { iso: 'Cs-137', name: 'Cesium-137',     emission: 'β⁻, γ',     halfLife: '30.17 y',      energy: '0.662 MeV γ (Ba-137m)' },
  { iso: 'Am-241', name: 'Americium-241',  emission: 'α, γ',      halfLife: '432.2 y',      energy: '5.486 MeV α; 59.5 keV γ' },
  { iso: 'Pu-239', name: 'Plutonium-239',  emission: 'α',         halfLife: '24,110 y',     energy: '5.157 MeV α' },
  { iso: 'U-238',  name: 'Uranium-238',    emission: 'α',         halfLife: '4.47 × 10⁹ y', energy: '4.27 MeV α' },
  { iso: 'Ra-226', name: 'Radium-226',     emission: 'α, γ',      halfLife: '1,600 y',      energy: '4.78 MeV α' }
];

// Half-lives in days (365.25 d/y) for decay correction of stored waste
export const HALF_LIFE_DAYS: Record<string, number> = {
  'H-3': 4500, 'C-14': 2092883, 'P-32': 14.29, 'S-35': 87.4, 'Cl-36': 109940250, 'Ca-45': 162.6,
  'Ni-63': 36561, 'Sr-90': 10519, 'I-125': 59.4, 'Cr-51': 27.7, 'Mn-54': 312.3, 'Fe-55': 997,
  'Fe-59': 44.5, 'Co-60': 1925, 'Zn-65': 244, 'Na-22': 950, 'Tc-99m': 0.2504, 'F-18': 0.0762,
  'Ga-68': 0.047, 'C-11': 0.0142, 'Ge-68': 270.8, 'Cs-137': 11020, 'Am-241': 157861,
  'Pu-239': 8806173, 'U-238': 1.6327e12, 'Ra-226': 584400
};
