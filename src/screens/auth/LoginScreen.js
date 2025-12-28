import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('Student'); // Student or Faculty/Staff

    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        setLoading(true);
        try {
            await login(email, password, activeTab); // Pass role for potential validaiton or UI context
        } catch (error) {
            console.error(error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>

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
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSubtitle}>Sign in to access your portal</Text>
                    </View>
                </View>

                {/* Role Selector */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabBackground}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Student' && styles.activeTab]}
                            onPress={() => setActiveTab('Student')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Student' && styles.activeTabData]}>Student</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Faculty/Staff' && styles.activeTab]}
                            onPress={() => setActiveTab('Faculty/Staff')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Faculty/Staff' && styles.activeTabData]}>Faculty/Staff</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Institutional Email</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#5e6d8d" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="student@college.edu"
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
                                placeholder="••••••••"
                                placeholderTextColor="#9aa2b1"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#5e6d8d" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 5 }}>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>Log In</Text>}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
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

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>New here? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Register as new {activeTab === 'Student' ? 'student' : 'faculty'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </KeyboardAvoidingView>
        </ScrollView>
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

    tabContainer: { paddingHorizontal: 16, marginBottom: 16 },
    tabBackground: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 12, padding: 4, height: 48 },
    tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: 'white', elevation: 1 },
    tabText: { fontSize: 14, fontWeight: '600', color: '#5e6d8d' },
    activeTabData: { color: '#0055ff' },

    formContainer: { paddingHorizontal: 16, gap: 16 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#101318', marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', height: 56, paddingHorizontal: 12 },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 16, color: '#101318' },
    eyeIcon: { padding: 8 },
    forgotPassword: { color: '#0055ff', fontSize: 14, fontWeight: '600' },

    loginButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    footer: { padding: 24, marginTop: 'auto', alignItems: 'center' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
    divider: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
    dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600', color: '#9aa2b1' },
    socialButtons: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    socialButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
    registerContainer: { flexDirection: 'row', alignItems: 'center' },
    registerText: { color: '#5e6d8d', fontSize: 14 },
    registerLink: { color: '#0055ff', fontSize: 14, fontWeight: 'bold', textDecorationLine: 'underline' }
});
