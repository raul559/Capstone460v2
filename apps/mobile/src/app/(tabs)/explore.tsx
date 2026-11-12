
import { useState } from 'react';
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
import { useTheme } from '@/hooks/use-theme';

type Feedback = 'up' | 'down' | null;

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  imageUri?: string;
  feedback?: Feedback;
};

const assistantReply =
  'Thanks for your message! The SkinAI chat service is not connected yet. Once backend integration is complete, you will be able to receive personalized educational responses.';

export default function ChatScreen() {
  const colors = useTheme();

  const params = useLocalSearchParams<{
    imageUri?: string;
    from?: string;
  }>();

  const imageUri =
    typeof params.imageUri === 'string' ? params.imageUri : undefined;

  const openedFromResults = params.from === 'results';

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<Message[]>(() => {
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
  });

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: colors.backgroundElement,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 11,
    },
    backButton: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      color: colors.textSecondary,
      fontSize: 34,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 22,
      fontWeight: '700',
    },
    headerInfo: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    profileCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileText: {
      color: colors.text,
      fontWeight: '700',
    },
    chatArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    chatContent: {
      padding: 16,
      gap: 18,
    },
    sessionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 13,
      gap: 11,
    },
    sessionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sessionIconText: {
      color: colors.accent,
      fontSize: 21,
    },
    sessionInfo: {
      flex: 1,
      gap: 4,
    },
    sessionTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    sessionSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    sessionMenu: {
      color: colors.textSecondary,
      fontWeight: '700',
    },
    dateLabel: {
      color: colors.textSecondary,
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
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallLogoText: {
      color: colors.white,
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
      backgroundColor: colors.backgroundElement,
      borderBottomLeftRadius: 4,
    },
    userBubble: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: 4,
    },
    attachedImage: {
      width: 210,
      height: 165,
      borderRadius: 10,
      backgroundColor: colors.backgroundSelected,
    },
    messageText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 20,
    },
    userMessageText: {
      color: colors.white,
    },
    feedbackRow: {
      flexDirection: 'row',
      gap: 8,
    },
    feedbackButton: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
      backgroundColor: colors.backgroundElement,
    },
    feedbackSelected: {
      backgroundColor: colors.backgroundSelected,
    },
    feedbackText: {
      fontSize: 13,
    },
    suggestionSection: {
      gap: 9,
      marginTop: 3,
    },
    suggestionLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
    },
    suggestionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 12,
    },
    suggestionText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    suggestionArrow: {
      color: colors.accent,
      fontSize: 20,
    },
    projectFooter: {
      alignItems: 'center',
      paddingVertical: 13,
      gap: 5,
    },
    projectTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    projectText: {
      color: colors.textSecondary,
      fontSize: 10,
      textAlign: 'center',
    },
    inputSection: {
      paddingHorizontal: 13,
      paddingTop: 11,
      paddingBottom: 9,
      backgroundColor: colors.backgroundElement,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 5,
      gap: 8,
    },
    textInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      maxHeight: 90,
      minHeight: 40,
      paddingVertical: 8,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
    sendButtonText: {
      color: colors.white,
      fontSize: 23,
      fontWeight: '700',
    },
    buttonPressed: {
      opacity: 0.7,
    },
    disclaimer: {
      color: colors.textSecondary,
      fontSize: 9,
      textAlign: 'center',
      marginTop: 8,
    },
  });

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
        text: assistantReply,
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
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
                      accessibilityState={{
                        selected: item.feedback === 'up',
                      }}
                      onPress={() => updateFeedback(item.id, 'up')}
                      style={[
                        styles.feedbackButton,
                        item.feedback === 'up' && styles.feedbackSelected,
                      ]}
                    >
                      <ThemedText style={styles.feedbackText}>👍</ThemedText>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Unhelpful response"
                      accessibilityState={{
                        selected: item.feedback === 'down',
                      }}
                      onPress={() => updateFeedback(item.id, 'down')}
                      style={[
                        styles.feedbackButton,
                        item.feedback === 'down' && styles.feedbackSelected,
                      ]}
                    >
                      <ThemedText style={styles.feedbackText}>👎</ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ))}

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

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask SkinAI a question..."
              placeholderTextColor={colors.textSecondary}
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
