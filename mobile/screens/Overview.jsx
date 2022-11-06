import * as React from 'react';
import { View, Text } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

export default function OverviewPage() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name='ios-home' size={30} color='#3e68d1' />
            <Text style={{fontSize:16,fontWeight:'700'}}>Overview</Text>
        </View>
    );
}