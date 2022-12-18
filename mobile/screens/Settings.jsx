import * as React from 'react';
import {View, RefreshControl, ScrollView} from "react-native";
import {useCallback, useState} from "react";
import Setting from "../components/settings/Setting";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function SettingsPage() {
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
                        <Setting refreshing={refreshing}/>
                    </View>
                </ScrollView>
            </RefreshControl>
        </View>
    );
}