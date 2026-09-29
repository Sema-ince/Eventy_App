import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { eventsService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { Event, HomeStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Chatbot'>;

// ─── Message Types ────────────────────────────────────────────────
type MessageRole = 'user' | 'bot';
interface TextMessage {
  id: string;
  role: MessageRole;
  type: 'text';
  text: string;
  timestamp: Date;
}
interface EventsMessage {
  id: string;
  role: 'bot';
  type: 'events';
  text: string;
  events: Event[];
  timestamp: Date;
}
type Message = TextMessage | EventsMessage;

// ─── Keyword Matcher ──────────────────────────────────────────────
const EVENT_KEYWORDS = [
  'bu hafta', 'yaklaşan', 'etkinlik', 'listele', 'göster', 'event',
  'hangi', 'program', 'neler var', 'planlar', 'aktivite', 'takvim',
  'bugün', 'yarın', 'hafta', 'konser', 'müzik', 'tiyatro', 'spor',
  'film', 'sergi', 'workshop', 'seminer',
];
const matchesEventQuery = (text: string) =>
  EVENT_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

// ─── Next 7 days filter ───────────────────────────────────────────
const filterThisWeek = (events: Event[]): Event[] => {
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return events.filter((e) => {
    const d = new Date(e.date);
    return d >= now && d <= weekLater;
  });
};

// ─── Bot Responses ────────────────────────────────────────────────
const GREET_RESPONSES = [
  'Merhaba! 👋 Size bu haftaki etkinlikleri bulmakta yardımcı olabilirim.',
  'Selam! 🎫 Hangi etkinlikleri arıyorsunuz? "Bu hafta etkinlikler neler?" diye sorabilirsiniz.',
];
const HELP_RESPONSE =
  'Size etkinlikleri bulmak konusunda yardımcı olabilirim. 💡\n\nÖrnek sorular:\n• "Bu hafta hangi etkinlikler var?"\n• "Yaklaşan müzik konserlerini listele"\n• "Bugün ne var?"';
const NO_EVENTS_RESPONSE =
  'Önümüzdeki 7 gün için sistemde aktif etkinlik bulunamadı. 😔 Lütfen daha sonra tekrar deneyin ya da tüm etkinlikler sayfasını ziyaret edin.';

// ─── Mini Event Card ──────────────────────────────────────────────
interface MiniEventCardProps {
  event: Event;
  onPress: (event: Event) => void;
}
const MiniEventCard: React.FC<MiniEventCardProps & { theme: ReturnType<typeof useTheme>['theme'] }> = ({
  event,
  onPress,
  theme,
}) => {
  const dateObj = new Date(event.date);
  const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'short' });
  const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const available = event.totalSeats - event.soldSeats;
  const priceStr = event.price === 0 ? 'Ücretsiz' : `${event.price.toLocaleString('tr-TR')} ₺`;

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.85}
      style={[styles.miniCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      {/* Left: date box */}
      <View style={[styles.miniDateBox, { backgroundColor: theme.primary + '22' }]}>
        <Text style={[styles.miniDayName, { color: theme.primary }]}>{dayName.toUpperCase()}</Text>
        <Text style={[styles.miniDayNum, { color: theme.text }]}>{dayNum}</Text>
        <Text style={[styles.miniMonth, { color: theme.textSecondary }]}>{monthName}</Text>
      </View>

      {/* Right: info */}
      <View style={styles.miniInfo}>
        <Text style={[styles.miniTitle, { color: theme.text }]} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={[styles.miniMeta, { color: theme.textSecondary }]} numberOfLines={1}>
          🕐 {timeStr}  📍 {event.location}
        </Text>
        <View style={styles.miniFooter}>
          <Text style={[styles.miniPrice, { color: theme.primary }]}>{priceStr}</Text>
          <Text style={[styles.miniSeats, { color: theme.textTertiary }]}>
            {available} koltuk
          </Text>
        </View>
      </View>

      {/* Thumbnail */}
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.miniThumb} resizeMode="cover" />
      ) : null}
    </TouchableOpacity>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────
