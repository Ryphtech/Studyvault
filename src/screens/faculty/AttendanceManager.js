import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, ActivityIndicator, Alert } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getStudentsForAttendance, saveAttendance, getUserProfile } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function AttendanceManager({ route, navigation }) {
    const { user } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [markAllPresent, setMarkAllPresent] = useState(false);
    const [profile, setProfile] = useState(null);

    // Get course info from navigation params
    const courseId = route?.params?.courseId || '';
    const courseName = route?.params?.courseName || '';

    useEffect(() => {
        const init = async () => {
            // Fetch the faculty profile for header display
            if (user?.uid) {
                const profileData = await getUserProfile(user.uid);
                setProfile(profileData);
            }
            if (courseId) {
                const data = await getStudentsForAttendance(courseId);
                setStudents(data);
            }
            setLoading(false);
        };
        init();
    }, []);

    const toggleStatus = (id, newStatus) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    const handleMarkAllToggle = (val) => {
        setMarkAllPresent(val);
        if (val) {
            setStudents(prev => prev.map(s => ({ ...s, status: 'P' })));
        }
    };

    // Calculate Summary
    const summary = students.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, { P: 0, A: 0, L: 0 });

    const handleSubmit = async () => {
        setSaving(true);
        const success = await saveAttendance(courseId, courseName, new Date(), students);
        setSaving(false);

        if (success) {
            Alert.alert("Success", "Attendance saved successfully!");
            navigation.goBack();
        } else {
            Alert.alert("Error", "Failed to save attendance. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: profile?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' }} style={styles.facultyAvatar} />
                        <View style={styles.activeDot} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{profile?.name || 'Faculty'}</Text>
                        <Text style={styles.headerSubtitle}>{courseName || 'Select a course'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#101318" />
                </TouchableOpacity>
            </View>

            {/* Date Chips */}
            <View style={styles.dateSelectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContent}>
                    <TouchableOpacity style={styles.dateChipActive}>
                        <Text style={styles.dateChipLabelActive}>TODAY</Text>
                        <Text style={styles.dateChipValueActive}>12 Oct</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateChip}>
                        <Text style={styles.dateChipLabel}>TOMORROW</Text>
                        <Text style={styles.dateChipValue}>13 Oct</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateChip}>
                        <Text style={styles.dateChipLabel}>TUE</Text>
                        <Text style={styles.dateChipValue}>14 Oct</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateChip}>
                        <Text style={styles.dateChipLabel}>WED</Text>
                        <Text style={styles.dateChipValue}>15 Oct</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Active Class Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Current Class</Text>
                    <View style={styles.activeNowBadge}>
                        <Text style={styles.activeNowText}>Active Now</Text>
                    </View>
                </View>

                <View style={styles.classCard}>
                    <View style={styles.classCardTop}>
                        <View style={styles.classInfo}>
                            <View style={styles.classIconBox}>
                                <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#0055ff" />
                            </View>
                            <View>
                                <Text style={styles.className}>Computer Networks</Text>
                                <Text style={styles.classDetails}>CS-302 • Semester 5</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.moreButton}>
                            <MaterialCommunityIcons name="dots-horizontal" size={20} color="#5e6d8d" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.classMetaGrid}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="clock-outline" size={18} color="#5e6d8d" />
                            <Text style={styles.metaText}>09:00 - 10:00 AM</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="map-marker-outline" size={18} color="#5e6d8d" />
                            <Text style={styles.metaText}>Room 402</Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>STATUS</Text>
                            <Text style={styles.statusValuePending}>Attendance Pending</Text>
                        </View>
                        <View style={styles.dividerVertical} />
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statusLabel}>TOTAL STUDENTS</Text>
                            <Text style={styles.statusValueNormal}>{students.length}</Text>
                        </View>
                    </View>
                </View>

                {/* Roster Section */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Student Roster</Text>
                    <TouchableOpacity style={styles.searchButton}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#5e6d8d" />
                    </TouchableOpacity>
                </View>

                {/* Controls */}
                <View style={styles.controlsCard}>
                    <Text style={styles.controlText}>Mark all present</Text>
                    <Switch value={markAllPresent} onValueChange={handleMarkAllToggle} color="#0055ff" />
                </View>

                {/* Student List */}
                <View style={styles.studentList}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#0055ff" style={{ marginTop: 40 }} />
                    ) : (
                        students.map((student) => (
                            <View
                                key={student.id}
                                style={[
                                    styles.studentRow,
                                    student.status === 'A' && styles.studentRowAbsent
                                ]}
                            >
                                <View style={styles.studentInfo}>
                                    {student.avatar ? (
                                        <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
                                    ) : (
                                        <View style={[styles.studentAvatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }]}>
                                            <Text style={{ color: '#475569', fontWeight: 'bold' }}>{student.name.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentRoll}>Roll No: {student.roll}</Text>
                                    </View>
                                </View>

                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, student.status === 'P' && styles.toggleBtnPresent]}
                                        onPress={() => toggleStatus(student.id, 'P')}
                                    >
                                        <Text style={[styles.toggleText, student.status === 'P' && styles.toggleTextActive]}>P</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, student.status === 'A' && styles.toggleBtnAbsent]}
                                        onPress={() => toggleStatus(student.id, 'A')}
                                    >
                                        <Text style={[styles.toggleText, student.status === 'A' && styles.toggleTextActive]}>A</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, student.status === 'L' && styles.toggleBtnLeave]}
                                        onPress={() => toggleStatus(student.id, 'L')}
                                    >
                                        <Text style={[styles.toggleText, student.status === 'L' && styles.toggleTextActive]}>L</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Upcoming Teaser */}
                <View style={{ marginTop: 24, opacity: 0.6 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Upcoming Later</Text>
                    <View style={styles.upcomingCard}>
                        <View style={styles.upcomingIconBox}>
                            <MaterialCommunityIcons name="database" size={24} color="#6b7280" />
                        </View>
                        <View>
                            <Text style={styles.upcomingTitle}>Database Systems (CS-304)</Text>
                            <Text style={styles.upcomingSubtitle}>11:00 AM • Room 101</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomActionBar}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Summary</Text>
                    <View style={styles.summaryStats}>
                        <Text style={styles.statPresent}>P: {summary.P}</Text>
                        <View style={styles.statDot} />
                        <Text style={styles.statAbsent}>A: {summary.A}</Text>
                        <View style={styles.statDot} />
                        <Text style={styles.statLeave}>L: {summary.L}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.submitButton, saving && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={saving || loading}
                >
                    {saving ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color="white" />
                    )}
                    <Text style={styles.submitButtonText}>{saving ? 'Saving...' : 'Submit Attendance'}</Text>
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

    dateSelectorContainer: { backgroundColor: 'white', paddingBottom: 16, paddingTop: 8, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
    dateSelectorContent: { paddingHorizontal: 16, gap: 12 },
    dateChipActive: { backgroundColor: '#0055ff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', minWidth: 80, shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    dateChipLabelActive: { color: 'white', fontSize: 10, fontWeight: '500', opacity: 0.8 },
    dateChipValueActive: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    dateChip: { backgroundColor: '#f5f5f5', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', minWidth: 80 },
    dateChipLabel: { color: '#5e6d8d', fontSize: 10, fontWeight: '500' },
    dateChipValue: { color: '#101318', fontSize: 14, fontWeight: 'bold' },

    scrollContent: { padding: 16 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318' },
    activeNowBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    activeNowText: { color: '#15803d', fontSize: 10, fontWeight: 'bold' },
    searchButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },

    classCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
    classCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    classInfo: { flexDirection: 'row', gap: 16 },
    classIconBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    className: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 4 },
    classDetails: { fontSize: 14, color: '#5e6d8d', fontWeight: '500' },
    moreButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },

    classMetaGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f5f6f8', padding: 8, borderRadius: 8 },
    metaText: { fontSize: 14, color: '#5e6d8d', fontWeight: '500' },

    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#dbeafe' },
    statusLabel: { fontSize: 10, color: '#5e6d8d', fontWeight: 'bold', marginBottom: 2 },
    statusValuePending: { fontSize: 14, fontWeight: 'bold', color: '#0055ff' },
    statusValueNormal: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    dividerVertical: { width: 1, height: 32, backgroundColor: 'rgba(0,85,255,0.2)' },

    controlsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
    controlText: { fontSize: 14, fontWeight: '500', color: '#101318' },

    studentList: { gap: 12 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
    studentRowAbsent: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' },
    studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
    studentName: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    studentRoll: { fontSize: 12, color: '#5e6d8d' },

    toggleContainer: { flexDirection: 'row', backgroundColor: '#f5f6f8', borderRadius: 20, padding: 4, gap: 4 },
    toggleBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    toggleBtnPresent: { backgroundColor: '#22c55e', shadowColor: '#22c55e', shadowOpacity: 0.3, elevation: 2 },
    toggleBtnAbsent: { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 0.3, elevation: 2 },
    toggleBtnLeave: { backgroundColor: '#eab308', shadowColor: '#eab308', shadowOpacity: 0.3, elevation: 2 },
    toggleText: { fontSize: 12, fontWeight: 'bold', color: '#5e6d8d' },
    toggleTextActive: { color: 'white' },

    upcomingCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'white', padding: 16, borderRadius: 12 },
    upcomingIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    upcomingTitle: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    upcomingSubtitle: { fontSize: 12, color: '#5e6d8d' },

    bottomActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#f3f4f6', padding: 16, paddingBottom: 24, flexDirection: 'row', gap: 16, alignItems: 'center' },
    summaryContainer: { flex: 1 },
    summaryLabel: { fontSize: 10, color: '#5e6d8d', fontWeight: '500' },
    summaryStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statPresent: { fontSize: 14, fontWeight: 'bold', color: '#15803d' },
    statAbsent: { fontSize: 14, fontWeight: 'bold', color: '#b91c1c' },
    statLeave: { fontSize: 14, fontWeight: 'bold', color: '#a16207' },
    statDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#d1d5db' },

    submitButton: { flex: 1.5, backgroundColor: '#0055ff', height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    submitButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' }

});
