import { defineStore } from 'pinia'
import axios from "axios";
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import { useRouter } from 'vue-router';
import { getAuthToken, handleAuthError } from '@/lib/auth';
import api from '@/lib/axios';
import type { UrlStats } from '@/interfaces/stats.interface';

const apiUrl = import.meta.env.VITE_API_URL;

export const useStatsStore = defineStore('stats', {
    state: () => ({
        stats: null as UrlStats | null,
        loading: false,
        error: null as null | string,
        validationErrors: {} as Record<string, string>
    }),

    getters: {
        getValidationError: (state) => (fieldName: string) => {
            return state.validationErrors[fieldName] || '';
        },
        hasValidationErrors: (state) => {
            return Object.keys(state.validationErrors).length > 0;
        }
    },

    actions: {
        clearValidationErrors() {
            this.validationErrors = {};
        },

        async getUrlStats(shortUrl: string) {
            this.loading = true;
            this.error = null;
            const router = useRouter();
            const token = getAuthToken();

            try {
                console.log(`Fetching dashboard stats for: ${shortUrl}`);

                const response = await api.get<CommonResponseInterface<UrlStats>>(
                    `${apiUrl}/stats/${shortUrl}/dashboard`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log('Dashboard response:', response.data);

                if (response.data.status === 200) {
                    this.stats = response.data.data;

                    return this.stats;
                } else {
                    throw new Error(response.data.message || 'Failed to fetch stats');
                }

            } catch (error: any) {
                console.error('Error fetching stats:', error);

                if (axios.isAxiosError(error) && error.response) {
                    await handleAuthError(error.response.status, router);

                    if (error.response.status === 404) {
                        this.error = `URL '${shortUrl}' tidak ditemukan`;
                        toast.error(this.error);
                    } else {
                        this.error = error.response.data?.detail || error.message;
                        toast.error(`Error: ${this.error}`);
                    }
                } else {
                    this.error = error instanceof Error ? error.message : 'Unknown error';
                    toast.error(`Error: ${this.error}`);
                }

                return null;

            } finally {
                this.loading = false;
            }
        },

    }
});