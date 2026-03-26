import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { AuthContext } from '../../context/AuthContext';
import { subscribeToStudentMarks, subscribeToStudentAttendance, getStudentDashboardStats } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 85, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: '#ffffff'
    },
    decimalPlaces: 1,
};

export default function PerformanceAnalytics({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [period, setPeriod] = useState('semester');
    const [loading, setLoading] = useState(true);

    // Live data state
    const [cgpa, setCgpa] = useState(0);
    const [attendancePercent, setAttendancePercent] = useState(0);
    const [meanScore, setMeanScore] = useState(0);
    const [chartLabels, setChartLabels] = useState(['N/A']);
    const [subjectScores, setSubjectScores] = useState([0]);
    const [classAvgScores, setClassAvgScores] = useState([0]);

    const studentId = user?.uid;

    // Fetch CGPA (one-shot, from profile)
    useEffect(() => {
        if (!studentId) return;
        getStudentDashboardStats(studentId).then(stats => {
            setCgpa(stats?.cgpa || 0);
        }).catch(console.error);
    }, [studentId]);

    // Real-time marks subscription
    useEffect(() => {
        if (!studentId) return;

        const unsubscribe = subscribeToStudentMarks(studentId, (marks) => {
            if (!marks || marks.length === 0) {
                setSubjectScores([0]);
                setClassAvgScores([0]);
                setChartLabels(['N/A']);
                setMeanScore(0);
                setLoading(false);
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
                    courseMap[key].push({ score, max, pct: (score / max) * 100 });
                }
            });

            const labels = [];
            const scores = [];
            Object.entries(courseMap).forEach(([course, entries]) => {
                // Shorten label to fit chart
                labels.push(course.length > 7 ? course.substring(0, 7) : course);
                const avgPct = entries.reduce((a, b) => a + b.pct, 0) / entries.length;
                scores.push(Math.round(avgPct));
            });

            // Compute overall average as the class avg reference line
            const overallAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            const classAvg = scores.map(() => overallAvg);

            // Mean score across all subjects
            const mean = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

            setChartLabels(labels.length > 0 ? labels : ['N/A']);
            setSubjectScores(scores.length > 0 ? scores : [0]);
            setClassAvgScores(classAvg.length > 0 ? classAvg : [0]);
            setMeanScore(mean);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [studentId]);

    // Real-time attendance subscription
    useEffect(() => {
        if (!studentId) return;

        const unsubscribe = subscribeToStudentAttendance(studentId, (records) => {
            let totalClasses = 0;
            let attendedClasses = 0;
            records.forEach(rec => {
                totalClasses += rec.totalClasses || 0;
                attendedClasses += rec.attendedClasses || 0;
            });
            const attPct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
            setAttendancePercent(attPct);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [studentId]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading analytics...</Text>
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
                    <Text style={styles.headerTitle}>Performance Analytics</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <MaterialIcons name="more-vert" size={24} color="#5e6d8d" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Segment Controls */}
                <View style={styles.segmentContainer}>
                    <View style={styles.segmentBg}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, period === 'semester' && styles.segmentBtnActive]}
                            onPress={() => setPeriod('semester')}
                        >
                            <Text style={[styles.segmentText, period === 'semester' && styles.segmentTextActive]}>This Semester</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, period === 'month' && styles.segmentBtnActive]}
                            onPress={() => setPeriod('month')}
                        >
                            <Text style={[styles.segmentText, period === 'month' && styles.segmentTextActive]}>Last Month</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, period === 'custom' && styles.segmentBtnActive, { flexDirection: 'row', gap: 4 }]}
                            onPress={() => setPeriod('custom')}
                        >
                            <Text style={[styles.segmentText, period === 'custom' && styles.segmentTextActive]}>Custom</Text>
                            <MaterialIcons name="calendar-today" size={14} color={period === 'custom' ? 'white' : '#5e6d8d'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Chart Card */}
                <View style={styles.chartSection}>
                    <View style={styles.chartCard}>
                        {/* Top Info */}
                        <View style={styles.chartHeader}>
                            <View>
                                <Text style={styles.chartEyebrow}>Performance Score</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                                    <Text style={styles.scoreValue}>{cgpa || meanScore}</Text>
                                    <Text style={styles.scoreChange}>
                                        {meanScore > 60 ? `+${((meanScore / 100) * 5).toFixed(1)}%` : '-'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.chartLegendTop}>
                                <View style={styles.legendItemTop}>
                                    <View style={[styles.legendDot, { backgroundColor: '#0055ff' }]} />
                                    <Text style={styles.legendTextTop}>You</Text>
                                </View>
                                <View style={styles.legendItemTop}>
                                    <View style={[styles.legendDot, { backgroundColor: '#c084fc' }]} />
                                    <Text style={styles.legendTextTop}>Class</Text>
                                </View>
                            </View>
                        </View>

                        {/* Chart */}
                        <View style={{ marginLeft: -24, marginTop: 8 }}>
                            <LineChart
                                data={{
                                    labels: chartLabels,
                                    datasets: [
                                        { data: subjectScores, color: (opacity = 1) => `rgba(0, 85, 255, ${opacity})` },
                                        { data: classAvgScores, color: (opacity = 1) => `rgba(147, 51, 234, 0.4)` }
                                    ]
                                }}
                                width={width - 48 + 16}
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(0, 85, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                                withHorizontalLines={true}
                                withVerticalLines={false}
                                yAxisInterval={1}
                                segments={4}
                            />
                        </View>

                        {/* Lower Legend Grid */}
                        <View style={styles.lowerLegendGrid}>
                            <View style={styles.legendGridItem}>
                                <View style={[styles.legendDotSmall, { backgroundColor: '#3b82f6' }]} />
                                <Text style={styles.legendGridText}>Attendance</Text>
                            </View>
                            <View style={styles.legendGridItem}>
                                <View style={[styles.legendDotSmall, { backgroundColor: '#a855f7' }]} />
                                <Text style={styles.legendGridText}>CGPA</Text>
                            </View>
                            <View style={styles.legendGridItem}>
                                <View style={[styles.legendDotSmall, { backgroundColor: '#f97316' }]} />
                                <Text style={styles.legendGridText}>CIA Scores</Text>
                            </View>
                            <View style={styles.legendGridItem}>
                                <View style={[styles.legendDotSmall, { backgroundColor: '#10b981' }]} />
                                <Text style={styles.legendGridText}>Internal Marks</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Summary List */}
                <View style={styles.summarySection}>
                    <Text style={styles.summaryTitle}>Period Summary</Text>

                    <View style={styles.summaryList}>
                        {/* Attendance Item */}
                        <View style={[styles.summaryCard, { borderColor: 'transparent' }]}>
                            <View style={styles.summaryInfo}>
                                <View style={[styles.summaryIconBox, { backgroundColor: '#eff6ff' }]}>
                                    <MaterialIcons name="how-to-reg" size={20} color="#0055ff" />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Average Attendance</Text>
                                    <Text style={styles.summaryValue}>{attendancePercent}%</Text>
                                </View>
                            </View>
                            <View style={attendancePercent >= 75 ? styles.metricChangePillPos : styles.metricChangePillNeg}>
                                <Text style={attendancePercent >= 75 ? styles.metricChangePosText : styles.metricChangeNegText}>
                                    {attendancePercent >= 75 ? '✓ Good' : '⚠ Low'}
                                </Text>
                            </View>
                        </View>

                        {/* Test Score Item */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryInfo}>
                                <View style={[styles.summaryIconBox, { backgroundColor: '#faf5ff' }]}>
                                    <MaterialIcons name="quiz" size={20} color="#9333ea" />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Mean Test Score</Text>
                                    <Text style={styles.summaryValue}>{meanScore}/100</Text>
                                </View>
                            </View>
                            <View style={meanScore >= 50 ? styles.metricChangePillPos : styles.metricChangePillNeg}>
                                <Text style={meanScore >= 50 ? styles.metricChangePosText : styles.metricChangeNegText}>
                                    {meanScore >= 50 ? '✓ Pass' : '⚠ Fail'}
                                </Text>
                            </View>
                        </View>

                        {/* CGPA Item */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryInfo}>
                                <View style={[styles.summaryIconBox, { backgroundColor: '#eff6ff' }]}>
                                    <MaterialIcons name="grade" size={20} color="#0055ff" />
                                </View>
                                <View>
                                    <Text style={styles.summaryLabel}>Current CGPA</Text>
                                    <Text style={styles.summaryValue}>{cgpa || 'N/A'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('Marks')}>
                                <Text style={styles.detailsBtnText}>Details</Text>
                                <MaterialIcons name="arrow-forward" size={14} color="#0055ff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.8)', zIndex: 10 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#101318' },

    // Segments
    segmentContainer: { paddingHorizontal: 24, marginBottom: 24, marginTop: 8 },
    segmentBg: { flexDirection: 'row', backgroundColor: 'white', padding: 4, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
    segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    segmentBtnActive: { backgroundColor: '#0055ff', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    segmentText: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },
    segmentTextActive: { color: 'white', fontWeight: '700' },

    // Chart Card
    chartSection: { paddingHorizontal: 24, marginBottom: 24 },
    chartCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    chartEyebrow: { fontSize: 10, fontWeight: '700', color: '#9aa2b1', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    scoreValue: { fontSize: 24, fontWeight: '700', color: '#101318' },
    scoreChange: { fontSize: 12, fontWeight: '500', color: '#22c55e', marginBottom: 4 },

    chartLegendTop: { flexDirection: 'row', gap: 8 },
    legendItemTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendTextTop: { fontSize: 10, fontWeight: '500', color: '#6b7280' },

    lowerLegendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    legendGridItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    legendDotSmall: { width: 8, height: 8, borderRadius: 4 },
    legendGridText: { fontSize: 11, fontWeight: '500', color: '#6b7280' },

    // Summary Section
    summarySection: { paddingHorizontal: 24 },
    summaryTitle: { fontSize: 14, fontWeight: '700', color: '#101318', marginBottom: 12, paddingLeft: 4 },
    summaryList: { gap: 12 },

    summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: 'transparent' },
    summaryInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    summaryIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    summaryLabel: { fontSize: 10, fontWeight: '700', color: '#9aa2b1', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    summaryValue: { fontSize: 16, fontWeight: '700', color: '#101318' },

    metricChangePillPos: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    metricChangePosText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
    metricChangePillNeg: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    metricChangeNegText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },

    detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailsBtnText: { fontSize: 12, fontWeight: '700', color: '#0055ff' }
});
