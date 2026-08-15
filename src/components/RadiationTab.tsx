// Radiation Safety tab — thin wrapper around the Ionizing Radiation Safety Program module.
// The full workflow (inventory w/ IA lifecycle, RUA, dosimetry, waste, monthly summary,
// documents, isotope reference) lives in ./radiation.

import React from 'react';
import type { RadiationSource, DosimeterLog, User, Location, Person } from '../types';
import RadiationModule from './radiation/RadiationModule';

interface RadiationTabProps {
  currentUser: User;
  radiationSources: RadiationSource[];
  dosimeterLogs: DosimeterLog[];
  locations: Location[];
  persons: Person[];
  onTriggerLeakTest: (sourceId: string, logDetails: string) => void;
  onAddDosimeterLog: (newLog: DosimeterLog, logDetails: string) => void;
  onAddRadiationSource: (newSource: RadiationSource, logDetails: string) => void;
  onUpdateRadiationSource: (updatedSource: RadiationSource, logDetails: string) => void;
  onBatchUpdateRadiationSources: (updatedSources: RadiationSource[], logDetails: string) => void;
}

// NOTE: locations/persons from the portal and the legacy onTriggerLeakTest (which hardcoded a
// 180-day cycle) are intentionally not used — the module keeps its own IRP reference data and
// runs the annual (365-day) structured leak-test workflow through onUpdateRadiationSource.
export default function RadiationTab({
  currentUser, radiationSources,
  onAddDosimeterLog, onAddRadiationSource, onUpdateRadiationSource, onBatchUpdateRadiationSources
}: RadiationTabProps) {
  return (
    <RadiationModule
      currentUser={currentUser}
      radiationSources={radiationSources}
      onAddDosimeterLog={onAddDosimeterLog}
      onAddRadiationSource={onAddRadiationSource}
      onUpdateRadiationSource={onUpdateRadiationSource}
      onBatchUpdateRadiationSources={onBatchUpdateRadiationSources}
    />
  );
}
