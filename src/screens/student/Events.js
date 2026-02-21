import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUpcomingEvents, subscribeToEvents } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function EventsScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [featuredEvent, setFeaturedEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadEvents = async () => {
        try {
            const data = await getUpcomingEvents();
            setEvents(data);

            // Find a featured event, or default to the first one
            const featured = data.find(e => e.isFeatured) || data[0];
            setFeaturedEvent(featured);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadEvents();

        // Real-time subscription for updates
        const unsubscribe = subscribeToEvents((updatedEvents) => {
            setEvents(updatedEvents);
            const featured = updatedEvents.find(e => e.isFeatured) || updatedEvents[0];
            setFeaturedEvent(featured);
        });

        return () => unsubscribe();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadEvents();
    };

    // Helper to get icon based on event type
    const getEventIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'technical': return { name: 'code-tags', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
            case 'cultural': return { name: 'music-note', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' };
            case 'seminar': return { name: 'brain', color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' };
            case 'sports': return { name: 'soccer', color: '#0055ff', bg: '#eff6ff', border: '#dbeafe' };
            default: return { name: 'calendar', color: '#5e6d8d', bg: '#f3f4f6', border: '#e5e7eb' };
        }
    };

    const getMonthAndDay = (dateString = "") => {
        // Simple heuristic parser for "Nov 15" or "2023-11-15"
        // For now, assuming the string might contain the month name
        const parts = dateString.split(' ');
        if (parts.length >= 2) return { month: parts[0].substring(0, 3).toUpperCase(), day: parts[1].replace(',', '') };
        return { month: 'EVT', day: '01' };
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>College Events</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="calendar-today" size={22} color="#5e6d8d" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* Featured Event Hero Card */}
                {featuredEvent && (
                    <LinearGradient
                        colors={['#0055ff', '#0033cc']}
                        style={styles.heroCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.heroDecoration} />

                        <View style={styles.heroTop}>
                            <View style={styles.heroContent}>
                                <View style={styles.featuredBadge}>
                                    <MaterialCommunityIcons name="lightning-bolt" size={12} color="#fde047" />
                                    <Text style={styles.featuredText}>FEATURED</Text>
                                </View>
                                <Text style={styles.heroTitle}>{featuredEvent.title}</Text>
                                <Text style={styles.heroSubtitle}>{featuredEvent.date} • {featuredEvent.location}</Text>
                            </View>

                            <View style={styles.dateBadgeLarge}>
                                <Text style={styles.dateBadgeMonth}>{getMonthAndDay(featuredEvent.date).month}</Text>
                                <Text style={styles.dateBadgeDay}>{getMonthAndDay(featuredEvent.date).day}</Text>
                            </View>
                        </View>

                        <View style={styles.heroGrid}>
                            <View style={styles.heroGridItem}>
                                <Text style={styles.gridLabel}>EVENTS</Text>
                                <Text style={styles.gridValue}>{featuredEvent.stats?.events || '5+'}</Text>
                            </View>
                            <View style={styles.heroGridItem}>
                                <Text style={styles.gridLabel}>WORKSHOPS</Text>
                                <Text style={styles.gridValue}>{featuredEvent.stats?.workshops || '2'}</Text>
                            </View>
                            <View style={styles.heroGridItem}>
                                <Text style={styles.gridLabel}>ENTRY</Text>
                                <Text style={styles.gridValue}>{featuredEvent.stats?.entry || 'Free'}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.registerButton}>
                            <Text style={styles.registerButtonText}>Register Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                )}

                {/* Upcoming Events List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    <TouchableOpacity style={styles.monthSelector}>
                        <Text style={styles.monthSelectorText}>This Month</Text>
                        <MaterialCommunityIcons name="chevron-down" size={16} color="#5e6d8d" />
                    </TouchableOpacity>
                </View>

                <View style={styles.eventsList}>
                    {events.map((item, index) => {
                        const iconData = getEventIcon(item.type);
                        return (
                            <TouchableOpacity key={item.id || index} style={[styles.eventCard, item.isRegistered && { opacity: 0.95 }]}>
                                {item.isRegistered && (
                                    <View style={styles.registeredCheck}>
                                        <MaterialCommunityIcons name="check" size={14} color="white" />
                                    </View>
                                )}
                                <View style={styles.eventCardHeader}>
                                    <View style={[styles.eventIconBox, { backgroundColor: iconData.bg, borderColor: iconData.border }]}>
                                        <MaterialCommunityIcons name={iconData.name} size={24} color={iconData.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View>
                                                <Text style={styles.eventName}>{item.title}</Text>
                                                <View style={styles.eventTimeBadge}>
                                                    <Text style={styles.eventTimeText}>{item.date} • {item.time}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.activeDot} />
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.eventDescription} numberOfLines={2}>
                                    {item.description}
                                </Text>

                                <View style={styles.eventFooter}>
                                    <View style={styles.locationContainer}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={14} color="#5e6d8d" />
                                        <Text style={styles.locationText}>{item.location}</Text>
                                    </View>
                                    {item.isRegistered ? (
                                        <View style={styles.registeredBadge}>
                                            <Text style={styles.registeredText}>Registered</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.smallRegisterButton}>
                                            <Text style={styles.smallRegisterText}>Register</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {events.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#9aa2b1', marginTop: 20 }}>No upcoming events.</Text>
                    )}
                </View>

                {/* Spacer for bottom bar */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318' },
    filterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

    heroCard: { borderRadius: 24, padding: 24, marginTop: 8, elevation: 8, overflow: 'hidden' },
    heroDecoration: { position: 'absolute', top: -40, right: -40, width: 192, height: 192, borderRadius: 96, backgroundColor: 'rgba(255,255,255,0.1)', opacity: 0.5 },

    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    heroContent: { flex: 1 },
    featuredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12, gap: 4 },
    featuredText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', lineHeight: 32, marginBottom: 4 },
    heroSubtitle: { color: '#bfdbfe', fontSize: 14, fontWeight: '500', letterSpacing: 0.2 },

    dateBadgeLarge: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' },
    dateBadgeMonth: { color: '#bfdbfe', fontSize: 12, fontWeight: '500', textTransform: 'uppercase' },
    dateBadgeDay: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },

    heroGrid: { flexDirection: 'row', marginTop: 24, gap: 12 },
    heroGridItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    gridLabel: { color: '#bfdbfe', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    gridValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    registerButton: { marginTop: 20, backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    registerButtonText: { color: '#0055ff', fontSize: 14, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: '#f3f4f6' },
    monthSelectorText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    eventsList: { gap: 16 },
    eventCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 1, borderWidth: 1, borderColor: 'transparent' },
    eventCardHeader: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    eventIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    eventName: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    eventTimeBadge: { marginTop: 4, backgroundColor: '#f9fafb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    eventTimeText: { fontSize: 11, color: '#5e6d8d', fontWeight: '500' },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },

    eventDescription: { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 16 },

    eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    smallRegisterButton: { backgroundColor: '#0055ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, elevation: 2, shadowColor: '#0055ff', shadowOpacity: 0.3 },
    smallRegisterText: { color: 'white', fontSize: 12, fontWeight: '600' },

    registeredCheck: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', zIndex: 1, elevation: 2 },
    registeredBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#dcfce7' },
    registeredText: { color: '#16a34a', fontSize: 12, fontWeight: 'bold' }
});
