import type { LoginRequest } from "@/interfaces/auth.interface";
import type { CommonResponseInterface } from "@/interfaces/common.response.interface";
import type { CurrentUser } from "@/interfaces/user.interface";
import { defineStore } from "pinia";
import { toast } from "vue-sonner";
import router from '@/router'
import api from "@/lib/axios";


import {
    setLocalStorage,
    clearLocalStorage,
    getAuthToken,
    getCurrentUser,
    setAuthToken,
    setUserData
} from '@/lib/auth';

const basePostUrl = import.meta.env.VITE_API_URL + '/auth';


export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as CurrentUser | null,
        token: getAuthToken() as string | null,
        loading: false,
        error: null as string | null,
        initialized: false,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        authDataForSharing: (state) => ({
            token: state.token,
            user: state.user
        })
    },

    actions: {
        async initialize() {
            if (this.initialized) return;

            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get('token');
            const userFromUrl = urlParams.get('user');

            if (tokenFromUrl && userFromUrl) {
                try {
                    this.token = decodeURIComponent(tokenFromUrl);
                    this.user = JSON.parse(decodeURIComponent(userFromUrl));

                    setAuthToken(this.token);
                    if (this.user) {
                        setUserData(this.user);
                    }

                    this.cleanUrlParameters();
                } catch (error) {
                    console.error('❌ Failed to parse auth data from URL:', error);
                    this.token = getAuthToken();
                    this.user = getCurrentUser();
                }
            } else {
                this.token = getAuthToken();
                this.user = getCurrentUser();
            }

            this.initialized = true;
        },

        cleanUrlParameters() {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', cleanUrl);
        },

        async login(payload: LoginRequest, redirectUrl?: string) {
            try {
                this.loading = true;
                this.error = null;

                const formData = new URLSearchParams();
                formData.append('username', payload.username);
                formData.append('password', payload.password);

                const response = await api.post<
                    CommonResponseInterface<{ token: string } & CurrentUser>
                    >(`${basePostUrl}/login`, formData, {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    });


                const respData = response.data.data;

                // console.log("response ", respData)

                this.token = respData.token;
                const { token, ...userFields } = respData;
                this.user = userFields as CurrentUser;

                toast.success(response.data.message || 'Login successful');
                this.error = null;


                setAuthToken(this.token);
                setUserData(this.user);


                this.initialized = true;

                router.push('/')

            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Unknown error';
                console.log("error ", this.error)
                toast.error('Invalid credentials or user not found.');
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                this.loading = true;

                clearLocalStorage();
                this.user = null;
                this.token = null;
                this.initialized = false;

                toast.success('Logout successful');

                // Redirect ke auth service login
                window.location.href = '/login';

            } catch (error) {
                this.error = error instanceof Error ? error.message : 'Unknown error';
                toast.error(`Error during logout: ${this.error}`);
            } finally {
                this.loading = false;
            }
        }
    }
})