import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { subscribeToAdminStats, getUserProfile } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState('Admin');

    useEffect(() => {
        const loadName = async () => {
            if (user?.id) {
                const profile = await getUserProfile(user.id);
                if (profile?.name) setAdminName(profile.name.split(' ')[0]);
            }
        };
        loadName();
    }, [user]);

    useEffect(() => {
        const unsubscribe = subscribeToAdminStats((data) => {
            setStats(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0055ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/85.jpg' }} style={styles.adminAvatar} />
                        <View style={styles.activeDot} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Welcome back, {adminName}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#101318" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats Section */}
                <View style={styles.statsGrid}>
                    {/* Students Card - Gradient */}
                    <LinearGradient
                        colors={['#0055ff', '#0033cc']}
                        style={styles.statCardPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.statDecoration} />
                        <View style={styles.statHeader}>
                            <View style={styles.statIconBoxPrimary}>
                                <MaterialCommunityIcons name="school" size={20} color="white" />
                            </View>
                            <View style={styles.trendBadgeWhite}>
                                <Text style={styles.trendTextPrimary}>+12%</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.statValueWhite}>{stats?.totalStudents || 0}</Text>
                            <Text style={styles.statLabelWhite}>Total Students</Text>
                        </View>
                    </LinearGradient>

                    {/* Faculty Card - White */}
                    <View style={styles.statCardSecondary}>
                        <View style={styles.statHeader}>
                            <View style={styles.statIconBoxSecondary}>
                                <MaterialCommunityIcons name="account-group" size={20} color="#0055ff" />
                            </View>
                            <View style={styles.trendBadgeGreen}>
                                <Text style={styles.trendTextGreen}>+5%</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.statValueDark}>{stats?.totalFaculty || 0}</Text>
                            <Text style={styles.statLabelDark}>Faculty Members</Text>
                        </View>
                    </View>
                </View>

                {/* Manage Grid Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Manage</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.manageGrid}>
                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageStudents')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#eff6ff', color: '#2563eb' }]}>
                            <MaterialCommunityIcons name="face-man" size={32} color="#2563eb" />
                        </View>
                        <Text style={styles.manageTitle}>Students</Text>
                        <Text style={styles.manageSubtitle}>Admissions & Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageFaculty')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#eef2ff', color: '#4f46e5' }]}>
                            <MaterialCommunityIcons name="cast-education" size={32} color="#4f46e5" />
                        </View>
                        <Text style={styles.manageTitle}>Faculty</Text>
                        <Text style={styles.manageSubtitle}>Hiring & Allocations</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageHOD')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#eff6ff', color: '#0055ff' }]}>
                            <MaterialCommunityIcons name="account-tie" size={32} color="#0055ff" />
                        </View>
                        <Text style={styles.manageTitle}>Manage HOD</Text>
                        <Text style={styles.manageSubtitle}>Dept. Heads</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageEvents')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#fff7ed', color: '#ea580c' }]}>
                            <MaterialCommunityIcons name="calendar-month" size={32} color="#ea580c" />
                        </View>
                        <Text style={styles.manageTitle}>Events</Text>
                        <Text style={styles.manageSubtitle}>Calendar & Notices</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageSubjects')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#f0fdf4', color: '#16a34a' }]}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#16a34a" />
                        </View>
                        <Text style={styles.manageTitle}>Subjects</Text>
                        <Text style={styles.manageSubtitle}>Curriculum Plan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageFeedback')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#fdf2f8', color: '#db2777' }]}>
                            <MaterialCommunityIcons name="message-draw" size={32} color="#db2777" />
                        </View>
                        <Text style={styles.manageTitle}>Feedback</Text>
                        <Text style={styles.manageSubtitle}>Reviews & Surveys</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageRoleCodes')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#fef3c7', color: '#d97706' }]}>
                            <MaterialCommunityIcons name="shield-key" size={32} color="#d97706" />
                        </View>
                        <Text style={styles.manageTitle}>Security Codes</Text>
                        <Text style={styles.manageSubtitle}>Registration Keys</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('ManageDepartments')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#f0f9ff' }]}>
                            <MaterialCommunityIcons name="domain" size={32} color="#0284c7" />
                        </View>
                        <Text style={styles.manageTitle}>Departments</Text>
                        <Text style={styles.manageSubtitle}>Add Branches</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('SendNotification')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#fef2f2' }]}>
                            <MaterialCommunityIcons name="send" size={32} color="#ef4444" />
                        </View>
                        <Text style={styles.manageTitle}>Notify</Text>
                        <Text style={styles.manageSubtitle}>Send Alerts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.manageCard} onPress={() => navigation.navigate('SystemReset')}>
                        <View style={[styles.manageIconBox, { backgroundColor: '#fee2e2' }]}>
                            <MaterialCommunityIcons name="alert" size={32} color="#dc2626" />
                        </View>
                        <Text style={styles.manageTitle}>System Reset</Text>
                        <Text style={styles.manageSubtitle}>Factory Reset Data</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Updates Section */}
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Recent Updates</Text>
                </View>

                <View style={styles.updatesList}>
                    {stats?.recentActivity?.map((activity, index) => (
                        <View key={index} style={styles.updateCard}>
                            <View style={[styles.updateIconBox, { backgroundColor: activity.type === 'warning' ? '#fef3c7' : '#dcfce7', color: activity.type === 'warning' ? '#d97706' : '#16a34a' }]}>
                                <MaterialCommunityIcons name={activity.type === 'warning' ? "alert" : "check-circle"} size={20} color={activity.type === 'warning' ? '#d97706' : '#16a34a'} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.updateTitle}>{activity.title}</Text>
                                <Text style={styles.updateDesc} numberOfLines={2}>{activity.desc}</Text>
                                <Text style={styles.updateTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                    {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                        <Text style={{ color: '#9ca3af', textAlign: 'center' }}>No recent admin updates.</Text>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="view-dashboard" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ManageStudents')}>
                        <MaterialCommunityIcons name="account-group-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Students</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ManageFaculty')}>
                        <MaterialCommunityIcons name="account-tie-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Faculty</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Settings')}>
                        <MaterialCommunityIcons name="cog-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingTop: 48 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative' },
    adminAvatar: { width: 48, height: 48, borderRadius: 24 },
    activeDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22c55e', borderWidth: 2, borderColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    headerSubtitle: { fontSize: 12, color: '#5e6d8d' },
    notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },

    scrollContent: { padding: 16 },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCardPrimary: { flex: 1, height: 140, borderRadius: 16, padding: 16, justifyContent: 'space-between', elevation: 4 },
    statDecoration: { position: 'absolute', top: -20, right: -20, width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.1)' },
    statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statIconBoxPrimary: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    trendBadgeWhite: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    trendTextPrimary: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    statValueWhite: { fontSize: 28, fontWeight: 'bold', color: 'white' },
    statLabelWhite: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },

    statCardSecondary: { flex: 1, height: 140, borderRadius: 16, padding: 16, justifyContent: 'space-between', backgroundColor: 'white', elevation: 2, borderWidth: 1, borderColor: '#f3f4f6' },
    statIconBoxSecondary: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
    trendBadgeGreen: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    trendTextGreen: { color: '#15803d', fontSize: 10, fontWeight: 'bold' },
    statValueDark: { fontSize: 28, fontWeight: 'bold', color: '#101318' },
    statLabelDark: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    viewAllText: { fontSize: 12, color: '#0055ff', fontWeight: '600' },

    manageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    manageCard: { width: (width - 44) / 2, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 1, borderWidth: 1, borderColor: '#f3f4f6' },
    manageIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    manageTitle: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    manageSubtitle: { fontSize: 10, color: '#5e6d8d', marginTop: 4 },

    updatesList: { gap: 12 },
    updateCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 16, elevation: 1, borderWidth: 1, borderColor: '#f3f4f6' },
    updateIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    updateTitle: { fontSize: 14, fontWeight: 'bold', color: '#101318', marginBottom: 2 },
    updateDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 8 },
    updateTime: { fontSize: 10, color: '#9ca3af', fontWeight: '500' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
