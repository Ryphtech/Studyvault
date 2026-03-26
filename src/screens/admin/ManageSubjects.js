import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllCurriculumSubjects, saveAllCurriculumSubjects } from '../../services/firestoreService';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export default function ManageSubjects({ navigation }) {
    const insets = useSafeAreaInsets();

    // Semesters 1 to 8
    const semesters = Array.from({ length: 8 }, (_, i) => `Sem ${i + 1}`);
    const [selectedSemester, setSelectedSemester] = useState('Sem 1');

    // Departments (loaded from Firestore)
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'departments'), (snap) => {
            const list = snap.docs.map(d => d.data().name).sort();
            setDepartments(list);
            if (list.length > 0 && !selectedDepartment) setSelectedDepartment(list[0]);
        });
        return () => unsub();
    }, []);

    // UI state
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [credits, setCredits] = useState('');
    const [editingSubjectId, setEditingSubjectId] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchSubjects = async () => {
            setLoading(true);
            const data = await getAllCurriculumSubjects(selectedDepartment);
            if (!isMounted) return;

            // Optional: fallback to mock data if empty during dev
            if (data.length === 0) {
                setSubjects([
                    { id: 1, name: 'Data Structures', code: 'CS101', credits: '4', semester: 'Sem 1', icon: 'console' },
                    { id: 2, name: 'Calculus II', code: 'MATH202', credits: '3', semester: 'Sem 1', icon: 'function-variant' },
                    { id: 3, name: 'Digital Logic', code: 'EE105', credits: '4', semester: 'Sem 1', icon: 'memory' },
                    { id: 4, name: 'Professional Ethics', code: 'HS102', credits: '2', semester: 'Sem 1', icon: 'brain' },
                    { id: 5, name: 'Operating Systems', code: 'CS402', credits: '4', semester: 'Sem 4', icon: 'monitor' }
                ]);
            } else {
                setSubjects(data);
            }
            setLoading(false);
        };
        fetchSubjects();
        return () => { isMounted = false; };
    }, [selectedDepartment]);

    const filteredSubjects = subjects.filter(s => s.semester === selectedSemester);

    const handleAddSubject = () => {
        if (!subjectName || !subjectCode || !credits) {
            alert("Please fill all fields");
            return;
        }

        if (editingSubjectId) {
            setSubjects(subjects.map(s =>
                s.id === editingSubjectId
                    ? { ...s, name: subjectName, code: subjectCode, credits: credits }
                    : s
            ));
            setEditingSubjectId(null);
        } else {
            const newSubject = {
                id: Date.now(),
                name: subjectName,
                code: subjectCode,
                credits: credits,
                semester: selectedSemester,
                icon: 'book-open-variant'
            };
            setSubjects([...subjects, newSubject]);
        }

        setSubjectName('');
        setSubjectCode('');
        setCredits('');
    };

    const handleEdit = (sub) => {
        setEditingSubjectId(sub.id);
        setSubjectName(sub.name);
        setSubjectCode(sub.code);
        setCredits(sub.credits);
    };

    const handleDelete = (id) => {
        setSubjects(subjects.filter(s => s.id !== id));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        console.log("Saving curriculum for department:", selectedDepartment, "Subjects count:", subjects.length);
        try {
            await saveAllCurriculumSubjects(subjects, selectedDepartment);
            console.log("Save successful");
            Alert.alert("Success", `Curriculum for ${selectedDepartment} updated successfully!`);
        } catch (error) {
            console.error("Save failed:", error);
            Alert.alert("Error", "Failed to save curriculum to database.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={[styles.headerWrapper, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.headerTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <MaterialIcons name="arrow-back-ios" size={20} color="#334155" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Manage Subjects</Text>
                    </View>
                    <TouchableOpacity onPress={handleSaveAll} disabled={loading || saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color="#0055ff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Department Selector */}
                <View style={styles.semesterScrollWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semesterScroll}>
                        {departments.map(dept => {
                            const isActive = selectedDepartment === dept;
                            return (
                                <TouchableOpacity
                                    key={dept}
                                    style={[styles.deptPill, isActive ? styles.deptPillActive : styles.deptPillInactive]}
                                    onPress={() => setSelectedDepartment(dept)}
                                >
                                    <MaterialCommunityIcons name="domain" size={16} color={isActive ? 'white' : '#64748b'} style={{ marginRight: 6 }} />
                                    <Text style={[styles.semesterText, isActive ? styles.semesterTextActive : styles.semesterTextInactive]}>
                                        {dept}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Semester Selector */}
                <View style={styles.semesterScrollWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.semesterScroll}>
                        {semesters.map(sem => {
                            const isActive = selectedSemester === sem;
                            return (
                                <TouchableOpacity
                                    key={sem}
                                    style={[styles.semesterPill, isActive ? styles.semesterPillActive : styles.semesterPillInactive]}
                                    onPress={() => setSelectedSemester(sem)}
                                >
                                    <Text style={[styles.semesterText, isActive ? styles.semesterTextActive : styles.semesterTextInactive]}>
                                        {sem}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Add New Subject Form Section */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.cardTitle}>Add New Subject</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Subject Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Advanced Mathematics"
                                placeholderTextColor="#94a3b8"
                                value={subjectName}
                                onChangeText={setSubjectName}
                            />
                        </View>

                        <View style={styles.rowGrid}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Subject Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="MATH101"
                                    placeholderTextColor="#94a3b8"
                                    value={subjectCode}
                                    onChangeText={setSubjectCode}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Credits</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="4"
                                    placeholderTextColor="#94a3b8"
                                    value={credits}
                                    onChangeText={setCredits}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {editingSubjectId ? (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                <TouchableOpacity style={[styles.addButton, { flex: 1 }]} onPress={handleAddSubject}>
                                    <MaterialIcons name="check-circle" size={20} color="white" />
                                    <Text style={styles.addButtonText}>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.addButton, { flex: 1, backgroundColor: '#94a3b8', shadowColor: '#94a3b8' }]} onPress={() => {
                                    setEditingSubjectId(null);
                                    setSubjectName('');
                                    setSubjectCode('');
                                    setCredits('');
                                }}>
                                    <MaterialIcons name="cancel" size={20} color="white" />
                                    <Text style={styles.addButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
                                <MaterialIcons name="add-circle" size={20} color="white" />
                                <Text style={styles.addButtonText}>Add to {selectedSemester}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Current Subjects List Section */}
                    <View style={styles.listSection}>
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Subjects in {selectedSemester}</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{filteredSubjects.length} SUBJECTS</Text>
                            </View>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#0055ff" style={{ marginVertical: 32 }} />
                        ) : (
                            <View style={styles.subjectsContainer}>
                                {filteredSubjects.map((sub) => (
                                    <View key={sub.id} style={styles.subjectCard}>
                                        <View style={styles.subjectLeft}>
                                            <View style={styles.iconWrap}>
                                                <MaterialCommunityIcons name={sub.icon || 'book-outline'} size={24} color="#0055ff" />
                                            </View>
                                            <View>
                                                <Text style={styles.subName}>{sub.name}</Text>
                                                <Text style={styles.subDetails}>{sub.code} • {sub.credits} Credits</Text>
                                            </View>
                                        </View>
                                        <View style={styles.actionRow}>
                                            <TouchableOpacity style={styles.actionBtnIcon} onPress={() => handleEdit(sub)}>
                                                <MaterialIcons name="edit" size={20} color="#94a3b8" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionBtnIconHoverred}
                                                onPress={() => handleDelete(sub.id)}
                                            >
                                                <MaterialIcons name="delete" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}

                                {filteredSubjects.length === 0 && (
                                    <Text style={styles.emptyText}>No subjects added for {selectedSemester} yet.</Text>
                                )}
                            </View>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Header
    headerWrapper: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
    iconButton: { padding: 8, marginLeft: -8, borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', letterSpacing: -0.5 },
    saveBtnText: { color: '#0055ff', fontSize: 14, fontWeight: '600' },

    // Semester Selector
    semesterScrollWrapper: { paddingBottom: 8 },
    semesterScroll: { paddingHorizontal: 16, gap: 8 },
    semesterPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, height: 36, justifyContent: 'center' },
    semesterPillActive: { backgroundColor: '#0055ff', borderColor: '#0055ff', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    semesterPillInactive: { backgroundColor: 'white', borderColor: '#e2e8f0' },
    deptPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, height: 36, flexDirection: 'row', alignItems: 'center' },
    deptPillActive: { backgroundColor: '#334155', borderColor: '#334155' },
    deptPillInactive: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
    semesterText: { fontSize: 13, fontWeight: '600' },
    semesterTextActive: { color: 'white' },
    semesterTextInactive: { color: '#64748b' },

    scrollContent: { padding: 16, gap: 24, paddingBottom: 40 },

    // Form Section
    sectionCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
    formGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, height: 48, paddingHorizontal: 16, fontSize: 15, color: '#0f172a' },
    rowGrid: { flexDirection: 'row', gap: 16 },
    addButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    addButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },

    // List Section
    listSection: { gap: 16 },
    listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
    listTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    countBadge: { backgroundColor: 'rgba(0,85,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    countText: { color: '#0055ff', fontSize: 11, fontWeight: 'bold' },

    subjectsContainer: { gap: 12 },
    subjectCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    subjectLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0,85,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    subName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
    subDetails: { fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },

    actionRow: { flexDirection: 'row', gap: 4 },
    actionBtnIcon: { padding: 8, borderRadius: 8 },
    actionBtnIconHoverred: { padding: 8, borderRadius: 8, backgroundColor: '#fef2f2' },

    emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 24, fontSize: 14 }
});
