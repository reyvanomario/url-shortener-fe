<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js'
import type { DailyClick } from '@/interfaces/stats.interface'
import type { ChartData } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

const props = defineProps<{
    dailyClicks?: DailyClick[] 
}>()

const safeDailyClicks = computed(() => props.dailyClicks || [])
const totalClicks = computed(() => 
    safeDailyClicks.value.reduce((sum, d) => sum + (d?.clicks || 0), 0)
)
const hasData = computed(() => safeDailyClicks.value.length > 0)

interface ChartDataset {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
    fill: boolean
    pointBackgroundColor?: string
    pointBorderColor?: string
    pointHoverBackgroundColor?: string
    pointHoverBorderColor?: string
}

const chartData = ref<ChartData<'line'>>({
    labels: [],
    datasets: [{
        label: 'Clicks',
        data: [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
    }]
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F3F4F6',
            bodyColor: '#F3F4F6',
            callbacks: {
                label: (context: any) => {
                    const value = context.raw
                    return `${value} click${value !== 1 ? 's' : ''}`
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                drawBorder: false
            },
            ticks: {
                stepSize: 1,
                callback: (value: any) => value
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                maxRotation: 45,
                minRotation: 45
            }
        }
    }
}

// Update chart when data changes
watch(() => props.dailyClicks, (newData) => {
    if (!newData || newData.length === 0) {
        chartData.value.labels = []
        chartData.value.datasets[0]!.data = []
        return
    }

    chartData.value.labels = newData.map(d => {
        const date = new Date(d.date)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        })
    })

    chartData.value.datasets[0]!.data = newData.map(d => d.clicks || 0)

}, { immediate: true })
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-gray-700">Daily Clicks</h3>
            <span class="text-sm text-gray-500">
                Total: {{ totalClicks }} clicks
            </span>
        </div>
        
        <div v-if="!hasData" class="h-80 flex items-center justify-center text-gray-400">
            <div class="text-center">
                <p class="text-4xl mb-2">📊</p>
                <p>No clicks yet</p>
            </div>
        </div>
        
        <!-- Chart -->
        <div v-else class="h-80">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>