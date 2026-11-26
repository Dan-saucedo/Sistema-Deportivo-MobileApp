import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { apiFetch } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const successMsg = params?.registeredMessage || '';
  const { login } = useAuth(); 

  const [formDatos, setFormDatos] = useState({ email: '', password: '' });
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (name, value) => {
    setFormDatos((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('Ups, algo salio mal, prueba mas tarde :(');
  };

  const handleSubmit = async () => {
    //Llenado de campos obligatoria
    if (!formDatos.email.trim() || !formDatos.password.trim()) {
      setErrorMsg('Por favor completa tu correo electrónico y contraseña.');
      return;
    }

    setCargando(true);
    setErrorMsg('');

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: formDatos.email.trim(),
          password: formDatos.password,
        },
      });

      const normalizedUser = {
        ...response.user,
        rol: response.user?.rol || response.user?.role || 'USER',
      };

      await login(response.token, normalizedUser);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo iniciar sesión. Verifica tus credenciales.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Cabecera Institucional UTR */}
        <View style={styles.headerBanner}>
          <View style={styles.logoRow}>
            <Text style={styles.logoAcronym}>UTR</Text>
            <Text style={styles.logoSub}>UNIVERSIDAD TECNOLÓGICA{'\n'}EL RETOÑO</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DEPORTES · COMUNIDAD UTR</Text>
          </View>
          <Text style={styles.heroTitle}>Tu siguiente jugada empieza aquí.</Text>
          <View style={styles.limePill}>
            <Text style={styles.limePillText}>Menos espera. Más juego.</Text>
          </View>
        </View>

        {/* Tarjeta de Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.eyebrow}>BIENVENIDO DE NUEVO</Text>
          <Text style={styles.title}>Entra al juego.</Text>
          <Text style={styles.subtitle}>Tu material deportivo, a unos clics.</Text>

          {successMsg ? (
            <View style={styles.alertSuccess}>
              <Text style={styles.alertSuccessText}>{successMsg}</Text>
            </View>
          ) : null}

          {errorMsg ? (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="nombre@utr.edu.mx"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formDatos.email}
            onChangeText={(text) => handleChange('email', text)}
            editable={!cargando}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="**********"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={formDatos.password}
            onChangeText={(text) => handleChange('password', text)}
            editable={!cargando}
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              (cargando || pressed) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Iniciar sesión →</Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>¿Aún no tienes cuenta? </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.switchLink}>Regístrate</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flexGrow: 1 },
  headerBanner: {
    backgroundColor: '#E11D48',
    paddingTop: 54,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  logoAcronym: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  logoSub: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', lineHeight: 13 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#9F1239',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', lineHeight: 33, marginBottom: 14 },
  limePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#D9F99D',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  limePillText: { color: '#18181B', fontSize: 12, fontWeight: '700' },
  formCard: { padding: 24 },
  eyebrow: { color: '#E11D48', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  title: { color: '#0F172A', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 20 },
  label: { color: '#1E293B', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  switchText: { color: '#64748B', fontSize: 14 },
  switchLink: { color: '#E11D48', fontSize: 14, fontWeight: '700' },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  alertErrorText: { color: '#B91C1C', fontSize: 13 },
  alertSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  alertSuccessText: { color: '#15803D', fontSize: 13 },
});