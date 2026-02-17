<script setup lang="ts">
import VButton from '../common/VButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
    try {
        authStore.logout()
        router.push('/')
    } catch(error) {
        toast.error('Logout failed')
    }
}
</script>

<template>
  <VButton 
    @click="handleLogout" 
    class="text-white bg-red-600 hover:bg-red-800 box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
  >
    Logout
  </VButton>
</template>