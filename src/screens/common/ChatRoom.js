import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToMessages, sendMessage, startGroupChat, markMessagesAsSeen } from '../../services/chatService';
import { getUserProfile } from '../../services/firestoreService';

export default function ChatRoom({ route, navigation }) {
    const { chatId, chatName, type, courseCode } = route.params;
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();
    
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    
    const flatListRef = useRef();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.uid) {
                const p = await getUserProfile(user.uid);
                setCurrentUserProfile(p);
            }
        };
        fetchProfile();
    }, [user]);

    useEffect(() => {
        // If it's a group, ensure the document exists on first mount just in case
        if (type === 'group' && courseCode) {
            startGroupChat(courseCode, chatName); // Non-blocking
        }

        const unsub = subscribeToMessages(chatId, (msgs) => {
            setMessages(msgs);
            setLoading(false);

            const unreadIds = msgs
                .filter(m => m.user._id !== user?.uid && m.status !== 'seen')
                .map(m => m._id);
            if (unreadIds.length > 0) {
                markMessagesAsSeen(chatId, unreadIds);
            }
        });
        return () => unsub();
    }, [chatId]);

    const handleSend = async () => {
        if (!text.trim() || !user?.uid) return;
        setSending(true);
        const textToSend = text.trim();
        setText(''); // optimistic clear
        
        await sendMessage(
            chatId, 
            user.uid, 
            currentUserProfile?.name || user.name || user.email?.split('@')[0] || 'User',
            currentUserProfile?.role || 'user',
            '', // Avatar URL if applicable
            textToSend,
            replyingTo
        );
        setSending(false);
        setReplyingTo(null);
    };

    const renderMessage = ({ item }) => {
        const isMine = item.user._id === user?.uid;
        
        return (
            <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                {!isMine && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, marginLeft: 4 }}>
                        <Text style={[styles.senderName, { marginBottom: 0, marginLeft: 0 }]}>{item.user.name}</Text>
                        {item.user.role ? (
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleBadgeText}>{item.user.role.toUpperCase()}</Text>
                            </View>
                        ) : null}
                    </View>
                )}
                <TouchableOpacity 
                    onLongPress={() => setReplyingTo({ messageId: item._id, text: item.text, senderName: item.user.name })}
                    activeOpacity={0.8}
                >
                    <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
                        {item.replyTo && (
                            <View style={[styles.replyQuote, isMine ? styles.myReplyQuote : styles.theirReplyQuote]}>
                                <Text style={[styles.replyQuoteName, isMine && { color: 'white' }]} numberOfLines={1}>{item.replyTo.senderName}</Text>
                                <Text style={[styles.replyQuoteText, isMine && { color: 'white' }]} numberOfLines={2}>{item.replyTo.text}</Text>
                            </View>
                        )}
                        <Text style={[styles.messageText, isMine && { color: 'white' }]}>{item.text}</Text>
                    </View>
                </TouchableOpacity>
                <View style={[styles.timeContainer, isMine && { justifyContent: 'flex-end' }]}>
                    <Text style={styles.timeText}>
                        {item.createdAt ? item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                    {isMine && (
                        <MaterialCommunityIcons 
                            name={item.status === 'seen' ? "check-all" : "check"} 
                            size={14} 
                            color={item.status === 'seen' ? "#3b82f6" : "#94a3b8"} 
                            style={{ marginLeft: 4, marginTop: 4 }}
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#0055ff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{chatName}</Text>
                    {type === 'group' && <Text style={styles.headerSubtitle}>Subject Discussion</Text>}
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Chat Area */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0055ff" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    inverted // Shows latest message at the bottom
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Input Box */}
            <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                {replyingTo && (
                    <View style={styles.replyContextBar}>
                        <View style={styles.replyContextInfo}>
                            <Text style={styles.replyContextName}>Replying to {replyingTo.senderName}</Text>
                            <Text style={styles.replyContextText} numberOfLines={1}>{replyingTo.text}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 4 }}>
                            <MaterialCommunityIcons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor="#9ca3af"
                        value={text}
                        onChangeText={setText}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]} 
                        onPress={handleSend}
                        disabled={!text.trim() || sending}
                    >
                        <MaterialCommunityIcons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    headerInfo: { flex: 1, marginHorizontal: 16, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    headerSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
    
    messageList: { padding: 16, gap: 12 },
    messageWrapper: { maxWidth: '80%', marginBottom: 12 },
    myMessageWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    theirMessageWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    
    messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
    myBubble: { backgroundColor: '#0055ff', borderBottomRightRadius: 4 },
    theirBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
    messageText: { fontSize: 15, color: '#0f172a', lineHeight: 22 },
    
    senderName: { fontSize: 11, color: '#64748b', marginBottom: 4, marginLeft: 4, fontWeight: '600' },
    roleBadge: { backgroundColor: '#e2e8f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 },
    roleBadgeText: { fontSize: 9, fontWeight: '700', color: '#475569' },
    timeContainer: { flexDirection: 'row', alignItems: 'center' },
    timeText: { fontSize: 10, color: '#94a3b8', marginTop: 4, marginRight: 4 },

    replyQuote: { padding: 8, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3 },
    myReplyQuote: { backgroundColor: 'rgba(255,255,255,0.2)', borderLeftColor: '#e0e7ff' },
    theirReplyQuote: { backgroundColor: '#f1f5f9', borderLeftColor: '#cbd5e1' },
    replyQuoteName: { fontSize: 12, fontWeight: '700', color: '#0f172a', opacity: 0.8 },
    replyQuoteText: { fontSize: 13, color: '#0f172a', opacity: 0.7, marginTop: 2 },

    replyContextBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 8, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 4, borderLeftColor: '#0055ff' },
    replyContextInfo: { flex: 1, marginRight: 8 },
    replyContextName: { fontSize: 12, fontWeight: '700', color: '#0055ff' },
    replyContextText: { fontSize: 13, color: '#64748b', marginTop: 2 },

    inputContainer: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingHorizontal: 16, paddingTop: 12 },
    inputBox: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 8 },
    input: { flex: 1, minHeight: 32, maxHeight: 100, fontSize: 15, color: '#0f172a', marginRight: 10, paddingVertical: 4 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center' }
});
