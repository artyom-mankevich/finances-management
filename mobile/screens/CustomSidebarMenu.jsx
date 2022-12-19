import { useState } from 'react';
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
import * as React from "react";
import {fetchUserInfoAsync} from "expo-auth-session";
import AsyncStorage from '@react-native-async-storage/async-storage';

const useProxy = Platform.select({ web: false, default: true });

const discovery = {
    authorizationEndpoint: `${config.domain}/authorize`,
    tokenEndpoint: `${config.domain}/token`,
    userInfoEndpoint: `${config.domain}/userinfo`,
}

const CustomSidebarMenu = (props) => {
    const [name, setName] = useState(null);
    const [avatar, setAvatar] = useState(null);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            redirectUri: AuthSession.makeRedirectUri({
                useProxy,
            }),
            extraParams: {
                auth_type: "rerequest",
                audience: config.audience,
                nonce: "nonce",
            },
            clientId: config.clientId,
            responseType: AuthSession.ResponseType.Token,
            scopes: ['openid', 'profile', 'email', 'offline_access'],
        },
        discovery
    );

    const onLogin = async () => {
        const result = await promptAsync({
            useProxy
        });

        if (result.type !== "success") {
            Alert.alert("Error", "Authentication failed");
            return;
        }
        const accessToken = result.params.access_token;
        await AsyncStorage.setItem('accessToken', accessToken);

        const userInfo = await fetchUserInfoAsync(
            {
                accessToken,
                domain: config.domain,
                clientId: config.clientId,
            },
            discovery
        )
        setName(userInfo.name);
        setAvatar(userInfo.picture);
    }

    const onLogout = () => {
        setName(null);
        setAvatar(null);
    }

    return (
        <SafeAreaView style={{ flex: 1 }}
                      pressColor={"#d0d0d0"}>
            <DrawerContentScrollView {...props}>
                <ImageBackground
                    style={styles.customHeader}
                    source={require('../assets/background.png')}>
                    <Image
                        source={avatar ? {uri: avatar} : require('../assets/c71.png')}
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
                    label={() => <Text style={{fontSize: 16, color: '#363636FF'}}>Logout</Text>}
                    onPress={onLogout}
                />
            }
            {!name &&
                <DrawerItem
                    icon={({focused, color, size}) =>
                        <MaterialCommunityIcons name="login" size={size} color={focused ? '#fff' : '#363636FF'}/>
                    }
                    pressColor={"#f6f8ff"}
                    label={() => <Text style={{fontSize: 16, color: '#363636FF'}}>Login</Text>}
                    onPress={onLogin}
                />
            }
            <DrawerItem
                icon={({ focused, color, size }) =>
                    <MaterialCommunityIcons name="web" size={size} color={focused ? '#fff' : '#363636FF'}/>
                }
                pressColor={"#f6f8ff"}
                label={() => <Text style={{fontSize: 16, color: '#363636FF'}}>Website</Text>}
                onPress={() => Linking.openURL('https://github.com/artyom-mankevich/trpo')}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sideMenuProfileIcon: {
        width: 80,
        height: 80,
        borderRadius: 50,
        marginBottom: 10,
    },
    textFooter: {
        textAlign: 'center',
    },
    textHeader: {
        textAlignVertical: 'center',
        justifyContent: 'center',
        marginLeft: 20,
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