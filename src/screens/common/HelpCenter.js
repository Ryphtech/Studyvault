import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FAQ_DATA = [
    {
        category: 'Getting Started',
        icon: 'rocket-launch',
        color: '#0055ff',
        questions: [
            { q: 'How do I set up my profile?', a: 'Go to Settings → tap your profile card at the top → tap "Edit Profile" to fill in your personal details, department, and profile picture.' },
            { q: 'How do I change my semester?', a: 'Go to Settings → under "Academic Interface" → tap "Change Current Semester" and select your current semester from the picker.' },
            { q: 'What are the different user roles?', a: 'The portal supports Students, Faculty, HOD (Head of Department), Placement Officer, and Admin roles. Each has access to different features tailored to their needs.' },
        ],
    },
    {
        category: 'Attendance',
        icon: 'book-open-page-variant',
        color: '#059669',
        questions: [
            { q: 'Where can I view my attendance?', a: 'Students can view attendance from the "Attendance" tab on the bottom bar. It shows subject-wise attendance with percentages.' },
            { q: 'How is attendance marked?', a: 'Faculty members mark attendance through the "Attendance Manager" screen. They select a course, date, and mark each student as present or absent.' },
            { q: 'What is the minimum attendance required?', a: 'Generally, 75% attendance is required. Subjects below this threshold will be highlighted in red on your attendance screen.' },
        ],
    },
    {
        category: 'Marks & Grades',
        icon: 'chart-line',
        color: '#8b5cf6',
        questions: [
            { q: 'How do I check my marks?', a: 'Navigate to "Marks" from the dashboard. You can view assessment-wise marks for each subject, including internals, assignments, and lab scores.' },
            { q: 'How are marks uploaded?', a: 'Faculty upload marks through "Upload Marks" screen. They can create custom test types and set maximum marks for each assessment.' },
            { q: 'Can I see my performance analytics?', a: 'Yes! Go to Dashboard → "Performance Analytics" for detailed charts showing your academic progress over time.' },
        ],
    },
    {
        category: 'Chat & Communication',
        icon: 'chat-processing',
        color: '#ea580c',
        questions: [
            { q: 'How do I start a chat?', a: 'Go to the "Chat" tab → tap the "+" button → select a student or faculty member to start a direct message.' },
            { q: 'What are group chats?', a: 'Group chats are automatically created for each course/subject. All enrolled students and the course faculty can participate in subject discussions.' },
            { q: 'Can I edit or delete messages?', a: 'Yes! Long-press on any message you sent to see options for Edit, Delete, Forward, or Reply.' },
        ],
    },
    {
        category: 'Placements',
        icon: 'briefcase',
        color: '#db2777',
        questions: [
            { q: 'How do I apply for a placement drive?', a: 'Go to "Jobs" tab → browse available drives → tap "Apply" on any drive you are eligible for. Make sure your profile is complete.' },
            { q: 'How do I check drive results?', a: 'After a drive concludes, results are published on the drive details page. You will also receive a notification.' },
        ],
    },
    {
        category: 'Account & Security',
        icon: 'shield-lock',
        color: '#0d9488',
        questions: [
            { q: 'How do I change my password?', a: 'Go to Settings → "Account" section → "Change Password". Enter your current password and set a new one (minimum 6 characters).' },
            { q: 'How do I update my privacy settings?', a: 'Go to Settings → "Account" section → "Privacy Settings" to control profile visibility, read receipts, and data sharing.' },
            { q: 'How do I log out?', a: 'Go to Settings → scroll to the bottom → tap the "Log Out" button.' },
        ],
    },
];

