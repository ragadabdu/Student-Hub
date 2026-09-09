import type { Conversation } from '../../../types/message';
import { Avatar } from '../../ui/Avatar/Avatar';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  getOtherParticipant: (conv: Conversation) => { id: string; name: string; avatarUrl: string };
  formatLastMessageTime: (date: Date) => string;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  getOtherParticipant,
  formatLastMessageTime,
  className = '',
}: ConversationListProps) {
  const getLastMessage = (conversation: Conversation) => {
    const messages = conversation.messages;
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const isUnread = (conversation: Conversation) => {
    const lastMessage = getLastMessage(conversation);
    if (!lastMessage) return false;
    return lastMessage.senderId !== '1' && !lastMessage.readAt;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-border overflow-hidden ${className}`}>
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text">Messages</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {conversations.map((conversation) => {
          const other = getOtherParticipant(conversation);
          const lastMessage = getLastMessage(conversation);
          const unread = isUnread(conversation);

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`
                w-full text-left p-4 transition-colors hover:bg-gray-50
                ${selectedId === conversation.id ? 'bg-primary/5' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src={other.avatarUrl} alt={other.name} size="md" />
                  {unread && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-medium truncate ${unread ? 'text-text' : 'text-text-secondary'}`}>
                      {other.name}
                    </span>
                    {lastMessage && (
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        {formatLastMessageTime(lastMessage.sentAt)}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <p className={`text-sm truncate ${unread ? 'text-text font-medium' : 'text-text-secondary'}`}>
                      {lastMessage.senderId === '1' ? 'You: ' : ''}
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}