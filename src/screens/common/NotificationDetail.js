import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToNotifications } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function NotificationDetail({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { notification } = route.params || {};
    const [relatedNotifications, setRelatedNotifications] = useState([]);

    // Fetch related notifications from Firestore
    useEffect(() => {
        if (!notification) return;
        const unsubscribe = subscribeToNotifications((allNotifs) => {
            // Filter: same category, different ID, max 3
            const related = allNotifs
                .filter(n => n.category === notification.category && n.id !== notification.id)
                .slice(0, 3);
            setRelatedNotifications(related);
        });
        return () => unsubscribe();
    }, [notification?.id]);

    if (!notification) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No notification data provided.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#0055ff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Action button behavior based on notification category
    const handlePrimaryAction = () => {
        switch (notification.category) {
            case 'Placements':
                // Navigate to placements screen
                try { navigation.navigate('Placements'); } catch {
                    Alert.alert('Navigate', 'Visit the Placements section for more details.');
                }
                break;
            case 'Events':
                try { navigation.navigate('Events'); } catch {
                    Alert.alert('Navigate', 'Visit the Events section for more details.');
                }
                break;
            case 'Academics':
                try { navigation.navigate('Marks'); } catch {
                    Alert.alert('Navigate', 'Visit the Marks section for more details.');
                }
                break;
            default:
                Alert.alert('Action', 'This notification has been acknowledged.');
                break;
        }
    };

    const handleSaveForLater = () => {
        Alert.alert('Saved', 'This notification has been saved for later reference.');
    };

    // Label for primary button
    const primaryLabel =
        notification.category === 'Placements' ? 'View Placements' :
        notification.category === 'Events' ? 'View Events' :
        notification.category === 'Academics' ? 'View Results' :
        'Acknowledge';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#0055ff" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification Detail</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Main Card */}
                <View style={styles.mainCard}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconBox, { backgroundColor: notification.iconBg || 'rgba(0, 85, 255, 0.1)' }]}>
                            <MaterialIcons name={notification.icon || 'notifications'} size={40} color={notification.iconColor || '#0055ff'} />
                        </View>
                    </View>

                    {/* Title & Time */}
                    <View style={styles.titleSection}>
                        <Text style={styles.notifTitle}>{notification.title}</Text>
                        <View style={styles.timeRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialIcons name="schedule" size={14} color="#94a3b8" />
                                <Text style={styles.timeText}>{notification.time || 'Recently'}</Text>
                            </View>
                            {notification.sentBy && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 12 }}>
                                    <MaterialIcons name="person" size={14} color="#94a3b8" />
                                    <Text style={styles.timeText}>{notification.sentBy} • {notification.sentByRole?.toUpperCase() || 'ADMIN'}</Text>
                                </View>
                            )}
                        </View>
                        {notification.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{notification.category}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Body Content */}
                    <View style={styles.bodySection}>
                        <Text style={styles.bodyParagraph}>{notification.body}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={handlePrimaryAction}>
                            <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleSaveForLater}>
                            <Text style={styles.secondaryBtnText}>Save for Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Related Notifications */}
                {relatedNotifications.length > 0 && (
                    <View style={styles.relatedSection}>
                        <Text style={styles.relatedTitle}>RELATED NOTIFICATIONS</Text>

                        {relatedNotifications.map((rel) => (
                            <TouchableOpacity
                                key={rel.id}
                                style={styles.relatedCard}
                                activeOpacity={0.7}
                                onPress={() => navigation.push('NotificationDetail', { notification: rel })}
                            >
                                <View style={[styles.relatedIconBg, { backgroundColor: rel.iconBg || 'rgba(0,85,255,0.1)' }]}>
                                    <MaterialIcons name={rel.icon || 'notifications'} size={20} color={rel.iconColor || '#0055ff'} />
                                </View>
                                <View style={styles.relatedTextWrapper}>
                                    <Text style={styles.relatedItemTitle} numberOfLines={1}>{rel.title}</Text>
                                    <Text style={styles.relatedItemTime}>{rel.time || ''}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Bottom decorative bar */}
                <View style={styles.bottomDecoWrapper}>
                    <View style={styles.bottomDecoBar} />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'rgba(245, 245, 245, 0.9)', zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', letterSpacing: -0.5, marginLeft: -16 },

    scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

    // Main Card
    mainCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },

    iconContainer: { alignItems: 'center', marginBottom: 24 },
    iconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

    titleSection: { alignItems: 'center', marginBottom: 24 },
    notifTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', textAlign: 'center', lineHeight: 28, marginBottom: 12 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    timeText: { fontSize: 12, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    categoryBadge: { marginTop: 10, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    categoryText: { fontSize: 11, fontWeight: '700', color: '#0055ff' },

    divider: { height: 1, backgroundColor: '#f1f5f9', width: '100%', marginBottom: 24 },

    bodySection: { marginBottom: 32 },
    bodyParagraph: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 16 },

    actionsSection: { gap: 12 },
    primaryBtn: { backgroundColor: '#0055ff', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
    secondaryBtn: { paddingVertical: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    secondaryBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },

    // Related
    relatedSection: { marginTop: 32, paddingHorizontal: 8 },
    relatedTitle: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
    relatedCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 10 },
    relatedIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    relatedTextWrapper: { flex: 1 },
    relatedItemTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    relatedItemTime: { fontSize: 10, color: '#94a3b8' },

    // Bottom Deco
    bottomDecoWrapper: { alignItems: 'center', marginTop: 32 },
    bottomDecoBar: { width: 48, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', opacity: 0.5 }
});