export default function HelpCenter({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedQ, setExpandedQ] = useState(null);

    const filteredFAQ = searchQuery.trim()
        ? FAQ_DATA.map(cat => ({
            ...cat,
            questions: cat.questions.filter(
                q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) || q.a.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter(cat => cat.questions.length > 0)
        : FAQ_DATA;

    const toggleQuestion = (key) => {
        setExpandedQ(prev => prev === key ? null : key);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <MaterialCommunityIcons name="lifebuoy" size={48} color="#0055ff" />
                    <Text style={styles.heroTitle}>How can we help?</Text>
                    <Text style={styles.heroSubtitle}>Search our FAQ or browse topics below</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={22} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search questions..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* FAQ Sections */}
                {filteredFAQ.map((category, cIdx) => (
                    <View key={cIdx} style={styles.section}>
                        <View style={styles.categoryHeader}>
                            <View style={[styles.categoryIcon, { backgroundColor: category.color + '18' }]}>
                                <MaterialCommunityIcons name={category.icon} size={20} color={category.color} />
                            </View>
                            <Text style={styles.sectionTitle}>{category.category}</Text>
                        </View>
                        <View style={styles.sectionContent}>
                            {category.questions.map((item, qIdx) => {
                                const key = `${cIdx}-${qIdx}`;
                                const isExpanded = expandedQ === key;
                                return (
                                    <View key={qIdx}>
                                        {qIdx > 0 && <View style={styles.divider} />}
                                        <TouchableOpacity
                                            style={styles.questionRow}
                                            onPress={() => toggleQuestion(key)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.questionText}>{item.q}</Text>
                                            <MaterialCommunityIcons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={22}
                                                color="#94a3b8"
                                            />
                                        </TouchableOpacity>
                                        {isExpanded && (
                                            <View style={styles.answerBox}>
                                                <Text style={styles.answerText}>{item.a}</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                ))}

                {filteredFAQ.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="magnify-close" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No results found</Text>
                        <Text style={styles.emptySubtitle}>Try searching with different keywords</Text>
                    </View>
                )}

                {/* Contact Support */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>STILL NEED HELP?</Text>
                    <View style={styles.contactCard}>
                        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@studyvault.edu')}>
                            <View style={[styles.contactIcon, { backgroundColor: '#eff6ff' }]}>
                                <MaterialCommunityIcons name="email-outline" size={24} color="#0055ff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contactTitle}>Email Support</Text>
                                <Text style={styles.contactSubtitle}>support@studyvault.edu</Text>
                            </View>
                            <MaterialCommunityIcons name="open-in-new" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('tel:+911234567890')}>
                            <View style={[styles.contactIcon, { backgroundColor: '#ecfdf5' }]}>
                                <MaterialCommunityIcons name="phone-outline" size={24} color="#059669" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contactTitle}>Phone Support</Text>
                                <Text style={styles.contactSubtitle}>+91 123 456 7890</Text>
                            </View>
                            <MaterialCommunityIcons name="open-in-new" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.contactItem} onPress={() => navigation.navigate('SubmitFeedback')}>
                            <View style={[styles.contactIcon, { backgroundColor: '#fef3c7' }]}>
                                <MaterialCommunityIcons name="message-text-outline" size={24} color="#d97706" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.contactTitle}>Submit Feedback</Text>
                                <Text style={styles.contactSubtitle}>Report bugs or request features</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
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

    scrollContent: { padding: 16 },

    heroBanner: { alignItems: 'center', paddingVertical: 28, marginBottom: 20 },
    heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 12 },
    heroSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },

    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0', gap: 10 },
    searchInput: { flex: 1, fontSize: 16, color: '#0f172a' },

    section: { marginBottom: 24 },
    categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingLeft: 4 },
    categoryIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', letterSpacing: 0.3 },
    sectionContent: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },

    questionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
    questionText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a', lineHeight: 21 },
    answerBox: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
    answerText: { fontSize: 14, color: '#64748b', lineHeight: 22, backgroundColor: '#f8fafc', padding: 14, borderRadius: 12 },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 16 },

    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#94a3b8', marginTop: 12 },
    emptySubtitle: { fontSize: 14, color: '#cbd5e1', marginTop: 4 },

    contactCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
    contactItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
    contactIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    contactTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
    contactSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
});
