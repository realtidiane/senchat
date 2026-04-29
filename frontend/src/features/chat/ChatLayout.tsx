import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, MessageSquarePlus } from 'lucide-react';
import { ConversationList } from '../../components/ConversationList';
import { ChatPanel } from '../../components/ChatPanel';
import { UserSearch } from '../../components/UserSearch';
import { GroupCreate } from '../../components/GroupCreate';
import { useSocket } from '../../hooks/useSocket';
import { useConversationStore } from '../../stores/conversation.store';
import { useUIStore } from '../../stores/ui.store';
import { useRefreshAuth } from '../../hooks/useAuth';

export function ChatLayout() {
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const activeId = useConversationStore((s) => s.activeConversationId);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const navigate = useNavigate();
  const refreshAuth = useRefreshAuth();

  // Initialize socket connection
  useSocket();

  // Refresh auth on mount to get user data
  useEffect(() => {
    refreshAuth.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mobile, hide sidebar when conversation is selected
  const showSidebar = sidebarOpen || !activeId;

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'flex' : 'hidden'
        } md:flex flex-col w-full md:w-[300px] md:min-w-[300px] border-r border-[var(--color-border)] bg-[var(--color-bg)] relative`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)]">
          <h1 className="text-xl font-bold text-sn-green">SenChat</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupCreate(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
              title="Nouveau groupe"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
              title="Nouveau message"
            >
              <MessageSquarePlus size={20} />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
              title="Paramètres"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <ConversationList />

        {/* Overlays */}
        {showSearch && <UserSearch onClose={() => setShowSearch(false)} />}
        {showGroupCreate && (
          <GroupCreate onClose={() => setShowGroupCreate(false)} />
        )}
      </div>

      {/* Chat panel */}
      <div
        className={`${
          !showSidebar || activeId ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col`}
      >
        {activeId && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute top-3 left-3 z-10 p-1 text-[var(--color-text-secondary)]"
          >
            ←
          </button>
        )}
        <ChatPanel />
      </div>
    </div>
  );
}
