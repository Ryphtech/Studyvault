import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Added
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Added for icons
import { View, Text } from 'react-native'; // Keep View/Text for placeholders if needed

import StudentDashboard from '../screens/student/Dashboard';
import AttendanceScreen from '../screens/student/Attendance';
import MarksScreen from '../screens/student/Marks';
import EventsScreen from '../screens/student/Events';
import StudentProfile from '../screens/student/StudentProfile';
import PlacementsScreen from '../screens/student/Placements';
import ApplyDrive from '../screens/student/ApplyDrive';
import EditProfile from '../screens/student/EditProfile';
import DriveResults from '../screens/student/DriveResults';
import SettingsScreen from '../screens/common/SettingsScreen';

// Placeholders for other student screens
const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function StudentTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#0055ff',
                tabBarInactiveTintColor: '#9aa2b1',
                tabBarStyle: {
                    height: 80,
                    paddingBottom: 8,
                    paddingTop: 8,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderTopColor: '#f3f4f6',
                    elevation: 8
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                    } else if (route.name === 'Attendance') {
                        iconName = focused ? 'book-open-page-variant' : 'book-open-page-variant-outline';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Events') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'cog' : 'cog-outline';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={StudentDashboard} />
            <Tab.Screen name="Attendance" component={AttendanceScreen} />
            <Tab.Screen name="Jobs" component={PlacementsScreen} />
            <Tab.Screen name="Events" component={EventsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

export default function StudentNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={StudentTabNavigator} />

            {/* Screens that should hide the tab bar or be pushed on top */}
            <Stack.Screen name="Profile" component={StudentProfile} />
            <Stack.Screen name="Marks" component={MarksScreen} />
            <Stack.Screen name="Notes" component={PlaceholderScreen} />
            <Stack.Screen name="ApplyDrive" component={ApplyDrive} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="DriveResults" component={DriveResults} />

            {/* Note: If Placements/Events/Settings need detail screens, add them here */}
        </Stack.Navigator>
    );
}