const MessageBubble: React.FC<{
  message: Message;
  onEventPress: (event: Event) => void;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ message, onEventPress, theme }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {/* Bot message bubble avatar */}
      {!isUser && (
        <View style={[styles.botAvatar, { backgroundColor: theme.primary }]}>
          <Text style={{ fontSize: 13, color: '#fff' }}>💬</Text>
        </View>
      )}

      <View style={[
        styles.bubble,
        isUser
          ? [styles.bubbleUser, { backgroundColor: theme.primary }]
          : [styles.bubbleBot, { backgroundColor: theme.surface2, borderColor: theme.border }],
        message.type === 'events' && { maxWidth: '95%' },
      ]}>
        <Text style={[
          styles.bubbleText,
          { color: isUser ? '#FFFFFF' : theme.text },
        ]}>
          {message.text}
        </Text>

        {message.type === 'events' && message.events.length > 0 && (
          <View style={styles.miniCardList}>
            {message.events.map((event) => (
              <MiniEventCard
                key={event.id}
                event={event}
                onPress={onEventPress}
                theme={theme}
              />
            ))}
          </View>
        )}

        <Text style={[styles.bubbleTime, {
          color: isUser ? 'rgba(255,255,255,0.7)' : theme.textTertiary,
          textAlign: isUser ? 'right' : 'left',
        }]}>
          {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

// ─── Quick Suggestion Chip ────────────────────────────────────────
const SuggestionChip: React.FC<{
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ label, onPress, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.chip, { backgroundColor: theme.primaryTransparent, borderColor: theme.primary + '55' }]}
  >
    <Text style={[styles.chipText, { color: theme.primary }]}>{label}</Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────
const ChatbotScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { theme, isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      type: 'text',
      text: GREET_RESPONSES[0],
      timestamp: new Date(),
    },
  ]);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleSend = useCallback(async (text?: string) => {
    const rawText = (text ?? inputText).trim();
    if (!rawText) return;

    // Add user message
    const userMsg: TextMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text',
      text: rawText,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInputText('');
    setIsTyping(true);

    // Simulate network delay for realism
    await new Promise((res) => setTimeout(res, 600 + Math.random() * 400));

    try {
      // Check for greetings
      const lower = rawText.toLowerCase();
      if (['merhaba', 'selam', 'hey', 'hi', 'hello', 'naber', 'nasılsın'].some((g) => lower.includes(g))) {
        addMessage({
          id: `bot-${Date.now()}`,
          role: 'bot',
          type: 'text',
          text: GREET_RESPONSES[Math.floor(Math.random() * GREET_RESPONSES.length)],
          timestamp: new Date(),
        });
        return;
      }

      if (matchesEventQuery(rawText)) {
        // Fetch upcoming events
        const { events: allEvents } = await eventsService.getEvents({ sort: 'date', limit: 50 });
        const weekEvents = filterThisWeek(allEvents);

        if (weekEvents.length === 0) {
          addMessage({
            id: `bot-${Date.now()}`,
            role: 'bot',
            type: 'text',
            text: NO_EVENTS_RESPONSE,
            timestamp: new Date(),
          });
        } else {
          addMessage({
            id: `bot-${Date.now()}`,
            role: 'bot',
            type: 'events',
            text: `Bu hafta ${weekEvents.length} etkinlik var! 🎉 Birine tıklayarak detaylara gidebilirsiniz:`,
            events: weekEvents,
            timestamp: new Date(),
          });
        }
      } else {
        addMessage({
          id: `bot-${Date.now()}`,
          role: 'bot',
          type: 'text',
          text: HELP_RESPONSE,
          timestamp: new Date(),
        });
      }
    } catch {
      addMessage({
        id: `bot-err-${Date.now()}`,
        role: 'bot',
        type: 'text',
        text: 'Üzgünüm, etkinlikleri yüklerken bir hata oluştu. 😔 Lütfen internet bağlantınızı kontrol edin.',
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  }, [inputText]);

  const SUGGESTIONS = [
    '🗓️ Bu hafta etkinlikler',
    '🎵 Yaklaşan konserler',
    '📍 Yaklaşan etkinlikleri listele',
    '🎭 Ne var bu hafta?',
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* Header */}
      <LinearGradient
        colors={[theme.surface, theme.background] as any}
        style={[styles.header, { borderBottomColor: theme.border }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
        >
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.bubbleIconLarge, { backgroundColor: theme.primary }]}>
            <Text style={{ fontSize: 20 }}>💬</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Evently Asistan</Text>
            <Text style={[styles.headerSub, { color: theme.success }]}>● Çevrimiçi</Text>
          </View>
        </View>

        <View style={{ width: 44 }} />
      </LinearGradient>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} onEventPress={handleEventPress} theme={theme} />
        )}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={[styles.typingRow, { backgroundColor: theme.background }]}>
          <View style={[styles.botAvatar, { backgroundColor: theme.primary }]}>
            <Text style={{ fontSize: 13 }}>💬</Text>
          </View>
          <View style={[styles.typingBubble, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.typingText, { color: theme.textSecondary }]}>Yazıyor...</Text>
          </View>
        </View>
      )}

      {/* Suggestions */}
      {messages.length <= 2 && (
        <View style={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <SuggestionChip key={s} label={s} onPress={() => handleSend(s)} theme={theme} />
          ))}
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputBar, {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        }]}>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.surface2,
              color: theme.text,
              borderColor: theme.border,
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={300}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            style={[
              styles.sendBtn,
              { backgroundColor: theme.primary },
              (!inputText.trim() || isTyping) && { opacity: 0.4 },
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing['2xl'],
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backIcon: { fontSize: 20, fontWeight: '700' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  bubbleIconLarge: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...Typography.styles.h5, fontWeight: '700' },
  headerSub: { ...Typography.styles.caption, fontSize: 11, fontWeight: '600' },

  // Messages
  messageList: { padding: Spacing.base, paddingBottom: Spacing.lg },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: Spacing.md, gap: Spacing.xs },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot: { justifyContent: 'flex-start' },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  bubbleUser: {
    borderBottomRightRadius: BorderRadius.xs,
    alignSelf: 'flex-end',
  },
  bubbleBot: {
    borderBottomLeftRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  bubbleText: { ...Typography.styles.body, lineHeight: 22 },
  bubbleTime: { ...Typography.styles.caption, fontSize: 10, marginTop: 4 },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
    borderWidth: 1,
  },
  typingText: { ...Typography.styles.caption, fontSize: 12 },

  // Mini Event Card
  miniCardList: { marginTop: Spacing.sm, gap: Spacing.xs },
  miniCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    padding: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  miniDateBox: {
    width: 44,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayName: { fontSize: 9, fontWeight: '800' },
  miniDayNum: { fontSize: 16, fontWeight: '800', lineHeight: 18 },
  miniMonth: { fontSize: 9 },
  miniInfo: { flex: 1 },
  miniTitle: { ...Typography.styles.label, fontWeight: '700', fontSize: 13, lineHeight: 17 },
  miniMeta: { ...Typography.styles.caption, fontSize: 11, marginTop: 2 },
  miniFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  miniPrice: { fontSize: 12, fontWeight: '700' },
  miniSeats: { fontSize: 10 },
  miniThumb: { width: 44, height: 44, borderRadius: BorderRadius.md },

  // Suggestions
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: { ...Typography.styles.caption, fontWeight: '600' },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
    borderWidth: 1,
    ...Typography.styles.body,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
  },
  sendIcon: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginLeft: 2 },
});

export default ChatbotScreen;
