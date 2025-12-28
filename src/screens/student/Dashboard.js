import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function StudentDashboard({ navigation }) {
    const { logout, user } = useContext(AuthContext);

    // Placeholder data
    const studentName = "Alex"; // Or derive from user context if available
    const department = "Comp. Sci • Sem 6";

    return (
        <View style={styles.container}>
            {/* Main Content ScrollView */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>AM</Text>
                            </View>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.greeting}>Hi, {studentName}</Text>
                            <Text style={styles.deptText}>{department}</Text>
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
                            <View style={styles.trendBadge}>
                                <MaterialCommunityIcons name="trending-up" size={14} color="#16a34a" />
                                <Text style={styles.trendText}>Good</Text>
                            </View>
                        </View>
                        <View style={styles.statContent}>
                            <Text style={styles.statValue}>85%</Text>
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
                            <Text style={styles.statValue}>8.4</Text>
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
                        <TouchableOpacity onPress={() => navigation.navigate('Placements')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.placementCardContainer}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Placements')}
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
                                        <Text style={styles.updateText}>Updated 2h ago</Text>
                                    </View>
                                    <Text style={styles.companyName}>TechCorp Systems</Text>
                                    <Text style={styles.jobRole}>Jr. Software Engineer</Text>
                                </View>
                            </View>

                            <View style={styles.placementFooter}>
                                <View>
                                    <Text style={styles.footerLabel}>DRIVE DATE</Text>
                                    <Text style={styles.footerValue}>Oct 24, 2023</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.footerLabel}>PACKAGE</Text>
                                    <Text style={styles.footerValue}>12 LPA</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
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
                        {/* Event 1 */}
                        <TouchableOpacity style={styles.eventCard}>
                            <View style={[styles.dateBox, { backgroundColor: '#eff6ff', color: '#0055ff' }]}>
                                <Text style={[styles.dateMonth, { color: '#0055ff' }]}>OCT</Text>
                                <Text style={styles.dateDay}>12</Text>
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>Mid-Term Exams</Text>
                                <View style={styles.eventMeta}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#5e6d8d" />
                                    <Text style={styles.eventMetaText}>10:00 AM • Room 302</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                        {/* Event 2 */}
                        <TouchableOpacity style={styles.eventCard}>
                            <View style={[styles.dateBox, { backgroundColor: '#fff7ed' }]}>
                                <Text style={[styles.dateMonth, { color: '#ea580c' }]}>OCT</Text>
                                <Text style={styles.dateDay}>15</Text>
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>Project Submission</Text>
                                <View style={styles.eventMeta}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#5e6d8d" />
                                    <Text style={styles.eventMetaText}>11:59 PM • Online</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>

                        {/* Event 3 */}
                        <TouchableOpacity style={styles.eventCard}>
                            <View style={[styles.dateBox, { backgroundColor: '#faf5ff' }]}>
                                <Text style={[styles.dateMonth, { color: '#9333ea' }]}>OCT</Text>
                                <Text style={styles.dateDay}>20</Text>
                            </View>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>Guest Lecture</Text>
                                <View style={styles.eventMeta}>
                                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#5e6d8d" />
                                    <Text style={styles.eventMetaText}>Auditorium</Text>
                                </View>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Spacer for bottom tab bar */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom Implementation for Visual Fidelity) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="view-dashboard" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Attendance')}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Attendance</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Placement')}>
                        <MaterialCommunityIcons name="briefcase" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={logout}>
                        {/* Using Profile icon for Logout temporarily as per design, but functional */}
                        <MaterialCommunityIcons name="account" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 2 },
    trendText: { fontSize: 10, fontWeight: 'bold', color: '#16a34a' },
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
    eventMetaText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
