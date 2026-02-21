import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlacementDashboard from '../screens/placement/Dashboard';
import { View, Text } from 'react-native';

const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

import ManageDrives from '../screens/placement/ManageDrives';

import FilterStudents from '../screens/placement/FilterStudents';

import Results from '../screens/placement/Results';

import SettingsScreen from '../screens/common/SettingsScreen';

import StudentProfile from '../screens/student/StudentProfile';

const Stack = createStackNavigator();

export default function PlacementNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={PlacementDashboard} options={{ title: 'Placement Cell' }} />
            <Stack.Screen name="Drives" component={ManageDrives} />
            <Stack.Screen name="FilterStudents" component={FilterStudents} />
            <Stack.Screen name="Results" component={Results} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={StudentProfile} />
        </Stack.Navigator>
    );
}
