import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        content: `By accessing and using StudyVault ("the Application"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these terms, you must not use this application.

These Terms apply to all users of the application, including students, faculty members, administrators, and placement officers.`,
    },
    {
        title: '2. Description of Service',
        content: `StudyVault is an integrated college portal that provides the following services:

• Academic management (attendance tracking, marks & grades)
• Course material distribution & notes sharing
• Placement drive listings and applications
• Event management and registration
• Real-time chat and group communication
• Faculty tools for attendance and marks upload
• Administrative dashboards and reporting

The application is intended solely for use by authorized members of participating educational institutions.`,
    },
    {
        title: '3. User Accounts & Registration',
        content: `• You must provide accurate and complete information during registration.
• You are responsible for maintaining the confidentiality of your account credentials.
• You must immediately notify administration of any unauthorized use of your account.
• One person may maintain only one account. Duplicate accounts may be terminated.
• Your account role (student, faculty, admin, etc.) is assigned by your institution and determines your access level.`,
    },
    {
        title: '4. Acceptable Use',
        content: `You agree NOT to:

• Use the application for any unlawful purpose
• Share your login credentials with any other person
• Attempt to access another user's account or data
• Upload or share inappropriate, offensive, or copyrighted content
• Use the chat feature for harassment, spamming, or bullying
• Tamper with attendance records, marks, or any academic data
• Reverse engineer, decompile, or disassemble the application
• Use automated tools, bots, or scripts to interact with the service`,
    },
    {
        title: '5. Privacy & Data Collection',
        content: `Your privacy is important to us. By using this application, you consent to the collection and use of information as described in our Privacy Policy, including:

• Personal information (name, email, phone, profile photo)
• Academic data (attendance, marks, semester, department)
• Usage analytics (app usage patterns, feature interactions)
• Communication data (chat messages, notifications)

All data is stored securely using industry-standard encryption. We do not sell your personal information to third parties.`,
    },
    {
        title: '6. Academic Integrity',
        content: `Users must uphold academic integrity standards:

• Marks and attendance records are official academic documents
• Any attempt to manipulate, falsify, or tamper with academic data is a serious violation
• Faculty members are responsible for accurate data entry
• Suspected violations will be reported to institutional authorities
• Violations may result in immediate account suspension`,
    },
    {
        title: '7. Chat & Communication Guidelines',
        content: `When using the messaging features:

• Be respectful and professional in all communications
• Group chats are for academic discussion related to the course
• Do not share confidential exam content or answers
• Messages may be monitored for compliance with institutional policies
• Inappropriate messages can be reported and will be reviewed
• Users can edit and delete their own messages`,
    },
    {
        title: '8. Intellectual Property',
        content: `• All course materials, notes, and content uploaded by faculty remain their intellectual property
• Students may not redistribute course materials without explicit permission
• The StudyVault application, its design, logos, and branding are proprietary
• User-generated content (messages, feedback) grants us a license to display within the app`,
    },
    {
        title: '9. Service Availability',
        content: `• We strive for 99.9% uptime but do not guarantee uninterrupted service
• Scheduled maintenance windows will be communicated in advance
• We reserve the right to modify, suspend, or discontinue any feature
• We are not liable for losses arising from service interruptions
• Feature availability may vary based on your user role and institution`,
    },
    {
        title: '10. Limitation of Liability',
        content: `StudyVault and its developers shall not be liable for:

• Any indirect, incidental, or consequential damages
• Loss of data due to unforeseen technical failures
• Actions taken by other users of the platform
• Decisions made based on information provided through the app
• Third-party service outages affecting app functionality

Maximum liability shall not exceed the amount paid for the service in the last 12 months.`,
    },
    {
        title: '11. Termination',
        content: `• Your institution may terminate your access at any time
• We may suspend accounts that violate these terms
• Upon graduation or departure, accounts may be deactivated
• You may request account deletion through Settings → Privacy → Delete Account
• Certain academic data may be retained per institutional policy even after account deletion`,
    },
    {
        title: '12. Changes to Terms',
        content: `• We reserve the right to modify these terms at any time
• Material changes will be communicated via in-app notifications
• Continued use after changes constitutes acceptance of new terms
• The most current version is always available within the app`,
    },
    {
        title: '13. Contact Information',
        content: `For questions regarding these Terms of Service:

📧 Email: legal@studyvault.edu
📞 Phone: +91 123 456 7890
🏢 Address: StudyVault Technologies Pvt. Ltd.

These terms were last updated on May 1, 2026.`,
    },
];

export default function TermsOfService({ navigation }) {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons name="file-document-outline" size={32} color="#0055ff" />
                    </View>
                    <Text style={styles.heroTitle}>Terms of Service</Text>
                    <Text style={styles.heroSubtitle}>Last Updated: May 1, 2026</Text>
                    <Text style={styles.heroDesc}>Please read these terms carefully before using StudyVault. By using the application, you agree to these terms.</Text>
                </View>

                {/* Sections */}
                {SECTIONS.map((section, idx) => (
                    <View key={idx} style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                {/* Footer */}
                <View style={styles.footerCard}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#059669" />
                    <Text style={styles.footerText}>By continuing to use StudyVault, you acknowledge and agree to all the terms stated above.</Text>
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

    scrollContent: { padding: 16 },

    heroCard: { alignItems: 'center', backgroundColor: 'white', borderRadius: 20, padding: 28, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    heroIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
    heroSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
    heroDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 12, lineHeight: 20 },

    sectionCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
    sectionContent: { fontSize: 14, color: '#475569', lineHeight: 22 },

    footerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', borderRadius: 16, padding: 16, gap: 12, marginTop: 8, borderWidth: 1, borderColor: '#d1fae5' },
    footerText: { flex: 1, fontSize: 13, color: '#065f46', lineHeight: 20 },
});
