import type { CommonResponseInterface } from './common.response.interface'

export interface DailyClick {
    date: string
    clicks: number
}

export interface CountryStat {
    country: string
    clicks: number
}

export interface RefererStat {
    referer: string
    clicks: number
}

export interface UrlStats {
    shortUrl: string
    fullUrl: string
    totalClicks: number
    dailyBreakdown: DailyClick[]
    topCountries: CountryStat[]
    topReferers: RefererStat[]
}

// Untuk response dari store (bisa undefined)
export type UrlStatsResult = UrlStats | null | undefined

// Response wrapper
export type UrlStatsResponse = CommonResponseInterface<UrlStats>


export interface TimeRange {
    label: string
    value: 'today' | '7d' | '30d' | '90d' | 'all'
    days: number
}