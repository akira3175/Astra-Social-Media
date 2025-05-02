import { User } from "./user";

export type FriendStatus = "friend" | "request" | "suggestion" | "sent";

export interface Friendship {
  id: number;
  requester: User;
  receiver: User;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
