import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useConversationStore } from '../stores/conversation.store';
import { ConversationItem } from './ConversationItem';
import type { Conversation } from '@senchat/shared';

export function ConversationList() {
  const activeId = useConversationStore((s) => s.activeConversationId);
  const setActive = useConversationStore((s) => s.setActiveConversation);

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/conversations');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="text-center py-8 px-4 text-[var(--color-text-secondary)]">
        <p className="text-lg mb-1">Aucune conversation</p>
        <p className="text-sm">Recherchez un utilisateur pour démarrer</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeId}
          onClick={() => setActive(conv.id)}
        />
      ))}
    </div>
  );
}
