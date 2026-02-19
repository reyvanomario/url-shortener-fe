<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUrlStore } from '@/stores/url.store'
import type { CreateUrlRequest } from '@/interfaces/url.interface'
import { computed, type PropType, toRefs, watch } from 'vue';
import { getFullShortUrl } from '@/lib/config'

const domain = import.meta.env.VITE_DOMAIN || 'http://localhost:8000'

const urlStore = useUrlStore()

const result = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const props = defineProps({
    action: {
        type: Function as PropType<(data: CreateUrlRequest) => 
        Promise<void>>,
        required: true
    },
    shortenUrlModel: {
        type: Object as PropType<CreateUrlRequest>,
        required: true,
    }, 
    isEditing: {
        type: Boolean,
        default: false
    },
})

const model = ref<CreateUrlRequest>({ 
    ...props.shortenUrlModel 
});

const displayResult = computed(() => {
    if (!result.value) return null
    
    return {
        shortCode: result.value.shortUrl || result.value.short_url,
        fullShortUrl: getFullShortUrl(result.value.shortUrl || result.value.short_url),
        fullUrl: result.value.fullUrl || result.value.full_url
    }
})


const handleSubmit = async () => {
    loading.value = true;
    error.value = null;
    result.value = null;
    
    try {
        // Validasi URL panjang
        if (!model.value.fullUrl?.trim()) {
            throw new Error('URL panjang harus diisi');
        }
        
        // Validasi format URL
        try {
            new URL(model.value.fullUrl);
        } catch {
            throw new Error('Format URL tidak valid. Pastikan URL dimulai dengan http:// atau https://');
        }
        
        // Validasi shortUrl jika diisi
        if (model.value.shortUrl?.trim()) {
            const shortUrlPattern = /^[a-zA-Z0-9_-]+$/;
            if (!shortUrlPattern.test(model.value.shortUrl)) {
                throw new Error('Short URL hanya boleh berisi huruf, angka, tanda hubung (-) dan underscore (_)');
            }
            
            // Minimal 3 karakter
            if (model.value.shortUrl.length < 3) {
                throw new Error('Short URL minimal 3 karakter');
            }
            
            // Maksimal 50 karakter
            if (model.value.shortUrl.length > 50) {
                throw new Error('Short URL maksimal 50 karakter');
            }
        }
        
        
        // Panggil action
        const response = await props.action(model.value);
        result.value = response;

        
        // Reset form jika bukan editing
        if (!props.isEditing) {
            model.value.fullUrl = '';
            model.value.shortUrl = '';
        }
        
    } catch (err: any) {
        error.value = err.message || 'Terjadi kesalahan';
        console.error('Submit error:', err);
    } finally {
        loading.value = false;
    }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  alert('URL copied to clipboard!')
}
</script>

<template>
  <div class="max-w-full sm:max-w-2xl mx-auto p-4 sm:p-6">
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4">
        <!-- Input URL Panjang -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Long URL
          </label>
          <input
            v-model="model.fullUrl"
            type="url"
            required
            placeholder="Enter your long URL"
            class="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Input Short URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Short Url
          </label>
          <div class="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
            <span class="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-gray-300 bg-gray-50 text-gray-600 text-xs sm:text-sm whitespace-nowrap">
              {{ domain }}/
            </span>
            <input
              v-model="model.shortUrl"
              type="text"
              placeholder="your-short-url"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-l-none sm:rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 sm:py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span>{{ loading ? 'Processing...' : 'Shorten!' }}</span>
        </button>
      </form>

      <!-- Hasil Short URL -->
      <div v-if="displayResult" class="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
        <p class="text-green-700 font-medium mb-2 text-sm sm:text-base">Success!</p>
        <div class="space-y-2">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">Short URL:</p>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <a 
                :href="result.short_url" 
                target="_blank"
                class="text-blue-600 hover:underline break-all text-sm sm:text-base"
              >
                {{ displayResult.fullShortUrl }}
              </a>
              <button 
                @click="copyToClipboard(displayResult.fullShortUrl)"
                class="text-xs sm:text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-full sm:rounded"
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600">Full URL:</p>
            <p class="text-gray-800 break-all text-sm sm:text-base">{{ displayResult.fullUrl }}</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
        <p class="text-red-600 text-sm sm:text-base">{{ error }}</p>
      </div>
    </div>
  </div>
</template>