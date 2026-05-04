import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HODDashboard from '../screens/hod/Dashboard';
import HODAssignSubjects from '../screens/hod/AssignSubjects';
import ManageSubjects from '../screens/admin/ManageSubjects';
import ManageFaculty from '../screens/admin/ManageFaculty';
import AddFaculty from '../screens/admin/AddFaculty';
import ManageFeedback from '../screens/admin/ManageFeedback';
import ManageSchedules from '../screens/admin/ManageSchedules';
import SettingsScreen from '../screens/common/SettingsScreen';
import Notifications from '../screens/common/Notifications';
import SendNotification from '../screens/common/SendNotification';
import NotificationDetail from '../screens/common/NotificationDetail';
import HODProfile from '../screens/hod/HODProfile';
import HODEditProfile from '../screens/hod/HODEditProfile';
import ChatList from '../screens/common/ChatList';
import ChatRoom from '../screens/common/ChatRoom';
import NewChat from '../screens/common/NewChat';
import SubmitFeedback from '../screens/student/SubmitFeedback';
import PrivacySettings from '../screens/common/PrivacySettings';
import HelpCenter from '../screens/common/HelpCenter';
import TermsOfService from '../screens/common/TermsOfService';
import CreateFeedback from '../screens/admin/CreateFeedback';
import FeedbackResults from '../screens/admin/FeedbackResults';
import AssignFacultySubject from '../screens/admin/AssignFacultySubject';

const Stack = createStackNavigator();

export default function HODNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={HODDashboard} options={{ title: 'HOD Panel' }} />
            <Stack.Screen name="AssignSubjects" component={HODAssignSubjects} />
            <Stack.Screen name="DeptFaculty" component={HODAssignSubjects} />
            <Stack.Screen name="DeptCurriculum" component={ManageSubjects} />
            <Stack.Screen name="ManageFaculty" component={ManageFaculty} />
            <Stack.Screen name="AssignFacultySubject" component={AssignFacultySubject} />
            <Stack.Screen name="AddFaculty" component={AddFaculty} />
            <Stack.Screen name="ManageFeedback" component={ManageFeedback} />
            <Stack.Screen name="CreateFeedback" component={CreateFeedback} />
            <Stack.Screen name="FeedbackResults" component={FeedbackResults} />
            <Stack.Screen name="ManageSchedules" component={ManageSchedules} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="SendNotification" component={SendNotification} />
            <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
            <Stack.Screen name="Profile" component={HODProfile} />
            <Stack.Screen name="HODEditProfile" component={HODEditProfile} />
            <Stack.Screen name="ChatList" component={ChatList} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} />
            <Stack.Screen name="NewChat" component={NewChat} />
            <Stack.Screen name="SubmitFeedback" component={SubmitFeedback} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
            <Stack.Screen name="HelpCenter" component={HelpCenter} />
            <Stack.Screen name="TermsOfService" component={TermsOfService} />
        </Stack.Navigator>
    );
}
