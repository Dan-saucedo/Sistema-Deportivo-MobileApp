import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://proyecto-idgs9-v1.onrender.com';
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN || '';

let onUnauthorizedCallback = null;

export const registerUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

export const getStoredToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('utr_token');
  return await SecureStore.getItemAsync('utr_token');
};

export const apiFetch = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {}, timeoutMs = 35000 } = options;

  const userToken = await getStoredToken();

  const requestHeaders = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
    ...headers,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    clearTimeout(timer);
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      if (!endpoint.includes('/auth/login') && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw {
        status: 401,
        message: data.message || 'Credenciales inválidas o sesión expirada.',
      };
    }

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
    clearTimeout(timer);
    if (error.name === 'AbortError') {
      throw {
        status: 408,
        message: 'El servidor tardó demasiado en despertar. Presiona Iniciar sesión nuevamente.',
      };
    }
    if (error.status) throw error;
    throw {
      status: 500,
      message: 'Error de conexión con el servidor. Verifica tu internet.',
    };
  }
};