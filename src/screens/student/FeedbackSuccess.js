import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function FeedbackSuccess({ route, navigation }) {
    const insets = useSafeAreaInsets();
    // Use the ID passed from submission, or a fallback
    const submissionId = route.params?.id || `FB-${Math.floor(Math.random() * 90000) + 10000}`;

    return (
        <View style={styles.container}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

                {/* Success Icon & Blobs */}
                <View style={styles.iconContainer}>
                    {/* Background blob approximations */}
                    <View style={styles.blobLarge} />
                    <View style={styles.blobSmall1} />
                    <View style={styles.blobSmall2} />

                    <View style={styles.iconCircleOuter}>
                        <View style={styles.iconCircleInner}>
                            <MaterialIcons name="check" size={48} color="white" />
                        </View>
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                    <Text style={styles.title}>Thank You!</Text>
                    <Text style={styles.subtitle}>
                        Your feedback has been submitted successfully. We appreciate your contribution to improving our campus.
                    </Text>
                </View>

                {/* Submission ID */}
                <View style={styles.idCard}>
                    <Text style={styles.idLabel}>SUBMISSION ID</Text>
                    <Text style={styles.idValue}>#{submissionId.toString().substring(0, 8).toUpperCase()}</Text>
                </View>

            </View>

            {/* Bottom Action */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                >
                    <Text style={styles.homeBtnText}>Go Back to Dashboard</Text>
                    <MaterialIcons name="home" size={20} color="white" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                {/* Visual indicator bar at bottom (iOS style) */}
                <View style={styles.homeIndicatorWrapper}>
                    <View style={styles.homeIndicator} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },

    iconContainer: { position: 'relative', marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
    blobLarge: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(16, 185, 129, 0.05)', transform: [{ scale: 1.5 }] },
    blobSmall1: { position: 'absolute', top: -8, right: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    blobSmall2: { position: 'absolute', bottom: 16, left: -24, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0, 85, 255, 0.1)' },
    iconCircleOuter: { width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center' },
    iconCircleInner: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },

    textContent: { maxWidth: 300, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '700', color: '#0f172a', marginBottom: 16, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 24 },

    idCard: { marginTop: 48, width: '100%', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    idLabel: { fontSize: 12, fontWeight: '600', color: '#94a3b8', letterSpacing: 1 },
    idValue: { fontSize: 14, fontWeight: '600', color: '#475569' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 32, paddingTop: 32 },
    homeBtn: { flexDirection: 'row', backgroundColor: '#0055ff', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    homeBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

    homeIndicatorWrapper: { marginTop: 24, alignItems: 'center' },
    homeIndicator: { width: 128, height: 5, borderRadius: 2.5, backgroundColor: '#e2e8f0' }
});
