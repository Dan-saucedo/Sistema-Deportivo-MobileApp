import { View, Text, StyleSheet } from 'react-native';

const CatalogScreen = ()=> {
    return(
        <View style={styles.container}>
            <Text> Hola mundo desde Catalog screen </Text>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default CatalogScreen();