<script setup lang="ts">
import type { Url } from '@/interfaces/url.interface'
import { getFullShortUrl } from '@/lib/config'
import { computed } from 'vue';
import { toast } from 'vue-sonner'

const props = defineProps<{
    url: Url
}>()


const fullShortUrl = computed(() => getFullShortUrl(props.url.shortUrl))

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
        .then(() => {
            toast.success('URL copied to clipboard!')
        })
        .catch(() => {
            toast.error('Gagal menyalin URL')
        })
}

const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173'
const shortUrlFull = `${baseUrl}/${props.url.shortUrl}`
</script>

<template>
    <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
        <!-- Card Header -->
        <div class="p-4 border-b border-gray-100">
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                    <a 
                        :href="shortUrlFull"
                        target="_blank"
                        class="text-blue-600 hover:text-blue-800 font-medium truncate block"
                        :title="shortUrlFull"
                    >
                        {{ fullShortUrl }}
                    </a>
                </div>
                <div class="flex gap-3 ml-2">
                    <button 
                        @click="copyToClipboard(shortUrlFull)"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Salin URL"
                    >
                        Copy
                    </button>
                    <router-link 
                        :to="`/stats/${url.shortUrl}`"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Lihat Statistik"
                    >
                        View Statistics
                    </router-link>
                </div>
            </div>
        </div>

        <div class="p-4">
            <div class="text-sm text-gray-600 mb-3">
                <div class="truncate" :title="url.fullUrl">
                    <span class="text-gray-400">🔗</span>
                    {{ url.fullUrl }}
                </div>
            </div>

            <div class="flex justify-between items-center text-xs">
                <div class="flex items-center gap-1">
                    <span class="text-gray-400">Total klik: </span>
                    <span class="text-gray-600">{{ url.click || 0 }}</span>
                </div>
            </div>
        </div>
    </div>
</template>