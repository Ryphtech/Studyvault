import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Text, IconButton, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { AuthContext } from '../../context/AuthContext';
import { getStudentAttendance, getStudentDashboardStats } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

const CircularProgress = ({ size, strokeWidth, progress, color, backgroundColor }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={{ position: 'relative', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </Svg>
            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="school" size={32} color="rgba(255,255,255,0.9)" />
            </View>
        </View>
    );
};

export default function AttendanceScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [overallStats, setOverallStats] = useState({ percentage: 0, total: 0, present: 0, absent: 0 });

    const fetchAttendance = async () => {
        try {
            const studentId = user?.uid || 'student_demo';
            const records = await getStudentAttendance(studentId);
            setAttendanceData(records);

            // Calculate aggregated stats
            let total = 0;
            let attended = 0;
            records.forEach(rec => {
                total += rec.totalClasses || 0;
                attended += rec.attendedClasses || 0;
            });

            const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
            setOverallStats({
                percentage,
                total,
                present: attended,
                absent: total - attended
            });

        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAttendance();
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
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Attendance</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#5e6d8d" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* Hero Card */}
                <LinearGradient
                    colors={['#0055ff', '#0033cc']}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroDecoration} />

                    <View style={styles.heroContentRow}>
                        <View style={styles.heroStats}>
                            <Text style={styles.heroLabel}>Overall Attendance</Text>
                            <Text style={styles.heroValue}>{overallStats.percentage}%</Text>
                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, { backgroundColor: overallStats.percentage >= 75 ? '#4ade80' : '#ef4444' }]} />
                                <Text style={styles.statusText}>{overallStats.percentage >= 75 ? "Good Standing" : "Low Attendance"}</Text>
                            </View>
                        </View>
                        <CircularProgress
                            size={100}
                            strokeWidth={8}
                            progress={overallStats.percentage / 100}
                            color="white"
                            backgroundColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    <View style={styles.heroGrid}>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>TOTAL</Text>
                            <Text style={styles.gridValue}>{overallStats.total}</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>PRESENT</Text>
                            <Text style={styles.gridValue}>{overallStats.present}</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>ABSENT</Text>
                            <Text style={styles.gridValue}>{overallStats.absent}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Subject Wise List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Subject-wise</Text>
                    <View style={styles.semesterBadge}>
                        <Text style={styles.semesterText}>Semester 6</Text>
                    </View>
                </View>

                <View style={styles.subjectList}>
                    {attendanceData.map((subject, index) => {
                        const subPercent = subject.totalClasses > 0
                            ? Math.round((subject.attendedClasses / subject.totalClasses) * 100)
                            : 0;
                        const isLow = subPercent < 75;
                        const isWarning = subPercent >= 75 && subPercent < 80; // Example range

                        let statusColor = '#22c55e'; // Green
                        if (isLow) statusColor = '#ef4444'; // Red
                        else if (isWarning) statusColor = '#eab308'; // Yellow

                        return (
                            <TouchableOpacity key={index} style={[styles.subjectCard, isLow && styles.dangerCard, isWarning && styles.warningCard]}>
                                {isLow && (
                                    <View style={styles.shortageBadge}>
                                        <MaterialCommunityIcons name="alert" size={12} color="#dc2626" />
                                        <Text style={styles.shortageText}>SHORTAGE</Text>
                                    </View>
                                )}
                                <View style={[styles.subjectHeader, isLow && { marginTop: 4 }]}>
                                    <View style={styles.subjectInfo}>
                                        <View style={[styles.iconBox, { backgroundColor: isLow ? '#fef2f2' : '#f0fdf4' }]}>
                                            <MaterialCommunityIcons name="book-open-variant" size={24} color={statusColor} />
                                        </View>
                                        <View>
                                            <Text style={styles.subjectName}>{subject.subjectName}</Text>
                                            <Text style={styles.subjectDetails}>{subject.subjectId}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.percentageText, { color: statusColor }]}>{subPercent}%</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${subPercent}%`, backgroundColor: statusColor }]} />
                                </View>
                                <View style={styles.subjectFooter}>
                                    <Text style={styles.footerText}>{subject.attendedClasses}/{subject.totalClasses} Classes Attended</Text>
                                    <View style={[styles.statusTag, { backgroundColor: isLow ? '#fef2f2' : (isWarning ? '#fefce8' : '#f0fdf4') }]}>
                                        <Text style={[styles.statusTagText, { color: statusColor }]}>{isLow ? "CRITICAL" : (isWarning ? "WARNING" : "ON TRACK")}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {attendanceData.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#9aa2b1', marginTop: 20 }}>No attendance records found.</Text>
                    )}

                </View>

                {/* Spacer for bottom bar */}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Bottom Tab Bar Removed - Handled by Navigator */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318' },
    filterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

    heroCard: { borderRadius: 24, padding: 24, marginTop: 8, elevation: 8, overflow: 'hidden' },
    heroDecoration: { position: 'absolute', top: -40, right: -40, width: 192, height: 192, borderRadius: 96, backgroundColor: 'rgba(255,255,255,0.1)', opacity: 0.5 },
    heroContentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroStats: {},
    heroLabel: { color: '#bfdbfe', fontSize: 14, fontWeight: '500', marginBottom: 4, letterSpacing: 0.5 },
    heroValue: { color: 'white', fontSize: 40, fontWeight: 'bold', lineHeight: 48 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 6 },
    statusText: { color: 'white', fontSize: 12, fontWeight: '600' },

    heroGrid: { flexDirection: 'row', marginTop: 24, gap: 12 },
    heroGridItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    gridLabel: { color: '#bfdbfe', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    gridValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    semesterBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    semesterText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    subjectList: { gap: 16 },
    subjectCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 1 },
    warningCard: { borderLeftWidth: 3, borderLeftColor: '#facc15' },
    dangerCard: { borderLeftWidth: 3, borderLeftColor: '#ef4444' },

    subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    subjectInfo: { flexDirection: 'row', gap: 12, flex: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    subjectName: { fontSize: 14, fontWeight: 'bold', color: '#101318', flexWrap: 'wrap' },
    subjectDetails: { fontSize: 11, color: '#5e6d8d', fontWeight: '500', marginTop: 2 },
    percentageText: { fontSize: 18, fontWeight: 'bold' },

    progressBarBg: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
    progressBarFill: { height: '100%', borderRadius: 4 },

    subjectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerText: { fontSize: 11, color: '#5e6d8d', fontWeight: '500' },
    statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    statusTagText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    shortageBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
    shortageText: { color: '#dc2626', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
