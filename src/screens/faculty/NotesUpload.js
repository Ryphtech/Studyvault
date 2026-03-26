import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AuthContext } from '../../context/AuthContext';
import { storage } from '../../services/firebaseConfig';
import { getUserProfile, getFacultyCourses, saveNoteMaterial } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function NotesUpload({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [profile, setProfile] = useState(null);

    const [subjects, setSubjects] = useState([]);
    const [subject, setSubject] = useState('');
    const [materialType, setMaterialType] = useState('notes');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);

    // Fetch faculty profile and ONLY their assigned subjects
    useEffect(() => {
        const init = async () => {
            try {
                const facultyId = user?.uid;
                if (!facultyId) { setLoading(false); return; }
                const profileData = await getUserProfile(facultyId);
                setProfile(profileData);

                // Get only the courses assigned to this faculty
                const assignedCourses = await getFacultyCourses(facultyId);
                const subjectList = assignedCourses.map(c => ({
                    name: c.subjectName || c.name || c.code,
                    code: c.subjectCode || c.code,
                    semester: c.semester || '',
                }));
                setSubjects(subjectList);
            } catch (error) {
                console.error("Error initializing NotesUpload:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.type !== 'cancel' && !result.canceled) {
            const asset = result.assets ? result.assets[0] : result;
            setFile(asset);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const handlePublish = async () => {
        if (!subject) {
            Alert.alert("Error", "Please select a subject.");
            return;
        }
        if (!file) {
            Alert.alert("Error", "Please attach a file to upload.");
            return;
        }

        setPublishing(true);

        let downloadUrl = file.uri || '';

        try {
            if (file.uri) {
                const response = await fetch(file.uri);
                const blob = await response.blob();
                
                const fileRef = ref(storage, `study_materials/${Date.now()}_${file.name}`);
                await uploadBytesResumable(fileRef, blob);
                downloadUrl = await getDownloadURL(fileRef);
            }
        } catch (error) {
            console.error("Error uploading file to storage:", error);
            Alert.alert("Error", "Failed to upload file to server.");
            setPublishing(false);
            return;
        }

        const selectedSubject = subjects.find(s => s.code === subject || s.name === subject);

        const noteData = {
            facultyId: user?.uid || '',
            facultyName: profile?.name || 'Faculty',
            department: profile?.department || 'Computer Science',
            semester: selectedSubject?.semester || 'All',
            subjectCode: selectedSubject?.code || subject,
            subjectName: selectedSubject?.name || subject,
            materialType,
            description,
            fileName: file.name,
            fileSize: file.size,
            fileMimeType: file.mimeType || 'application/octet-stream',
            fileUri: downloadUrl,
        };

        const result = await saveNoteMaterial(noteData);
        setPublishing(false);

        if (result.success) {
            Alert.alert("Published!", "Material has been published successfully.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Error", "Failed to publish material. Please try again.");
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 16, color: '#5e6d8d' }}>Loading subjects...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#101318" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Notes</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Target Audience Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Subject</Text>
                    <Text style={styles.sectionSubtitle}>Only your assigned subjects are shown</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Subject <Text style={styles.labelCount}>({subjects.length} assigned)</Text></Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {subjects.length > 0 ? subjects.map((sub) => (
                                <TouchableOpacity
                                    key={sub.code || sub.name}
                                    style={[styles.chip, subject === (sub.code || sub.name) && styles.chipActive]}
                                    onPress={() => setSubject(sub.code || sub.name)}
                                >
                                    <Text style={[styles.chipText, subject === (sub.code || sub.name) && styles.chipTextActive]}>{sub.name}</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text style={{ color: '#94a3b8', paddingHorizontal: 4 }}>
                                    No subjects assigned yet. Ask your HOD to assign subjects.
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Material Details Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Material Type</Text>

                    <View style={styles.radioTabs}>
                        <TouchableOpacity
                            style={[styles.radioTab, materialType === 'notes' && styles.radioTabActive]}
                            onPress={() => setMaterialType('notes')}
                        >
                            <MaterialCommunityIcons
                                name="file-document-outline"
                                size={20}
                                color={materialType === 'notes' ? '#0055ff' : '#6b7280'}
                            />
                            <Text style={[styles.radioTabText, materialType === 'notes' && styles.radioTabTextActive]}>Lecture Notes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.radioTab, materialType === 'question_bank' && styles.radioTabActive]}
                            onPress={() => setMaterialType('question_bank')}
                        >
                            <MaterialCommunityIcons
                                name="help-circle-outline"
                                size={20}
                                color={materialType === 'question_bank' ? '#0055ff' : '#6b7280'}
                            />
                            <Text style={[styles.radioTabText, materialType === 'question_bank' && styles.radioTabTextActive]}>Question Bank</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description <Text style={styles.labelOptional}>(Optional)</Text></Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="e.g. Chapter 4 Summary covering binary trees..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>
                </View>

                {/* File Attachment Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Attach File</Text>

                    {!file ? (
                        <TouchableOpacity style={styles.uploadZone} onPress={pickDocument}>
                            <View style={styles.uploadIconCircle}>
                                <MaterialCommunityIcons name="cloud-upload" size={24} color="#0055ff" />
                            </View>
                            <Text style={styles.uploadTextMain}>Click to upload</Text>
                            <Text style={styles.uploadTextSub}>PDF, DOCX up to 25MB</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.fileCard}>
                            <View style={styles.fileIconBox}>
                                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#dc2626" />
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                <Text style={styles.fileMeta}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                            </View>
                            <TouchableOpacity onPress={removeFile} style={styles.removeFileButton}>
                                <MaterialCommunityIcons name="close" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.publishButton, (!subject || !file) && { opacity: 0.5 }]}
                    onPress={handlePublish}
                    disabled={publishing || !subject || !file}
                >
                    {publishing ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="publish" size={24} color="white" />
                            <Text style={styles.publishButtonText}>Publish Material</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 55, backgroundColor: 'rgba(245, 246, 248, 0.9)', zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },

    scrollContent: { padding: 16 },

    sectionContainer: { marginBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 4 },
    sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },

    formGroup: { marginBottom: 16 },
    label: { fontSize: 16, fontWeight: '500', color: '#101318', marginBottom: 8 },
    labelOptional: { fontSize: 14, fontWeight: '400', color: '#9ca3af' },
    labelCount: { fontSize: 13, fontWeight: '400', color: '#94a3b8' },

    chip: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8, marginBottom: 8 },
    chipActive: { backgroundColor: '#0055ff', borderColor: '#0055ff' },
    chipText: { fontSize: 14, color: '#101318', fontWeight: '500' },
    chipTextActive: { color: 'white' },

    divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 24 },

    radioTabs: { flexDirection: 'row', backgroundColor: 'white', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 24 },
    radioTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 8 },
    radioTabActive: { backgroundColor: '#eff6ff' },
    radioTabText: { fontSize: 14, fontWeight: 'bold', color: '#6b7280' },
    radioTabTextActive: { color: '#0055ff' },

    textArea: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 16, color: '#101318', minHeight: 120 },

    uploadZone: { backgroundColor: 'white', borderRadius: 16, borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', height: 160, alignItems: 'center', justifyContent: 'center', padding: 16 },
    uploadIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    uploadTextMain: { fontSize: 14, fontWeight: '500', color: '#101318', marginBottom: 4 },
    uploadTextSub: { fontSize: 12, color: '#6b7280' },

    fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    fileIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    fileInfo: { flex: 1 },
    fileName: { fontSize: 14, fontWeight: '600', color: '#101318' },
    fileMeta: { fontSize: 12, color: '#6b7280' },
    removeFileButton: { padding: 8 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
    publishButton: { backgroundColor: '#0055ff', borderRadius: 12, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    publishButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});
