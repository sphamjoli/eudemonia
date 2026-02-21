<template>
  <nav
    class="mobile-tabs"
    aria-label="Mobile navigation"
  >
    <RouterLink
      to="/"
      class="mobile-tab"
    >
      <span class="mobile-tab-short">Hm</span>
      <span class="mobile-tab-label">Home</span>
    </RouterLink>

    <RouterLink
      v-for="entry in entries"
      :key="entry.to"
      :to="entry.to"
      class="mobile-tab"
      @click="auth.setActiveRole(entry.role)"
    >
      <span class="mobile-tab-short">{{ entry.short }}</span>
      <span class="mobile-tab-label">{{ entry.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/useAuthStore';

const auth = useAuthStore();
const entries = computed(() => auth.allowedNavEntries);
</script>
