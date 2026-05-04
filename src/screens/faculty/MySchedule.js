import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getFacultyCourses, subscribeToSchedules } from '../../services/supabaseService';

const { width } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_COLORS = [
    { bg: '#eff6ff', border: '#0055ff', text: '#0055ff' },
    { bg: '#faf5ff', border: '#9333ea', text: '#9333ea' },
    { bg: '#fff7ed', border: '#ea580c', text: '#ea580c' },
    { bg: '#f0fdf4', border: '#16a34a', text: '#16a34a' },
    { bg: '#fef2f2', border: '#ef4444', text: '#ef4444' },
    { bg: '#fefce8', border: '#ca8a04', text: '#ca8a04' },
];

export default function MySchedule({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());
    const [courses, setCourses] = useState([]);
    const [scheduleSlots, setScheduleSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    function getCurrentDayIndex() {
        const day = new Date().getDay(); // 0 = Sunday
        if (day === 0) return 0; // Show Monday if Sunday
        return Math.min(day - 1, 5); // Mon=0, Tue=1, ... Sat=5
    }

    // Fetch faculty courses
    useEffect(() => {
        const fetchCourses = async () => {
            if (!user?.id) { setLoading(false); return; }
            try {
                const coursesData = await getFacultyCourses(user.id);
                setCourses(coursesData);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user?.id]);

    // Subscribe to global schedule slots for the selected day
    useEffect(() => {
        const dayName = FULL_DAYS[selectedDay];
        const unsubscribe = subscribeToSchedules(dayName, (slots) => {
            // Filter to only show this faculty's slots if facultyId is set
            const mySlots = user?.id
                ? slots.filter(s => s.facultyId === user.id || !s.facultyId)
                : slots;
            setScheduleSlots(mySlots);
        });
        return () => unsubscribe();
    }, [selectedDay, user?.id]);

    // Build the combined schedule for the selected day
    const getDaySchedule = () => {
        const dayShort = DAYS[selectedDay];
        const dayFull = FULL_DAYS[selectedDay];

        // From courses (embedded schedule arrays)
        const courseSlots = [];
        courses.forEach(course => {
            if (course.schedule && Array.isArray(course.schedule)) {
                course.schedule.forEach(slot => {
                    if (slot.day === dayShort || slot.day === dayFull) {
                        courseSlots.push({
                            id: `${course.id}-${slot.day}-${slot.time}`,
                            subject: course.name || course.subjectName || 'Unknown',
                            code: course.code || course.subjectCode || '',
                            time: slot.time || '',
                            room: slot.room || 'TBD',
                            type: 'course',
                            studentsEnrolled: course.studentsEnrolled || 0,
                        });
                    }
                });
            }
        });

        // From schedules collection
        const extraSlots = scheduleSlots.map(slot => ({
            id: slot.id,
            subject: slot.subject || slot.courseName || 'Class',
            code: slot.courseCode || '',
            time: slot.startTime ? `${slot.startTime} - ${slot.endTime}` : '',
            room: slot.room || 'TBD',
            type: 'schedule',
            studentsEnrolled: 0,
        }));

        // Merge and sort by time
        const all = [...courseSlots, ...extraSlots];
        all.sort((a, b) => {
            const timeA = a.time.split(' ')[0] || '00:00';
            const timeB = b.time.split(' ')[0] || '00:00';
            return timeA.localeCompare(timeB);
        });

        return all;
    };

    const schedule = getDaySchedule();
    const todayIndex = getCurrentDayIndex();

    const onRefresh = async () => {
        setRefreshing(true);
        if (user?.id) {
            const coursesData = await getFacultyCourses(user.id);
            setCourses(coursesData);
        }
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading schedule...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>My Schedule</Text>
                        <Text style={styles.headerSubtitle}>Weekly class timetable</Text>
                    </View>
                </View>
            </View>

            {/* Day Selector */}
            <View style={styles.daySelectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorScroll}>
                    {DAYS.map((day, index) => {
                        const isSelected = selectedDay === index;
                        const isToday = todayIndex === index;
                        const color = DAY_COLORS[index];
                        return (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayChip,
                                    isSelected && { backgroundColor: color.bg, borderColor: color.border, borderWidth: 2 },
                                    !isSelected && styles.dayChipInactive,
                                ]}
                                onPress={() => setSelectedDay(index)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.dayChipText,
                                    isSelected && { color: color.text, fontWeight: '800' }
                                ]}>{day}</Text>
                                {isToday && (
                                    <View style={[styles.todayDot, { backgroundColor: color.border }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Schedule Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Day Header */}
                <View style={styles.dayHeader}>
                    <Text style={styles.dayHeaderText}>{FULL_DAYS[selectedDay]}</Text>
                    <View style={styles.classCountBadge}>
                        <Text style={styles.classCountText}>{schedule.length} {schedule.length === 1 ? 'Class' : 'Classes'}</Text>
                    </View>
                </View>

                {schedule.length > 0 ? (
                    <View style={styles.scheduleList}>
                        {schedule.map((slot, index) => {
                            const color = DAY_COLORS[selectedDay];
                            return (
                                <View key={slot.id} style={styles.slotCard}>
                                    {/* Time line indicator */}
                                    <View style={styles.timelineContainer}>
                                        <View style={[styles.timelineDot, { backgroundColor: color.border }]} />
                                        {index < schedule.length - 1 && (
                                            <View style={[styles.timelineLine, { backgroundColor: `${color.border}30` }]} />
                                        )}
                                    </View>

                                    {/* Slot Content */}
                                    <View style={[styles.slotContent, { borderLeftColor: color.border }]}>
                                        <View style={styles.slotHeader}>
                                            <Text style={styles.slotTime}>{slot.time || 'Time TBD'}</Text>
                                            {slot.studentsEnrolled > 0 && (
                                                <View style={[styles.enrolledBadge, { backgroundColor: color.bg }]}>
                                                    <MaterialIcons name="people" size={12} color={color.text} />
                                                    <Text style={[styles.enrolledBadgeText, { color: color.text }]}>{slot.studentsEnrolled}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.slotSubject}>{slot.subject}</Text>
                                        <View style={styles.slotDetails}>
                                            {slot.code ? (
                                                <View style={styles.slotDetailItem}>
                                                    <MaterialIcons name="tag" size={14} color="#9ca3af" />
                                                    <Text style={styles.slotDetailText}>{slot.code}</Text>
                                                </View>
                                            ) : null}
                                            <View style={styles.slotDetailItem}>
                                                <MaterialIcons name="room" size={14} color="#9ca3af" />
                                                <Text style={styles.slotDetailText}>{slot.room}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={56} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
                        <Text style={styles.emptySubtitle}>You have no classes on {FULL_DAYS[selectedDay]}.</Text>
                    </View>
                )}

                {/* Stats Row */}
                {courses.length > 0 && (
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
                                <MaterialIcons name="book" size={20} color="#0055ff" />
                            </View>
                            <Text style={styles.statValue}>{courses.length}</Text>
                            <Text style={styles.statLabel}>Total Courses</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: '#f0fdf4' }]}>
                                <MaterialIcons name="event" size={20} color="#16a34a" />
                            </View>
                            <Text style={styles.statValue}>{schedule.length}</Text>
                            <Text style={styles.statLabel}>Today's Classes</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIconBox, { backgroundColor: '#faf5ff' }]}>
                                <MaterialIcons name="people" size={20} color="#9333ea" />
                            </View>
                            <Text style={styles.statValue}>
                                {courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0)}
                            </Text>
                            <Text style={styles.statLabel}>Total Students</Text>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },

    daySelectorContainer: { paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    daySelectorScroll: { paddingHorizontal: 20, gap: 10 },
    dayChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignItems: 'center', minWidth: 56 },
    dayChipInactive: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    dayChipText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    todayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

    scrollContent: { padding: 24 },

    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dayHeaderText: { fontSize: 20, fontWeight: '800', color: '#101318' },
    classCountBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    classCountText: { fontSize: 12, fontWeight: '700', color: '#0055ff' },

    scheduleList: { gap: 0 },
    slotCard: { flexDirection: 'row', marginBottom: 4 },

    timelineContainer: { width: 24, alignItems: 'center', marginRight: 16 },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 16 },
    timelineLine: { width: 2, flex: 1, marginTop: 4 },

    slotContent: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    slotTime: { fontSize: 12, fontWeight: '700', color: '#6b7280', letterSpacing: 0.3 },
    enrolledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    enrolledBadgeText: { fontSize: 11, fontWeight: '700' },
    slotSubject: { fontSize: 16, fontWeight: '700', color: '#101318', marginBottom: 8 },
    slotDetails: { flexDirection: 'row', gap: 16 },
    slotDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    slotDetailText: { fontSize: 12, fontWeight: '500', color: '#9ca3af' },

    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 4 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8' },

    statsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    statIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 20, fontWeight: '800', color: '#101318' },
    statLabel: { fontSize: 10, fontWeight: '600', color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
});
