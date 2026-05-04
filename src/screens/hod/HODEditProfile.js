import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/supabaseService';

export default function HODEditProfile({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        fullName: '',
        department: '',
        designation: '',
        qualification: '',
        experience: '',
        employeeId: '',
        dob: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        profileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    });

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.id) {
                const profile = await getUserProfile(user.id);
                if (profile) {
                    setProfileData({
                        fullName: profile.name || '',
                        department: profile.department || '',
                        designation: profile.designation || 'Head of Department',
                        qualification: profile.qualification || '',
                        experience: profile.experience || '',
                        employeeId: profile.employeeId || profile.rollNo || '',
                        dob: profile.dob || '',
                        gender: profile.gender || '',
                        email: profile.email || user.email || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        profileImage: profile.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                    });
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [user]);

    const updateField = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);

        const updateData = {
            name: profileData.fullName,
            email: profileData.email,
            department: profileData.department || null,
            designation: profileData.designation || null,
            qualification: profileData.qualification || null,
            experience: profileData.experience || null,
            employeeId: profileData.employeeId || null,
            profileImage: profileData.profileImage || null,
            dob: profileData.dob || null,
            gender: profileData.gender || null,
            phone: profileData.phone || null,
            address: profileData.address || null,
        };

        const success = await updateUserProfile(user.id, updateData);
        setSaving(false);

        if (success) {
            alert('Profile updated successfully!');
            navigation.goBack();
        } else {
            alert('Failed to update profile. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <View style={styles.headerSide}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color="#7c3aed" />
                        ) : (
                            <Text style={styles.saveButton}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Profile Photo Section */}
                    <TouchableOpacity style={styles.photoSection} onPress={handleImagePick}>
                        <View style={styles.photoContainer}>
                            <Image
                                source={{ uri: profileData.profileImage }}
                                style={styles.photo}
                            />
                            <View style={styles.photoOverlay}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color="white" />
                            </View>
                            <View style={styles.editIconBadge}>
                                <MaterialCommunityIcons name="pencil" size={20} color="white" />
                            </View>
                        </View>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>

                    <View style={styles.formContainer}>
                        {/* Professional Information */}
                        <View style={styles.formSection}>
                            <View style={styles.formSectionHeader}>
                                <MaterialCommunityIcons name="briefcase-outline" size={18} color="#7c3aed" />
                                <Text style={styles.sectionTitle}>PROFESSIONAL INFORMATION</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.fullName}
                                    onChangeText={(t) => updateField('fullName', t)}
                                    placeholder="Enter full name"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Department</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.department}
                                    onChangeText={(t) => updateField('department', t)}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Designation</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.designation}
                                        onChangeText={(t) => updateField('designation', t)}
                                        placeholder="e.g. HOD"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Experience (Years)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.experience}
                                        onChangeText={(t) => updateField('experience', t)}
                                        keyboardType="numeric"
                                        placeholder="e.g. 15"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Qualification</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.qualification}
                                        onChangeText={(t) => updateField('qualification', t)}
                                        placeholder="e.g. PhD, M.Tech"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Employee ID</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.employeeId}
                                        onChangeText={(t) => updateField('employeeId', t)}
                                        placeholder="e.g. HOD001"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Personal Details */}
                        <View style={styles.formSection}>
                            <View style={styles.formSectionHeader}>
                                <MaterialCommunityIcons name="account-details-outline" size={18} color="#ea580c" />
                                <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Date of Birth</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.dob}
                                        onChangeText={(t) => updateField('dob', t)}
                                        placeholder="DD/MM/YYYY"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Gender</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.gender}
                                        onChangeText={(t) => updateField('gender', t)}
                                        placeholder="e.g. Male"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Contact Details */}
                        <View style={styles.formSection}>
                            <View style={styles.formSectionHeader}>
                                <MaterialCommunityIcons name="card-account-phone-outline" size={18} color="#059669" />
                                <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.email}
                                    onChangeText={(t) => updateField('email', t)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.phone}
                                    onChangeText={(t) => updateField('phone', t)}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Address</Text>
                                <TextInput
                                    style={styles.textArea}
                                    value={profileData.address}
                                    onChangeText={(t) => updateField('address', t)}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    placeholder="Enter address"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionSection}>
                            <TouchableOpacity style={styles.primaryActionButton} onPress={handleSave} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.primaryActionText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryActionButton} onPress={() => navigation.goBack()} disabled={saving}>
                                <Text style={styles.secondaryActionText}>Discard Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'rgba(245, 246, 248, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)', zIndex: 10 },
    headerSide: { width: 64, justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#0f172a', letterSpacing: -0.5 },
    cancelButton: { color: '#7c3aed', fontSize: 16, fontWeight: '500' },
    saveButton: { color: '#7c3aed', fontSize: 16, fontWeight: 'bold' },
    scrollContent: { paddingBottom: 40 },
    photoSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
    photoContainer: { position: 'relative', width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: 'white', backgroundColor: '#e5e7eb', overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    photo: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7c3aed', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', zIndex: 20 },
    changePhotoText: { color: '#7c3aed', fontSize: 14, fontWeight: '600', marginTop: 16 },
    formContainer: { paddingHorizontal: 16, gap: 20 },
    formSection: { gap: 16 },
    formSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#5e6d8d', textTransform: 'uppercase', letterSpacing: 1 },
    inputGroup: { gap: 6 },
    inputLabel: { fontSize: 14, fontWeight: '500', color: '#5e6d8d', marginLeft: 4 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a' },
    textArea: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a', minHeight: 80 },
    rowInputs: { flexDirection: 'row', gap: 16 },
    actionSection: { paddingTop: 24, gap: 12 },
    primaryActionButton: { backgroundColor: '#7c3aed', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
    primaryActionText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    secondaryActionButton: { height: 48, justifyContent: 'center', alignItems: 'center' },
    secondaryActionText: { color: '#d32f2f', fontSize: 14, fontWeight: '600' },
});
