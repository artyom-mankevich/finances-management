import * as React from 'react';
import {View, Text, RefreshControl, ScrollView} from "react-native";
import {useCallback, useState} from "react";
import AnalyticsList from "../components/analytics/AnalyticsList";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function AnalyticsPage() {
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
                        <AnalyticsList refreshing={refreshing}/>
                    </View>
                </ScrollView>
            </RefreshControl>
        </View>
    );
}