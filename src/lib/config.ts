export const APP_CONFIG = {
    domain: import.meta.env.VITE_DOMAIN || 'http://localhost:8000',

    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV
}

export const getFullShortUrl = (shortCode: string): string => {
    if (!shortCode) return ''
    const baseDomain = APP_CONFIG.domain.replace(/\/$/, '')
    const code = shortCode.replace(/^\//, '')
    return `${baseDomain}/${code}`
}