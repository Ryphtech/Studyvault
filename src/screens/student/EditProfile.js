import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/firestoreService';

export default function EditProfile({ navigation }) {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Mock initial state based on HTML
    const [profileData, setProfileData] = useState({
        fullName: '',
        department: '',
        cgpa: '',
        semester: '',
        gradYear: '',
        dob: '',
        gender: '',
        email: '',
        phone: '',
        dorm: '',
        profileImage: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    });

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.uid) {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setProfileData({
                        fullName: profile.name || '',
                        department: profile.department || profile.academicDetails?.department || '',
                        cgpa: profile.cgpa || profile.academicDetails?.cgpa || '',
                        semester: profile.semester || '',
                        gradYear: profile.academicDetails?.expectedGraduation || '',
                        dob: profile.personalDetails?.dob || '',
                        gender: profile.personalDetails?.gender || '',
                        bloodGroup: profile.personalDetails?.bloodGroup || '',
                        email: profile.email || user.email || '',
                        phone: profile.contactDetails?.phone || '',
                        dorm: profile.contactDetails?.address || '',
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
        if (!user?.uid) return;
        setSaving(true);

        const updateData = {
            name: profileData.fullName,
            email: profileData.email,
            department: profileData.department,
            semester: profileData.semester,
            cgpa: profileData.cgpa,
            profileImage: profileData.profileImage,
            academicDetails: {
                department: profileData.department,
                cgpa: profileData.cgpa,
                expectedGraduation: profileData.gradYear
            },
            personalDetails: {
                dob: profileData.dob,
                gender: profileData.gender,
                bloodGroup: profileData.bloodGroup
            },
            contactDetails: {
                phone: profileData.phone,
                address: profileData.dorm
            }
        };

        const success = await updateUserProfile(user.uid, updateData);
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
                <ActivityIndicator size="large" color="#0055ff" />
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
                            <ActivityIndicator size="small" color="#0055ff" />
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
                        {/* Academic Information */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>ACADEMIC INFORMATION</Text>

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
                                    <Text style={styles.inputLabel}>CGPA</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.cgpa}
                                        onChangeText={(t) => updateField('cgpa', t)}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Semester</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.semester}
                                        onChangeText={(t) => updateField('semester', t)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Graduation Year</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.gradYear}
                                    onChangeText={(t) => updateField('gradYear', t)}
                                    keyboardType="numeric"
                                    placeholder="YYYY"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>

                        {/* Personal Details */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date of Birth</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.dob}
                                    onChangeText={(t) => updateField('dob', t)}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Gender</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.gender}
                                        onChangeText={(t) => updateField('gender', t)}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Blood Group</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.bloodGroup}
                                        onChangeText={(t) => updateField('bloodGroup', t)}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Contact Details */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>

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
                                <Text style={styles.inputLabel}>Dorm Address</Text>
                                <TextInput
                                    style={styles.textArea}
                                    value={profileData.dorm}
                                    onChangeText={(t) => updateField('dorm', t)}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    placeholder="Enter dormitory address"
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
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: 'rgba(245, 245, 245, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(229, 231, 235, 0.5)',
        zIndex: 10,
    },
    headerSide: {
        width: 64,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#101318',
        letterSpacing: -0.5,
    },
    cancelButton: {
        color: '#0055ff',
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        color: '#0055ff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    photoSection: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    photoContainer: {
        position: 'relative',
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: '#e5e7eb',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0055ff',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 20,
    },
    changePhotoText: {
        color: '#0055ff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 16,
    },
    formContainer: {
        paddingHorizontal: 16,
        gap: 20,
    },
    formSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#5e6d8d',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#5e6d8d',
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#101318',
    },
    textArea: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#101318',
        minHeight: 80,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 16,
    },
    actionSection: {
        paddingTop: 24,
        gap: 12,
    },
    primaryActionButton: {
        backgroundColor: '#0055ff',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0055ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryActionText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryActionButton: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryActionText: {
        color: '#d32f2f',
        fontSize: 14,
        fontWeight: '600',
    },
});
