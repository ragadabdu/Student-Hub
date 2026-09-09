import { useMessages } from '../../hooks/useMessages';
import { ConversationList } from '../../components/messaging/ConversationList/ConversationList';
import { ChatWindow } from '../../components/messaging/ChatWindow/ChatWindow';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Button } from '../../components/ui/Button/Button';
import { AlertCircle, MessageCircle } from 'lucide-react';

export default function Messages() {
  const {
    conversations,
    isLoading,
    error,
    selectedConversationId,
    isSendingMessage,
    loadConversations,
    selectConversation,
    clearSelectedConversation,
    getSelectedConversation,
    sendMessage,
    getOtherParticipant,
    formatLastMessageTime,
    hasConversations,
  } = useMessages();

  const selectedConversation = getSelectedConversation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading messages..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">Failed to load messages</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <Button onClick={loadConversations}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!hasConversations) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <EmptyState
          icon="💬"
          title="No messages yet"
          description="Start connecting with people and you'll see your conversations here."
          action={
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Find People
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-navy">Messages</h1>
        <p className="text-text-secondary mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 h-[calc(100%-5rem)]">
        {/* Conversation List */}
        <div className={`
          w-full lg:w-96 flex-shrink-0
          ${selectedConversation ? 'hidden lg:block' : 'block'}
        `}>
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={selectConversation}
            getOtherParticipant={getOtherParticipant}
            formatLastMessageTime={formatLastMessageTime}
            className="h-full"
          />
        </div>

        {/* Chat Window */}
        <div className={`
          flex-1 min-w-0
          ${selectedConversation ? 'block' : 'hidden lg:block'}
        `}>
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onSendMessage={sendMessage}
              onBack={clearSelectedConversation}
              isSending={isSendingMessage}
              getOtherParticipant={getOtherParticipant}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-border">
              <div className="text-center p-8">
                <MessageCircle className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text">Select a conversation</h3>
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