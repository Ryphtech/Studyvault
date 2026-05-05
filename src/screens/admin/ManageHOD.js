import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { subscribeToUsersByRole, deleteUserProfile } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

const filters = ['All Departments', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'General'];

export default function ManageHOD({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Departments');
    const [hodList, setHodList] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const unsubscribe = subscribeToUsersByRole('hod', (data) => {
            setHodList(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredHODs = hodList.filter(hod => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (hod.name || '').toLowerCase().includes(query) ||
            (hod.email || '').toLowerCase().includes(query);

        if (!matchesSearch) return false;
        if (selectedFilter === 'All Departments') return true;

        const dept = (hod.department || '').toLowerCase();
        const filter = selectedFilter.toLowerCase();

        // Precise matching for departments
        if (dept.includes(filter)) return true;
        if (filter.includes('computer') && (dept.includes('cs') || dept.includes('cse') || dept.includes('it'))) return true;
        if (filter.includes('electrical') && (dept.includes('ee') || dept.includes('ece') || dept.includes('eee'))) return true;
        if (filter.includes('mechanical') && (dept.includes('me') || dept.includes('mechanic'))) return true;
        if (filter.includes('civil') && (dept.includes('ce') || dept.includes('civil'))) return true;

        return false;
    });

    const handleDelete = (uid, name) => {
        Alert.alert(
            "Remove HOD",
            `Are you sure you want to remove ${name} from HOD role? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteUserProfile(uid);
                        if (!success) {
                            Alert.alert("Error", "Failed to remove HOD from database.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage HODs</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddHOD')}>
                    <MaterialIcons name="person-add" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchSection}>
                <View style={styles.searchBox}>
                    <MaterialIcons name="search" size={24} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search HOD by name or email..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
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

            {/* HOD List */}
            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0055ff" style={{ marginTop: 40 }} />
                ) : filteredHODs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-search-outline" size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>No HODs found.</Text>
                    </View>
                ) : (
                    filteredHODs.map((hod) => (
                        <View key={hod.uid} style={styles.hodCard}>
                            <View style={styles.cardMain}>
                                <View style={styles.avatarContainer}>
                                    {hod.profileImage ? (
                                        <Image source={{ uri: hod.profileImage }} style={styles.avatarImage} />
                                    ) : (
                                        <Text style={styles.avatarInitials}>
                                            {(hod.name || 'H').charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.hodName}>{hod.name || 'Unnamed HOD'}</Text>
                                    <Text style={styles.hodEmail}>{hod.email}</Text>
                                    <View style={styles.deptBadge}>
                                        <MaterialCommunityIcons name="domain" size={14} color="#0055ff" />
                                        <Text style={styles.deptText}>{hod.department || 'General'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <TouchableOpacity 
                                    style={styles.actionBtn}
                                    onPress={() => navigation.navigate('Profile', { targetUid: hod.uid, title: 'HOD Profile' })}
                                >
                                    <MaterialIcons name="visibility" size={20} color="#64748b" />
                                    <Text style={styles.actionText}>View</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.actionBtn}
                                    onPress={() => handleDelete(hod.uid, hod.name)}
                                >
                                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
    
    searchSection: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 48, fontSize: 14, color: '#0f172a' },
    filterContainer: { gap: 8 },
    filterChip: { height: 36, paddingHorizontal: 16, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    filterChipActive: { backgroundColor: '#0055ff' },
    filterChipInactive: { backgroundColor: '#f1f5f9' },
    filterText: { fontSize: 14, fontWeight: '500' },
    filterTextActive: { color: 'white' },
    filterTextInactive: { color: '#64748b' },

    listContainer: { padding: 16, gap: 16 },
    hodCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardMain: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dbeafe', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    avatarInitials: { fontSize: 24, fontWeight: 'bold', color: '#0055ff' },
    infoContainer: { flex: 1 },
    hodName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    hodEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
    deptBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    deptText: { fontSize: 12, color: '#0055ff', fontWeight: '600' },

    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f8fafc', gap: 16 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 13, fontWeight: '600', color: '#64748b' },

    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, color: '#94a3b8', marginTop: 12 }
});
