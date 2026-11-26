import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';

function RootLayoutNav() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inPublicScreen = segments.length === 0 || segments[0] === 'register';

    if (!isAuthenticated && !inPublicScreen) {
      router.replace('/');
    } else if (isAuthenticated && inPublicScreen) {
      router.replace(isAdmin ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}