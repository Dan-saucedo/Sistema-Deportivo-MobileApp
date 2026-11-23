import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CatalogScreen from '../screens/CatalogScreen.jsx';
import LoginScreen from '../screens/LoginScreen.jsx';
import DetailScreen from '../screens/DetailScreen.jsx';
import ProfileScreen from '../screens/ProfileScreen.jsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CatalogStack = () => {
    return(
        //Routes
        <Stack.Navigator>
            <Stack.Screen
                name="CatalogList"
                component={CatalogScreen}
                options={{title: 'Catalogo de Materias'}}
            />
            <Stack.Screen
                name="CatalogDetail"
                component={DetailScreen}
                options={{title: 'Detalle de la asignatura'}}
            />
        </Stack.Navigator>
    )
}

const MainTab = ({onLogout}) => {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Inicio"
                component={CatalogStack}
            />
            <Tab.Screen
                name="Perfil"
                component={(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            />
        </Tab.Navigator>
    )
}

const AppNavigation = () => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />
            <Stack.Screen
                name="Main"
                component={MainTab}
            />
        </Stack.Navigator>
    )
}

export default AppNavigation;