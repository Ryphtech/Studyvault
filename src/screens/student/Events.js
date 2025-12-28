import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function EventsScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#5e6d8d" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>College Events</Text>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons name="calendar-today" size={22} color="#5e6d8d" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Featured Event Hero Card */}
                <LinearGradient
                    colors={['#0055ff', '#0033cc']}
                    style={styles.heroCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.heroDecoration} />

                    <View style={styles.heroTop}>
                        <View style={styles.heroContent}>
                            <View style={styles.featuredBadge}>
                                <MaterialCommunityIcons name="lightning-bolt" size={12} color="#fde047" />
                                <Text style={styles.featuredText}>FEATURED</Text>
                            </View>
                            <Text style={styles.heroTitle}>TechFest '24</Text>
                            <Text style={styles.heroSubtitle}>Nov 15 - 16 • Main Auditorium</Text>
                        </View>

                        <View style={styles.dateBadgeLarge}>
                            <Text style={styles.dateBadgeMonth}>NOV</Text>
                            <Text style={styles.dateBadgeDay}>15</Text>
                        </View>
                    </View>

                    <View style={styles.heroGrid}>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>EVENTS</Text>
                            <Text style={styles.gridValue}>12+</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>WORKSHOPS</Text>
                            <Text style={styles.gridValue}>5</Text>
                        </View>
                        <View style={styles.heroGridItem}>
                            <Text style={styles.gridLabel}>ENTRY</Text>
                            <Text style={styles.gridValue}>Free</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.registerButton}>
                        <Text style={styles.registerButtonText}>Register Now</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Upcoming Events List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    <TouchableOpacity style={styles.monthSelector}>
                        <Text style={styles.monthSelectorText}>This Month</Text>
                        <MaterialCommunityIcons name="chevron-down" size={16} color="#5e6d8d" />
                    </TouchableOpacity>
                </View>

                <View style={styles.eventsList}>

                    {/* Event 1 - Hackathon */}
                    <TouchableOpacity style={styles.eventCard}>
                        <View style={styles.eventCardHeader}>
                            <View style={[styles.eventIconBox, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }]}>
                                <MaterialCommunityIcons name="code-tags" size={24} color="#7c3aed" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.eventName}>Hackathon 2023</Text>
                                        <View style={styles.eventTimeBadge}>
                                            <Text style={styles.eventTimeText}>Oct 24 • 9:00 AM</Text>
                                        </View>
                                    </View>
                                    <View style={styles.activeDot} />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.eventDescription} numberOfLines={2}>
                            24-hour coding challenge. Form teams of 4 and solve real-world problems. Great prizes!
                        </Text>

                        <View style={styles.eventFooter}>
                            <View style={styles.locationContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#5e6d8d" />
                                <Text style={styles.locationText}>Computer Lab 1</Text>
                            </View>
                            <TouchableOpacity style={styles.smallRegisterButton}>
                                <Text style={styles.smallRegisterText}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {/* Event 2 - Cultural Fiesta */}
                    <TouchableOpacity style={styles.eventCard}>
                        <View style={styles.eventCardHeader}>
                            <View style={[styles.eventIconBox, { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8', color: '#db2777' }]}>
                                <MaterialCommunityIcons name="music-note" size={24} color="#db2777" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.eventName}>Cultural Fiesta</Text>
                                        <View style={styles.eventTimeBadge}>
                                            <Text style={styles.eventTimeText}>Oct 28 • 5:00 PM</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.eventDescription} numberOfLines={2}>
                            Annual cultural evening featuring music, dance, and drama performances by students.
                        </Text>

                        <View style={styles.eventFooter}>
                            <View style={styles.locationContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#5e6d8d" />
                                <Text style={styles.locationText}>Open Air Theatre</Text>
                            </View>
                            <TouchableOpacity style={styles.detailsButton}>
                                <Text style={styles.detailsButtonText}>Details</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {/* Event 3 - AI Seminar */}
                    <TouchableOpacity style={[styles.eventCard, { opacity: 0.95 }]}>
                        <View style={styles.registeredCheck}>
                            <MaterialCommunityIcons name="check" size={14} color="white" />
                        </View>
                        <View style={styles.eventCardHeader}>
                            <View style={[styles.eventIconBox, { backgroundColor: '#fff7ed', borderColor: '#ffedd5', color: '#ea580c' }]}>
                                <MaterialCommunityIcons name="brain" size={24} color="#ea580c" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.eventName}>AI Seminar</Text>
                                        <View style={styles.eventTimeBadge}>
                                            <Text style={styles.eventTimeText}>Nov 02 • 11:00 AM</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.eventDescription} numberOfLines={2}>
                            Guest lecture on "Future of AI in Healthcare" by Dr. Roberts. Mandatory for CS students.
                        </Text>

                        <View style={styles.eventFooter}>
                            <View style={styles.locationContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#5e6d8d" />
                                <Text style={styles.locationText}>Seminar Hall B</Text>
                            </View>
                            <View style={styles.registeredBadge}>
                                <Text style={styles.registeredText}>Registered</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Event 4 - Inter-Dept Sports */}
                    <TouchableOpacity style={styles.eventCard}>
                        <View style={styles.eventCardHeader}>
                            <View style={[styles.eventIconBox, { backgroundColor: '#eff6ff', borderColor: '#dbeafe', color: '#0055ff' }]}>
                                <MaterialCommunityIcons name="soccer" size={24} color="#0055ff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View>
                                        <Text style={styles.eventName}>Inter-Dept Sports</Text>
                                        <View style={styles.eventTimeBadge}>
                                            <Text style={styles.eventTimeText}>Nov 05 • 3:00 PM</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.eventDescription} numberOfLines={2}>
                            Football and Basketball selections for the college team. Bring your gear!
                        </Text>

                        <View style={styles.eventFooter}>
                            <View style={styles.locationContainer}>
                                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#5e6d8d" />
                                <Text style={styles.locationText}>Sports Ground</Text>
                            </View>
                            <TouchableOpacity style={styles.smallRegisterButton}>
                                <Text style={styles.smallRegisterText}>Register</Text>
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

                    <TouchableOpacity style={styles.tabItem}>
                        <MaterialCommunityIcons name="calendar-month" size={26} color="#0055ff" />
                        <Text style={[styles.tabLabel, { color: '#0055ff', fontWeight: 'bold' }]}>Events</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Placements')}>
                        <MaterialCommunityIcons name="briefcase-outline" size={26} color="#9aa2b1" />
                        <Text style={styles.tabLabel}>Jobs</Text>
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
    featuredBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12, gap: 4 },
    featuredText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold', lineHeight: 32, marginBottom: 4 },
    heroSubtitle: { color: '#bfdbfe', fontSize: 14, fontWeight: '500', letterSpacing: 0.2 },

    dateBadgeLarge: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' },
    dateBadgeMonth: { color: '#bfdbfe', fontSize: 12, fontWeight: '500', textTransform: 'uppercase' },
    dateBadgeDay: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },

    heroGrid: { flexDirection: 'row', marginTop: 24, gap: 12 },
    heroGridItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    gridLabel: { color: '#bfdbfe', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    gridValue: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    registerButton: { marginTop: 20, backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
    registerButtonText: { color: '#0055ff', fontSize: 14, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    monthSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: '#f3f4f6' },
    monthSelectorText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    eventsList: { gap: 16 },
    eventCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, elevation: 1, borderWidth: 1, borderColor: 'transparent' },
    eventCardHeader: { flexDirection: 'row', gap: 16, marginBottom: 8 },
    eventIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    eventName: { fontSize: 14, fontWeight: 'bold', color: '#101318' },
    eventTimeBadge: { marginTop: 4, backgroundColor: '#f9fafb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    eventTimeText: { fontSize: 11, color: '#5e6d8d', fontWeight: '500' },
    activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },

    eventDescription: { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 16 },

    eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 12, color: '#5e6d8d', fontWeight: '500' },

    smallRegisterButton: { backgroundColor: '#0055ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, elevation: 2, shadowColor: '#0055ff', shadowOpacity: 0.3 },
    smallRegisterText: { color: 'white', fontSize: 12, fontWeight: '600' },

    detailsButton: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    detailsButtonText: { color: '#101318', fontSize: 12, fontWeight: '600' },

    registeredCheck: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', zIndex: 1, elevation: 2 },
    registeredBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#dcfce7' },
    registeredText: { color: '#16a34a', fontSize: 12, fontWeight: 'bold' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: '#f3f4f6', height: 80, paddingBottom: 20 },
    tabItemsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: '100%' },
    tabItem: { alignItems: 'center', gap: 4, padding: 8, width: 64 },
    tabLabel: { fontSize: 10, color: '#9aa2b1', fontWeight: '500' }
});
