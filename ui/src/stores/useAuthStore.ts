import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import { type Address, zeroAddress } from 'viem';
import { useRolePermissions } from '../composables/auth/useRolePermissions';
import { appConfig } from '../lib/config';
import { paymentRegistryAbi, publicClient } from '../lib/adi';
import type { AppRole, PermissionSources } from '../types/auth';
import { DEFAULT_PERMISSION_SOURCES, ROLE_ENTRIES } from '../utils/auth';
import { useWalletStore } from './useWalletStore';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const wallet = useWalletStore();
    const { resolveRoles } = useRolePermissions();

    const account = ref<Address | null>(null);
    const roles = ref<AppRole[]>([]);
    const primaryRole = ref<AppRole | null>(null);
    const loading = ref(false);
    const roleSources = reactive<PermissionSources>({
      ...DEFAULT_PERMISSION_SOURCES,
    });

    function canAccess(role: AppRole): boolean {
      return roles.value.includes(role);
    }

    function setActiveRole(role: AppRole): void {
      if (!canAccess(role)) {
        return;
      }
      primaryRole.value = role;
    }

    function clearPermissions(): void {
      roles.value = [];
      primaryRole.value = null;
      Object.assign(roleSources, DEFAULT_PERMISSION_SOURCES);
    }

    async function refreshPermissions(): Promise<void> {
      loading.value = true;
      account.value = wallet.account ?? null;

      try {
        if (!wallet.account || appConfig.paymentRegistry === zeroAddress) {
          clearPermissions();
          return;
        }

        const participant = await publicClient.readContract({
          address: appConfig.paymentRegistry,
          abi: paymentRegistryAbi,
          functionName: 'getParticipant',
          args: [wallet.account],
        });

        const resolved = resolveRoles({
          roleMask: participant.roleMask as bigint,
          participantActive: Boolean(participant.active && participant.exists),
        });

        roles.value = resolved.roles;
        Object.assign(roleSources, resolved.sources);

        if (!primaryRole.value || !resolved.roles.includes(primaryRole.value)) {
          primaryRole.value = resolved.roles[0] ?? null;
        }
      } catch {
        clearPermissions();
      } finally {
        loading.value = false;
      }
    }

    const allowedNavEntries = computed(() =>
      ROLE_ENTRIES.filter((entry) => canAccess(entry.role)),
    );
    const primaryRoleLabel = computed(() => primaryRole.value ?? 'guest');

    return {
      account,
      roles,
      primaryRole,
      primaryRoleLabel,
      roleSources,
      loading,
      allowedNavEntries,
      canAccess,
      setActiveRole,
      clearPermissions,
      refreshPermissions,
    };
  },
  {
    persist: {
      pick: ['primaryRole'],
    },
  },
);
