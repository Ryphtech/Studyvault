import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock Data
const initialStudents = [
    { id: 124, name: 'Sarah Jenks', roll: '124', marks: '42', maxMarks: 50, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 125, name: 'Michael Chen', roll: '125', marks: '38', maxMarks: 50, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 126, name: 'Emily Davis', roll: '126', marks: '', maxMarks: 50, avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 127, name: 'David Wilson', roll: '127', marks: '48', maxMarks: 50, avatar: 'https://randomuser.me/api/portraits/men/85.jpg' },
    { id: 128, name: 'James Dean', roll: '128', marks: '12', maxMarks: 50, avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
];

const assessmentTypes = ['Internal 1', 'Internal 2', 'Assignment', 'Lab'];

export default function MarksUpload({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('Internal 1');
    const [students, setStudents] = useState(initialStudents);
    const [classAverage, setClassAverage] = useState(0);

    useEffect(() => {
        calculateAverage();
    }, [students]);

    const calculateAverage = () => {
        let totalMarks = 0;
        let count = 0;
        students.forEach(s => {
            if (s.marks !== '') {
                totalMarks += (parseInt(s.marks) / s.maxMarks) * 100;
                count++;
            }
        });
        setClassAverage(count > 0 ? Math.round(totalMarks / count) : 0);
    };

    const handleMarkChange = (id, text) => {
        // Allow empty string or numbers only
        if (text === '' || /^\d+$/.test(text)) {
            // Check max marks constraint
            if (text !== '' && parseInt(text) > 50) return;

            setStudents(prev => prev.map(s => s.id === id ? { ...s, marks: text } : s));
        }
    };

    const getPercentage = (marks, max) => {
        if (!marks) return '-';
        return Math.round((parseInt(marks) / max) * 100) + '%';
    };

    const getScoreColor = (percentage) => {
        if (percentage === '-') return '#5e6d8d';
        const val = parseInt(percentage);
        if (val >= 75) return '#22c55e'; // Success
        if (val >= 40) return '#0055ff'; // Primary
        return '#ef4444'; // Danger
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.facultyAvatar} />
                        <View style={styles.activeDot} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Prof. Anderson</Text>
                        <Text style={styles.headerSubtitle}>Faculty ID: F-204</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#101318" />
                </TouchableOpacity>
            </View>

            {/* Assessment Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                    {assessmentTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.tabChip, selectedTab === type && styles.tabChipActive]}
                            onPress={() => setSelectedTab(type)}
                        >
                            <Text style={[styles.tabText, selectedTab === type && styles.tabTextActive]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Subject Details */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Subject Details</Text>
                    <View style={styles.badgeBlue}>
                        <Text style={styles.badgeBlueText}>Marks Entry</Text>
                    </View>
                </View>

                <View style={styles.subjectCard}>
                    <View style={styles.subjectCardTop}>
                        <View style={styles.subjectInfo}>
                            <View style={styles.classIconBox}>
                                <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#0055ff" />
                            </View>
                            <View>
                                <Text style={styles.subjectName}>Computer Networks</Text>
                                <Text style={styles.subjectDetails}>CS-302 • Semester 5</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <MaterialCommunityIcons name="dots-horizontal" size={20} color="#5e6d8d" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="calendar-today" size={18} color="#5e6d8d" />
                            <Text style={styles.metaText}>Fall 2023</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="account-group" size={18} color="#5e6d8d" />
                            <Text style={styles.metaText}>Batch A</Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>STATUS</Text>
                            <Text style={styles.statusValueWarning}>In Progress</Text>
                        </View>
                        <View style={styles.dividerVertical} />
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statusLabel}>MAX MARKS</Text>
                            <Text style={styles.statusValueNormal}>50</Text>
                        </View>
                    </View>
                </View>

                {/* Marks Entry List */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Student Marks</Text>
                    <TouchableOpacity style={styles.searchButton}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#5e6d8d" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeadLeft}>Student Name</Text>
                    <View style={styles.tableHeadRight}>
                        <Text style={[styles.tableHeadText, { width: 48, textAlign: 'center' }]}>Score</Text>
                        <Text style={[styles.tableHeadText, { width: 40, textAlign: 'center' }]}>%</Text>
                    </View>
                </View>

                <View style={styles.studentList}>
                    {students.map((student) => (
                        <View key={student.id} style={styles.studentRow}>
                            <View style={styles.studentInfo}>
                                <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
                                <View>
                                    <Text style={styles.studentName}>{student.name}</Text>
                                    <Text style={styles.studentRoll}>Roll No: {student.roll}</Text>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        getPercentage(student.marks, student.maxMarks) !== '-' && parseInt(getPercentage(student.marks, student.maxMarks)) < 40 && styles.inputDanger
                                    ]}
                                    value={student.marks}
                                    onChangeText={(text) => handleMarkChange(student.id, text)}
                                    placeholder="-"
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <View style={styles.percentageBox}>
                                    <Text style={[
                                        styles.percentageText,
                                        { color: getScoreColor(getPercentage(student.marks, student.maxMarks)) }
                                    ]}>
                                        {getPercentage(student.marks, student.maxMarks)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomActionBar}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Class Average</Text>
                    <View style={styles.summaryStats}>
                        <Text style={styles.averageValue}>{classAverage}%</Text>
                        <View style={styles.trendBadge}>
                            <MaterialCommunityIcons name="trending-up" size={14} color="#15803d" />
                            <Text style={styles.trendText}>+2%</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.saveButton}>
                    <MaterialCommunityIcons name="content-save-outline" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Save Marks</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingTop: 40 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative' },
    facultyAvatar: { width: 40, height: 40, borderRadius: 20 },
    activeDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    headerSubtitle: { fontSize: 12, color: '#5e6d8d' },
    notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },

    tabContainer: { backgroundColor: 'white', paddingBottom: 16, paddingTop: 8, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    tabContent: { paddingHorizontal: 16, gap: 12 },
    tabChip: { backgroundColor: '#f5f5f5', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', minWidth: 80 },
    tabChipActive: { backgroundColor: '#0055ff', shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    tabText: { color: '#101318', fontSize: 14, fontWeight: 'bold' },
    tabTextActive: { color: 'white' },

    scrollContent: { padding: 16 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318' },
    badgeBlue: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeBlueText: { color: '#1d4ed8', fontSize: 10, fontWeight: 'bold' },
    searchButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },

    subjectCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
    subjectCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    subjectInfo: { flexDirection: 'row', gap: 16 },
    classIconBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    subjectName: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 4 },
    subjectDetails: { fontSize: 14, color: '#5e6d8d', fontWeight: '500' },
    moreButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },

    metaGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f5f6f8', padding: 8, borderRadius: 8 },
    metaText: { fontSize: 14, color: '#5e6d8d', fontWeight: '500' },

    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#dbeafe' },
    statusLabel: { fontSize: 10, color: '#5e6d8d', fontWeight: 'bold', marginBottom: 2 },
    statusValueWarning: { fontSize: 14, fontWeight: 'bold', color: '#eab308' },
    statusValueNormal: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    dividerVertical: { width: 1, height: 32, backgroundColor: 'rgba(0,85,255,0.2)' },

    tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 8 },
    tableHeadLeft: { fontSize: 10, fontWeight: 'bold', color: '#5e6d8d', textTransform: 'uppercase' },
    tableHeadRight: { flexDirection: 'row', gap: 24, marginRight: 8 },
    tableHeadText: { fontSize: 10, fontWeight: 'bold', color: '#5e6d8d', textTransform: 'uppercase' },

    studentList: { gap: 12 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
    studentName: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    studentRoll: { fontSize: 12, color: '#5e6d8d' },

    inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    input: { width: 56, height: 40, borderRadius: 8, backgroundColor: '#f5f6f8', textAlign: 'center', fontWeight: 'bold', color: '#101318', borderWidth: 1, borderColor: '#e5e7eb' },
    inputDanger: { backgroundColor: '#fef2f2', borderColor: '#fee2e2', color: '#ef4444' },
    percentageBox: { width: 40, alignItems: 'center' },
    percentageText: { fontSize: 14, fontWeight: 'bold' },

    bottomActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#f3f4f6', padding: 16, paddingBottom: 24, flexDirection: 'row', gap: 16, alignItems: 'center' },
    summaryContainer: { flex: 1 },
    summaryLabel: { fontSize: 10, color: '#5e6d8d', fontWeight: '500' },
    summaryStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    averageValue: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 2 },
    trendText: { fontSize: 12, fontWeight: 'bold', color: '#15803d' },

    saveButton: { flex: 1.5, backgroundColor: '#0055ff', height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    saveButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' }

});
