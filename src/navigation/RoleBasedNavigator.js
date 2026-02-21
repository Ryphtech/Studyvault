import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { RoleContext } from '../context/RoleContext';
import AuthNavigator from './AuthNavigator';

// Placeholder Navigators for Roles
import StudentNavigator from './StudentNavigator';
import FacultyNavigator from './FacultyNavigator';
import AdminNavigator from './AdminNavigator';
import PlacementNavigator from './PlacementNavigator';


export default function RoleBasedNavigator() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { role, loading: roleLoading } = useContext(RoleContext);

    if (authLoading || roleLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                // Role Based Switching
                role === 'student' ? <StudentNavigator /> :
                    role === 'faculty' ? <FacultyNavigator /> :
                        role === 'admin' ? <AdminNavigator /> :
                            role === 'placement_officer' ? <PlacementNavigator /> :
                                <StudentNavigator /> // Default fallback
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}
