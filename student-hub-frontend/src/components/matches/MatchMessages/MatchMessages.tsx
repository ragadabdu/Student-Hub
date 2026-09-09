import { useState, useRef, useEffect } from 'react';
import type { Match } from '../../../types/match';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Button } from '../../ui/Button/Button';
import { Send, ArrowLeft } from 'lucide-react';

interface MatchMessagesProps {
  match: Match;
  onSendMessage: (content: string) => Promise<boolean>;
  onBack: () => void;
  className?: string;
}

// Mock messages for demo
const mockMessages = [
  {
    id: 'msg1',
    senderId: '2',
    content: 'Hey! Great to match with you!',
    sentAt: new Date('2024-03-15T10:30:00'),
  },
  {
    id: 'msg2',
    senderId: '1',
    content: 'Hey! Likewise! I saw you\'re working on AI projects.',
    sentAt: new Date('2024-03-15T10:32:00'),
  },
  {
    id: 'msg3',
    senderId: '2',
    content: 'Yeah! I\'m building an AI study assistant. Want to collaborate?',
    sentAt: new Date('2024-03-15T10:35:00'),
  },
];

export function MatchMessages({ match, onSendMessage, onBack, className = '' }: MatchMessagesProps) {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Check if scrollIntoView is available (not in test environment)
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const success = await onSendMessage(newMessage);
    
    if (success) {
      const newMsg = {
        id: `msg${messages.length + 1}`,
        senderId: '1',
        content: newMessage.trim(),
        sentAt: new Date(),
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    }
    
    setIsSending(false);
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

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-sm border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={onBack}
          className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back to matches"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar src={match.matchedUser.avatarUrl} alt={match.matchedUser.name} size="sm" />
        <div>
          <h4 className="font-semibold text-text">{match.matchedUser.name}</h4>
          <p className="text-xs text-text-secondary">
            {match.matchedUser.major} · {match.matchedUser.university}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
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
                </p>
              </div>
            </div>
          );
        })}
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