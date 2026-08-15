// Ionizing Radiation Safety Program — register / edit source form
// (category-aware: sealed source, unsealed source, irradiating apparatus w/ lifecycle stage)

import React, { useState } from 'react';
import type { RadiationSource, LicenceRecord } from '../../types';
import { Modal, Field, FormGrid2, ErrorBox, inpCls, selCls, BtnPrimary, BtnOutline, Note } from './ui';
import { uid, todayISO, isoEntries } from './utils';
import { ISOTOPE_OPTIONS } from './constants';
import type { IrpLocation, IrpPerson } from './seeds';
import type { IrpRua } from '../../types';

export interface SourceFormResult { source: RadiationSource; isNew: boolean; log: string }

export function SourceForm({ source, locations, persons, ruas, onClose, onSubmit }: {
  source: RadiationSource | null; // null = register new
  locations: IrpLocation[]; persons: IrpPerson[]; ruas: IrpRua[];
  onClose: () => void;
  onSubmit: (r: SourceFormResult) => void;
}) {
  const s = source;
  const isEdit = !!s;
  const [cat, setCat] = useState<'sealed' | 'unsealed' | 'apparatus'>(s ? (s.category || 'sealed') : 'apparatus');
  const [stage, setStage] = useState<'possess' | 'possess-use'>(s && s.stage === 'possess' ? 'possess' : 'possess-use');
  const [name, setName] = useState(s ? (s.category === 'apparatus' ? (s.equipmentDescription || '') : (s.sourceName || '')) : '');
  const [iso, setIso] = useState(s && s.isotope ? s.isotope : ISOTOPE_OPTIONS[0]);
  const [activity, setActivity] = useState(s && s.activity ? s.activity : '');
  const [spaceID, setSpaceID] = useState(s && s.spaceID ? s.spaceID : (locations[0] ? locations[0].spaceID : ''));
  const [custodian, setCustodian] = useState(s && s.custodian ? s.custodian : '');
  const [licence, setLicence] = useState(s && s.licenceNumber ? s.licenceNumber : '');
  const [expiry, setExpiry] = useState(s && s.licenceExpiryDate ? s.licenceExpiryDate : '');
  const [serials, setSerials] = useState(s && s.xrayTubeSerialNumbers ? s.xrayTubeSerialNumbers : '');
  const [importLic, setImportLic] = useState(s && s.importLicenceNo ? s.importLicenceNo : '');
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [floorPlanName, setFloorPlanName] = useState(s && s.floorPlanFile ? s.floorPlanFile : '');
  const [licencePdf, setLicencePdf] = useState<File | null>(null);
  // sealed extras
  const [refActivity, setRefActivity] = useState(s && s.activityReference ? s.activityReference : '');
  const [refDate, setRefDate] = useState(s && s.referenceDate ? s.referenceDate : '');
  // unsealed extras
  const [acquiredDate, setAcquiredDate] = useState(s && s.acquiredDate ? s.acquiredDate : todayISO());
  const [volume, setVolume] = useState(s && s.volume ? s.volume : '');
  const [purchasedBy, setPurchasedBy] = useState(s && s.purchasedBy ? s.purchasedBy : '');
  const [vendor, setVendor] = useState(s && s.vendorName ? s.vendorName : '');
  const [err, setErr] = useState('');

  const loc = locations.find(l => l.spaceID === spaceID);

  // Auto-fill custodian with the department's PI when the location changes
  const pickSpace = (sid: string) => {
    setSpaceID(sid);
    const l = locations.find(x => x.spaceID === sid);
    if (l) {
      const pi = persons.find(p => p.role === 'PI' && p.department === l.department);
      setCustodian(cur => cur || (pi ? pi.name : ''));
    }
  };

  const submit = () => {
    if (!name.trim()) return setErr(cat === 'apparatus' ? 'Equipment description is required.' : 'Source name is required.');
    if (!spaceID) return setErr('Location is required.');
    if (cat === 'sealed' && !activity.trim()) return setErr('Activity is required for a sealed source.');
    if (cat === 'unsealed') {
      const rua = ruas.find(u => u.spaceID === spaceID);
      if (!rua) return setErr('No Room Use Authorization (RUA) exists for ' + spaceID + '. Create the RUA first — unsealed sources may only be registered in authorized rooms.');
      const auth = [...new Set((rua.groups || []).flatMap(g => isoEntries(g).map(e => e.iso)))];
      if (!auth.includes(iso)) return setErr(iso + ' is not authorized in the RUA for ' + spaceID + '. Authorized: ' + (auth.join(', ') || 'none') + '. Update the RUA first.');
      if (!activity.trim()) return setErr('Activity is required for an unsealed source.');
    }
    if (cat === 'apparatus') {
      if (!licence.trim()) return setErr((stage === 'possess' ? 'Purchase licence number' : 'Licence number') + ' is required.');
      if (!expiry) return setErr('Licence expiry date is required.');
      if (!isEdit && !licencePdf) return setErr('The licence document (PDF) is required when registering an apparatus.');
    }
    if (licencePdf && !licencePdf.name.toLowerCase().endsWith('.pdf')) return setErr('Licence document must be a PDF file.');

    const loc0 = locations.find(l => l.spaceID === spaceID);
    const base: RadiationSource = s ? { ...s } : {
      id: uid('rad'),
      status: 'safe',
      addedDate: todayISO(),
      licenceHistory: []
    };
    const out: RadiationSource = {
      ...base,
      category: cat,
      location: spaceID,
      spaceID: spaceID,
      department: loc0 ? loc0.department : (s ? s.department : ''),
      custodian: custodian.trim() || (s ? s.custodian : '')
    };
    const history: LicenceRecord[] = s && s.licenceHistory ? [...s.licenceHistory] : [...(base.licenceHistory || [])];
    const logBits: string[] = [];

    if (cat === 'apparatus') {
      out.sourceName = undefined;
      out.equipmentDescription = name.trim();
      out.xrayTubeSerialNumbers = serials.trim() || undefined;
      out.licenceExpiryDate = expiry;
      if (stage === 'possess' && !isEdit) {
        // Purchase stage — the main licence is the purchase licence; import doc + floor plan on file
        out.stage = 'possess';
        out.purchaseLicenceNo = licence.trim();
        out.importLicenceNo = importLic.trim() || undefined;
        out.floorPlanFile = floorPlan ? floorPlan.name : (floorPlanName || undefined);
        out.licenceNumber = licence.trim();
        out.licenceFile = licencePdf ? licencePdf.name : (s ? s.licenceFile : undefined);
      } else {
        out.stage = isEdit ? (s!.stage || 'possess-use') : 'possess-use';
        out.licenceNumber = licence.trim();
        out.licenceFile = licencePdf ? licencePdf.name : (s ? s.licenceFile : undefined);
      }
      if (!isEdit) {
        if (licence.trim()) history.unshift({ id: uid('lh'), licenceNumber: licence.trim(), changedDate: todayISO(), changedBy: 'Marcus Chen', fileName: licencePdf ? licencePdf.name : undefined, notes: stage === 'possess' ? 'Initial purchase licence' : 'Initial apparatus licence' });
      } else if (s!.licenceNumber && s!.licenceNumber !== licence.trim()) {
        history.unshift({ id: uid('lh'), licenceNumber: licence.trim(), changedDate: todayISO(), changedBy: 'Marcus Chen', fileName: licencePdf ? licencePdf.name : undefined, notes: 'Licence changed from ' + s!.licenceNumber });
      }
      out.licenceHistory = history;
      logBits.push(out.equipmentDescription + ' (' + (out.stage === 'possess' ? 'Possess' : 'Possess & Use') + ') — ' + spaceID);
    } else {
      out.sourceName = name.trim();
      out.isotope = iso;
      out.activity = activity.trim();
      if (cat === 'sealed') {
        out.activityReference = refActivity.trim() || activity.trim();
        out.referenceDate = refDate || todayISO();
        out.licenceNumber = licence.trim() || undefined;
        if (licencePdf) out.licenceFile = licencePdf.name;
        out.licenceExpiryDate = expiry || undefined;
        if (!isEdit && licence.trim()) history.unshift({ id: uid('lh'), licenceNumber: licence.trim(), changedDate: todayISO(), changedBy: 'Marcus Chen', fileName: licencePdf ? licencePdf.name : undefined, notes: 'Initial registration' });
        out.licenceHistory = history;
      } else {
        out.acquiredDate = acquiredDate || todayISO();
        out.volume = volume.trim() || undefined;
        out.purchasedBy = purchasedBy.trim() || undefined;
        out.vendorName = vendor.trim() || undefined;
        if (!out.usageLog) out.usageLog = [];
      }
      logBits.push(name.trim() + ' (' + iso + ', ' + activity.trim() + ') — ' + spaceID);
    }

    onSubmit({ source: out, isNew: !isEdit, log: (isEdit ? 'Updated ' : 'Registered ') + (cat === 'apparatus' ? 'irradiating apparatus ' : cat + ' source ') + logBits.join('') });
  };

  const title = isEdit ? 'Edit ' + (cat === 'apparatus' ? 'Apparatus' : 'Source') : 'Register Apparatus / Source';

  return (
    <Modal title={title} icon="☢" onClose={onClose} wide
      footer={<><BtnOutline onClick={onClose}>Cancel</BtnOutline><BtnPrimary onClick={submit}>{isEdit ? 'Save Changes' : 'Register'}</BtnPrimary></>}>
      <div className="grid gap-3">
        <FormGrid2>
          <Field label="Category" required>
            <select className={selCls} value={cat} disabled={isEdit} onChange={e => setCat(e.target.value as typeof cat)}>
              <option value="apparatus">Irradiating Apparatus</option>
              <option value="sealed">Sealed Source</option>
              <option value="unsealed">Unsealed Source</option>
            </select>
          </Field>
          {cat === 'apparatus' && !isEdit && (
            <Field label="Licence Stage" required hint="Possess = purchased, awaiting installation">
              <select className={selCls} value={stage} onChange={e => setStage(e.target.value as typeof stage)}>
                <option value="possess">Possess (purchase stage)</option>
                <option value="possess-use">Possess &amp; Use (installed)</option>
              </select>
            </Field>
          )}
        </FormGrid2>

        <Field label={cat === 'apparatus' ? 'Equipment Description' : 'Source Name'} required>
          <input className={inpCls} value={name} onChange={e => setName(e.target.value)}
            placeholder={cat === 'apparatus' ? 'e.g., X-ray Diffractometer — Bruker D8 Advance' : 'e.g., Co-60 Calibration Source'} />
        </Field>

        {cat !== 'apparatus' && (
          <FormGrid2>
            <Field label="Isotope" required>
              <select className={selCls} value={iso} onChange={e => setIso(e.target.value)}>{ISOTOPE_OPTIONS.map(i => <option key={i}>{i}</option>)}</select>
            </Field>
            <Field label="Activity" required hint="e.g., 3.7 GBq · 370 MBq · 10 µCi">
              <input className={inpCls} value={activity} onChange={e => setActivity(e.target.value)} placeholder="370 MBq" />
            </Field>
          </FormGrid2>
        )}

        <FormGrid2>
          <Field label="Location (Space ID)" required hint={loc ? loc.building + ' ' + loc.roomNumber + ' — ' + loc.department : ''}>
            <select className={selCls} value={spaceID} onChange={e => pickSpace(e.target.value)}>
              {locations.map(l => <option key={l.id} value={l.spaceID}>{l.spaceID} — {l.department}</option>)}
            </select>
          </Field>
          <Field label="Custodian" hint="Auto-filled with the department PI">
            <input className={inpCls} list="sfPersons" value={custodian} onChange={e => setCustodian(e.target.value)} placeholder="Responsible person" />
            <datalist id="sfPersons">{persons.map(p => <option key={p.id} value={p.name} />)}</datalist>
          </Field>
        </FormGrid2>

        <FormGrid2>
          <Field label={cat === 'apparatus' && stage === 'possess' && !isEdit ? 'Purchase Licence Number' : 'Licence Number'} required={cat === 'apparatus'}>
            <input className={inpCls + ' font-mono'} value={licence} onChange={e => setLicence(e.target.value)} placeholder="XA-2026-XXXX / IR-2026-XXXX" />
          </Field>
          <Field label="Licence Expiry Date" required={cat === 'apparatus'}>
            <input type="date" className={inpCls} value={expiry} onChange={e => setExpiry(e.target.value)} />
          </Field>
        </FormGrid2>

        {cat === 'apparatus' && (
          <>
            {stage === 'possess' && !isEdit && (
              <FormGrid2>
                <Field label="Import Licence / Permit No."><input className={inpCls + ' font-mono'} value={importLic} onChange={e => setImportLic(e.target.value)} placeholder="Import permit number" /></Field>
                <Field label="Installation Floor Plan (PDF)">
                  <input type="file" accept=".pdf" className={inpCls} onChange={e => { setFloorPlan(e.target.files && e.target.files[0] || null); }} />
                  {floorPlanName && !floorPlan && <div className="text-[10px] text-slate-600 mt-1">On file: {floorPlanName}</div>}
                </Field>
              </FormGrid2>
            )}
            <Field label="X-ray Tube Serial Number(s)" hint={stage === 'possess' && !isEdit ? 'May be confirmed after installation' : 'Comma-separated if multiple tubes'}>
              <input className={inpCls} value={serials} onChange={e => setSerials(e.target.value)} placeholder="SN-XXXX" />
            </Field>
            <Field label="Licence Document (PDF)" required={!isEdit} hint={isEdit ? 'Leave empty to keep the current file on record.' : undefined}>
              <input type="file" accept=".pdf" className={inpCls} onChange={e => setLicencePdf(e.target.files && e.target.files[0] || null)} />
              {s && s.licenceFile && !licencePdf && <div className="text-[10px] text-slate-600 mt-1">On file: {s.licenceFile}</div>}
            </Field>
          </>
        )}

        {cat === 'sealed' && (
          <FormGrid2>
            <Field label="Reference Activity" hint="Activity on the calibration certificate">
              <input className={inpCls} value={refActivity} onChange={e => setRefActivity(e.target.value)} placeholder="3.7 GBq" />
            </Field>
            <Field label="Reference Date"><input type="date" className={inpCls} value={refDate} onChange={e => setRefDate(e.target.value)} /></Field>
          </FormGrid2>
        )}

        {cat === 'unsealed' && (
          <>
            <FormGrid2>
              <Field label="Acquisition Date" required><input type="date" className={inpCls} value={acquiredDate} onChange={e => setAcquiredDate(e.target.value)} /></Field>
              <Field label="Volume"><input className={inpCls} value={volume} onChange={e => setVolume(e.target.value)} placeholder="e.g., 1 mL" /></Field>
            </FormGrid2>
            <FormGrid2>
              <Field label="Purchased By"><input className={inpCls} list="sfPersons" value={purchasedBy} onChange={e => setPurchasedBy(e.target.value)} /></Field>
              <Field label="Vendor / Supplier"><input className={inpCls} value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g., PerkinElmer" /></Field>
            </FormGrid2>
            <Note>Unsealed sources may only be registered in rooms covered by a Room Use Authorization, and the isotope must be authorized in that RUA.</Note>
          </>
        )}

        <ErrorBox msg={err} />
      </div>
    </Modal>
  );
}
