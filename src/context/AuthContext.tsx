import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase/client';
import { getCurrentUser, signOut as authSignOut, AuthUser } from '../lib/supabase/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const logout = async () => {
    await authSignOut();
    setUser(null);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const currentUser = await getCurrentUser();
      if (mounted) {
        setUser(currentUser);
        setLoading(false);
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          let role: AuthUser['role'] = 'candidate';

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();

            if ((profile as any)?.role) {
              role = (profile as any).role as AuthUser['role'];
            } else {
              role = (session.user.user_metadata?.role as AuthUser['role']) || 'candidate';
            }
          } catch (err) {
            console.error('Error fetching profile for role:', err);
            role = (session.user.user_metadata?.role as AuthUser['role']) || 'candidate';
          }

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role,
            fullName: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone || session.user.phone || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
