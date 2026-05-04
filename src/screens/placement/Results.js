import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPlacedStudents } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

export default function Results({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await getPlacedStudents();
                setResults(data);
            } catch (error) {
                console.error("Error fetching placed students:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const getStatusStyle = (color) => {
        switch (color) {
            case 'green': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' };
            case 'blue': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
            case 'purple': return { bg: '#faf5ff', text: '#7e22ce', border: '#f3e8ff' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Placement Results</Text>
                        <Text style={styles.headerSubtitle}>Manage student offers</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.profileButton}>
                    <MaterialCommunityIcons name="account" size={24} color="#0055ff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Placed</Text>
                        <Text style={styles.statValue}>412</Text>
                        <Text style={[styles.statTrend, { color: '#22c55e' }]}>+12 today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Highest Pkg</Text>
                        <Text style={[styles.statValue, { color: '#0055ff' }]}>₹45 L</Text>
                        <Text style={styles.statTrend}>Domestic</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg Pkg</Text>
                        <Text style={styles.statValue}>₹12.5 L</Text>
                        <Text style={[styles.statTrend, { color: '#22c55e' }]}>↑ 8% YoY</Text>
                    </View>
                </View>

                {/* Search & Actions */}
                <View style={styles.searchSection}>
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by name, company..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <MaterialCommunityIcons name="tune" size={24} color="#4b5563" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.uploadButton}>
                        <MaterialCommunityIcons name="cloud-upload" size={24} color="white" />
                        <Text style={styles.uploadButtonText}>Upload Placement Results</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Entries Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Recent Entries</Text>
                    <View style={styles.sortContainer}>
                        <Text style={styles.sortLabel}>Sort by:</Text>
                        <TouchableOpacity>
                            <Text style={styles.sortValue}>Date</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Results List */}
                <View style={styles.resultsList}>
                    {loading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#0055ff" />
                            <Text style={{ marginTop: 12, color: '#6b7280' }}>Loading results...</Text>
                        </View>
                    ) : results.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center', backgroundColor: 'white', borderRadius: 16 }}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#d1d5db" />
                            <Text style={{ marginTop: 12, color: '#6b7280' }}>No placement results available.</Text>
                        </View>
                    ) : (
                        results.filter(item =>
                            (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.company || '').toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((item) => {
                            const style = getStatusStyle(item.statusColor);
                            return (
                                <View key={item.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.studentInfo}>
                                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                            <View>
                                                <Text style={styles.studentName}>{item.name}</Text>
                                                <Text style={styles.studentBranch}>{item.branch}</Text>
                                                <Text style={styles.studentId}>ID: {item.studentId}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.statusContainer}>
                                            <View style={[styles.statusBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
                                                <Text style={[styles.statusText, { color: style.text }]}>{item.status}</Text>
                                            </View>
                                            <TouchableOpacity>
                                                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#9ca3af" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.offerBox}>
                                        <View style={styles.companyInfo}>
                                            <View style={styles.logoBox}>
                                                <MaterialCommunityIcons name={item.companyIcon} size={20} color="#4b5563" />
                                            </View>
                                            <View>
                                                <Text style={styles.companyName}>{item.company}</Text>
                                                <Text style={styles.roleName}>{item.role}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.packageInfo}>
                                            <Text style={styles.packageValue}>{item.package}</Text>
                                            <Text style={styles.packageType}>{item.packageType}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionsRow}>
                                        {(item.actions || ['View Offer']).map((action, index, arr) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.actionButton,
                                                    arr.length === 1 && styles.actionButtonFull,
                                                    index === 1 && styles.actionButtonPrimary,
                                                    action === 'View Joining Letter' && styles.actionButtonTransparent
                                                ]}
                                            >
                                                {action === 'View Joining Letter' && (
                                                    <MaterialCommunityIcons name="file-document-outline" size={18} color="#6b7280" style={{ marginRight: 6 }} />
                                                )}
                                                <Text style={[
                                                    styles.actionText,
                                                    index === 1 && styles.actionTextPrimary,
                                                    action === 'View Joining Letter' && styles.actionTextTransparent
                                                ]}>
                                                    {action}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab}>
                <MaterialCommunityIcons name="plus" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    headerSubtitle: { fontSize: 12, color: '#6b7280' },
    profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 85, 255, 0.1)', alignItems: 'center', justifyContent: 'center' },

    scrollContent: { padding: 16 },

    statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 12, alignItems: 'center', justifyContent: 'center', height: 100, borderWidth: 1, borderColor: '#f3f4f6' },
    statLabel: { fontSize: 10, color: '#6b7280', marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    statTrend: { fontSize: 10, fontWeight: '500', color: '#9ca3af', marginTop: 2 },

    searchSection: { marginBottom: 24, paddingVertical: 8, backgroundColor: '#f5f6f8', zIndex: 10 },
    searchRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: '#e5e7eb' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#111827' },
    filterButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' },

    uploadButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0055ff', borderRadius: 16, height: 52, shadowColor: '#0055ff', shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
    uploadButtonText: { fontSize: 14, fontWeight: '600', color: 'white' },

    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    sortContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sortLabel: { fontSize: 12, color: '#6b7280' },
    sortValue: { fontSize: 12, fontWeight: '600', color: '#0055ff' },

    resultsList: { gap: 16 },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    studentInfo: { flexDirection: 'row', gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f3f4f6' },
    studentName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    studentBranch: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    studentId: { fontSize: 10, color: '#9ca3af', marginTop: 1 },

    statusContainer: { alignItems: 'flex-end' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, marginBottom: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    offerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(243, 244, 246, 0.6)' },
    companyInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    logoBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
    companyName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    roleName: { fontSize: 12, color: '#6b7280' },
    packageInfo: { alignItems: 'flex-end' },
    packageValue: { fontSize: 14, fontWeight: 'bold', color: '#0055ff' },
    packageType: { fontSize: 10, color: '#9ca3af' },

    actionsRow: { flexDirection: 'row', gap: 8 },
    actionButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white' },
    actionButtonPrimary: { backgroundColor: '#eff6ff', borderColor: '#dbeafe' },
    actionButtonTransparent: { backgroundColor: 'transparent', borderColor: 'transparent', flexDirection: 'row', justifyContent: 'center' },
    actionButtonFull: { width: '100%' },
    actionText: { fontSize: 12, fontWeight: '500', color: '#374151' },
    actionTextPrimary: { color: '#1d4ed8' },
    actionTextTransparent: { color: '#6b7280' }, // hover text primary equivalent logic handled via colors

    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0055ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 4, elevation: 6 }
});
