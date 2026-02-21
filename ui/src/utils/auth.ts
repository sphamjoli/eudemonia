import type { PermissionSources, RoleEntry } from '../types/auth';

export const ROLE_ENTRIES: RoleEntry[] = [
  { role: 'employee', to: '/employee', label: 'Employee', short: 'Em' },
  { role: 'admin', to: '/admin', label: 'Admin', short: 'Ad' },
  { role: 'issuer', to: '/issuer', label: 'Issuer', short: 'Is' },
  { role: 'attestor', to: '/attestor', label: 'Attestor', short: 'At' },
  { role: 'audit', to: '/audit', label: 'Audit', short: 'Au' },
];

export const DEFAULT_PERMISSION_SOURCES: PermissionSources = {
  admin: 'none',
  issuer: 'none',
  attestor: 'none',
  audit: 'none',
  employee: 'none',
};
