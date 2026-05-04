import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFacultyCourses, assignCourseToFaculty, removeCourseFromFaculty, getAllCurriculumSubjects } from '../../services/supabaseService';

export default function AssignFacultySubject({ route, navigation }) {
    const { faculty } = route.params || {};
    const insets = useSafeAreaInsets();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Use passed faculty or fallback to dummy
    const facultyId = faculty?.uid || 'dummy_fac';
    const facultyName = faculty?.name || 'Dr. Robert Chen';
    const facultyDept = faculty?.department || 'CS Dept';
    const facultyRole = faculty?.designation || 'Senior Professor';
    const facultyAvatar = faculty?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg';

    useEffect(() => {
        const fetchAssignments = async () => {
            if (faculty?.uid) {
                const data = await getFacultyCourses(faculty.uid);
                setAssignments(data);
            }
            setLoading(false);
        };
        fetchAssignments();
    }, [faculty]);

    // Curriculum Selection States
    const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical', 'Civil', 'Business'];
    const semesters = Array.from({ length: 8 }, (_, i) => `Sem ${i + 1}`);

    const [selectedDepartment, setSelectedDepartment] = useState('Computer Science');
    const [selectedSemester, setSelectedSemester] = useState('Sem 1');
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const [batch, setBatch] = useState('2024-A');

    useEffect(() => {
        let isMounted = true;
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            const data = await getAllCurriculumSubjects(selectedDepartment);
            if (isMounted) {
                setAvailableSubjects(data);
                setSelectedSubject(null);
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
        return () => { isMounted = false; };
    }, [selectedDepartment]);

    useEffect(() => {
        setFilteredSubjects(availableSubjects.filter(s => s.semester === selectedSemester));
    }, [availableSubjects, selectedSemester]);

    const handleAssign = async () => {
        if (!selectedSubject || !selectedSemester || !batch) {
            Alert.alert("Missing Details", "Please select a subject and fill batch.");
            return;
        }

        setSaving(true);
        const newAssignment = {
            name: selectedSubject.name || 'Unknown',
            code: selectedSubject.code || 'CODE',
            semester: selectedSemester.replace('Sem ', '') || '1',
            batch: batch || '',
            credits: selectedSubject.credits || '0',
            icon: selectedSubject.icon || 'book-open-page-variant',
            facultyId: facultyId || 'dummy_fac'
        };

        try {
            const savedCourse = await assignCourseToFaculty(newAssignment);
            // Append and sort or just append
            setAssignments(prev => [...prev, savedCourse]);
            setSelectedSubject(null);
        } catch (e) {
            console.error("Assignment error:", e);
            Alert.alert("Error", "Could not assign subject. Please check console for details.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Remove Subject",
            "Are you sure you want to unassign this subject?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        const success = await removeCourseFromFaculty(id);
                        if (success) {
                            setAssignments(assignments.filter(a => a.id !== id));
                        } else {
                            Alert.alert("Error", "Failed to remove subject.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Assign Subjects</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="more-horiz" size={24} color="#475569" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Faculty Selection Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SELECT FACULTY MEMBER</Text>
                    <View style={styles.facultyCard}>
                        <View style={styles.avatarWrapper}>
                            <Image source={{ uri: facultyAvatar }} style={styles.avatarImage} />
                            <View style={styles.activeDot} />
                        </View>
                        <View style={styles.facultyInfo}>
                            <Text style={styles.facultyName}>{facultyName}</Text>
                            <Text style={styles.facultyDetails}>{facultyRole} • {facultyDept}</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changeBtnText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Assignment Form Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assign New Subject</Text>
                    <View style={styles.formCard}>

                        {/* Department Selector */}
                        <Text style={styles.inputLabel}>Department</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                            {departments.map(dept => {
                                const isActive = selectedDepartment === dept;
                                return (
                                    <TouchableOpacity
                                        key={dept}
                                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                                        onPress={() => setSelectedDepartment(dept)}
                                    >
                                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{dept}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Semester Selector */}
                        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Semester</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                            {semesters.map(sem => {
                                const isActive = selectedSemester === sem;
                                return (
                                    <TouchableOpacity
                                        key={sem}
                                        style={[styles.filterChip, isActive && styles.filterChipActive]}
                                        onPress={() => {
                                            setSelectedSemester(sem);
                                            setSelectedSubject(null);
                                        }}
                                    >
                                        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{sem}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Select Subject</Text>
                        {loadingSubjects ? (
                            <ActivityIndicator size="small" color="#0055ff" style={{ marginVertical: 10 }} />
                        ) : filteredSubjects.length === 0 ? (
                            <Text style={{ color: '#64748b', fontStyle: 'italic', marginBottom: 12 }}>No subjects found for {selectedSemester}.</Text>
                        ) : (
                            <View style={styles.subjectGrid}>
                                {filteredSubjects.map(sub => {
                                    const isActive = selectedSubject?.id === sub.id;
                                    return (
                                        <TouchableOpacity
                                            key={sub.id}
                                            style={[styles.subjectOption, isActive && styles.subjectOptionActive]}
                                            onPress={() => setSelectedSubject(sub)}
                                        >
                                            <MaterialCommunityIcons name={sub.icon || 'book'} size={18} color={isActive ? '#0055ff' : '#64748b'} />
                                            <Text style={[styles.subjectOptionText, isActive && styles.subjectOptionTextActive]}>
                                                {sub.code} - {sub.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        <Text style={[styles.inputLabel, { marginTop: 16 }]}>Batch / Section</Text>
                        <View style={styles.selectWrapper}>
                            <TextInput
                                style={styles.selectInput}
                                value={batch}
                                onChangeText={setBatch}
                                placeholder="e.g. 2024-A, Section A"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <TouchableOpacity style={styles.assignButton} onPress={handleAssign} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <MaterialIcons name="add-circle" size={20} color="white" />
                                    <Text style={styles.assignButtonText}>Assign Subject</Text>
                                </>
                            )}
                        </TouchableOpacity>

                    </View>
                </View>

                {/* Current Assignments List */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.assignHeader}>
                        <Text style={styles.sectionTitle}>Current Assignments</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{assignments.length} SUBJECTS</Text>
                        </View>
                    </View>

                    <View style={styles.assignmentList}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#0055ff" style={{ marginVertical: 20 }} />
                        ) : (
                            <>
                                {assignments.map((item, index) => {
                                    // Determine colors based on index for variety like the HTML
                                    const colorSets = [
                                        { bg: '#ffedd5', icon: '#ea580c' }, // Orange
                                        { bg: '#dbeafe', icon: '#2563eb' }, // Blue
                                        { bg: '#f3e8ff', icon: '#9333ea' }, // Purple
                                    ];
                                    const colors = colorSets[index % colorSets.length];

                                    return (
                                        <View key={item.id} style={styles.assignmentCard}>
                                            <View style={styles.assignmentLeft}>
                                                <View style={[styles.subjectIconWrap, { backgroundColor: colors.bg }]}>
                                                    <MaterialCommunityIcons name={item.icon || 'book-open-variant'} size={20} color={colors.icon} />
                                                </View>
                                                <View>
                                                    <Text style={styles.subjectName}>{item.name}</Text>
                                                    <Text style={styles.subjectDetails}>{item.code} • Sem {item.semester} • Batch {item.batch}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDelete(item.id)}
                                            >
                                                <MaterialIcons name="delete" size={20} color="#cbd5e1" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                                {assignments.length === 0 && (
                                    <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 12 }}>No subjects assigned yet.</Text>
                                )}
                            </>
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    iconButton: { padding: 4, borderRadius: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', letterSpacing: -0.5 },

    scrollContent: { paddingBottom: 40 },
    section: { paddingHorizontal: 16, paddingTop: 24 },

    // Faculty Card
    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 12, letterSpacing: 0.5 },
    facultyCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    avatarWrapper: { position: 'relative', marginRight: 16 },
    avatarImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#eff6ff' },
    activeDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, backgroundColor: '#22c55e', borderRadius: 7, borderWidth: 2, borderColor: 'white' },
    facultyInfo: { flex: 1 },
    facultyName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    facultyDetails: { fontSize: 13, color: '#64748b', marginTop: 2 },
    changeBtnText: { color: '#0055ff', fontSize: 14, fontWeight: '500' },

    // Form
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
    // Form elements
    formCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    selectWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 16 },
    selectInput: { flex: 1, fontSize: 15, color: '#0f172a' },
    selectIcon: { marginLeft: 8 },
    rowGrid: { flexDirection: 'row', gap: 12 },
    chipScroll: { paddingBottom: 8, gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    filterChipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff' },
    filterChipText: { fontSize: 14, color: '#475569', fontWeight: '500' },
    filterChipTextActive: { color: 'white' },
    subjectGrid: { flexDirection: 'column', gap: 8, marginBottom: 16, marginTop: 8 },
    subjectOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', gap: 12 },
    subjectOptionActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
    subjectOptionText: { fontSize: 14, color: '#334155' },
    subjectOptionTextActive: { color: '#0055ff', fontWeight: '600' },
    assignButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    assignButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },

    // Assignments List
    assignHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
    countText: { color: '#0055ff', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
    assignmentList: { gap: 12 },
    assignmentCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
    assignmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    subjectIconWrap: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    subjectName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
    subjectDetails: { fontSize: 12, color: '#64748b', marginTop: 2 },
    deleteButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});
