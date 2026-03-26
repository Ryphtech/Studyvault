import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function StudentProfile({ route, navigation }) {
    const { targetUid, title } = route?.params || {};
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const fetchUid = targetUid || user?.uid;
            if (fetchUid) {
                const data = await getUserProfile(fetchUid);
                setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user, targetUid]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
            </View>
        );
    }

    // fallback data if fields are missing in firestore
    const stats = [
        { label: 'CGPA', value: profile?.cgpa || profile?.academicDetails?.cgpa || 'N/A', color: '#0055ff' },
        { label: 'Semester', value: profile?.semester ? `${profile.semester}th` : 'N/A', color: '#101318' },
        { label: 'Grad Year', value: profile?.academicDetails?.expectedGraduation || '2025', color: '#101318' },
    ];

    const personalDetails = [
        { icon: 'calendar-month', label: 'Date of Birth', value: profile?.personalDetails?.dob || profile?.dob || 'N/A' },
        { icon: 'account', label: 'Gender', value: profile?.personalDetails?.gender || profile?.gender || 'N/A' },
        { icon: 'water', label: 'Blood Group', value: profile?.personalDetails?.bloodGroup || profile?.bloodGroup || 'N/A' },
    ];

    const contactInfo = [
        { icon: 'email', label: 'Email', value: profile?.email || user?.email || 'N/A', action: 'content-copy' },
        { icon: 'phone', label: 'Phone', value: profile?.contactDetails?.phone || profile?.phone || 'N/A', action: 'message-text' },
        { icon: 'map-marker', label: 'Address', value: profile?.contactDetails?.address || profile?.address || 'N/A' },
    ];

    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View style={styles.header}>
                <View style={{ width: 48 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#101318" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>{title || 'My Profile'}</Text>
                <View style={{ width: 48, alignItems: 'flex-end' }}>
                    {!targetUid && (
                        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                            <Text style={styles.editButton}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {profile?.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }]}>
                                <MaterialCommunityIcons name="account" size={64} color="#94a3b8" />
                            </View>
                        )}
                        <View style={styles.avatarBorder} />
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.viewButton}>
                            <MaterialCommunityIcons name="eye-outline" size={20} color="#101318" />
                            <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadButton}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={20} color="white" />
                            <Text style={styles.uploadButtonText}>Upload</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.nameSection}>
                        <Text style={styles.nameText}>{profile?.name || "User"}</Text>
                        <Text style={styles.idText}>{targetUid || user?.uid}</Text>
                        <View style={styles.deptBadge}>
                            <Text style={styles.deptText}>{profile?.department || "Department N/A"}</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Personal Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    <View style={styles.card}>
                        {personalDetails.map((item, index) => (
                            <View key={index} style={[styles.cardRow, index !== personalDetails.length - 1 && styles.borderBottom]}>
                                <View style={styles.rowLeft}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color="#101318" />
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
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.card}>
                        {contactInfo.map((item, index) => (
                            <View key={index} style={[styles.cardRow, index !== contactInfo.length - 1 && styles.borderBottom]}>
                                <View style={styles.rowLeft}>
                                    <View style={styles.iconBox}>
                                        <MaterialCommunityIcons name={item.icon} size={20} color="#101318" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>{item.label}</Text>
                                        <Text style={styles.value} numberOfLines={2}>{item.value}</Text>
                                    </View>
                                </View>
                                {item.action && (
                                    <TouchableOpacity>
                                        <MaterialCommunityIcons name={item.action} size={20} color="#0055ff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Sign Out Button */}
                {/* Logout Button (only if my profile) */}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)', zIndex: 10 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }, // Hover effect not native, kept simple
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    editButton: { fontSize: 16, fontWeight: 'bold', color: '#0055ff' },

    scrollContent: { paddingBottom: 24 },

    profileHeader: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
    avatarContainer: { position: 'relative', width: 128, height: 128, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    avatar: { width: 120, height: 120, borderRadius: 60, zIndex: 10 },
    avatarBorder: { position: 'absolute', width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: 'white', backgroundColor: '#e5e7eb', zIndex: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },

    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    viewButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, minWidth: 100 },
    viewButtonText: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    uploadButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#0055ff', borderRadius: 12, minWidth: 100, shadowColor: '#0055ff', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
    uploadButtonText: { fontSize: 14, fontWeight: 'bold', color: 'white' },

    nameSection: { alignItems: 'center', gap: 4 },
    nameText: { fontSize: 24, fontWeight: 'bold', color: '#101318' },
    idText: { fontSize: 16, color: '#6b7280' },
    deptBadge: { backgroundColor: 'rgba(0, 85, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 4 },
    deptText: { fontSize: 14, fontWeight: '500', color: '#0055ff' },

    statsContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },

    section: { marginBottom: 24, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 12 },
    card: { backgroundColor: 'white', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    value: { fontSize: 16, fontWeight: '500', color: '#101318' },

    footer: { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' },
    signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', maxWidth: 480, height: 48, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12 },
    signOutText: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' }
});
