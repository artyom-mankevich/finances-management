import { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import {
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    Text,
    ImageBackground,
    Alert, Platform
} from 'react-native';
import CustomDrawerItemList from "../components/CustomDrawerItemList";
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import config from "../auth0.config";
import * as AuthSession from "expo-auth-session";
import jwtDecode from "jwt-decode";
import * as React from "react";


const auth0ClientId = config.clientId;
const authorizationEndpoint = `${config.domain}/authorize`;

const useProxy = Platform.select({ web: false, default: true });
const redirectUri = AuthSession.makeRedirectUri({ useProxy });


const CustomSidebarMenu = (props) => {
    const [name, setName] = useState(null);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            redirectUri,
            clientId: auth0ClientId,
            responseType: "id_token",
            scopes: ["openid", "profile", "email", "offline_access"],
            extraParams: {
                nonce: "nonce",
            },
        },
        { authorizationEndpoint }
    );

    console.log(`Redirect URL: ${redirectUri}`);

    useEffect(() => {
        if (response) {
            if (response.error) {
                Alert.alert(
                    "Authentication error",
                    response.params.error_description || "something went wrong"
                );
                return;
            }
            if (response.type === "success") {
                const jwtToken = response.params.id_token;
                const userInfo = jwtDecode(jwtToken);
                Alert.alert("Logged in!", `Hi ${userInfo.name}!`);
                const { name } = userInfo;
                setName(name);
            }
        }
    }, [response]);


    return (
        <SafeAreaView style={{ flex: 1 }}
                      pressColor={"#d0d0d0"}>
            <DrawerContentScrollView {...props}>
                <ImageBackground
                    style={styles.customHeader}
                    source={require('../assets/background.png')}>
                    <Image
                        source={require('../assets/c71.png')}
                        style={styles.sideMenuProfileIcon} />
                    <Text style={styles.textHeader}>
                        {name && <Text>{name}</Text>}
                        {!name && <Text>Not logged in</Text>}
                    </Text>
                </ImageBackground>
                {name &&
                    <View style={{backgroundColor: 'transparent'}}>
                        <CustomDrawerItemList {...props}/>
                    </View>
                }

            </DrawerContentScrollView>
            {name &&
                <DrawerItem
                    icon={({focused, color, size}) =>
                        <MaterialCommunityIcons name="logout" size={size} color={focused ? '#fff' : '#363636FF'}/>
                    }
                    pressColor={"#f6f8ff"}
                    label={() => <Text style={{fontSize: 18, color: '#363636FF'}}>Logout</Text>}
                    onPress={() => setName(null)}
                />
            }
            {!name &&
                <DrawerItem
                    icon={({focused, color, size}) =>
                        <MaterialCommunityIcons name="login" size={size} color={focused ? '#fff' : '#363636FF'}/>
                    }
                    pressColor={"#f6f8ff"}
                    label={() => <Text style={{fontSize: 18, color: '#363636FF'}}>Login</Text>}
                    onPress={async () => promptAsync({ useProxy })}
                />
            }
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