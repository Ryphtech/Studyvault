import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthContext } from './AuthContext';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            let cancelled = false;

            const fetchRole = async (retries = 5) => {
                for (let attempt = 0; attempt < retries; attempt++) {
                    try {
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single();

                        if (data?.role && !cancelled) {
                            setRole(data.role);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.log(`Role fetch attempt ${attempt + 1} failed, retrying...`);
                    }
                    // Wait before retrying (profile may not be inserted yet during registration)
                    if (attempt < retries - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                // All retries exhausted
                if (!cancelled) {
                    setRole(null);
                    setLoading(false);
                }
            };

            fetchRole();
            return () => { cancelled = true; };
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
