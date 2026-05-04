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
import AddFaculty from '../screens/admin/AddFaculty';
import ManageSubjects from '../screens/admin/ManageSubjects';
import ManageEvents from '../screens/admin/ManageEvents';
import AddEvent from '../screens/admin/AddEvent';
import ManageFeedback from '../screens/admin/ManageFeedback';
import AssignFacultySubject from '../screens/admin/AssignFacultySubject';
import ManageRoleCodes from '../screens/admin/ManageRoleCodes';
import ManageDepartments from '../screens/admin/ManageDepartments';
import SettingsScreen from '../screens/common/SettingsScreen';
import Notifications from '../screens/common/Notifications';
import SendNotification from '../screens/common/SendNotification';
import NotificationDetail from '../screens/common/NotificationDetail';
import SubmitFeedback from '../screens/student/SubmitFeedback';
import PrivacySettings from '../screens/common/PrivacySettings';
import HelpCenter from '../screens/common/HelpCenter';
import TermsOfService from '../screens/common/TermsOfService';

import StudentProfile from '../screens/student/StudentProfile';

const Stack = createStackNavigator();

export default function AdminNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Admin Panel' }} />
            <Stack.Screen name="ManageStudents" component={ManageStudents} />
            <Stack.Screen name="ManageFaculty" component={ManageFaculty} />
            <Stack.Screen name="AddFaculty" component={AddFaculty} />
            <Stack.Screen name="ManageSubjects" component={ManageSubjects} />
            <Stack.Screen name="AssignFacultySubject" component={AssignFacultySubject} />
            <Stack.Screen name="ManageEvents" component={ManageEvents} />
            <Stack.Screen name="AddEvent" component={AddEvent} />
            <Stack.Screen name="ManageFeedback" component={ManageFeedback} />
            <Stack.Screen name="ManageRoleCodes" component={ManageRoleCodes} />
            <Stack.Screen name="ManageDepartments" component={ManageDepartments} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="SendNotification" component={SendNotification} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
            <Stack.Screen name="SubmitFeedback" component={SubmitFeedback} />
            <Stack.Screen name="Profile" component={StudentProfile} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} />
            <Stack.Screen name="TermsOfService" component={TermsOfService} />
        </Stack.Navigator>
    );
}
