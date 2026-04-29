import { create } from 'zustand';

interface ConversationState {
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>; // conversationId -> userId[]
  setActiveConversation: (id: string | null) => void;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  activeConversationId: null,
  typingUsers: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      if (current.includes(userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, userId],
        },
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((id) => id !== userId),
        },
      };
    }),
}));
