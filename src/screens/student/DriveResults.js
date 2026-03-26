import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getDriveById, subscribeToDriveStudents } from '../../services/firestoreService';

export default function DriveResults({ route, navigation }) {
    const { driveId } = route.params || {};
    const { user } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    const [driveData, setDriveData] = useState(null);
    const [myStatus, setMyStatus] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!driveId) return;

        const loadDrive = async () => {
            const data = await getDriveById(driveId);
            setDriveData(data);
        };
        loadDrive();

        const unsubscribe = subscribeToDriveStudents(driveId, (students) => {
            // Find my application natively by the UID
            const myApp = students.find(s => s.studentId === user?.uid);
            setMyStatus(myApp || { status: 'Applied', statusColor: 'gray' });

            const selected = students.filter(s => s.status === 'Selected');
            setSelectedStudents(selected);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [driveId, user?.uid]);

    const getStatusStyle = (color) => {
        switch (color) {
            case 'green': return { bg: '#dcfce7', text: '#16a34a', icon: 'check-circle' };
            case 'primary': return { bg: '#eff6ff', text: '#1d4ed8', icon: 'trophy' };
            case 'red': return { bg: '#fee2e2', text: '#dc2626', icon: 'close-circle' };
            case 'gray': return { bg: '#f1f5f9', text: '#64748b', icon: 'clock-outline' };
            case 'purple': return { bg: '#f3e8ff', text: '#9333ea', icon: 'star-circle' };
            default: return { bg: '#f1f5f9', text: '#64748b', icon: 'clock-outline' };
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
            </View>
        );
    }

    const myStyle = getStatusStyle(myStatus?.statusColor || 'gray');

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Drive Results</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.driveInfo}>
                    <View style={styles.companyLogo}>
                        <MaterialCommunityIcons name="domain" size={32} color="#0055ff" />
                    </View>
                    <Text style={styles.companyName}>{driveData?.companyName || 'Company Name'}</Text>
                    <Text style={styles.roleName}>{driveData?.role || 'Job Role'}</Text>
                </View>

                {/* My Status */}
                <Text style={styles.sectionTitle}>My Status</Text>
                <View style={[styles.statusCard, { backgroundColor: myStyle.bg }]}>
                    <MaterialCommunityIcons name={myStyle.icon} size={32} color={myStyle.text} />
                    <View style={styles.statusInfo}>
                        <Text style={[styles.statusTitle, { color: myStyle.text }]}>
                            {myStatus?.status ? myStatus.status.toUpperCase() : 'APPLIED'}
                        </Text>
                        <Text style={[styles.statusSubtitle, { color: myStyle.text, opacity: 0.8 }]}>
                            {myStatus?.status === 'Selected' ? 'Congratulations! You have been selected.' :
                                myStatus?.status === 'Rejected' ? 'Unfortunately, you were not selected this time.' :
                                    myStatus?.status === 'Shortlisted' ? 'You have been shortlisted for the next round.' :
                                        myStatus?.status === 'Interviewed' ? 'Your interview is complete. Awaiting final results.' :
                                            'Your application is under review.'}
                        </Text>
                    </View>
                </View>

                {/* Selected Students list */}
                <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                    <Text style={styles.sectionTitle}>Selected Candidates</Text>
                    <Text style={styles.countText}>{selectedStudents.length} Students</Text>
                </View>

                {selectedStudents.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="account-group-outline" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No candidates selected yet.</Text>
                    </View>
                ) : (
                    selectedStudents.map((student, index) => (
                        <View key={index} style={styles.studentCard}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.studentDetails}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentDept}>{student.studentRollNo} • {student.dept}</Text>
                            </View>
                            <MaterialCommunityIcons name="check-decagram" size={24} color="#1d4ed8" />
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },

    scrollContent: { padding: 16, paddingBottom: 40 },

    driveInfo: { alignItems: 'center', marginBottom: 24, padding: 16, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6' },
    companyLogo: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    companyName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    roleName: { fontSize: 14, color: '#64748b', marginTop: 4 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },

    statusCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, gap: 16 },
    statusInfo: { flex: 1 },
    statusTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    statusSubtitle: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

    countText: { fontSize: 14, color: '#64748b', fontWeight: '500', marginBottom: 12 },

    emptyState: { padding: 32, alignItems: 'center', backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', borderStyle: 'dashed' },
    emptyText: { marginTop: 12, color: '#64748b', fontSize: 14 },

    studentCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 16 },
    studentDetails: { flex: 1, marginLeft: 12 },
    studentName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
    studentDept: { fontSize: 12, color: '#64748b', marginTop: 2 },
});
