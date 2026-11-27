import { View, Text } from 'react-native';
import MobileHeader from '../components/MobileHeader';

export default function PerfilRoute() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <MobileHeader />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#475569' }}>
          Listo para implementar Mis Préstamos + QR (B3)
        </Text>
      </View>
    </View>
  );
}