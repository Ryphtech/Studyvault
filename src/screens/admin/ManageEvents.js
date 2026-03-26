import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToEvents } from '../../services/firestoreService';

const { width } = Dimensions.get('window');



const filters = ['All', 'Upcoming', 'Past', 'Drafts'];

export default function ManageEvents({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToEvents((data) => {
            if (data.length > 0) {
                setEvents(data.map(d => ({
                    ...d,
                    statusColor: d.status === 'Upcoming' ? 'green' : (d.status === 'Past' ? 'gray' : 'yellow')
                })));
            } else {
                setEvents([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'All' || e.status === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (color) => {
        switch (color) {
            case 'green': return { bg: '#dcfce7', text: '#15803d', dot: '#16a34a' };
            case 'yellow': return { bg: '#fef9c3', text: '#a16207', dot: '#ca8a04' };
            case 'gray': return { bg: '#f3f4f6', text: '#4b5563', dot: '#6b7280' };
            default: return { bg: '#f3f4f6', text: '#374151', dot: '#6b7280' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Events</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events by name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterIcon}>
                        <MaterialCommunityIcons name="tune" size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Chips */}
            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0055ff" style={{ marginTop: 20 }} />
                ) : filteredEvents.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#6b7280' }}>No events found.</Text>
                ) : (
                    <View style={styles.eventList}>
                        {filteredEvents.map((event) => {
                            const style = getStatusStyle(event.statusColor);
                            return (
                                <TouchableOpacity key={event.id} style={[styles.eventCard, event.status === 'Past' && { opacity: 0.8 }]}>
                                    {/* Thumbnail & Date */}
                                    <View style={styles.imageContainer}>
                                        <Image source={{ uri: event.image }} style={styles.eventImage} />
                                        <View style={styles.dateBadge}>
                                            <Text style={styles.dateMonth}>{event.month || event.dateNum ? event.month : 'OCT'}</Text>
                                            <Text style={styles.dateDay}>{event.dateNum || event.date || '01'}</Text>
                                        </View>
                                    </View>

                                    {/* Content */}
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                            <TouchableOpacity>
                                                <MaterialCommunityIcons name="dots-vertical" size={20} color="#9ca3af" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.metaInfo}>
                                            <View style={styles.metaRow}>
                                                <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
                                                <Text style={styles.metaText}>{event.time}</Text>
                                            </View>
                                            <View style={styles.metaRow}>
                                                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#6b7280" />
                                                <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.statusTag, { backgroundColor: style.bg, borderColor: style.bg }]}>
                                            <View style={[styles.statusDot, { backgroundColor: style.dot }]} />
                                            <Text style={[styles.statusText, { color: style.text }]}>{event.status}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEvent')}>
                <MaterialCommunityIcons name="plus" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
    backButton: { padding: 4, borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },

    searchSection: { paddingHorizontal: 16, paddingVertical: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#111827' },
    filterIcon: { padding: 4 },

    filterSection: { paddingBottom: 16 },
    filterContent: { paddingHorizontal: 16, gap: 12 },
    filterChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb' },
    filterChipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff' },
    filterText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
    filterTextActive: { color: 'white' },

    scrollContent: { paddingHorizontal: 16 },
    eventList: { gap: 16 },

    eventCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 12, gap: 16, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

    imageContainer: { position: 'relative' },
    eventImage: { width: 80, height: 80, borderRadius: 12 },
    dateBadge: { position: 'absolute', bottom: -8, left: 16, right: 16, backgroundColor: 'white', borderRadius: 6, alignItems: 'center', paddingVertical: 4, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
    dateMonth: { fontSize: 10, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
    dateDay: { fontSize: 12, fontWeight: 'bold', color: '#0055ff' },

    cardContent: { flex: 1, justifyContent: 'space-between' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1, marginRight: 8 },

    metaInfo: { marginTop: 4, gap: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: '#6b7280' },

    statusTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '500' },

    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 }
});
