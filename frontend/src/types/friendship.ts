import { User } from "./user";

export type FriendStatus = "friend" | "request" | "suggestion" | "sent";

export interface Friendship {
  acceptedAt: any;
  id: number;
  requester: User;
  receiver: User;
  status: string;
  createdAt: string[];
  updatedAt: string[];
  user: User;
}
