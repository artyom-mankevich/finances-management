import React from 'react';
import { SafeAreaView, View, StyleSheet, Image, Linking } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import logo from '../assets/bebra_logo.png';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const CustomSidebarMenu = (props) => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ marginTop: 40, }}>
                <Image
                    source={logo}
                    style={styles.sideMenuProfileIcon}
                />
            </View>
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props}  />
                <DrawerItem
                    icon={({ focused, color, size }) =>
                        <MaterialCommunityIcons name="web" color={color} size={size} color={focused ? '#3e68d1' : '#ccc'}/>
                }
                    label="Bebra Website"
                    onPress={() => Linking.openURL('https://github.com/artyom-mankevich/trpo')}
                />
                <View style={styles.customItem}>
                </View>
            </DrawerContentScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sideMenuProfileIcon: {
        width: '100%',
        height: 60,
    },
    customItem: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default CustomSidebarMenu;