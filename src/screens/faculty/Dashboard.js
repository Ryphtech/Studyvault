import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getFacultyCourses, getFacultyProfile } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function FacultyDashboard({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // For demo, if user.uid is strict, ensure it matches seed data or fallback
            // const facultyId = user?.uid || "faculty_demo"; 
            // Using "faculty_demo" for consistent seeding visualization if Auth isn't strict yet
            const facultyId = "faculty_demo";

            try {
                const [profileData, coursesData] = await Promise.all([
                    getFacultyProfile(facultyId),
                    getFacultyCourses(facultyId)
                ]);
                setProfile(profileData);
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching faculty data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Derived state for next class
    const nextClass = courses.length > 0 ? courses[0].schedule[0] : null;
    const nextCourse = courses.length > 0 ? courses[0] : null;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
            </View>
        );
    }

    const facultyName = profile?.name || "Professor";

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.menuButton}>
                        <MaterialCommunityIcons name="menu" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Welcome, {facultyName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#5e6d8d" />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Card - Next Class */}
                <LinearGradient
                    colors={['#0055ff', '#0033cc']}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroDecoration} />

                    <View style={styles.heroTop}>
                        {nextClass && nextCourse ? (
                            <>
                                <View style={styles.heroContent}>
                                    <View style={styles.nextClassBadge}>
                                        <MaterialCommunityIcons name="clock-outline" size={12} color="#fde047" />
                                        <Text style={styles.nextClassText}>NEXT CLASS</Text>
                                    </View>
                                    <Text style={styles.heroTitle}>{nextCourse.name}</Text>
                                    <Text style={styles.heroSubtitle}>{nextCourse.code} • {nextClass.room}</Text>
                                </View>

                                <View style={styles.timeBadgeLarge}>
                                    <Text style={styles.timeBadgeTime}>{nextClass.time.split(' ')[0]}</Text>
                                    <Text style={styles.timeBadgeAmPm}>{nextClass.time.split(' ')[1]}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>No Classes Today</Text>
                                <Text style={styles.heroSubtitle}>Enjoy your day!</Text>
                            </View>
                        )}
                    </View>

                    {nextCourse && (
                        <View style={styles.studentsEnrolled}>
                            <View style={styles.avatarStack}>
                                <View style={[styles.avatar, { backgroundColor: '#bfdbfe', zIndex: 3, marginLeft: 0 }]} />
                                <View style={[styles.avatar, { backgroundColor: '#93c5fd', zIndex: 2, marginLeft: -10 }]} />
                                <View style={[styles.avatar, { backgroundColor: '#60a5fa', zIndex: 1, marginLeft: -10 }]} />
                            </View>
                            <Text style={styles.enrolledText}>{nextCourse.studentsEnrolled || 0} Students Enrolled</Text>
                        </View>
                    )}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.startClassButton}>
                            <MaterialCommunityIcons name="play" size={20} color="#0055ff" />
                            <Text style={styles.startClassText}>Start Class</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attendanceButton} onPress={() => navigation.navigate('AttendanceManager')}>
                            <MaterialCommunityIcons name="qrcode-scan" size={20} color="white" />
                            <Text style={styles.attendanceButtonText}>Attendance</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Quick Actions Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AttendanceManager')}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#eff6ff', color: '#0055ff' }]}>
                            <MaterialCommunityIcons name="playlist-check" size={24} color="#0055ff" />
                        </View>
                        <View>
                            <Text style={styles.actionTitle}>Attendance</Text>
                            <Text style={styles.actionSubtitle}>Manage logs</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MarksUpload')}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#faf5ff', color: '#9333ea' }]}>
                            <MaterialCommunityIcons name="star-outline" size={24} color="#9333ea" />
                        </View>
                        <View>
                            <Text style={styles.actionTitle}>Upload Marks</Text>
                            <Text style={styles.actionSubtitle}>Tests & Exams</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('NotesUpload')}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#fff7ed', color: '#ea580c' }]}>
                            <MaterialCommunityIcons name="file-upload-outline" size={24} color="#ea580c" />
                        </View>
                        <View>
                            <Text style={styles.actionTitle}>Share Notes</Text>
                            <Text style={styles.actionSubtitle}>Class materials</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#f0fdf4', color: '#16a34a' }]}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#16a34a" />
                        </View>
                        <View>
                            <Text style={styles.actionTitle}>My Schedule</Text>
                            <Text style={styles.actionSubtitle}>Weekly view</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Today's Schedule */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewCalendarText}>View Calendar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.scheduleList}>
                    {courses.map((course, index) => (
                        course.schedule.map((slot, i) => (
                            <View key={`${index}-${i}`} style={[styles.scheduleCard, styles.borderBlue]}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View>
                                            <Text style={styles.scheduleTitle}>{course.name}</Text>
                                            <Text style={styles.scheduleSubtitle}>{course.code} • {slot.room}</Text>
                                        </View>
                                        <View style={[styles.statusTag, { backgroundColor: '#eff6ff', borderColor: '#dbeafe' }]}>
                                            <Text style={[styles.statusText, { color: '#0055ff' }]}>{slot.day.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.scheduleTime}>
                                        <MaterialCommunityIcons name="clock-outline" size={14} color="#5e6d8d" />
                                        <Text style={styles.scheduleTimeText}>{slot.time}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ))}
                    {courses.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#9aa2b1' }}>No schedule available.</Text>
                    )}
                </View>

                {/* Spacer for bottom bar */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="view-dashboard" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AttendanceManager')}>
                        <MaterialCommunityIcons name="school-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Classes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="chat-processing-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Chat</Text>
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
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318', lineHeight: 24 },
    headerSubtitle: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },
    notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: 'white' },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

    heroCard: { borderRadius: 24, padding: 24, marginTop: 8, elevation: 8, overflow: 'hidden' },
    heroDecoration: { position: 'absolute', top: -40, right: -40, width: 192, height: 192, borderRadius: 96, backgroundColor: 'rgba(255,255,255,0.1)', opacity: 0.5 },

    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    heroContent: { flex: 1 },
    nextClassBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12, gap: 4 },
    nextClassText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    heroTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 32, marginBottom: 4 },
    heroSubtitle: { color: '#bfdbfe', fontSize: 14, fontWeight: '500', letterSpacing: 0.2 },

    timeBadgeLarge: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' },
    timeBadgeTime: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    timeBadgeAmPm: { color: '#bfdbfe', fontSize: 10, fontWeight: 'bold' },

    studentsEnrolled: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    avatarStack: { flexDirection: 'row', marginRight: 12 },
    avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#0044cc' },
    enrolledText: { color: '#bfdbfe', fontSize: 12, fontWeight: '500' },

    actionButtons: { flexDirection: 'row', gap: 12 },
    startClassButton: { flex: 1, backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 2 },
    startClassText: { color: '#0055ff', fontSize: 14, fontWeight: 'bold' },
    attendanceButton: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    attendanceButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    viewCalendarText: { fontSize: 12, fontWeight: 'bold', color: '#0055ff' },

    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: { width: (width - 60) / 2, backgroundColor: 'white', borderRadius: 16, padding: 16, gap: 12, elevation: 1 },
    actionIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start' },
    actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    actionSubtitle: { fontSize: 10, color: '#5e6d8d' },

    scheduleList: { gap: 12 },
    scheduleCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 1, flexDirection: 'row', gap: 16, borderLeftWidth: 6 },
    borderGreen: { borderLeftColor: '#22c55e' },
    borderBlue: { borderLeftColor: '#0055ff' },
    borderGray: { borderLeftColor: '#9ca3af' },

    scheduleTitle: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    scheduleSubtitle: { fontSize: 12, color: '#5e6d8d', fontWeight: '500', marginTop: 2 },

    scheduleTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    scheduleTimeText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    statusTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
