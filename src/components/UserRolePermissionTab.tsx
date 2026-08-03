import React from 'react';
import { User } from '../types';
import {
  ShieldCheck, Eye, Plus, Pencil, Trash2, Building2, Users, MapPin,
  UserCheck, ChevronDown, ChevronRight, Lock, Unlock, CalendarClock,
  Check, X
} from 'lucide-react';

interface UserRolePermissionTabProps {
  currentUser: User;
  allUsers: User[];
}

/* ─── Permission definitions ─── */
export interface PermissionSet {
  label: string;
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'admin' | 'view' | 'booking';
}

export const PERMISSIONS: PermissionSet[] = [
  { label: 'View Departments', key: 'canViewDepartments', icon: Eye, category: 'view' },
  { label: 'Add Departments', key: 'canAddDepartment', icon: Plus, category: 'admin' },
  { label: 'Edit Departments', key: 'canEditDepartment', icon: Pencil, category: 'admin' },
  { label: 'Delete Departments', key: 'canDeleteDepartment', icon: Trash2, category: 'admin' },
  { label: 'View Locations', key: 'canViewLocations', icon: Eye, category: 'view' },
  { label: 'Add Locations', key: 'canAddLocation', icon: Plus, category: 'admin' },
  { label: 'Edit Locations', key: 'canEditLocation', icon: Pencil, category: 'admin' },
  { label: 'Delete Locations', key: 'canDeleteLocation', icon: Trash2, category: 'admin' },
  { label: 'View Field Team Assignments', key: 'canViewFtm', icon: Eye, category: 'view' },
  { label: 'Add Field Team Assignments', key: 'canAddFtm', icon: Plus, category: 'admin' },
  { label: 'Edit Field Team Assignments', key: 'canEditFtm', icon: Pencil, category: 'admin' },
  { label: 'Delete Field Team Assignments', key: 'canDeleteFtm', icon: Trash2, category: 'admin' },
  { label: 'View Users & Personnel', key: 'canViewUsers', icon: Users, category: 'view' },
  { label: 'Add Users', key: 'canAddUser', icon: Plus, category: 'admin' },
  { label: 'Edit Personnel', key: 'canEditPerson', icon: Pencil, category: 'admin' },
  { label: 'Delete Users & Personnel', key: 'canDeletePerson', icon: Trash2, category: 'admin' },
  { label: 'Book Inspection Slot', key: 'canBookInspection', icon: CalendarClock, category: 'booking' },
];

/* ─── Role → Permission map ─── */
export type PermissionKey = typeof PERMISSIONS[number]['key'];

