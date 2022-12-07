import * as React from 'react';
import {View, StyleSheet, ScrollView} from "react-native";
import CreateWallet from "../components/wallets/CreateWallet";
import WalletsList from "../components/wallets/WalletsList";
export default function WalletPage() {

    return (
            <ScrollView>
                <View style={styles.container }>
                    <WalletsList />
                    <CreateWallet/>
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