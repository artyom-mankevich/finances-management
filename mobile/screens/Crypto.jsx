import * as React from 'react';
import {View, ScrollView, RefreshControl} from "react-native";
import {useCallback, useState} from "react";
import CryptoWalletList from "../components/crypto/CryptoWalletList";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function CryptoPage() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        wait(100).then(() => setRefreshing(false));
    }, []);
    return (
        <View>
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
                <ScrollView>
                    <View>
                        <CryptoWalletList refreshing={refreshing}/>
                    </View>
                </ScrollView>
            </RefreshControl>
        </View>
    );
}