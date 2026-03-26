import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { createNotification, getUserProfile } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { label: 'General', value: 'General', icon: 'campaign', color: '#0055ff', bg: '#eff6ff' },
    { label: 'Academics', value: 'Academics', icon: 'school', color: '#059669', bg: '#f0fdf4' },
    { label: 'Events', value: 'Events', icon: 'event', color: '#d97706', bg: '#fffbeb' },
    { label: 'Placements', value: 'Placements', icon: 'work', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Urgent', value: 'Urgent', icon: 'warning', color: '#ef4444', bg: '#fef2f2' },
];

export default function SendNotification({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('General');
    const [sending, setSending] = useState(false);

    const selectedCategory = CATEGORIES.find(c => c.value === category) || CATEGORIES[0];

    const handleSend = async () => {
        if (!title.trim()) { Alert.alert('Error', 'Please enter a notification title.'); return; }
        if (!body.trim()) { Alert.alert('Error', 'Please enter a notification body.'); return; }

        setSending(true);
        try {
            const profile = await getUserProfile(user?.uid);
            const result = await createNotification({
                title: title.trim(),
                body: body.trim(),
                category,
                icon: selectedCategory.icon,
                iconBg: `${selectedCategory.color}20`,
                iconColor: selectedCategory.color,
                sentBy: profile?.name || 'Staff',
                sentByRole: profile?.role || 'admin',
                sentByUid: user?.uid || '',
            });

            setSending(false);
            if (result.success) {
                Alert.alert('Sent!', 'Notification has been sent to all users.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', 'Failed to send notification.');
            }
        } catch (e) {
            setSending(false);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Send Notification</Text>
                        <Text style={styles.headerSubtitle}>Broadcast to all users</Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Category Selection */}
                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[
                                styles.categoryChip,
                                category === cat.value && { backgroundColor: cat.bg, borderColor: cat.color, borderWidth: 2 }
                            ]}
                            onPress={() => setCategory(cat.value)}
                        >
                            <MaterialIcons name={cat.icon} size={18} color={category === cat.value ? cat.color : '#94a3b8'} />
                            <Text style={[styles.categoryText, category === cat.value && { color: cat.color, fontWeight: '700' }]}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Title */}
                <Text style={styles.fieldLabel}>Title</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="title" size={20} color="#5e6d8d" />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Notification title..."
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                </View>
                <Text style={styles.charCount}>{title.length}/100</Text>

                {/* Body */}
                <Text style={styles.fieldLabel}>Message</Text>
                <View style={[styles.inputWrapper, { height: 140, alignItems: 'flex-start', paddingTop: 14 }]}>
                    <MaterialIcons name="message" size={20} color="#5e6d8d" style={{ marginTop: 2 }} />
                    <TextInput
                        style={[styles.textInput, { height: 120, textAlignVertical: 'top' }]}
                        placeholder="Write your notification message here..."
                        placeholderTextColor="#9ca3af"
                        value={body}
                        onChangeText={setBody}
                        multiline
                        maxLength={500}
                    />
                </View>
                <Text style={styles.charCount}>{body.length}/500</Text>

                {/* Preview */}
                {(title.trim() || body.trim()) ? (
                    <View style={styles.previewSection}>
                        <Text style={styles.fieldLabel}>Preview</Text>
                        <View style={styles.previewCard}>
                            <View style={[styles.previewIcon, { backgroundColor: selectedCategory.bg }]}>
                                <MaterialIcons name={selectedCategory.icon} size={22} color={selectedCategory.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.previewTitle} numberOfLines={2}>{title || 'Notification Title'}</Text>
                                <Text style={styles.previewBody} numberOfLines={2}>{body || 'Message body...'}</Text>
                                <View style={styles.previewMeta}>
                                    <View style={[styles.previewBadge, { backgroundColor: selectedCategory.bg }]}>
                                        <Text style={[styles.previewBadgeText, { color: selectedCategory.color }]}>{category}</Text>
                                    </View>
                                    <Text style={styles.previewTime}>Just now</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* Send Button */}
                <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
                    {sending ? <ActivityIndicator color="white" size="small" /> : (
                        <>
                            <MaterialIcons name="send" size={20} color="white" />
                            <Text style={styles.sendBtnText}>Send Notification</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245,246,248,0.95)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },

    scrollContent: { padding: 24 },

    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },

    categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
    categoryText: { fontSize: 13, fontWeight: '600', color: '#64748b' },

    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, height: 56, gap: 10, marginBottom: 4 },
    textInput: { flex: 1, fontSize: 15, color: '#101318', fontWeight: '500' },
    charCount: { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginBottom: 20 },

    previewSection: { marginBottom: 24 },
    previewCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 16, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    previewIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    previewTitle: { fontSize: 15, fontWeight: '700', color: '#101318' },
    previewBody: { fontSize: 13, color: '#64748b', marginTop: 4 },
    previewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    previewBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    previewBadgeText: { fontSize: 10, fontWeight: '700' },
    previewTime: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },

    sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', height: 56, borderRadius: 16, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    sendBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },
});
