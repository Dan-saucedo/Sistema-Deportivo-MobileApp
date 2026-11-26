import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function TempScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8FAFC' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>
        Sesión activa ({user?.rol})
      </Text>
      <Text style={{ color: '#475569', marginBottom: 24 }}>
        {user?.nombre} · Matrícula: {user?.matricula}
      </Text>
      <Pressable
        onPress={logout}
        style={{ backgroundColor: '#E11D48', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}