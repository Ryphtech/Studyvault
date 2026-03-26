import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db, auth } from '../../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function AddFaculty({ navigation }) {
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !email || !department) {
            Alert.alert("Validation Error", "Please fill in all required fields (Name, Email, Department).");
            return;
        }

        setLoading(true);
        try {
            // Give them a default password they must change later
            const defaultPassword = 'Faculty@123';
            
            // Note: Creating a user client-side will automatically sign them in, logging out the Admin.
            // In a production app with a backend, we would use the Firebase Admin SDK to avoid this.
            const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
            const user = userCredential.user;

            const newFaculty = {
                uid: user.uid,
                name,
                email,
                role: 'faculty',
                department,
                designation: designation || 'Assistant Professor',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", user.uid), newFaculty);
            
            Alert.alert(
                "Success", 
                `Faculty created successfully!\n\nEmail: ${email}\nPassword: ${defaultPassword}\n\nNote: For security reasons, your admin session has ended. Please log back in.`,
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message || "Failed to add faculty.");
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
                <Text style={styles.headerTitle}>Add Faculty</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>FACULTY DETAILS</Text>
                    <View style={styles.formCard}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Dr. Robert Chen"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="robert.chen@college.edu"
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
                                placeholder="e.g. Senior Professor"
                                placeholderTextColor="#94a3b8"
                                value={designation}
                                onChangeText={setDesignation}
                            />
                        </View>

                    </View>
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
                        <Text style={styles.saveButtonText}>Add Faculty</Text>
                    )}
                </TouchableOpacity>
            </View>
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

    sectionLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 12, letterSpacing: 0.5 },
    formCard: { backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9', gap: 16 },

    inputGroup: { marginBottom: 4 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, height: 48, paddingHorizontal: 16, fontSize: 15, color: '#0f172a' },

    footer: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    saveButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600' }
});
