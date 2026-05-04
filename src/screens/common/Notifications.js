import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToNotifications } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Academics', 'Placements', 'Events'];

// Helpers to format timestamps
const getRelativeTime = (isoString) => {
    if (!isoString) return '';
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
};

const getDateGroup = (isoString) => {
    if (!isoString) return 'Older';
    const now = new Date();
    const then = new Date(isoString);
    const diffDays = Math.floor((now - then) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return 'Older';
};

// Map category to icon/color
const getCategoryStyle = (category) => {
    switch (category) {
        case 'Placements':
            return { icon: 'work', iconBg: 'rgba(0, 85, 255, 0.1)', iconColor: '#0055ff' };
        case 'Academics':
            return { icon: 'school', iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#059669' };
        case 'Events':
            return { icon: 'event', iconBg: 'rgba(245, 158, 11, 0.15)', iconColor: '#d97706' };
        default:
            return { icon: 'campaign', iconBg: 'rgba(225, 29, 72, 0.15)', iconColor: '#e11d48' };
    }
};

export default function Notifications({ navigation }) {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToNotifications((data) => {
            // Enrich with visual properties
            const enriched = data.map(n => {
                const catStyle = getCategoryStyle(n.category);
                return {
                    ...n,
                    time: getRelativeTime(n.createdAt),
                    dateGroup: getDateGroup(n.createdAt),
                    icon: n.icon || catStyle.icon,
                    iconBg: n.iconBg || catStyle.iconBg,
                    iconColor: n.iconColor || catStyle.iconColor,
                };
            });
            setNotifications(enriched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const filteredNotifications = selectedCategory === 'All'
        ? notifications
        : notifications.filter(n => n.category === selectedCategory);

    // Grouping
    const grouped = filteredNotifications.reduce((acc, curr) => {
        if (!acc[curr.dateGroup]) acc[curr.dateGroup] = [];
        acc[curr.dateGroup].push(curr);
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#0055ff" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={markAllAsRead}>
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>Notifications</Text>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                style={[styles.filterPill, isSelected && styles.filterPillSelected]}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0055ff" />
                    <Text style={{ marginTop: 16, color: '#64748b' }}>Loading notifications...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {Object.keys(grouped).length > 0 ? (
                        Object.keys(grouped).map(group => (
                            <View key={group} style={styles.section}>
                                <Text style={styles.sectionLabel}>{group.toUpperCase()}</Text>

                                {grouped[group].map(notif => (
                                    <TouchableOpacity
                                        key={notif.id}
                                        style={[styles.card, notif.isRead && styles.cardRead]}
                                        onPress={() => {
                                            markAsRead(notif.id);
                                            navigation.navigate('NotificationDetail', { notification: notif });
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.cardContent}>
                                            {/* Icon */}
                                            <View style={[styles.iconWrapper, { backgroundColor: notif.iconBg }]}>
                                                <MaterialIcons name={notif.icon} size={24} color={notif.iconColor} />
                                            </View>

                                            {/* Text Content */}
                                            <View style={styles.textWrapper}>
                                                <View style={styles.cardHeader}>
                                                    <Text style={styles.cardTitle} numberOfLines={2}>{notif.title}</Text>
                                                    {!notif.isRead && <View style={styles.unreadDot} />}
                                                </View>
                                                <Text style={styles.cardBody} numberOfLines={2}>{notif.body}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                                    <Text style={styles.cardTime}>{notif.time}</Text>
                                                    {notif.sentBy && (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                            <MaterialIcons name="person" size={12} color="#94a3b8" />
                                                            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500' }}>
                                                                {notif.sentBy} • {notif.sentByRole?.toUpperCase() || 'ADMIN'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyState, { marginTop: 100 }]}>
                            <View style={[styles.emptyIconBg, { backgroundColor: 'rgba(0, 85, 255, 0.05)', width: 120, height: 120, borderRadius: 60 }]}>
                                <MaterialIcons name="done-all" size={64} color="rgba(0, 85, 255, 0.4)" />
                            </View>
                            <Text style={[styles.emptyText, { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8, marginTop: 24 }]}>You're all caught up!</Text>
                            <Text style={[styles.emptyText, { maxWidth: 250, lineHeight: 22 }]}>No new notifications right now. We'll let you know when something important happens.</Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { backgroundColor: 'rgba(245, 246, 248, 0.9)', borderBottomWidth: 1, borderBottomColor: 'rgba(226, 232, 240, 0.5)', zIndex: 10, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    markAllText: { fontSize: 13, fontWeight: '600', color: '#0055ff', letterSpacing: -0.2 },
    headerTitle: { fontSize: 32, fontWeight: '800', color: '#0f172a', paddingHorizontal: 24, letterSpacing: -0.5 },

    filterScroll: { paddingHorizontal: 20, paddingTop: 20, gap: 8 },
    filterPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    filterPillSelected: { backgroundColor: '#0055ff', borderColor: '#0055ff', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
    filterText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    filterTextSelected: { color: 'white' },

    scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 1.5, marginLeft: 4, marginBottom: 12 },

    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    cardRead: { backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: 'transparent', shadowOpacity: 0, elevation: 0 },
    cardContent: { flexDirection: 'row', gap: 16 },

    iconWrapper: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    textWrapper: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0f172a', lineHeight: 20, paddingRight: 16 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0055ff', marginTop: 6, flexShrink: 0 },

    cardBody: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 8 },
    cardTime: { fontSize: 11, fontWeight: '500', color: '#94a3b8' },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, opacity: 0.8 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 13, fontWeight: '500', color: '#64748b', textAlign: 'center' }
});
