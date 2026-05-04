import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const filters = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'General'];

import { subscribeToUsersByRole } from '../../services/supabaseService';
import { ActivityIndicator } from 'react-native-paper';

export default function ManageStudents({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const unsubscribe = subscribeToUsersByRole('student', (data) => {
            setStudents(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getBadgeStyle = (department) => {
        const dept = department?.toLowerCase() || '';
        if (dept.includes('computer') || dept.includes('cs')) return { bg: '#eff6ff', text: '#1d4ed8' };
        if (dept.includes('electric') || dept.includes('ee')) return { bg: '#fff7ed', text: '#c2410c' };
        if (dept.includes('mechanic') || dept.includes('me')) return { bg: '#faf5ff', text: '#7e22ce' };
        if (dept.includes('civil') || dept.includes('ce')) return { bg: '#f0fdf4', text: '#15803d' };
        return { bg: '#f3f4f6', text: '#374151' };
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'All') return matchesSearch;

        const dept = student.department?.toLowerCase() || '';
        const filter = selectedFilter.toLowerCase();

        // Simple mapping for demo filters
        const matchesFilter = (filter.includes('computer') && (dept.includes('computer') || dept.includes('cs'))) ||
            (filter.includes('electrical') && (dept.includes('electric') || dept.includes('ee'))) ||
            (filter.includes('mechanical') && (dept.includes('mechanic') || dept.includes('me'))) ||
            (filter.includes('civil') && (dept.includes('civil') || dept.includes('ce'))) ||
            (dept.includes(filter));

        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Manage Students</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <MaterialCommunityIcons name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or roll no..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterIcon}>
                        <MaterialCommunityIcons name="tune" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Chips */}
            <View style={{ marginTop: 16 }}>
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

            {/* List Header */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>STUDENTS LIST ({filteredStudents.length})</Text>
                <TouchableOpacity>
                    <Text style={styles.sortText}>Sort by Name</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0055ff" style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.studentList}>
                        {filteredStudents.map((student) => {
                            const badgeStyle = getBadgeStyle(student.department);
                            return (
                                <TouchableOpacity key={student.uid} style={styles.studentCard} onPress={() => {/* Could navigate to profile detail */ }}>
                                    <View style={styles.cardLeft}>
                                        <View style={styles.avatarBox}>
                                            {student.profileImage ? (
                                                <Image source={{ uri: student.profileImage }} style={styles.avatar} />
                                            ) : (
                                                <View style={[styles.avatar, { backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }]}>
                                                    <Text style={{ fontSize: 20, color: '#64748b', fontWeight: 'bold' }}>
                                                        {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                                                    </Text>
                                                </View>
                                            )}
                                            {/* Offline dot as fallback if no real presence system yet */}
                                            <View style={[styles.statusDot, { backgroundColor: '#94a3b8' }]} />
                                        </View>
                                        <View>
                                            <Text style={styles.studentName}>{student.name || 'Unnamed Student'}</Text>
                                            <Text style={styles.studentId}>{student.email || 'No email'}</Text>
                                            <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                                                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
                                                    {student.department || 'General'} {student.semester ? `- Sem ${student.semester}` : ''}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.moreButton}>
                                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#9ca3af" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })}
                        {filteredStudents.length === 0 && !loading && (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#9ca3af' }}>No students found.</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Load More Indicator */}
                <View style={styles.loadMoreIndicator} />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
                        <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="account-group" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ManageFaculty')}>
                        <MaterialCommunityIcons name="account-tie-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Faculty</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Settings')}>
                        <MaterialCommunityIcons name="cog-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { backgroundColor: 'white', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#101318' },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, height: 48 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 16, color: '#101318' },
    filterIcon: { padding: 4 },

    filterContent: { paddingHorizontal: 16, gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#f3f4f6' },
    filterChipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff' },
    filterText: { fontSize: 14, color: '#4b5563', fontWeight: '500' },
    filterTextActive: { color: 'white' },

    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
    listTitle: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', letterSpacing: 0.5 },
    sortText: { fontSize: 14, color: '#0055ff', fontWeight: '500' },

    scrollContent: { padding: 16, paddingTop: 0 },
    studentList: { gap: 12 },
    studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    cardLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    avatarBox: { position: 'relative' },
    avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'white' },
    statusDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: 'white' },
    studentName: { fontSize: 16, fontWeight: 'bold', color: '#101318' },
    studentId: { fontSize: 12, color: '#6b7280', marginVertical: 2 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    moreButton: { padding: 4 },

    loadMoreIndicator: { height: 6, width: 48, borderRadius: 3, backgroundColor: '#e5e7eb', alignSelf: 'center', marginTop: 16 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
