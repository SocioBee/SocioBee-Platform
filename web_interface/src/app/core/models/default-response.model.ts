export interface DefaultResponseModel<T> {
    data: T;
    status: number;
    message?: string;
}