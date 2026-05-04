import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToDirectChats, subscribeToGroupChats } from '../../services/chatService';
import { getUserProfile, getAllCurriculumSubjects, getFacultyCourses } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function ChatList({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    
    const [activeTab, setActiveTab] = useState('groups');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    
    const [directChats, setDirectChats] = useState([]);
    const [groupChats, setGroupChats] = useState([]);

    useEffect(() => {
        const init = async () => {
            if (!user?.id) return;
            const uProfile = await getUserProfile(user.id);
            setProfile(uProfile);

            // Fetch course assignments for groups
            let courseCodes = [];
            if (uProfile?.role === 'student') {
                // For simplicity, students see all subjects in their current semester and department
                if (uProfile.department && uProfile.semester) {
                    const subjects = await getAllCurriculumSubjects(uProfile.department);
                    courseCodes = subjects.filter(s => s.semester === uProfile.semester).map(s => s.code);
                }
            } else if (uProfile?.role === 'faculty') {
                const myCourses = await getFacultyCourses(user.id);
                courseCodes = myCourses.map(c => c.subjectCode || c.code);
            }

            // Subscriptions
            const unsubDirect = subscribeToDirectChats(user.id, (chats) => {
                setDirectChats(chats);
            });

            const unsubGroups = subscribeToGroupChats(courseCodes, (chats) => {
                // Group chats may not exist in DB yet until first message, 
                // so we merge fetched DB groups with local courseCodes to ensure they show up
                const dbGroupCodes = chats.map(c => c.courseCode);
                
                // For student's subjects that don't have a chat doc yet
                const localGroups = courseCodes
                    .filter(code => !dbGroupCodes.includes(code))
                    .map(code => ({ id: `group_${code}`, type: 'group', courseCode: code, courseName: `${code} Subject Group` }));
                
                setGroupChats([...chats, ...localGroups]);
                setLoading(false);
            });

            return () => {
                if (unsubDirect) unsubDirect();
                if (unsubGroups) unsubGroups();
            };
        };
        init();
    }, [user]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderChatCard = ({ item }) => {
        const isGroup = item.type === 'group';
        
        // For direct chats, find the other person's name
        let chatName = isGroup ? item.courseName || item.courseCode : 'Chat';
        let subText = item.lastMessage || (isGroup ? 'Tap to join subject discussion...' : 'Start a conversation...');

        if (!isGroup && item.participantNames) {
            const otherUid = item.participants.find(p => p !== user.id);
            chatName = item.participantNames[otherUid] || 'User';
        }

        return (
            <TouchableOpacity 
                style={styles.chatCard} 
                onPress={() => navigation.navigate('ChatRoom', { 
                    chatId: item.id, 
                    chatName: chatName,
                    type: item.type,
                    courseCode: item.courseCode
                })}
            >
                <View style={[styles.avatarBox, { backgroundColor: isGroup ? '#eff6ff' : '#f0fdf4' }]}>
                    <MaterialCommunityIcons name={isGroup ? 'google-classroom' : 'account'} size={24} color={isGroup ? '#0055ff' : '#059669'} />
                </View>
                <View style={styles.chatMeta}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatName} numberOfLines={1}>{chatName}</Text>
                        <Text style={styles.timeText}>{item.updatedAt ? formatTime(item.updatedAt) : ''}</Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>{subText}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#0055ff" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Messages</Text>
                    {/* Add Direct Chat button */}
                    <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('NewChat')}>
                        <MaterialIcons name="edit" size={20} color="#0055ff" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity style={[styles.tab, activeTab === 'groups' && styles.tabActive]} onPress={() => setActiveTab('groups')}>
                        <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>Subject Groups</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'direct' && styles.tabActive]} onPress={() => setActiveTab('direct')}>
                        <Text style={[styles.tabText, activeTab === 'direct' && styles.tabTextActive]}>Direct Messages</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0055ff" />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'groups' ? groupChats : directChats}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChatCard}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="chat-sleep-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>No chats yet</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeTab === 'groups' ? "You are not enrolled in any subjects." : "Tap the edit icon to start a new chat."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    header: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 0 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    createBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    tabsContainer: { flexDirection: 'row', marginTop: 16, paddingHorizontal: 20 },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: '#0055ff' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    tabTextActive: { color: '#0055ff' },

    listContent: { padding: 16 },
    chatCard: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    avatarBox: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    chatMeta: { flex: 1, justifyContent: 'center' },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
    chatName: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 12 },
    timeText: { fontSize: 11, fontWeight: '500', color: '#94a3b8' },
    lastMessage: { fontSize: 13, color: '#64748b' },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 40 },
});
