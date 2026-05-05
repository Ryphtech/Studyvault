import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { factoryResetSystem } from '../../services/supabaseService';

export default function SystemReset({ navigation }) {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const executeFactoryReset = async () => {
        if (confirmText !== 'CONFIRM RESET') {
            Alert.alert("Aborted", "You did not type the exact confirmation phrase.");
            return;
        }

        setLoading(true);
        const res = await factoryResetSystem(user.id);
        setLoading(false);

        if (res.success) {
            Alert.alert("System Reset Complete", "The database has been factory reset. You are the only remaining user.", [
                { text: "OK", onPress: () => navigation.navigate('Dashboard') }
            ]);
        } else {
            Alert.alert("Reset Failed", res.message);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#101318" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>System Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.warningCard}>
                    <MaterialCommunityIcons name="alert-decagram" size={48} color="#dc2626" />
                    <Text style={styles.warningTitle}>Danger Zone</Text>
                    <Text style={styles.warningDesc}>
                        The options below are highly destructive and cannot be undone. Proceed with absolute caution.
                    </Text>
                </View>

                <View style={styles.actionContainer}>
                    <Text style={styles.actionTitle}>Factory Reset System</Text>
                    <Text style={styles.actionDesc}>
                        Wipes all users, attendance, marks, events, and other app data. Only the current admin account and security role codes will be retained.
                    </Text>

                    {!showConfirm ? (
                        <TouchableOpacity 
                            style={styles.resetButton} 
                            onPress={() => setShowConfirm(true)}
                        >
                            <MaterialCommunityIcons name="delete-forever" size={24} color="white" />
                            <Text style={styles.resetButtonText}>Initiate Factory Reset</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.confirmBox}>
                            <Text style={styles.confirmBoxTitle}>Confirm Deletion</Text>
                            <Text style={styles.confirmBoxDesc}>Type <Text style={{fontWeight: 'bold', color: '#dc2626'}}>CONFIRM RESET</Text> below to proceed:</Text>
                            
                            <TextInput
                                style={styles.input}
                                placeholder="CONFIRM RESET"
                                value={confirmText}
                                onChangeText={setConfirmText}
                                autoCapitalize="characters"
                            />
                            
                            <View style={styles.confirmActions}>
                                <TouchableOpacity 
                                    style={styles.cancelButton} 
                                    onPress={() => { setShowConfirm(false); setConfirmText(''); }}
                                    disabled={loading}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.finalResetButton, loading && { opacity: 0.7 }]} 
                                    onPress={executeFactoryReset}
                                    disabled={loading || confirmText !== 'CONFIRM RESET'}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text style={styles.finalResetButtonText}>Delete Everything</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6f8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318' },
    content: { padding: 24 },
    warningCard: { backgroundColor: '#fef2f2', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: '#fecaca' },
    warningTitle: { fontSize: 20, fontWeight: 'bold', color: '#991b1b', marginTop: 12, marginBottom: 8 },
    warningDesc: { fontSize: 14, color: '#b91c1c', textAlign: 'center', lineHeight: 20 },
    actionContainer: { backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 2 },
    actionTitle: { fontSize: 18, fontWeight: 'bold', color: '#101318', marginBottom: 8 },
    actionDesc: { fontSize: 14, color: '#5e6d8d', lineHeight: 20, marginBottom: 24 },
    resetButton: { backgroundColor: '#dc2626', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    resetButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    
    confirmBox: { backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
    confirmBoxTitle: { fontSize: 16, fontWeight: 'bold', color: '#991b1b', marginBottom: 4 },
    confirmBoxDesc: { fontSize: 14, color: '#b91c1c', marginBottom: 12 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#fca5a5', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
    confirmActions: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center' },
    cancelButtonText: { color: '#4b5563', fontWeight: 'bold' },
    finalResetButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
    finalResetButtonText: { color: 'white', fontWeight: 'bold' }
});
