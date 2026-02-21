import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getActiveDrives, getPlacedStudents } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function PlacementDashboard({ navigation }) {
    const { logout } = useContext(AuthContext);
    const [drives, setDrives] = useState([]);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [drivesData, studentsData] = await Promise.all([
                getActiveDrives(),
                getPlacedStudents()
            ]);
            setDrives(drivesData);
            setPlacedStudents(studentsData);
        } catch (error) {
            console.error("Error fetching placement data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
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
                    <TouchableOpacity style={styles.menuButton}>
                        <MaterialCommunityIcons name="menu" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Welcome back, Officer</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color="#1f2937" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Settings')}>
                        <MaterialCommunityIcons name="cog" size={24} color="#0055ff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
                                <MaterialCommunityIcons name="briefcase-variant" size={20} color="#0055ff" />
                            </View>
                            <View style={[styles.trendBadge, { backgroundColor: '#f0fdf4' }]}>
                                <Text style={[styles.trendText, { color: '#16a34a' }]}>+4</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.statValue}>{drives.length}</Text>
                            <Text style={styles.statLabel}>Active Drives</Text>
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconBox, { backgroundColor: '#faf5ff' }]}>
                                <MaterialCommunityIcons name="school" size={20} color="#9333ea" />
                            </View>
                            <View style={[styles.trendBadge, { backgroundColor: '#f0fdf4' }]}>
                                <Text style={[styles.trendText, { color: '#16a34a' }]}>85%</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.statValue}>{placedStudents.length || 0}</Text>
                            <Text style={styles.statLabel}>Placed Students</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Drives')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
                                <MaterialCommunityIcons name="briefcase-plus" size={28} color="#0055ff" />
                            </View>
                            <Text style={styles.actionText}>Post Drive</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FilterStudents')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#fff7ed' }]}>
                                <MaterialCommunityIcons name="filter-variant" size={28} color="#ea580c" />
                            </View>
                            <Text style={styles.actionText}>Eligibility Filter</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Upcoming Drives */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Drives</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Drives')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.drivesList}>
                        {drives.map((drive, index) => (
                            <TouchableOpacity key={drive.id || index} style={styles.driveCard}>
                                <View style={styles.driveHeader}>
                                    <View style={styles.companyInfo}>
                                        <View style={styles.companyIconBox}>
                                            <MaterialCommunityIcons name={drive.icon || "office-building"} size={24} color="#4b5563" />
                                        </View>
                                        <View>
                                            <Text style={styles.companyName}>{drive.companyName}</Text>
                                            <Text style={styles.roleInfo}>{drive.role} • {drive.package}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.typeBadge, drive.type === 'Virtual' ? { backgroundColor: '#faf5ff', borderColor: 'rgba(147, 51, 234, 0.1)' } : { backgroundColor: '#eff6ff', borderColor: 'rgba(37, 99, 235, 0.1)' }]}>
                                        <Text style={[styles.typeText, drive.type === 'Virtual' ? { color: '#7e22ce' } : { color: '#1d4ed8' }]}>{drive.type}</Text>
                                    </View>
                                </View>

                                <View style={styles.driveDetailsGrid}>
                                    <View style={styles.driveDetailItem}>
                                        <MaterialCommunityIcons name="calendar-blank" size={18} color="#9ca3af" />
                                        <View>
                                            <Text style={styles.detailLabel}>DATE</Text>
                                            <Text style={styles.detailValue}>{drive.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.driveDetailItem}>
                                        <MaterialCommunityIcons name="school" size={18} color="#9ca3af" />
                                        <View>
                                            <Text style={styles.detailLabel}>ELIGIBILITY</Text>
                                            <Text style={styles.detailValue}>{drive.eligibility || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.driveFooter}>
                                    <View style={styles.attendeesContainer}>
                                        <View style={styles.avatarPile}>
                                            {[1, 2, 3].map((i) => (
                                                <View key={i} style={[styles.pileAvatar, { marginLeft: i > 1 ? -8 : 0, zIndex: 4 - i, backgroundColor: '#e5e7eb' }]} />
                                            ))}
                                            <View style={[styles.pileCounter, { marginLeft: -8, zIndex: 0 }]}>
                                                <Text style={styles.counterText}>+{drive.registered || 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.manageButton}>
                                        <Text style={styles.manageButtonText}>Manage</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={16} color="#0055ff" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {drives.length === 0 && (
                            <Text style={{ textAlign: 'center', color: '#9aa2b1' }}>No upcoming drives.</Text>
                        )}
                    </View>
                </View>

                {/* Recent Placements */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Placements</Text>
                    <View style={styles.placementsCard}>
                        <View style={styles.placementsHeader}>
                            <View style={styles.placementsTitleRow}>
                                <MaterialCommunityIcons name="check-circle" size={20} color="#22c55e" />
                                <Text style={styles.placementsTitle}>Placed Students</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Results')}>
                                <Text style={styles.viewAllSmall}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.placementsList}>
                            {placedStudents.map((student, index) => (
                                <View key={student.id || index}>
                                    <View style={styles.studentRow}>
                                        <View style={styles.studentInfo}>
                                            <Image source={{ uri: student.avatar || 'https://via.placeholder.com/40' }} style={styles.studentAvatar} />
                                            <View>
                                                <Text style={styles.studentName}>{student.name}</Text>
                                                <Text style={styles.placementInfo}>Placed at {student.company}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.packageText}>{student.package}</Text>
                                    </View>
                                    {index < placedStudents.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))}
                            {placedStudents.length === 0 && (
                                <Text style={{ textAlign: 'center', color: '#9aa2b1', padding: 8 }}>No placements yet.</Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('Results')}>
                            <Text style={styles.uploadButtonText}>Upload Results</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Drives')}>
                <MaterialCommunityIcons name="plus" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    headerSubtitle: { fontSize: 12, color: '#6b7280' },
    headerRight: { flexDirection: 'row', gap: 8 },
    iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: 'white' },
    profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 85, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },

    scrollContent: { padding: 16 },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, justifyContent: 'space-between', height: 120, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statIconBox: { padding: 8, borderRadius: 12 },
    trendBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    trendText: { fontSize: 10, fontWeight: 'bold' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 12 },
    statLabel: { fontSize: 12, color: '#6b7280' },

    sectionContainer: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    seeAllText: { fontSize: 14, color: '#0055ff', fontWeight: '500' },

    actionsGrid: { flexDirection: 'row', gap: 12 },
    actionCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    actionIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 14, fontWeight: '500', color: '#4b5563' },

    drivesList: { gap: 16 },
    driveCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 16, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    driveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    companyInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    companyIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    companyName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    roleInfo: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    typeText: { fontSize: 10, fontWeight: '500' },

    driveDetailsGrid: { flexDirection: 'row', gap: 16, paddingVertical: 4 },
    driveDetailItem: { flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 },
    detailLabel: { fontSize: 10, color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' },
    detailValue: { fontSize: 12, fontWeight: '500', color: '#374151' },

    driveFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f9fafb' },
    attendeesContainer: { flexDirection: 'row', alignItems: 'center' },
    avatarPile: { flexDirection: 'row', alignItems: 'center' },
    pileAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white' },
    pileCounter: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
    counterText: { fontSize: 9, fontWeight: '600', color: '#6b7280' },
    manageButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    manageButtonText: { fontSize: 12, fontWeight: '500', color: '#0055ff' },

    placementsCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' },
    placementsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    placementsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    placementsTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
    viewAllSmall: { fontSize: 12, color: '#0055ff', fontWeight: '500' },
    placementsList: { gap: 12 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    studentInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
    studentName: { fontSize: 14, fontWeight: '500', color: '#111827' },
    placementInfo: { fontSize: 12, color: '#6b7280' },
    packageText: { fontSize: 12, fontWeight: '600', color: '#374151' },
    divider: { height: 1, backgroundColor: '#f3f4f6' },
    uploadButton: { marginTop: 16, backgroundColor: '#eff6ff', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    uploadButtonText: { fontSize: 12, fontWeight: '500', color: '#0055ff' },

    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 }
});
