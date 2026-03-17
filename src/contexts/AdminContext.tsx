import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

interface AdminContextType {
  adminProfile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAdminId = localStorage.getItem('adminProfileId');
    if (savedAdminId) {
      checkAdminProfile(savedAdminId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAdminProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('role', 'admin')
        .single();

      if (error || !data) {
        localStorage.removeItem('adminProfileId');
        setAdminProfile(null);
      } else {
        setAdminProfile(data);
      }
    } catch (err) {
      console.error('Error checking admin profile:', err);
      setAdminProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return false;
      }

      // Check if user has admin role in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .eq('role', 'admin')
        .single();

      if (profileError || !profileData) {
        // User authenticated but not an admin, sign them out
        await supabase.auth.signOut();
        return false;
      }

      setAdminProfile(profileData);
      localStorage.setItem('adminProfileId', profileData.id);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdminProfile(null);
    localStorage.removeItem('adminProfileId');
  };

  return (
    <AdminContext.Provider
      value={{
        adminProfile,
        isAdmin: !!adminProfile,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
