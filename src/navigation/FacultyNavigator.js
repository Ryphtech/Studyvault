import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import FacultyDashboard from '../screens/faculty/Dashboard';
import AttendanceManager from '../screens/faculty/AttendanceManager';
import MarksUpload from '../screens/faculty/MarksUpload';
import NotesUpload from '../screens/faculty/NotesUpload';
import MySchedule from '../screens/faculty/MySchedule';
import SettingsScreen from '../screens/common/SettingsScreen';
import Notifications from '../screens/common/Notifications';
import SendNotification from '../screens/common/SendNotification';
import ChatList from '../screens/common/ChatList';
import ChatRoom from '../screens/common/ChatRoom';
import NewChat from '../screens/common/NewChat';
import NotificationDetail from '../screens/common/NotificationDetail';
import SubmitFeedback from '../screens/student/SubmitFeedback';
import PrivacySettings from '../screens/common/PrivacySettings';
import HelpCenter from '../screens/common/HelpCenter';
import TermsOfService from '../screens/common/TermsOfService';

// Placeholders for other faculty screens
const PlaceholderScreen = ({ route }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{route.name} Screen</Text>
    </View>
);

import FacultyProfile from '../screens/faculty/FacultyProfile';
import FacultyEditProfile from '../screens/faculty/FacultyEditProfile';

const Stack = createStackNavigator();

export default function FacultyNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={FacultyDashboard} />
            <Stack.Screen name="AttendanceManager" component={AttendanceManager} />
            <Stack.Screen name="MarksUpload" component={MarksUpload} />
            <Stack.Screen name="NotesUpload" component={NotesUpload} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="SendNotification" component={SendNotification} />
            <Stack.Screen name="MySchedule" component={MySchedule} />
            <Stack.Screen name="Profile" component={FacultyProfile} />
            <Stack.Screen name="EditProfile" component={FacultyEditProfile} />
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} />
            <Stack.Screen name="NewChat" component={NewChat} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
            <Stack.Screen name="SubmitFeedback" component={SubmitFeedback} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} />
            <Stack.Screen name="TermsOfService" component={TermsOfService} />
        </Stack.Navigator>
    );
}
