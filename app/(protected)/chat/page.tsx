'use client';

import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConversationList from '../../../components/chat/ConversationList';
import { messageService, TConversation } from '../../../services/message';

const ChatPage = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<TConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await messageService.getConversations();
        setConversations(data);
      } catch {
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSelect = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  return (
    <div className="flex h-full bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Mobile: full width conversation list only */}
      {/* Desktop: left panel */}
      <div className="w-full md:w-80 md:border-r md:border-gray-100 flex flex-col shrink-0">
        <ConversationList
          conversations={conversations}
          loading={loading}
          activeConversationId={null}
          onSelect={handleSelect}
        />
      </div>

      {/* Desktop only: right empty state */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-indigo-400" />
        </div>
        <h2
          className="text-lg font-bold text-gray-900 mb-2"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          Your messages
        </h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Select a conversation from the left to start chatting with your mentor
          or learner.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;

// 'use client';

// import { MessageSquare } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import ConversationList from '../../../components/chat/ConversationList';
// import { messageService, TConversation } from '../../../services/message';

// // /chat — main inbox
// // Left: conversation list | Right: empty state (select a conversation)

// const ChatPage = () => {
//   const router = useRouter();
//   const [conversations, setConversations] = useState<TConversation[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const data = await messageService.getConversations();
//         setConversations(data);
//       } catch {
//         setConversations([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, []);

//   const handleSelect = (conversationId: string) => {
//     router.push(`/chat/${conversationId}`);
//   };

//   return (
//     <div className="flex h-[calc(100vh-80px)] bg-white border border-gray-200 rounded-2xl overflow-hidden">
//       {/* Left: conversation list */}
//       <ConversationList
//         conversations={conversations}
//         loading={loading}
//         activeConversationId={null}
//         onSelect={handleSelect}
//       />

//       {/* Right: empty state */}
//       <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
//         <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
//           <MessageSquare size={28} className="text-indigo-400" />
//         </div>
//         <h2
//           className="text-lg font-bold text-gray-900 mb-2"
//           style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
//         >
//           Your messages
//         </h2>
//         <p className="text-sm text-gray-400 max-w-xs">
//           Select a conversation from the left to start chatting with your mentor
//           or learner.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
