import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { registerUnauthorizedCallback } from '../services/apiClient.js';

const AuthContext = createContext(null);

const saveItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const leerItem = async (key) => {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return await SecureStore.getItemAsync(key);
};

const deleteItem = async (key) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  const logout = useCallback(async () => {
    await deleteItem('utr_token');
    await deleteItem('utr_user');
    setToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedCallback(logout);

    const restoreSession = async () => {
      try {
        const tokenGuardado = await leerItem('utr_token');
        const usuarioGuardado = await leerItem('utr_user');

        //Si el usuario y el token estan guardados actualiza el estado
        if (tokenGuardado && usuarioGuardado && usuarioGuardado !== 'undefined') {
          setToken(tokenGuardado);
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error('Error al restaurar sesión móvil:', error);
        await logout();
      } finally {
        setCargando(false);
      }
    };

    restoreSession();
  }, [logout]);

  //Crea el token y el usuario cuando este se loguea, convirtiendo los datos del usuario en una cadena
  //de texto para evitar modificaciones o alteraciones
  const login = async (newToken, userData) => {
    await saveItem('utr_token', newToken);
    await saveItem('utr_user', JSON.stringify(userData));
    setToken(newToken);
    setUsuario(userData);
  };

  const estaAutenticado = Boolean(token && usuario);
  const esAdmin = usuario?.rol === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{ usuario, token, cargando, estaAutenticado, esAdmin, login, logout }}
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