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

const Stack = createStackNavigator();

export default function PlacementNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={PlacementDashboard} options={{ title: 'Placement Cell' }} />
            <Stack.Screen name="Drives" component={ManageDrives} />
            <Stack.Screen name="FilterStudents" component={PlaceholderScreen} />
            <Stack.Screen name="Results" component={PlaceholderScreen} />
        </Stack.Navigator>
    );
}
