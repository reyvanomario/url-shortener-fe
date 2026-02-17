<!-- views/StatsView.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStats } from '@/composables/useStats'
import StatsOverview from '@/components/stats/StatsOverview.vue'
import ClicksChart from '@/components/stats/ClicksChart.vue'
import CountriesTable from '@/components/stats/CountriesTable.vue'
import ReferersTable from '@/components/stats/ReferersTable.vue'
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
    clicksToday,
    fetchStats,
    // exportStats
} = useStats(shortUrl)


const totalClicks = computed(() => stats.value?.totalClicks || 0)
const fullUrl = computed(() => stats.value?.fullUrl || '')
const shortUrlCode = computed(() => stats.value?.shortUrl || shortUrl)
const topCountries = computed(() => stats.value?.topCountries || [])
const topReferers = computed(() => stats.value?.topReferers || [])
const dailyBreakdown = computed(() => stats.value?.dailyBreakdown || [])

const hasData = computed(() => !!stats.value)
const hasClicks = computed(() => totalClicks.value > 0)

const activeTab = ref<'overview' | 'countries' | 'referers'>('overview')

const fullShortUrl = computed(() => getFullShortUrl(shortUrl))

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

                <!-- Time Range Selector (jika diaktifkan) -->
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

                <!-- Tabs -->
                <div class="border-b">
                    <nav class="flex gap-4">
                        <button 
                            @click="activeTab = 'overview'"
                            :class="[
                                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                                activeTab === 'overview' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            ]"
                        >
                            Overview
                        </button>
                        <button 
                            @click="activeTab = 'countries'"
                            :class="[
                                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                                activeTab === 'countries' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            ]"
                        >
                            Countries
                        </button>
                        <button 
                            @click="activeTab = 'referers'"
                            :class="[
                                'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                                activeTab === 'referers' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            ]"
                        >
                            Referers
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div class="mt-6">
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'">
                        <ClicksChart :daily-clicks="filteredDailyClicks || dailyBreakdown" />
                        
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
                    </div>

                    <!-- Countries Tab -->
                    <div v-if="activeTab === 'countries'">
                        <CountriesTable :countries="topCountries" />
                    </div>

                    <!-- Referers Tab -->
                    <div v-if="activeTab === 'referers'">
                        <ReferersTable :referers="topReferers" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>