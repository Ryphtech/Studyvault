import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/Dashboard';
import { View, Text } from 'react-native';

const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

import ManageStudents from '../screens/admin/ManageStudents';

import ManageFaculty from '../screens/admin/ManageFaculty';
import ManageEvents from '../screens/admin/ManageEvents';

import ManageFeedback from '../screens/admin/ManageFeedback';
import SettingsScreen from '../screens/common/SettingsScreen';

import StudentProfile from '../screens/student/StudentProfile';

const Stack = createStackNavigator();

export default function AdminNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Admin Panel' }} />
            <Stack.Screen name="ManageStudents" component={ManageStudents} />
            <Stack.Screen name="ManageFaculty" component={ManageFaculty} />
            <Stack.Screen name="ManageEvents" component={ManageEvents} />
            <Stack.Screen name="ManageFeedback" component={ManageFeedback} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={StudentProfile} />
        </Stack.Navigator>
    );
}
