import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createFeedbackSurvey, updateFeedbackSurvey, getUserProfile } from '../../services/supabaseService';
import { AuthContext } from '../../context/AuthContext';

const COLORS = [
    { id: 'blue', hex: '#2563eb', bg: '#eff6ff' },
    { id: 'purple', hex: '#9333ea', bg: '#faf5ff' },
    { id: 'orange', hex: '#ea580c', bg: '#fff7ed' },
    { id: 'green', hex: '#16a34a', bg: '#dcfce7' },
    { id: 'red', hex: '#dc2626', bg: '#fef2f2' },
];

const ICONS = [
    'clipboard-text', 'school', 'flask', 'bookshelf', 'account-group', 'chart-bar', 'hand-wave', 'monitor'
];

export default function CreateFeedback({ navigation, route }) {
    const { user } = useContext(AuthContext);
    const surveyToEdit = route.params?.survey; // If editing
    
    const [title, setTitle] = useState(surveyToEdit?.title || '');
    const [department, setDepartment] = useState(surveyToEdit?.department || '');
    const [selectedColor, setSelectedColor] = useState(surveyToEdit?.color || 'blue');
    const [selectedIcon, setSelectedIcon] = useState(surveyToEdit?.icon || 'clipboard-text');
    const [status, setStatus] = useState(surveyToEdit?.status || 'Active');
    
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!surveyToEdit) {
            // Fetch HOD's department if creating new
            getUserProfile(user?.id).then(prof => {
                if(prof?.department) setDepartment(prof.department);
            });
        }
    }, []);

    const handleSave = async (forceStatus = null) => {
        if (!title.trim()) {
            Alert.alert("Missing Info", "Please enter a survey title.");
            return;
        }

        const surveyData = {
            title: title.trim(),
            department,
            color: selectedColor,
            icon: selectedIcon,
            status: forceStatus || status,
            questions: [] // Simplified: questions can be added in a v2 builder if needed
        };

        setIsSaving(true);
        try {
            let success = false;
            if (surveyToEdit?.id) {
                const res = await updateFeedbackSurvey(surveyToEdit.id, surveyData);
                success = res.success;
            } else {
                const res = await createFeedbackSurvey(surveyData);
                success = res.success;
            }

            if (success) {
                Alert.alert("Success", `Survey ${surveyToEdit ? 'updated' : 'created'} successfully!`);
                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to save survey. Please try again.");
            }
        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{surveyToEdit ? 'Edit Survey' : 'New Survey'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.label}>Survey Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. End of Semester Evaluation"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Department Targeting</Text>
                    <View style={styles.readonlyField}>
                        <MaterialCommunityIcons name="domain" size={20} color="#6b7280" />
                        <Text style={styles.readonlyText}>{department || 'Loading...'}</Text>
                    </View>
                </View>

                {/* Theme Color Picker */}
                <View style={styles.section}>
                    <Text style={styles.label}>Theme Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                        {COLORS.map(c => (
                            <TouchableOpacity 
                                key={c.id} 
                                style={[styles.colorCircle, { backgroundColor: c.hex }, selectedColor === c.id && styles.colorCircleSelected]}
                                onPress={() => setSelectedColor(c.id)}
                            >
                                {selectedColor === c.id && <MaterialCommunityIcons name="check" size={20} color="white" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Icon Picker */}
                <View style={styles.section}>
                    <Text style={styles.label}>Survey Icon</Text>
                    <View style={styles.iconGrid}>
                        {ICONS.map(i => {
                            const isSelected = selectedIcon === i;
                            const activeColor = COLORS.find(c => c.id === selectedColor)?.hex || '#2563eb';
                            const activeBg = COLORS.find(c => c.id === selectedColor)?.bg || '#eff6ff';
                            return (
                                <TouchableOpacity 
                                    key={i} 
                                    style={[styles.iconBox, isSelected && { backgroundColor: activeBg, borderColor: activeColor }]}
                                    onPress={() => setSelectedIcon(i)}
                                >
                                    <MaterialCommunityIcons name={i} size={28} color={isSelected ? activeColor : '#6b7280'} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.statusRow}>
                        <TouchableOpacity 
                            style={[styles.statusBox, status === 'Draft' && styles.statusBoxActive]}
                            onPress={() => setStatus('Draft')}
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color={status === 'Draft' ? '#0055ff' : '#6b7280'} />
                            <Text style={[styles.statusText, status === 'Draft' && styles.statusTextActive]}>Draft</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.statusBox, status === 'Active' && styles.statusBoxActiveGreen]}
                            onPress={() => setStatus('Active')}
                        >
                            <MaterialCommunityIcons name="check-circle-outline" size={20} color={status === 'Active' ? '#16a34a' : '#6b7280'} />
                            <Text style={[styles.statusText, status === 'Active' && { color: '#16a34a' }]}>Active</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.statusBox, status === 'Closed' && styles.statusBoxActiveGray]}
                            onPress={() => setStatus('Closed')}
                        >
                            <MaterialCommunityIcons name="close-circle-outline" size={20} color={status === 'Closed' ? '#4b5563' : '#6b7280'} />
                            <Text style={[styles.statusText, status === 'Closed' && { color: '#4b5563' }]}>Closed</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave()} disabled={isSaving}>
                    {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Survey</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    
    scrollContent: { padding: 20 },
    section: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, color: '#111827' },
    
    readonlyField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e5e7eb', borderRadius: 12, padding: 14, gap: 10 },
    readonlyText: { fontSize: 16, color: '#4b5563', fontWeight: '500' },
    
    colorRow: { flexDirection: 'row', gap: 16 },
    colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
    colorCircleSelected: { borderColor: '#111827' },

    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    iconBox: { width: 64, height: 64, backgroundColor: 'white', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },

    statusRow: { flexDirection: 'row', gap: 12 },
    statusBox: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent' },
    statusText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
    statusBoxActive: { borderColor: '#0055ff', backgroundColor: '#eff6ff' },
    statusTextActive: { color: '#0055ff' },
    statusBoxActiveGreen: { borderColor: '#16a34a', backgroundColor: '#dcfce7' },
    statusBoxActiveGray: { borderColor: '#4b5563', backgroundColor: '#f3f4f6' },

    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    saveBtn: { backgroundColor: '#0055ff', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
