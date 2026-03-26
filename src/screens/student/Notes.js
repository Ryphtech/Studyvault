import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile } from '../../services/firestoreService';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');
const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
const MATERIAL_TABS = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'notes', label: 'Notes', icon: 'description' },
    { key: 'question_bank', label: 'Questions', icon: 'quiz' },
];

const TYPE_COLORS = {
    notes: { bg: '#eff6ff', color: '#0055ff', icon: 'description' },
    question_bank: { bg: '#fef3c7', color: '#d97706', icon: 'quiz' },
};

export default function NotesScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState([]);
    const [department, setDepartment] = useState('');
    const [selectedSem, setSelectedSem] = useState('All');
    const [selectedType, setSelectedType] = useState('all');

    // Load student profile and fetch all notes for their department
    useEffect(() => {
        const loadData = async () => {
            try {
                if (!user?.uid) return;
                const profile = await getUserProfile(user.uid);
                const dept = profile?.department || 'Computer Science';
                setDepartment(dept);

                // Fetch all notes for this department
                const q = query(
                    collection(db, 'notes'),
                    where('department', '==', dept)
                );
                const snap = await getDocs(q);
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Sort by upload date descending
                list.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
                setNotes(list);
            } catch (error) {
                console.error("Error loading notes:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    // Filter notes
    const filtered = notes.filter(n => {
        const semMatch = selectedSem === 'All' || n.semester === selectedSem || n.semester === `Sem ${selectedSem}`;
        const typeMatch = selectedType === 'all' || n.materialType === selectedType;
        return semMatch && typeMatch;
    });

    const handleOpen = (note) => {
        if (note.fileUri) {
            Linking.openURL(note.fileUri).catch(() => {
                Alert.alert("Error", "Could not open file.");
            });
        } else {
            Alert.alert("Info", "File preview is not available. The file metadata has been recorded.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return `${diff} days ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
                <Text style={{ marginTop: 12, color: '#64748b' }}>Loading materials...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#5e6d8d" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Study Materials</Text>
                        <Text style={styles.headerSubtitle}>{department}</Text>
                    </View>
                </View>
                <View style={styles.countChip}>
                    <Text style={styles.countChipText}>{filtered.length}</Text>
                </View>
            </View>

            {/* Semester Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.semRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 24 }}>
                {SEMESTERS.map(sem => (
                    <TouchableOpacity
                        key={sem}
                        style={[styles.semChip, selectedSem === sem && styles.semChipActive]}
                        onPress={() => setSelectedSem(sem)}
                    >
                        <Text style={[styles.semChipText, selectedSem === sem && styles.semChipTextActive]}>
                            {sem === 'All' ? 'All' : `S${sem}`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Material Type Tabs */}
            <View style={styles.tabRow}>
                {MATERIAL_TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, selectedType === tab.key && styles.tabActive]}
                        onPress={() => setSelectedType(tab.key)}
                    >
                        <MaterialIcons name={tab.icon} size={16} color={selectedType === tab.key ? '#0055ff' : '#94a3b8'} />
                        <Text style={[styles.tabText, selectedType === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Notes List */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {filtered.length > 0 ? (
                    filtered.map(item => {
                        const typeInfo = TYPE_COLORS[item.materialType] || TYPE_COLORS.notes;
                        return (
                            <TouchableOpacity key={item.id} style={styles.noteCard} onPress={() => handleOpen(item)} activeOpacity={0.7}>
                                <View style={[styles.typeAccent, { backgroundColor: typeInfo.color }]} />
                                <View style={styles.noteBody}>
                                    <View style={styles.noteTop}>
                                        <View style={[styles.typeIcon, { backgroundColor: typeInfo.bg }]}>
                                            <MaterialIcons name={typeInfo.icon} size={22} color={typeInfo.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.subjectName}>{item.subjectName}</Text>
                                            <Text style={styles.subjectCode}>{item.subjectCode}</Text>
                                        </View>
                                        <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                                            <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                                                {item.materialType === 'question_bank' ? 'Q-Bank' : 'Notes'}
                                            </Text>
                                        </View>
                                    </View>

                                    {item.description ? (
                                        <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
                                    ) : null}

                                    {/* File info */}
                                    <View style={styles.fileRow}>
                                        <MaterialCommunityIcons name="file-document-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
                                        {item.fileSize ? <Text style={styles.fileSize}>{formatSize(item.fileSize)}</Text> : null}
                                    </View>

                                    {/* Meta */}
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <MaterialIcons name="person" size={13} color="#64748b" />
                                            <Text style={styles.metaText}>{item.facultyName}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <MaterialIcons name="access-time" size={13} color="#64748b" />
                                            <Text style={styles.metaText}>{formatDate(item.uploadedAt)}</Text>
                                        </View>
                                        {item.semester ? (
                                            <View style={styles.metaItem}>
                                                <MaterialIcons name="school" size={13} color="#64748b" />
                                                <Text style={styles.metaText}>Sem {item.semester?.replace?.(/\D/g, '') || item.semester}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="book-open-blank-variant" size={56} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No Materials Found</Text>
                        <Text style={styles.emptySubtitle}>
                            {selectedSem !== 'All' || selectedType !== 'all'
                                ? 'Try changing the filters above'
                                : 'No study materials have been shared yet for your department'}
                        </Text>
                    </View>
                )}
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 12, backgroundColor: 'rgba(245,246,248,0.95)' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#101318', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },
    countChip: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    countChipText: { fontSize: 14, fontWeight: '800', color: '#0055ff' },

    // Semester
    semRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    semChip: { width: 42, height: 34, borderRadius: 10, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    semChipActive: { backgroundColor: '#101318', borderColor: '#101318' },
    semChipText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    semChipTextActive: { color: 'white' },

    // Tabs
    tabRow: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 10, gap: 8 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0' },
    tabActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
    tabText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
    tabTextActive: { color: '#0055ff' },

    scrollContent: { padding: 24, paddingTop: 12 },

    // Note Card
    noteCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
    typeAccent: { width: 4 },
    noteBody: { flex: 1, padding: 16 },
    noteTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    typeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    subjectName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    subjectCode: { fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 1 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeBadgeText: { fontSize: 11, fontWeight: '700' },

    descText: { fontSize: 13, color: '#475569', marginTop: 10, lineHeight: 18 },

    fileRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, paddingHorizontal: 10 },
    fileName: { flex: 1, fontSize: 12, fontWeight: '600', color: '#475569' },
    fileSize: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },

    metaRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, fontWeight: '600', color: '#64748b' },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
});
