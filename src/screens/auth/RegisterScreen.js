import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Modal, FlatList } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { validateRoleCode } from '../../services/supabaseService';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ROLES = [
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
    { label: 'Head of Department', value: 'hod' },
    { label: 'Admin', value: 'admin' },
    { label: 'Placement Officer', value: 'placement_officer' },
];

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(''); // Default empty to force selection
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRolePicker, setShowRolePicker] = useState(false);
    const [securityCode, setSecurityCode] = useState('');
    const [semester, setSemester] = useState('');
    const [showSemesterPicker, setShowSemesterPicker] = useState(false);

    const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ label: `Semester ${s}`, value: s.toString() }));

    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name.trim() || !email || !password || !confirmPassword || !role) {
            alert('Please fill in all fields and select a role.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (role !== 'admin' && !securityCode.trim()) {
            alert('Please enter the security code provided by your admin.');
            return;
        }
        if (role === 'student' && !semester) {
            alert('Please select your current semester.');
            return;
        }

        setLoading(true);
        try {
            // Validate security code against Firestore (skip for admin)
            let validation = { valid: true };
            if (role !== 'admin') {
                validation = await validateRoleCode(role, securityCode.trim().toUpperCase());
                if (!validation.valid) {
                    alert(validation.message);
                    setLoading(false);
                    return;
                }
            }

            const result = await register(email, password);
            const user = result.user;
            if (!user) throw new Error('Registration failed. Please try again.');
            const profileData = {
                id: user.id,
                name: name.trim(),
                email,
                role,
                created_at: new Date().toISOString()
            };
            // If the code carried a department (e.g. HOD codes), save it to the profile
            if (validation.department) {
                profileData.department = validation.department;
            }
            if (role === 'student') {
                profileData.semester = parseInt(semester);
            }
            const { error: profileError } = await supabase.from('profiles').insert(profileData);
            if (profileError) throw profileError;
        } catch (error) {
            console.error(error);
            alert("Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderRoleItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setRole(item.value);
                setShowRolePicker(false);
            }}
        >
            <Text style={[styles.modalItemText, role === item.value && styles.selectedModalItemText]}>{item.label}</Text>
            {role === item.value && <MaterialCommunityIcons name="check" size={20} color="#0055ff" />}
        </TouchableOpacity>
    );

    const renderSemesterItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSemester(item.value);
                setShowSemesterPicker(false);
            }}
        >
            <Text style={[styles.modalItemText, semester === item.value && styles.selectedModalItemText]}>{item.label}</Text>
            {semester === item.value && <MaterialCommunityIcons name="check" size={20} color="#0055ff" />}
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={20} color="#101318" />
                    </TouchableOpacity>
                    <View style={styles.systemStatus}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>System Online</Text>
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroImageContainer}>
                        <ImageBackground
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDENYDaLamkLITebCNDWLfxNyVwpPfAepNSsW_6UmA9vG2HQjXEHYimLRWt2oa3pugRgacXe5XhQdO5TPbQZQbJgV7DZaG1RRZbTw-_XREmK_c6ncBxxIpZ4JifKpXRunhdWNnefVobZRXtr1A-vCOGrsAZdnWm2nXHYZC2UX0rcSnROjbzNobEEQiEeHdNJxQ2jkag6W_1Js51Sd_psdET84Z6o9hAz73SzOJTgN9jxX5KXwtD8UZisviIEl7wzw853Lb_S7mY8UQ' }}
                            style={styles.heroImage}
                            imageStyle={{ borderRadius: 16 }}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)']}
                                style={styles.gradient}
                            >
                                <View style={styles.heroTitleContainer}>
                                    <MaterialCommunityIcons name="school" size={28} color="white" />
                                    <Text style={styles.heroTitle}>Study Vault</Text>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>Create Account</Text>
                        <Text style={styles.welcomeSubtitle}>Join the campus community today</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>

                    {/* Role Selector */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Select Role</Text>
                        <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowRolePicker(true)}>
                            <MaterialCommunityIcons name="badge-account-horizontal-outline" size={20} color="#5e6d8d" style={styles.inputIcon} />
                            <Text style={[styles.inputText, !role && styles.placeholderText]}>
                                {role ? ROLES.find(r => r.value === role)?.label : 'Choose your role'}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color="#5e6d8d" />
                        </TouchableOpacity>
                    </View>

                    {/* Security Code (not needed for admin) */}
                    {role && role !== 'admin' ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Security Code</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="shield-key-outline" size={20} color="#d97706" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { letterSpacing: 2, fontWeight: '700' }]}
                                    placeholder="Enter code from admin"
                                    placeholderTextColor="#9aa2b1"
                                    value={securityCode}
                                    onChangeText={setSecurityCode}
                                    autoCapitalize="characters"
                                    maxLength={10}
                                />
                            </View>
                            <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4, marginTop: 2 }}>Ask your admin for the registration code</Text>
                        </View>
                    ) : null}

                    {/* Semester Selector for Students */}
                    {role === 'student' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Select Semester</Text>
                            <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowSemesterPicker(true)}>
                                <MaterialCommunityIcons name="calendar-month" size={20} color="#5e6d8d" style={styles.inputIcon} />
                                <Text style={[styles.inputText, !semester && styles.placeholderText]}>
                                    {semester ? `Semester ${semester}` : 'Choose your semester'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={20} color="#5e6d8d" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#5e6d8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                placeholderTextColor="#9aa2b1"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Institutional Email</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#5e6d8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="user@college.edu"
                                placeholderTextColor="#9aa2b1"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="#5e6d8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Create password"
                                placeholderTextColor="#9aa2b1"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#5e6d8d" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#5e6d8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm password"
                                placeholderTextColor="#9aa2b1"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <MaterialCommunityIcons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#5e6d8d" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.registerButtonText}>Register</Text>}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialButton}>
                            <MaterialCommunityIcons name="fingerprint" size={24} color="#101318" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton}>
                            <MaterialCommunityIcons name="face-recognition" size={24} color="#101318" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Role Picker Modal */}
                <Modal visible={showRolePicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowRolePicker(false)} activeOpacity={1}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Role</Text>
                            <FlatList
                                data={ROLES}
                                renderItem={renderRoleItem}
                                keyExtractor={item => item.value}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Semester Picker Modal */}
                <Modal visible={showSemesterPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSemesterPicker(false)} activeOpacity={1}>
                        <View style={[styles.modalContent, { maxHeight: Dimensions.get('window').height * 0.6 }]}>
                            <Text style={styles.modalTitle}>Select Semester</Text>
                            <FlatList
                                data={SEMESTERS}
                                renderItem={renderSemesterItem}
                                keyExtractor={item => item.value}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 1 },
    systemStatus: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '600', color: '#5e6d8d' },

    heroSection: { padding: 16 },
    heroImageContainer: { width: '100%', aspectRatio: 2 / 1, borderRadius: 16, overflow: 'hidden', elevation: 2 },
    heroImage: { width: '100%', height: '100%' },
    gradient: { flex: 1, justifyContent: 'flex-end', padding: 16 },
    heroTitleContainer: { flexDirection: 'row', alignItems: 'center' },
    heroTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
    welcomeContainer: { marginTop: 12, paddingHorizontal: 4 },
    welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#101318' },
    welcomeSubtitle: { fontSize: 16, color: '#5e6d8d', marginTop: 4 },

    formContainer: { paddingHorizontal: 16, gap: 16 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#101318', marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', height: 56, paddingHorizontal: 12 },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: '#101318' },
    inputText: { flex: 1, fontSize: 16, color: '#101318' },
    placeholderText: { color: '#9aa2b1' },
    eyeIcon: { padding: 8 },

    registerButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    registerButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    footer: { padding: 24, marginTop: 'auto', alignItems: 'center' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
    divider: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
    dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600', color: '#9aa2b1' },
    socialButtons: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    socialButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
    loginContainer: { flexDirection: 'row', alignItems: 'center' },
    loginText: { color: '#5e6d8d', fontSize: 14 },
    loginLink: { color: '#0055ff', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#101318' },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalItemText: { fontSize: 16, color: '#5e6d8d' },
    selectedModalItemText: { color: '#0055ff', fontWeight: 'bold' }
});
