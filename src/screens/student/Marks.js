import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                            <Text style={styles.heroValue}>84%</Text>
                            <View style={styles.statusBadge}>
                                <MaterialCommunityIcons name="star" size={14} color="#fde047" />
                                <Text style={styles.statusText}>First Class</Text>
                            </View>
                        </View>
                        <CircularProgress
                            size={100}
                            strokeWidth={8}
                            progress={0.84}
                            color="white"
                            backgroundColor="rgba(255,255,255,0.2)"
                        />
                    </View>

                    <View style={styles.heroGrid}>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>SUBJECTS</Text>
                            <Text style={styles.gridValue}>6</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>PASSED</Text>
                            <Text style={styles.gridValue}>5</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>ARREARS</Text>
                            <Text style={styles.gridValue}>1</Text>
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
                    {/* Subject 1 - Software Engineering */}
                    <TouchableOpacity style={styles.subjectCard}>
                        <View style={styles.subjectHeader}>
                            <View style={styles.subjectInfo}>
                                <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                                    <MaterialCommunityIcons name="code-tags" size={24} color="#16a34a" />
                                </View>
                                <View>
                                    <Text style={styles.subjectName}>Software Engineering</Text>
                                    <Text style={styles.subjectDetails}>CS-302 • 4 Credits</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.percentageText, { color: '#16a34a' }]}>46<Text style={styles.totalText}>/50</Text></Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '92%', backgroundColor: '#22c55e' }]} />
                        </View>
                        <View style={styles.breakdownGrid}>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>CIA 1</Text>
                                <Text style={styles.breakdownValue}>19/20</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>CIA 2</Text>
                                <Text style={styles.breakdownValue}>18/20</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Assign</Text>
                                <Text style={styles.breakdownValue}>09/10</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Subject 2 - Computer Networks */}
                    <TouchableOpacity style={[styles.subjectCard, styles.warningCard]}>
                        <View style={styles.subjectHeader}>
                            <View style={styles.subjectInfo}>
                                <View style={[styles.iconBox, { backgroundColor: '#fefce8' }]}>
                                    <MaterialCommunityIcons name="hub-outline" size={24} color="#ca8a04" />
                                </View>
                                <View>
                                    <Text style={styles.subjectName}>Computer Networks</Text>
                                    <Text style={styles.subjectDetails}>CS-304 • 3 Credits</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.percentageText, { color: '#ca8a04' }]}>35<Text style={styles.totalText}>/50</Text></Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '70%', backgroundColor: '#facc15' }]} />
                        </View>
                        <View style={styles.breakdownGrid}>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>CIA 1</Text>
                                <Text style={styles.breakdownValue}>14/20</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>CIA 2</Text>
                                <Text style={styles.breakdownValue}>13/20</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Assign</Text>
                                <Text style={styles.breakdownValue}>08/10</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Subject 3 - Data Analytics */}
                    <TouchableOpacity style={styles.subjectCard}>
                        <View style={styles.subjectHeader}>
                            <View style={styles.subjectInfo}>
                                <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                                    <MaterialCommunityIcons name="chart-bar" size={24} color="#0055ff" />
                                </View>
                                <View>
                                    <Text style={styles.subjectName}>Data Analytics</Text>
                                    <Text style={styles.subjectDetails}>DA-201 • 3 Credits</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.percentageText, { color: '#0055ff' }]}>42<Text style={styles.totalText}>/50</Text></Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '84%', backgroundColor: '#0055ff' }]} />
                        </View>
                        <View style={styles.breakdownGrid}>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>CIA 1</Text>
                                <Text style={styles.breakdownValue}>18/20</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>CIA 2</Text>
                                <Text style={styles.breakdownValue}>16/20</Text>
                            </View>
                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Assign</Text>
                                <Text style={styles.breakdownValue}>08/10</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Subject 4 - Applied Mathematics */}
                    <TouchableOpacity style={[styles.subjectCard, styles.dangerCard]}>
                        <View style={styles.shortageBadge}>
                            <MaterialCommunityIcons name="alert" size={12} color="#dc2626" />
                            <Text style={styles.shortageText}>Re-Test</Text>
                        </View>
                        <View style={[styles.subjectHeader, { marginTop: 4 }]}>
                            <View style={styles.subjectInfo}>
                                <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                                    <MaterialCommunityIcons name="function-variant" size={24} color="#ef4444" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.subjectName}>Applied Mathematics</Text>
                                    <Text style={styles.subjectDetails}>MA-401 • 4 Credits</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[styles.percentageText, { color: '#ef4444' }]}>19<Text style={styles.totalText}>/50</Text></Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '38%', backgroundColor: '#ef4444' }]} />
                        </View>
                        <View style={[styles.breakdownGrid, { borderColor: '#fecaca', backgroundColor: '#fef2f2' }]}>
                            <View style={[styles.breakdownItem, { borderColor: '#fecaca', backgroundColor: 'transparent' }]}>
                                <Text style={[styles.breakdownLabel, { color: '#f87171' }]}>CIA 1</Text>
                                <Text style={[styles.breakdownValue, { color: '#dc2626' }]}>08/20</Text>
                            </View>
                            <View style={[styles.breakdownItem, { borderColor: '#fecaca', backgroundColor: 'transparent' }]}>
                                <Text style={[styles.breakdownLabel, { color: '#f87171' }]}>CIA 2</Text>
                                <Text style={[styles.breakdownValue, { color: '#dc2626' }]}>07/20</Text>
                            </View>
                            <View style={[styles.breakdownItem, { borderColor: '#fecaca', backgroundColor: 'transparent' }]}>
                                <Text style={[styles.breakdownLabel, { color: '#f87171' }]}>Assign</Text>
                                <Text style={[styles.breakdownValue, { color: '#dc2626' }]}>04/10</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                </View>

                {/* Spacer for bottom bar */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
                        <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Record</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Placements')}>
                        <MaterialCommunityIcons name="briefcase-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="account-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Profile</Text>
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
    shortageText: { color: '#dc2626', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
