import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { ThemeState } from '../types/theme';

export const useThemeStore = defineStore(
  'theme',
  () => {
    const accent = ref<ThemeState['accent']>('#f2c43d');
    const indexerOnline = ref<ThemeState['indexerOnline']>(false);

    function setAccent(value: string): void {
      accent.value = value;
    }

    function setIndexerOnline(value: boolean): void {
      indexerOnline.value = value;
    }

    return {
      accent,
      indexerOnline,
      setAccent,
      setIndexerOnline,
    };
  },
  {
    persist: {
      pick: ['accent'],
    },
  },
);
