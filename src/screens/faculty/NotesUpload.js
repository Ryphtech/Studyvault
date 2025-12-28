import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

const subjects = [
    { label: 'Data Structures & Algorithms', value: 'dsa' },
    { label: 'Operating Systems', value: 'os' },
    { label: 'Database Management', value: 'dbms' },
    { label: 'Computer Networks', value: 'cn' },
    { label: 'Artificial Intelligence', value: 'ai' },
];

export default function NotesUpload({ navigation }) {
    const [semester, setSemester] = useState('');
    const [subject, setSubject] = useState('');
    const [materialType, setMaterialType] = useState('notes');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (result.type !== 'cancel' && !result.canceled) {
            // Handle both old and new Expo DocumentPicker result structures
            const asset = result.assets ? result.assets[0] : result;
            setFile(asset);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#101318" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Notes</Text>
                <TouchableOpacity style={styles.historyButton}>
                    <MaterialCommunityIcons name="history" size={24} color="#101318" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Target Audience Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Target Audience</Text>
                    <Text style={styles.sectionSubtitle}>Who is this material for?</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Semester</Text>
                        <View style={styles.pickerContainer}>
                            <MaterialCommunityIcons name="chevron-down" size={24} color="#6b7280" style={styles.pickerIcon} />
                            {/* In a real app, use a Modal or Picker component. Simulating specific UI here */}
                            <TextInput
                                style={styles.pickerInput}
                                placeholder="Select Semester"
                                value={semester}
                                editable={false} // Would trigger modal
                            />
                        </View>
                        {/* Mock Selection Chips for Demo */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <TouchableOpacity
                                    key={sem}
                                    style={[styles.chip, semester === String(sem) && styles.chipActive]}
                                    onPress={() => setSemester(String(sem))}
                                >
                                    <Text style={[styles.chipText, semester === String(sem) && styles.chipTextActive]}>Sem {sem}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                            {subjects.map((sub) => (
                                <TouchableOpacity
                                    key={sub.value}
                                    style={[styles.chip, subject === sub.value && styles.chipActive]}
                                    onPress={() => setSubject(sub.value)}
                                >
                                    <Text style={[styles.chipText, subject === sub.value && styles.chipTextActive]}>{sub.label}</Text>
                                </TouchableOpacity>
                            ))}
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
                            <Text style={styles.uploadTextMain}>Click to upload or drag and drop</Text>
                            <Text style={styles.uploadTextSub}>PDF, DOCX up to 25MB</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.fileCard}>
                            <View style={styles.fileIconBox}>
                                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#dc2626" />
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                                <Text style={styles.fileMeta}>{(file.size / 1024 / 1024).toFixed(2)} MB • Just now</Text>
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
                <TouchableOpacity style={styles.publishButton}>
                    <MaterialCommunityIcons name="publish" size={24} color="white" />
                    <Text style={styles.publishButtonText}>Publish Material</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 48, backgroundColor: 'rgba(245, 246, 248, 0.9)', zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    historyButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },

    scrollContent: { padding: 16 },

    sectionContainer: { marginBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 4 },
    sectionSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },

    formGroup: { marginBottom: 16 },
    label: { fontSize: 16, fontWeight: '500', color: '#101318', marginBottom: 8 },
    labelOptional: { fontSize: 14, fontWeight: '400', color: '#9ca3af' },

    pickerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, height: 56, paddingHorizontal: 16 },
    pickerIcon: { position: 'absolute', right: 16 },
    pickerInput: { flex: 1, fontSize: 16, color: '#101318' },

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

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.8)', borderTopWidth: 1, borderTopColor: '#f3f4f6', backdropFilter: 'blur(10px)' },
    publishButton: { backgroundColor: '#0055ff', borderRadius: 12, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#0055ff', shadowOpacity: 0.3, elevation: 4 },
    publishButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});
