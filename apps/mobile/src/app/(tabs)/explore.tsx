
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  imageUri?: string;
};

type Feedback = 'up' | 'down' | null;

const assistantReply =
  'Thanks for your message! The SkinAI chat service is not connected yet. Once backend integration is complete, you will be able to receive personalized educational responses.';

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    imageUri?: string;
    from?: string;
  }>();

  const imageUri =
    typeof params.imageUri === 'string' ? params.imageUri : undefined;

  const openedFromResults = params.from === 'results';

  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! Welcome to SkinAI. I can help you learn about skin health and understand our image analysis system.',
    },
  ]);

  useEffect(() => {
    if (!imageUri) return;

    setMessages([
      {
        id: Date.now(),
        sender: 'user',
        text: 'I would like to learn more about this skin image.',
        imageUri,
      },
      {
        id: Date.now() + 1,
        sender: 'assistant',
        text:
          'I can help explain general skin health information. A photograph alone cannot determine whether a spot is benign or cancerous. A qualified dermatologist can evaluate the area and any changes over time.',
      },
    ]);
  }, [imageUri]);

  const sendMessage = (text: string) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: 'user',
        text: trimmedMessage,
      },
      {
        id: Date.now() + 1,
        sender: 'assistant',
        text: assistantReply,
      },
    ]);

    setMessage('');
    setFeedback(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          {openedFromResults && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back to results"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ThemedText style={styles.backText}>‹</ThemedText>
            </Pressable>
          )}

          <View style={styles.logo}>
            <ThemedText style={styles.logoText}>S</ThemedText>
          </View>

          <View style={styles.headerInfo}>
            <ThemedText style={styles.title}>SkinAI Chat</ThemedText>
            <ThemedText style={styles.subtitle}>
              Your skin health learning assistant
            </ThemedText>
          </View>

          <View style={styles.profileCircle}>
            <ThemedText style={styles.profileText}>U</ThemedText>
          </View>
        </View>

        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Session information */}
          <View style={styles.sessionCard}>
            <View style={styles.sessionIcon}>
              <ThemedText style={styles.sessionIconText}>✦</ThemedText>
            </View>

            <View style={styles.sessionInfo}>
              <ThemedText style={styles.sessionTitle}>
                Skin image questions
              </ThemedText>
              <ThemedText style={styles.sessionSubtitle}>
                Current conversation
              </ThemedText>
            </View>

            <ThemedText style={styles.sessionMenu}>•••</ThemedText>
          </View>

          <ThemedText style={styles.dateLabel}>
            CONVERSATION
          </ThemedText>

          {/* Messages */}
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageRow,
                item.sender === 'user' && styles.userMessageRow,
              ]}
            >
              {item.sender === 'assistant' && (
                <View style={styles.smallLogo}>
                  <ThemedText style={styles.smallLogoText}>S</ThemedText>
                </View>
              )}

              <View
                style={[
                  styles.messageGroup,
                  item.sender === 'user' && styles.userMessageGroup,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  {item.imageUri && (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.attachedImage}
                      resizeMode="cover"
                      accessibilityLabel="Uploaded skin image"
                    />
                  )}

                  <ThemedText
                    style={[
                      styles.messageText,
                      item.sender === 'user' && styles.userMessageText,
                    ]}
                  >
                    {item.text}
                  </ThemedText>
                </View>

                {item.sender === 'assistant' && (
                  <View style={styles.feedbackRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Helpful response"
                      onPress={() => setFeedback('up')}
                      style={[
                        styles.feedbackButton,
                        feedback === 'up' && styles.feedbackSelected,
                      ]}
                    >
                      <ThemedText style={styles.feedbackText}>
                        👍
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Unhelpful response"
                      onPress={() => setFeedback('down')}
                      style={[
                        styles.feedbackButton,
                        feedback === 'down' && styles.feedbackSelected,
                      ]}
                    >
                      <ThemedText style={styles.feedbackText}>
                        👎
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Suggested question */}
          <View style={styles.suggestionSection}>
            <ThemedText style={styles.suggestionLabel}>
              SUGGESTED QUESTION
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                sendMessage('What changes should I look out for?')
              }
              style={({ pressed }) => [
                styles.suggestionChip,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.suggestionText}>
                What changes should I look out for?
              </ThemedText>
              <ThemedText style={styles.suggestionArrow}>›</ThemedText>
            </Pressable>
          </View>

          {/* Project information */}
          <View style={styles.projectFooter}>
            <ThemedText style={styles.projectTitle}>
              SkinAI Classifier
            </ThemedText>
            <ThemedText style={styles.projectText}>
              Capstone Project · Purdue University Fort Wayne
            </ThemedText>
            <ThemedText style={styles.projectText}>
              Educational purposes only
            </ThemedText>
          </View>
        </ScrollView>

        {/* Message input */}
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask SkinAI a question..."
              placeholderTextColor="#858B96"
              style={styles.textInput}
              multiline
              maxLength={1000}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={!message.trim()}
              onPress={() => sendMessage(message)}
              style={({ pressed }) => [
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.sendButtonText}>↑</ThemedText>
            </Pressable>
          </View>

          <ThemedText style={styles.disclaimer}>
            AI can make mistakes. Never rely on it for medical decisions.
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D0D6E1',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#EFF1F4',
    borderBottomWidth: 1,
    borderBottomColor: '#C4CBD5',
    gap: 11,
  },
  backButton: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#3B4351',
    fontSize: 34,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3E839C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: '#3B4351',
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: '#68717F',
    fontSize: 11,
  },
  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D0D6E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: '#3B4351',
    fontWeight: '700',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 18,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF1F4',
    borderRadius: 14,
    padding: 13,
    gap: 11,
  },
  sessionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionIconText: {
    color: '#3E839C',
    fontSize: 21,
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  sessionTitle: {
    color: '#3B4351',
    fontWeight: '700',
    fontSize: 13,
  },
  sessionSubtitle: {
    color: '#68717F',
    fontSize: 11,
  },
  sessionMenu: {
    color: '#68717F',
    fontWeight: '700',
  },
  dateLabel: {
    color: '#68717F',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  smallLogo: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#3E839C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  messageGroup: {
    maxWidth: '86%',
    gap: 7,
  },
  userMessageGroup: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    padding: 13,
    borderRadius: 15,
    gap: 9,
  },
  assistantBubble: {
    backgroundColor: '#EFF1F4',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#3E839C',
    borderBottomRightRadius: 4,
  },
  attachedImage: {
    width: 210,
    height: 165,
    borderRadius: 10,
    backgroundColor: '#D0D6E1',
  },
  messageText: {
    color: '#3B4351',
    fontSize: 13,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: '#EFF1F4',
  },
  feedbackSelected: {
    backgroundColor: '#C1DDE3',
  },
  feedbackText: {
    fontSize: 13,
  },
  suggestionSection: {
    gap: 9,
    marginTop: 3,
  },
  suggestionLabel: {
    color: '#68717F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF1F4',
    borderColor: '#C4CBD5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  suggestionText: {
    color: '#3E839C',
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionArrow: {
    color: '#3E839C',
    fontSize: 20,
  },
  projectFooter: {
    alignItems: 'center',
    paddingVertical: 13,
    gap: 5,
  },
  projectTitle: {
    color: '#3B4351',
    fontWeight: '700',
    fontSize: 12,
  },
  projectText: {
    color: '#68717F',
    fontSize: 10,
    textAlign: 'center',
  },
  inputSection: {
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 9,
    backgroundColor: '#EFF1F4',
    borderTopWidth: 1,
    borderTopColor: '#C4CBD5',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C4CBD5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: '#3B4351',
    fontSize: 13,
    maxHeight: 90,
    minHeight: 40,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3E839C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  disclaimer: {
    color: '#68717F',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 8,
  },
});
