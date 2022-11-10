import { React } from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    Linking,
    Text,
    ImageBackground,

} from 'react-native';
import DrawerItemList from "../components/DrawerItemList";
import { DrawerContentScrollView /*DrawerItemList*/, DrawerItem } from '@react-navigation/drawer';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const CustomSidebarMenu = (props) => {
    return (
        <SafeAreaView style={{ flex: 1 }}
                      pressColor={"#d0d0d0"}>
            {/*<View style={{ marginTop: 40, }}>
                <Image
                    source={logo}
                    style={styles.sideMenuProfileIcon}
                />
            </View>*/}
            <DrawerContentScrollView {...props}>
                <ImageBackground
                    style={styles.customHeader}
                    source={require('../assets/background.png')}>
                    <Image
                        source={require('../assets/c71.png')}
                        style={styles.sideMenuProfileIcon} />
                    <Text style={styles.textHeader}>User</Text>
                </ImageBackground>
                <View style={{backgroundColor: 'transparent'}}>
                    <DrawerItemList {...props}/>
                </View>

            </DrawerContentScrollView>
            <DrawerItem
                icon={({ focused, color, size }) =>
                    <MaterialCommunityIcons name="web" size={size} color={focused ? '#fff' : '#363636FF'}/>
                }
                pressColor={"#f6f8ff"}
                label={() => <Text style={{fontSize: 18, color: '#363636FF'}}>Website</Text>}
                onPress={() => Linking.openURL('https://github.com/artyom-mankevich/trpo')}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sideMenuProfileIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    textFooter: {
        textAlign: 'center',
    },
    textHeader: {
        textAlignVertical: 'center',
        justifyContent: 'center',
        marginLeft: 15,
        fontSize: 24,
    },
    customHeader: {
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
    },
    customItem: {
        labelFontSize: 28,
    },
    label: {
        fontSize: 28,
    }
});

export default CustomSidebarMenu;