import type { Conversation } from '../../../types/message';
import { Avatar } from '../../ui/Avatar/Avatar';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

function timeAgo(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (mins > 0) return `${mins}m`;
  return 'now';
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  className = '',
}: ConversationListProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col ${className}`}
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text">Messages</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          {conversations.length} conversation
          {conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-border overflow-y-auto flex-1">
        {conversations.map((conversation) => {
          const other = conversation.otherUser;
          const last = conversation.lastMessage;
          const unread = conversation.unreadCount > 0;
          const name = other.name ?? 'Unnamed Student';

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${
                selectedId === conversation.id ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={other.avatarUrl ?? undefined}
                    alt={name}
                    size="md"
                  />
                  {unread && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-medium truncate ${
                        unread ? 'text-text' : 'text-text-secondary'
                      }`}
                    >
                      {name}
                    </span>
                    {last && (
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        {timeAgo(last.sentAt)}
                      </span>
                    )}
                  </div>
                  {last ? (
                    <p
                      className={`text-sm truncate ${
                        unread ? 'text-text font-medium' : 'text-text-secondary'
                      }`}
                    >
                      {last.content}
                    </p>
                  ) : (
                    <p className="text-sm text-text-secondary italic">
                      Say hello to start the conversation
                    </p>
                  )}
                </div>
                {unread && (
                  <span className="ml-2 flex-shrink-0 bg-primary text-white text-xs rounded-full px-2 py-0.5">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
