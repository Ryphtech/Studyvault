import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile } from '../../services/supabaseService';
import { supabase } from '../../services/supabaseClient';

const { width } = Dimensions.get('window');
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PERIODS = [
    { num: 1, time: '09:00 - 09:50' },
    { num: 2, time: '09:50 - 10:40' },
    { num: 3, time: '10:50 - 11:40' },
    { num: 4, time: '11:40 - 12:30' },
    { num: 5, time: '01:30 - 02:20' },
    { num: 6, time: '02:20 - 03:10' },
    { num: 7, time: '03:20 - 04:10' },
];

const PERIOD_COLORS = ['#0055ff', '#9333ea', '#ea580c', '#059669', '#e11d48', '#d97706', '#6366f1'];

export default function Timetable({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [selectedDay, setSelectedDay] = useState(DAYS[getCurrentDayIndex()]);
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState(null);

    function getCurrentDayIndex() {
        const day = new Date().getDay(); // 0 = Sunday
        if (day === 0) return 0; // Show Monday if Sunday
        return Math.min(day - 1, 5); // Mon=0, Tue=1, ... Sat=5
    }

    const fetchData = async () => {
        if (!user?.id) return;
        try {
            const userProfile = await getUserProfile(user.id);
            setProfile(userProfile);

            if (userProfile?.department && userProfile?.semester) {
                const semRaw = userProfile.semester.toString();
                const semFormatted = semRaw.startsWith('S') ? semRaw : `S${semRaw.replace(/\D/g, '')}`;
                const docId = `${userProfile.department.replace(/\s/g, '_')}_${semFormatted}`;

                const { data, error } = await supabase
                    .from('timetables')
                    .select('*')
                    .eq('id', docId)
                    .single();

                if (data) {
                    setTimetable(data.schedule || {});
                } else {
                    setTimetable({});
                }
            }
        } catch (error) {
            console.error("Error fetching timetable:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const unsubscribe = navigation.addListener('focus', fetchData);
        return unsubscribe;
    }, [user?.id, navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const currentDaySlots = timetable?.[selectedDay] || [];

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 12, color: '#64748b' }}>Loading timetable...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Class Timetable</Text>
                        <Text style={styles.headerSubtitle}>
                            {profile?.department} • Semester {profile?.semester?.toString().replace(/\D/g, '')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Day Selector */}
            <View style={styles.daySelectorRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 24 }}>
                    {DAYS.map((day, idx) => (
                        <TouchableOpacity
                            key={day}
                            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
                                {SHORT_DAYS[idx]}
                            </Text>
                            {getCurrentDayIndex() === idx && (
                                <View style={[styles.todayDot, selectedDay === day && { backgroundColor: 'white' }]} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{selectedDay}</Text>
                    <View style={styles.classCountBadge}>
                        <Text style={styles.classCountText}>
                            {currentDaySlots.filter(s => s.subject?.trim()).length} Classes
                        </Text>
                    </View>
                </View>

                {currentDaySlots.some(s => s.subject?.trim()) ? (
                    <View style={styles.periodsList}>
                        {PERIODS.map((period, idx) => {
                            const slot = currentDaySlots[idx];
                            const hasData = slot?.subject?.trim();
                            if (!hasData) return null;

                            const color = PERIOD_COLORS[idx % PERIOD_COLORS.length];

                            return (
                                <View key={idx} style={styles.periodCard}>
                                    <View style={[styles.periodAccent, { backgroundColor: color }]} />
                                    <View style={styles.periodNumBox}>
                                        <Text style={styles.periodNum}>{period.num}</Text>
                                        <Text style={styles.periodTime}>{period.time.split(' - ')[0]}</Text>
                                    </View>
                                    <View style={styles.periodContent}>
                                        <Text style={styles.subjectName}>{slot.subject}</Text>
                                        <View style={styles.slotMeta}>
                                            {slot.faculty ? (
                                                <View style={styles.metaItem}>
                                                    <MaterialIcons name="person" size={14} color="#64748b" />
                                                    <Text style={styles.metaText}>{slot.faculty}</Text>
                                                </View>
                                            ) : null}
                                            {slot.room ? (
                                                <View style={styles.metaItem}>
                                                    <MaterialIcons name="meeting-room" size={14} color="#64748b" />
                                                    <Text style={styles.metaText}>{slot.room}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View style={[styles.timeBadge, { backgroundColor: `${color}15` }]}>
                                        <Text style={[styles.timeBadgeText, { color: color }]}>{period.time.split(' - ')[1]}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <MaterialCommunityIcons name="calendar-clock" size={60} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
                        <Text style={styles.emptySubtitle}>There are no classes assigned for {selectedDay}.</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingHorizontal: 24, paddingBottom: 20, backgroundColor: 'white' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 2 },

    daySelectorRow: { paddingVertical: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dayChip: { width: 56, height: 64, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    dayChipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff', elevation: 4, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    dayChipText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    dayChipTextActive: { color: 'white' },
    todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#0055ff', marginTop: 6 },

    scrollContent: { padding: 24 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dayTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    classCountBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    classCountText: { fontSize: 12, fontWeight: '700', color: '#0055ff' },

    periodsList: { gap: 12 },
    periodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1, overflow: 'hidden' },
    periodAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
    periodNumBox: { alignItems: 'center', width: 50, marginRight: 12 },
    periodNum: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
    periodTime: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 2 },
    periodContent: { flex: 1 },
    subjectName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
    slotMeta: { flexDirection: 'row', gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    timeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    timeBadgeText: { fontSize: 10, fontWeight: '800' },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20 },
});
