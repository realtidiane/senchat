import type { Message, MessageType } from '../types/message';

// --- Event name constants ---
export const SOCKET_EVENTS = {
  // Client → Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Server → Client
  MESSAGE_NEW: 'message:new',
  MESSAGE_STATUS: 'message:status',
  TYPING_UPDATE: 'typing:update',
  PRESENCE_CHANGE: 'presence:change',
  CONVERSATION_UPDATED: 'conversation:updated',
  MEMBER_ADDED: 'member:added',
  MEMBER_REMOVED: 'member:removed',
  ERROR: 'error',
} as const;

// --- Payload types ---
export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ReadMessagePayload {
  conversationId: string;
  messageId: string;
}

export interface TypingPayload {
  conversationId: string;
}

export interface TypingUpdatePayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresencePayload {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface MessageStatusPayload {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: string;
}

export interface MemberChangePayload {
  conversationId: string;
  userId: string;
}

export interface SocketErrorPayload {
  code: string;
  message: string;
}
