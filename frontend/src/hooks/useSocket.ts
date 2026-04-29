import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useAuthStore } from '../stores/auth.store';
import { useConversationStore } from '../stores/conversation.store';
import { SOCKET_EVENTS } from '@senchat/shared';
import type { Message, TypingUpdatePayload } from '@senchat/shared';

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const addTypingUser = useConversationStore((s) => s.addTypingUser);
  const removeTypingUser = useConversationStore((s) => s.removeTypingUser);
  const initialized = useRef(false);

  useEffect(() => {
    if (!accessToken || initialized.current) return;
    initialized.current = true;

    const socket = connectSocket(accessToken);

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
      // Update messages cache for the conversation
      queryClient.setQueryData(
        ['messages', message.conversationId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) =>
              index === 0
                ? { ...page, messages: [message, ...page.messages] }
                : page,
            ),
          };
        },
      );

      // Invalidate conversations list to update last message + order
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on(SOCKET_EVENTS.PRESENCE_CHANGE, () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    socket.on(SOCKET_EVENTS.TYPING_UPDATE, (payload: TypingUpdatePayload) => {
      if (payload.isTyping) {
        addTypingUser(payload.conversationId, payload.userId);
        // Auto-remove after 3 seconds
        setTimeout(() => {
          removeTypingUser(payload.conversationId, payload.userId);
        }, 3000);
      } else {
        removeTypingUser(payload.conversationId, payload.userId);
      }
    });

    socket.on(SOCKET_EVENTS.MESSAGE_STATUS, () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      disconnectSocket();
      initialized.current = false;
    };
  }, [accessToken, queryClient, addTypingUser, removeTypingUser]);
}
