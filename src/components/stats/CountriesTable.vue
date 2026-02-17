<script setup lang="ts">
import { computed } from 'vue'
import type { CountryStat } from '@/interfaces/stats.interface'

const props = defineProps<{
    countries?: CountryStat[]
}>()

const safeCountries = computed(() => props.countries || [])
const hasData = computed(() => safeCountries.value.length > 0)
const maxClicks = computed(() => 
    hasData.value ? Math.max(...safeCountries.value.map(c => c.clicks)) : 1
)

// Country code to flag emoji mapping
const getCountryFlag = (code: string): string => {
    if (!code) return '🌍'
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

// Country names mapping (simplified)
const getCountryName = (code: string): string => {
    const names: Record<string, string> = {
        'ID': 'Indonesia',
        'US': 'United States',
        'SG': 'Singapore',
        'MY': 'Malaysia',
        'JP': 'Japan',
        'KR': 'South Korea',
        'GB': 'United Kingdom',
        'AU': 'Australia',
        'IN': 'India'
    }
    return names[code] || code
}
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Top Countries</h3>
        
        <div v-if="!hasData" class="text-center py-8 text-gray-500">
            <p>No clicks yet</p>
        </div>
        
        <div v-else class="space-y-4">
            <div 
                v-for="(country, index) in safeCountries" 
                :key="country.country"
                class="flex items-center gap-4"
            >
                <div class="w-8 text-2xl">
                    {{ getCountryFlag(country.country) }}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">{{ getCountryName(country.country) }}</span>
                        <span class="text-sm text-gray-600">{{ country.clicks }} clicks</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            class="bg-blue-500 rounded-full h-2 transition-all duration-500"
                            :style="{ 
                                width: (country.clicks / maxClicks * 100) + '%' 
                            }"
                        ></div>
                    </div>
                </div>
                <div class="w-8 text-gray-400 text-sm">
                    #{{ index + 1 }}
                </div>
            </div>
        </div>
    </div>
</template>