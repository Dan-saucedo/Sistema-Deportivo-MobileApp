import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://proyecto-idgs9-v1.onrender.com';
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN || '';

let onUnauthorizedCallback = null;

export const registerUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

// Helper compatible con iOS/Android (SecureStore) y fallback seguro
export const getStoredToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('utr_token');
  return await SecureStore.getItemAsync('utr_token');
};

export const apiFetch = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {} } = options;

  const tokenDeUsuario = await getStoredToken();

  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...(tokenDeUsuario ? { Authorization: `Bearer ${tokenDeUsuario}` } : {}),
    ...headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json().catch(() => ({}));

    // 401 Unauthorized: Cierra la sesión si no estamos en el formulario de login
    if (response.status === 401) {
      if (!endpoint.includes('/auth/login') && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw {
        status: 401,
        message: data.message || 'Credenciales inválidas o sesión expirada.',
      };
    }

    // 403 Forbidden: alerta nativa de permisos insuficientes
    if (response.status === 403) {
      const errorMsg = data.message || 'Acceso restringido: No tienes permisos para esta acción.';
      Alert.alert('Acceso restringido', errorMsg);
      throw { status: 403, message: errorMsg };
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || `Error HTTP ${response.status} al procesar la solicitud.`,
      };
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    throw {
      status: 500,
      message: 'Error de conexión con el servidor. Verifica tu internet.',
    };
  }
};