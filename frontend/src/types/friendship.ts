import { User } from "./user";

export type FriendStatus = "friend" | "request" | "suggestion" | "sent";

export interface SuggestedUser {
    id: number
    name: string
    avatar: string
    mutualFriends: number
}

export interface Request {
    id: number;
    status: string;
    createdAt: string;
    active: boolean;
    user1: User;
    user2: User;
}

export interface FriendRequest {
    id: number;
    status: string;
    createdAt: string;
    active: boolean;
    user1: User;
    user2: User;
}

export interface SentRequest {
    id: number;
    status: string;
    createdAt: string;
    active: boolean;
    user1: User;
    user2: User;
}

export interface Friendship {
    id: number;
    requester: User;
    receiver: User;
    status: string;
    createdAt: string;
    active: boolean;
}


