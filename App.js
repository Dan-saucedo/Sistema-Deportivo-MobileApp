import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext.jsx';
import LoginScreen from './src/screens/LoginScreen.jsx';
import RegisterScreen from './src/screens/RegisterScreen.jsx';

const Stack = createNativeStackNavigator();

// Pantallas provisionales mientras construimos B1-B4
function TempHomeScreen({ roleLabel }) {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
        Sesión activa ({roleLabel})
      </Text>
      <Text style={{ color: '#475569', marginBottom: 20 }}>
        {user?.nombre} · Matrícula: {user?.matricula}
      </Text>
      <Pressable
        onPress={logout}
        style={{ backgroundColor: '#E11D48', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}
      >
        <Text style={{ color: '#FFF', fontWeight: '700' }}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

function RootNavigator() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : isAdmin ? (
        <Stack.Screen name="AdminHome">
          {() => <TempHomeScreen roleLabel="ADMIN" />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="StudentHome">
          {() => <TempHomeScreen roleLabel="USER" />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}