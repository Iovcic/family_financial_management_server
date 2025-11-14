enum EUserRole {
    admin = "admin",
    user = "user"
}

export interface IUser {
    id: number;
    email: string;
    name?: string;
    password: string; // hash
    role: EUserRole;
    created_at: Date;
    reset_token?: string;
    reset_token_expiry?: string;
    token_version: string;
}

export interface IUserRegister extends Pick<IUser, "email" | "name" | "password"> { }

export interface IUserLogin {
    user_id: number;
    token: string;
    expires_at: Date;
}

export interface IToken {
    id: number;
    user_id: number;
    revoked: boolean | null;
    replaced_by_token: string | null;
    expires_at: Date;
}