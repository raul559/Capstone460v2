import { useState } from 'react';

import {
  ASSISTANT_REPLY,
  createInitialMessages,
  type ChatMessage,
  type Feedback,
} from '@/features/assistant/utils/chat-messages';

export function useChatMessages(imageUri?: string) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialMessages(imageUri)
  );

  const sendMessage = (text: string) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    const messageId = Date.now();

    setMessages((current) => [
      ...current,
      {
        id: messageId,
        sender: 'user',
        text: trimmedMessage,
      },
      {
        id: messageId + 1,
        sender: 'assistant',
        text: ASSISTANT_REPLY,
      },
    ]);

    setMessage('');
  };

  const updateFeedback = (messageId: number, feedback: Feedback) => {
    setMessages((current) =>
      current.map((item) =>
        item.id === messageId ? { ...item, feedback } : item
      )
    );
  };

  return { message, setMessage, messages, sendMessage, updateFeedback };
}
