import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, getFacultyCourses, getStudentsForMarksEntry, saveMarksForCourse, getMarksForCourse } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

const DEFAULT_TESTS = ['Internal 1', 'Internal 2', 'Assignment', 'Lab'];
const DEFAULT_MAX = 50;

export default function MarksUpload({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [assessmentTypes, setAssessmentTypes] = useState(DEFAULT_TESTS);
    const [selectedTab, setSelectedTab] = useState('Internal 1');
    const [students, setStudents] = useState([]);
    const [classAverage, setClassAverage] = useState(0);
    const [maxMarksMap, setMaxMarksMap] = useState(() => {
        const m = {}; DEFAULT_TESTS.forEach(t => m[t] = DEFAULT_MAX); return m;
    });
    const [showAddTest, setShowAddTest] = useState(false);
    const [newTestName, setNewTestName] = useState('');
    const [newTestMax, setNewTestMax] = useState('50');
    const [editingMaxMarks, setEditingMaxMarks] = useState(false);

    // Fetch faculty profile and courses
    useEffect(() => {
        const init = async () => {
            try {
                const facultyId = user?.id;
                if (!facultyId) { setLoading(false); return; }
                const [profileData, coursesData] = await Promise.all([
                    getUserProfile(facultyId),
                    getFacultyCourses(facultyId)
                ]);
                setProfile(profileData);
                setCourses(coursesData);

                if (coursesData.length > 0) {
                    setSelectedCourse(coursesData[0]);
                }

                // Fetch students in the department
                const dept = profileData?.department || 'Computer Science';
                const studentList = await getStudentsForMarksEntry(dept);
                setStudents(studentList);
            } catch (error) {
                console.error("Error initializing MarksUpload:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const currentMax = maxMarksMap[selectedTab] || DEFAULT_MAX;

    // Fetch existing marks when course or tab changes
    useEffect(() => {
        const fetchExistingMarks = async () => {
            if (!selectedCourse || students.length === 0) return;
            const courseId = selectedCourse.code || selectedCourse.subjectCode;
            if (!courseId) return;

            const existingMarks = await getMarksForCourse(courseId, selectedTab);
            
            if (existingMarks && existingMarks.length > 0) {
                const marksMap = {};
                let foundMax = currentMax;
                existingMarks.forEach(m => {
                    marksMap[m.student_id] = String(m.score);
                    foundMax = m.max_score;
                });
                
                setMaxMarksMap(prev => ({ ...prev, [selectedTab]: foundMax }));
                setStudents(prev => prev.map(s => ({ ...s, marks: marksMap[s.id] !== undefined ? marksMap[s.id] : '' })));
                
                // If it's a custom test that was loaded, add it to assessmentTypes if not there
                if (!assessmentTypes.includes(selectedTab)) {
                    setAssessmentTypes(prev => [...prev, selectedTab]);
                }
            } else {
                setStudents(prev => prev.map(s => ({ ...s, marks: '' })));
            }
        };
        fetchExistingMarks();
    }, [selectedCourse, selectedTab]);

    // Recalculate average when students or tab change
    useEffect(() => {
        let totalMarks = 0;
        let count = 0;
        students.forEach(s => {
            if (s.marks !== '' && s.marks !== undefined) {
                totalMarks += (parseInt(s.marks) / currentMax) * 100;
                count++;
            }
        });
        setClassAverage(count > 0 ? Math.round(totalMarks / count) : 0);
    }, [students, selectedTab, maxMarksMap]);

    const handleMarkChange = (id, text) => {
        if (text === '' || /^\d+$/.test(text)) {
            if (text !== '' && parseInt(text) > currentMax) return;
            setStudents(prev => prev.map(s => s.id === id ? { ...s, marks: text } : s));
        }
    };

    const handleAddTest = () => {
        const name = newTestName.trim();
        if (!name) { Alert.alert('Error', 'Enter a test name.'); return; }
        if (assessmentTypes.includes(name)) { Alert.alert('Error', 'Test already exists.'); return; }
        const max = parseInt(newTestMax) || DEFAULT_MAX;
        setAssessmentTypes(prev => [...prev, name]);
        setMaxMarksMap(prev => ({ ...prev, [name]: max }));
        setSelectedTab(name);
        setStudents(prev => prev.map(s => ({ ...s, marks: '' })));
        setNewTestName(''); setNewTestMax('50'); setShowAddTest(false);
    };

    const handleDeleteTest = (name) => {
        if (DEFAULT_TESTS.includes(name)) { Alert.alert('Info', 'Cannot delete default tests.'); return; }
        Alert.alert('Delete Test', `Remove "${name}"?`, [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
                setAssessmentTypes(prev => prev.filter(t => t !== name));
                setMaxMarksMap(prev => { const m = { ...prev }; delete m[name]; return m; });
                if (selectedTab === name) setSelectedTab(assessmentTypes[0]);
            }}
        ]);
    };

    const handleSaveMarks = async () => {
        if (!selectedCourse) {
            Alert.alert("Error", "No course selected.");
            return;
        }

        const studentsWithMarks = students.filter(s => s.marks !== '' && s.marks !== undefined);
        if (studentsWithMarks.length === 0) {
            Alert.alert("Error", "Enter marks for at least one student.");
            return;
        }

        setSaving(true);
        const result = await saveMarksForCourse({
            courseId: selectedCourse.code || selectedCourse.subjectCode || 'UNKNOWN',
            courseName: selectedCourse.name || selectedCourse.subjectName || 'Unknown Course',
            assessmentType: selectedTab,
            facultyId: user?.id || '',
            facultyName: profile?.name || 'Faculty',
            students: studentsWithMarks.map(s => ({ ...s, maxMarks: currentMax })),
        });
        setSaving(false);

        if (result.success) {
            Alert.alert("Success", `Marks saved for ${studentsWithMarks.length} student(s) in ${selectedTab}.`, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Error", "Failed to save marks. Please try again.");
        }
    };

    const getPercentage = (marks) => {
        if (!marks) return '-';
        return Math.round((parseInt(marks) / currentMax) * 100) + '%';
    };

    const getScoreColor = (percentage) => {
        if (percentage === '-') return '#5e6d8d';
        const val = parseInt(percentage);
        if (val >= 75) return '#22c55e';
        if (val >= 40) return '#0055ff';
        return '#ef4444';
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading students...</Text>
            </View>
        );
    }

    const facultyName = profile?.name || 'Faculty';
    const courseName = selectedCourse?.name || selectedCourse?.subjectName || 'Select a course';
    const courseCode = selectedCourse?.code || selectedCourse?.subjectCode || '---';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <View style={styles.avatarContainer}>
                        <View style={styles.facultyAvatarCircle}>
                            <Text style={styles.avatarInitial}>{facultyName.charAt(0)}</Text>
                        </View>
                        <View style={styles.activeDot} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{facultyName}</Text>
                        <Text style={styles.headerSubtitle}>{profile?.department || 'Faculty'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#101318" />
                </TouchableOpacity>
            </View>

            {/* Course Selector (if multiple courses) */}
            {courses.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseSelector} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                    {courses.map((course, i) => (
                        <TouchableOpacity
                            key={course.id || i}
                            style={[styles.courseChip, selectedCourse?.id === course.id && styles.courseChipActive]}
                            onPress={() => setSelectedCourse(course)}
                        >
                            <Text style={[styles.courseChipText, selectedCourse?.id === course.id && styles.courseChipTextActive]}>
                                {course.name || course.subjectName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Assessment Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                    {assessmentTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.tabChip, selectedTab === type && styles.tabChipActive]}
                            onPress={() => setSelectedTab(type)}
                            onLongPress={() => handleDeleteTest(type)}
                        >
                            <Text style={[styles.tabText, selectedTab === type && styles.tabTextActive]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.addTabChip} onPress={() => setShowAddTest(true)}>
                        <MaterialCommunityIcons name="plus" size={18} color="#0055ff" />
                        <Text style={styles.addTabText}>Add</Text>
                    </TouchableOpacity>
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
                                <Text style={styles.subjectName}>{courseName}</Text>
                                <Text style={styles.subjectDetails}>{courseCode} • {selectedCourse?.semester || 'Semester'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <View>
                            <Text style={styles.statusLabel}>ASSESSMENT</Text>
                            <Text style={styles.statusValueWarning}>{selectedTab}</Text>
                        </View>
                        <View style={styles.dividerVertical} />
                        <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={() => setEditingMaxMarks(true)}>
                            <Text style={styles.statusLabel}>MAX MARKS</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={styles.statusValueNormal}>{currentMax}</Text>
                                <MaterialCommunityIcons name="pencil-outline" size={14} color="#0055ff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Marks Entry List */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Student Marks</Text>
                    <Text style={styles.countBadge}>{students.length} students</Text>
                </View>

                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeadLeft}>Student Name</Text>
                    <View style={styles.tableHeadRight}>
                        <Text style={[styles.tableHeadText, { width: 48, textAlign: 'center' }]}>Score</Text>
                        <Text style={[styles.tableHeadText, { width: 40, textAlign: 'center' }]}>%</Text>
                    </View>
                </View>

                {students.length > 0 ? (
                    <View style={styles.studentList}>
                        {students.map((student) => (
                            <View key={student.id} style={styles.studentRow}>
                                <View style={styles.studentInfo}>
                                    <View style={styles.studentAvatarCircle}>
                                        <Text style={styles.studentAvatarText}>{(student.name || 'U').charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentRoll}>Roll: {student.roll}</Text>
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            getPercentage(student.marks) !== '-' && parseInt(getPercentage(student.marks)) < 40 && styles.inputDanger
                                        ]}
                                        value={student.marks}
                                        onChangeText={(text) => handleMarkChange(student.id, text)}
                                        placeholder="-"
                                        keyboardType="numeric"
                                        maxLength={String(currentMax).length}
                                    />
                                    <View style={styles.percentageBox}>
                                        <Text style={[
                                            styles.percentageText,
                                            { color: getScoreColor(getPercentage(student.marks)) }
                                        ]}>
                                            {getPercentage(student.marks)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-group-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No students found</Text>
                        <Text style={styles.emptySubtitle}>No students in this department yet</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Action Bar */}
            <View style={styles.bottomActionBar}>
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Class Average</Text>
                    <Text style={styles.averageValue}>{classAverage}%</Text>
                </View>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveMarks} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="content-save-outline" size={20} color="white" />
                            <Text style={styles.saveButtonText}>Save Marks</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Add Test Modal */}
            <Modal visible={showAddTest} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddTest(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Add New Test</Text>
                        <View style={{ gap: 12 }}>
                            <View>
                                <Text style={styles.modalLabel}>Test Name</Text>
                                <TextInput style={styles.modalInput} value={newTestName} onChangeText={setNewTestName} placeholder="e.g. Midterm, Quiz 1" placeholderTextColor="#9ca3af" />
                            </View>
                            <View>
                                <Text style={styles.modalLabel}>Max Marks</Text>
                                <TextInput style={styles.modalInput} value={newTestMax} onChangeText={setNewTestMax} keyboardType="numeric" placeholder="50" placeholderTextColor="#9ca3af" />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddTest(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddTest}>
                                <Text style={styles.modalAddText}>Add Test</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Edit Max Marks Modal */}
            <Modal visible={editingMaxMarks} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditingMaxMarks(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Edit Max Marks</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {assessmentTypes.map(type => (
                                <View key={type} style={styles.maxMarksRow}>
                                    <Text style={styles.maxMarksLabel}>{type}</Text>
                                    <TextInput
                                        style={styles.maxMarksInput}
                                        value={String(maxMarksMap[type] || DEFAULT_MAX)}
                                        onChangeText={t => setMaxMarksMap(prev => ({ ...prev, [type]: parseInt(t) || 0 }))}
                                        keyboardType="numeric"
                                        maxLength={3}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={[styles.modalAddBtn, { marginTop: 16 }]} onPress={() => { setStudents(prev => prev.map(s => ({ ...s, marks: '' }))); setEditingMaxMarks(false); }}>
                            <Text style={styles.modalAddText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingTop: 55 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative' },
    facultyAvatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: 16, fontWeight: '700', color: 'white' },
    activeDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    headerSubtitle: { fontSize: 12, color: '#5e6d8d' },
    notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },

    courseSelector: { backgroundColor: 'white', paddingVertical: 12, maxHeight: 56 },
    courseChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    courseChipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff' },
    courseChipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    courseChipTextActive: { color: 'white' },

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
    countBadge: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },

    subjectCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
    subjectCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    subjectInfo: { flexDirection: 'row', gap: 16 },
    classIconBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    subjectName: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 4 },
    subjectDetails: { fontSize: 14, color: '#5e6d8d', fontWeight: '500' },

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
    studentAvatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
    studentAvatarText: { fontSize: 16, fontWeight: '700', color: '#475569' },
    studentName: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    studentRoll: { fontSize: 12, color: '#5e6d8d' },

    inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    input: { width: 56, height: 40, borderRadius: 8, backgroundColor: '#f5f6f8', textAlign: 'center', fontWeight: 'bold', color: '#101318', borderWidth: 1, borderColor: '#e5e7eb' },
    inputDanger: { backgroundColor: '#fef2f2', borderColor: '#fee2e2', color: '#ef4444' },
    percentageBox: { width: 40, alignItems: 'center' },
    percentageText: { fontSize: 14, fontWeight: 'bold' },

    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: '#cbd5e1', marginTop: 4 },

    bottomActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#f3f4f6', padding: 16, paddingBottom: 24, flexDirection: 'row', gap: 16, alignItems: 'center' },
    summaryContainer: { flex: 1 },
    summaryLabel: { fontSize: 10, color: '#5e6d8d', fontWeight: '500' },
    averageValue: { fontSize: 18, fontWeight: 'bold', color: '#101318' },

    saveButton: { flex: 1.5, backgroundColor: '#0055ff', height: 48, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    saveButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

    addTabChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#dbeafe', borderStyle: 'dashed' },
    addTabText: { color: '#0055ff', fontSize: 13, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318', marginBottom: 16 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#5e6d8d', marginBottom: 6, marginLeft: 2 },
    modalInput: { backgroundColor: '#f5f6f8', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#101318' },
    modalCancelBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6f8' },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: '#5e6d8d' },
    modalAddBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0055ff' },
    modalAddText: { fontSize: 15, fontWeight: 'bold', color: 'white' },

    maxMarksRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    maxMarksLabel: { fontSize: 15, fontWeight: '600', color: '#101318', flex: 1 },
    maxMarksInput: { width: 64, height: 40, borderRadius: 8, backgroundColor: '#f5f6f8', textAlign: 'center', fontWeight: 'bold', color: '#101318', borderWidth: 1, borderColor: '#e5e7eb', fontSize: 16 },
});
