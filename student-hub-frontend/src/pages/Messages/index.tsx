import { useNavigate, useParams } from 'react-router-dom';
import { useConversations, useConversation } from '../../hooks/useMessages';
import { ConversationList } from '../../components/messaging/ConversationList/ConversationList';
import { ChatWindow } from '../../components/messaging/ChatWindow/ChatWindow';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, MessageCircle } from 'lucide-react';

export default function Messages() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const {
    conversations,
    isLoading: isLoadingList,
    error: listError,
    reload: reloadList,
  } = useConversations();

  const {
    conversation,
    messages,
    isLoading: isLoadingChat,
    isSending,
    error: chatError,
    sendMessage,
  } = useConversation(conversationId ?? null);

  // ---------------------------------------------------------------
  // No conversations at all → full-page empty state
  // ---------------------------------------------------------------
  if (!isLoadingList && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <EmptyState
          icon="💬"
          title="No messages yet"
          description="Match with someone and say hello to start a conversation."
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Find People
            </Button>
          }
        />
      </div>
    );
  }

  // ---------------------------------------------------------------
  // Initial load errors
  // ---------------------------------------------------------------
  if (listError && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">
            Failed to load messages
          </h3>
          <p className="text-text-secondary mb-4">{listError}</p>
          <Button onClick={reloadList}>Try Again</Button>
        </div>
      </div>
    );
  }

  const handleSelect = (id: string) => {
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    navigate('/messages');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-navy">Messages</h1>
        <p className="text-text-secondary mt-1">
          {conversations.length} conversation
          {conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-6 h-[calc(100%-5rem)]">
        {/* Conversation list — hidden on mobile when chat is open */}
        <div
          className={`
            w-full lg:w-96 flex-shrink-0
            ${conversationId ? 'hidden lg:block' : 'block'}
          `}
        >
          {isLoadingList && conversations.length === 0 ? (
            <LoadingState message="Loading conversations..." />
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={conversationId ?? null}
              onSelect={handleSelect}
              className="h-full"
            />
          )}
        </div>

        {/* Chat window */}
        <div
          className={`
            flex-1 min-w-0
            ${conversationId ? 'block' : 'hidden lg:block'}
          `}
        >
          {conversationId ? (
            isLoadingChat ? (
              <div className="h-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-border">
                <LoadingState message="Loading conversation..." />
              </div>
            ) : chatError ? (
              <div className="h-full flex items-center justify-center bg-white rounded-2xl shadow-sm border border-border">
                <div className="text-center p-8">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-text-secondary">{chatError}</p>
                  <Button onClick={handleBack} className="mt-4">
                    Back to list
                  </Button>
                </div>
              </div>
            ) : conversation ? (
              <ChatWindow
                conversation={conversation}
                messages={messages}
                onSendMessage={sendMessage}
                onBack={handleBack}
                isSending={isSending}
                className="h-full"
              />
            ) : null
          ) : (
            <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-border">
              <div className="text-center p-8">
                <MessageCircle className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text">
                  Select a conversation
                </h3>
                <p className="text-text-secondary mt-2">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
