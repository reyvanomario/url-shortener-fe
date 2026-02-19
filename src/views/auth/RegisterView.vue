<script setup lang="ts">
import type { CreateUserRequest } from '@/interfaces/user.interface';
import { useUserStore } from '@/stores/user.store';
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import VInput from '@/components/common/VInput.vue';

const router = useRouter();

const userStore = useUserStore();

const createUserModel = reactive<CreateUserRequest & { username: string; password: string; }>({
    username: '',
    password: ''
})

const handleRegister = async () => {
    const createProfileResponse = await userStore.createUser(createUserModel)

    if (createProfileResponse) {
        router.push('/login')
    }
}
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
                  Create an account
              </h1>
              <form @submit.prevent="handleRegister" class="space-y-4 md:space-y-6" action="#">
                <div>
                  <label for="username" class="block mb-2 text-sm font-medium text-gray-900">Your username</label>
                  <VInput 
                    v-model="createUserModel.username" 
                    id="username" 
                    name="username" 
                    required
                  />
                </div>

                <div>
                    <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                    <VInput 
                      v-model="createUserModel.password" 
                      id="password" 
                      name="password" 
                      type="password" 
                      required
                    />
                </div>

                
                <button type="submit" class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" :disabled="userStore.loading">
            
                  Create an account
                </button>
                <p class="text-sm font-light text-gray-500">
                  Already have an account?
                  <RouterLink
                    to="/login"
                    class="font-medium text-blue-600 hover:underline"
                  >
                    Login here
                  </RouterLink>
                </p>
              </form>
          </div>
      </div>
  </div>
</section>
</template>


