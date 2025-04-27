export interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatar: string;
    background?: string;
    role?: 'user' | 'moderator' | 'admin';
    status?: 'active' | 'inactive' | 'banned';
    registeredDate?: string;
    lastActive?: string;
    bio?: string;
    [key: string]: any;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    otp: string;
}
