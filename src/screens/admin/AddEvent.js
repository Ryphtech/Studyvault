import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Dimensions, Switch, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createEvent } from '../../services/supabaseService';

const { width } = Dimensions.get('window');

// List of categories
const categories = ['Workshop', 'Seminar', 'Cultural', 'Sports'];

export default function AddEvent({ navigation }) {
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);

    const [imageUri, setImageUri] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');

    // Dates & Times
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date((new Date()).getTime() + 60 * 60 * 1000)); // +1 hour

    // Picker visibility states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [registrationEnabled, setRegistrationEnabled] = useState(true);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [21, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleCreateEvent = async () => {
        if (!title || !category || !location) {
            Alert.alert("Missing Fields", "Please complete all required fields.");
            return;
        }

        setLoading(true);

        const newEvent = {
            title,
            category,
            date: date.toISOString(), // Convert date to standard ISO 
            time: `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            location,
            description,
            registrationEnabled,
            status: date > new Date() ? 'Upcoming' : 'Past',
            image: imageUri || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', // default image
            month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
            dateNum: date.getDate().toString().padStart(2, '0'),
            createdAt: new Date().toISOString()
        };

        const result = await createEvent(newEvent);

        setLoading(false);

        if (result.success) {
            Alert.alert("Success", "Event created successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Error", "Failed to create event.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialCommunityIcons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Event</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Event Banner */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Event Banner</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.bannerImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialCommunityIcons name="image" size={32} color="#9ca3af" />
                                <Text style={styles.imagePlaceholderText}>Choose Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Title */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Event Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter event name"
                        placeholderTextColor="#9ca3af"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Category */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <TouchableOpacity
                        style={styles.selectInput}
                        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    >
                        <Text style={[styles.selectText, !category && { color: '#9ca3af' }]}>
                            {category || "Select category"}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={24} color="#6b7280" />
                    </TouchableOpacity>

                    {showCategoryPicker && (
                        <View style={styles.dropdownMenu}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setCategory(cat);
                                        setShowCategoryPicker(false);
                                    }}
                                >
                                    <Text style={styles.dropdownItemText}>{cat}</Text>
                                    {category === cat && <MaterialCommunityIcons name="check" size={20} color="#0055ff" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Date & Time */}
                <View style={styles.dateTimeGroup}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Date</Text>
                        <TouchableOpacity style={styles.pickerInput} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rowGrid}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Start Time</Text>
                            <TouchableOpacity style={styles.pickerInput} onPress={() => setShowStartTimePicker(true)}>
                                <Text style={styles.pickerText}>
                                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>End Time</Text>
                            <TouchableOpacity style={styles.pickerInput} onPress={() => setShowEndTimePicker(true)}>
                                <Text style={styles.pickerText}>
                                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Platform specific pickers */}
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}
                {showStartTimePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowStartTimePicker(false);
                            if (selectedTime) setStartTime(selectedTime);
                        }}
                    />
                )}
                {showEndTimePicker && (
                    <DateTimePicker
                        value={endTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowEndTimePicker(false);
                            if (selectedTime) setEndTime(selectedTime);
                        }}
                    />
                )}

                {/* Location */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Location</Text>
                    <View style={styles.iconInputWrapper}>
                        <MaterialIcons name="location-on" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                            style={styles.iconInput}
                            placeholder="e.g., Auditorium, Room 101"
                            placeholderTextColor="#9ca3af"
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Event Description</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Tell more about the event..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Enable Registration Toggle */}
                <View style={styles.toggleRow}>
                    <View style={styles.toggleTextContainer}>
                        <Text style={styles.toggleTitle}>Enable Registration</Text>
                        <Text style={styles.toggleDesc}>Allow students to register for this event</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#e5e7eb", true: "#0055ff" }}
                        thumbColor={"white"}
                        ios_backgroundColor="#e5e7eb"
                        onValueChange={setRegistrationEnabled}
                        value={registrationEnabled}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity style={styles.submitButton} onPress={handleCreateEvent} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Event</Text>
                    )}
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: 'rgba(245, 245, 245, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(229, 231, 235, 0.5)' },
    iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },

    scrollContent: { paddingHorizontal: 16, paddingTop: 24 },

    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginLeft: 4 },

    imagePicker: { width: '100%', aspectRatio: 21 / 9, borderRadius: 16, backgroundColor: 'white', borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', overflow: 'hidden' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    imagePlaceholderText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
    bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 14, color: '#111827' },

    selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, height: 50 },
    selectText: { fontSize: 14, color: '#111827' },
    dropdownMenu: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginTop: 4, overflow: 'hidden' },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    dropdownItemText: { fontSize: 14, color: '#374151' },

    dateTimeGroup: { gap: 0 },
    rowGrid: { flexDirection: 'row', gap: 16 },
    pickerInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, height: 50, justifyContent: 'center' },
    pickerText: { fontSize: 14, color: '#111827' },

    iconInputWrapper: { position: 'relative', justifyContent: 'center' },
    inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
    iconInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingLeft: 44, paddingRight: 16, height: 50, fontSize: 14, color: '#111827' },

    textArea: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, fontSize: 14, color: '#111827', minHeight: 100 },

    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4 },
    toggleTextContainer: { flex: 1 },
    toggleTitle: { fontSize: 14, fontWeight: '600', color: '#374151' },
    toggleDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(245, 245, 245, 0.8)', borderTopWidth: 1, borderTopColor: 'rgba(229, 231, 235, 0.5)' },
    submitButton: { backgroundColor: '#0055ff', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#0055ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
