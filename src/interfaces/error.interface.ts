export interface ValidationError {
    field?: string;
    message: string;
}

export interface ErrorResponse {
    message: string;
    errors?: ValidationError[];
    error?: string;
}