import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock Data
const initialStudents = [
    { id: 1, name: 'Alex Johnson', roll: '2023-CS-042', branch: 'CS', year: 'Year 2', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', color: 'blue' },
    { id: 2, name: 'Maria Garcia', roll: '2023-EE-108', branch: 'EE', year: 'Year 3', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', color: 'orange' },
    { id: 3, name: 'James Chen', roll: '2022-ME-055', branch: 'ME', year: 'Year 4', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', color: 'purple', status: 'red' },
    { id: 4, name: 'Priya Patel', roll: '2023-CS-089', branch: 'CS', year: 'Year 2', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', color: 'blue' },
    { id: 5, name: 'Michael Ross', roll: '2023-CE-012', branch: 'CE', year: 'Year 1', avatar: 'https://randomuser.me/api/portraits/men/5.jpg', color: 'green' },
    { id: 6, name: 'Sarah Connor', roll: '2021-EE-099', branch: 'EE', year: 'Year 4', avatar: 'https://randomuser.me/api/portraits/women/6.jpg', color: 'orange' },
];

const filters = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil'];

export default function ManageStudents({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    const getBadgeStyle = (color) => {
        switch (color) {
            case 'blue': return { bg: '#eff6ff', text: '#1d4ed8' };
            case 'orange': return { bg: '#fff7ed', text: '#c2410c' };
            case 'purple': return { bg: '#faf5ff', text: '#7e22ce' };
            case 'green': return { bg: '#f0fdf4', text: '#15803d' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

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
                <Text style={styles.listTitle}>STUDENTS LIST (142)</Text>
                <TouchableOpacity>
                    <Text style={styles.sortText}>Sort by ID</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.studentList}>
                    {initialStudents.map((student) => {
                        const badgeStyle = getBadgeStyle(student.color);
                        return (
                            <TouchableOpacity key={student.id} style={styles.studentCard}>
                                <View style={styles.cardLeft}>
                                    <View style={styles.avatarBox}>
                                        <Image source={{ uri: student.avatar }} style={styles.avatar} />
                                        {student.status && <View style={[styles.statusDot, { backgroundColor: student.status === 'red' ? '#ef4444' : '#22c55e' }]} />}
                                    </View>
                                    <View>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentId}>ID: {student.roll}</Text>
                                        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                                            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{student.branch} - {student.year}</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.moreButton}>
                                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#9ca3af" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Load More Indicator */}
                <View style={styles.loadMoreIndicator} />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
                        <MaterialCommunityIcons name="home-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="account-group" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ManageFaculty') || console.warn('Not Implemented')}>
                        <MaterialCommunityIcons name="school-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Faculty</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="account-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Profile</Text>
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
