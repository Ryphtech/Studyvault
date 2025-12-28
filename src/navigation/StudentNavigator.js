import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import StudentDashboard from '../screens/student/Dashboard';
import AttendanceScreen from '../screens/student/Attendance';
import MarksScreen from '../screens/student/Marks';
import EventsScreen from '../screens/student/Events';

import PlacementsScreen from '../screens/student/Placements';

// Placeholders for other student screens
const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

const Stack = createStackNavigator();

export default function StudentNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={StudentDashboard} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Marks" component={MarksScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="Notes" component={PlaceholderScreen} />
            <Stack.Screen name="Placements" component={PlacementsScreen} />
        </Stack.Navigator>
    );
}
