import { useEffect, useRef, useCallback } from 'react';
import { useMessages, markAsRead } from '../hooks/useMessages';
import { useConversationStore } from '../stores/conversation.store';
import { useAuthStore } from '../stores/auth.store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Conversation } from '@senchat/shared';
import { getInitials } from '../lib/utils';

export function ChatPanel() {
  const conversationId = useConversationStore((s) => s.activeConversationId);
  const typingUsers = useConversationStore((s) =>
    conversationId ? s.typingUsers[conversationId] || [] : [],
  );
  const currentUserId = useAuthStore((s) => s.user?.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages(conversationId);

  const { data: conversation } = useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const res = await api.get(`/conversations/${conversationId}`);
      return res.data;
    },
    enabled: !!conversationId,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.pages?.[0]?.messages?.length]);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversationId && data?.pages?.[0]?.messages?.[0]) {
      markAsRead(conversationId, data.pages[0].messages[0].id);
    }
  }, [conversationId, data?.pages?.[0]?.messages?.[0]?.id]);

  // Infinite scroll: load more when scrolled to top
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-sn-green mb-2">SenChat</h2>
          <p className="text-[var(--color-text-secondary)]">
            Sélectionnez une conversation pour commencer
          </p>
        </div>
      </div>
    );
  }

  const otherMember = conversation?.members.find(
    (m) => m.userId !== currentUserId,
  );
  const displayName =
    conversation?.type === 'DIRECT'
      ? otherMember?.user.displayName || 'Utilisateur'
      : conversation?.name || 'Groupe';

  const allMessages = data?.pages.flatMap((p) => p.messages).reverse() || [];

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
          {getInitials(displayName)}
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text-primary)]">
            {displayName}
          </p>
          {typingUsers.length > 0 ? (
            <p className="text-xs text-sn-green">en train d'écrire...</p>
          ) : conversation?.type === 'DIRECT' && otherMember?.user.isOnline ? (
            <p className="text-xs text-sn-green">En ligne</p>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)]">
              {conversation?.type === 'GROUP'
                ? `${conversation.members.length} membres`
                : 'Hors ligne'}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-2"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          allMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
