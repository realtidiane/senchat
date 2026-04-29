import type { Conversation } from '@senchat/shared';
import { useAuthStore } from '../stores/auth.store';
import { formatTime, getInitials, truncate } from '../lib/utils';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: Props) {
  const currentUser = useAuthStore((s) => s.user);

  const displayName =
    conversation.type === 'DIRECT'
      ? conversation.members.find((m) => m.userId !== currentUser?.id)?.user
          .displayName || 'Utilisateur'
      : conversation.name || 'Groupe';

  const avatar =
    conversation.type === 'DIRECT'
      ? conversation.members.find((m) => m.userId !== currentUser?.id)?.user
          .avatar
      : conversation.avatar;

  const isOnline =
    conversation.type === 'DIRECT' &&
    conversation.members.find((m) => m.userId !== currentUser?.id)?.user
      .isOnline;

  const lastMsg = conversation.lastMessage;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--color-surface)] transition ${
        isActive ? 'bg-[var(--color-surface)]' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="w-[48px] h-[48px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[48px] h-[48px] rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-semibold text-sm">
            {getInitials(displayName)}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-sn-green rounded-full border-2 border-[var(--color-bg)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="font-medium text-[var(--color-text-primary)] truncate">
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-xs text-[var(--color-text-secondary)] ml-2 flex-shrink-0">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[var(--color-text-secondary)] truncate">
            {lastMsg
              ? lastMsg.type === 'TEXT'
                ? truncate(lastMsg.content || '', 40)
                : lastMsg.type === 'IMAGE'
                  ? '📷 Photo'
                  : '📎 Fichier'
              : 'Aucun message'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-2 bg-sn-green text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
