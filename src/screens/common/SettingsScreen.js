import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabaseClient';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, seedInitialData, removeSeedData, seedAllCurriculumData, seedFeedbackData, seedNotificationData, seedPlacementsData } from '../../services/supabaseService';

export default function SettingsScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.id) {
                const data = await getUserProfile(user.id);
                setProfile(data);
            }
            setLoadingProfile(false);
        };
        fetchProfile();
    }, [user]);

    // State for toggles
    const [pushNotifications, setPushNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [showSemesterPicker, setShowSemesterPicker] = useState(false);
    const [updatingSemester, setUpdatingSemester] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [changingPassword, setChangingPassword] = useState(false);

    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ label: `Semester ${s}`, value: s }));

    const handleUpdateSemester = async (newSemester) => {
        setShowSemesterPicker(false);
        if (profile?.semester === newSemester) return;
        setUpdatingSemester(true);
        try {
            const { error } = await supabase.from('profiles').update({ semester: newSemester }).eq('id', user.id);
            if (error) throw error;
            setProfile(prev => ({ ...prev, semester: newSemester }));
            Alert.alert("Success", "Semester updated successfully.");
        } catch (error) {
            console.error("Error updating semester:", error);
            Alert.alert("Error", "Failed to update semester.");
        } finally {
            setUpdatingSemester(false);
        }
    };

    const [seedingCurriculum, setSeedingCurriculum] = useState(false);

    const handleSeedData = async () => {
        setSeeding(true);
        const success = await seedInitialData(user?.id);
        setSeeding(false);
        if (success) {
            Alert.alert("Success", "Basic Database seeded successfully!");
        } else {
            Alert.alert("Error", "Failed to seed database.");
        }
    };

    const handleSeedCurriculum = async () => {
        setSeedingCurriculum(true);
        const success = await seedAllCurriculumData();
        setSeedingCurriculum(false);
        if (success) {
            Alert.alert("Success", "Curriculum Data seeded across all departments successfully!");
        } else {
            Alert.alert("Error", "Failed to seed curriculum data.");
        }
    };

    const [seedingFeedback, setSeedingFeedback] = useState(false);

    const handleSeedFeedback = async () => {
        setSeedingFeedback(true);
        const success = await seedFeedbackData();
        setSeedingFeedback(false);
        if (success) {
            Alert.alert("Success", "Feedback surveys seeded successfully!");
        } else {
            Alert.alert("Error", "Failed to seed feedback data.");
        }
    };

    const [seedingNotifications, setSeedingNotifications] = useState(false);

    const handleSeedNotifications = async () => {
        setSeedingNotifications(true);
        const success = await seedNotificationData();
        setSeedingNotifications(false);
        if (success) {
            Alert.alert("Success", "Notifications seeded successfully!");
        } else {
            Alert.alert("Error", "Failed to seed notifications.");
        }
    };

    const [seedingPlacements, setSeedingPlacements] = useState(false);

    const handleSeedPlacements = async () => {
        setSeedingPlacements(true);
        const success = await seedPlacementsData();
        setSeedingPlacements(false);
        if (success) {
            Alert.alert("Success", "Mock Placements data seeded successfully!");
        } else {
            Alert.alert("Error", "Failed to seed placements.");
        }
    };

    const [removing, setRemoving] = useState(false);

    const handleRemoveSeedData = async () => {
        Alert.alert(
            "Remove Seed Data",
            "Are you sure you want to remove all seeded data? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        setRemoving(true);
                        const success = await removeSeedData(user?.id);
                        setRemoving(false);
                        if (success) {
                            Alert.alert("Success", "Seeded data removed successfully!");
                        } else {
                            Alert.alert("Error", "Failed to remove data.");
                        }
                    }
                }
            ]
        );
    };

    const handleChangePassword = async () => {
        if (!passwords.newPass || !passwords.confirm) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (passwords.newPass.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }
        if (passwords.newPass !== passwords.confirm) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        setChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
            if (error) throw error;
            setShowPasswordModal(false);
            setPasswords({ current: '', newPass: '', confirm: '' });
            Alert.alert('Success', 'Password changed successfully!');
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', error.message || 'Failed to change password.');
        } finally {
            setChangingPassword(false);
        }
    };

    const renderSettingItem = ({ icon, color, label, showToggle, toggleValue, onToggle, showChevron = true, onPress, valueLabel }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={showToggle}
            activeOpacity={showToggle ? 1 : 0.7}
        >
            <View style={[styles.iconBox, { backgroundColor: color.bg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color.text} />
            </View>
            <Text style={styles.settingLabel}>{label}</Text>

            {showToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: '#e2e8f0', true: '#0055ff' }}
                    thumbColor={'white'}
                />
            ) : (
                <View style={styles.rightContent}>
                    {valueLabel && <Text style={styles.valueLabel}>{valueLabel}</Text>}
                    {showChevron && <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />}
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.profileLeft}>
                        {profile?.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' }]}>
                                <MaterialCommunityIcons name="account" size={32} color="#94a3b8" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.userName}>{loadingProfile ? "Loading..." : (profile?.name || "User")}</Text>
                            <Text style={styles.userRole}>
                                {loadingProfile ? "..." : `${profile?.role ? profile.role.toUpperCase() : "GUEST"} • ${profile?.department || "General"}`}
                            </Text>
                            <Text style={styles.userId}>{user?.email}</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                </TouchableOpacity>

                {/* Academic Section for Students */}
                {profile?.role === 'student' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ACADEMIC INTERFACE</Text>
                        <View style={styles.sectionContent}>
                            {renderSettingItem({
                                icon: 'school',
                                color: { bg: '#eff6ff', text: '#0055ff' },
                                label: 'Change Current Semester',
                                valueLabel: updatingSemester ? 'Updating...' : (profile?.semester ? `Semester ${profile.semester}` : 'Not Set'),
                                onPress: () => setShowSemesterPicker(true)
                            })}
                        </View>
                    </View>
                )}

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem({
                            icon: 'lock',
                            color: { bg: '#eff6ff', text: '#2563eb' },
                            label: 'Change Password',
                            onPress: () => setShowPasswordModal(true)
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'shield-check',
                            color: { bg: '#ecfdf5', text: '#059669' },
                            label: 'Privacy Settings',
                            onPress: () => navigation.navigate('PrivacySettings')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'cellphone-lock',
                            color: { bg: '#faf5ff', text: '#7e22ce' },
                            label: 'Two-Factor Authentication'
                        })}
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PREFERENCES</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem({
                            icon: 'bell',
                            color: { bg: '#fff7ed', text: '#ea580c' },
                            label: 'Push Notifications',
                            showToggle: true,
                            toggleValue: pushNotifications,
                            onToggle: setPushNotifications
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'translate',
                            color: { bg: '#fdf2f8', text: '#db2777' },
                            label: 'Language',
                            valueLabel: 'English'
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'theme-light-dark',
                            color: { bg: '#f1f5f9', text: '#475569' },
                            label: 'Dark Mode',
                            showToggle: true,
                            toggleValue: darkMode,
                            onToggle: setDarkMode
                        })}
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPPORT</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem({
                            icon: 'help-circle',
                            color: { bg: '#f0fdfa', text: '#0d9488' },
                            label: 'Help Center',
                            onPress: () => navigation.navigate('HelpCenter')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'bug',
                            color: { bg: '#fef2f2', text: '#dc2626' },
                            label: 'Submit Feedback',
                            onPress: () => navigation.navigate('SubmitFeedback')
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'file-document',
                            color: { bg: '#f3f4f6', text: '#4b5563' },
                            label: 'Terms of Service',
                            onPress: () => navigation.navigate('TermsOfService')
                        })}
                    </View>
                </View>

                {/* Developer Tools Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DEVELOPER TOOLS</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.devButton} onPress={handleSeedData} disabled={seeding}>
                            {seeding ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="database-plus" size={20} color="white" />
                                    <Text style={styles.devBtnText}>Seed Basic Data (Mock)</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.devButton, { backgroundColor: '#0d9488', marginTop: 12 }]} onPress={handleSeedCurriculum} disabled={seedingCurriculum}>
                            {seedingCurriculum ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="book-education" size={20} color="white" />
                                    <Text style={styles.devBtnText}>Seed All Curriculum Data</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.devButton, { backgroundColor: '#f59e0b', marginTop: 12 }]} onPress={handleSeedFeedback} disabled={seedingFeedback}>
                            {seedingFeedback ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="clipboard-check-outline" size={20} color="white" />
                                    <Text style={styles.devBtnText}>Seed Feedback Data</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.devButton, { backgroundColor: '#6366f1', marginTop: 12 }]} onPress={handleSeedNotifications} disabled={seedingNotifications}>
                            {seedingNotifications ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="bell-plus" size={20} color="white" />
                                    <Text style={styles.devBtnText}>Seed Notification Data</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.devButton, { backgroundColor: '#db2777', marginTop: 12 }]} onPress={handleSeedPlacements} disabled={seedingPlacements}>
                            {seedingPlacements ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="briefcase-plus" size={20} color="white" />
                                    <Text style={styles.devBtnText}>Seed Placements Data (Mock)</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.devButton, { backgroundColor: '#ef4444', marginTop: 12 }]} onPress={handleRemoveSeedData} disabled={removing}>
                            {removing ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="database-minus" size={20} color="white" />
                                    <Text style={styles.devBtnText}>Remove Seed Data</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.devWarningText}>
                            * Warning: "Remove" clears all collections except specific authenticated users.
                        </Text>
                    </View>
                </View>

                {/* Logout Action */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>App Version 2.4.1 (Build 2024)</Text>
                </View>

                <View style={{ height: 40 }} />

                {/* Change Password Modal */}
                <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPasswordModal(false)}>
                        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <View style={{ gap: 14 }}>
                                <View>
                                    <Text style={styles.modalLabel}>Current Password</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={passwords.current}
                                        onChangeText={t => setPasswords(p => ({ ...p, current: t }))}
                                        placeholder="Enter current password"
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry
                                    />
                                </View>
                                <View>
                                    <Text style={styles.modalLabel}>New Password</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={passwords.newPass}
                                        onChangeText={t => setPasswords(p => ({ ...p, newPass: t }))}
                                        placeholder="Min 6 characters"
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry
                                    />
                                </View>
                                <View>
                                    <Text style={styles.modalLabel}>Confirm New Password</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={passwords.confirm}
                                        onChangeText={t => setPasswords(p => ({ ...p, confirm: t }))}
                                        placeholder="Re-enter new password"
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowPasswordModal(false); setPasswords({ current: '', newPass: '', confirm: '' }); }}>
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleChangePassword} disabled={changingPassword}>
                                    {changingPassword ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.modalSaveText}>Update</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Semester Picker Dialog */}
                {showSemesterPicker && (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                        <TouchableOpacity 
                            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setShowSemesterPicker(false)}
                            activeOpacity={1}
                        >
                            <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' }}>
                                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Select Current Semester</Text>
                                </View>
                                <ScrollView style={{ maxHeight: Dimensions.get('window').height * 0.4 }}>
                                    {SEMESTERS.map(item => (
                                        <TouchableOpacity 
                                            key={item.value} 
                                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}
                                            onPress={() => handleUpdateSemester(item.value)}
                                        >
                                            <Text style={{ fontSize: 16, color: profile?.semester === item.value ? '#0055ff' : '#0f172a', fontWeight: profile?.semester === item.value ? '600' : '400' }}>
                                                {item.label}
                                            </Text>
                                            {profile?.semester === item.value && <MaterialCommunityIcons name="check" size={20} color="#0055ff" />}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity style={{ padding: 16, alignItems: 'center', backgroundColor: '#f8fafc' }} onPress={() => setShowSemesterPicker(false)}>
                                    <Text style={{ color: '#64748b', fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },

    scrollContent: { padding: 16 },

    profileCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
    profileLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#f1f5f9' },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    userRole: { fontSize: 14, fontWeight: '500', color: '#0055ff', marginTop: 2 },
    userId: { fontSize: 12, color: '#64748b', marginTop: 2 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 8, paddingLeft: 4, letterSpacing: 0.5 },
    sectionContent: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },

    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a' },

    rightContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    valueLabel: { fontSize: 14, color: '#64748b' },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 68 },

    footer: { paddingVertical: 8, gap: 16 },
    logoutButton: { backgroundColor: 'white', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
    logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
    versionText: { textAlign: 'center', fontSize: 12, color: '#94a3b8' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 24, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6, marginLeft: 2 },
    modalInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a' },
    modalCancelBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6f8' },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
    modalSaveBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0055ff' },
    modalSaveText: { fontSize: 15, fontWeight: 'bold', color: 'white' },
});
