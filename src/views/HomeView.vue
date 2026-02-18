<!-- frontend/src/views/HomeView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ShortenUrlForm from '@/components/url/ShortenUrlForm.vue'
import { useUrlStore } from '@/stores/url.store'
import { getCurrentUser } from '@/lib/auth'
import type { CreateUrlRequest } from '@/interfaces/url.interface'
import { isAuthenticated } from '@/lib/rbac'
import UrlCard from '@/components/url/UrlCard.vue'
import type { Url } from '@/interfaces/url.interface'

const router = useRouter()
const urlStore = useUrlStore()

const urls = ref<Url[]>([])

const getCurrentUserUrls = async () => {
  const getCurrentUserUrlsResponse = await urlStore.getCurrentUserUrls()
  urls.value = getCurrentUserUrlsResponse ?? []
}

const shortenUrlModel = ref<CreateUrlRequest>({
    fullUrl: '',
    shortUrl: ''
})

const isLoading = computed(() => urlStore.loading)

const validationErrors = computed(() => urlStore.validationErrors)


// Action untuk handle submit dari form
const handleShortenUrl = async (data: CreateUrlRequest): Promise<any> => {
    try {
        const result = await urlStore.shortenUrl(data)
        
        if (result) {
            shortenUrlModel.value = {
                fullUrl: '',
                shortUrl: ''
            }
            
            if (isAuthenticated()) {
                await getCurrentUserUrls()
            }

            return result
            
        }
    } catch (error) {
        console.error(error)
    }
}

// Fetch URLs on mount
onMounted(async () => {
    if (isAuthenticated()) {
        await getCurrentUserUrls()
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50"> 
        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <!-- Hero Section -->
            <div class="text-center mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">
                    🔗 URL Shortener
                </h1>
                <p class="text-lg text-gray-600">
                    Shorten your URL so you can remember it easily
                </p>
            </div>

            <!-- Shorten Form -->
            <ShortenUrlForm 
                :action="handleShortenUrl"
                :shorten-url-model="shortenUrlModel"
                :is-editing="false"
            />

            <!-- Validation Errors Display -->
            <div v-if="urlStore.hasValidationErrors" class="max-w-2xl mx-auto mt-4">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 class="font-semibold text-red-800 mb-2">Mohon perbaiki error berikut:</h4>
                    <ul class="list-disc list-inside space-y-1">
                        <li 
                            v-for="(message, field) in validationErrors" 
                            :key="field"
                            class="text-sm text-red-600"
                        >
                            {{ field }}: {{ message }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- My URLs Section -->
            <div v-if="isAuthenticated()" class="max-w-4xl mx-auto mt-12">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">
                        My URL
                    </h2>
                    <span class="text-sm text-gray-500">
                        Total: {{ urls.length }} URL
                    </span>
                </div>

                <!-- Loading State -->
                <div v-if="urlStore.loading" class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p class="mt-4 text-gray-600">Loading your URLs...</p>
                </div>

                <!-- Empty State -->
                <div v-else-if="urls.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div class="text-6xl mb-4">🔗</div>
                    <p class="text-gray-500 mb-2">No URL yet</p>
                </div>

                <!-- URL Grid -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UrlCard
                        v-for="url in urls"
                        :key="url.id"
                        :url="url"
                    />
                </div>
            </div>

            <!-- Call to Action for Guest -->
            <div v-else class="max-w-2xl mx-auto mt-12 text-center">
                <div class="bg-white rounded-lg shadow-sm p-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">
                        Login to view your URL
                    </h3>

                    <div class="flex gap-4 justify-center">
                        <router-link 
                            to="/login" 
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </router-link>
                        <router-link 
                            to="/register" 
                            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Register
                        </router-link>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>