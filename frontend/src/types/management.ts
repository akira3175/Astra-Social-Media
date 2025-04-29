export interface Report {
    id: number;
    type: 'Bài đăng' | 'Comment' | 'User';
    content: string;
    reporter: string;
    createdAt: string;
    status: 'pending' | 'resolved';
}

export interface AdminStats {
    totalPosts: number;
    lockedPosts: number;
    totalComments: number;
    lockedComments: number;
    totalUsers: number;
    bannedUsers: number;
}