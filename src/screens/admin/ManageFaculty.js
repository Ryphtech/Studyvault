import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const filters = ['All Departments', 'Comp. Science', 'Mathematics', 'Physics', 'General'];

import { subscribeToUsersByRole } from '../../services/firestoreService';
import { ActivityIndicator } from 'react-native-paper';

export default function ManageFaculty({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Departments');
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const unsubscribe = subscribeToUsersByRole('faculty', (data) => {
            setFacultyList(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredFaculty = facultyList.filter(faculty => {
        const matchesSearch = faculty.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faculty.email?.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'All Departments') return matchesSearch;

        const dept = faculty.department?.toLowerCase() || '';
        const filter = selectedFilter.toLowerCase();

        const matchesFilter = (filter.includes('comp') && (dept.includes('computer') || dept.includes('cs'))) ||
            (filter.includes('math') && dept.includes('math')) ||
            (filter.includes('physic') && dept.includes('physic')) ||
            (dept.includes(filter));

        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Faculty</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                    <MaterialIcons name="person-add" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search and Filter Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchBox}>
                    <MaterialIcons name="search" size={24} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search name, department, subject..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Horizontal Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter ? styles.filterChipActive : styles.filterChipInactive
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter ? styles.filterTextActive : styles.filterTextInactive
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Faculty List */}
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0055ff" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {filteredFaculty.map((faculty) => {
                            const isLeave = faculty.status === 'On Leave'; // Simulate status or read real one if added
                            return (
                                <View key={faculty.uid} style={[styles.facultyCard, isLeave && styles.cardOpaque]}>
                                    <View style={styles.cardMain}>
                                        {/* Avatar */}
                                        <View style={[styles.avatarContainer, isLeave ? styles.avatarBgInactive : styles.avatarBgActive]}>
                                            {faculty.profileImage ? (
                                                <Image source={{ uri: faculty.profileImage }} style={styles.avatarImage} />
                                            ) : (
                                                <Text style={styles.avatarInitials}>
                                                    {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'F'}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Info */}
                                        <View style={styles.infoContainer}>
                                            <View style={styles.nameRow}>
                                                <Text style={styles.facultyName} numberOfLines={1}>{faculty.name || 'Unnamed Faculty'}</Text>
                                                <View style={[styles.statusBadge, isLeave ? styles.statusBadgeInactive : styles.statusBadgeActive]}>
                                                    <Text style={[styles.statusText, isLeave ? styles.statusTextInactive : styles.statusTextActive]}>
                                                        {faculty.status || 'ACTIVE'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.departmentText}>{faculty.department || 'General Department'}</Text>

                                            <View style={styles.subjectsContainer}>
                                                {/* Mocking subjects for now unless added to firestore schema */}
                                                <View style={styles.subjectChip}>
                                                    <Text style={styles.subjectText}>{faculty.specialization || 'Assigned Courses'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Actions Footer */}
                                    <View style={styles.actionsFooter}>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <MaterialIcons name="visibility" size={20} color="#94a3b8" />
                                            <Text style={styles.actionText}>View</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <MaterialIcons name="edit" size={20} color="#94a3b8" />
                                            <Text style={styles.actionText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButtonDelete}>
                                            <MaterialIcons name="delete" size={20} color="#94a3b8" />
                                            <Text style={styles.actionTextDelete}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                        {filteredFaculty.length === 0 && !loading && (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#9ca3af' }}>No faculty found.</Text>
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
                        <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ManageStudents')}>
                        <MaterialCommunityIcons name="account-group-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="account-tie" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Faculty</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#f5f6f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0055ff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 14,
        color: '#0f172a',
    },
    filterContainer: {
        gap: 8,
        paddingBottom: 8,
    },
    filterChip: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterChipActive: {
        backgroundColor: '#0055ff',
    },
    filterChipInactive: {
        backgroundColor: '#f1f5f9',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterTextActive: {
        color: 'white',
    },
    filterTextInactive: {
        color: '#475569',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 16,
    },
    facultyCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardOpaque: {
        opacity: 0.8,
    },
    cardMain: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
    },
    avatarBgActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#dbeafe',
    },
    avatarBgInactive: {
        backgroundColor: '#e2e8f0',
        borderColor: 'transparent',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarInitials: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    infoContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    facultyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusBadgeActive: {
        backgroundColor: '#eff6ff',
    },
    statusBadgeInactive: {
        backgroundColor: '#f1f5f9',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusTextActive: {
        color: '#0055ff',
    },
    statusTextInactive: {
        color: '#94a3b8',
    },
    departmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginBottom: 8,
    },
    subjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    subjectChip: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    subjectText: {
        fontSize: 11,
        color: '#475569',
    },
    actionsFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionButtonDelete: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    actionTextDelete: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        height: 80,
        paddingBottom: 20
    },
    tabItemsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%'
    },
    tabItem: {
        alignItems: 'center',
        gap: 4,
        padding: 8,
        width: 64
    },
    tabLabel: {
        fontSize: 10,
        color: '#9aa2b1',
        fontWeight: '500'
    }
});
