import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { getDriveById, getUserProfile, applyForDrive } from '../../services/firestoreService';
import { AuthContext } from '../../context/AuthContext';

export default function ApplyDrive({ route, navigation }) {
    const { driveId } = route.params || {};
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    const [statement, setStatement] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [driveData, setDriveData] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                // Ensure size is less than 5MB (5 * 1024 * 1024 bytes = 5242880)
                const file = result.assets[0];
                if (file.size > 5242880) {
                    alert('File size exceeds 5MB limit. Please choose a smaller file.');
                    return;
                }
                setSelectedFile(file);
            }
        } catch (error) {
            console.error("Error picking document:", error);
            alert('An error occurred while selecting the file.');
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    useEffect(() => {
        const loadScreenData = async () => {
            if (!driveId || !user?.uid) return;

            try {
                // Fetch drive and user data in parallel
                const [drive, profile] = await Promise.all([
                    getDriveById(driveId),
                    getUserProfile(user.uid)
                ]);

                setDriveData(drive);
                setStudentData(profile);
            } catch (error) {
                console.error("Error loading apply drive data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadScreenData();
    }, [driveId, user?.uid]);

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('Please select a resume PDF to upload.');
            return;
        }

        setSubmitting(true);
        const applicationData = {
            statement: statement,
            resumeName: selectedFile.name,
            // In a full implementation, you'd upload the file to Firebase Storage here and save the URL.
            // For now, we just save the name to show it's "attached".
        };

        const result = await applyForDrive(driveId, user.uid, applicationData);
        setSubmitting(false);

        if (result.success) {
            alert('Application successfully submitted!');
            navigation.goBack();
        } else {
            alert('Failed to submit application. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
            </View>
        );
    }

    // Safely parse CGPA and branch from student profile
    const studentName = studentData?.name || user?.displayName || 'Student';
    const cgpa = studentData?.cgpa || studentData?.academicDetails?.cgpa || 'N/A';
    const branch = studentData?.department || studentData?.academicDetails?.department || 'N/A';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 32) }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Apply for Drive</Text>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialCommunityIcons name="information-outline" size={24} color="#5e6d8d" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Drive Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.companyHeader}>
                            <View style={styles.companyIconBox}>
                                <MaterialCommunityIcons name="domain" size={32} color="#0055ff" />
                            </View>
                            <View>
                                <Text style={styles.companyName}>{driveData?.companyName || 'Company Name'}</Text>
                                <Text style={styles.roleName}>{driveData?.role || 'Job Role'}</Text>
                            </View>
                        </View>
                        <View style={styles.jobDetailsRow}>
                            <View style={styles.jobDetailItem}>
                                <MaterialCommunityIcons name="cash" size={18} color="#9ca3af" />
                                <Text style={styles.jobDetailText}>{driveData?.package || 'N/A'}</Text>
                            </View>
                            <View style={styles.jobDetailItem}>
                                <MaterialCommunityIcons name="map-marker-outline" size={18} color="#9ca3af" />
                                <Text style={styles.jobDetailText}>{driveData?.location || 'Location TBA'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Content */}
                    <View style={styles.formContainer}>
                        {/* Personal Details */}
                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Personal Details</Text>
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.inputReadonly}
                                    value={studentName}
                                    editable={false}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>CGPA</Text>
                                    <TextInput
                                        style={styles.inputReadonly}
                                        value={String(cgpa)}
                                        editable={false}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Branch</Text>
                                    <TextInput
                                        style={styles.inputReadonly}
                                        value={branch}
                                        editable={false}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Documents */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Documents</Text>

                            {!selectedFile ? (
                                <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
                                    <MaterialCommunityIcons name="cloud-upload-outline" size={36} color="#0055ff" style={{ marginBottom: 8 }} />
                                    <Text style={styles.uploadTitle}>Choose File</Text>
                                    <Text style={styles.uploadSubtitle}>PDF only (Max 5MB)</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.fileItem}>
                                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#0055ff" />
                                    <View style={styles.fileInfo}>
                                        <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                        <Text style={styles.fileMeta}>
                                            {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Size unknown'} • Ready to upload
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={handleRemoveFile}>
                                        <MaterialCommunityIcons name="close" size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Statement */}
                        <View style={styles.formSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Statement</Text>
                                <Text style={styles.optionalText}>Optional</Text>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Why should we hire you?</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Write a brief cover letter or explain why you're a good fit..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={statement}
                                    onChangeText={setStatement}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>Submit Application</Text>
                            <MaterialCommunityIcons name="send" size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
                <Text style={styles.disclaimerText}>
                    By submitting, you agree to share your profile details with {driveData?.companyName || 'the company'}.
                </Text>
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
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: 'rgba(245, 246, 248, 0.9)',
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#101318',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 8,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    companyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    companyIconBox: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 85, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#101318',
    },
    roleName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0055ff',
        marginTop: 2,
    },
    jobDetailsRow: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f9fafb',
    },
    jobDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    jobDetailText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4b5563',
    },
    formContainer: {
        gap: 24,
    },
    formSection: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#6b7280',
    },
    verifiedBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#15803d',
    },
    optionalText: {
        fontSize: 10,
        fontStyle: 'italic',
        fontWeight: '500',
        color: '#9ca3af',
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5e6d8d',
        marginLeft: 4,
    },
    inputReadonly: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#101318',
    },
    uploadSubtitle: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        color: '#6b7280',
        marginTop: 4,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        borderWidth: 1,
        borderColor: '#dbeafe',
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#101318',
    },
    fileMeta: {
        fontSize: 10,
        fontWeight: '500',
        color: '#6b7280',
        marginTop: 2,
    },
    textArea: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#101318',
        minHeight: 100,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    submitButton: {
        backgroundColor: '#0055ff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#0055ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disclaimerText: {
        fontSize: 10,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '500',
    },
});
