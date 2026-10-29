import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

export interface DemoUserOption {
  user: User;
  badge: string;
}

interface AuthContextType extends AuthState {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  demoUsers: DemoUserOption[];
  switchDemoUser: (index: number) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password?: string,
    role?: User['role'],
    organization?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: (presetRole?: string) => void;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_sarah_chen',
    name: 'Sarah Chen',
    email: 'sarah.chen@fraudshield.ai',
    role: 'Fraud Investigator',
    organization: 'FinGuard Cyber Security Lab',
    avatarSeed: 'sarah',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_alex_kumar',
    name: 'Alex Kumar',
    email: 'alex.kumar@fintech.io',
    role: 'Risk Analyst',
    organization: 'Apex Digital Bank',
    avatarSeed: 'alex',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr_elena_rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@global-pay.com',
    role: 'Compliance Officer',
    organization: 'Global Payment Gateway Ltd',
    avatarSeed: 'elena',
    createdAt: '2026-02-15T11:00:00Z',
  },
];

const DEMO_USER_OPTIONS: DemoUserOption[] = [
  { user: DEFAULT_USERS[0], badge: 'Lead Investigator' },
  { user: DEFAULT_USERS[1], badge: 'Senior Risk Analyst' },
  { user: DEFAULT_USERS[2], badge: 'Compliance Officer' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const savedUser = localStorage.getItem('fraudshield_current_user');
      if (savedUser) {
        return {
          user: JSON.parse(savedUser),
          isAuthenticated: true,
          token: 'jwt_mock_fs_' + Math.random().toString(36).substring(7),
        };
      }
    } catch {
      // Ignore storage errors
    }
    // Default to initial demo user for frictionless instant testing
    return {
      user: DEFAULT_USERS[0],
      isAuthenticated: true,
      token: 'jwt_mock_fs_sarah',
    };
  });

  useEffect(() => {
    try {
      if (authState.user) {
        localStorage.setItem('fraudshield_current_user', JSON.stringify(authState.user));
      } else {
        localStorage.removeItem('fraudshield_current_user');
      }
    } catch {
      // Ignore
    }
  }, [authState.user]);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid corporate email address.' };
    }

    // Check existing stored users list
    let existingUsers: User[] = DEFAULT_USERS;
    try {
      const stored = localStorage.getItem('fraudshield_all_users');
      if (stored) {
        existingUsers = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }

    const matched = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      setAuthState({
        user: matched,
        isAuthenticated: true,
        token: 'jwt_mock_fs_' + Math.random().toString(36).substring(7),
      });
      setShowAuthModal(false);
      return { success: true };
    }

    // Create user dynamically if registering on the fly
    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart
      .split(/[._-]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: formattedName || 'Security Analyst',
      email: cleanEmail,
      role: 'Risk Analyst',
      organization: 'FinTech Intelligence Corp',
      avatarSeed: namePart,
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...existingUsers, newUser];
    try {
      localStorage.setItem('fraudshield_all_users', JSON.stringify(updatedList));
    } catch {
      // Ignore
    }

    setAuthState({
      user: newUser,
      isAuthenticated: true,
      token: 'jwt_mock_fs_' + Math.random().toString(36).substring(7),
    });
    setShowAuthModal(false);

    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    _password?: string,
    role: User['role'] = 'Risk Analyst',
    organization: string = 'FinTech Cyber Intelligence'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: 'Full name is required.' };
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'Valid email is required.' };

    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name.trim(),
      email: cleanEmail,
      role: role || 'Risk Analyst',
      organization: organization.trim() || 'FinTech Security',
      avatarSeed: name.toLowerCase().replace(/\s+/g, ''),
      createdAt: new Date().toISOString(),
    };

    try {
      let existingUsers: User[] = DEFAULT_USERS;
      const stored = localStorage.getItem('fraudshield_all_users');
      if (stored) existingUsers = JSON.parse(stored);
      localStorage.setItem('fraudshield_all_users', JSON.stringify([...existingUsers, newUser]));
    } catch {
      // Ignore
    }

    setAuthState({
      user: newUser,
      isAuthenticated: true,
      token: 'jwt_mock_fs_' + Math.random().toString(36).substring(7),
    });
    setShowAuthModal(false);

    return { success: true };
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      token: undefined,
    });
    try {
      localStorage.removeItem('fraudshield_current_user');
    } catch {
      // Ignore
    }
  };

  const quickDemoLogin = (preset: string = 'investigator') => {
    const userToSet = preset === 'investigator' ? DEFAULT_USERS[0] : DEFAULT_USERS[1];
    setAuthState({
      user: userToSet,
      isAuthenticated: true,
      token: 'jwt_mock_fs_' + userToSet.id,
    });
  };

  const switchDemoUser = (index: number) => {
    const selected = DEMO_USER_OPTIONS[index]?.user || DEFAULT_USERS[0];
    setAuthState({
      user: selected,
      isAuthenticated: true,
      token: 'jwt_mock_fs_' + selected.id,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        showAuthModal,
        setShowAuthModal,
        demoUsers: DEMO_USER_OPTIONS,
        switchDemoUser,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
