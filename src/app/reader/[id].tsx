import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useSaves } from '../../hooks/useSaves';

const HIGHLIGHT_INJECT_JS = `
(function() {
  function setup() {
    document.addEventListener('selectionchange', function() {
      var selection = window.getSelection();
      var text = selection ? selection.toString().trim() : '';
      if (text && text.length > 5) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'selection', text: text }));
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
true;
`;

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSaveById, markAsRead, addHighlight } = useSaves();
  const item = getSaveById(id);

  const [pendingHighlight, setPendingHighlight] = useState('');
  const [showHighlights, setShowHighlights] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'selection' && highlightMode && data.text) {
        setPendingHighlight(data.text);
      }
    } catch {}
  }, [highlightMode]);

  const handleSaveHighlight = useCallback(async () => {
    if (pendingHighlight && id) {
      await addHighlight(id, pendingHighlight);
      setPendingHighlight('');
    }
  }, [pendingHighlight, id, addHighlight]);

  const handleMarkRead = useCallback(async () => {
    if (id) {
      await markAsRead(id);
      router.back();
    }
  }, [id, markAsRead, router]);

  const handleShare = useCallback(() => {
    if (item) {
      Share.share({ title: item.title, url: item.url, message: item.url });
    }
  }, [item]);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity style={styles.topBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: item.url }}
        style={styles.webView}
        injectedJavaScript={HIGHLIGHT_INJECT_JS}
        onMessage={handleWebViewMessage}
        allowsInlineMediaPlayback
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      />

      {/* Pending highlight toast */}
      {pendingHighlight ? (
        <View style={styles.highlightToast}>
          <Text style={styles.highlightToastText} numberOfLines={2}>"{pendingHighlight}"</Text>
          <TouchableOpacity style={styles.saveHighlightBtn} onPress={handleSaveHighlight}>
            <Ionicons name="sparkles" size={14} color={Colors.secondaryAccent} />
            <Text style={styles.saveHighlightText}>Save highlight</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPendingHighlight('')}>
            <Ionicons name="close" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Bottom toolbar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.toolBtn, highlightMode && styles.toolBtnActive]}
          onPress={() => setHighlightMode(v => !v)}
        >
          <Ionicons
            name="brush-outline"
            size={18}
            color={highlightMode ? Colors.secondaryAccent : Colors.textSecondary}
          />
          <Text style={[styles.toolLabel, highlightMode && { color: Colors.secondaryAccent }]}>
            Highlight
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setShowHighlights(true)}
        >
          <Ionicons name="list-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.toolLabel}>
            {item.highlights.length} saved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.toolBtn, styles.readBtn]} onPress={handleMarkRead}>
          <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
          <Text style={[styles.toolLabel, { color: Colors.success }]}>Mark Read</Text>
        </TouchableOpacity>
      </View>

      {/* Highlights modal */}
      <Modal visible={showHighlights} animationType="slide" transparent>
        <View style={styles.highlightsOverlay}>
          <TouchableOpacity style={styles.highlightsBackdrop} onPress={() => setShowHighlights(false)} />
          <View style={styles.highlightsSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Highlights</Text>
              <Text style={styles.sheetCount}>{item.highlights.length}</Text>
            </View>
            {item.highlights.length === 0 ? (
              <View style={styles.noHighlights}>
                <Ionicons name="sparkles-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.noHighlightsText}>No highlights yet{'\n'}Enable highlight mode and select text</Text>
              </View>
            ) : (
              <FlatList
                data={item.highlights}
                keyExtractor={h => h.id}
                contentContainerStyle={styles.highlightsList}
                renderItem={({ item: h }) => (
                  <View style={styles.highlightItem}>
                    <View style={styles.highlightAccent} />
                    <Text style={styles.highlightText}>{h.text}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: Typography.medium,
  },
  webView: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: { color: Colors.textSecondary, fontSize: Typography.body },
  highlightToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.secondaryAccent + '66',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  highlightToastText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.caption,
    fontStyle: 'italic',
  },
  saveHighlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryAccent + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveHighlightText: { color: Colors.secondaryAccent, fontSize: 12, fontWeight: Typography.semiBold },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 16,
    gap: 4,
  },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  toolBtnActive: {
    backgroundColor: Colors.secondaryAccent + '18',
  },
  toolLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: Typography.medium,
  },
  readBtn: {
    backgroundColor: Colors.success + '18',
  },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: Colors.textPrimary, fontSize: Typography.heading4 },
  backLink: { color: Colors.primaryAccent, fontSize: Typography.body },
  highlightsOverlay: { flex: 1, justifyContent: 'flex-end' },
  highlightsBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  highlightsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', margin: 12,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  sheetTitle: { color: Colors.textPrimary, fontSize: Typography.heading4, fontWeight: Typography.semiBold },
  sheetCount: {
    backgroundColor: Colors.primaryAccent + '33',
    color: Colors.primaryAccent,
    fontSize: 12, fontWeight: Typography.bold,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  noHighlights: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  noHighlightsText: { color: Colors.textSecondary, fontSize: Typography.body, textAlign: 'center', lineHeight: 22 },
  highlightsList: { padding: 16, gap: 8 },
  highlightItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  highlightAccent: { width: 3, backgroundColor: Colors.secondaryAccent },
  highlightText: { flex: 1, color: Colors.textPrimary, fontSize: Typography.body, padding: 12, lineHeight: 22 },
});
