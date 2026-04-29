import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { useLogout } from '../../hooks/useAuth';
import { ProfileCard } from '../../components/ProfileCard';
import { api } from '../../lib/api';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const navigate = useNavigate();
  const logout = useLogout();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { displayName, bio });
      updateUser(res.data);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-[var(--color-surface)]">
          <button
            onClick={() => navigate('/')}
            className="text-[var(--color-text-secondary)]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile */}
          <ProfileCard
            displayName={user.displayName}
            avatar={user.avatar}
            bio={user.bio}
            email={user.email}
          />

          {/* Edit fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Nom
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-sn-green"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-sn-green resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-sn-green text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-lg">
            <span>Thème</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--color-input)] text-[var(--color-text-primary)]"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-2 border border-sn-red text-sn-red rounded-lg font-medium hover:bg-sn-red hover:text-white transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
