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
import ManageDriveResults from '../screens/placement/ManageDriveResults';

import FilterStudents from '../screens/placement/FilterStudents';

import Results from '../screens/placement/Results';

import SettingsScreen from '../screens/common/SettingsScreen';
import Notifications from '../screens/common/Notifications';

import StudentProfile from '../screens/student/StudentProfile';
import ChatList from '../screens/common/ChatList';
import ChatRoom from '../screens/common/ChatRoom';
import NewChat from '../screens/common/NewChat';
import NotificationDetail from '../screens/common/NotificationDetail';
import SubmitFeedback from '../screens/student/SubmitFeedback';

const Stack = createStackNavigator();

export default function PlacementNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={PlacementDashboard} options={{ title: 'Placement Cell' }} />
            <Stack.Screen name="Drives" component={ManageDrives} />
            <Stack.Screen name="ManageDriveResults" component={ManageDriveResults} />
            <Stack.Screen name="FilterStudents" component={FilterStudents} />
            <Stack.Screen name="Results" component={Results} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Profile" component={StudentProfile} />
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} />
            <Stack.Screen name="NewChat" component={NewChat} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
            <Stack.Screen name="SubmitFeedback" component={SubmitFeedback} />
        </Stack.Navigator>
    );
}
