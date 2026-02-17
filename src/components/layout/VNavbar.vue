<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { isAuthenticated } from '@/lib/rbac'
import { useAuthStore } from '@/stores/auth.store';
import { onMounted } from 'vue';
import VButton from '../common/VButton.vue';
import VLogoutButton from '../auth/VLogoutButton.vue';

const route = useRoute()
const authStore = useAuthStore()

const getLinkClass = (path: string) => route.path === path ? "text-blue-600" : "text-heading hover:text-blue-500"


onMounted(async () => {
  await authStore.initialize()
})
</script>


<template>
<nav class="sticky bg-neutral-primary fixed w-full z-20 top-0 start-0 border-b border-default">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
  <RouterLink to="/" class="text-xl font-semibold text-heading">
      URL Shortener
    </RouterLink>
    
  <div class="flex items-center gap-6">

      <!-- Link -->
      <RouterLink to="/" :class="getLinkClass('/')">
        Shorten A URL
      </RouterLink>

      <!-- Auth button -->
      <div v-if="isAuthenticated()">
        <VLogoutButton />
      </div>

      <RouterLink v-else to="/login">
        <VButton class="text-white bg-brand hover:bg-brand-strong rounded-base text-sm px-3 py-2">
          Login
        </VButton>
      </RouterLink>

    </div>
  </div>
</nav>

</template>