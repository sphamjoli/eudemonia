import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

import Admin from './pages/Admin.vue';
import Employee from './pages/Employee.vue';
import Issuer from './pages/Issuer.vue';
import Attestor from './pages/Attestor.vue';
import Audit from './pages/Audit.vue';
import Home from './pages/Home.vue';
import { useAuthStore } from './stores/useAuthStore';
import { useWalletStore } from './stores/useWalletStore';
import type { AppRole } from './types/auth';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: 'Workspace', public: true } },
    {
      path: '/employee',
      component: Employee,
      meta: {
        title: 'Employee Portal',
        allowedRoles: ['employee'] satisfies AppRole[],
      },
    },
    {
      path: '/admin',
      component: Admin,
      meta: { title: 'Admin Console', allowedRoles: ['admin'] },
    },
    {
      path: '/issuer',
      component: Issuer,
      meta: { title: 'Issuer Console', allowedRoles: ['issuer'] },
    },
    {
      path: '/attestor',
      component: Attestor,
      meta: { title: 'Attestor Console', allowedRoles: ['attestor'] },
    },
    {
      path: '/audit',
      component: Audit,
      meta: { title: 'Audit Dashboard', allowedRoles: ['audit'] },
    },
  ],
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
});

router.beforeEach(async (to) => {
  const wallet = useWalletStore(pinia);
  const auth = useAuthStore(pinia);

  if (to.meta.public) {
    return true;
  }

  if (!wallet.providerReady) {
    await wallet.initialize();
  }

  await auth.refreshPermissions();

  const allowedRoles = (to.meta.allowedRoles as AppRole[] | undefined) ?? [];
  if (!wallet.connected) {
    return { path: '/' };
  }

  const authorized = allowedRoles.some((role) => auth.canAccess(role));
  if (authorized) {
    return true;
  }

  const fallback = auth.allowedNavEntries[0]?.to ?? '/';
  return to.path === fallback ? true : { path: fallback };
});

router.afterEach((to) => {
  const suffix = typeof to.meta.title === 'string' ? `${to.meta.title} · ` : '';
  document.title = `${suffix}Eudemonia`;
});

createApp(App).use(pinia).use(router).mount('#app');
