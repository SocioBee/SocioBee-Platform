export interface DefaultResponse<T> {
    data: T;
    status: number;
    message?: string;
}