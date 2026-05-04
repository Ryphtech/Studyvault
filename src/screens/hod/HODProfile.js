import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, getFacultyCourses } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function HODProfile({ route, navigation }) {
    const { targetUid, title } = route?.params || {};
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const fetchUid = targetUid || user?.id;
            if (fetchUid) {
                const data = await getUserProfile(fetchUid);
                setProfile(data);
                try {
                    const c = await getFacultyCourses(fetchUid);
                    setCourses(c || []);
                } catch (e) {
                    console.log('Could not fetch courses:', e);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [user, targetUid]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    const professionalDetails = [
        { icon: 'briefcase-outline', label: 'Department', value: profile?.department || 'N/A', color: '#7c3aed' },
        { icon: 'crown-outline', label: 'Designation', value: profile?.designation || 'Head of Department', color: '#d97706' },
        { icon: 'identifier', label: 'Employee ID', value: profile?.employeeId || profile?.rollNo || user?.id?.substring(0, 8)?.toUpperCase() || 'N/A', color: '#0ea5e9' },
        { icon: 'school-outline', label: 'Qualification', value: profile?.qualification || 'N/A', color: '#059669' },
        { icon: 'clock-outline', label: 'Experience', value: profile?.experience ? `${profile.experience} Years` : 'N/A', color: '#ea580c' },
    ];

    const contactInfo = [
        { icon: 'email', label: 'Email', value: profile?.email || user?.email || 'N/A' },
        { icon: 'phone', label: 'Phone', value: profile?.phone || 'N/A' },
        { icon: 'map-marker', label: 'Address', value: profile?.address || 'N/A' },
    ];

    const personalInfo = [
        { icon: 'calendar', label: 'Date of Birth', value: profile?.dob || 'N/A' },
        { icon: 'account', label: 'Gender', value: profile?.gender || 'N/A' },
    ];

    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <View style={{ width: 48 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>{title || 'My Profile'}</Text>
                <View style={{ width: 48, alignItems: 'flex-end' }}>
                    {!targetUid && (
                        <TouchableOpacity onPress={() => navigation.navigate('HODEditProfile')}>
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Hero */}
                <View style={styles.profileHero}>
                    <View style={styles.heroBg}>
                        <View style={styles.heroGradient} />
                    </View>
                    <View style={styles.avatarContainer}>
                        {profile?.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                                <MaterialCommunityIcons name="account" size={64} color="#94a3b8" />
                            </View>
                        )}
                        <View style={styles.avatarRing} />
                        <View style={styles.hodBadgeIcon}>
                            <MaterialCommunityIcons name="crown" size={16} color="#d97706" />
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.viewButton} onPress={() => setShowImageModal(true)}>
                            <MaterialCommunityIcons name="eye-outline" size={20} color="#1f2937" />
                            <Text style={styles.viewButtonText}>View Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.nameSection}>
                        <Text style={styles.nameText}>{profile?.name || "HOD"}</Text>
                        <View style={styles.roleBadge}>
                            <MaterialCommunityIcons name="shield-crown" size={14} color="#7c3aed" />
                            <Text style={styles.roleText}>Head of Department</Text>
                        </View>
                        <View style={styles.deptBadge}>
                            <MaterialCommunityIcons name="domain" size={14} color="#7c3aed" />
                            <Text style={styles.deptText}>{profile?.department || "Department N/A"}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { borderBottomColor: '#7c3aed' }]}>
                        <MaterialCommunityIcons name="book-open-variant" size={22} color="#7c3aed" />
                        <Text style={[styles.statValue, { color: '#7c3aed' }]}>{courses.length}</Text>
                        <Text style={styles.statLabel}>Courses</Text>
                    </View>
                    <View style={[styles.statCard, { borderBottomColor: '#0ea5e9' }]}>
                        <MaterialCommunityIcons name="domain" size={22} color="#0ea5e9" />
                        <Text style={[styles.statValue, { color: '#0ea5e9' }]}>{profile?.department?.substring(0, 3)?.toUpperCase() || 'N/A'}</Text>
                        <Text style={styles.statLabel}>Dept</Text>
                    </View>
                    <View style={[styles.statCard, { borderBottomColor: '#059669' }]}>
                        <MaterialCommunityIcons name="clock-outline" size={22} color="#059669" />
                        <Text style={[styles.statValue, { color: '#059669' }]}>{profile?.experience || 'N/A'}</Text>
                        <Text style={styles.statLabel}>Exp (Yrs)</Text>
                    </View>
                </View>

                {/* Professional Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="briefcase-outline" size={20} color="#7c3aed" />
                        <Text style={styles.sectionTitle}>Professional Details</Text>
                    </View>
                    <View style={styles.card}>
                        {professionalDetails.map((item, index) => (
                            <View key={index} style={[styles.cardRow, index !== professionalDetails.length - 1 && styles.borderBottom]}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.value}>{item.value}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Assigned Courses */}
                {courses.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="book-education-outline" size={20} color="#0ea5e9" />
                            <Text style={styles.sectionTitle}>Assigned Courses</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{courses.length}</Text>
                            </View>
                        </View>
                        <View style={styles.card}>
                            {courses.map((course, index) => (
                                <View key={course.id || index} style={[styles.cardRow, index !== courses.length - 1 && styles.borderBottom]}>
                                    <View style={styles.rowLeft}>
                                        <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                                            <MaterialCommunityIcons name="book-open-variant" size={20} color="#0ea5e9" />
                                        </View>
                                        <View>
                                            <Text style={styles.label}>{course.subjectCode || 'N/A'}</Text>
                                            <Text style={styles.value}>{course.subjectName || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Personal Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="account-details-outline" size={20} color="#ea580c" />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>
                    <View style={styles.card}>
                        {personalInfo.map((item, index) => (
                            <View key={index} style={[styles.cardRow, index !== personalInfo.length - 1 && styles.borderBottom]}>
                                <View style={styles.rowLeft}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color="#64748b" />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.value}>{item.value}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="card-account-phone-outline" size={20} color="#059669" />
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                    </View>
                    <View style={styles.card}>
                        {contactInfo.map((item, index) => (
                            <View key={index} style={[styles.cardRow, index !== contactInfo.length - 1 && styles.borderBottom]}>
                                <View style={styles.rowLeft}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color="#64748b" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.value} numberOfLines={2}>{item.value}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Sign Out Button (only if my profile) */}
                {!targetUid && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.signOutButton} onPress={logout}>
                            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Profile Image Full-Screen Modal */}
            <Modal visible={showImageModal} transparent animationType="fade" onRequestClose={() => setShowImageModal(false)}>
                <TouchableOpacity style={styles.imageModalOverlay} activeOpacity={1} onPress={() => setShowImageModal(false)}>
                    <View style={styles.imageModalContent}>
                        {profile?.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.imageModalPhoto} resizeMode="contain" />
                        ) : (
                            <View style={[styles.imageModalPhoto, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                                <MaterialCommunityIcons name="account" size={120} color="#94a3b8" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.imageModalClose} onPress={() => setShowImageModal(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)', zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    editButton: { fontSize: 16, fontWeight: 'bold', color: '#7c3aed' },

    scrollContent: { paddingBottom: 24 },

    profileHero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, position: 'relative' },
    heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
    heroGradient: { flex: 1, backgroundColor: '#7c3aed', opacity: 0.08, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },

    avatarContainer: { position: 'relative', width: 132, height: 132, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 120, height: 120, borderRadius: 60, zIndex: 10 },
    avatarRing: { position: 'absolute', width: 132, height: 132, borderRadius: 66, borderWidth: 3, borderColor: '#7c3aed', opacity: 0.3, zIndex: 5 },
    hodBadgeIcon: { position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: 16, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', zIndex: 20 },

    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    viewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 28, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 },
    viewButtonText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },

    nameSection: { alignItems: 'center', gap: 6 },
    nameText: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f5f3ff', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginTop: 4 },
    roleText: { fontSize: 13, fontWeight: '600', color: '#7c3aed' },
    deptBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f5f3ff', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 16, marginTop: 4 },
    deptText: { fontSize: 14, fontWeight: '500', color: '#7c3aed' },

    statsContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', borderBottomWidth: 3 },
    statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 6 },
    statLabel: { fontSize: 11, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

    section: { marginBottom: 24, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
    countBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginLeft: 4 },
    countText: { fontSize: 13, fontWeight: 'bold', color: '#0ea5e9' },
    card: { backgroundColor: 'white', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    value: { fontSize: 15, fontWeight: '500', color: '#0f172a' },

    footer: { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' },
    signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 480, height: 48, backgroundColor: 'white', borderWidth: 1, borderColor: '#fee2e2', borderRadius: 12 },
    signOutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },

    imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    imageModalContent: { width: '100%', alignItems: 'center', justifyContent: 'center' },
    imageModalPhoto: { width: width * 0.85, height: width * 0.85, borderRadius: 16 },
    imageModalClose: { position: 'absolute', top: -60, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
});
