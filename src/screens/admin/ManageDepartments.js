import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

const DEPT_ICONS = [
    { icon: 'laptop', color: '#0055ff', bg: '#eff6ff' },
    { icon: 'settings', color: '#ea580c', bg: '#fff7ed' },
    { icon: 'bolt', color: '#d97706', bg: '#fffbeb' },
    { icon: 'memory', color: '#9333ea', bg: '#faf5ff' },
    { icon: 'apartment', color: '#059669', bg: '#f0fdf4' },
    { icon: 'biotech', color: '#e11d48', bg: '#fff1f2' },
    { icon: 'science', color: '#0284c7', bg: '#f0f9ff' },
    { icon: 'auto-stories', color: '#6366f1', bg: '#f5f3ff' },
];

export default function ManageDepartments({ navigation }) {
    const insets = useSafeAreaInsets();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deptName, setDeptName] = useState('');
    const [deptCode, setDeptCode] = useState('');

    // Subscribe to departments
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'departments'), (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setDepartments(list);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleAdd = async () => {
        if (!deptName.trim()) {
            Alert.alert('Error', 'Please enter a department name.');
            return;
        }

        // Check duplicate
        if (departments.find(d => d.name.toLowerCase() === deptName.trim().toLowerCase())) {
            Alert.alert('Error', 'This department already exists.');
            return;
        }

        setSaving(true);
        try {
            const docId = deptName.trim().replace(/\s+/g, '_');
            await setDoc(doc(db, 'departments', docId), {
                name: deptName.trim(),
                code: deptCode.trim().toUpperCase() || deptName.trim().substring(0, 3).toUpperCase(),
                createdAt: new Date().toISOString(),
            });
            Alert.alert('Added!', `${deptName.trim()} department created.`);
            setDeptName('');
            setDeptCode('');
            setShowForm(false);
        } catch (e) {
            Alert.alert('Error', 'Failed to add department.');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (dept) => {
        Alert.alert('Delete Department', `Are you sure you want to delete "${dept.name}"?\n\nThis won't remove existing users or data linked to this department.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    await deleteDoc(doc(db, 'departments', dept.id));
                } catch (e) {
                    Alert.alert('Error', 'Failed to delete department.');
                }
            }}
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Departments</Text>
                        <Text style={styles.headerSubtitle}>Manage branches</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <MaterialIcons name={showForm ? 'close' : 'add'} size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Add Form */}
                {showForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Add New Department</Text>
                        <Text style={styles.formSubtitle}>Create a new branch for your institution</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Department Name</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="domain" size={20} color="#5e6d8d" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Computer Science"
                                    placeholderTextColor="#9ca3af"
                                    value={deptName}
                                    onChangeText={setDeptName}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.inputLabel}>Short Code (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="tag" size={20} color="#5e6d8d" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. CS"
                                    placeholderTextColor="#9ca3af"
                                    value={deptCode}
                                    onChangeText={setDeptCode}
                                    autoCapitalize="characters"
                                    maxLength={6}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.createBtn} onPress={handleAdd} disabled={saving}>
                            {saving ? <ActivityIndicator color="white" size="small" /> : (
                                <>
                                    <MaterialIcons name="add-circle-outline" size={20} color="white" />
                                    <Text style={styles.createBtnText}>Create Department</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Department List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>All Departments</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{departments.length}</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={{ alignItems: 'center', paddingTop: 40 }}>
                        <ActivityIndicator size="large" color="#0055ff" />
                    </View>
                ) : departments.length > 0 ? (
                    departments.map((dept, i) => {
                        const iconSet = DEPT_ICONS[i % DEPT_ICONS.length];
                        return (
                            <View key={dept.id} style={styles.deptCard}>
                                <View style={styles.deptLeft}>
                                    <View style={[styles.deptIcon, { backgroundColor: iconSet.bg }]}>
                                        <MaterialIcons name={iconSet.icon} size={24} color={iconSet.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.deptName}>{dept.name}</Text>
                                        <Text style={styles.deptCode}>{dept.code}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(dept)}>
                                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="domain-add" size={56} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No Departments</Text>
                        <Text style={styles.emptySubtitle}>Tap + to add your first department</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245,246,248,0.95)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

    scrollContent: { padding: 24 },

    // Form
    formCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    formTitle: { fontSize: 18, fontWeight: '800', color: '#101318', marginBottom: 4 },
    formSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
    formGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 14, height: 52, gap: 10 },
    textInput: { flex: 1, fontSize: 15, color: '#101318', fontWeight: '500' },
    createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', height: 52, borderRadius: 14, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    createBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },

    // Section Header
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#101318' },
    countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    countText: { fontSize: 12, fontWeight: '700', color: '#0055ff' },

    // Dept Cards
    deptCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    deptLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    deptIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    deptName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    deptCode: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 2 },
    deleteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 12 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
});
