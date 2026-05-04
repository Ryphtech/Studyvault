import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToFeedbackSurveys } from '../../services/supabaseService';

const { width } = Dimensions.get('window');



const filters = ['All', 'Active', 'Closed', 'Drafts'];

export default function ManageFeedback({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToFeedbackSurveys((data) => {
            setSurveys(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredSurveys = surveys.filter(s => {
        const matchesSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'All' || s.status === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return { bg: '#dcfce7', text: '#15803d', dot: '#16a34a' };
            case 'Draft': return { bg: '#fef9c3', text: '#a16207', dot: '#ca8a04' };
            case 'Closed': return { bg: '#f3f4f6', text: '#4b5563', dot: '#6b7280' };
            default: return { bg: '#f3f4f6', text: '#374151', dot: '#6b7280' };
        }
    };

    const getIconStyle = (color) => {
        switch (color) {
            case 'blue': return { bg: '#eff6ff', text: '#2563eb' };
            case 'purple': return { bg: '#faf5ff', text: '#9333ea' };
            case 'orange': return { bg: '#fff7ed', text: '#ea580c' };
            case 'gray': return { bg: '#f3f4f6', text: '#4b5563' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Feedback</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search surveys by title..."
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
                    <Text style={{ textAlign: 'center', marginTop: 40, color: '#6b7280' }}>Loading surveys...</Text>
                ) : filteredSurveys.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#9ca3af" />
                        <Text style={{ fontSize: 16, color: '#6b7280', marginTop: 16 }}>No surveys found.</Text>
                        <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>Add data to see live surveys here.</Text>
                    </View>
                ) : (
                    <View style={styles.surveyList}>
                        {filteredSurveys.map((survey) => {
                            const style = getStatusStyle(survey.status);
                            const iconStyle = getIconStyle(survey.color);
                            return (
                                <TouchableOpacity key={survey.id} style={[styles.surveyCard, survey.status === 'Closed' && { opacity: 0.8 }]}>
                                    {/* Header */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.headerLeft}>
                                            <View style={[styles.iconBox, { backgroundColor: iconStyle.bg }]}>
                                                <MaterialCommunityIcons name={survey.icon} size={24} color={iconStyle.text} />
                                            </View>
                                            <View>
                                                <Text style={styles.surveyTitle}>{survey.title}</Text>
                                                <Text style={styles.surveyDate}>{survey.date}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity>
                                            <MaterialCommunityIcons name="dots-vertical" size={20} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Stats */}
                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <MaterialCommunityIcons name="account-group" size={18} color="#9ca3af" />
                                            <Text style={styles.statValue}>{survey.responses}</Text>
                                            <Text style={styles.statLabel}>Responses</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <MaterialCommunityIcons name="help-circle-outline" size={18} color="#9ca3af" />
                                            <Text style={styles.statValue}>{survey.questions}</Text>
                                            <Text style={styles.statLabel}>Questions</Text>
                                        </View>
                                    </View>

                                    {/* Footer */}
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.statusTag, { backgroundColor: style.bg, borderColor: style.bg }]}>
                                            <View style={[styles.statusDot, { backgroundColor: style.dot }]} />
                                            <Text style={[styles.statusText, { color: style.text }]}>{survey.status}</Text>
                                        </View>

                                        <TouchableOpacity 
                                            style={styles.actionButton}
                                            onPress={() => navigation.navigate(survey.status === 'Draft' ? 'CreateFeedback' : 'FeedbackResults', { survey })}
                                        >
                                            <Text style={[styles.actionText, survey.status === 'Draft' ? { color: '#6b7280' } : { color: '#0055ff' }]}>
                                                {survey.status === 'Draft' ? 'Edit Form' : survey.status === 'Closed' ? 'View Report' : 'View Results'}
                                            </Text>
                                            <MaterialCommunityIcons
                                                name={survey.status === 'Draft' ? 'pencil' : survey.status === 'Closed' ? 'chart-bar' : 'arrow-right'}
                                                size={16}
                                                color={survey.status === 'Draft' ? '#6b7280' : '#0055ff'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateFeedback')}>
                <MaterialCommunityIcons name="plus-box-multiple-outline" size={28} color="white" />
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
    surveyList: { gap: 16 },

    surveyCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    surveyTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    surveyDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },

    statsRow: { flexDirection: 'row', gap: 16, marginLeft: 52 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statValue: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
    statLabel: { fontSize: 12, color: '#6b7280' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f9fafb', marginTop: 4 },
    statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '500' },

    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, fontWeight: '600' },

    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 }
});
