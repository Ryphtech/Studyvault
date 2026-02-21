import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Dimensions, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, seedInitialData, removeSeedData } from '../../services/firestoreService';

export default function SettingsScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.uid) {
                const data = await getUserProfile(user.uid);
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

    const handleSeedData = async () => {
        setSeeding(true);
        const success = await seedInitialData(user?.uid);
        setSeeding(false);
        if (success) {
            Alert.alert("Success", "Database seeded successfully!");
        } else {
            Alert.alert("Error", "Failed to seed database.");
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
                        const success = await removeSeedData(user?.uid);
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

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem({
                            icon: 'lock',
                            color: { bg: '#eff6ff', text: '#2563eb' },
                            label: 'Change Password'
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'shield-check',
                            color: { bg: '#ecfdf5', text: '#059669' },
                            label: 'Privacy Settings'
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
                            showChevron: false,
                            valueLabel: ' '
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'bug',
                            color: { bg: '#fef2f2', text: '#dc2626' },
                            label: 'Report a Bug'
                        })}
                        <View style={styles.divider} />
                        {renderSettingItem({
                            icon: 'file-document',
                            color: { bg: '#f3f4f6', text: '#4b5563' },
                            label: 'Terms of Service'
                        })}
                    </View>
                </View>

                {/* Data Management Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DEVELOPER</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={handleSeedData}
                            disabled={seeding || removing}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                                {seeding ? (
                                    <ActivityIndicator size="small" color="#16a34a" />
                                ) : (
                                    <MaterialCommunityIcons name="database-import" size={20} color="#16a34a" />
                                )}
                            </View>
                            <Text style={styles.settingLabel}>Seed Initial Data</Text>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={handleRemoveSeedData}
                            disabled={seeding || removing}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                                {removing ? (
                                    <ActivityIndicator size="small" color="#dc2626" />
                                ) : (
                                    <MaterialCommunityIcons name="database-remove" size={20} color="#dc2626" />
                                )}
                            </View>
                            <Text style={styles.settingLabel}>Remove Seed Data</Text>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                        </TouchableOpacity>
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
    versionText: { textAlign: 'center', fontSize: 12, color: '#94a3b8' }
});
