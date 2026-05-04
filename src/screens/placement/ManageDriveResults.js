import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDriveById, subscribeToDriveStudents, updateApplicationStatuses } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function ManageDriveResults({ route, navigation }) {
    const { driveId } = route.params || {};
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [driveData, setDriveData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!driveId) return;

        const loadDriveDetails = async () => {
            const data = await getDriveById(driveId);
            setDriveData(data);
        };
        loadDriveDetails();

        const unsubscribe = subscribeToDriveStudents(driveId, (fetchedStudents) => {
            setStudents(fetchedStudents);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [driveId]);

    const handleUpdateStatus = (studentId, newStatus) => {
        setStudents(currentStudents =>
            currentStudents.map(student => {
                if (student.id === studentId) {
                    // Update color based on status mapping
                    let statusColor = 'gray';
                    if (newStatus === 'Shortlisted') statusColor = 'purple';
                    if (newStatus === 'Interviewed') statusColor = 'green';
                    if (newStatus === 'Selected') statusColor = 'primary';
                    if (newStatus === 'Rejected') statusColor = 'red';

                    return { ...student, status: newStatus, statusColor };
                }
                return student;
            })
        );
    };

    const handleConfirmUpload = async () => {
        setSaving(true);
        const updates = students.map(s => ({
            id: s.id,
            status: s.status,
            statusColor: s.statusColor
        }));

        const success = await updateApplicationStatuses(updates);
        setSaving(false);

        if (success) {
            alert(`Successfully saved results for ${students.length} students!`);
            navigation.goBack();
        } else {
            alert('Failed to save results. Please try again.');
        }
    };

    // Calculate dynamic counts based on the fetched students  
    const counts = {
        'All': students.length,
        'Shortlisted': students.filter(s => s.status === 'Shortlisted').length,
        'Selected': students.filter(s => s.status === 'Selected').length,
        'Rejected': students.filter(s => s.status === 'Rejected').length,
    };

    const tabs = [
        { name: 'All', count: counts['All'] },
        { name: 'Shortlisted', count: counts['Shortlisted'] },
        { name: 'Selected', count: counts['Selected'] },
        { name: 'Rejected', count: counts['Rejected'] }
    ];

    const filteredStudents = students.filter(student => {
        // Tab filtering
        if (activeTab !== 'All' && student.status !== activeTab) {
            // Include 'Interviewed' into 'Shortlisted' tab for visualization logic 
            // since we don't have a specific 'Interviewed' tab
            if (activeTab === 'Shortlisted' && student.status === 'Interviewed') {
                return true;
            } else {
                return false;
            }
        }

        // Search filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return student.name.toLowerCase().includes(query) ||
                (student.studentRollNo && student.studentRollNo.toLowerCase().includes(query));
        }

        return true;
    });

    const getStatusStyle = (colorKeyword) => {
        switch (colorKeyword) {
            case 'green': return { bg: '#dcfce7', text: '#16a34a' };
            case 'primary': return { bg: 'rgba(13, 89, 242, 0.1)', text: '#0055ff' };
            case 'red': return { bg: '#fee2e2', text: '#dc2626' };
            case 'gray': return { bg: '#f1f5f9', text: '#64748b' };
            case 'purple': return { bg: '#f3e8ff', text: '#9333ea' };
            default: return { bg: '#f1f5f9', text: '#64748b' };
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={[styles.headerWrapper, { paddingTop: Math.max(insets.top, 48) }]}>
                {/* Top Nav */}
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#0f172a" />
                        <Text style={styles.backButtonText}>Drives</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Manage Results</Text>
                    <TouchableOpacity>
                        <Text style={styles.exportText}>Export</Text>
                    </TouchableOpacity>
                </View>

                {/* Context Info */}
                <View style={styles.contextInfo}>
                    <Text style={styles.driveName}>{driveData?.companyName || 'Loading...'} - {driveData?.role || ''}</Text>
                    <Text style={styles.driveDate}>Drive Date: {driveData?.date || ''}</Text>
                </View>

                {/* Search Row */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or ID"
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterButton}>
                        <MaterialCommunityIcons name="tune" size={24} color="#475569" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.name}
                                style={[styles.tabButton, activeTab === tab.name && styles.activeTabButton]}
                                onPress={() => setActiveTab(tab.name)}
                            >
                                <Text style={[styles.tabText, activeTab === tab.name && styles.activeTabText]}>
                                    {tab.name} ({tab.count})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* List Content */}
            <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {loading ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#0055ff" />
                        <Text style={{ marginTop: 12, color: '#6b7280' }}>Fetching applicants...</Text>
                    </View>
                ) : filteredStudents.length === 0 ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="inbox-outline" size={48} color="#cbd5e1" />
                        <Text style={{ marginTop: 12, color: '#64748b', fontSize: 16 }}>No students found.</Text>
                    </View>
                ) : (
                    filteredStudents.map((student, index) => {
                        const statusStyle = getStatusStyle(student.statusColor);
                        // Dim Applied students to match "opacity-80" in HTML
                        const opacityStyle = student.status === 'Applied' ? { opacity: 0.8 } : {};

                        return (
                            <View key={index} style={[styles.studentCard, opacityStyle]}>
                                {/* Card Top */}
                                <View style={styles.cardTop}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
                                    </View>
                                    <View style={styles.infoCol}>
                                        <View style={styles.nameRow}>
                                            <View>
                                                <Text style={styles.studentName}>{student.name}</Text>
                                                <Text style={styles.studentDetails}>ID: {student.studentRollNo} • {student.dept}</Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                                                    {student.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Action Buttons Row */}
                                <View style={styles.quickActionsRow}>
                                    <TouchableOpacity
                                        style={[styles.qActionButton, student.status === 'Shortlisted' && styles.qActionActive]}
                                        onPress={() => handleUpdateStatus(student.id, 'Shortlisted')}
                                    >
                                        <Text style={[styles.qActionText, student.status === 'Shortlisted' && styles.qActionTextActive]}>Shortlist</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.qActionButton, student.status === 'Interviewed' && styles.qActionActive]}
                                        onPress={() => handleUpdateStatus(student.id, 'Interviewed')}
                                    >
                                        <Text style={[styles.qActionText, student.status === 'Interviewed' && styles.qActionTextActive]}>Interview</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.qActionButton, student.status === 'Selected' && styles.qActionActive]}
                                        onPress={() => handleUpdateStatus(student.id, 'Selected')}
                                    >
                                        <Text style={[styles.qActionText, student.status === 'Selected' && styles.qActionTextActive]}>Select</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.qActionButton, student.status === 'Rejected' && styles.qActionActive]}
                                        onPress={() => handleUpdateStatus(student.id, 'Rejected')}
                                    >
                                        <Text style={[styles.qActionText, student.status === 'Rejected' && { color: '#ef4444' }]}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}

                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                        Total Updates: <Text style={styles.statsTextDark}>{students.length} Students</Text>
                    </Text>
                    <Text style={styles.statsTextPrimary}>{counts.Selected} Selected • {counts.Rejected} Rejected</Text>
                </View>
                <TouchableOpacity
                    style={[styles.confirmButton, saving && { opacity: 0.7 }]}
                    onPress={handleConfirmUpload}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="cloud-upload" size={24} color="white" />
                            <Text style={styles.confirmButtonText}>Confirm & Upload Results</Text>
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
    headerWrapper: {
        backgroundColor: 'rgba(245, 246, 248, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        zIndex: 10,
    },
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#0f172a',
        marginLeft: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    exportText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#0055ff',
    },
    contextInfo: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    driveName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    driveDate: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(226, 232, 240, 0.5)', // bg-slate-200/50
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0f172a',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(226, 232, 240, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabsContainer: {
        paddingBottom: 16,
    },
    tabsScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeTabButton: {
        backgroundColor: '#0055ff',
        borderColor: '#0055ff',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    activeTabText: {
        color: 'white',
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    studentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 85, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0055ff',
    },
    infoCol: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    studentDetails: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    quickActionsRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 4,
        gap: 6,
    },
    qActionButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    qActionActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    qActionText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#64748b',
    },
    qActionTextActive: {
        color: '#0055ff',
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    statsText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    statsTextDark: {
        color: '#0f172a',
    },
    statsTextPrimary: {
        fontSize: 12,
        color: '#0055ff',
        fontWeight: '500',
    },
    confirmButton: {
        backgroundColor: '#0055ff',
        borderRadius: 16,
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
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
