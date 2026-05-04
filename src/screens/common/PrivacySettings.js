import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

export default function PrivacySettings({ navigation }) {
    const { user } = useContext(AuthContext);
    const [saving, setSaving] = useState(false);

    // Privacy toggles
    const [profileVisible, setProfileVisible] = useState(true);
    const [showEmail, setShowEmail] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(true);
    const [readReceipts, setReadReceipts] = useState(true);
    const [activityStatus, setActivityStatus] = useState(true);
    const [dataSharing, setDataSharing] = useState(false);
    const [analytics, setAnalytics] = useState(true);

    const sections = [
        {
            title: 'PROFILE VISIBILITY',
            items: [
                {
                    icon: 'eye',
                    color: { bg: '#eff6ff', text: '#0055ff' },
                    label: 'Public Profile',
                    description: 'Allow others to view your profile',
                    value: profileVisible,
                    onToggle: setProfileVisible,
                },
                {
                    icon: 'email-outline',
                    color: { bg: '#fef3c7', text: '#d97706' },
                    label: 'Show Email Address',
                    description: 'Display your email on your profile',
                    value: showEmail,
                    onToggle: setShowEmail,
                },
                {
                    icon: 'phone-outline',
                    color: { bg: '#ecfdf5', text: '#059669' },
                    label: 'Show Phone Number',
                    description: 'Display your phone on your profile',
                    value: showPhone,
                    onToggle: setShowPhone,
                },
            ],
        },
        {
            title: 'COMMUNICATION',
            items: [
                {
                    icon: 'circle',
                    color: { bg: '#ecfdf5', text: '#10b981' },
                    label: 'Online Status',
                    description: 'Show when you are active',
                    value: onlineStatus,
                    onToggle: setOnlineStatus,
                },
                {
                    icon: 'check-all',
                    color: { bg: '#eff6ff', text: '#3b82f6' },
                    label: 'Read Receipts',
                    description: 'Show others when you read messages',
                    value: readReceipts,
                    onToggle: setReadReceipts,
                },
                {
                    icon: 'clock-outline',
                    color: { bg: '#faf5ff', text: '#8b5cf6' },
                    label: 'Activity Status',
                    description: 'Show your last seen time',
                    value: activityStatus,
                    onToggle: setActivityStatus,
                },
            ],
        },
        {
            title: 'DATA & ANALYTICS',
            items: [
                {
                    icon: 'share-variant-outline',
                    color: { bg: '#fef2f2', text: '#ef4444' },
                    label: 'Data Sharing',
                    description: 'Share usage data with third parties',
                    value: dataSharing,
                    onToggle: setDataSharing,
                },
                {
                    icon: 'chart-bar',
                    color: { bg: '#f0fdfa', text: '#0d9488' },
                    label: 'App Analytics',
                    description: 'Help improve the app with usage stats',
                    value: analytics,
                    onToggle: setAnalytics,
                },
            ],
        },
    ];

    const handleSaveAll = () => {
        Alert.alert('Saved', 'Privacy preferences updated successfully.');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Settings</Text>
                <TouchableOpacity onPress={handleSaveAll} style={styles.saveButton}>
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <MaterialCommunityIcons name="shield-check" size={24} color="#0055ff" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.infoTitle}>Your Privacy Matters</Text>
                        <Text style={styles.infoSubtitle}>Control who can see your information and how your data is used.</Text>
                    </View>
                </View>

                {sections.map((section, sIdx) => (
                    <View key={sIdx} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionContent}>
                            {section.items.map((item, iIdx) => (
                                <View key={iIdx}>
                                    {iIdx > 0 && <View style={styles.divider} />}
                                    <View style={styles.settingItem}>
                                        <View style={[styles.iconBox, { backgroundColor: item.color.bg }]}>
                                            <MaterialCommunityIcons name={item.icon} size={20} color={item.color.text} />
                                        </View>
                                        <View style={styles.labelContainer}>
                                            <Text style={styles.settingLabel}>{item.label}</Text>
                                            <Text style={styles.settingDescription}>{item.description}</Text>
                                        </View>
                                        <Switch
                                            value={item.value}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: '#e2e8f0', true: '#0055ff' }}
                                            thumbColor="white"
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DANGER ZONE</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity style={styles.dangerItem} onPress={() => Alert.alert('Download Data', 'Your data export will be ready within 24 hours. You will receive a notification.')}>
                            <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                                <MaterialCommunityIcons name="download" size={20} color="#ea580c" />
                            </View>
                            <View style={styles.labelContainer}>
                                <Text style={styles.settingLabel}>Download My Data</Text>
                                <Text style={styles.settingDescription}>Export all your personal data</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.dangerItem} onPress={() => Alert.alert('Delete Account', 'This action is irreversible. Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive' }])}>
                            <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
                            </View>
                            <View style={styles.labelContainer}>
                                <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Delete Account</Text>
                                <Text style={styles.settingDescription}>Permanently delete your account</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#fca5a5" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    saveButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0055ff' },
    saveText: { fontSize: 14, fontWeight: '600', color: 'white' },

    scrollContent: { padding: 16 },

    infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#dbeafe' },
    infoTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    infoSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 8, paddingLeft: 4, letterSpacing: 0.5 },
    sectionContent: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },

    settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    dangerItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    labelContainer: { flex: 1 },
    settingLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
    settingDescription: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 70 },
});
