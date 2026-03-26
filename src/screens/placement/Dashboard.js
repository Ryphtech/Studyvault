import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { subscribeToActiveDrives, subscribeToPlacedStudents, getUserProfile } from '../../services/firestoreService';

export default function PlacementDashboard({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [drives, setDrives] = useState([]);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [officerName, setOfficerName] = useState('Officer');

    useEffect(() => {
        const loadName = async () => {
            if (user?.uid) {
                const profile = await getUserProfile(user.uid);
                if (profile?.name) setOfficerName(profile.name.split(' ')[0]);
            }
        };
        loadName();
    }, [user]);

    useEffect(() => {
        let unsubscribeDrives = () => { };
        let unsubscribePlaced = () => { };

        try {
            unsubscribeDrives = subscribeToActiveDrives((drivesData) => {
                setDrives(drivesData);
            });

            unsubscribePlaced = subscribeToPlacedStudents((studentsData) => {
                setPlacedStudents(studentsData);
                setLoading(false); // Consider loading complete after pulling this
            });

        } catch (error) {
            console.error("Error setting up placement data subscriptions:", error);
            setLoading(false);
        }

        return () => {
            unsubscribeDrives();
            unsubscribePlaced();
        };
    }, []);

    const onRefresh = () => {
        // No-op since it's realtime, but we can keep it for UX completeness
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
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
                        <MaterialIcons name="menu" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Welcome back, {officerName}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialIcons name="notifications" size={26} color="#4b5563" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Settings')}>
                        <MaterialIcons name="person" size={24} color="#0055ff" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
                                <MaterialIcons name="work" size={20} color="#0055ff" />
                            </View>
                            <View style={[styles.trendBadge, { backgroundColor: '#f0fdf4' }]}>
                                <Text style={[styles.trendText, { color: '#16a34a' }]}>+4</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.statValue}>{drives.length || 12}</Text>
                            <Text style={styles.statLabel}>Active Drives</Text>
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconBox, { backgroundColor: '#faf5ff' }]}>
                                <MaterialIcons name="school" size={20} color="#9333ea" />
                            </View>
                            <View style={[styles.trendBadge, { backgroundColor: '#f0fdf4' }]}>
                                <Text style={[styles.trendText, { color: '#16a34a' }]}>85%</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.statValue}>450</Text>
                            <Text style={styles.statLabel}>Eligible Students</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Drives')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
                                <MaterialIcons name="add-business" size={28} color="#0055ff" />
                            </View>
                            <Text style={styles.actionText}>Post Drive</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('FilterStudents')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#fff7ed' }]}>
                                <MaterialIcons name="filter-list" size={28} color="#ea580c" />
                            </View>
                            <Text style={styles.actionText}>Eligibility Filter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ChatList')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#f0fdf4' }]}>
                                <MaterialIcons name="chat" size={28} color="#16a34a" />
                            </View>
                            <Text style={styles.actionText}>Messages</Text>
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
                        {drives.length > 0 ? drives.map((drive, index) => (
                            <TouchableOpacity key={drive.id || index} style={styles.driveCard}>
                                <View style={styles.driveCardHeader}>
                                    <View style={styles.driveCompanyInfo}>
                                        <View style={styles.driveCompanyIconBox}>
                                            <MaterialIcons name={drive.type?.toLowerCase().includes('virtual') ? "factory" : "apartment"} size={26} color="#4b5563" />
                                        </View>
                                        <View>
                                            <Text style={styles.driveCompanyName}>{drive.companyName}</Text>
                                            <Text style={styles.driveRoleInfo}>{drive.role} • {drive.package}</Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.driveTypeBadge,
                                        drive.type?.toLowerCase().includes('virtual')
                                            ? { backgroundColor: '#faf5ff', borderColor: 'rgba(147,51,234,0.1)' }
                                            : { backgroundColor: '#eff6ff', borderColor: 'rgba(37,99,235,0.1)' }
                                    ]}>
                                        <Text style={[
                                            styles.driveTypeText,
                                            drive.type?.toLowerCase().includes('virtual') ? { color: '#7e22ce' } : { color: '#1d4ed8' }
                                        ]}>
                                            {drive.type || 'On Campus'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.driveDetailsGrid}>
                                    <View style={styles.driveDetailItem}>
                                        <MaterialIcons name="calendar-month" size={18} color="#9ca3af" />
                                        <View>
                                            <Text style={styles.detailLabel}>DATE</Text>
                                            <Text style={styles.detailValue}>{drive.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.driveDetailItem}>
                                        <MaterialIcons name="school" size={18} color="#9ca3af" />
                                        <View>
                                            <Text style={styles.detailLabel}>ELIGIBILITY</Text>
                                            <Text style={styles.detailValue}>{drive.eligibility || 'CGPA > 7.5'}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.driveFooter}>
                                    <View style={styles.avatarPile}>
                                        <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.pileAvatar1} />
                                        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.pileAvatar2} />
                                        <Image source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} style={styles.pileAvatar3} />
                                        <View style={styles.pileCounterBox}>
                                            <Text style={styles.pileCounterText}>+{drive.registered || 42}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.manageButton} onPress={() => navigation.navigate('ManageDriveResults', { driveId: drive.id })}>
                                        <Text style={styles.manageButtonText}>Manage Results</Text>
                                        <MaterialIcons name="arrow-forward" size={16} color="#0055ff" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            <View style={{ alignItems: 'center', padding: 24 }}>
                                <MaterialIcons name="work-outline" size={48} color="#cbd5e1" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#94a3b8', marginTop: 12 }}>No Active Drives</Text>
                                <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>New drives will appear here</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Recent Placements */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Placements</Text>
                    <View style={styles.placementsCard}>
                        <View style={styles.placementsHeader}>
                            <View style={styles.placementsTitleRow}>
                                <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                                <Text style={styles.placementsTitleText}>Placed Students</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Results')}>
                                <Text style={styles.viewAllSmall}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.placementsList}>
                            {placedStudents.length > 0 ? placedStudents.map((student, index) => (
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
                            )) : (
                                <View style={{ alignItems: 'center', padding: 24 }}>
                                    <MaterialIcons name="people-outline" size={48} color="#cbd5e1" />
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#94a3b8', marginTop: 12 }}>No Students Placed</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('Results')}>
                            <Text style={styles.uploadButtonText}>Upload Results</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Drives')}>
                <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, color: '#6b7280' },
    headerRight: { flexDirection: 'row', gap: 8 },
    iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    notificationDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#f5f6f8' },
    profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 85, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },

    scrollContent: { padding: 16 },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, height: 112, justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.5)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statIconBox: { padding: 8, borderRadius: 12 },
    trendBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    trendText: { fontSize: 10, fontWeight: '600' },
    statValue: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 4 },
    statLabel: { fontSize: 12, color: '#6b7280' },

    sectionContainer: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
    seeAllText: { fontSize: 14, color: '#0055ff', fontWeight: '500' },

    actionsGrid: { flexDirection: 'row', gap: 12 },
    actionCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.5)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    actionIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 14, fontWeight: '500', color: '#374151' },

    drivesList: { gap: 16 },
    driveCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.5)', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    driveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    driveCompanyInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    driveCompanyIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    driveCompanyName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    driveRoleInfo: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    driveTypeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    driveTypeText: { fontSize: 11, fontWeight: '500' },

    driveDetailsGrid: { flexDirection: 'row', gap: 16, marginTop: 4 },
    driveDetailItem: { flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 },
    detailLabel: { fontSize: 10, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' },
    detailValue: { fontSize: 12, fontWeight: '500', color: '#374151' },

    jobDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
    jobDetailItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    jobDetailText: { fontSize: 13, color: '#6b7280', marginLeft: 4 },
    driveActions: {
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        justifyContent: 'flex-end'
    },
    driveActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0, 85, 255, 0.05)',
        borderRadius: 8,
        gap: 6,
    },
    driveActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0055ff',
    },

    driveFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(249, 250, 251, 1)', marginTop: 4 },
    avatarPile: { flexDirection: 'row', alignItems: 'center' },
    pileAvatar1: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', zIndex: 3 },
    pileAvatar2: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', marginLeft: -8, zIndex: 2 },
    pileAvatar3: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'white', marginLeft: -8, zIndex: 1 },
    pileCounterBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white', marginLeft: -8, zIndex: 0 },
    pileCounterText: { fontSize: 10, fontWeight: '500', color: '#6b7280' },
    manageButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    manageButtonText: { fontSize: 12, fontWeight: '500', color: '#0055ff' },

    placementsCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.5)' },
    placementsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    placementsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    placementsTitleText: { fontSize: 14, fontWeight: '600', color: '#111827' },
    viewAllSmall: { fontSize: 12, color: '#0055ff', fontWeight: '500' },
    placementsList: { gap: 16 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    studentInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
    studentName: { fontSize: 14, fontWeight: '500', color: '#111827' },
    placementInfo: { fontSize: 12, color: '#6b7280' },
    packageText: { fontSize: 12, fontWeight: '600', color: '#374151' },
    divider: { height: 1, backgroundColor: '#f3f4f6' },
    uploadButton: { marginTop: 16, backgroundColor: 'rgba(0, 85, 255, 0.08)', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    uploadButtonText: { fontSize: 12, fontWeight: '500', color: '#0055ff' },

    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }
});
