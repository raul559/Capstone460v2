export type Feedback = 'up' | 'down' | null;

export type ChatMessage = {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  imageUri?: string;
  feedback?: Feedback;
};

// Placeholder until the assistant service is connected to the backend.
export const ASSISTANT_REPLY =
  'Thanks for your message! The SkinAI chat service is not connected yet. Once backend integration is complete, you will be able to receive personalized educational responses.';

export function createInitialMessages(imageUri?: string): ChatMessage[] {
  if (imageUri) {
    return [
      {
        id: 1,
        sender: 'user',
        text: 'I would like to learn more about this skin image.',
        imageUri,
      },
      {
        id: 2,
        sender: 'assistant',
        text: 'I can help explain general skin health information. A photograph alone cannot determine whether a spot is benign or cancerous. A qualified dermatologist can evaluate the area and any changes over time.',
      },
    ];
  }

  return [
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! Welcome to SkinAI. I can help you learn about skin health and understand our image analysis system.',
    },
  ];
}
