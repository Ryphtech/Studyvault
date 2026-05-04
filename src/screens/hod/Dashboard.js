import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, RefreshControl, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getUserProfile, getDepartmentStats, subscribeToDepartmentCourses, seedCSCurriculum } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function HODDashboard({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalFaculty: 0, totalStudents: 0, assignedCourses: 0, totalSubjects: 0 });
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [isSeeding, setIsSeeding] = useState(false);

    const fetchData = async () => {
        try {
            const profileData = await getUserProfile(user?.id);
            setProfile(profileData);

            if (profileData?.department) {
                const deptStats = await getDepartmentStats(profileData.department);
                setStats(deptStats);
            }
        } catch (error) {
            console.error("Error fetching HOD data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Subscribe to recent course assignments
    useEffect(() => {
        if (!profile?.department) return;
        const unsubscribe = subscribeToDepartmentCourses(profile.department, (courses) => {
            setRecentAssignments(courses.slice(0, 5));
        });
        return () => unsubscribe();
    }, [profile?.department]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleSeedCS = async () => {
        Alert.alert(
            "Seed CS Curriculum",
            "This will add all 8 semesters of CS subjects to the database. Proceed?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Seed Data", 
                    onPress: async () => {
                        setIsSeeding(true);
                        const result = await seedCSCurriculum(profile?.department || 'Computer Science');
                        setIsSeeding(false);
                        if(result && result.success) {
                            Alert.alert("Success", "CS Curriculum seeded smoothly!");
                            onRefresh();
                        } else {
                            Alert.alert("Error", "Failed to seed curriculum data.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading dashboard...</Text>
            </View>
        );
    }

    const department = profile?.department || 'Department';
    const name = profile?.name || 'HOD';

    const ACTIONS = [
        { icon: 'book-education', label: 'Assign\nSubjects', screen: 'AssignSubjects', color: '#0055ff', bgColor: '#eff6ff' },
        { icon: 'account-group', label: 'Manage\nFaculty', screen: 'ManageFaculty', color: '#059669', bgColor: '#f0fdf4' },
        { icon: 'chat-processing-outline', label: 'Chat\nMessages', screen: 'ChatList', color: '#14b8a6', bgColor: '#ccfbf1' },
        { icon: 'calendar-clock', label: 'Set\nTimetable', screen: 'ManageSchedules', color: '#d97706', bgColor: '#fffbeb' },
        { icon: 'clipboard-check-outline', label: 'Manage\nFeedback', screen: 'ManageFeedback', color: '#e11d48', bgColor: '#fff1f2' },
        { icon: 'bell-outline', label: 'Notifications', screen: 'Notifications', color: '#0284c7', bgColor: '#f0f9ff' },
        { icon: 'send', label: 'Send\nNotification', screen: 'SendNotification', color: '#ef4444', bgColor: '#fef2f2' },
        { icon: 'cog', label: 'Settings', screen: 'Settings', color: '#6366f1', bgColor: '#f5f3ff' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                        </View>
                        <View style={styles.activeDot} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>HOD Dashboard</Text>
                        <Text style={styles.headerSubtitle}>{department}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#101318" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0055ff']} />}
            >
                {/* Welcome Card */}
                <LinearGradient
                    colors={['#0055ff', '#003399']}
                    style={styles.welcomeCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.welcomeDecoration} />
                    <View style={styles.welcomeDecoration2} />
                    <View>
                        <Text style={styles.welcomeGreeting}>Welcome back,</Text>
                        <Text style={styles.welcomeName}>{name}</Text>
                        <Text style={styles.welcomeDept}>Head of {department}</Text>
                    </View>
                    <View style={styles.welcomeStats}>
                        <View style={styles.welcomeStatItem}>
                            <Text style={styles.welcomeStatValue}>{stats.totalSubjects}</Text>
                            <Text style={styles.welcomeStatLabel}>Subjects</Text>
                        </View>
                        <View style={styles.welcomeStatDivider} />
                        <View style={styles.welcomeStatItem}>
                            <Text style={styles.welcomeStatValue}>{stats.assignedCourses}</Text>
                            <Text style={styles.welcomeStatLabel}>Assigned</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
                            <MaterialCommunityIcons name="account-group" size={22} color="#0055ff" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalFaculty}</Text>
                        <Text style={styles.statLabel}>Faculty</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#f0fdf4' }]}>
                            <MaterialCommunityIcons name="school" size={22} color="#059669" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalStudents}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconBox, { backgroundColor: '#fef3c7' }]}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={22} color="#d97706" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalSubjects}</Text>
                        <Text style={styles.statLabel}>Subjects</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>
                <View style={styles.actionsGrid}>
                    {ACTIONS.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionCard}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate(action.screen, { department })}
                        >
                            <View style={[styles.actionIconBox, { backgroundColor: action.bgColor }]}>
                                <MaterialCommunityIcons name={action.icon} size={28} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Assignments */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Assignments</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AssignSubjects')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {recentAssignments.length > 0 ? (
                    recentAssignments.map((course, i) => (
                        <View key={course.id || i} style={styles.assignmentCard}>
                            <View style={[styles.assignmentAccent, { backgroundColor: i % 2 === 0 ? '#0055ff' : '#059669' }]} />
                            <View style={styles.assignmentContent}>
                                <View style={styles.assignmentTop}>
                                    <Text style={styles.assignmentTitle}>{course.name || course.subjectName || 'Subject'}</Text>
                                    <View style={[styles.codeBadge, { backgroundColor: i % 2 === 0 ? '#eff6ff' : '#f0fdf4' }]}>
                                        <Text style={[styles.codeText, { color: i % 2 === 0 ? '#0055ff' : '#059669' }]}>{course.code || course.subjectCode || '---'}</Text>
                                    </View>
                                </View>
                                <View style={styles.assignmentMeta}>
                                    <MaterialCommunityIcons name="account" size={14} color="#94a3b8" />
                                    <Text style={styles.assignmentMetaText}>{course.facultyName || 'Unassigned'}</Text>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No assignments yet</Text>
                        <Text style={styles.emptySubtitle}>Tap "Assign Subjects" to get started</Text>
                    </View>
                )}

                {/* Optional Action for Seeding CS DB */}
                {department === 'Computer Science and Engineering' && (
                    <TouchableOpacity 
                        style={[styles.seedButton, { opacity: isSeeding ? 0.6 : 1 } ]} 
                        onPress={handleSeedCS}
                        disabled={isSeeding}
                    >
                        {isSeeding ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="database-arrow-up" size={20} color="white" />
                                <Text style={styles.seedButtonText}>Seed CS Subjects</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, backgroundColor: '#f5f6f8' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatarContainer: { position: 'relative' },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: '700', color: 'white' },
    activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#f5f6f8', position: 'absolute', bottom: 0, right: -2 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#101318' },
    headerSubtitle: { fontSize: 13, fontWeight: '500', color: '#5e6d8d', marginTop: 2 },
    notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

    scrollContent: { paddingHorizontal: 24, paddingTop: 8 },

    // Welcome Card
    welcomeCard: { borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden' },
    welcomeDecoration: { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' },
    welcomeDecoration2: { position: 'absolute', right: 40, bottom: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
    welcomeGreeting: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
    welcomeName: { fontSize: 26, fontWeight: '800', color: 'white', marginTop: 4 },
    welcomeDept: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    welcomeStats: { flexDirection: 'row', marginTop: 20, gap: 24 },
    welcomeStatItem: { alignItems: 'center' },
    welcomeStatValue: { fontSize: 24, fontWeight: '800', color: 'white' },
    welcomeStatLabel: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
    welcomeStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

    // Stats Grid
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
    statIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { fontSize: 22, fontWeight: '800', color: '#101318' },
    statLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Section Header
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#101318' },
    seeAllText: { fontSize: 13, fontWeight: '600', color: '#0055ff' },

    // Actions Grid
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
    actionCard: { width: (width - 48 - 12 * 3) / 4, alignItems: 'center', gap: 8 },
    actionIconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { fontSize: 11, fontWeight: '600', color: '#475569', textAlign: 'center', lineHeight: 16 },

    // Assignment Cards
    assignmentCard: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
    assignmentAccent: { width: 4 },
    assignmentContent: { flex: 1, padding: 16 },
    assignmentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    assignmentTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 12 },
    codeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    codeText: { fontSize: 11, fontWeight: '700' },
    assignmentMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    assignmentMetaText: { fontSize: 13, color: '#64748b' },

    // Empty State
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: '#cbd5e1', marginTop: 4 },

    seedButton: {
        marginTop: 20,
        backgroundColor: '#6366f1',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    seedButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '700'
    }
});
