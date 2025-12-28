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

import ManageEvents from '../screens/admin/ManageEvents';

import ManageFeedback from '../screens/admin/ManageFeedback';

const Stack = createStackNavigator();

export default function AdminNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Admin Panel' }} />
            <Stack.Screen name="ManageStudents" component={ManageStudents} />
            <Stack.Screen name="ManageFaculty" component={PlaceholderScreen} />
            <Stack.Screen name="ManageEvents" component={ManageEvents} />
            <Stack.Screen name="ManageFeedback" component={ManageFeedback} />
        </Stack.Navigator>
    );
}
