import { ref, computed } from 'vue'
import { useStatsStore } from '@/stores/stats.store'
import type { UrlStats, TimeRange } from '@/interfaces/stats.interface'
import { toast } from 'vue-sonner'



export function useStats(shortUrl: string) {
    const statsStore = useStatsStore()
    
    const stats = ref<UrlStats | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const selectedRange = ref<'today' | '7d' | '30d' | '90d' | 'all'>('all')


    const timeRanges: TimeRange[] = [
        { label: 'Today', value: 'today', days: 1},
        { label: '7 days', value: '7d', days: 7 },
        { label: '30 days', value: '30d', days: 30 },
        { label: '90 days', value: '90d', days: 90 },
        { label: 'All', value: 'all', days: Number.MAX_SAFE_INTEGER}
    ]

    const filteredDailyClicks = computed(() => {
        if (!stats.value) return []

        const range = timeRanges.find(r => r.value === selectedRange.value)
        if (!range) return stats.value.dailyClicks

        if (range.value === 'all') return stats.value.dailyClicks

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        console.log('🎯 Selected range:', range.value)
        console.log('📊 Original dailyClicks:', stats.value.dailyClicks)

        return stats.value.dailyClicks.filter(item => {
            const itemDate = new Date(item.date)
            itemDate.setHours(0, 0, 0, 0)

            if (range.value === 'today') {
                return itemDate.getTime() === today.getTime()
            } else {
                const cutoffDate = new Date(today)
                cutoffDate.setDate(cutoffDate.getDate() - range.days)

                return itemDate >= cutoffDate
            }
        })
    })

    const rangeTotalClicks = computed(() => {
        return filteredDailyClicks.value.reduce((sum, item) => sum + item.clicks, 0)
    })

    const averageClicksPerDay = computed(() => {
        const clicks = rangeTotalClicks.value
        const days = filteredDailyClicks.value.length


        if (days === 0) return 0

        if (selectedRange.value === 'today') {
            return clicks
        }

        console.log('days', days)

        return Math.round(clicks / days)
    })

    const clicksToday = computed(() => {
        if (!stats.value) return 0

        const today = new Date().toISOString().split('T')[0]
        const todayData = stats.value.dailyClicks.find(d => d.date === today)
        return todayData?.clicks || 0
    })

    // Fetch stats
    const fetchStats = async () => {
        loading.value = true
        error.value = null

        try {
            stats.value = await statsStore.getUrlStats(shortUrl)
        } catch (err: any) {
            error.value = err.message || 'Gagal memuat statistik'
            toast.error(error.value ?? 'Terjadi kesalahan')
        } finally {
            loading.value = false
        }
    }

    return {
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
    }
}