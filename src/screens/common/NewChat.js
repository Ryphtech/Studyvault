import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { AuthContext } from '../../context/AuthContext';
import { startDirectChat } from '../../services/chatService';
import { getUserProfile } from '../../services/firestoreService';

export default function NewChat({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('faculty'); // Default search faculty
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const ROLES = [
        { id: 'faculty', label: 'Faculty' },
        { id: 'hod', label: 'HODs' },
        { id: 'placement_officer', label: 'Placement' },
        { id: 'student', label: 'Students' }
    ];

    useEffect(() => {
        fetchUsers(roleFilter);
    }, [roleFilter]);

    const fetchUsers = async (role) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', role),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            // Remove self
            setUsersList(list.filter(u => u.uid !== user?.uid));
        } catch (error) {
            console.error("Error fetching users for chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (targetUser) => {
        setLoading(true);
        const myProfile = await getUserProfile(user.uid);
        const myName = myProfile?.name || user.email?.split('@')[0] || 'User';

        const result = await startDirectChat(
            user.uid, 
            targetUser.uid, 
            myName, 
            targetUser.name || 'User'
        );
        setLoading(false);

        if (result.success) {
            // Replace NewChat with ChatRoom so back goes to ChatList
            navigation.replace('ChatRoom', {
                chatId: result.chatId,
                chatName: targetUser.name,
                type: 'direct'
            });
        }
    };

    const filteredUsers = usersList.filter(u => 
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#0055ff" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Message</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Role Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleTabs}>
                    {ROLES.map(role => (
                        <TouchableOpacity
                            key={role.id}
                            style={[styles.roleTab, roleFilter === role.id && styles.roleTabActive]}
                            onPress={() => setRoleFilter(role.id)}
                        >
                            <Text style={[styles.roleTabText, roleFilter === role.id && styles.roleTabTextActive]}>{role.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* User List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0055ff" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                        <TouchableOpacity key={u.uid} style={styles.userCard} onPress={() => handleStartChat(u)}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{(u.name || 'U').charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{u.name || 'Unknown User'}</Text>
                                <Text style={styles.userEmail}>{u.email || ''}</Text>
                                {u.department && (
                                    <View style={styles.deptBadge}>
                                        <Text style={styles.deptText}>{u.department}</Text>
                                    </View>
                                )}
                            </View>
                            <MaterialIcons name="chat-bubble-outline" size={20} color="#0055ff" style={{ opacity: 0.5 }} />
                        </TouchableOpacity>
                    )) : (
                        <View style={{ alignItems: 'center', marginTop: 100 }}>
                            <MaterialCommunityIcons name="account-search-outline" size={64} color="#cbd5e1" />
                            <Text style={{ marginTop: 16, color: '#64748b', fontSize: 15 }}>No users found.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    
    header: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 16 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#0f172a' },
    
    roleTabs: { paddingHorizontal: 20, gap: 8 },
    roleTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    roleTabActive: { backgroundColor: '#eff6ff', borderColor: '#0055ff' },
    roleTabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    roleTabTextActive: { color: '#0055ff' },

    listContent: { padding: 16 },
    userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    avatarText: { fontSize: 18, fontWeight: '700', color: '#475569' },
    userName: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
    userEmail: { fontSize: 13, color: '#64748b' },
    deptBadge: { alignSelf: 'flex-start', backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    deptText: { fontSize: 10, fontWeight: '700', color: '#ef4444' }
});
