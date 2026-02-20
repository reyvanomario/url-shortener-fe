import type { Url, CreateUrlRequest, UpdateUrlRequest } from '@/interfaces/url.interface';
import { defineStore } from 'pinia'
import axios from "axios";
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import { useRouter } from 'vue-router';
import { getAuthToken, handleAuthError } from '@/lib/auth';
import type { ErrorResponse, ValidationError } from '@/interfaces/error.interface';
import api from '@/lib/axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const useUrlStore = defineStore('url', {
    state: () => ({
        urls: [] as Url[],
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
        async fetchAllUrls() {
            this.loading = true;
            this.error = null;
            const router = useRouter();
            const token = getAuthToken();

            try {
                const response = await api.get<CommonResponseInterface<Url[]>>(`${apiUrl}/url/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                this.urls = response.data.data;
                if (this.urls.length === 0) {
                    toast.warning('Data url kosong')
                }
                else {
                    toast.success('Data url berhasil dimuat')
                }
                return response.data.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    await handleAuthError(error.response.status, router);
                }

                this.error = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Error saat memuat url: ${this.error}`);
            } finally {
                this.loading = false;
            }
        },

        async getCurrentUserUrls() {
            this.loading = true;
            this.error = null;
            const router = useRouter();
            const token = getAuthToken();

            // console.log('token ', token)

            try {
                const response = await api.get<CommonResponseInterface<Url[]>>(`${apiUrl}/my-urls`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // console.log("res", response.data.data)
                return response.data.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    await handleAuthError(error.response.status, router);

                    if (error.response.status === 404) {
                        toast.error('User not found.')
                    }
                }

                else {
                    this.error = error instanceof Error ? error.message : 'Unknown error';
                    toast.error(`Error: ${this.error}`);
                }
                return null;
            } finally {
                this.loading = false;
            }
        },

        async shortenUrl(urlData: CreateUrlRequest) {
            this.loading = true;
            this.error = null;
            this.clearValidationErrors();
            const router = useRouter();
            const token = getAuthToken();

            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await api.post<CommonResponseInterface<Url>>(
                    `${apiUrl}/shorten`,
                    urlData,
                    { headers }
                );

              
                if (response.status === 201) {
                    if (token) {
                        this.urls.push(response.data.data);
                    }
                    toast.success('Url shortened successfully')
                    return response.data.data;
                }

                else if (response.status === 400) {
                    toast.warning('Failed to shorten url: Data tidak valid atau ada kesalahan pada permintaan.')
                }
            }
            catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    await handleAuthError(error.response.status, router);

                    if (error.response.status === 400) {
                        const errorData = error.response.data as ErrorResponse;

                        this.validationErrors = {};

                        // Extract validation errors from backend response
                        if (errorData.errors && Array.isArray(errorData.errors)) {
                            errorData.errors.forEach((err: ValidationError) => {
                                if (err.field) {
                                    this.validationErrors[err.field] = err.message;
                                }
                            });

                            if (errorData.message) {
                                toast.error(`Validation Error: ${errorData.message}`);
                            } else {
                                toast.error('Please check the form for errors');
                            }

                        } else if (errorData.message) {
                            this.error = errorData.message;
                            toast.error(`Error: ${errorData.message}`);
                        } else if (errorData.error) {
                            this.error = errorData.error;
                            toast.error(`Error: ${errorData.error}`);
                        }

                        return null;

                    } else if (error.response.status === 401 || error.response.status === 403) {
                        return null;
                    } else {
                        this.error = (error.response.data as ErrorResponse).message || 'Unknown server error';
                        toast.error(`Server Error: ${this.error}`);
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

        async updateUrl(urlData: UpdateUrlRequest) {
            this.loading = true;
            this.error = null;
            this.clearValidationErrors();
            const router = useRouter();
            const token = getAuthToken();

            try {
                const response = await axios.put<CommonResponseInterface<Url>>(`${apiUrl}/${urlData.id}`, urlData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    toast.success('Url updated successfully')
                    return response.data.data;
                }
                else if (response.status === 400) {
                    toast.warning('Gagal memperbarui url: Data tidak valid atau ada kesalahan pada permintaan.')
                }
                else if (response.status === 404) {
                    toast.warning('Url tidak ditemukan: Data url yang akan diperbarui tidak ditemukan.')
                }
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    await handleAuthError(error.response.status, router);

                    if (error.response.status === 400) {
                        const errorData = error.response.data as ErrorResponse;

                        this.validationErrors = {};

                        // Extract validation errors from backend response
                        if (errorData.errors && Array.isArray(errorData.errors)) {
                            errorData.errors.forEach((err: ValidationError) => {
                                if (err.field) {
                                    this.validationErrors[err.field] = err.message;
                                }
                            });

                            if (errorData.message) {
                                toast.error(`Validation Error: ${errorData.message}`);
                            } else {
                                toast.error('Please check the form for errors');
                            }

                        } else if (errorData.message) {
                            this.error = errorData.message;
                            toast.error(`Error: ${errorData.message}`);
                        } else if (errorData.error) {
                            this.error = errorData.error;
                            toast.error(`Error: ${errorData.error}`);
                        }

                        return null;

                    } else if (error.response.status === 401 || error.response.status === 403) {
                        return null;
                    } else {
                        this.error = (error.response.data as ErrorResponse).message || 'Unknown server error';
                        toast.error(`Server Error: ${this.error}`);
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
})