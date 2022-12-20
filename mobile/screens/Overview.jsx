import * as React from 'react';
import {View, Text, ScrollView, RefreshControl} from "react-native";
import {useCallback, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OverviewComponent from "../components/overview/OverviewComponent";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function OverviewPage() {
    const [isLogged, setIsLogged] = useState({value: 'onLogout'});
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getAsyncAccessName().then();
        wait(100).then(() => setRefreshing(false));
    }, []);

    const getAsyncAccessName = async () => {
        const onLogin = await AsyncStorage.getItem('onLogin');
        setIsLogged({value: onLogin});
    }

    refreshing ? getAsyncAccessName().then() : null;

    return (
        <View>
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
                <ScrollView>
                    <View>
                        {
                            isLogged.value === 'onLogin' ? (
                                <View>
                                    <OverviewComponent refreshing={refreshing}/>
                                </View>
                            ) : (
                                <View style={{marginTop: 350, alignItems: 'center', justifyContent: 'center'}}>
                                    <MaterialCommunityIcons name='login' size={30} color='#3e68d1'/>
                                    <Text style={{fontSize: 16, fontWeight: '700'}}>Please Log In</Text>
                                </View>
                            )
                        }
                    </View>
                </ScrollView>
            </RefreshControl>
        </View>
    );
}