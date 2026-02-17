import { ref, computed } from 'vue'
import { useStatsStore } from '@/stores/stats.store'
import type { UrlStats, TimeRange, DailyClick } from '@/interfaces/stats.interface'
import { toast } from 'vue-sonner'



export function useStats(shortUrl: string) {
    const statsStore = useStatsStore()
    
    const stats = ref<UrlStats | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const selectedRange = ref<'today' | '7d' | '30d' | '90d' | 'all'>('all')

    // Time ranges
    const timeRanges: TimeRange[] = [
        { label: 'Today', value: 'today', days: 1},
        { label: '7 days', value: '7d', days: 7 },
        { label: '30 days', value: '30d', days: 30 },
        { label: '90 days', value: '90d', days: 90 },
        { label: 'All', value: 'all', days: Number.MAX_SAFE_INTEGER}
    ]

    // Computed: Filtered daily clicks by selected range
    const filteredDailyClicks = computed(() => {
        if (!stats.value) return []

        const range = timeRanges.find(r => r.value === selectedRange.value)
        if (!range) return stats.value.dailyBreakdown

        // Untuk 'all', return semua data
        if (range.value === 'all') return stats.value.dailyBreakdown

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Filter berdasarkan range
        return stats.value.dailyBreakdown.filter(item => {
            const itemDate = new Date(item.date)
            itemDate.setHours(0, 0, 0, 0)

            if (range.value === 'today') {
                // Today: hanya tanggal hari ini
                return itemDate.getTime() === today.getTime()
            } else {
                // Untuk 7d, 30d, 90d: hitung batas tanggal
                const cutoffDate = new Date(today)
                cutoffDate.setDate(cutoffDate.getDate() - range.days)

                // Include tanggal yang >= cutoff date
                return itemDate >= cutoffDate
            }
        })
    })

    // Computed: Total clicks in selected range
    const rangeTotalClicks = computed(() => {
        return filteredDailyClicks.value.reduce((sum, item) => sum + item.clicks, 0)
    })

    // Computed: Average clicks per day
    const averageClicksPerDay = computed(() => {
        const clicks = rangeTotalClicks.value
        const days = filteredDailyClicks.value.length

        console.log('📊 Average calculation:', {
            range: selectedRange.value,
            totalClicks: clicks,
            days: days,
            filteredData: filteredDailyClicks.value
        })

        if (days === 0) return 0

        // Untuk 'today', average = total clicks hari ini
        if (selectedRange.value === 'today') {
            return clicks
        }

        // Untuk range lain, bagi dengan jumlah hari
        return Math.round(clicks / days)
    })

    const clicksToday = computed(() => {
        if (!stats.value) return 0

        const today = new Date().toISOString().split('T')[0]
        const todayData = stats.value.dailyBreakdown.find(d => d.date === today)
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


    // Format helpers
    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode) return '🌍'
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0))
        return String.fromCodePoint(...codePoints)
    }

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
            'IN': 'India',
            'CN': 'China',
            'DE': 'Germany',
            'FR': 'France',
            'NL': 'Netherlands'
        }
        return names[code] || code
    }

    const getRefererName = (referer: string): string => {
        if (!referer || referer === '') return 'Direct / Unknown'

        try {
            const url = new URL(referer)
            return url.hostname.replace('www.', '')
        } catch {
            return referer.substring(0, 30) + (referer.length > 30 ? '...' : '')
        }
    }

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

    // Export stats
    // const exportStats = async (format: 'csv' | 'json' = 'csv') => {
    //     try {
    //         await statsStore.exportStats(shortUrl, format)
    //     } catch (err) {
    //         // Error already handled in service
    //     }
    // }

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
        getCountryFlag,
        getCountryName,
        getRefererName,
        getPlatformIcon,
        // exportStats
    }
}