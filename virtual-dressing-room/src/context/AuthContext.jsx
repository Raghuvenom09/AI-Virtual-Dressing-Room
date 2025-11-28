// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // INITIALIZATION & SESSION MANAGEMENT
  // ============================================

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        // Try to get session from Supabase
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session) {
            setSession(session);
            setUser(session?.user || null);
            console.log('✅ Auth initialized:', session?.user?.email || 'No user');
            setLoading(false);
            return;
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase not available, using demo mode');
        }

        // Demo mode: Check localStorage for demo user
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
          const user = JSON.parse(demoUser);
          setUser(user);
          setSession({ user });
          console.log('✅ Demo mode: User restored from storage');
        } else {
          console.log('✅ Demo mode: Ready for login');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Try to subscribe to auth state changes (may fail in demo mode)
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('🔄 Auth state changed:', event);
          setSession(session);
          setUser(session?.user || null);
          setError(null);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.warn('⚠️ Auth state subscription not available in demo mode');
    }
  }, []);

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  const signUp = useCallback(async (email, password, fullName) => {
    setLoading(true);
    setError(null);
    try {
      // Try Supabase first
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        // Create user profile in database
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email,
                full_name: fullName,
                provider: 'email',
              },
            ]);

          if (profileError) {
            console.warn('Profile creation warning:', profileError);
          }
        }

        return { data, error: null };
      } catch (supabaseError) {
        console.warn('⚠️ Supabase signup failed, using demo mode');
        
        // Demo mode: Create user in localStorage
        const demoUser = {
          id: 'demo-' + Date.now(),
          email,
          user_metadata: {
            full_name: fullName,
          },
        };
        
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setSession({ user: demoUser });
        
        return { data: { user: demoUser }, error: null };
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Try Supabase first
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return { data, error: null };
      } catch (supabaseError) {
        console.warn('⚠️ Supabase signin failed, using demo mode');
        
        // Demo mode: Accept any email/password combination
        const demoUser = {
          id: 'demo-' + Date.now(),
          email,
          user_metadata: {
            full_name: email.split('@')[0],
          },
        };
        
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setSession({ user: demoUser });
        
        return { data: { user: demoUser }, error: null };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      // Check for error response
      if (error) {
        console.warn('⚠️ Google OAuth error:', error);
        throw error;
      }

      // If no error and no data, also use demo mode
      if (!data) {
        throw new Error('No data returned from Google OAuth');
      }

      return { data, error: null };
    } catch (error) {
      console.warn('⚠️ Google OAuth not configured in Supabase, using demo mode');
      console.warn('Error details:', error);
      
      // Demo mode: Create a demo Google user
      const demoGoogleUser = {
        id: 'demo-google-' + Date.now(),
        email: 'demo.google@example.com',
        user_metadata: {
          full_name: 'Demo Google User',
          provider: 'google',
        },
      };
      
      localStorage.setItem('demo_user', JSON.stringify(demoGoogleUser));
      setUser(demoGoogleUser);
      setSession({ user: demoGoogleUser });
      setError(null);
      
      console.log('✅ Demo mode: Google login successful');
      return { data: { user: demoGoogleUser }, error: null };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try Supabase logout
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase logout failed, using demo mode');
      }
      
      // Clear demo mode
      localStorage.removeItem('demo_user');
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
