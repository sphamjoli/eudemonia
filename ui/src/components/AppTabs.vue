<template>
  <div
    class="app-tabs"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      class="app-tab"
      :class="modelValue === tab.key ? 'active' : ''"
      :aria-selected="modelValue === tab.key"
      @click="select(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface AppTabItem {
  key: string;
  label: string;
}

defineProps<{
  modelValue: string;
  tabs: AppTabItem[];
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

function select(value: string): void {
  emit('update:modelValue', value);
}
</script>
