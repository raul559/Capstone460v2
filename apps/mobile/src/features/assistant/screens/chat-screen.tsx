import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ChatHeader } from '@/features/assistant/components/chat-header';
import { ChatInputBar } from '@/features/assistant/components/chat-input-bar';
import { ChatMessageItem } from '@/features/assistant/components/chat-message-item';
import { ChatProjectFooter } from '@/features/assistant/components/chat-project-footer';
import { createChatScreenStyles } from '@/features/assistant/screens/chat-screen.styles';
import { ChatSessionCard } from '@/features/assistant/components/chat-session-card';
import { ChatSuggestion } from '@/features/assistant/components/chat-suggestion';
import { useChatMessages } from '@/features/assistant/hooks/use-chat-messages';
import { useTheme } from '@/hooks/use-theme';

export default function ChatScreen() {
  const styles = createChatScreenStyles(useTheme());

  const params = useLocalSearchParams<{
    imageUri?: string;
    from?: string;
  }>();

  const imageUri =
    typeof params.imageUri === 'string' ? params.imageUri : undefined;

  const openedFromResults = params.from === 'results';

  const { message, setMessage, messages, sendMessage, updateFeedback } =
    useChatMessages(imageUri);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ChatHeader showBackButton={openedFromResults} />

        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ChatSessionCard />

          <ThemedText style={styles.dateLabel}>
            CONVERSATION
          </ThemedText>

          {messages.map((item) => (
            <ChatMessageItem
              key={item.id}
              message={item}
              onFeedback={updateFeedback}
            />
          ))}

          <ChatSuggestion onSelect={sendMessage} />

          <ChatProjectFooter />
        </ScrollView>

        <ChatInputBar
          value={message}
          onChangeText={setMessage}
          onSend={sendMessage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
