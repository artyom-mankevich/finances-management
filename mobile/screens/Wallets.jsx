import * as React from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from "react-native";
import WalletsList from "../components/wallets/WalletsList";
import {useCallback, useState} from "react";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function WalletPage() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        wait(100).then(() => setRefreshing(false));
    }, []);

    return (
            <ScrollView>
                <View style={styles.container }>
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
                        <WalletsList refreshing={refreshing}/>
                    </RefreshControl>
                </View>
            </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});