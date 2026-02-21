export type AppRole = 'employee' | 'admin' | 'issuer' | 'attestor' | 'audit';

export interface RoleEntry {
  role: AppRole;
  to: string;
  label: string;
  short: string;
}

export interface PermissionSources {
  admin: 'onchain' | 'none';
  issuer: 'onchain' | 'none';
  attestor: 'onchain' | 'none';
  audit: 'onchain' | 'none';
  employee: 'onchain' | 'none';
}
