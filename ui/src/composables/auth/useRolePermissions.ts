import type { AppRole, PermissionSources } from '../../types/auth';

const PAYMENT_ROLE_INDEX = {
  ADMIN: 0,
  ISSUER: 1,
  EMPLOYEE: 2,
  ATTESTOR: 3,
  AUDITOR: 4,
} as const;

function hasRoleBit(mask: bigint, roleIndex: number): boolean {
  const roleBit = 1n << BigInt(roleIndex);
  return (mask & roleBit) !== 0n;
}

function emptySources(): PermissionSources {
  return {
    admin: 'none',
    issuer: 'none',
    attestor: 'none',
    audit: 'none',
    employee: 'none',
  };
}

export function useRolePermissions() {
  function resolveRoles(parameters: { roleMask: bigint; participantActive: boolean }): {
    roles: AppRole[];
    sources: PermissionSources;
  } {
    const sources = emptySources();
    const roles: AppRole[] = [];

    if (
      parameters.participantActive &&
      hasRoleBit(parameters.roleMask, PAYMENT_ROLE_INDEX.EMPLOYEE)
    ) {
      roles.push('employee');
      sources.employee = 'onchain';
    }

    if (
      parameters.participantActive &&
      hasRoleBit(parameters.roleMask, PAYMENT_ROLE_INDEX.ADMIN)
    ) {
      roles.push('admin');
      sources.admin = 'onchain';
    }

    if (
      parameters.participantActive &&
      hasRoleBit(parameters.roleMask, PAYMENT_ROLE_INDEX.ISSUER)
    ) {
      roles.push('issuer');
      sources.issuer = 'onchain';
    }

    if (
      parameters.participantActive &&
      hasRoleBit(parameters.roleMask, PAYMENT_ROLE_INDEX.ATTESTOR)
    ) {
      roles.push('attestor');
      sources.attestor = 'onchain';
    }

    if (
      parameters.participantActive &&
      hasRoleBit(parameters.roleMask, PAYMENT_ROLE_INDEX.AUDITOR)
    ) {
      roles.push('audit');
      sources.audit = 'onchain';
    }

    return {
      roles,
      sources,
    };
  }

  return {
    resolveRoles,
  };
}
