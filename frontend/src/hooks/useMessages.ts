import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { SOCKET_EVENTS } from '@senchat/shared';
import type { PaginatedMessages, MessageType } from '@senchat/shared';

export function useMessages(conversationId: string | null) {
  return useInfiniteQuery<PaginatedMessages>({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: 50 };
      if (pageParam) params.cursor = pageParam;
      const res = await api.get(
        `/conversations/${conversationId}/messages`,
        { params },
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });
}

export function sendMessage(payload: {
  conversationId: string;
  type: MessageType;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.MESSAGE_SEND, payload);
}

export function markAsRead(conversationId: string, messageId: string) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(SOCKET_EVENTS.MESSAGE_READ, { conversationId, messageId });
}

export function emitTyping(conversationId: string, isTyping: boolean) {
  const socket = getSocket();
  if (!socket) return;
  socket.emit(
    isTyping ? SOCKET_EVENTS.TYPING_START : SOCKET_EVENTS.TYPING_STOP,
    { conversationId },
  );
}
