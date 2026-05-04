import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, getAllCurriculumSubjects, subscribeToDepartmentCourses } from '../../services/supabaseService';
import { supabase } from '../../services/supabaseClient';

const { width } = Dimensions.get('window');

const SEMESTERS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
    { num: 1, time: '09:00 - 09:50' },
    { num: 2, time: '09:50 - 10:40' },
    { num: 3, time: '10:50 - 11:40' },
    { num: 4, time: '11:40 - 12:30' },
    { num: 5, time: '01:30 - 02:20' },
    { num: 6, time: '02:20 - 03:10' },
    { num: 7, time: '03:20 - 04:10' },
];

const PERIOD_COLORS = ['#0055ff', '#9333ea', '#ea580c', '#059669', '#e11d48', '#d97706', '#6366f1'];

export default function ManageSchedules({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [department, setDepartment] = useState(route?.params?.department || '');
    const [selectedSem, setSelectedSem] = useState('S1');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [timetable, setTimetable] = useState({});  // { Monday: [{subject, faculty, room}, ...], ... }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);
    const [formData, setFormData] = useState({ subject: '', faculty: '', room: '' });

    const [curriculumSubjects, setCurriculumSubjects] = useState([]);
    const [assignedCourses, setAssignedCourses] = useState([]);

    // Load HOD department on mount
    useEffect(() => {
        const loadDept = async () => {
            if (!department && user?.id) {
                const profile = await getUserProfile(user.id);
                if (profile?.department) setDepartment(profile.department);
            }
        };
        loadDept();
    }, [user]);

    // Load timetable from Firestore when semester or department changes
    useEffect(() => {
        if (!department) return;
        loadTimetable();
    }, [department, selectedSem]);

    useEffect(() => {
        if (!department) return;
        const loadSubj = async () => {
            const subj = await getAllCurriculumSubjects(department);
            setCurriculumSubjects(subj);
        };
        loadSubj();
        
        const unsub = subscribeToDepartmentCourses(department, setAssignedCourses);
        return () => unsub();
    }, [department]);

    const getTimetableDocId = () => `${department.replace(/\s/g, '_')}_${selectedSem}`;

    const loadTimetable = async () => {
        setLoading(true);
        try {
            const docId = getTimetableDocId();
            const { data, error } = await supabase.from('timetables').select('*').eq('id', docId).single();
            if (data) {
                setTimetable(data.schedule || {});
            } else {
                // Initialize empty timetable
                const empty = {};
                DAYS.forEach(d => { empty[d] = PERIODS.map(() => ({ subject: '', faculty: '', room: '' })); });
                setTimetable(empty);
            }
        } catch (e) {
            console.error('Error loading timetable:', e);
        } finally {
            setLoading(false);
        }
    };

    const saveTimetable = async () => {
        setSaving(true);
        try {
            const docId = getTimetableDocId();
            const { error } = await supabase.from('timetables').upsert({
                id: docId,
                department,
                semester: selectedSem,
                schedule: timetable,
                updated_at: new Date().toISOString(),
                updated_by: user?.id || null,
            });
            if (error) throw error;
            Alert.alert('Saved!', `Timetable for ${selectedSem} (${department}) has been saved.`);
        } catch (e) {
            console.error('Error saving timetable:', e);
            Alert.alert('Error', 'Failed to save timetable.');
        } finally {
            setSaving(false);
        }
    };

    const openEditor = (periodIdx) => {
        const dayData = timetable[selectedDay] || [];
        const existing = dayData[periodIdx] || { subject: '', faculty: '', room: '' };
        setFormData({ ...existing });
        setEditingPeriod(periodIdx);
        setModalVisible(true);
    };

    const saveSlot = () => {
        const updated = { ...timetable };
        if (!updated[selectedDay]) {
            updated[selectedDay] = PERIODS.map(() => ({ subject: '', faculty: '', room: '' }));
        }
        updated[selectedDay][editingPeriod] = { ...formData };
        setTimetable(updated);
        setModalVisible(false);
    };

    const clearSlot = (periodIdx) => {
        Alert.alert('Clear Period', `Clear Period ${periodIdx + 1} on ${selectedDay}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => {
                const updated = { ...timetable };
                if (updated[selectedDay]) {
                    updated[selectedDay][periodIdx] = { subject: '', faculty: '', room: '' };
                    setTimetable(updated);
                }
            }}
        ]);
    };

    const currentDaySlots = timetable[selectedDay] || PERIODS.map(() => ({ subject: '', faculty: '', room: '' }));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Set Timetable</Text>
                        <Text style={styles.headerSubtitle}>{department || 'Loading...'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.saveHeaderBtn} onPress={saveTimetable} disabled={saving}>
                    {saving ? <ActivityIndicator color="white" size="small" /> : (
                        <MaterialIcons name="save" size={22} color="white" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Semester Selector */}
            <View style={styles.semSection}>
                <Text style={styles.semLabel}>Select Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {SEMESTERS.map(sem => (
                        <TouchableOpacity
                            key={sem}
                            style={[styles.semChip, selectedSem === sem && styles.semChipActive]}
                            onPress={() => setSelectedSem(sem)}
                        >
                            <Text style={[styles.semChipText, selectedSem === sem && styles.semChipTextActive]}>{sem}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Day Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}>
                {DAYS.map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
                        onPress={() => setSelectedDay(day)}
                    >
                        <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>{day.substring(0, 3)}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Periods List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0055ff" />
                    <Text style={{ marginTop: 12, color: '#64748b' }}>Loading timetable...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.periodsContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.dayTitle}>{selectedDay}</Text>

                    {PERIODS.map((period, idx) => {
                        const slot = currentDaySlots[idx] || {};
                        const hasData = slot.subject?.trim();
                        const color = PERIOD_COLORS[idx % PERIOD_COLORS.length];

                        return (
                            <TouchableOpacity key={idx} style={styles.periodCard} onPress={() => openEditor(idx)} activeOpacity={0.7}>
                                <View style={[styles.periodAccent, { backgroundColor: hasData ? color : '#e2e8f0' }]} />
                                <View style={styles.periodNumBox}>
                                    <Text style={styles.periodNum}>{period.num}</Text>
                                    <Text style={styles.periodTime}>{period.time}</Text>
                                </View>
                                <View style={styles.periodContent}>
                                    {hasData ? (
                                        <>
                                            <Text style={styles.subjectName}>{slot.subject}</Text>
                                            <View style={styles.slotMeta}>
                                                {slot.faculty ? (
                                                    <View style={styles.metaItem}>
                                                        <MaterialIcons name="person" size={13} color="#64748b" />
                                                        <Text style={styles.metaText}>{slot.faculty}</Text>
                                                    </View>
                                                ) : null}
                                                {slot.room ? (
                                                    <View style={styles.metaItem}>
                                                        <MaterialIcons name="meeting-room" size={13} color="#64748b" />
                                                        <Text style={styles.metaText}>{slot.room}</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </>
                                    ) : (
                                        <Text style={styles.emptySlot}>Tap to assign subject</Text>
                                    )}
                                </View>
                                {hasData ? (
                                    <TouchableOpacity style={styles.clearBtn} onPress={() => clearSlot(idx)}>
                                        <MaterialIcons name="close" size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                ) : (
                                    <MaterialIcons name="add-circle-outline" size={22} color="#cbd5e1" />
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveBtn} onPress={saveTimetable} disabled={saving}>
                        {saving ? <ActivityIndicator color="white" size="small" /> : (
                            <>
                                <MaterialIcons name="save" size={20} color="white" />
                                <Text style={styles.saveBtnText}>Save Timetable</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {/* Edit Period Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>
                            Period {editingPeriod !== null ? editingPeriod + 1 : ''} — {selectedDay}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            {editingPeriod !== null ? PERIODS[editingPeriod]?.time : ''}
                        </Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Select Subject from Curriculum</Text>
                            <ScrollView style={{ maxHeight: 180, width: '100%', marginBottom: 4 }} showsVerticalScrollIndicator={false}>
                                {curriculumSubjects.filter(s => {
                                    const semNum = selectedSem.replace('S', '');
                                    return s.semester === selectedSem || s.semester === `Sem ${semNum}` || s.semester === `S${semNum}`;
                                }).length > 0 ? (
                                    curriculumSubjects.filter(s => {
                                        const semNum = selectedSem.replace('S', '');
                                        return s.semester === selectedSem || s.semester === `Sem ${semNum}` || s.semester === `S${semNum}`;
                                    }).map((s, i) => {
                                        const assigned = assignedCourses.find(c => c.subject_code === s.code || c.subjectCode === s.code);
                                        const facName = assigned ? (assigned.faculty_name || assigned.facultyName) : '';
                                        const isSelected = formData.subject === s.name;
                                        return (
                                            <TouchableOpacity 
                                                key={i} 
                                                style={[styles.subjectOptionBtn, isSelected && styles.subjectOptionBtnSelected]}
                                                onPress={() => setFormData({ ...formData, subject: s.name, faculty: facName })}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.subjectOptionName, isSelected && { color: '#0055ff' }]}>{s.name}</Text>
                                                    {facName ? <Text style={styles.subjectOptionFac}>{facName}</Text> : null}
                                                </View>
                                                {isSelected && <MaterialIcons name="check-circle" size={20} color="#0055ff" />}
                                            </TouchableOpacity>
                                        );
                                    })
                                ) : (
                                    <Text style={{ fontStyle: 'italic', color: '#94a3b8', padding: 8 }}>No subjects added for {selectedSem} yet.</Text>
                                )}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Or Custom Subject / Event</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Lunch Break, Library..."
                                placeholderTextColor="#94a3b8"
                                value={formData.subject}
                                onChangeText={t => setFormData({ ...formData, subject: t })}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Faculty Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Dr. Smith"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.faculty}
                                    onChangeText={t => setFormData({ ...formData, faculty: t })}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Room / Lab</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Room 302"
                                    placeholderTextColor="#94a3b8"
                                    value={formData.room}
                                    onChangeText={t => setFormData({ ...formData, room: t })}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.modalSaveBtn} onPress={saveSlot}>
                            <MaterialIcons name="check" size={20} color="white" />
                            <Text style={styles.modalSaveBtnText}>Assign Subject</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245,246,248,0.95)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },
    saveHeaderBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

    // Semester
    semSection: { paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    semLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    semChip: { width: 48, height: 40, borderRadius: 12, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    semChipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
    semChipText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    semChipTextActive: { color: 'white' },

    // Day selector
    daySelectorRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dayChip: { paddingHorizontal: 18, height: 36, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    dayChipActive: { backgroundColor: '#101318', borderColor: '#101318' },
    dayChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    dayChipTextActive: { color: 'white' },

    // Periods
    periodsContainer: { padding: 24 },
    dayTitle: { fontSize: 18, fontWeight: '800', color: '#101318', marginBottom: 16 },

    periodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1, overflow: 'hidden', gap: 12 },
    periodAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
    periodNumBox: { alignItems: 'center', width: 56 },
    periodNum: { fontSize: 20, fontWeight: '800', color: '#101318' },
    periodTime: { fontSize: 9, fontWeight: '600', color: '#94a3b8', marginTop: 2 },
    periodContent: { flex: 1 },
    subjectName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    slotMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: '#64748b' },
    emptySlot: { fontSize: 13, color: '#cbd5e1', fontStyle: 'italic' },
    clearBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },

    // Save
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', height: 56, borderRadius: 16, marginTop: 20, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: 'white' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16, alignItems: 'center' },
    modalHandle: { width: 48, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#101318', width: '100%' },
    modalSubtitle: { fontSize: 13, fontWeight: '600', color: '#0055ff', width: '100%', marginBottom: 20 },

    formGroup: { marginBottom: 16, width: '100%' },
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginLeft: 2 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 48, paddingHorizontal: 16, fontSize: 15, color: '#0f172a', width: '100%' },

    modalSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', height: 52, borderRadius: 14, width: '100%', marginTop: 8 },
    modalSaveBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },
    modalCancelBtn: { height: 48, alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 4 },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: '#64748b' },

    // Subject Options
    subjectOptionBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#f8fafc', marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    subjectOptionBtnSelected: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
    subjectOptionName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    subjectOptionFac: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
