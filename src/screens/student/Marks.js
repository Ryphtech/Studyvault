import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { AuthContext } from '../../context/AuthContext';
import { getStudentMarks } from '../../services/supabaseService';

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
                <MaterialCommunityIcons name="star-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
        </View>
    );
};

export default function MarksScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [marksData, setMarksData] = useState([]);
    const [stats, setStats] = useState({ percentage: 0, passed: 0, arrears: 0, totalSubjects: 0 });

    const fetchMarks = async () => {
        try {
            const studentId = user?.id || 'student_demo';
            const records = await getStudentMarks(studentId);
            setMarksData(records);

            // Calculate stats
            let totalMarks = 0;
            let maxTotal = 0;
            let passed = 0;
            let arrears = 0;

            records.forEach(subject => {
                totalMarks += subject.total;
                maxTotal += subject.maxScore;
                if (subject.total >= (subject.maxScore * 0.40)) { // Assuming 40% pass
                    passed++;
                } else {
                    arrears++;
                }
            });

            const percentage = maxTotal > 0 ? Math.round((totalMarks / maxTotal) * 100) : 0;
            setStats({
                percentage,
                passed,
                arrears,
                totalSubjects: records.length
            });

        } catch (error) {
            console.error("Error fetching marks:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMarks();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMarks();
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
                    <Text style={styles.headerTitle}>Internal Marks</Text>
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
                            <Text style={styles.heroLabel}>Semester Average</Text>
                            <Text style={styles.heroValue}>{stats.percentage}%</Text>
                            <View style={styles.statusBadge}>
                                <MaterialCommunityIcons name="star" size={14} color="#fde047" />
                                <Text style={styles.statusText}>
                                    {stats.percentage >= 75 ? "First Class" : (stats.percentage >= 60 ? "Second Class" : "Needs Improvement")}
                                </Text>
                            </View>
                        </View>
                        <CircularProgress
                            size={100}
                            strokeWidth={8}
                            progress={stats.percentage / 100}
                            color="white"
                            backgroundColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    <View style={styles.heroGrid}>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>SUBJECTS</Text>
                            <Text style={styles.gridValue}>{stats.totalSubjects}</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>PASSED</Text>
                            <Text style={styles.gridValue}>{stats.passed}</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>ARREARS</Text>
                            <Text style={styles.gridValue}>{stats.arrears}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Subject Wise List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Subject-wise Marks</Text>
                    <View style={styles.semesterBadge}>
                        <Text style={styles.semesterText}>Semester 6</Text>
                    </View>
                </View>

                <View style={styles.subjectList}>
                    {marksData.map((subject, index) => {
                        const scorePercent = (subject.total / subject.maxScore) * 100;
                        const isFail = scorePercent < 40;
                        const cardStyle = isFail ? styles.dangerCard : (scorePercent < 60 ? styles.warningCard : styles.subjectCard);
                        const color = isFail ? '#ef4444' : (scorePercent < 60 ? '#ca8a04' : '#22c55e');
                        const bgColor = isFail ? '#fef2f2' : (scorePercent < 60 ? '#fefce8' : '#f0fdf4');
                        const icon = isFail ? 'alert' : (scorePercent < 60 ? 'hub-outline' : 'code-tags');

                        return (
                            <TouchableOpacity key={index} style={[styles.subjectCard, cardStyle]}>
                                <View style={styles.subjectHeader}>
                                    <View style={styles.subjectInfo}>
                                        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                                            <MaterialCommunityIcons name={icon} size={24} color={color} />
                                        </View>
                                        <View>
                                            <Text style={styles.subjectName}>{subject.subjectName}</Text>
                                            <Text style={styles.subjectDetails}>{subject.subjectId} • {subject.credits} Credits</Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.percentageText, { color }]}>{subject.total}<Text style={styles.totalText}>/{subject.maxScore}</Text></Text>
                                    </View>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${scorePercent}%`, backgroundColor: color }]} />
                                </View>
                                <View style={styles.breakdownGrid}>
                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>CIA 1</Text>
                                        <Text style={styles.breakdownValue}>{subject.cia1}</Text>
                                    </View>
                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>CIA 2</Text>
                                        <Text style={styles.breakdownValue}>{subject.cia2}</Text>
                                    </View>
                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>Assign</Text>
                                        <Text style={styles.breakdownValue}>{subject.assignment}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {marksData.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#9aa2b1', marginTop: 20 }}>No marks published yet.</Text>
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
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start', gap: 4 },
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
    totalText: { fontSize: 12, fontWeight: 'normal', color: '#9aa2b1' },

    progressBarBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
    progressBarFill: { height: '100%', borderRadius: 3 },

    breakdownGrid: { flexDirection: 'row', gap: 8 },
    breakdownItem: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    breakdownLabel: { fontSize: 10, color: '#9aa2b1', marginBottom: 2 },
    breakdownValue: { fontSize: 12, fontWeight: 'bold', color: '#101318' },

    shortageBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
    shortageText: { color: '#dc2626', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }
});
