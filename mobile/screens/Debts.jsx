import * as React from 'react';
import { View, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function DebtsPage() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesome name="shopping-bag" size={30} color='#3e68d1'/>
            <Text style={{fontSize:16,fontWeight:'700'}}>Debts</Text>
        </View>
    );
}