import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPlacementDrive } from '../../services/supabaseService';

export default function ManageDrives({ navigation }) {
    const insets = useSafeAreaInsets();
    const [formData, setFormData] = useState({
        companyName: '',
        jobRole: '',
        package: '',
        minCgpa: '',
        applicationDeadline: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePostDrive = async () => {
        if (!formData.companyName || !formData.jobRole || !formData.package || !formData.minCgpa) {
            alert("Please fill in all mandatory fields.");
            return;
        }

        setLoading(true);
        try {
            const driveData = {
                companyName: formData.companyName,
                role: formData.jobRole,
                package: formData.package + " LPA",
                date: formData.applicationDeadline || "TBD", // using user input deadline
                description: formData.description,
                eligibility: `CGPA > ${formData.minCgpa}`,
                type: "Full Time", // Optional default
                isNew: true
            };

            await createPlacementDrive(driveData);
            alert("Placement Drive Posted Successfully!");
            navigation.goBack();
        } catch (error) {
            console.error(error);
            alert("Failed to post drive: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 48) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Placement Drive</Text>
                {/* Spacer for centering */}
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Company Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="domain" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>COMPANY INFORMATION</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Company Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Google, Microsoft"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.companyName}
                                    onChangeText={(text) => handleChange('companyName', text)}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Job Role</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Software Engineer"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.jobRole}
                                    onChangeText={(text) => handleChange('jobRole', text)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Eligibility & Compensation */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="cash-multiple" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>COMPENSATION & ELIGIBILITY</Text>
                        </View>
                        <View style={styles.cardRowContainer}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Package (LPA)</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, { paddingRight: 40 }]}
                                        placeholder="12.5"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="numeric"
                                        value={formData.package}
                                        onChangeText={(text) => handleChange('package', text)}
                                    />
                                    <Text style={styles.inputSuffix}>LPA</Text>
                                </View>
                            </View>
                            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Min. CGPA</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="7.5"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    value={formData.minCgpa}
                                    onChangeText={(text) => handleChange('minCgpa', text)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Timeline */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>TIMELINE</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Application Deadline</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD HH:MM"
                                    placeholderTextColor="#9ca3af"
                                    value={formData.applicationDeadline}
                                    onChangeText={(text) => handleChange('applicationDeadline', text)}
                                />
                                <Text style={styles.helperText}>Format: YYYY-MM-DD HH:MM (e.g. 2024-12-31 23:59)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="file-document-outline" size={20} color="#0055ff" />
                            <Text style={styles.sectionTitle}>JOB DETAILS</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Detailed Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe job requirements, selection process, and other details..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    value={formData.description}
                                    onChangeText={(text) => handleChange('description', text)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Visual Asset (Decorative card) */}
                    <View style={styles.readyCard}>
                        <View style={styles.readyCardContent}>
                            <View>
                                <Text style={styles.readyTitle}>Ready to publish?</Text>
                                <Text style={styles.readySubtitle}>Review all details before posting to students.</Text>
                            </View>
                            <MaterialCommunityIcons name="bullhorn-outline" size={40} color="rgba(255,255,255,0.5)" />
                        </View>
                    </View>

                    {/* Spacer for footer */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Action Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.submitButton} onPress={handlePostDrive} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="send" size={20} color="white" />
                            <Text style={styles.submitButtonText}>Post Placement Drive</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        zIndex: 10,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 16,
    },
    cardRowContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputContainer: {
        flexDirection: 'column',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#0f172a',
    },
    textArea: {
        minHeight: 120,
        paddingTop: 16,
    },
    inputSuffix: {
        position: 'absolute',
        right: 16,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    helperText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 6,
        marginLeft: 4,
    },
    readyCard: {
        backgroundColor: '#0055ff',
        borderRadius: 16,
        overflow: 'hidden',
        height: 128,
        justifyContent: 'center',
    },
    readyCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        height: '100%',
        backgroundColor: 'rgba(0, 162, 255, 0.1)', // Slight gradient effect simulated
    },
    readyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    readySubtitle: {
        fontSize: 12,
        color: '#eff6ff',
        opacity: 0.9,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
        paddingTop: 16,
    },
    submitButton: {
        backgroundColor: '#0055ff',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        shadowColor: '#0055ff',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
