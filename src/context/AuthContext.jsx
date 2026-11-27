import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { registerUnauthorizedCallback } from '../services/apiClient';

const AuthContext = createContext(null);

// Evita que SecureStore congele la app si el Keychain de iOS no responde
const withTimeout = (promise, ms = 2000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('SecureStore timeout')), ms)),
  ]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const memoryFallback = useRef({});

  const saveItem = async (key, value) => {
    memoryFallback.current[key] = value;
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await withTimeout(SecureStore.setItemAsync(key, value));
    } catch (e) {
      console.warn(`[Auth] Guardado en memoria por fallo/timeout en storage (${key}):`, e.message);
    }
  };

  const readItem = async (key) => {
    try {
      if (Platform.OS === 'web') return localStorage.getItem(key);
      const val = await withTimeout(SecureStore.getItemAsync(key));
      return val ?? memoryFallback.current[key] ?? null;
    } catch {
      return memoryFallback.current[key] ?? null;
    }
  };

  const deleteItem = async (key) => {
    delete memoryFallback.current[key];
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await withTimeout(SecureStore.deleteItemAsync(key));
    } catch {
      // Ignorar si ya estaba limpio
    }
  };

  const logout = useCallback(async () => {
    await deleteItem('utr_token');
    await deleteItem('utr_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedCallback(logout);

    const restoreSession = async () => {
      try {
        const savedToken = await readItem('utr_token');
        const savedUser = await readItem('utr_user');

        if (savedToken && savedUser && savedUser !== 'undefined') {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error al restaurar sesión móvil:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  const login = async (newToken, userData) => {
    console.log('[Auth] Guardando sesión para rol:', userData?.rol);
    await saveItem('utr_token', newToken);
    await saveItem('utr_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    console.log('[Auth] Estado de sesión actualizado correctamente');
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, isAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};