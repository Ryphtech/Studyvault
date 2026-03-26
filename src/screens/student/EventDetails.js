import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function EventDetails({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { event } = route.params || {};

    // Fallback if no event passed
    if (!event) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Event not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#0055ff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuA9GMMHgg73r7D7LkyUOnpQeEMuErZZeKs97SQFkMC_w9J2jePVkSJGJN3Ju3KwoDYs_RVpXJ1cF-ux9SdNnbJd4GejR4EeZOXzo2XagtRcKMST_p90VaHFZkg3D2QsMZ3Jxe4Mtuv6Kj-8KM3CQR0IYJu1dGvikE_9m1HhUkOaCOmLAk9tKaAPwYWnWY3y607RSQRyrotD2Hg6W0VG99mIbtzxTY6f53wlUsBeLFHNsj1ii3IIYii3sF2Mn9UFHZnHPeEPnLNgLak";
    const mapImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuDyX6Ez-T8FwS-cYkr70CSRckALirdeAP0FAqiMVFGqcY5RtGKMD67KQS0bVqZcihgDORhu7H68L0qIIfBG2s-zhpKoMLC6yHtPM3cE0MfsHD9gC_ZkcthWJOoV-JWZ_QgOqAUQAif4rTGvKcb3-4OXGArkT-kSlvm4TfU8be9GVmcFM4EgUzw_XuSyRwvBd_h_r0igBejNpMMOc0a7bTnNWxGYFYhHzc70jtvySKe4HIWgYMsjvF_3LfSMbNUDYumacZ9zSQk7CDE";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Top Navigation Bar - Glass Effect */}
            <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Event Details</Text>
                <TouchableOpacity style={styles.navButton}>
                    <MaterialCommunityIcons name="share-variant" size={22} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Image Section */}
                <View style={styles.heroSection}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={{ uri: event.image || defaultImage }}
                            style={styles.heroImage}
                        />
                        {event.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{event.category}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Title & Category Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.organizerRow}>
                        <MaterialCommunityIcons name="school" size={18} color="#64748b" />
                        <Text style={styles.organizerText}>Organized by College Administration</Text>
                    </View>
                </View>

                {/* Quick Info Cards Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconWrapper}>
                            <MaterialCommunityIcons name="calendar-month" size={20} color="#0055ff" />
                        </View>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{event.month ? `${event.month} ${event.dateNum || event.date}` : (event.date || 'TBA')}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconWrapper}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color="#0055ff" />
                        </View>
                        <Text style={styles.infoLabel}>Time</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>{event.time || 'TBA'}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoIconWrapper}>
                            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#0055ff" />
                        </View>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>{event.location || 'TBA'}</Text>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>About the Event</Text>
                        </View>
                        <Text style={styles.aboutText}>
                            {event.description || "Join us for an exciting event filled with learning and networking opportunities. Come prepared to engage with peers and professionals."}
                        </Text>

                        {/* Sample bullet points if none provided, to match design */}
                        <View style={styles.bulletList}>
                            <View style={styles.bulletItem}>
                                <MaterialCommunityIcons name="check-circle" size={18} color="#0055ff" style={styles.bulletIcon} />
                                <Text style={styles.bulletText}>Great networking opportunity with peers.</Text>
                            </View>
                            <View style={styles.bulletItem}>
                                <MaterialCommunityIcons name="check-circle" size={18} color="#0055ff" style={styles.bulletIcon} />
                                <Text style={styles.bulletText}>Learn from experienced professionals.</Text>
                            </View>
                            <View style={styles.bulletItem}>
                                <MaterialCommunityIcons name="check-circle" size={18} color="#0055ff" style={styles.bulletIcon} />
                                <Text style={styles.bulletText}>Refreshments provided for attendees.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Map/Location Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Venue</Text>
                        <Text style={styles.venueSubtext}>{event.location || 'Main Campus'}</Text>

                        <View style={styles.mapWrapper}>
                            <Image
                                source={{ uri: mapImage }}
                                style={styles.mapImage}
                            />
                            <View style={styles.mapPinOverlay}>
                                <MaterialCommunityIcons name="map-marker" size={40} color="#0055ff" />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Registration Bar */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <View style={styles.bottomContent}>
                    <View style={styles.feeContainer}>
                        <Text style={styles.feeLabel}>Registration Fee</Text>
                        <Text style={styles.feeValue}>Free</Text>
                    </View>
                    <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('EventRegistration', { event })}>
                        <Text style={styles.registerBtnText}>Register Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(226, 232, 240, 0.5)', zIndex: 10 },
    navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 },

    scrollContent: { paddingBottom: 20 },

    heroSection: { padding: 16 },
    imageWrapper: { width: '100%', aspectRatio: 16 / 10, borderRadius: 16, overflow: 'hidden', backgroundColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    categoryBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#0055ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    categoryText: { color: 'white', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },

    headerSection: { paddingHorizontal: 20, paddingBottom: 24 },
    eventTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', lineHeight: 32, marginBottom: 8 },
    organizerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    organizerText: { fontSize: 14, color: '#64748b' },

    infoGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 32 },
    infoCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    infoIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0, 85, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    infoLabel: { fontSize: 11, fontWeight: '500', color: '#64748b', marginBottom: 2 },
    infoValue: { fontSize: 13, fontWeight: '700', color: '#0f172a', textAlign: 'center' },

    sectionContainer: { paddingHorizontal: 16, marginBottom: 24 },
    sectionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', flex: 1 },
    aboutText: { fontSize: 14, color: '#475569', lineHeight: 22 },

    bulletList: { marginTop: 16, gap: 10 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    bulletIcon: { marginTop: 2 },
    bulletText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },

    venueSubtext: { fontSize: 14, color: '#64748b', marginBottom: 16, marginTop: -4 },
    mapWrapper: { width: '100%', height: 140, backgroundColor: '#e2e8f0', borderRadius: 12, overflow: 'hidden', position: 'relative' },
    mapImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
    mapPinOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.5)', paddingTop: 16, paddingHorizontal: 16 },
    bottomContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
    feeContainer: { flex: 1 },
    feeLabel: { fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    feeValue: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    registerBtn: { flex: 2, backgroundColor: '#0055ff', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    registerBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
