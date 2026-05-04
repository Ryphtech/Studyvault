import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import {
    getUserProfile,
    getAllCurriculumSubjects,
    saveAllCurriculumSubjects,
    subscribeToAllFaculty,
    subscribeToDepartmentCourses,
    assignCourseToFaculty,
    removeCourseFromFaculty,
    seedCSCurriculum
} from '../../services/supabaseService';

const { width } = Dimensions.get('window');
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const ACCENT_COLORS = ['#0055ff', '#9333ea', '#ea580c', '#059669', '#e11d48', '#d97706', '#6366f1', '#0ea5e9'];

export default function HODAssignSubjects({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [selectedSem, setSelectedSem] = useState('Sem 1');
    const [saving, setSaving] = useState(false);

    // Add Subject Modal
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', credits: '' });

    // Assign Faculty Modal
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [assigning, setAssigning] = useState(false);

    // Fetch HOD's department and subjects
    useEffect(() => {
        const init = async () => {
            try {
                const profile = await getUserProfile(user?.id);
                const dept = profile?.department || 'Computer Science';
                setDepartment(dept);
                const subj = await getAllCurriculumSubjects(dept);
                setSubjects(subj);
            } catch (error) {
                console.error("Error initializing:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Subscribe to all faculty across college
    useEffect(() => {
        const unsub = subscribeToAllFaculty(setFaculty);
        return () => unsub();
    }, []);

    // Subscribe to department course assignments
    useEffect(() => {
        if (!department) return;
        const unsub = subscribeToDepartmentCourses(department, setAssignedCourses);
        return () => unsub();
    }, [department]);

    const semSubjects = subjects.filter(s => s.semester === selectedSem).sort((a, b) => (b.credits || 0) - (a.credits || 0));

    const isSubjectAssigned = (subjectCode) => {
        return assignedCourses.find(c => c.code === subjectCode || c.subjectCode === subjectCode);
    };

    // --- Add Subject ---
    const handleAddSubject = async () => {
        if (!formData.name.trim() || !formData.code.trim()) {
            Alert.alert("Error", "Subject name and code are required.");
            return;
        }
        // Check duplicate code
        if (subjects.find(s => s.code === formData.code.trim().toUpperCase())) {
            Alert.alert("Error", "A subject with this code already exists.");
            return;
        }

        setSaving(true);
        try {
            const newSubject = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                credits: parseInt(formData.credits) || 3,
                semester: selectedSem,
            };
            const updatedSubjects = [...subjects, newSubject];
            await saveAllCurriculumSubjects(updatedSubjects, department);
            setSubjects(updatedSubjects);
            setFormData({ name: '', code: '', credits: '' });
            setAddModalVisible(false);
            Alert.alert("Added!", `${newSubject.name} added to ${selectedSem}.`);
        } catch (e) {
            Alert.alert("Error", "Failed to add subject.");
        } finally {
            setSaving(false);
        }
    };

    // --- Delete Subject ---
    const handleDeleteSubject = (subj) => {
        const assigned = isSubjectAssigned(subj.code);
        if (assigned) {
            Alert.alert("Cannot Delete", "This subject is currently assigned to a faculty member. Unassign it first.");
            return;
        }
        Alert.alert("Delete Subject", `Remove "${subj.name}" (${subj.code}) from ${selectedSem}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                setSaving(true);
                try {
                    const updated = subjects.filter(s => !(s.code === subj.code && s.semester === subj.semester));
                    await saveAllCurriculumSubjects(updated, department);
                    setSubjects(updated);
                } catch (e) {
                    Alert.alert("Error", "Failed to delete subject.");
                } finally {
                    setSaving(false);
                }
            }}
        ]);
    };

    // --- Assign Faculty ---
    const handleAssign = async () => {
        if (!selectedSubject || !selectedFaculty) return;
        setAssigning(true);
        try {
            await assignCourseToFaculty({
                name: selectedSubject.name,
                code: selectedSubject.code,
                subjectCode: selectedSubject.code,
                subjectName: selectedSubject.name,
                credits: selectedSubject.credits,
                semester: selectedSubject.semester,
                facultyId: selectedFaculty.uid,
                facultyName: selectedFaculty.name,
                department,
            });
            Alert.alert("Assigned!", `${selectedSubject.name} → ${selectedFaculty.name}`);
            setAssignModalVisible(false);
            setSelectedSubject(null);
            setSelectedFaculty(null);
        } catch (e) {
            Alert.alert("Error", "Failed to assign subject.");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassign = (course) => {
        Alert.alert("Unassign", `Remove ${course.name || course.subjectName} from ${course.facultyName}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Unassign", style: "destructive", onPress: async () => {
                await removeCourseFromFaculty(course.id);
            }}
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading subjects...</Text>
            </View>
        );
    }

    const semIndex = SEMESTERS.indexOf(selectedSem);
    const accentColor = ACCENT_COLORS[semIndex % ACCENT_COLORS.length];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Manage Subjects</Text>
                        <Text style={styles.headerSubtitle}>{department}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addHeaderBtn} onPress={() => setAddModalVisible(true)}>
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Semester Selector */}
            <View style={styles.semSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}>
                    {SEMESTERS.map((sem, i) => (
                        <TouchableOpacity
                            key={sem}
                            style={[styles.semChip, selectedSem === sem && { backgroundColor: ACCENT_COLORS[i], borderColor: ACCENT_COLORS[i] }]}
                            onPress={() => setSelectedSem(sem)}
                        >
                            <Text style={[styles.semChipText, selectedSem === sem && styles.semChipTextActive]}>
                                S{i + 1}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Subject List */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.semHeaderRow}>
                    <Text style={styles.semTitle}>{selectedSem}</Text>
                    <View style={styles.countBadge}>
                        <Text style={[styles.countText, { color: accentColor }]}>{semSubjects.length} subjects</Text>
                    </View>
                </View>

                {semSubjects.length > 0 ? (
                    semSubjects.map((subj, i) => {
                        const assigned = isSubjectAssigned(subj.code);
                        return (
                            <View key={subj.code + i} style={styles.subjectCard}>
                                <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
                                <View style={styles.subjectMain}>
                                    <View style={styles.subjectTop}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.subjectName}>{subj.name}</Text>
                                            <View style={styles.subjectMeta}>
                                                <View style={[styles.codeBadge, { backgroundColor: `${accentColor}15` }]}>
                                                    <Text style={[styles.codeText, { color: accentColor }]}>{subj.code}</Text>
                                                </View>
                                                <Text style={styles.creditText}>{subj.credits} Credits</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Assignment status */}
                                    {assigned ? (
                                        <View style={styles.assignedRow}>
                                            <View style={styles.assignedInfo}>
                                                <MaterialIcons name="person" size={14} color="#059669" />
                                                <Text style={styles.assignedName}>{assigned.facultyName}</Text>
                                            </View>
                                            <TouchableOpacity style={styles.unassignBtn} onPress={() => handleUnassign(assigned)}>
                                                <MaterialIcons name="link-off" size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.assignBtn} onPress={() => {
                                            setSelectedSubject(subj);
                                            setAssignModalVisible(true);
                                        }}>
                                            <MaterialIcons name="person-add" size={16} color="#0055ff" />
                                            <Text style={styles.assignBtnText}>Assign Faculty</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Delete */}
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteSubject(subj)}>
                                    <MaterialIcons name="delete-outline" size={18} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="book-open-blank-variant" size={56} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No Subjects</Text>
                        <Text style={styles.emptySubtitle}>Tap + to add subjects for {selectedSem}</Text>

                        {department === 'Computer Science' && subjects.length === 0 && (
                            <TouchableOpacity
                                style={styles.seedBtn}
                                onPress={() => {
                                    Alert.alert('Seed Subjects', 'Load all Computer Science subjects (S1-S8) into the curriculum?', [
                                        { text: 'Cancel', style: 'cancel' },
                                        { text: 'Seed All', onPress: async () => {
                                            setSaving(true);
                                            const result = await seedCSCurriculum();
                                            setSaving(false);
                                            if (result.success) {
                                                const subj = await getAllCurriculumSubjects('Computer Science');
                                                setSubjects(subj);
                                                Alert.alert('Done!', `${result.count} subjects loaded across 8 semesters.`);
                                            } else {
                                                Alert.alert('Error', 'Failed to seed subjects.');
                                            }
                                        }}
                                    ]);
                                }}
                            >
                                <MaterialIcons name="cloud-download" size={18} color="#0055ff" />
                                <Text style={styles.seedBtnText}>Seed CS Subjects (S1-S8)</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Subject Bottom Button */}
            <View style={styles.bottomArea}>
                <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: accentColor }]} onPress={() => setAddModalVisible(true)}>
                    <MaterialIcons name="add" size={22} color="white" />
                    <Text style={styles.bottomBtnText}>Add Subject to {selectedSem}</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Add Subject Modal ─── */}
            <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Add Subject</Text>
                        <Text style={styles.modalSubtitle}>{selectedSem} • {department}</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Subject Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Data Structures"
                                placeholderTextColor="#9ca3af"
                                value={formData.name}
                                onChangeText={t => setFormData({ ...formData, name: t })}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Subject Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. CS301"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.code}
                                    onChangeText={t => setFormData({ ...formData, code: t })}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={[styles.formGroup, { width: 100 }]}>
                                <Text style={styles.inputLabel}>Credits</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="3"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.credits}
                                    onChangeText={t => setFormData({ ...formData, credits: t })}
                                    keyboardType="numeric"
                                    maxLength={1}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddSubject} disabled={saving}>
                            {saving ? <ActivityIndicator color="white" size="small" /> : (
                                <>
                                    <MaterialIcons name="add-circle-outline" size={20} color="white" />
                                    <Text style={styles.modalSaveBtnText}>Add Subject</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* ─── Assign Faculty Modal ─── */}
            <Modal visible={assignModalVisible} transparent animationType="slide" onRequestClose={() => setAssignModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Assign Faculty</Text>
                        {selectedSubject && (
                            <Text style={styles.modalSubtitle}>{selectedSubject.name} ({selectedSubject.code})</Text>
                        )}

                        <ScrollView style={{ maxHeight: 300, width: '100%' }} showsVerticalScrollIndicator={false}>
                            {faculty.length > 0 ? faculty.map(f => (
                                <TouchableOpacity
                                    key={f.uid}
                                    style={[styles.facultyRow, selectedFaculty?.uid === f.uid && styles.facultyRowSelected]}
                                    onPress={() => setSelectedFaculty(f)}
                                >
                                    <View style={styles.facultyAvatar}>
                                        <Text style={styles.facultyAvatarText}>{(f.name || 'F').charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.facultyName}>{f.name || 'Unknown'}</Text>
                                        <Text style={styles.facultyEmail}>{f.email || ''}</Text>
                                        <Text style={{ fontSize: 11, color: '#ef4444', marginTop: 2, fontWeight: '600' }}>
                                            {f.department || 'No Dept'}
                                        </Text>
                                    </View>
                                    {selectedFaculty?.uid === f.uid && (
                                        <MaterialIcons name="check-circle" size={24} color="#0055ff" />
                                    )}
                                </TouchableOpacity>
                            )) : (
                                <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>No faculty available</Text>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.modalSaveBtn, (!selectedFaculty) && { opacity: 0.5 }]}
                            onPress={handleAssign}
                            disabled={assigning || !selectedFaculty}
                        >
                            {assigning ? <ActivityIndicator color="white" size="small" /> : (
                                <Text style={styles.modalSaveBtnText}>Assign Subject</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => {
                            setAssignModalVisible(false);
                            setSelectedSubject(null);
                            setSelectedFaculty(null);
                        }}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245,246,248,0.95)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },
    addHeaderBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

    // Semester
    semSection: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    semChip: { width: 44, height: 38, borderRadius: 12, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    semChipText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    semChipTextActive: { color: 'white' },

    scrollContent: { padding: 24 },

    semHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    semTitle: { fontSize: 20, fontWeight: '800', color: '#101318' },
    countBadge: { backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    countText: { fontSize: 12, fontWeight: '700' },

    // Subject Card
    subjectCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    cardAccent: { width: 4 },
    subjectMain: { flex: 1, padding: 14 },
    subjectTop: { flexDirection: 'row', alignItems: 'flex-start' },
    subjectName: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
    subjectMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    codeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    codeText: { fontSize: 11, fontWeight: '700' },
    creditText: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },

    // Assignment
    assignedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, backgroundColor: '#f0fdf4', borderRadius: 10, padding: 8, paddingHorizontal: 12 },
    assignedInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    assignedName: { fontSize: 12, fontWeight: '600', color: '#059669' },
    unassignBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },

    assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#eff6ff', borderRadius: 10, padding: 8, paddingHorizontal: 12, alignSelf: 'flex-start' },
    assignBtnText: { fontSize: 12, fontWeight: '600', color: '#0055ff' },

    deleteBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 12 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
    seedBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, backgroundColor: '#eff6ff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe' },
    seedBtnText: { fontSize: 14, fontWeight: '700', color: '#0055ff' },

    // Bottom
    bottomArea: { paddingHorizontal: 24, paddingBottom: 28, paddingTop: 12 },
    bottomBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    bottomBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16, alignItems: 'center' },
    modalHandle: { width: 48, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#101318', width: '100%' },
    modalSubtitle: { fontSize: 13, fontWeight: '600', color: '#0055ff', width: '100%', marginBottom: 20, marginTop: 2 },

    formGroup: { marginBottom: 16, width: '100%' },
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 2 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 15, color: '#0f172a', width: '100%' },

    modalSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', height: 52, borderRadius: 14, width: '100%', marginTop: 8 },
    modalSaveBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },
    modalCancelBtn: { height: 44, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 4 },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: '#64748b' },

    // Faculty
    facultyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    facultyRowSelected: { backgroundColor: '#eff6ff', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 12, borderBottomColor: 'transparent' },
    facultyAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
    facultyAvatarText: { fontSize: 16, fontWeight: '700', color: '#475569' },
    facultyName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
    facultyEmail: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
});
