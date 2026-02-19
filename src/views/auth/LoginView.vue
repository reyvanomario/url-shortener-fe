<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest } from '@/interfaces/auth.interface';


const route = useRoute();
const authStore = useAuthStore();

const loginData = ref<LoginRequest>({
    username: '',
    password: '',
});

onMounted(() => {
    authStore.initialize();
});

const handleLogin = async () => {
    const redirectQuery = route.query.redirect as string;
    
    await authStore.login(loginData.value, redirectQuery);
};
</script>

<template>
  <section class="bg-gray-50">
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
          URL Shortener  
      </a>
      <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                  Sign in to your account
              </h1>
              <form @submit.prevent="handleLogin" class="space-y-4 md:space-y-6" action="#">
                  <div>
                      <label for="username" class="block mb-2 text-sm font-medium text-gray-900">Your username</label>
                      <input v-model="loginData.username" type="text" name="username" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" placeholder="username" required>
                  </div>
                  <div>
                      <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                      <input v-model="loginData.password" type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" required>
                  </div>
                  
                  <button type="submit" :disabled="authStore.loading" class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">{{ authStore.loading ? 'Signing in...' : 'Sign in' }}</button>
                  <p class="text-sm font-light text-gray-500">
                      Don’t have an account yet? 
                      <RouterLink to="/register" class="font-medium text-blue-600 hover:underline dark:text-blue-500">
                        Register
                      </RouterLink>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>  
</template>
