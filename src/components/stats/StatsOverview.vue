<script setup lang="ts">
defineProps<{
    totalClicks: number
    rangeTotal: number
    averageDaily: number
}>()
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Total Clicks Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-sm">Total Clicks</p>
                    <p class="text-3xl font-bold text-gray-800">{{ totalClicks.toLocaleString() }}</p>
                </div>
                <div class="text-3xl text-blue-500">📊</div>
            </div>
        </div>

        <!-- Range Total Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-sm">Clicks (Selected Period)</p>
                    <p class="text-3xl font-bold text-gray-800">{{ rangeTotal.toLocaleString() }}</p>
                </div>
                <div class="text-3xl text-green-500">📈</div>
            </div>
        </div>

        <!-- Daily Average Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-sm">Average Daily</p>
                    <p class="text-3xl font-bold text-gray-800">{{ averageDaily.toLocaleString() }}</p>
                </div>
                <div class="text-3xl text-purple-500">📅</div>
            </div>
        </div>
    </div>
</template>