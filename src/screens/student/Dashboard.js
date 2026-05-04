import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getStudentDashboardStats, getRecentJobs, getUpcomingEvents, subscribeToNotifications, subscribeToStudentMarks } from '../../services/supabaseService';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// For the performance chart
const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 85, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#ffffff'
    },
    decimalPlaces: 1,
};

export default function StudentDashboard({ navigation }) {
    const { user } = useContext(AuthContext);

    // State
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        attendance: 0,
        cgpa: 0,
        name: "Student",
        department: "Loading...",
        semester: ""
    });
    const [events, setEvents] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [chartData, setChartData] = useState({ labels: [], yourScores: [], classAvg: [] });

    const fetchData = async () => {
        try {
            const studentId = user?.id || 'student_demo';

            const statsData = await getStudentDashboardStats(studentId);
            const jobsData = await getRecentJobs(1);
            const eventsData = await getUpcomingEvents(3);

            // Adding a little extra logic to extract a short semester format (e.g. "Sem 6" instead of "6th")
            let shortSem = "Sem X";
            if (statsData?.semester) {
                const num = statsData.semester.replace(/\D/g, '');
                if (num) shortSem = `Sem ${num}`;
            }

            setStats({
                ...statsData,
                shortSem
            });
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
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Subscribe to real-time notification count
    useEffect(() => {
        const unsubscribe = subscribeToNotifications((notifs) => {
            const unreadCount = notifs.filter(n => !n.isRead).length;
            setUnreadNotifications(unreadCount);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to real-time marks data for the performance chart
    useEffect(() => {
        const studentId = user?.id;
        if (!studentId) return;

        const unsubscribe = subscribeToStudentMarks(studentId, (marks) => {
            if (!marks || marks.length === 0) {
                // No marks yet — show placeholder
                setChartData({
                    labels: ['No Data'],
                    yourScores: [0],
                    classAvg: [0]
                });
                return;
            }

            // Group marks by courseName and compute average score per subject
            const courseMap = {};
            marks.forEach(m => {
                const key = m.courseName || m.courseId || 'Unknown';
                if (!courseMap[key]) courseMap[key] = [];
                const score = parseFloat(m.marks);
                const max = parseFloat(m.maxMarks || 50);
                if (!isNaN(score) && !isNaN(max) && max > 0) {
                    courseMap[key].push((score / max) * 10); // scale to 10-point
                }
            });

            const labels = [];
            const yourScores = [];
            Object.entries(courseMap).forEach(([course, scores]) => {
                // Shorten course label to 6 chars
                labels.push(course.length > 6 ? course.substring(0, 6) : course);
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                yourScores.push(Math.round(avg * 10) / 10);
            });

            // Compute overall class average line (mean of all your scores as a flat reference)
            const overallAvg = yourScores.reduce((a, b) => a + b, 0) / yourScores.length;
            const classAvg = yourScores.map(() => Math.round(overallAvg * 10) / 10);

            setChartData({ labels, yourScores, classAvg });
        });

        return () => unsubscribe();
    }, [user?.id]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading your dashboard...</Text>
            </View>
        );
    }

    const firstJob = recentJobs.length > 0 ? recentJobs[0] : null;

    return (
        <View style={styles.container}>
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
                        <Text style={styles.deptText}>
                            {stats.department.split(' ')[0]} • {stats.shortSem}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notifications')}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="notifications" size={22} color="#5e6d8d" />
                    {unreadNotifications > 0 && <View style={styles.notificationBadge} />}
                </TouchableOpacity>
            </View>

            {/* Main Content ScrollView */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Metrics Grid */}
                <View style={styles.metricsGrid}>
                    {/* Attendance Card */}
                    <TouchableOpacity style={styles.metricCardContainer} onPress={() => navigation.navigate('Attendance')} activeOpacity={0.9}>
                        <View style={styles.metricCard}>
                            <View style={styles.metricHeader}>
                                <View style={[styles.metricIcon, { backgroundColor: '#eff6ff' }]}>
                                    <MaterialIcons name="how-to-reg" size={20} color="#0055ff" />
                                </View>
                                {stats.attendance >= 75 && (
                                    <View style={styles.trendPill}>
                                        <MaterialIcons name="trending-up" size={12} color="#16a34a" style={{ marginRight: 2 }} />
                                        <Text style={styles.trendText}>Good</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.metricContent}>
                                <Text style={styles.metricValue}>{stats.attendance}%</Text>
                                <Text style={styles.metricLabel}>Attendance</Text>
                            </View>
                            <View style={[styles.metricDeco, { backgroundColor: 'rgba(0, 85, 255, 0.05)' }]} />
                        </View>
                    </TouchableOpacity>

                    {/* CGPA Card */}
                    <TouchableOpacity style={styles.metricCardContainer} onPress={() => navigation.navigate('Marks')} activeOpacity={0.9}>
                        <View style={styles.metricCard}>
                            <View style={styles.metricHeader}>
                                <View style={[styles.metricIcon, { backgroundColor: '#faf5ff' }]}>
                                    <MaterialIcons name="school" size={20} color="#9333ea" />
                                </View>
                            </View>
                            <View style={styles.metricContent}>
                                <Text style={styles.metricValue}>{stats.cgpa}</Text>
                                <Text style={styles.metricLabel}>CGPA Score</Text>
                            </View>
                            <View style={[styles.metricDeco, { backgroundColor: 'rgba(147, 51, 234, 0.05)' }]} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={[styles.sectionContainer, { paddingTop: 0, paddingBottom: 8 }]}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Notes')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff' }]}>
                                <MaterialIcons name="library-books" size={24} color="#0055ff" />
                            </View>
                            <Text style={styles.actionTitle}>Study Notes</Text>
                            <Text style={styles.actionSubtitle}>Materials & Guides</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('PerformanceAnalytics')}>
                            <View style={[styles.actionIconBox, { backgroundColor: '#fdf2f8' }]}>
                                <MaterialIcons name="analytics" size={24} color="#db2777" />
                            </View>
                            <Text style={styles.actionTitle}>Analytics</Text>
                            <Text style={styles.actionSubtitle}>Your Growth</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Performance Chart Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="insights" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>Overall Performance</Text>
                        </View>
                        <TouchableOpacity style={styles.actionPill} onPress={() => navigation.navigate('PerformanceAnalytics')}>
                            <Text style={styles.actionPillText}>Analysis</Text>
                            <MaterialIcons name="arrow-forward" size={12} color="#0055ff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.chartCard}>
                        {chartData.yourScores.length > 0 && chartData.yourScores.some(s => s > 0) ? (
                            <>
                                <LineChart
                                    data={{
                                        labels: chartData.labels,
                                        datasets: [
                                            { data: chartData.yourScores, color: (opacity = 1) => `rgba(0, 85, 255, ${opacity})`, strokeWidth: 3 },
                                            { data: chartData.classAvg, color: (opacity = 1) => `rgba(147, 51, 234, ${opacity * 0.6})`, strokeWidth: 2 }
                                        ]
                                    }}
                                    width={width - 64}
                                    height={180}
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) => `rgba(0, 85, 255, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                                    }}
                                    bezier
                                    style={styles.chartStyle}
                                    withHorizontalLines={true}
                                    withVerticalLines={false}
                                    withHorizontalLabels={true}
                                    fromZero
                                />
                                <View style={styles.chartLegend}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: '#0055ff', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 4 }]} />
                                        <Text style={styles.legendText}>Your Score</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: '#9333ea', opacity: 0.6 }]} />
                                        <Text style={styles.legendText}>Average</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={{ alignItems: 'center', padding: 24 }}>
                                <MaterialIcons name="bar-chart" size={48} color="#cbd5e1" />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 12 }}>No marks data yet</Text>
                                <Text style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>Your performance graph will appear here</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Placement Cell */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="work-history" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>Placement Cell</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {firstJob ? (
                        <TouchableOpacity
                            style={styles.placementCard}
                            onPress={() => navigation.navigate('Jobs')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.placementBlur} />
                            <View style={styles.placementContent}>
                                <View style={styles.placementIconBox}>
                                    <MaterialIcons name="business-center" size={24} color="white" />
                                </View>
                                <View style={styles.placementInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        {firstJob.isNew && (
                                            <View style={styles.newBadge}>
                                                <Text style={styles.newBadgeText}>NEW</Text>
                                            </View>
                                        )}
                                        <Text style={styles.placementUpdateText}>Updated recently</Text>
                                    </View>
                                    <Text style={styles.placementCompany} numberOfLines={1}>{firstJob.companyName}</Text>
                                    <Text style={styles.placementRole} numberOfLines={1}>{firstJob.role}</Text>
                                </View>
                            </View>
                            <View style={styles.placementFooter}>
                                <View>
                                    <Text style={styles.placementFooterLabel}>DRIVE DATE</Text>
                                    <Text style={styles.placementFooterValue}>{firstJob.date}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.placementFooterLabel}>PACKAGE</Text>
                                    <Text style={styles.placementFooterValue}>{firstJob.package}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.chartCard, { padding: 24, alignItems: 'center' }]}>
                            <MaterialIcons name="work-off" size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500' }}>No active drives right now.</Text>
                        </View>
                    )}
                </View>

                {/* Upcoming Events */}
                <View style={[styles.sectionContainer, { flex: 1 }]}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="event" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>Upcoming Events</Text>
                        </View>
                        <TouchableOpacity style={styles.calendarBtn} onPress={() => navigation.navigate('Events')}>
                            <MaterialIcons name="calendar-month" size={18} color="#5e6d8d" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.eventsList}>
                        {events.length > 0 ? events.map((event, index) => {
                            // Extract pseudo date
                            const isOrange = index % 2 !== 0; // Alternate colors like the design
                            return (
                                <TouchableOpacity
                                    key={event.id}
                                    style={styles.eventRow}
                                    onPress={() => navigation.navigate('EventDetails', { event })}
                                >
                                    <View style={[styles.eventDateBox, { backgroundColor: isOrange ? '#fff7ed' : '#eff6ff' }]}>
                                        <Text style={[styles.eventMonth, { color: isOrange ? '#ea580c' : '#0055ff' }]}>
                                            {event.date ? event.date.substring(0, 3) : 'OCT'}
                                        </Text>
                                        <Text style={[styles.eventDay, { color: isOrange ? '#ea580c' : '#0055ff' }]}>
                                            {event.date ? event.date.replace(/[^0-9]/g, '') : '12'}
                                        </Text>
                                    </View>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                        <View style={styles.eventTimeRow}>
                                            <MaterialIcons name="schedule" size={12} color="#5e6d8d" />
                                            <Text style={styles.eventTimeText}>{event.time || "10:00 AM"} • {event.location || "TBD"}</Text>
                                        </View>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
                                </TouchableOpacity>
                            )
                        }) : (
                            <Text style={styles.noDataText}>No upcoming events scheduled.</Text>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Top Bar (Sticky equivalent)
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(245, 246, 248, 0.9)', zIndex: 10, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16 },
    profileSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative' },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    avatarText: { fontSize: 16, fontWeight: '800', color: '#0055ff' },
    onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white' },

    greeting: { fontSize: 16, fontWeight: '800', color: '#101318', lineHeight: 22 },
    deptText: { fontSize: 11, fontWeight: '600', color: '#5e6d8d' },

    notificationButton: { position: 'relative', width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: 'white' },

    scrollContent: { paddingBottom: 80 },

    // Metrics Grid
    metricsGrid: { flexDirection: 'row', gap: 16, paddingHorizontal: 24, paddingVertical: 16 },
    metricCardContainer: { flex: 1 },
    metricCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1, overflow: 'hidden' },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    trendPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    trendText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },

    metricContent: { marginTop: 16 },
    metricValue: { fontSize: 24, fontWeight: '800', color: '#101318' },
    metricLabel: { fontSize: 10, fontWeight: '600', color: '#9aa2b1', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
    metricDeco: { position: 'absolute', bottom: -24, right: -24, width: 80, height: 80, borderRadius: 40 },

    // Sections
    sectionContainer: { paddingHorizontal: 24, paddingVertical: 12 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#101318' },
    actionPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    actionPillText: { fontSize: 10, fontWeight: '700', color: '#0055ff' },
    viewAllText: { fontSize: 12, fontWeight: '700', color: '#0055ff' },

    // Quick Actions
    quickActionsGrid: { flexDirection: 'row', gap: 12 },
    actionCard: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    actionIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    actionTitle: { fontSize: 14, fontWeight: '800', color: '#101318' },
    actionSubtitle: { fontSize: 11, fontWeight: '600', color: '#9aa2b1', marginTop: 4 },

    // Chart
    chartCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    chartStyle: { marginLeft: -16, marginBottom: 8 },
    chartLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 10, fontWeight: '600', color: '#64748b' },

    // Placement Cell
    placementCard: { backgroundColor: '#0055ff', borderRadius: 20, padding: 20, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, overflow: 'hidden' },
    placementBlur: { position: 'absolute', top: -16, right: -16, width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(255,255,255,0.1)' },
    placementContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, zIndex: 1 },
    placementIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    placementInfo: { flex: 1 },
    newBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    newBadgeText: { fontSize: 9, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
    placementUpdateText: { fontSize: 10, fontWeight: '600', color: '#dbeafe' },
    placementCompany: { fontSize: 18, fontWeight: '800', color: 'white', lineHeight: 22 },
    placementRole: { fontSize: 13, fontWeight: '600', color: '#bfdbfe' },
    placementFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: 20, paddingTop: 12, zIndex: 1 },
    placementFooterLabel: { fontSize: 10, fontWeight: '800', color: '#bfdbfe', letterSpacing: 0.5 },
    placementFooterValue: { fontSize: 14, fontWeight: '700', color: 'white' },

    // Events
    calendarBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    eventsList: { gap: 12 },
    eventRow: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'white', padding: 12, paddingRight: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
    eventDateBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    eventMonth: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    eventDay: { fontSize: 20, fontWeight: '800', lineHeight: 20 },
    eventInfo: { flex: 1 },
    eventTitle: { fontSize: 14, fontWeight: '800', color: '#101318' },
    eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    eventTimeText: { fontSize: 11, fontWeight: '600', color: '#5e6d8d' },

    noDataText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 12 }
});
