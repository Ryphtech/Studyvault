import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getSurveyResults } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function FeedbackResults({ navigation, route }) {
    const survey = route.params?.survey;
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (survey?.id) {
            getSurveyResults(survey.id).then(data => {
                setResults(data || []);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [survey]);

    // Analytics Calculation
    const totalResponses = results.length;
    const averageRating = totalResponses > 0 
        ? (results.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalResponses).toFixed(1)
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(r => {
        const count = results.filter(res => res.rating === r).length;
        return { rating: r, count, percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0 };
    });

    const recentComments = results
        .filter(r => r.feedback_text && r.feedback_text.trim() !== '')
        .map(r => ({ id: r.id, text: r.feedback_text, date: new Date(r.created_at).toLocaleDateString(), user: r.is_anonymous ? 'Anonymous' : (r.student_name || 'Student') }))
        .slice(0, 10);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#1f2937" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Results Overview</Text>
                    <Text style={styles.headerSub}>{survey?.title || 'Survey'}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0055ff" />
                </View>
            ) : totalResponses === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="clipboard-text-off-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyText}>No responses yet.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Key Metrics */}
                    <View style={styles.metricsRow}>
                        <View style={styles.metricCard}>
                            <MaterialCommunityIcons name="account-group" size={24} color="#2563eb" />
                            <Text style={styles.metricValue}>{totalResponses}</Text>
                            <Text style={styles.metricLabel}>Total Responses</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <MaterialCommunityIcons name="star" size={24} color="#ea580c" />
                            <Text style={styles.metricValue}>{averageRating}</Text>
                            <Text style={styles.metricLabel}>Avg. Rating / 5</Text>
                        </View>
                    </View>

                    {/* Chart alternative (Progress bars) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rating Distribution</Text>
                        <View style={styles.card}>
                            {ratingDistribution.map(item => (
                                <View key={item.rating} style={styles.barRow}>
                                    <View style={styles.starCol}>
                                        <Text style={styles.starText}>{item.rating}</Text>
                                        <MaterialCommunityIcons name="star" size={14} color="#fbbf24" />
                                    </View>
                                    <View style={styles.barBg}>
                                        <View style={[styles.barFill, { width: `${item.percentage}%` }]} />
                                    </View>
                                    <Text style={styles.countText}>{item.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Comments */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Comments ({recentComments.length})</Text>
                        {recentComments.length > 0 ? (
                            recentComments.map((comment, index) => (
                                <View key={comment.id || index} style={styles.commentCard}>
                                    <Text style={styles.commentText}>"{comment.text}"</Text>
                                    <View style={styles.commentMeta}>
                                        <Text style={styles.commentUser}>{comment.user}</Text>
                                        <Text style={styles.commentDate}>{comment.date}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noCommentsText}>No text feedback provided.</Text>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center' },
    headerSub: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 2 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
    
    scrollContent: { padding: 20 },
    
    metricsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    metricCard: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    metricValue: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 8 },
    metricLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
    
    card: { backgroundColor: 'white', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    starCol: { flexDirection: 'row', alignItems: 'center', width: 32, gap: 2 },
    starText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
    barBg: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 4 },
    countText: { width: 24, textAlign: 'right', fontSize: 13, color: '#6b7280' },

    commentCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    commentText: { fontSize: 14, color: '#374151', lineHeight: 20, fontStyle: 'italic', marginBottom: 12 },
    commentMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
    commentUser: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
    commentDate: { fontSize: 11, color: '#9ca3af' },
    noCommentsText: { color: '#6b7280', fontStyle: 'italic' }
});
