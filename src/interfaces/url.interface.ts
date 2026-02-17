import type { User } from "./user.interface"

export interface Url {
    id: number
    shortUrl: string
    fullUrl: string
    click: number
    createdAt: string

    creator: User
}

export interface CreateUrlRequest {
    fullUrl: string
    shortUrl: string
}

export interface UpdateUrlRequest {
    id?: number
    fullUrl: string
    shortUrl: string
}