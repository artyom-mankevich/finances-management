import * as React from 'react';
import { View, Text } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function CryptoPage() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="ethereum" size={30} color='#3e68d1' />
            <Text style={{fontSize:16,fontWeight:'700'}}>Crypto</Text>
        </View>
    );
}