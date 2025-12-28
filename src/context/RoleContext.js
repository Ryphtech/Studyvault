import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { AuthContext } from './AuthContext';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchRole = async () => {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setRole(docSnap.data().role);
                    } else {
                        // Fallback or error if role not found
                        // For development we might want to default to student or leave as null
                        setRole(null);
                    }
                } catch (e) {
                    console.error("Error fetching role", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchRole();
        } else {
            setRole(null);
            setLoading(false);
        }
    }, [user]);

    return (
        <RoleContext.Provider value={{ role, loading }}>
            {children}
        </RoleContext.Provider>
    );
};
