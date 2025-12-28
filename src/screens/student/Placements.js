import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PlacementsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Placements</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#5e6d8d" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Card - Dream Company */}
                <LinearGradient
                    colors={['#0055ff', '#0033cc']}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroDecoration} />

                    <View style={styles.heroTop}>
                        <View style={styles.heroContent}>
                            <View style={styles.dreamBadge}>
                                <MaterialCommunityIcons name="star" size={12} color="#fde047" />
                                <Text style={styles.dreamText}>DREAM COMPANY</Text>
                            </View>
                            <Text style={styles.heroTitle}>TechFlow Systems</Text>
                            <Text style={styles.heroSubtitle}>SDE-1 • Full Time</Text>
                        </View>

                        <View style={styles.companyLogoLarge}>
                            <MaterialCommunityIcons name="domain" size={32} color="#0055ff" />
                        </View>
                    </View>

                    <View style={styles.heroGrid}>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>PACKAGE</Text>
                            <Text style={styles.gridValue}>₹18 LPA</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>CGPA</Text>
                            <Text style={styles.gridValue}>7.5+</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>DEADLINE</Text>
                            <Text style={styles.gridValue}>Nov 20</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.applyButton}>
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Active Drives List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Drives</Text>
                    <TouchableOpacity style={styles.branchSelector}>
                        <Text style={styles.branchSelectorText}>All Branches</Text>
                        <MaterialCommunityIcons name="chevron-down" size={16} color="#5e6d8d" />
                    </TouchableOpacity>
                </View>

                <View style={styles.drivesList}>

                    {/* Drive 1 - Data Analyst */}
                    <TouchableOpacity style={styles.driveCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#eef2ff', borderColor: '#e0e7ff', color: '#4f46e5' }]}>
                                <MaterialCommunityIcons name="database" size={24} color="#4f46e5" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.roleName}>Data Analyst</Text>
                                        <Text style={styles.companyName}>Analytix Corp</Text>
                                    </View>
                                    <View style={[styles.statusTag, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}>
                                        <Text style={[styles.statusText, { color: '#16a34a' }]}>NEW</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tagsContainer}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>₹8-10 LPA</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>CSE / IT</Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.metaContainer}>
                                <MaterialCommunityIcons name="calendar-clock" size={14} color="#5e6d8d" />
                                <Text style={styles.metaText}>Ends in 2 days</Text>
                            </View>
                            <TouchableOpacity style={styles.smallApplyButton}>
                                <Text style={styles.smallApplyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {/* Drive 2 - Civil Engineer */}
                    <TouchableOpacity style={[styles.driveCard, { opacity: 0.9 }]}>
                        <View style={styles.appliedCheck}>
                            <MaterialCommunityIcons name="check" size={14} color="white" />
                        </View>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#fff7ed', borderColor: '#ffedd5', color: '#ea580c' }]}>
                                <MaterialCommunityIcons name="domain" size={24} color="#ea580c" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.roleName}>Civil Engineer</Text>
                                        <Text style={styles.companyName}>BuildRight Infra</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tagsContainer}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>₹6.5 LPA</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>Civil</Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.metaContainer}>
                                <MaterialCommunityIcons name="calendar" size={14} color="#5e6d8d" />
                                <Text style={styles.metaText}>Drive: Nov 25</Text>
                            </View>
                            <View style={styles.appliedBadge}>
                                <Text style={styles.appliedText}>Applied</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Drive 3 - UI/UX Intern */}
                    <TouchableOpacity style={styles.driveCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#faf5ff', borderColor: '#f3e8ff', color: '#9333ea' }]}>
                                <MaterialCommunityIcons name="palette" size={24} color="#9333ea" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.roleName}>UI/UX Intern</Text>
                                        <Text style={styles.companyName}>CreativeStudio</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tagsContainer}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>₹25k/mo</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>All Depts</Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.metaContainer}>
                                <MaterialCommunityIcons name="folder-open" size={14} color="#5e6d8d" />
                                <Text style={styles.metaText}>Portfolio Req.</Text>
                            </View>
                            <TouchableOpacity style={styles.detailsButton}>
                                <Text style={styles.detailsText}>Details</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {/* Drive 4 - Backend Dev */}
                    <TouchableOpacity style={styles.driveCard}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: '#eff6ff', borderColor: '#dbeafe', color: '#0055ff' }]}>
                                <MaterialCommunityIcons name="server" size={24} color="#0055ff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.roleName}>Backend Dev</Text>
                                        <Text style={styles.companyName}>ServerLogic Inc.</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.tagsContainer}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>₹12 LPA</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>CSE / ECE</Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.metaContainer}>
                                <MaterialCommunityIcons name="code-tags" size={14} color="#5e6d8d" />
                                <Text style={styles.metaText}>Java/Spring</Text>
                            </View>
                            <TouchableOpacity style={styles.smallApplyButton}>
                                <Text style={styles.smallApplyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                </View>

                {/* Spacer for bottom bar */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Bottom Tab Bar (Custom) */}
            <View style={styles.bottomBar}>
                <View style={styles.tabItemsContainer}>
                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
                        <MaterialCommunityIcons name="view-dashboard-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Events')}>
                        <MaterialCommunityIcons name="calendar-month-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Events</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="briefcase" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="account-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 48, backgroundColor: 'rgba(245, 246, 248, 0.95)' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#101318' },
    filterButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

    heroCard: { borderRadius: 24, padding: 24, marginTop: 8, elevation: 8, overflow: 'hidden' },
    heroDecoration: { position: 'absolute', top: -40, right: -40, width: 192, height: 192, borderRadius: 96, backgroundColor: 'rgba(255,255,255,0.1)', opacity: 0.5 },

    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    heroContent: { flex: 1 },
    dreamBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12, gap: 4 },
    dreamText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' },
    heroTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 32, marginBottom: 4 },
    heroSubtitle: { color: '#bfdbfe', fontSize: 14, fontWeight: '500', letterSpacing: 0.2 },

    companyLogoLarge: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 4 },

    heroGrid: { flexDirection: 'row', marginTop: 24, gap: 12 },
    heroGridItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    gridLabel: { color: '#bfdbfe', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    gridValue: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    applyButton: { marginTop: 20, backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    applyButtonText: { color: '#0055ff', fontSize: 14, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    branchSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: '#f3f4f6' },
    branchSelectorText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    drivesList: { gap: 16 },
    driveCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 1, borderWidth: 1, borderColor: 'transparent' },
    cardHeader: { flexDirection: 'row', gap: 16, marginBottom: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    roleName: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    companyName: { fontSize: 12, color: '#6b7280', fontWeight: '500', marginTop: 2 },

    statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    tagsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    tag: { backgroundColor: '#f9fafb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#f3f4f6' },
    tagText: { color: '#5e6d8d', fontSize: 10, fontWeight: '500' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    smallApplyButton: { backgroundColor: '#0055ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, elevation: 2, shadowColor: '#0055ff', shadowOpacity: 0.3 },
    smallApplyText: { color: 'white', fontSize: 12, fontWeight: '600' },

    detailsButton: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    detailsText: { color: '#101318', fontSize: 12, fontWeight: '600' },

    appliedCheck: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', zIndex: 1, elevation: 2 },
    appliedBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#dcfce7' },
    appliedText: { color: '#16a34a', fontSize: 12, fontWeight: 'bold' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
