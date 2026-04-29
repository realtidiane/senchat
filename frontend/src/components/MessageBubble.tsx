import type { Message } from '@senchat/shared';
import { useAuthStore } from '../stores/auth.store';
import { formatTime } from '../lib/utils';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const isOwn = message.senderId === currentUserId;
  const isDeleted = !!message.deletedAt;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4`}>
      <div
        className={`max-w-[65%] rounded-lg px-3 py-2 ${
          isOwn
            ? 'bg-[var(--color-bubble-out)] rounded-tr-none'
            : 'bg-[var(--color-bubble-in)] rounded-tl-none'
        }`}
      >
        {/* Sender name (group conversations) */}
        {!isOwn && (
          <p className="text-xs font-semibold text-sn-green mb-0.5">
            {message.sender.displayName}
          </p>
        )}

        {/* Content */}
        {isDeleted ? (
          <p className="text-sm italic text-[var(--color-text-secondary)]">
            Message supprimé
          </p>
        ) : message.type === 'IMAGE' && message.fileUrl ? (
          <div>
            <img
              src={message.fileUrl}
              alt={message.fileName || 'image'}
              className="max-w-full rounded-md mb-1"
              loading="lazy"
            />
            {message.content && (
              <p className="text-sm text-[var(--color-text-primary)]">
                {message.content}
              </p>
            )}
          </div>
        ) : message.type === 'FILE' && message.fileUrl ? (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-sn-green hover:underline"
          >
            <span>📎</span>
            <span>{message.fileName || 'Fichier'}</span>
            {message.fileSize && (
              <span className="text-[var(--color-text-secondary)] text-xs">
                ({(message.fileSize / 1024).toFixed(0)} Ko)
              </span>
            )}
          </a>
        ) : (
          <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Timestamp + status */}
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && !isDeleted && (
            <span className="text-sn-green text-xs">✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