const DEFAULT_PERMISSIONS: Record<string, Record<PermissionKey, boolean>> = {
  superadmin: {
    canViewDepartments: true, canAddDepartment: true, canEditDepartment: true, canDeleteDepartment: true,
    canViewLocations: true, canAddLocation: true, canEditLocation: true, canDeleteLocation: true,
    canViewFtm: true, canAddFtm: true, canEditFtm: true, canDeleteFtm: true,
    canViewUsers: true, canAddUser: true, canEditPerson: true, canDeletePerson: true,
    canBookInspection: true,
  },
  admin: {
    canViewDepartments: true, canAddDepartment: true, canEditDepartment: true, canDeleteDepartment: false,
    canViewLocations: true, canAddLocation: true, canEditLocation: true, canDeleteLocation: false,
    canViewFtm: true, canAddFtm: true, canEditFtm: true, canDeleteFtm: true,
    canViewUsers: true, canAddUser: true, canEditPerson: true, canDeletePerson: true,
    canBookInspection: true,
  },
  hseo_management: {
    canViewDepartments: true, canAddDepartment: false, canEditDepartment: false, canDeleteDepartment: false,
    canViewLocations: true, canAddLocation: false, canEditLocation: false, canDeleteLocation: false,
    canViewFtm: true, canAddFtm: false, canEditFtm: false, canDeleteFtm: false,
    canViewUsers: true, canAddUser: false, canEditPerson: false, canDeletePerson: false,
    canBookInspection: true,
  },
  field_team_member: {
    canViewDepartments: false, canAddDepartment: false, canEditDepartment: false, canDeleteDepartment: false,
    canViewLocations: false, canAddLocation: false, canEditLocation: false, canDeleteLocation: false,
    canViewFtm: true, canAddFtm: false, canEditFtm: false, canDeleteFtm: false,
    canViewUsers: true, canAddUser: false, canEditPerson: true, canDeletePerson: false,
    canBookInspection: true,
  },
  staff: {
    canViewDepartments: false, canAddDepartment: false, canEditDepartment: false, canDeleteDepartment: false,
    canViewLocations: false, canAddLocation: false, canEditLocation: false, canDeleteLocation: false,
    canViewFtm: false, canAddFtm: false, canEditFtm: false, canDeleteFtm: false,
    canViewUsers: false, canAddUser: false, canEditPerson: false, canDeletePerson: false,
    canBookInspection: true,
  },
  PI: {
    canViewDepartments: false, canAddDepartment: false, canEditDepartment: false, canDeleteDepartment: false,
    canViewLocations: false, canAddLocation: false, canEditLocation: false, canDeleteLocation: false,
    canViewFtm: false, canAddFtm: false, canEditFtm: false, canDeleteFtm: false,
    canViewUsers: false, canAddUser: false, canEditPerson: false, canDeletePerson: false,
    canBookInspection: true,
  },
  Contact: {
    canViewDepartments: false, canAddDepartment: false, canEditDepartment: false, canDeleteDepartment: false,
    canViewLocations: false, canAddLocation: false, canEditLocation: false, canDeleteLocation: false,
    canViewFtm: false, canAddFtm: false, canEditFtm: false, canDeleteFtm: false,
    canViewUsers: false, canAddUser: false, canEditPerson: false, canDeletePerson: false,
    canBookInspection: true,
  },
};

export const ROLE_PERMISSIONS: Record<string, Record<PermissionKey, boolean>> = DEFAULT_PERMISSIONS;

/* ─── Helper: check permission for current user ─── */
export function hasPermission(role: string, permissionKey: PermissionKey): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms[permissionKey] ?? false;
}

/* ─── Role display config ─── */
const ROLE_DISPLAY: Record<string, { label: string; description: string; portalAccess: boolean }> = {
  superadmin: { label: 'Superuser', description: 'Full system access', portalAccess: true },
  admin: { label: 'Admin', description: 'Full administrative privileges', portalAccess: true },
  hseo_management: { label: 'HSEO Management', description: 'Read-only access to all modules', portalAccess: true },
  field_team_member: { label: 'Field Team Member', description: 'View FTA, users, add/edit personnel', portalAccess: true },
  staff: { label: 'Staff', description: 'Inspection booking only', portalAccess: false },
  PI: { label: 'Principal Investigator', description: 'Inspection booking only', portalAccess: false },
  Contact: { label: 'Department Contact', description: 'Inspection booking only', portalAccess: false },
};

/* ─── Tab Visibility map ─── */
export const TAB_VISIBILITY: Record<string, PermissionKey[]> = {
  overview: [],
  departments: ['canViewDepartments'],
  'user-role': ['canViewDepartments'],
  location: ['canViewLocations'],
  directory: ['canViewUsers'],
  ftm: ['canViewFtm'],
  equipment: ['canViewUsers'],
  inspections: ['canViewUsers'],
  radiation: ['canViewUsers'],
  laser: ['canViewUsers'],
  hotwork: ['canViewUsers'],
  cse: ['canViewUsers'],
  uav: ['canViewUsers'],
  exposure: ['canViewUsers'],
  water: ['canViewUsers'],
  ieq: ['canViewUsers'],
};

export function canViewTab(role: string, tab: string): boolean {
  const required = TAB_VISIBILITY[tab];
  if (!required || required.length === 0) return true;
  return required.every(key => hasPermission(role, key as PermissionKey));
}

