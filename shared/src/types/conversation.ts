export type ConversationType = 'DIRECT' | 'GROUP';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ConversationMember {
  id: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  lastReadAt: string;
  user: {
    id: string;
    displayName: string;
    avatar: string | null;
    isOnline: boolean;
  };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  members: ConversationMember[];
  lastMessage: MessagePreview | null;
  unreadCount: number;
}

export interface MessagePreview {
  id: string;
  content: string | null;
  type: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}
