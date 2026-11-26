import { useRouter } from 'expo-router';
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

export default function RegisterScreen() {
  const router = useRouter();
  const [formDatos, setFormDatos] = useState({
    nombre: '',
    matricula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (name, value) => {
    setFormDatos((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };
  //Si al menos un campo esta vacio el usuario no puede accesar
  const handleSubmit = async () => {
    if (
      !formDatos.nombre.trim() ||
      !formDatos.matricula.trim() ||
      !formDatos.email.trim() ||
      !formDatos.password.trim() ||
      !formDatos.confirmPassword.trim()
    ) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }
    
    if (formDatos.password !== formDatos.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    setErrorMsg('');

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: {
          nombre: formDatos.nombre.trim(),
          matricula: formDatos.matricula.trim(),
          email: formDatos.email.trim(),
          password: formDatos.password,
          rol: 'USER',
        },
      });

      router.replace({
        pathname: '/',
        params: {registeredMessage: 'Cuenta creada exitosamente. Ahora inicia sesión.'},
      });
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo completar el registro. Intenta más tarde');
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
        <View style={styles.topBar}>
          <Text style={styles.logoAcronym}>UTR</Text>
          <Text style={styles.topBarLabel}>REGISTRO DE COMUNIDAD</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.eyebrow}>SÉ PARTE DEL EQUIPO</Text>
          <Text style={styles.title}>Crea tu cuenta.</Text>
          <Text style={styles.subtitle}>Regístrate con tus datos de estudiante UTR.</Text>

          {errorMsg ? (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre y apellidos"
            placeholderTextColor="#94A3B8"
            value={formDatos.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
            editable={!cargando}
          />

          <Text style={styles.label}>Matrícula</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 2558"
            placeholderTextColor="#94A3B8"
            value={formDatos.matricula}
            onChangeText={(text) => handleChange('matricula', text)}
            editable={!cargando}
          />

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
            placeholder="Crea una contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={formDatos.password}
            onChangeText={(text) => handleChange('password', text)}
            editable={!cargando}
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={formDatos.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
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
              <Text style={styles.submitBtnText}>Crear cuenta →</Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={() => router.replace('/')}>
              <Text style={styles.switchLink}>Inicia sesión</Text>
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
  topBar: {
    backgroundColor: '#E11D48',
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoAcronym: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  topBarLabel: { color: '#FFE4E6', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  formCard: { padding: 24 },
  eyebrow: { color: '#E11D48', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  title: { color: '#0F172A', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#64748B', fontSize: 14, marginBottom: 18 },
  label: { color: '#1E293B', fontSize: 13, fontWeight: '600', marginBottom: 5 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 12,
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
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18, marginBottom: 24 },
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
});