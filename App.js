import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { RoleProvider } from './src/context/RoleContext';
import RoleBasedNavigator from './src/navigation/RoleBasedNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0055FF',
    accent: '#F5F5F5',
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <RoleProvider>
            <RoleBasedNavigator />
          </RoleProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
