import { getInitials } from '../lib/utils';

interface Props {
  displayName: string;
  avatar: string | null;
  bio: string | null;
  email?: string;
  size?: 'sm' | 'lg';
}

export function ProfileCard({ displayName, avatar, bio, email, size = 'lg' }: Props) {
  const avatarSize = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-12 h-12 text-sm';

  return (
    <div className="flex flex-col items-center gap-3">
      {avatar ? (
        <img
          src={avatar}
          alt={displayName}
          className={`${avatarSize} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${avatarSize} rounded-full bg-sn-green/20 text-sn-green flex items-center justify-center font-bold`}
        >
          {getInitials(displayName)}
        </div>
      )}
      <div className="text-center">
        <p className="font-semibold text-lg text-[var(--color-text-primary)]">
          {displayName}
        </p>
        {email && (
          <p className="text-sm text-[var(--color-text-secondary)]">{email}</p>
        )}
        {bio && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{bio}</p>
        )}
      </div>
    </div>
  );
}
