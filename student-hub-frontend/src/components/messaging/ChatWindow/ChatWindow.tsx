import { useState, useRef, useEffect } from 'react';
import type { Conversation } from '../../../types/message';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Button } from '../../ui/Button/Button';
import { Send, ArrowLeft } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (content: string) => Promise<boolean>;
  onBack: () => void;
  isSending: boolean;
  getOtherParticipant: (conv: Conversation) => { id: string; name: string; avatarUrl: string };
  className?: string;
}

export function ChatWindow({
  conversation,
  onSendMessage,
  onBack,
  isSending,
  getOtherParticipant,
  className = '',
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const other = getOtherParticipant(conversation);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    const success = await onSendMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof conversation.messages }[] = [];
  let currentDate = '';

  conversation.messages.forEach((msg) => {
    const dateStr = formatDate(msg.sentAt);
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({ date: dateStr, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-sm border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar src={other.avatarUrl} alt={other.name} size="sm" />
        <div>
          <h4 className="font-semibold text-text">{other.name}</h4>
          <p className="text-xs text-text-secondary">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group, idx) => (
          <div key={idx}>
            <div className="flex justify-center">
              <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            <div className="space-y-3 mt-3">
              {group.messages.map((msg) => {
                const isOwn = msg.senderId === '1';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-text-secondary'}`}>
                        {formatTime(msg.sentAt)}
                        {isOwn && msg.readAt && ' ✓✓'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            disabled={isSending}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}