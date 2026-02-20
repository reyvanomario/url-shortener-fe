<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStats } from '@/composables/useStats'
import StatsOverview from '@/components/stats/StatsOverview.vue'
import ClicksChart from '@/components/stats/ClicksChart.vue'
import { toast } from 'vue-sonner'
import { getFullShortUrl } from '@/lib/config'

const route = useRoute()
const shortUrl = route.params.shortUrl as string

const { 
    stats, 
    loading, 
    error, 
    selectedRange,
    timeRanges,
    filteredDailyClicks,
    rangeTotalClicks,
    averageClicksPerDay,
    fetchStats,
} = useStats(shortUrl)


const totalClicks = computed(() => stats.value?.totalClicks || 0)
const fullUrl = computed(() => stats.value?.fullUrl || '')
const dailyClicks = computed(() => stats.value?.dailyClicks || [])


const fullShortUrl = computed(() => getFullShortUrl(shortUrl))
const recentClicks = computed(() => stats.value?.recentClicks || [])

// Copy Short URL to clipboard
const copyShortUrl = () => {
    if (fullUrl.value) {
        navigator.clipboard.writeText(fullShortUrl.value)
        toast.success('URL berhasil disalin!')
    }
}


onMounted(() => {
    fetchStats()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white border-b">
            <div class="container mx-auto px-4 py-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            URL Statistics
                        </h1>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <!-- Error State -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p class="text-red-600">{{ error }}</p>
                <button 
                    @click="fetchStats"
                    class="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Coba Lagi
                </button>
            </div>

            <!-- Loading State -->
            <div v-else-if="loading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p class="mt-4 text-gray-600">Loading statistics...</p>
            </div>

            <!-- Stats Content -->
            <div v-else-if="stats" class="space-y-6">
                <!-- Overview Stats -->
                <StatsOverview 
                    :total-clicks="totalClicks"
                    :range-total="rangeTotalClicks || totalClicks"
                    :average-daily="averageClicksPerDay || 0"
                />

                <div class="bg-white rounded-lg shadow-sm p-4">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-gray-700">Period</h3>
                        <div class="flex gap-2">
                            <button 
                                v-for="range in timeRanges" 
                                :key="range.value"
                                @click="selectedRange = range.value"
                                :class="[
                                    'px-4 py-2 rounded-lg text-sm transition-colors',
                                    selectedRange === range.value 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                ]"
                            >
                                {{ range.label }}
                            </button>
                        </div>
                    </div>
                </div>


                <!-- Tab Content -->
                <div class="mt-6">
                    <!-- Overview Tab -->
                    <div>
                        <ClicksChart :daily-clicks="filteredDailyClicks || dailyClicks" />
                        
                        <!-- URL Info Card -->
                        <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
                            <h3 class="font-semibold text-gray-700 mb-4">URL Information</h3>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-sm text-gray-500">Short URL</p>
                                    <div class="flex items-center gap-2">
                                        <code class="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {{ fullShortUrl }}
                                        </code>
                                        <button 
                                            @click="copyShortUrl"
                                            class="text-gray-400 hover:text-gray-600 mx-2"
                                            title="Copy full URL"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Full URL</p>
                                    <a 
                                        :href="fullUrl" 
                                        target="_blank"
                                        class="text-blue-600 hover:underline break-all"
                                    >
                                        {{ fullUrl }}
                                    </a>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p class="text-xs text-gray-400">Total Clicks</p>
                                        <p class="text-lg font-semibold">{{ totalClicks }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
                            <h3 class="font-semibold text-gray-700 mb-4">Recent Clicks (Last 10)</h3>
                            <div v-if="recentClicks.length === 0" class="text-center py-4 text-gray-500">
                                No recent clicks yet.
                            </div>
                            <div v-else class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <tr v-for="(click, index) in recentClicks" :key="index">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ new Date(click.timestamp).toLocaleString() }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ click.device || '-' }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ click.browser || '-' }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ click.os || '-' }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ click.ip || '-' }}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {{ click.country || '-' }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>