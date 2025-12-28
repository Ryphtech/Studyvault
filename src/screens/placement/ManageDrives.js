import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock Data
const activeDrives = [
    {
        id: 1,
        company: 'TechCorp Solutions',
        role: 'Software Engineer',
        package: '₹12 LPA',
        deadline: 'Today, 5:00 PM',
        registered: 142,
        icon: 'office-building',
        status: 'Registration Open',
        statusColor: 'green'
    },
    {
        id: 2,
        company: 'BuildWell Constructions',
        role: 'Civil Engineer',
        package: '₹6.5 LPA',
        deadline: 'Nov 02, 2023',
        registered: 18,
        driveDate: 'Nov 02, 2023',
        eligibility: 'Civil Dept.',
        icon: 'factory',
        status: 'Upcoming',
        statusColor: 'blue'
    }
];

const pastDrives = [
    {
        id: 3,
        company: 'Innovate Systems',
        role: 'Analyst',
        package: '₹8 LPA',
        date: 'Oct 15, 2023',
        placed: 12,
        icon: 'briefcase',
        status: 'Completed'
    },
    {
        id: 4,
        company: 'RetailGiant',
        role: 'Management Trainee',
        package: '₹5 LPA',
        date: 'Sep 28, 2023',
        placed: 5,
        icon: 'store',
        status: 'Completed'
    }
];

export default function ManageDrives({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusStyle = (color) => {
        switch (color) {
            case 'green': return { bg: '#dcfce7', text: '#15803d', border: '#16a34a' };
            case 'blue': return { bg: '#eff6ff', text: '#1d4ed8', border: '#2563eb' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#6b7280' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Placement Drives</Text>
                    </View>
                    <TouchableOpacity style={styles.historyButton}>
                        <MaterialCommunityIcons name="history" size={24} color="#1f2937" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search companies, roles..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <MaterialCommunityIcons name="filter-variant" size={24} color="#4b5563" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Active Drives Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Drives</Text>
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>3 Live</Text>
                    </View>
                </View>

                <View style={styles.drivesList}>
                    {activeDrives.map((drive) => {
                        const style = getStatusStyle(drive.statusColor);
                        return (
                            <TouchableOpacity key={drive.id} style={styles.driveCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.companyInfo}>
                                        <View style={styles.iconBox}>
                                            <MaterialCommunityIcons name={drive.icon} size={24} color="#4b5563" />
                                        </View>
                                        <View>
                                            <Text style={styles.companyName}>{drive.company}</Text>
                                            <Text style={styles.roleInfo}>{drive.role} • {drive.package}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={styles.actionIcon}>
                                            <MaterialCommunityIcons name="pencil-outline" size={20} color="#6b7280" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionIcon}>
                                            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.statsGrid}>
                                    <View style={styles.statRow}>
                                        <MaterialCommunityIcons name="calendar-clock" size={18} color="#3b82f6" />
                                        <View>
                                            <Text style={styles.statLabel}>{drive.status === 'Upcoming' ? 'DRIVE DATE' : 'DEADLINE'}</Text>
                                            <Text style={styles.statValue}>{drive.status === 'Upcoming' ? drive.driveDate : drive.deadline}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.statRow}>
                                        <MaterialCommunityIcons name={drive.status === 'Upcoming' ? 'school' : 'account-group'} size={18} color="#a855f7" />
                                        <View>
                                            <Text style={styles.statLabel}>{drive.status === 'Upcoming' ? 'ELIGIBILITY' : 'REGISTERED'}</Text>
                                            <Text style={styles.statValue}>{drive.status === 'Upcoming' ? drive.eligibility : `${drive.registered} Students`}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={[styles.statusTag, { backgroundColor: style.bg, borderColor: style.border }]}>
                                        <Text style={[styles.statusText, { color: style.text }]}>{drive.status}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.viewDetailsButton}>
                                        <Text style={styles.viewDetailsText}>View Details</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={16} color="#0055ff" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Past Drives Section */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Past Drives</Text>
                </View>

                <View style={styles.drivesList}>
                    {pastDrives.map((drive) => (
                        <TouchableOpacity key={drive.id} style={[styles.driveCard, { opacity: 0.9 }]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.companyInfo}>
                                    <View style={[styles.iconBox, { backgroundColor: '#f3f4f6' }]}>
                                        <MaterialCommunityIcons name={drive.icon} size={24} color="#9ca3af" />
                                    </View>
                                    <View>
                                        <Text style={[styles.companyName, { color: '#374151' }]}>{drive.company}</Text>
                                        <Text style={styles.roleInfo}>{drive.role} • {drive.package}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusTag, { backgroundColor: '#f3f4f6' }]}>
                                    <Text style={[styles.statusText, { color: '#4b5563' }]}>Completed</Text>
                                </View>
                            </View>

                            <View style={styles.pastStatsRow}>
                                <View style={styles.placedInfo}>
                                    <MaterialCommunityIcons name="check-circle" size={18} color="#9ca3af" />
                                    <Text style={styles.placedText}>{drive.placed} Students Placed</Text>
                                </View>
                                <Text style={styles.pastDate}>{drive.date}</Text>
                            </View>

                            <View style={styles.cardFooter}>
                                <TouchableOpacity style={styles.viewReportButton}>
                                    <Text style={styles.viewReportText}>View Report</Text>
                                </TouchableOpacity>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.actionIcon}>
                                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#9ca3af" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionIcon}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <MaterialCommunityIcons name="plus" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    historyButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

    searchRow: { flexDirection: 'row', gap: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#111827' },
    filterButton: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },

    scrollContent: { padding: 16 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    liveBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    liveText: { fontSize: 12, fontWeight: 'bold', color: '#15803d' },

    drivesList: { gap: 16 },
    driveCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    companyInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    companyName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    roleInfo: { fontSize: 12, color: '#6b7280', marginTop: 2 },

    actionButtons: { flexDirection: 'row', gap: 8 },
    actionIcon: { padding: 6, borderRadius: 8, backgroundColor: '#f9fafb' },

    statsGrid: { flexDirection: 'row', gap: 16, backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    statRow: { flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 10, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' },
    statValue: { fontSize: 12, fontWeight: 'bold', color: '#1f2937' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f9fafb' },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'transparent' },
    statusText: { fontSize: 10, fontWeight: '600' },
    viewDetailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewDetailsText: { fontSize: 12, fontWeight: '600', color: '#0055ff' },

    pastStatsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
    placedInfo: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    placedText: { fontSize: 12, fontWeight: '500', color: '#4b5563' },
    pastDate: { fontSize: 12, color: '#9ca3af' },

    viewReportButton: {},
    viewReportText: { fontSize: 12, fontWeight: '500', color: '#6b7280' },

    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 }
});
