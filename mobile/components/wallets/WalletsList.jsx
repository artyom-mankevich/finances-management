import {ScrollView, View, StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";
import ngrokConfig from "../ngrok.config";
import WalletUpdateInputs from "./WalletUpdateInputs";

export default function WalletsList() {
    const [wallets, setWallets] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const getWalletsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/wallets/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }

        })
            .then((response) => response.json())
            .then((responseJson) => {
                setWallets(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    useEffect(() => {
        const refreshTimer = setTimeout(() => {
            const newRefresh = refresh + 1;
            setRefresh(newRefresh);
        }, 1500);
        getWalletsList().then();
        return () => clearTimeout(refreshTimer);
    },[refresh]);

    return (
        <View style={styles.container}>
            <ScrollView>
                <View>
                    {
                        wallets.map((item) => {
                            return (
                                <View>
                                    <WalletUpdateInputs
                                        walletId={item.id}
                                        name={item.name}
                                        currency={item.currency}
                                        balance={item.balance}
                                        goal={item.goal}
                                        color={item.color}
                                        lastUpdated={new Date(item.lastUpdated).toLocaleString()}
                                        key={item.name}
                                    />
                                </View>
                            )
                        })
                    }
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});