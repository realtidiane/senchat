import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { sendMessage, emitTyping } from '../hooks/useMessages';
import { api } from '../lib/api';

interface Props {
  conversationId: string;
}

export function MessageInput({ conversationId }: Props) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    sendMessage({
      conversationId,
      type: 'TEXT',
      content: trimmed,
    });

    setText('');
    emitTyping(conversationId, false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Typing indicator
    emitTyping(conversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversationId, false);
    }, 2000);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/files/upload', formData);

      const isImage = file.type.startsWith('image/');
      sendMessage({
        conversationId,
        type: isImage ? 'IMAGE' : 'FILE',
        fileUrl: res.data.fileUrl,
        fileName: res.data.fileName,
        fileSize: res.data.fileSize,
      });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      {/* File attach */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 text-[var(--color-text-secondary)] hover:text-sn-green transition"
      >
        <Paperclip size={20} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
      />

      {/* Text input */}
      <textarea
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Écrivez un message..."
        className="flex-1 resize-none bg-[var(--color-input)] text-[var(--color-text-primary)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sn-green max-h-[120px] overflow-y-auto"
        style={{ minHeight: '40px' }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = Math.min(target.scrollHeight, 120) + 'px';
        }}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() && !isUploading}
        className="p-2 bg-sn-green text-white rounded-full hover:opacity-90 transition disabled:opacity-30"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
