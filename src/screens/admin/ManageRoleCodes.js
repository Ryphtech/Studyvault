import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createRoleCode, deleteRoleCode, subscribeToRoleCodes } from '../../services/supabaseService';
import { supabase } from '../../services/supabaseClient';

const { width } = Dimensions.get('window');

const ROLE_OPTIONS = [
    { label: 'Student', value: 'student', icon: 'school', color: '#0055ff', bg: '#eff6ff' },
    { label: 'Faculty', value: 'faculty', icon: 'person', color: '#9333ea', bg: '#faf5ff' },
    { label: 'HOD', value: 'hod', icon: 'supervisor-account', color: '#ea580c', bg: '#fff7ed' },
    { label: 'Admin', value: 'admin', icon: 'admin-panel-settings', color: '#ef4444', bg: '#fef2f2' },
    { label: 'Placement Officer', value: 'placement_officer', icon: 'work', color: '#16a34a', bg: '#f0fdf4' },
];

export default function ManageRoleCodes({ navigation }) {
    const insets = useSafeAreaInsets();
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [newCode, setNewCode] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        const unsubCodes = subscribeToRoleCodes((data) => {
            setCodes(data);
            setLoading(false);
        });
        const fetchDepts = async () => {
            const { data } = await supabase.from('departments').select('name').order('name', { ascending: true });
            setDepartments((data || []).map(d => d.name));
        };
        fetchDepts();
        const channel = supabase.channel('rolecodes_departments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, fetchDepts)
            .subscribe();
        return () => { unsubCodes(); supabase.removeChannel(channel); };
    }, []);

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    };

    const handleCreate = async () => {
        if (!selectedRole) { Alert.alert("Error", "Please select a role."); return; }
        if (['hod', 'faculty', 'student'].includes(selectedRole) && !selectedDepartment) { Alert.alert("Error", "Please select a department for this role."); return; }
        const codeToUse = newCode.trim() || generateCode();
        if (codeToUse.length < 4) { Alert.alert("Error", "Code must be at least 4 characters."); return; }

        setCreating(true);
        const dept = ['hod', 'faculty', 'student'].includes(selectedRole) ? selectedDepartment : null;
        const result = await createRoleCode(selectedRole, codeToUse.toUpperCase(), dept);
        setCreating(false);

        if (result.success) {
            const roleLabel = ROLE_OPTIONS.find(r => r.value === selectedRole)?.label || selectedRole;
            const deptNote = dept ? ` (${dept})` : '';
            Alert.alert("Success", `Code "${codeToUse.toUpperCase()}" created for ${roleLabel}${deptNote}.`);
            setNewCode('');
            setSelectedRole('');
            setSelectedDepartment('');
            setShowForm(false);
        } else {
            Alert.alert("Error", result.error || "Failed to create code.");
        }
    };

    const handleDelete = (code) => {
        Alert.alert("Delete Code", `Are you sure you want to delete code "${code}"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                await deleteRoleCode(code);
            }}
        ]);
    };

    const getRoleInfo = (roleValue) => ROLE_OPTIONS.find(r => r.value === roleValue) || { label: roleValue, icon: 'help', color: '#6b7280', bg: '#f3f4f6' };

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
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Security Codes</Text>
                        <Text style={styles.headerSubtitle}>Role-based registration codes</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
                    <MaterialIcons name={showForm ? "close" : "add"} size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Create Form */}
                {showForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Generate New Code</Text>
                        <Text style={styles.formSubtitle}>Users will need this code to register with the selected role</Text>

                        {/* Role Selection */}
                        <Text style={styles.fieldLabel}>Select Role</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScrollRow}>
                            {ROLE_OPTIONS.map(role => (
                                <TouchableOpacity
                                    key={role.value}
                                    style={[
                                        styles.roleChip,
                                        selectedRole === role.value && { backgroundColor: role.bg, borderColor: role.color, borderWidth: 2 }
                                    ]}
                                    onPress={() => { setSelectedRole(role.value); if (!['hod', 'faculty', 'student'].includes(role.value)) setSelectedDepartment(''); }}
                                >
                                    <MaterialIcons name={role.icon} size={16} color={selectedRole === role.value ? role.color : '#9ca3af'} />
                                    <Text style={[styles.roleChipText, selectedRole === role.value && { color: role.color, fontWeight: '700' }]}>{role.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Department Selection */}
                        {['hod', 'faculty', 'student'].includes(selectedRole) && (
                            <>
                                <Text style={styles.fieldLabel}>Select Department</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScrollRow}>
                                    {departments.map(dept => (
                                        <TouchableOpacity
                                            key={dept}
                                            style={[
                                                styles.roleChip,
                                                selectedDepartment === dept && { backgroundColor: '#fff7ed', borderColor: '#ea580c', borderWidth: 2 }
                                            ]}
                                            onPress={() => setSelectedDepartment(dept)}
                                        >
                                            <MaterialIcons name="domain" size={16} color={selectedDepartment === dept ? '#ea580c' : '#9ca3af'} />
                                            <Text style={[styles.roleChipText, selectedDepartment === dept && { color: '#ea580c', fontWeight: '700' }]}>{dept}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* Code Input */}
                        <Text style={styles.fieldLabel}>Security Code (optional — auto-generates if empty)</Text>
                        <View style={styles.codeInputRow}>
                            <View style={styles.codeInputWrapper}>
                                <MaterialIcons name="vpn-key" size={20} color="#5e6d8d" />
                                <TextInput
                                    style={styles.codeInput}
                                    placeholder="e.g. FAC2024"
                                    placeholderTextColor="#9ca3af"
                                    value={newCode}
                                    onChangeText={setNewCode}
                                    autoCapitalize="characters"
                                    maxLength={10}
                                />
                            </View>
                            <TouchableOpacity style={styles.generateBtn} onPress={() => setNewCode(generateCode())}>
                                <MaterialIcons name="autorenew" size={20} color="#0055ff" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating}>
                            {creating ? <ActivityIndicator color="white" size="small" /> : (
                                <>
                                    <MaterialIcons name="add-circle-outline" size={20} color="white" />
                                    <Text style={styles.createBtnText}>Create Code</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Existing Codes */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Codes</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{codes.length}</Text>
                    </View>
                </View>

                {codes.length > 0 ? (
                    <View style={styles.codesList}>
                        {codes.map(item => {
                            const roleInfo = getRoleInfo(item.role);
                            return (
                                <View key={item.id} style={styles.codeCard}>
                                    <View style={styles.codeCardLeft}>
                                        <View style={[styles.roleIconBox, { backgroundColor: roleInfo.bg }]}>
                                            <MaterialIcons name={roleInfo.icon} size={22} color={roleInfo.color} />
                                        </View>
                                        <View>
                                            <Text style={styles.codeValue}>{item.code}</Text>
                                            <Text style={styles.codeRole}>{roleInfo.label}{item.department ? ` • ${item.department}` : ''}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.code)}>
                                        <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="vpn-key" size={56} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No Security Codes</Text>
                        <Text style={styles.emptySubtitle}>Tap + to create a code for any role</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },
    addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0055ff', alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

    scrollContent: { padding: 24 },

    // Form
    formCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    formTitle: { fontSize: 18, fontWeight: '800', color: '#101318', marginBottom: 4 },
    formSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 20 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
    roleScrollRow: { marginBottom: 16 },
    roleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
    roleChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    codeInputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    codeInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, height: 48, gap: 8 },
    codeInput: { flex: 1, fontSize: 16, fontWeight: '700', color: '#101318', letterSpacing: 2 },
    generateBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', height: 48, borderRadius: 12, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    createBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },

    // List
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#101318' },
    countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    countText: { fontSize: 12, fontWeight: '700', color: '#0055ff' },

    codesList: { gap: 10 },
    codeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    codeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    roleIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    codeValue: { fontSize: 18, fontWeight: '800', color: '#101318', letterSpacing: 2 },
    codeRole: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginTop: 2 },
    deleteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },

    emptyState: { alignItems: 'center', paddingVertical: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 12 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
});
