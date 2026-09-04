import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';
import { fetchAuthUser } from '@/lib/api';
import type { Profile, UserRole } from '@/types';
import { APP_NAME } from '@/constants';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: string | null;
    profile: Profile | null;
  }>;

  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => Promise<{
    error: string | null;
    profile: Profile | null;
  }>;

  signOut: () => Promise<void>;

  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{
    error: string | null;
  }>;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Get the current user's profile.
   *
   * REST API is preferred.
   * Direct database access remains as a fallback
   * to preserve compatibility with the existing system.
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      try {
        const result = await fetchAuthUser();

        if (result.user) {
          return result.user;
        }
      } catch {
        // REST API unavailable - use existing database fallback
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return null;
      }

      return data as Profile | null;
    },
    []
  );

  /**
   * Initialize authentication state.
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && mounted) {
        const profile = await fetchProfile(session.user.id);

        if (mounted) {
          setUser(profile);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    /**
     * Listen for authentication changes.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      (async () => {
        if (session) {
          const profile = await fetchProfile(session.user.id);

          if (mounted) {
            setUser(profile);
          }
        } else {
          setUser(null);
        }

        if (mounted) {
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Sign in existing user.
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return {
          error: 'البريد الإلكتروني مطلوب',
          profile: null,
        };
      }

      if (!password) {
        return {
          error: 'كلمة المرور مطلوبة',
          profile: null,
        };
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) {
        return {
          error: error.message,
          profile: null,
        };
      }

      if (!data.user) {
        return {
          error: 'تعذر الحصول على بيانات المستخدم',
          profile: null,
        };
      }

      const profile = await fetchProfile(data.user.id);

      if (profile) {
        setUser(profile);
      }

      return {
        error: null,
        profile,
      };
    },
    [fetchProfile]
  );

  /**
   * Register a new user.
   *
   * Admin registration is explicitly blocked.
   * Only user and lawyer accounts can be created from the client.
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: UserRole
    ) => {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = fullName.trim();

      if (!normalizedEmail) {
        return {
          error: 'البريد الإلكتروني مطلوب',
          profile: null,
        };
      }

      if (!normalizedName) {
        return {
          error: 'الاسم الكامل مطلوب',
          profile: null,
        };
      }

      if (!password) {
        return {
          error: 'كلمة المرور مطلوبة',
          profile: null,
        };
      }

      if (password.length < 6) {
        return {
          error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
          profile: null,
        };
      }

      /**
       * Security:
       * Admin accounts must never be created from the public registration form.
       */
      if (role !== 'user' && role !== 'lawyer') {
        return {
          error: 'نوع الحساب غير مسموح به',
          profile: null,
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
            role,
          },
        },
      });

      if (error) {
        return {
          error: error.message,
          profile: null,
        };
      }

      let profile: Profile | null = null;

      if (data.user) {
        /**
         * Only safe public roles are allowed here.
         * Admin is rejected above.
         */
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: normalizedEmail,
            full_name: normalizedName,
            role,
            is_active: true,
          });

        if (profileError) {
          return {
            error: profileError.message,
            profile: null,
          };
        }

        profile = await fetchProfile(data.user.id);

        if (profile) {
          setUser(profile);
        }
      }

      return {
        error: null,
        profile,
      };
    },
    [fetchProfile]
  );

  /**
   * Sign out current user.
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  /**
   * Update allowed profile fields only.
   *
   * Sensitive fields such as:
   * id
   * email
   * role
   * is_active
   * are intentionally excluded.
   */
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        return {
          error: 'غير مسجل',
        };
      }

      /**
       * Build a safe update object.
       * Only fields that a normal user should be able to edit
       * are accepted.
       */
      const safeUpdates: Partial<Profile> = {};

      if (typeof updates.full_name === 'string') {
        const fullName = updates.full_name.trim();

        if (fullName.length > 0) {
          safeUpdates.full_name = fullName;
        }
      }

      if (typeof updates.phone === 'string') {
        safeUpdates.phone = updates.phone.trim();
      }

      if (typeof updates.avatar_url === 'string') {
        safeUpdates.avatar_url = updates.avatar_url.trim();
      }

      if (typeof updates.bio === 'string') {
        safeUpdates.bio = updates.bio.trim();
      }

      /**
       * Prevent empty update requests.
       */
      if (Object.keys(safeUpdates).length === 0) {
        return {
          error: 'لا توجد بيانات صالحة للتحديث',
        };
      }

      const { error } = await supabase
        .from('profiles')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) {
        return {
          error: error.message,
        };
      }

      setUser({
        ...user,
        ...safeUpdates,
      });

      return {
        error: null,
      };
    },
    [user]
  );

  /**
   * Refresh current user's profile.
   */
  const refreshUser = useCallback(async () => {
    if (!user) {
      return;
    }

    const profile = await fetchProfile(user.id);

    if (profile) {
      setUser(profile);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      `${APP_NAME}: useAuth must be used within AuthProvider`
    );
  }

  return ctx;
}