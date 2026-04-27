'use client';

import { ArrowLeft, Send } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ConversationList from '../../../../components/chat/ConversationList';
import { useSocket } from '../../../../hooks/useSocket';
import {
  messageService,
  TConversation,
  TMessage,
} from '../../../../services/message';
import useUserStore from '../../../../store/useUserStore';

// /chat/[conversationId]

const ConversationPage = () => {
  const { conversationId } = useParams() as { conversationId: string };
  const router = useRouter();
  const { user } = useUserStore();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<TConversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive otherUserId from conversationId (format: smallerId_largerId)
  const otherUserId =
    conversationId?.split('_').find((id) => id !== user?._id) ?? '';

  // Active conversation info
  const activeConv = conversations.find(
    (c) => c.conversationId === conversationId,
  );

  // ── Fetch conversations ────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await messageService.getConversations();
        setConversations(data);
      } catch {
        setConversations([]);
      } finally {
        setConvLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Fetch messages + join room ─────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !otherUserId) return;

    const fetchMessages = async () => {
      setMsgLoading(true);
      try {
        const data = await messageService.getMessages(otherUserId);
        setMessages(data);
        // Mark as read
        await messageService.markAsRead(otherUserId);
        // Tell sender their messages are read
        socket?.emit('mark_read', otherUserId);
        // Reset unread count in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      } catch {
        setMessages([]);
      } finally {
        setMsgLoading(false);
      }
    };

    fetchMessages();

    // Join Socket.IO room
    socket?.emit('join_conversation', otherUserId);

    return () => {
      socket?.emit('leave_conversation', otherUserId);
    };
  }, [conversationId, otherUserId, socket]);

  // ── Socket events ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: TMessage) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, msg]);
      // If receiver, mark as read immediately
      if (msg.senderId !== user?._id) {
        socket.emit('mark_read', otherUserId);
      }
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    const handleMessagesRead = () => {
      // Update all our sent messages to isRead: true
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user?._id ? { ...m, isRead: true } : m,
        ),
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, conversationId, user?._id, otherUserId]);

  // ── Scroll to bottom on new messages ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);

    // Optimistic update
    const tempMsg: TMessage = {
      _id: `temp_${Date.now()}`,
      conversationId,
      senderId: user?._id ?? '',
      receiverId: otherUserId,
      text: msgText,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      // Send via Socket.IO (saves to DB + emits to room)
      socket?.emit('send_message', {
        receiverId: otherUserId,
        text: msgText,
      });

      // Update conversation list last message
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId
            ? {
                ...c,
                lastMessage: {
                  text: msgText,
                  senderId: user?._id ?? '',
                  createdAt: new Date().toISOString(),
                  isRead: false,
                },
              }
            : c,
        ),
      );
    } catch {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleTyping = () => {
    socket?.emit('typing', otherUserId);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket?.emit('stop_typing', otherUserId);
    }, 1500);
    setTypingTimeout(timeout);
  };

  // ── Handle Enter key ───────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: TMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateLabel = formatDateLabel(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateLabel) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, messages: [msg] });
    }
  });

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Left: conversation list */}
      <ConversationList
        conversations={conversations}
        loading={convLoading}
        activeConversationId={conversationId}
        onSelect={(convId) => router.push(`/chat/${convId}`)}
      />

      {/* Right: active chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <button
            onClick={() => router.push('/chat')}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer md:hidden"
          >
            <ArrowLeft size={18} />
          </button>
          {activeConv?.otherUser?.profileImage ? (
            <Image
              src={activeConv.otherUser.profileImage}
              alt={activeConv.otherUser.name}
              width={38}
              height={38}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9.5 h-9.5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
              {activeConv?.otherUser?.name[0].toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <p
              className="text-sm font-semibold text-gray-900"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {activeConv?.otherUser?.name ?? '...'}
            </p>
            {isTyping && <p className="text-xs text-indigo-500">typing...</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {msgLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!msgLoading && messages.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-gray-400">
                No messages yet. Say hello!
              </p>
            </div>
          )}

          {!msgLoading &&
            groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 shrink-0">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Messages in group */}
                <div className="space-y-1.5">
                  {group.messages.map((msg) => {
                    const isMine = msg.senderId === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? 'text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                          style={
                            isMine
                              ? {
                                  background:
                                    'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                }
                              : {}
                          }
                        >
                          <p className="text-sm leading-relaxed wrap-break-words">
                            {msg.text}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span
                              className={`text-[10px] ${
                                isMine ? 'text-indigo-200' : 'text-gray-400'
                              }`}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </span>
                            {/* Read receipt for sent messages */}
                            {isMine && (
                              <span
                                className={`text-[10px] ${
                                  msg.isRead
                                    ? 'text-indigo-200'
                                    : 'text-indigo-300'
                                }`}
                              >
                                {msg.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
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
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-end gap-3">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90 cursor-pointer shrink-0"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
