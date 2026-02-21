import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import FacultyDashboard from '../screens/faculty/Dashboard';
import AttendanceManager from '../screens/faculty/AttendanceManager';
import MarksUpload from '../screens/faculty/MarksUpload';
import NotesUpload from '../screens/faculty/NotesUpload';
import SettingsScreen from '../screens/common/SettingsScreen';

// Placeholders for other faculty screens
const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

import StudentProfile from '../screens/student/StudentProfile';

const Stack = createStackNavigator();

export default function FacultyNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={FacultyDashboard} />
            <Stack.Screen name="AttendanceManager" component={AttendanceManager} />
            <Stack.Screen name="MarksUpload" component={MarksUpload} />
            <Stack.Screen name="NotesUpload" component={NotesUpload} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={StudentProfile} />
        </Stack.Navigator>
    );
}
