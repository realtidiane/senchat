import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';
import { api } from '../lib/api';
import { useConversationStore } from '../stores/conversation.store';
import { getInitials } from '../lib/utils';

interface Props {
  onClose: () => void;
}

export function GroupCreate({ onClose }: Props) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const setActive = useConversationStore((s) => s.setActiveConversation);
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      const res = await api.get('/users/search', { params: { q: searchQuery } });
      return res.data as Array<{
        id: string;
        displayName: string;
        avatar: string | null;
        isOnline: boolean;
      }>;
    },
    enabled: searchQuery.length >= 2,
  });

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const createGroup = async () => {
    if (!name.trim() || selectedIds.length === 0) return;
    const res = await api.post('/conversations', {
      type: 'GROUP',
      name: name.trim(),
      memberIds: selectedIds,
    });
    setActive(res.data.id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-[var(--color-bg)] z-10 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
        <button onClick={onClose} className="text-[var(--color-text-secondary)]">
          <X size={20} />
        </button>
        <span className="font-semibold text-[var(--color-text-primary)]">
          Nouveau groupe
        </span>
        <button
          onClick={createGroup}
          disabled={!name.trim() || selectedIds.length === 0}
          className="text-sn-green disabled:opacity-30"
        >
          <Check size={20} />
        </button>
      </div>

      <div className="p-3 border-b border-[var(--color-border)]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du groupe"
          className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-sn-green"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">
          {selectedIds.length} membre{selectedIds.length > 1 ? 's' : ''} sélectionné
          {selectedIds.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="p-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher des membres..."
          className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-sn-green"
        />
      </div>

      <div className="overflow-y-auto flex-1">
        {users?.map((user) => (
          <div
            key={user.id}
            onClick={() => toggleUser(user.id)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition"
          >
            <div className="w-10 h-10 rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
              {getInitials(user.displayName)}
            </div>
            <span className="flex-1 text-[var(--color-text-primary)]">
              {user.displayName}
            </span>
            {selectedIds.includes(user.id) && (
              <div className="w-5 h-5 bg-sn-green rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
