/* eslint-disable max-lines -- TODO: split into smaller files. */

import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { SkinAnalysisResult } from '@/types/skin-analysis';

type Props = {
  result: SkinAnalysisResult;
  imageUri: string;
};

const riskLabels: Record<string, string> = {
  high_risk: 'High Risk',
  moderate_risk: 'Moderate Risk',
  low_risk: 'Low Risk',
  clinician_review: 'Clinician Review Recommended',
};

const predictionLabels: Record<string, string> = {
  akiec: 'Actinic keratoses / related lesions',
  bcc: 'Basal cell carcinoma',
  bkl: 'Benign keratosis-like lesion',
  df: 'Dermatofibroma',
  mel: 'Melanoma',
  nv: 'Melanocytic nevi',
  vasc: 'Vascular lesion',
};

const predictionDescriptions: Record<string, string> = {
  akiec: 'A potentially precancerous or related skin lesion. A healthcare professional should evaluate it.',
  bcc: 'A common type of skin cancer. A healthcare professional should evaluate this finding.',
  bkl: 'A benign keratosis-like skin lesion. This preliminary result does not replace clinical examination.',
  df: 'A usually benign skin growth. A clinician can confirm the finding.',
  mel: 'A potentially serious skin condition. Prompt evaluation by a qualified healthcare professional is important.',
  nv: 'A common type of pigmented mole. This preliminary assessment does not replace a clinical examination.',
  vasc: 'A skin lesion involving blood vessels. A clinician can confirm the finding.',
};

export function SkinAnalysisResults({ result, imageUri }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);

  const primary = result.top_predictions[0];
  const code = primary?.label.toLowerCase() ?? '';
  const risk = riskLabels[result.risk_score] ?? result.risk_score;

  return (
    <View style={styles.container}>
      {/* Results heading */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <ThemedText style={styles.logoText}>S</ThemedText>
        </View>
        <ThemedText style={styles.headerLabel}>RESULT OVERVIEW</ThemedText>
        <View style={styles.headerIcon}>
          <ThemedText style={styles.sparkle}>✦</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.pageTitle}>Your analysis</ThemedText>

      {/* Uploaded image */}
      <View style={styles.imageCard}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
        <ThemedText style={styles.imageCaption}>Analyzed image</ThemedText>
      </View>

      {/* Primary finding */}
      {primary && (
        <View style={styles.findingCard}>
          <View style={styles.findingHeader}>
            <ThemedText style={styles.sectionLabel}>
              PRIMARY FINDING
            </ThemedText>
            <View style={styles.codeBadge}>
              <ThemedText style={styles.codeText}>
                {code.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.findingTitle}>
            {predictionLabels[code] ?? primary.label}
          </ThemedText>

          <ThemedText style={styles.description}>
            {predictionDescriptions[code] ??
              'This preliminary AI assessment does not replace a clinical examination.'}
          </ThemedText>

          <View style={styles.confidenceRow}>
            <View style={styles.confidenceBadge}>
              <ThemedText style={styles.confidenceText}>
                Confidence: {(primary.confidence * 100).toFixed(1)}%
              </ThemedText>
            </View>
          </View>

          <View style={styles.riskBadge}>
            <ThemedText style={styles.riskText}>
              {risk}
            </ThemedText>
          </View>

          <ThemedText style={styles.learnMore}>
            Preliminary AI finding · Not a diagnosis
          </ThemedText>
        </View>
      )}

      {/* Clinical notice */}
      <View style={styles.noticeCard}>
        <ThemedText style={styles.noticeIcon}>!</ThemedText>
        <View style={styles.noticeContent}>
          <ThemedText style={styles.noticeTitle}>
            Clinical Triage Notice
          </ThemedText>
          <ThemedText style={styles.noticeText}>
            Confidence scores are not clinical recommendations. This tool
            cannot rule out malignancy or replace a biopsy. If a spot is new,
            changing, bleeding, or concerning, contact a qualified healthcare
            professional.
          </ThemedText>
        </View>
      </View>

      {/* Other predictions */}
      {result.top_predictions.length > 1 && (
        <View style={styles.otherCard}>
          <ThemedText style={styles.otherTitle}>
            Other possible findings
          </ThemedText>

          {result.top_predictions.slice(1).map((prediction, index) => {
            const label = prediction.label.toLowerCase();

            return (
              <View
                key={`${prediction.label}-${index}`}
                style={styles.predictionRow}
              >
                <ThemedText style={styles.predictionName}>
                  {predictionLabels[label] ?? prediction.label}
                </ThemedText>
                <ThemedText style={styles.predictionConfidence}>
                  {(prediction.confidence * 100).toFixed(1)}%
                </ThemedText>
              </View>
            );
          })}
        </View>
      )}

      {/* Questionnaire and AI Chat */}
      <View style={styles.questionnaire}>
        <ThemedText style={styles.questionnaireText}>
          Boost confidence: Complete the symptom check to provide additional
          information about your skin.
        </ThemedText>

        <Pressable
          accessibilityRole="button"
          onPress={() => {}}
          style={styles.questionnaireButton}
        >
          <ThemedText style={styles.questionnaireButtonText}>
            Questionnaire coming soon
          </ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/explore',
              params: {
                imageUri,
                from: 'results',
              },
            })
          }
          style={({ pressed }) => [
            styles.chatButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText style={styles.chatButtonText}>
            Chat with SkinAI
          </ThemedText>
          <ThemedText style={styles.chatArrow}>›</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      marginTop: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    logo: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 21,
      fontWeight: 'bold',
    },
    headerLabel: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sparkle: {
      fontSize: 20,
      color: colors.accent,
    },
    pageTitle: {
      color: colors.text,
      fontSize: 27,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    imageCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 18,
      marginBottom: 20,
      overflow: 'hidden',
      elevation: 4,
    },
    image: {
      width: '100%',
      height: 190,
      backgroundColor: colors.background,
    },
    imageCaption: {
      color: colors.textSecondary,
      fontSize: 11,
      padding: 12,
    },
    findingCard: {
      backgroundColor: colors.backgroundElement,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      elevation: 4,
    },
    findingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sectionLabel: {
      color: colors.text,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    codeBadge: {
      backgroundColor: colors.text,
      borderRadius: 6,
      paddingVertical: 5,
      paddingHorizontal: 9,
    },
    codeText: {
      color: colors.backgroundElement,
      fontSize: 10,
      fontWeight: 'bold',
    },
    findingTitle: {
      color: colors.text,
      fontSize: 23,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 12,
    },
    confidenceRow: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    confidenceBadge: {
      backgroundColor: colors.backgroundSelected,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    confidenceText: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '600',
    },
    riskBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    riskText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    learnMore: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    noticeCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      elevation: 3,
    },
    noticeIcon: {
      color: colors.danger,
      fontSize: 17,
      fontWeight: 'bold',
      marginRight: 12,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    otherCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    otherTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    predictionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 10,
    },
    predictionName: {
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
      paddingRight: 10,
    },
    predictionConfidence: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    questionnaire: {
      marginBottom: 20,
    },
    questionnaireText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 13,
    },
    questionnaireButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 20,
      elevation: 4,
    },
    questionnaireButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    chatButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginTop: 12,
    },
    chatButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: 'bold',
    },
    chatArrow: {
      color: colors.accent,
      fontSize: 24,
    },
    buttonPressed: {
      opacity: 0.7,
    },
    arrow: {
      color: colors.white,
      fontSize: 24,
    },
  });
}
