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

const ConversationPage = () => {
  const { conversationId } = useParams() as { conversationId: string };
  const router = useRouter();
  const { user } = useUserStore();
  const { socket } = useSocket();
  const { removeConversation } = useSocket();

  useEffect(() => {
    if (!conversationId) return;

    removeConversation(conversationId);
  }, [conversationId, removeConversation]);

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

  const otherUserId =
    conversationId?.split('_').find((id) => id !== user?._id) ?? '';

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
        await messageService.markAsRead(otherUserId);
        socket?.emit('mark_read', otherUserId);
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
      if (msg.senderId === user?._id) {
        setMessages((prev) => {
          const hasTempMsg = prev.some((m) => m._id.startsWith('temp_'));
          if (hasTempMsg) {
            return prev.map((m) =>
              m._id.startsWith('temp_') && m.text === msg.text ? { ...msg } : m,
            );
          }
          return [...prev, msg];
        });
      } else {
        setMessages((prev) => [...prev, msg]);
        socket?.emit('mark_read', otherUserId);
      }
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleMessagesRead = () => {
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

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setText('');
    setSending(true);

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
      socket?.emit('send_message', { receiverId: otherUserId, text: msgText });
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
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleTypingEvent = () => {
    socket?.emit('typing', otherUserId);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket?.emit('stop_typing', otherUserId);
    }, 1500);
    setTypingTimeout(timeout);
  };

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
    <div className="flex h-full bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* ── Desktop only: conversation list sidebar ────────────────────────── */}
      <div className="hidden md:flex w-80 border-r border-gray-100 flex-col shrink-0">
        <ConversationList
          conversations={conversations}
          loading={convLoading}
          activeConversationId={conversationId}
          onSelect={(convId) => router.push(`/chat/${convId}`)}
        />
      </div>

      {/* ── Chat panel (full width on mobile, flex-1 on desktop) ──────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
          {/* Back button — mobile only */}
          <button
            onClick={() => router.push('/chat')}
            className="md:hidden text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Avatar */}
          {activeConv?.otherUser?.profileImage ? (
            <Image
              src={activeConv.otherUser.profileImage}
              alt={activeConv.otherUser.name}
              width={38}
              height={38}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-9.5 h-9.5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
              {activeConv?.otherUser?.name[0]?.toUpperCase() ?? '?'}
            </div>
          )}

          <div className="min-w-0">
            <p
              className="text-sm font-semibold text-gray-900 truncate"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {activeConv?.otherUser?.name ?? '...'}
            </p>
            {isTyping && <p className="text-xs text-indigo-500">typing...</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 shrink-0">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <div className="space-y-1.5">
                  {group.messages.map((msg) => {
                    const isMine = msg.senderId === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
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
                          <p className="text-sm leading-relaxed wrap-break-word">
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
        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTypingEvent();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)] transition-all resize-none max-h-32 overflow-y-auto"
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
          <p className="text-[10px] text-gray-400 mt-1.5 hidden sm:block">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