/* ─── Toggle Switch Component ─── */
function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/20 ${
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
      } ${enabled ? 'bg-slate-200' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform ${
        enabled ? 'translate-x-4.5 bg-slate-700' : 'translate-x-0.5 bg-slate-500'
      }`} style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  );
}

/* ─── Component ─── */
export default function UserRolePermissionTab({ currentUser, allUsers }: UserRolePermissionTabProps) {
  const [permissions, setPermissions] = React.useState<Record<string, Record<PermissionKey, boolean>>>(() =>
    JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
  );
  const [expandedRole, setExpandedRole] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const isSuperuser = currentUser.role === 'superadmin';
  const roles = Object.keys(ROLE_DISPLAY);

  const handleToggle = (role: string, key: PermissionKey) => {
    if (!isSuperuser) return;
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [key]: !prev[role][key] }
    }));
    // Also update the exported ROLE_PERMISSIONS
    ROLE_PERMISSIONS[role][key] = !permissions[role][key];
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPermissions(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)));
    Object.keys(DEFAULT_PERMISSIONS).forEach(role => {
      Object.keys(DEFAULT_PERMISSIONS[role]).forEach(key => {
        ROLE_PERMISSIONS[role][key] = DEFAULT_PERMISSIONS[role][key as PermissionKey];
      });
    });
    setHasChanges(false);
    setSaved(false);
  };

  const myPerms = PERMISSIONS.filter(p => permissions[currentUser.role]?.[p.key as PermissionKey]);

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-200">Roles & Permissions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Signed in as <span className="text-slate-300 font-medium">{currentUser.name}</span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-400">{ROLE_DISPLAY[currentUser.role]?.label}</span>
          </p>
        </div>
        {isSuperuser && (
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
            {hasChanges && (
              <button onClick={handleReset} className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition">
                Reset
              </button>
            )}
            <button onClick={handleSave} disabled={!hasChanges}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${
                hasChanges ? 'bg-slate-200 text-slate-800 hover:bg-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* ── Your Permissions (compact) ── */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Permissions</span>
          <span className="text-[10px] text-slate-500 font-mono">{myPerms.length}/{PERMISSIONS.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERMISSIONS.map(p => {
            const on = permissions[currentUser.role]?.[p.key as PermissionKey];
            return (
              <span key={p.key} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                on ? 'bg-slate-200/10 text-slate-200 border border-slate-600/30' : 'bg-slate-800/40 text-slate-600 border border-slate-800/30'
              }`}>
                {on ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                {p.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Non-superuser notice ── */}
      {!isSuperuser && (
        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          View only — only Superusers can modify permissions.
        </p>
      )}

      {/* ── Permission Matrix ── */}
      <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-700/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Permission Matrix</span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium w-56">Permission</th>
                {roles.map(role => (
                  <th key={role} className="px-2 py-2.5 text-center">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${role === currentUser.role ? 'text-slate-200' : 'text-slate-500'}`}>
                      {ROLE_DISPLAY[role]?.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, idx) => (
                <tr key={perm.key} className={`border-b border-slate-800/30 ${idx % 2 === 0 ? '' : 'bg-slate-800/10'}`}>
                  <td className="px-4 py-2.5 text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <perm.icon className="h-3 w-3 text-slate-500" />
                      {perm.label}
                    </div>
                  </td>
                  {roles.map(role => {
                    const enabled = permissions[role]?.[perm.key as PermissionKey] ?? false;
                    const isSelf = role === 'superadmin';
                    return (
                      <td key={role} className="px-2 py-2.5 text-center">
                        <Toggle
                          enabled={enabled}
                          onChange={() => handleToggle(role, perm.key as PermissionKey)}
                          disabled={!isSuperuser || isSelf}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden divide-y divide-slate-700/20">
          {roles.map(role => {
            const count = PERMISSIONS.filter(p => permissions[role]?.[p.key as PermissionKey]).length;
            return (
              <div key={role}>
                <button
                  onClick={() => setExpandedRole(expandedRole === role ? null : role)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${role === currentUser.role ? 'text-slate-200' : 'text-slate-400'}`}>
                      {ROLE_DISPLAY[role]?.label}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">{count}/{PERMISSIONS.length}</span>
                  </div>
                  {expandedRole === role
                    ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                    : <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                  }
                </button>
                {expandedRole === role && (
                  <div className="px-4 pb-3 space-y-2">
                    {PERMISSIONS.map(perm => {
                      const enabled = permissions[role]?.[perm.key as PermissionKey] ?? false;
                      const isSelf = role === 'superadmin';
                      return (
                        <div key={perm.key} className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{perm.label}</span>
                          <Toggle
                            enabled={enabled}
                            onChange={() => handleToggle(role, perm.key as PermissionKey)}
                            disabled={!isSuperuser || isSelf}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── What Each Role Can Do ── */}
      <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-700/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">What Each Role Can Do</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-800/20">
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Role</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Portal</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Users</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Locations</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Departments</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Field Team</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium whitespace-nowrap">Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {roles.map(role => {
                const display = ROLE_DISPLAY[role];
                const perms = permissions[role];
                const isCurrentRole = role === currentUser.role;
                
                // Helper to build action string
                const actions = (checks: { key: PermissionKey; label: string }[]) => {
                  const granted = checks.filter(c => perms?.[c.key]);
                  if (granted.length === 0) return '—';
                  return granted.map(g => g.label).join(' · ');
                };

                const userActions = actions([
                  { key: 'canViewUsers', label: 'View' },
                  { key: 'canAddUser', label: 'Add' },
                  { key: 'canEditPerson', label: 'Edit' },
                  { key: 'canDeletePerson', label: 'Delete' },
                ]);

                const locationActions = actions([
                  { key: 'canViewLocations', label: 'View' },
                  { key: 'canAddLocation', label: 'Add' },
                  { key: 'canEditLocation', label: 'Edit' },
                  { key: 'canDeleteLocation', label: 'Delete' },
                ]);

                const deptActions = actions([
                  { key: 'canViewDepartments', label: 'View' },
                  { key: 'canAddDepartment', label: 'Add' },
                  { key: 'canEditDepartment', label: 'Edit' },
                  { key: 'canDeleteDepartment', label: 'Delete' },
                ]);

                const ftmActions = actions([
                  { key: 'canViewFtm', label: 'View' },
                  { key: 'canAddFtm', label: 'Add' },
                  { key: 'canEditFtm', label: 'Edit' },
                  { key: 'canDeleteFtm', label: 'Delete' },
                ]);

                const bookingActions = actions([
                  { key: 'canBookInspection', label: 'Book' },
                ]);
                
                return (
                  <tr key={role} className={isCurrentRole ? 'bg-slate-800/10' : ''}>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-semibold ${isCurrentRole ? 'text-slate-100' : 'text-slate-300'}`}>
                        {display?.label}
                      </span>
                      {isCurrentRole && <span className="text-[9px] text-slate-500 ml-1.5">(you)</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {display?.portalAccess ? (
                        <Check className="h-3.5 w-3.5 text-slate-400 inline" />
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] ${userActions === '—' ? 'text-slate-600' : 'text-slate-300'}`}>{userActions}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] ${locationActions === '—' ? 'text-slate-600' : 'text-slate-300'}`}>{locationActions}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] ${deptActions === '—' ? 'text-slate-600' : 'text-slate-300'}`}>{deptActions}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] ${ftmActions === '—' ? 'text-slate-600' : 'text-slate-300'}`}>{ftmActions}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[10px] ${bookingActions === '—' ? 'text-slate-600' : 'text-slate-300'}`}>{bookingActions}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Roles & Users ── */}
      <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-700/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Roles & Users</span>
        </div>
        <div className="divide-y divide-slate-800/30">
          {roles.map(role => {
            const roleUsers = allUsers.filter(u => u.role === role);
            const display = ROLE_DISPLAY[role];
            const count = PERMISSIONS.filter(p => permissions[role]?.[p.key as PermissionKey]).length;
            return (
              <div key={role} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${role === currentUser.role ? 'text-slate-100' : 'text-slate-300'}`}>
                    {display?.label}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">{count} perms · {roleUsers.length} user{roleUsers.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{display?.description}</p>
                {roleUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roleUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/20 rounded px-2 py-1">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${u.avatarColor}`}>
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-[10px] text-slate-300">{u.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
