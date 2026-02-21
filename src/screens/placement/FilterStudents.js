import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock Data
const departments = ['CSE', 'ECE', 'MECH', 'IT', 'CIVIL'];
const initialSkills = ['Java', 'Figma'];

const studentResults = [
    {
        id: 1,
        name: 'Priya Sharma',
        studentId: '21CS045',
        cgpa: '9.2',
        dept: 'CSE',
        year: 'Yr 4',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        statusColor: '#22c55e', // green
        deptColor: 'blue',
        cgpaColor: 'green'
    },
    {
        id: 2,
        name: 'Rahul Verma',
        studentId: '21ME012',
        cgpa: '8.1',
        dept: 'MECH',
        year: 'Yr 4',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        statusColor: '#d1d5db', // gray
        deptColor: 'orange',
        cgpaColor: 'amber'
    },
    {
        id: 3,
        name: 'Ananya Das',
        studentId: '21EC088',
        cgpa: '8.8',
        dept: 'ECE',
        year: 'Yr 4',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        statusColor: '#22c55e', // green
        deptColor: 'purple',
        cgpaColor: 'green'
    }
];

export default function FilterStudents({ navigation }) {
    const [selectedDept, setSelectedDept] = useState('CSE');
    const [skills, setSkills] = useState(initialSkills);
    const [skillInput, setSkillInput] = useState('');

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const addSkill = () => {
        if (skillInput.trim()) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const getBadgeStyle = (color) => {
        switch (color) {
            case 'green': return { bg: '#f0fdf4', text: '#15803d', border: '#dcfce7' };
            case 'blue': return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
            case 'purple': return { bg: '#faf5ff', text: '#7e22ce', border: '#f3e8ff' };
            case 'amber': return { bg: '#fffbeb', text: '#b45309', border: '#fef3c7' };
            case 'orange': return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#4b5563" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Student Search</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Filters Section */}
                <View style={styles.filtersCard}>
                    {/* CGPA Slider (Visual Mockup) */}
                    <View style={styles.filterGroup}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.filterLabel}>CGPA Range</Text>
                            <View style={styles.rangeBadge}>
                                <Text style={styles.rangeText}>7.5 - 9.8</Text>
                            </View>
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderTrack} />
                            <View style={styles.sliderActiveTrack} />
                            <View style={[styles.sliderThumb, { left: '15%' }]}>
                                <View style={styles.thumbTooltip}>
                                    <Text style={styles.tooltipText}>7.5</Text>
                                </View>
                            </View>
                            <View style={[styles.sliderThumb, { right: '20%' }]}>
                                <View style={styles.thumbTooltip}>
                                    <Text style={styles.tooltipText}>9.8</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabelText}>0.0</Text>
                            <Text style={styles.sliderLabelText}>5.0</Text>
                            <Text style={styles.sliderLabelText}>10.0</Text>
                        </View>
                    </View>

                    {/* Department Chips */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Department</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                            {departments.map((dept) => (
                                <TouchableOpacity
                                    key={dept}
                                    style={[styles.chip, selectedDept === dept && styles.chipActive]}
                                    onPress={() => setSelectedDept(dept)}
                                >
                                    <Text style={[styles.chipText, selectedDept === dept && styles.chipTextActive]}>{dept}</Text>
                                    {selectedDept === dept && <MaterialCommunityIcons name="check" size={16} color="white" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Skills Input */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Skills</Text>
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Python, SQL, React"
                                placeholderTextColor="#9ca3af"
                                value={skillInput}
                                onChangeText={setSkillInput}
                                onSubmitEditing={addSkill}
                            />
                            <TouchableOpacity onPress={addSkill} style={styles.enterButton}>
                                <Text style={styles.enterText}>Enter</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.skillsContainer}>
                            {skills.map((skill, index) => (
                                <View key={index} style={styles.skillTag}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                    <TouchableOpacity onPress={() => removeSkill(skill)}>
                                        <MaterialCommunityIcons name="close" size={14} color="#0055ff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Results Header */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>RESULTS</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>45 Found</Text>
                    </View>
                </View>

                {/* Results List */}
                <View style={styles.resultsList}>
                    {studentResults.map((student) => {
                        const cgpaStyle = getBadgeStyle(student.cgpaColor);
                        const deptStyle = getBadgeStyle(student.deptColor);
                        return (
                            <TouchableOpacity key={student.id} style={styles.studentCard}>
                                <View style={styles.cardTop}>
                                    <View style={styles.avatarContainer}>
                                        <Image source={{ uri: student.avatar }} style={styles.avatar} />
                                        <View style={[styles.statusDot, { backgroundColor: student.statusColor }]} />
                                    </View>
                                    <View style={styles.studentInfo}>
                                        <View style={styles.infoHeader}>
                                            <View>
                                                <Text style={styles.studentName}>{student.name}</Text>
                                                <Text style={styles.studentId}>ID: {student.studentId}</Text>
                                            </View>
                                            <TouchableOpacity style={styles.chevronButton}>
                                                <MaterialCommunityIcons name="chevron-right" size={24} color="#0055ff" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.tagsContainer}>
                                            <View style={[styles.infoBadge, { backgroundColor: cgpaStyle.bg, borderColor: cgpaStyle.border }]}>
                                                <MaterialCommunityIcons name="school" size={14} color={cgpaStyle.text} />
                                                <Text style={[styles.badgeText, { color: cgpaStyle.text }]}>CGPA {student.cgpa}</Text>
                                            </View>
                                            <View style={[styles.infoBadge, { backgroundColor: deptStyle.bg, borderColor: deptStyle.border }]}>
                                                <MaterialCommunityIcons name="console" size={14} color={deptStyle.text} />
                                                <Text style={[styles.badgeText, { color: deptStyle.text }]}>{student.dept}</Text>
                                            </View>
                                            <Text style={styles.yearText}>{student.year}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Export FAB */}
            <TouchableOpacity style={styles.fab}>
                <MaterialCommunityIcons name="export-variant" size={24} color="white" />
                <Text style={styles.fabText}>Export List</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { padding: 4, borderRadius: 20, backgroundColor: 'transparent' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    resetText: { fontSize: 14, fontWeight: '600', color: '#0055ff' },

    scrollContent: { paddingBottom: 24 },

    filtersCard: { backgroundColor: 'white', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },

    filterGroup: { marginBottom: 24 },
    filterLabel: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },

    // Slider Styles
    sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    rangeBadge: { backgroundColor: 'rgba(0, 85, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    rangeText: { fontSize: 14, fontWeight: 'bold', color: '#0055ff' },
    sliderContainer: { height: 48, justifyContent: 'center' },
    sliderTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, width: '100%', position: 'absolute' },
    sliderActiveTrack: { height: 6, backgroundColor: '#0055ff', borderRadius: 3, position: 'absolute', left: '15%', right: '20%' },
    sliderThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'white', borderWidth: 4, borderColor: '#0055ff', position: 'absolute', top: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    thumbTooltip: { position: 'absolute', top: -32, backgroundColor: 'transparent' },
    tooltipText: { fontSize: 12, fontWeight: '500', color: '#64748b' },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
    sliderLabelText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

    chipsContainer: { gap: 8 },
    chip: { flexDirection: 'row', height: 36, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', gap: 8 },
    chipActive: { backgroundColor: '#0055ff', shadowColor: '#0055ff', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    chipText: { fontSize: 14, fontWeight: '500', color: '#475569' },
    chipTextActive: { color: 'white' },

    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, height: 48 },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 14, color: '#0f172a' },
    enterButton: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    enterText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    skillTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 85, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0, 85, 255, 0.2)' },
    skillText: { fontSize: 12, fontWeight: '500', color: '#0055ff' },

    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
    resultsTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', letterSpacing: 1 },
    countBadge: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    countText: { fontSize: 12, fontWeight: 'bold', color: '#475569' },

    resultsList: { paddingHorizontal: 16, gap: 12 },
    studentCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
    cardTop: { flexDirection: 'row', gap: 16 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#f1f5f9' },
    statusDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: 'white' },

    studentInfo: { flex: 1 },
    infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    studentName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    studentId: { fontSize: 14, color: '#64748b' },
    chevronButton: { padding: 6, backgroundColor: 'rgba(0, 85, 255, 0.05)', borderRadius: 8 },

    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },
    infoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    badgeText: { fontSize: 12, fontWeight: '500' },
    yearText: { fontSize: 12, color: '#94a3b8', marginLeft: 'auto' },

    fab: { position: 'absolute', bottom: 24, right: 16, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, backgroundColor: '#0055ff', shadowColor: '#0055ff', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    fabText: { fontSize: 14, fontWeight: 'bold', color: 'white' }
});
