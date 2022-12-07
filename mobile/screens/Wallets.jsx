import * as React from 'react';
import { View, Text } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function WalletPage() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="wallet" size={30} color='#3e68d1' />
            <Text style={{fontSize:16,fontWeight:'700'}}>Wallet</Text>
        </View>
    );
}