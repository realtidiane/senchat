import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { api } from '../lib/api';
import { useConversationStore } from '../stores/conversation.store';
import { getInitials } from '../lib/utils';

interface Props {
  onClose: () => void;
}

export function UserSearch({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const setActive = useConversationStore((s) => s.setActiveConversation);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['userSearch', debouncedQuery],
    queryFn: async () => {
      const res = await api.get('/users/search', {
        params: { q: debouncedQuery },
      });
      return res.data as Array<{
        id: string;
        displayName: string;
        avatar: string | null;
        isOnline: boolean;
      }>;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const startConversation = async (userId: string) => {
    const res = await api.post('/conversations', {
      type: 'DIRECT',
      memberIds: [userId],
    });
    setActive(res.data.id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-[var(--color-bg)] z-10 flex flex-col">
      <div className="flex items-center gap-2 p-3 border-b border-[var(--color-border)]">
        <button onClick={onClose} className="text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            autoFocus
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-sn-green"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-sn-green border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {users?.map((user) => (
          <div
            key={user.id}
            onClick={() => startConversation(user.id)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition"
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
                  {getInitials(user.displayName)}
                </div>
              )}
              {user.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sn-green rounded-full border-2 border-[var(--color-bg)]" />
              )}
            </div>
            <span className="text-[var(--color-text-primary)] font-medium">
              {user.displayName}
            </span>
          </div>
        ))}
        {debouncedQuery.length >= 2 && !isLoading && !users?.length && (
          <p className="text-center py-4 text-[var(--color-text-secondary)] text-sm">
            Aucun utilisateur trouvé
          </p>
        )}
      </div>
    </div>
  );
}
