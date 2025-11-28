import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { IUserPublic, IUserCreate, IUserLogin, IUserUpdate } from '@/types';
import { container } from '@/config';

interface AuthContextType {
  user: IUserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: IUserLogin) => Promise<void>;
  register: (data: IUserCreate) => Promise<void>;
  updateProfile: (data: IUserUpdate) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Wait for container to be ready
        if (!container.isInitialized) {
          await container.initialize();
        }

        // Check for existing session
        const currentUser = container.authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: IUserLogin) => {
    const loggedUser = await container.authService.login(credentials);
    setUser(loggedUser);
  }, []);

  const register = useCallback(async (data: IUserCreate) => {
    const newUser = await container.authService.register(data);
    setUser(newUser);
  }, []);

  const updateProfile = useCallback(async (data: IUserUpdate) => {
    if (!user) throw new Error('No hay usuario autenticado');
    const updatedUser = await container.authService.updateProfile(user.id, data);
    setUser(updatedUser);
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const refreshedUser = await container.authService.getUserById(user.id);
    if (refreshedUser) {
      setUser(refreshedUser);
    }
  }, [user]);

  const logout = useCallback(() => {
    container.authService.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      updateProfile,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, updateProfile, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
