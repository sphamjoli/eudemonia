<template>
  <aside
    class="navigation-rail"
    aria-label="Primary navigation"
  >
    <div class="rail-brand">
      <p class="rail-brand-label">Eudemonia</p>
      <p class="rail-brand-subtitle">Policy Engine</p>
    </div>

    <nav class="rail-links">
      <RouterLink
        to="/"
        class="rail-link"
        aria-label="Workspace home"
      >
        <span class="rail-link-pill">Hm</span>
        <span class="rail-link-label">Home</span>
      </RouterLink>

      <RouterLink
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        class="rail-link"
        :aria-label="entry.label"
        @click="auth.setActiveRole(entry.role)"
      >
        <span class="rail-link-pill">{{ entry.short }}</span>
        <span class="rail-link-label">{{ entry.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../stores/useAuthStore';

const auth = useAuthStore();
const entries = computed(() => auth.allowedNavEntries);
</script>
