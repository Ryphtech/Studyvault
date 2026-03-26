import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Dimensions, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { submitFeedback } from '../../services/firestoreService';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'Faculty', icon: 'school', label: 'Faculty' },
    { id: 'Infrastructure', icon: 'apartment', label: 'Infrastructure' },
    { id: 'Placements', icon: 'work-outline', label: 'Placements' },
    { id: 'General', icon: 'more-horiz', label: 'General' }
];

const RATINGS = [
    { value: 1, icon: 'sentiment-very-dissatisfied', label: 'Poor' },
    { value: 2, icon: 'sentiment-dissatisfied', label: 'Bad' },
    { value: 3, icon: 'sentiment-neutral', label: 'Okay' },
    { value: 4, icon: 'sentiment-satisfied', label: 'Good' },
    { value: 5, icon: 'sentiment-very-satisfied', label: 'Great' }
];

export default function SubmitFeedback({ navigation }) {
    const insets = useSafeAreaInsets();
    const auth = getAuth();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [rating, setRating] = useState(4); // Default to 'Good'
    const [comments, setComments] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedCategory) {
            Alert.alert("Missing Information", "Please select a category for your feedback.");
            return;
        }

        if (!comments.trim() && rating < 4) {
            Alert.alert("Missing Information", "Please provide detailed comments so we understand why you gave this rating.");
            return;
        }

        setIsSubmitting(true);

        try {
            const userId = auth.currentUser?.uid;

            const feedbackData = {
                userId: isAnonymous ? 'Anonymous' : userId,
                category: selectedCategory,
                rating,
                comments: comments.trim(),
                isAnonymous,
            };

            const result = await submitFeedback(feedbackData);

            if (result.success) {
                navigation.replace('FeedbackSuccess', { id: result.id });
            } else {
                Alert.alert("Submission Failed", "There was an error submitting your feedback. Please try again later.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Top Navigation Bar */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#0f172a" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Submit Feedback</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>SELECT CATEGORY</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name={cat.icon}
                                        size={28}
                                        color={isSelected ? '#0055ff' : '#94a3b8'}
                                        style={{ marginBottom: 8 }}
                                    />
                                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Rating Section */}
                <View style={styles.ratingCard}>
                    <View style={styles.ratingHeader}>
                        <Text style={styles.ratingTitle}>Overall Experience</Text>
                        <Text style={styles.ratingSubtitle}>How would you rate this service?</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        {RATINGS.map((r) => {
                            const isSelected = rating === r.value;
                            return (
                                <TouchableOpacity
                                    key={r.value}
                                    style={styles.ratingItem}
                                    onPress={() => setRating(r.value)}
                                >
                                    <MaterialIcons
                                        name={r.icon}
                                        size={36}
                                        color={isSelected ? '#0055ff' : '#cbd5e1'}
                                    />
                                    <Text style={[styles.ratingLabel, isSelected && styles.ratingLabelSelected]}>
                                        {r.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Text Area Section */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.sectionLabel}>YOUR COMMENTS</Text>
                        <Text style={styles.charCount}>{comments.length}/500</Text>
                    </View>
                    <View style={styles.textAreaWrapper}>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Share your detailed feedback or suggestions here..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            maxLength={500}
                            value={comments}
                            onChangeText={setComments}
                        />
                    </View>
                </View>

                {/* Anonymous Toggle */}
                <View style={styles.anonymousCard}>
                    <View style={styles.anonymousRow}>
                        <View style={styles.anonymousIconBox}>
                            <MaterialIcons name="visibility-off" size={20} color="#0055ff" />
                        </View>
                        <View style={styles.anonymousTexts}>
                            <Text style={styles.anonymousTitle}>Submit Anonymously</Text>
                            <Text style={styles.anonymousSubtitle}>Your identity will be hidden from reviewers</Text>
                        </View>
                    </View>
                    <Switch
                        trackColor={{ false: "#cbd5e1", true: "#0055ff" }}
                        thumbColor={"white"}
                        ios_backgroundColor="#cbd5e1"
                        onValueChange={setIsAnonymous}
                        value={isAnonymous}
                    />
                </View>

                {/* Tip Info Card */}
                <View style={styles.tipCard}>
                    <MaterialIcons name="info" size={16} color="#0055ff" style={{ marginTop: 2 }} />
                    <Text style={styles.tipText}>
                        Honest feedback helps us improve your campus experience. All responses are taken seriously.
                    </Text>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Fixed Bottom Action */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.submitBtnText}>Submit Feedback</Text>
                            <MaterialIcons name="send" size={18} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'rgba(245, 246, 248, 0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(226, 232, 240, 0.5)', zIndex: 10 },
    backButton: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },

    scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },

    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', letterSpacing: 0.5, marginBottom: 12 },

    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    categoryCard: { width: (width - 60) / 2, backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    categoryCardSelected: { borderColor: '#0055ff' },
    categoryText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    categoryTextSelected: { color: '#0055ff' },

    ratingCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    ratingHeader: { alignItems: 'center', marginBottom: 16 },
    ratingTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
    ratingSubtitle: { fontSize: 13, color: '#64748b' },
    ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8 },
    ratingItem: { alignItems: 'center', gap: 4 },
    ratingLabel: { fontSize: 10, fontWeight: '500', color: '#94a3b8' },
    ratingLabelSelected: { color: '#0055ff' },

    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
    charCount: { fontSize: 10, color: '#94a3b8', marginBottom: 12 },
    textAreaWrapper: { flex: 1 },
    textArea: { backgroundColor: 'white', borderRadius: 16, padding: 16, minHeight: 120, fontSize: 14, color: '#0f172a', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

    anonymousCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    anonymousRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    anonymousIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 85, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },
    anonymousTexts: { flex: 1 },
    anonymousTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
    anonymousSubtitle: { fontSize: 11, color: '#64748b', lineHeight: 14 },

    tipCard: { flexDirection: 'row', backgroundColor: 'rgba(0, 85, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(0, 85, 255, 0.2)', padding: 16, borderRadius: 16, gap: 12 },
    tipText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(245, 246, 248, 0.85)', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(226, 232, 240, 0.8)' },
    submitBtn: { flexDirection: 'row', backgroundColor: '#0055ff', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    submitBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
