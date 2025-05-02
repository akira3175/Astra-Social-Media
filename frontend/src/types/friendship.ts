import { User } from "./user";

export type FriendStatus = "friend" | "request" | "suggestion" | "sent";


export interface Friendship {
    id: number;
    status: string;
    createdAt: number[];
    acceptedAt: number[];
    active: boolean;
    user: User;
}


