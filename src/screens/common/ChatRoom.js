import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, FlatList, Animated, Modal, Alert, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToMessages, sendMessage, startGroupChat, markMessagesAsSeen, editMessage, deleteMessage, forwardMessage, subscribeToDirectChats, subscribeToGroupChats } from '../../services/chatService';
import { getUserProfile, uploadAudio } from '../../services/supabaseService';
import { Audio } from 'expo-av';

const AudioPlayer = ({ uri, isMine }) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    const playSound = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
        } else {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) setIsPlaying(false);
            });
        }
    };

    return (
        <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 8, marginTop: 4 }} 
            onPress={playSound}
        >
            <MaterialCommunityIcons name={isPlaying ? "pause" : "play"} size={24} color={isMine ? "white" : "#0055ff"} />
            <MaterialCommunityIcons name="waveform" size={24} color={isMine ? "white" : "#0055ff"} />
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: isMine ? "white" : "#0055ff" }}>Voice Memo</Text>
        </TouchableOpacity>
    );
};

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
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [editText, setEditText] = useState('');
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardChats, setForwardChats] = useState([]);
    const [forwardingMsg, setForwardingMsg] = useState(null);
    const [showMembers, setShowMembers] = useState(false);
    
    // Recording state
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    
    const flatListRef = useRef();
    
    // Animation for mic
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    })
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                const p = await getUserProfile(user.id);
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
                .filter(m => m.user._id !== user?.id && m.status !== 'seen')
                .map(m => m._id);
            if (unreadIds.length > 0) {
                markMessagesAsSeen(chatId, unreadIds);
            }
        });
        return () => unsub();
    }, [chatId]);

    const handleSend = async () => {
        if (!text.trim() || !user?.id) return;
        setSending(true);
        const textToSend = text.trim();
        setText(''); // optimistic clear
        
        await sendMessage(
            chatId, 
            user.id, 
            currentUserProfile?.name || user.name || user.email?.split('@')[0] || 'User',
            currentUserProfile?.role || 'user',
            currentUserProfile?.profileImage || '',
            textToSend,
            replyingTo
        );
        setSending(false);
        setReplyingTo(null);
    };

    const handleEditSave = async () => {
        if (!editText.trim() || !editingMsg) return;
        setSending(true);
        await editMessage(editingMsg._id, editText.trim());
        setEditingMsg(null);
        setEditText('');
        setSending(false);
    };

    const handleDelete = (msg) => {
        Alert.alert('Delete Message', 'Delete this message? This cannot be undone.', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                await deleteMessage(msg._id, chatId);
            }}
        ]);
    };

    const handleForwardStart = (msg) => {
        setForwardingMsg(msg);
        setSelectedMsg(null);
        // Fetch all chats for the user
        const unsub1 = subscribeToDirectChats(user.id, (directs) => {
            const unsub2 = subscribeToGroupChats([], (groups) => {
                const allChats = [...directs, ...groups].filter(c => c.id !== chatId);
                setForwardChats(allChats);
            });
        });
        setShowForwardModal(true);
    };

    const handleForwardTo = async (targetChat) => {
        if (!forwardingMsg) return;
        const result = await forwardMessage(
            targetChat.id,
            user.id,
            currentUserProfile?.name || 'User',
            currentUserProfile?.role || 'user',
            forwardingMsg.text,
            forwardingMsg.audioUrl
        );
        setShowForwardModal(false);
        setForwardingMsg(null);
        if (result.success) Alert.alert('Forwarded', 'Message sent successfully.');
    };

    const openContextMenu = (msg) => {
        setSelectedMsg(msg);
    };

    const startRecording = async () => {
        if (recording || isRecording) return;
        try {
            setIsRecording(true);
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') {
                setIsRecording(false);
                return;
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording: newRec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(newRec);
        } catch (err) {
            console.error('Failed to start recording', err);
            setIsRecording(false);
            setRecording(null);
        }
    };

    const stopRecording = async () => {
        if (!recording) {
            setIsRecording(false);
            return;
        }
        setIsRecording(false);
        try {
            const currentRec = recording;
            setRecording(null);
            
            await currentRec.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            const uri = currentRec.getURI();

            if (uri) {
                setSending(true);
                const audioUrl = await uploadAudio(uri);
                if (audioUrl) {
                    await sendMessage(
                        chatId, 
                        user.id, 
                        currentUserProfile?.name || user.name || user.email?.split('@')[0] || 'User',
                        currentUserProfile?.role || 'user',
                        currentUserProfile?.profileImage || '',
                        '', // No text
                        replyingTo,
                        audioUrl
                    );
                }
                setSending(false);
                setReplyingTo(null);
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMine = item.user._id === user?.id;
        
        return (
            <View style={[styles.messageRow, isMine ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
                {/* Avatar for other users */}
                {!isMine && (
                    <View style={styles.msgAvatarWrap}>
                        {item.user.avatar ? (
                            <Image source={{ uri: item.user.avatar }} style={styles.msgAvatar} />
                        ) : (
                            <View style={[styles.msgAvatar, styles.msgAvatarPlaceholder]}>
                                <Text style={styles.msgAvatarInitial}>{(item.user.name || 'U').charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                )}
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
                        onLongPress={() => openContextMenu(item)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
                            {item.replyTo && (
                                <View style={[styles.replyQuote, isMine ? styles.myReplyQuote : styles.theirReplyQuote]}>
                                    <Text style={[styles.replyQuoteName, isMine && { color: 'white' }]} numberOfLines={1}>{item.replyTo.senderName}</Text>
                                    <Text style={[styles.replyQuoteText, isMine && { color: 'white' }]} numberOfLines={2}>{item.replyTo.text || 'Voice Memo'}</Text>
                                </View>
                            )}
                            {item.text ? (
                                <Text style={[styles.messageText, isMine && { color: 'white' }]}>{item.text}</Text>
                            ) : null}
                            {item.audioUrl && (
                                <AudioPlayer uri={item.audioUrl} isMine={isMine} />
                            )}
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
                    {type === 'group' && (
                        <TouchableOpacity onPress={() => setShowMembers(true)}>
                            <Text style={styles.headerSubtitle}>
                                {(() => { const m = new Map(); messages.forEach(msg => m.set(msg.user._id, true)); return m.size; })()} members • Tap to view
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                {type === 'group' ? (
                    <TouchableOpacity style={styles.membersBtn} onPress={() => setShowMembers(true)}>
                        <MaterialCommunityIcons name="account-group" size={20} color="#0055ff" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
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
                {replyingTo && !editingMsg && (
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
                {editingMsg && (
                    <View style={[styles.replyContextBar, { borderLeftColor: '#eab308' }]}>
                        <View style={styles.replyContextInfo}>
                            <Text style={[styles.replyContextName, { color: '#eab308' }]}>Editing message</Text>
                            <Text style={styles.replyContextText} numberOfLines={1}>{editingMsg.text}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { setEditingMsg(null); setEditText(''); }} style={{ padding: 4 }}>
                            <MaterialCommunityIcons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputBox}>
                    {editingMsg ? (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Edit message..."
                                placeholderTextColor="#9ca3af"
                                value={editText}
                                onChangeText={setEditText}
                                multiline
                                autoFocus
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, { backgroundColor: '#eab308' }, sending && { opacity: 0.5 }]} 
                                onPress={handleEditSave}
                                disabled={sending || !editText.trim()}
                            >
                                <MaterialCommunityIcons name="check" size={20} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder={isRecording ? "Recording..." : "Type a message..."}
                                placeholderTextColor="#9ca3af"
                                value={text}
                                onChangeText={setText}
                                multiline
                                editable={!isRecording}
                            />
                            {text.trim() ? (
                                <TouchableOpacity 
                                    style={[styles.sendBtn, sending && { opacity: 0.5 }]} 
                                    onPress={handleSend}
                                    disabled={sending}
                                >
                                    <MaterialCommunityIcons name="send" size={20} color="white" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                    style={[styles.sendBtn, isRecording ? { backgroundColor: '#ef4444' } : { backgroundColor: '#0055ff' }, sending && { opacity: 0.5 }]} 
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                    disabled={sending}
                                >
                                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                        <MaterialCommunityIcons name="microphone" size={20} color="white" />
                                    </Animated.View>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </View>

            {/* Context Menu Modal */}
            <Modal visible={!!selectedMsg} transparent animationType="fade" onRequestClose={() => setSelectedMsg(null)}>
                <TouchableOpacity style={styles.ctxOverlay} activeOpacity={1} onPress={() => setSelectedMsg(null)}>
                    <View style={styles.ctxMenu}>
                        <Text style={styles.ctxPreview} numberOfLines={2}>
                            {selectedMsg?.text || '🎤 Voice Message'}
                        </Text>
                        <View style={styles.ctxDivider} />
                        {/* Reply */}
                        <TouchableOpacity style={styles.ctxItem} onPress={() => {
                            setReplyingTo({ messageId: selectedMsg._id, text: selectedMsg.text, senderName: selectedMsg.user.name });
                            setSelectedMsg(null);
                        }}>
                            <MaterialCommunityIcons name="reply" size={20} color="#0055ff" />
                            <Text style={styles.ctxText}>Reply</Text>
                        </TouchableOpacity>
                        {/* Forward */}
                        <TouchableOpacity style={styles.ctxItem} onPress={() => handleForwardStart(selectedMsg)}>
                            <MaterialCommunityIcons name="share" size={20} color="#8b5cf6" />
                            <Text style={styles.ctxText}>Forward</Text>
                        </TouchableOpacity>
                        {/* Edit - only own text messages */}
                        {selectedMsg?.user?._id === user?.id && selectedMsg?.text ? (
                            <TouchableOpacity style={styles.ctxItem} onPress={() => {
                                setEditingMsg(selectedMsg);
                                setEditText(selectedMsg.text);
                                setSelectedMsg(null);
                            }}>
                                <MaterialCommunityIcons name="pencil" size={20} color="#eab308" />
                                <Text style={styles.ctxText}>Edit</Text>
                            </TouchableOpacity>
                        ) : null}
                        {/* Delete - only own messages */}
                        {selectedMsg?.user?._id === user?.id ? (
                            <TouchableOpacity style={styles.ctxItem} onPress={() => {
                                setSelectedMsg(null);
                                handleDelete(selectedMsg);
                            }}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                                <Text style={[styles.ctxText, { color: '#ef4444' }]}>Delete</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Forward Chat Picker Modal */}
            <Modal visible={showForwardModal} transparent animationType="slide" onRequestClose={() => setShowForwardModal(false)}>
                <View style={styles.fwdOverlay}>
                    <View style={styles.fwdSheet}>
                        <View style={styles.fwdHeader}>
                            <Text style={styles.fwdTitle}>Forward to...</Text>
                            <TouchableOpacity onPress={() => { setShowForwardModal(false); setForwardingMsg(null); }}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={forwardChats}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => {
                                const name = item.courseName || Object.values(item.participantNames || {}).filter(n => n !== currentUserProfile?.name).join(', ') || item.id;
                                return (
                                    <TouchableOpacity style={styles.fwdChatRow} onPress={() => handleForwardTo(item)}>
                                        <View style={styles.fwdAvatar}>
                                            <MaterialCommunityIcons name={item.type === 'group' ? 'account-group' : 'account'} size={22} color="#0055ff" />
                                        </View>
                                        <Text style={styles.fwdChatName} numberOfLines={1}>{name}</Text>
                                        <MaterialCommunityIcons name="send" size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No other chats found</Text>}
                        />
                    </View>
                </View>
            </Modal>

            {/* Group Members Modal */}
            <Modal visible={showMembers} transparent animationType="slide" onRequestClose={() => setShowMembers(false)}>
                <View style={styles.fwdOverlay}>
                    <View style={styles.fwdSheet}>
                        <View style={styles.fwdHeader}>
                            <Text style={styles.fwdTitle}>Group Members</Text>
                            <TouchableOpacity onPress={() => setShowMembers(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={(() => {
                                const map = new Map();
                                messages.forEach(msg => {
                                    if (!map.has(msg.user._id)) {
                                        map.set(msg.user._id, { id: msg.user._id, name: msg.user.name, role: msg.user.role, avatar: msg.user.avatar });
                                    }
                                });
                                return Array.from(map.values());
                            })()}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.memberRow}>
                                    {item.avatar ? (
                                        <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
                                    ) : (
                                        <View style={[styles.memberAvatar, { alignItems: 'center', justifyContent: 'center' }]}>
                                            <Text style={styles.memberInitial}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
                                        </View>
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.memberName}>{item.name}{item.id === user?.id ? ' (You)' : ''}</Text>
                                    </View>
                                    {item.role ? (
                                        <View style={[styles.roleBadge, { marginLeft: 0 }]}>
                                            <Text style={styles.roleBadgeText}>{item.role.toUpperCase()}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            )}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No members yet</Text>}
                        />
                    </View>
                </View>
            </Modal>
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
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
    messageWrapper: { maxWidth: '75%' },
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
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center' },

    ctxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 32 },
    ctxMenu: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '100%', maxWidth: 320, elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 },
    ctxPreview: { fontSize: 14, color: '#64748b', marginBottom: 12, fontStyle: 'italic' },
    ctxDivider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 8 },
    ctxItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 4 },
    ctxText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },

    fwdOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    fwdSheet: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%', paddingBottom: 24 },
    fwdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    fwdTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    fwdChatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    fwdAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    fwdChatName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0f172a' },

    membersBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', overflow: 'hidden' },
    memberInitial: { fontSize: 18, fontWeight: '700', color: '#475569' },
    memberName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },

    msgAvatarWrap: { marginRight: 8, marginBottom: 18 },
    msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0' },
    msgAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    msgAvatarInitial: { fontSize: 14, fontWeight: '700', color: '#64748b' },
});
