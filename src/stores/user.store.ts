import type { User, CreateUserRequest } from "@/interfaces/user.interface";
import { defineStore } from 'pinia'
import axios from "axios";
import { toast } from 'vue-sonner';
import type { CommonResponseInterface } from '@/interfaces/common.response.interface';
import { handleAuthError, getAuthToken } from '@/lib/auth';
import { useRouter } from 'vue-router';
import api from '@/lib/axios';

const baseUserUrl = import.meta.env.VITE_API_URL + '/user';

export const useUserStore = defineStore('user', {
    state: () => ({
        profiles: [] as User[],
        currentUser: null as User | null,
        loading: false,
        error: null as null | string,
    }),
    actions: {
        async getCurrentUser() {
            this.loading = true;
            this.error = null;
            const router = useRouter();
            const token = getAuthToken();

            try {
                const response = await axios.get<CommonResponseInterface<User>>(`${baseUserUrl}/current`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.currentUser = response.data.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    await handleAuthError(error.response.status, router);
                }

                this.error = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Error saat memuat user: ${this.error}`);
                return null;
            } finally {
                this.loading = false;
            }
        },

        async getProfileById(profileId: string) {
            this.loading = true;
            this.error = null;
            const router = useRouter();
            const token = getAuthToken();

            try {
                const response = await api.get<CommonResponseInterface<User>>(`${baseUserUrl}/${profileId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
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

        async createUser(userData: CreateUserRequest) {
            this.loading = true;
            this.error = null;

            try {
                const response = await api.post<CommonResponseInterface<User>>(`${baseUserUrl}`, userData);
                if (response.status === 201) {
                    this.profiles.push(response.data.data);
                    toast.success('Successfuly registered')
                    return response.data.data;
                }
                else if (response.status === 400) {
                    toast.warning('Gagal register user: Data tidak valid atau ada kesalahan pada permintaan.')
                }
            }
            catch (error) {
                this.error = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Error saat register user: ${this.error}`);
            } finally {
                this.loading = false;
            }
        },

    }
})