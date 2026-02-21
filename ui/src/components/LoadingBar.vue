<template>
  <div
    v-if="show"
    class="loading-bar-wrap"
    aria-live="polite"
    aria-label="Loading in progress"
  >
    <div class="loading-bar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProcessStore } from '../stores/useProcessStore';

const processStore = useProcessStore();
const { quickTaskCount } = storeToRefs(processStore);

const show = computed(() => quickTaskCount.value > 0);
</script>

<style scoped>
.loading-bar-wrap {
  position: fixed;
  inset: 0 0 auto 0;
  height: 3px;
  overflow: hidden;
  z-index: 120;
}

.loading-bar {
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, #f2c43d, #f6d56f 45%, #f2c43d);
  animation: stream 1.2s ease-in-out infinite;
}

@keyframes stream {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(330%);
  }
}
</style>
