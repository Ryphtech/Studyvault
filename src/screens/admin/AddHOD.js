import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabaseClient';

const { width } = Dimensions.get('window');

export default function AddHOD({ navigation }) {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('Head of Department');

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !email || !department) {
            Alert.alert("Validation Error", "Please fill in all required fields (Name, Email, Department).");
            return;
        }

        setLoading(true);
        try {
            // Default password for new accounts
            const defaultPassword = 'HOD@User123';
            
            // 1. Create Auth User
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password: defaultPassword,
            });
            if (signUpError) throw signUpError;
            
            const user = signUpData.user;
            if (!user) throw new Error('Failed to create HOD account.');

            // 2. Create Profile in 'profiles' table
            const { error: profileError } = await supabase.from('profiles').insert({
                id: user.id,
                name,
                email,
                role: 'hod',
                department,
                designation: designation || 'Head of Department',
                created_at: new Date().toISOString()
            });
            if (profileError) throw profileError;
            
            Alert.alert(
                "Success", 
                `HOD account created successfully!\n\nEmail: ${email}\nPassword: ${defaultPassword}\n\nPlease share these credentials with the new HOD.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message || "Failed to add HOD.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New HOD</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>HOD PROFILE INFORMATION</Text>
                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Dr. Sarah Jenkins"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="hod.cs@college.edu"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Department *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Computer Science"
                                placeholderTextColor="#94a3b8"
                                value={department}
                                onChangeText={setDepartment}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Designation</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Professor & HOD"
                                placeholderTextColor="#94a3b8"
                                value={designation}
                                onChangeText={setDesignation}
                            />
                        </View>
                    </View>
                    <Text style={styles.noteText}>* These fields are mandatory for account creation.</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Create HOD Account</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    iconButton: { padding: 4, borderRadius: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    
    scrollContent: { paddingBottom: 40 },
    section: { paddingHorizontal: 16, paddingTop: 24 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', marginBottom: 16, letterSpacing: 1 },
    formCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9', gap: 20 },
    
    inputGroup: { gap: 8 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#0f172a' },
    
    noteText: { fontSize: 12, color: '#94a3b8', marginTop: 16, fontStyle: 'italic', marginLeft: 4 },

    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    saveButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
