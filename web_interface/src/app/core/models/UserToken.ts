export interface UserToken {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
    user: any;
    valid: boolean;
    message: string;
}