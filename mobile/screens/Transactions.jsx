import * as React from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from "react-native";
import CategoryList from "../components/transactions/categories/CategoryList";
import {useCallback, useState} from "react";
import CreateTransaction from "../components/transactions/transaction/CreateTransaction";

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export default function TransactionsPage() {
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
                    <CategoryList refreshing={refreshing}/>
                </View>
            </ScrollView>
        </RefreshControl>
            <CreateTransaction refreshing={refreshing}/>
        </View>
    );
}