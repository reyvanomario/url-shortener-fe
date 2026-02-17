<script setup lang="ts">
import { computed } from 'vue'
import type { RefererStat } from '@/interfaces/stats.interface'

const props = defineProps<{
    referers?: RefererStat[] 
}>()

const safeReferers = computed(() => props.referers || [])
const hasData = computed(() => safeReferers.value.length > 0)
const maxClicks = computed(() => 
    hasData.value ? Math.max(...safeReferers.value.map(r => r.clicks)) : 1
)

// Get favicon URL for referer
const getFavicon = (referer: string): string => {
    try {
        if (!referer || referer === '') return ''
        const url = new URL(referer)
        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`
    } catch {
        return ''
    }
}

// Get display name for referer
const getRefererName = (referer: string): string => {
    if (!referer || referer === '') return 'Direct / Unknown'
    
    try {
        const url = new URL(referer)
        return url.hostname.replace('www.', '')
    } catch {
        return referer.substring(0, 30) + (referer.length > 30 ? '...' : '')
    }
}

// Get icon for known platforms
const getPlatformIcon = (referer: string): string => {
    const url = referer.toLowerCase()
    if (url.includes('google')) return '🔍'
    if (url.includes('facebook')) return '📘'
    if (url.includes('twitter') || url.includes('x.com')) return '🐦'
    if (url.includes('instagram')) return '📷'
    if (url.includes('linkedin')) return '💼'
    if (url.includes('youtube')) return '▶️'
    if (url.includes('t.me') || url.includes('telegram')) return '✈️'
    if (url.includes('whatsapp')) return '💬'
    return '🔗'
}

const handleImgError = (event: Event) => {
    const target = event.target as HTMLImageElement | null
    if (target) {
        target.style.display = 'none'
    }
}
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Top Referers</h3>
        
        <div v-if="!hasData" class="text-center py-8 text-gray-500">
            <p>No referers yet</p>
        </div>
        
        <div v-else class="space-y-3">
            <div 
                v-for="(referer, index) in safeReferers" 
                :key="referer.referer"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
                <!-- Icon -->
                <div class="w-8 h-8 flex items-center justify-center text-xl">
                    <img 
                        v-if="getFavicon(referer.referer)" 
                        :src="getFavicon(referer.referer)" 
                        class="w-5 h-5"
                        :alt="getRefererName(referer.referer)"
                        @error="handleImgError"
                    />
                    <span v-else>{{ getPlatformIcon(referer.referer) }}</span>
                </div>
                
                <!-- Referer Info -->
                <div class="flex-1">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-sm">{{ getRefererName(referer.referer) }}</span>
                        <span class="text-sm font-semibold text-blue-600">{{ referer.clicks }}</span>
                    </div>
                    <div class="text-xs text-gray-400 truncate max-w-md">
                        {{ referer.referer }}
                    </div>
                </div>
                
                <!-- Percentage -->
                <div class="text-sm text-gray-500 w-16 text-right">
                    {{ ((referer.clicks / maxClicks * 100)).toFixed(0) }}%
                </div>
            </div>
        </div>
    </div>
</template>