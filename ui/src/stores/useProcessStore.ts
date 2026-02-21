import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useProcessStore = defineStore('process', () => {
  const quickTaskCount = ref(0);

  function beginQuickTask(): void {
    quickTaskCount.value += 1;
  }

  function endQuickTask(): void {
    quickTaskCount.value = Math.max(quickTaskCount.value - 1, 0);
  }

  async function runQuickTask<T>(fn: () => Promise<T>): Promise<T> {
    beginQuickTask();
    try {
      return await fn();
    } finally {
      endQuickTask();
    }
  }

  return {
    quickTaskCount,
    beginQuickTask,
    endQuickTask,
    runQuickTask,
  };
});
