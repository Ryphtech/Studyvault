import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, StatusBar, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getStudentDashboardStats, getUserProfile, saveEventRegistration } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

const PARTICIPATION_OPTIONS = [
    { label: 'Attendee (Watch sessions)', value: 'attendee' },
    { label: 'Participant (Compete in events)', value: 'participant' },
    { label: 'Volunteer (Help organizing)', value: 'volunteer' }
];

export default function EventRegistration({ route, navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const { event } = route.params || {};

    // Form State
    const [stats, setStats] = useState({ name: '', department: '', rollNo: '' });
    const [participationType, setParticipationType] = useState(PARTICIPATION_OPTIONS[0]);
    const [requirements, setRequirements] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [pickerVisible, setPickerVisible] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const studentId = user?.id || 'student_demo';
                const statsData = await getStudentDashboardStats(studentId);
                const profile = await getUserProfile(studentId);
                setStats({
                    name: statsData?.name || 'Loading...',
                    department: statsData?.department || 'Loading...',
                    rollNo: profile?.id || profile?.rollNo || studentId.substring(0, 10).toUpperCase()
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, [user]);

    const [registering, setRegistering] = useState(false);

    const handleRegister = async () => {
        if (!termsAccepted) {
            Alert.alert("Action Required", "Please agree to the event terms and conditions.");
            return;
        }

        setRegistering(true);
        try {
            const result = await saveEventRegistration({
                eventId: event.id || '',
                eventTitle: event.title || '',
                studentId: user?.id || 'student_demo',
                studentName: stats.name,
                department: stats.department,
                rollNo: stats.rollNo,
                participationType: participationType.value,
                specialRequirements: requirements.trim(),
            });

            if (result.success) {
                Alert.alert("Success!", "You have successfully registered for this event.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", "Failed to register. Please try again.");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred.");
            console.error(error);
        } finally {
            setRegistering(false);
        }
    };

    if (!event) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No event data provided.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#0055ff' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const defaultImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuA9GMMHgg73r7D7LkyUOnpQeEMuErZZeKs97SQFkMC_w9J2jePVkSJGJN3Ju3KwoDYs_RVpXJ1cF-ux9SdNnbJd4GejR4EeZOXzo2XagtRcKMST_p90VaHFZkg3D2QsMZ3Jxe4Mtuv6Kj-8KM3CQR0IYJu1dGvikE_9m1HhUkOaCOmLAk9tKaAPwYWnWY3y607RSQRyrotD2Hg6W0VG99mIbtzxTY6f53wlUsBeLFHNsj1ii3IIYii3sF2Mn9UFHZnHPeEPnLNgLak";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Glass Nav */}
            <View style={[styles.navBar, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="chevron-left" size={28} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Event Registration</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Event Snippet */}
                    <View style={styles.eventCard}>
                        <View style={styles.eventImageWrapper}>
                            <Image source={{ uri: event.image || defaultImage }} style={styles.eventImage} />
                        </View>
                        <View style={styles.eventInfo}>
                            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                            <View style={styles.metaRow}>
                                <MaterialIcons name="calendar-today" size={14} color="#64748b" />
                                <Text style={styles.metaText}>{event.month ? `${event.month} ${event.dateNum || event.date}` : (event.date || 'TBA')} • {event.time || '10:00 AM'}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <MaterialIcons name="location-on" size={14} color="#64748b" />
                                <Text style={styles.metaText} numberOfLines={1}>{event.location || 'Main Auditorium'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>

                        {/* Student Information */}
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionHeader}>STUDENT INFORMATION</Text>
                            <View style={styles.cardGroup}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <TextInput
                                        style={[styles.inputField, styles.readOnlyInput]}
                                        value={stats.name}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.inputLabel}>Roll Number</Text>
                                        <TextInput
                                            style={[styles.inputField, styles.readOnlyInput]}
                                            value={stats.rollNo}
                                            editable={false}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.inputLabel}>Department</Text>
                                        <TextInput
                                            style={[styles.inputField, styles.readOnlyInput]}
                                            value={stats.department.split(' ')[0]} // Shorten for display
                                            editable={false}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Registration Details */}
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionHeader}>REGISTRATION DETAILS</Text>
                            <View style={styles.cardGroup}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Participation Type</Text>
                                    <TouchableOpacity
                                        style={styles.pickerButton}
                                        activeOpacity={0.8}
                                        onPress={() => setPickerVisible(true)}
                                    >
                                        <Text style={styles.pickerText}>{participationType.label}</Text>
                                        <MaterialIcons name="expand-more" size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Special Requirements</Text>
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="E.g. dietary restrictions, accessibility needs, or equipment required"
                                        placeholderTextColor="#94a3b8"
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        value={requirements}
                                        onChangeText={setRequirements}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Terms */}
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTermsAccepted(!termsAccepted)} activeOpacity={0.8}>
                            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                                {termsAccepted && <MaterialIcons name="check" size={16} color="white" />}
                            </View>
                            <Text style={styles.checkboxLabel}>
                                I agree to the <Text style={{ color: '#0055ff', fontWeight: '500' }}>event terms and conditions</Text> and consent to follow the code of conduct.
                            </Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Fixed Action */}
            <View style={[styles.bottomFixedArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleRegister} activeOpacity={0.9}>
                    <Text style={styles.confirmBtnText}>Confirm Registration</Text>
                </TouchableOpacity>
            </View>

            {/* Picker Modal */}
            <Modal visible={pickerVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPickerVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Participation Type</Text>
                        {PARTICIPATION_OPTIONS.map((opt, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.optionBtn}
                                onPress={() => { setParticipationType(opt); setPickerVisible(false); }}
                            >
                                <Text style={[styles.optionText, participationType.value === opt.value && styles.optionTextActive]}>{opt.label}</Text>
                                {participationType.value === opt.value && <MaterialIcons name="check" size={20} color="#0055ff" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },

    // Glass Nav
    navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(245, 245, 245, 0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(226, 232, 240, 0.5)', zIndex: 10 },
    navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    navTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 },

    scrollContent: { padding: 16, paddingBottom: 120 },

    // Event Snippet
    eventCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9', gap: 16 },
    eventImageWrapper: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden' },
    eventImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    eventInfo: { flex: 1, justifyContent: 'center' },
    eventTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6, lineHeight: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    metaText: { fontSize: 12, fontWeight: '500', color: '#64748b' },

    // Form
    formContainer: { marginTop: 24, gap: 24 },
    sectionBlock: { gap: 12 },
    sectionHeader: { fontSize: 12, fontWeight: '700', color: '#94a3b8', paddingHorizontal: 4, letterSpacing: 0.5 },
    cardGroup: { backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9', gap: 16 },

    inputGroup: { gap: 6 },
    row: { flexDirection: 'row', gap: 16 },
    inputLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
    inputField: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 48, paddingHorizontal: 16, fontSize: 14, color: '#0f172a' },
    readOnlyInput: { backgroundColor: '#f8fafc', color: '#475569' },

    pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, height: 48, paddingHorizontal: 16 },
    pickerText: { fontSize: 14, color: '#0f172a' },

    textArea: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0f172a', minHeight: 96 },

    // Checkbox
    checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4, marginTop: 4 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkboxChecked: { backgroundColor: '#0055ff', borderColor: '#0055ff' },
    checkboxLabel: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },

    // Bottom Fixed
    bottomFixedArea: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(245, 245, 245, 0.85)', borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.5)', paddingTop: 16, paddingHorizontal: 16 },
    confirmBtn: { backgroundColor: '#0055ff', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    confirmBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', paddingHorizontal: 24 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
    modalTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    optionText: { fontSize: 15, color: '#475569', fontWeight: '500' },
    optionTextActive: { color: '#0055ff', fontWeight: '700' }
});
