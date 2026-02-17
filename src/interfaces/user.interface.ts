export interface User {
    id: number;
    username: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
}

export interface CurrentUser {
    id: number;
    username: string;
}