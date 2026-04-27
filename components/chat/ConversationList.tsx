'use client';

import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { TConversation } from '../../services/message';
import useUserStore from '../../store/useUserStore';

type Props = {
  conversations: TConversation[];
  loading: boolean;
  activeConversationId: string | null;
  onSelect: (conversationId: string, otherUserId: string) => void;
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

const ConversationList = ({
  conversations,
  loading,
  activeConversationId,
  onSelect,
}: Props) => {
  const { user } = useUserStore();

  return (
    <div className="w-80 border-r border-gray-100 flex flex-col shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Messages
        </h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <MessageSquare size={28} className="text-gray-200 mb-2" />
            <p className="text-xs text-gray-400">
              No conversations yet. Book and pay for a session to start
              chatting.
            </p>
          </div>
        )}

        {!loading &&
          conversations.map((conv) => {
            const isActive = activeConversationId === conv.conversationId;
            const isUnread =
              conv.unreadCount > 0 && conv.lastMessage?.senderId !== user?._id;

            return (
              <button
                key={conv.conversationId}
                onClick={() =>
                  onSelect(conv.conversationId, conv.otherUser?._id ?? '')
                }
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all hover:bg-gray-50 cursor-pointer ${
                  isActive ? 'bg-indigo-50 border-r-2 border-indigo-500' : ''
                }`}
              >
                {/* Avatar */}
                {conv.otherUser?.profileImage ? (
                  <div className="w-10.5 h-10.5 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={conv.otherUser.profileImage}
                      alt={conv.otherUser.name}
                      width={42}
                      height={42}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10.5 h-10.5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0">
                    {conv.otherUser?.name[0].toUpperCase() ?? '?'}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className={`text-sm truncate ${
                        isUnread
                          ? 'font-semibold text-gray-900'
                          : 'font-medium text-gray-700'
                      }`}
                    >
                      {conv.otherUser?.name ?? 'Unknown'}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs truncate ${
                        isUnread ? 'text-gray-700 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {conv.lastMessage
                        ? conv.lastMessage.senderId === user?._id
                          ? `You: ${conv.lastMessage.text}`
                          : conv.lastMessage.text
                        : 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 &&
                      conv.lastMessage?.senderId !== user?._id && (
                        <span className="ml-2 shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </span>
                      )}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default ConversationList;
