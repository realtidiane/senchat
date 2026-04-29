export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  sender: {
    id: string;
    displayName: string;
    avatar: string | null;
  };
}

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}
