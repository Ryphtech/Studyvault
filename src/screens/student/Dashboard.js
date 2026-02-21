import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, RefreshControl } from 'react-native';
import { Text, Avatar, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStudentDashboardStats, getRecentJobs, getUpcomingEvents, subscribeToEvents } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function StudentDashboard({ navigation }) {
    const { logout, user } = useContext(AuthContext);

    // State
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        attendance: 0,
        cgpa: 0,
        name: "Student",
        department: "Loading..."
    });
    const [events, setEvents] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            // In a real app, use the actual user ID from AuthContext
            // For seeding demo, we used 'student_demo'
            const studentId = user?.uid || 'student_demo';

            const statsData = await getStudentDashboardStats(studentId);
            const jobsData = await getRecentJobs(1); // Just get 1 for the main card for now, or fetch list
            const eventsData = await getUpcomingEvents(3);

            setStats(statsData);
            setRecentJobs(jobsData);
            setEvents(eventsData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Optional: Subscribe to events real-time
        // const unsubscribe = subscribeToEvents(setEvents);
        // return () => unsubscribe();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading your dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Main Content ScrollView */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>{stats.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.greeting}>Hi, {stats.name.split(' ')[0]}</Text>
                            <Text style={styles.deptText}>{stats.department}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color="#5e6d8d" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {/* Attendance Card */}
                    <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Attendance')}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#eff6ff' }]}>
                                <MaterialCommunityIcons name="account-check-outline" size={20} color="#0055ff" />
                            </View>
                            <View style={[styles.trendBadge, { backgroundColor: stats.attendance >= 75 ? '#f0fdf4' : '#fef2f2' }]}>
                                <MaterialCommunityIcons
                                    name={stats.attendance >= 75 ? "trending-up" : "alert-circle-outline"}
                                    size={14}
                                    color={stats.attendance >= 75 ? "#16a34a" : "#dc2626"}
                                />
                                <Text style={[styles.trendText, { color: stats.attendance >= 75 ? "#16a34a" : "#dc2626" }]}>
                                    {stats.attendance >= 75 ? "Good" : "Low"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{stats.attendance}%</Text>
                            <Text style={styles.statLabel}>ATTENDANCE</Text>
                        </View>
                        <View style={[styles.statDecoration, { backgroundColor: 'rgba(0, 85, 255, 0.05)' }]} />
                    </TouchableOpacity>

                    {/* CGPA Card */}
                    <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Marks')}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#faf5ff' }]}>
                                <MaterialCommunityIcons name="school-outline" size={20} color="#9333ea" />
                            </View>
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>{stats.cgpa}</Text>
                            <Text style={styles.statLabel}>CGPA SCORE</Text>
                        </View>
                        <View style={[styles.statDecoration, { backgroundColor: 'rgba(147, 51, 234, 0.05)' }]} />
                    </TouchableOpacity>
                </View>

                {/* Placement Cell Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <MaterialCommunityIcons name="briefcase-clock-outline" size={22} color="#0055ff" />
                            <Text style={styles.sectionTitle}>Placement Cell</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentJobs.length > 0 ? (
                        <TouchableOpacity
                            style={styles.placementCardContainer}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('Jobs')}
                        >
                            <LinearGradient
                                colors={['#0055ff', '#0044cc']}
                                style={styles.placementGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.placementDecoration} />

                                <View style={styles.companyHeader}>
                                    <View style={styles.companyIcon}>
                                        <MaterialCommunityIcons name="briefcase-variant" size={24} color="#fff" />
                                    </View>
                                    <View>
                                        <View style={styles.badgeContainer}>
                                            <View style={styles.newBadge}>
                                                <Text style={styles.newBadgeText}>NEW</Text>
                                            </View>
                                            <Text style={styles.updateText}>Recently Added</Text>
                                        </View>
                                        <Text style={styles.companyName}>{recentJobs[0].companyName}</Text>
                                        <Text style={styles.jobRole}>{recentJobs[0].role}</Text>
                                    </View>
                                </View>

                                <View style={styles.placementFooter}>
                                    <View>
                                        <Text style={styles.footerLabel}>DRIVE DATE</Text>
                                        <Text style={styles.footerValue}>{recentJobs[0].date}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.footerLabel}>PACKAGE</Text>
                                        <Text style={styles.footerValue}>{recentJobs[0].package}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ padding: 20, alignItems: 'center', backgroundColor: 'white', borderRadius: 12 }}>
                            <Text style={{ color: '#9aa2b1' }}>No active placement drives.</Text>
                        </View>
                    )}
                </View>

                {/* Upcoming Events Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#0055ff" />
                            <Text style={styles.sectionTitle}>Upcoming Events</Text>
                        </View>
                        <TouchableOpacity style={styles.calendarButton} onPress={() => navigation.navigate('Events')}>
                            <MaterialCommunityIcons name="calendar" size={20} color="#5e6d8d" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.eventsList}>
                        {events.map((event, index) => {
                            // Helper to parse date if needed, assuming ISO string for now
                            const eventDate = new Date(event.date);
                            const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                            const day = eventDate.getDate();

                            return (
                                <TouchableOpacity key={event.id || index} style={styles.eventCard}>
                                    <View style={[styles.dateBox, { backgroundColor: index % 2 === 0 ? '#eff6ff' : '#fff7ed' }]}>
                                        <Text style={[styles.dateMonth, { color: index % 2 === 0 ? '#0055ff' : '#ea580c' }]}>{month}</Text>
                                        <Text style={styles.dateDay}>{day}</Text>
                                    </View>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventTitle}>{event.title}</Text>
                                        <View style={styles.eventMeta}>
                                            <MaterialCommunityIcons name="clock-outline" size={14} color="#5e6d8d" />
                                            <Text style={styles.eventMetaText}>{event.time} • {event.location}</Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                                </TouchableOpacity>
                            );
                        })}
                        {events.length === 0 && (
                            <View style={{ padding: 10 }}>
                                <Text style={{ color: '#9aa2b1' }}>No upcoming events.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Spacer for bottom tab bar */}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Bottom Tab Bar Removed - Handled by Navigator */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    scrollContent: { paddingBottom: 20 },

    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 32, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative' },
    avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', elevation: 2 },
    avatarText: { color: '#0055ff', fontSize: 18, fontWeight: 'bold' },
    onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white' },
    userInfo: { justifyContent: 'center' },
    greeting: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    deptText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },
    notificationButton: { padding: 10, backgroundColor: 'white', borderRadius: 20, elevation: 1 },
    notificationDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: 'white' },

    statsGrid: { flexDirection: 'row', gap: 16, paddingHorizontal: 24, marginBottom: 8 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 2, overflow: 'hidden' },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    statIconContainer: { padding: 10, borderRadius: 12 },
    trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 2 },
    trendText: { fontSize: 10, fontWeight: 'bold' },
    statContent: {},
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#101318' },
    statLabel: { fontSize: 10, fontWeight: '600', color: '#9aa2b1', marginTop: 4, letterSpacing: 0.5 },
    statDecoration: { position: 'absolute', bottom: -24, right: -24, width: 80, height: 80, borderRadius: 40 },

    sectionContainer: { paddingHorizontal: 24, paddingVertical: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#101318' },
    viewAllText: { fontSize: 12, fontWeight: 'bold', color: '#0055ff' },
    calendarButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },

    placementCardContainer: { borderRadius: 16, elevation: 8, overflow: 'hidden' },
    placementGradient: { padding: 20 },
    placementDecoration: { position: 'absolute', top: -16, right: -16, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.1)' },
    companyHeader: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    companyIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    newBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    newBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 'bold' },
    updateText: { color: '#dbeafe', fontSize: 10, fontWeight: '500' },
    companyName: { fontSize: 18, fontWeight: 'bold', color: 'white', lineHeight: 24 },
    jobRole: { color: '#dbeafe', fontSize: 14, fontWeight: '500' },
    placementFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 12 },
    footerLabel: { color: '#bfdbfe', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    footerValue: { color: 'white', fontSize: 14, fontWeight: '600' },

    eventsList: { gap: 12 },
    eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, paddingRight: 16, borderRadius: 16, gap: 16, elevation: 1 },
    dateBox: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    dateMonth: { fontSize: 10, fontWeight: 'bold' },
    dateDay: { fontSize: 20, fontWeight: 'bold', color: '#101318' },
    eventInfo: { flex: 1 },
    eventTitle: { fontSize: 14, fontWeight: 'bold', color: '#101318', marginBottom: 2 },
    eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    eventMetaText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' }
});
