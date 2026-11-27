import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function MobileHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isCatalog = pathname === '/dashboard';
  const isLoans = pathname === '/perfil';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Identidad y datos del alumno */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>UTR</Text>
            </View>
            <View>
              <Text style={styles.appName}>Deportes Campus</Text>
              <Text style={styles.userInfo}>
                {user?.nombre || 'Estudiante'} · Mat. {user?.matricula || 'S/M'}
              </Text>
            </View>
          </View>

          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Salir</Text>
          </Pressable>
        </View>

        {/* Navegación rápida B1 / B3 */}
        <View style={styles.navTabs}>
          <Pressable
            style={[styles.navTab, isCatalog && styles.navTabActive]}
            onPress={() => !isCatalog && router.replace('/dashboard')}
          >
            <Text style={[styles.navTabText, isCatalog && styles.navTabTextActive]}>
              Catálogo (B1)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navTab, isLoans && styles.navTabActive]}
            onPress={() => !isLoans && router.replace('/perfil')}
          >
            <Text style={[styles.navTabText, isLoans && styles.navTabTextActive]}>
              Mis Préstamos (B3)
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoBadge: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  userInfo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  logoutBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  logoutText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
  },
  navTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  navTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  navTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  navTabTextActive: {
    color: '#E11D48',
    fontWeight: '800',
  },
});