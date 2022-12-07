import {ScrollView, View, StyleSheet} from "react-native";
import Wallet from "./Wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";
import ngrokConfig from "../ngrok.config";

export default function WalletsList() {
    const [wallets, setWallets] = useState([]);

    const getWalletsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/wallets/',{
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': 'no-cors',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("responseJsonWallets: ", responseJson);
                setWallets(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };


    useEffect(() => {
        getWalletsList().then(r => console.log(wallets));
    }, []);

    console.log("wallets", wallets);

    const onPressUpdate = () => {
        console.log("onPressUpdate");
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View>
                    {
                        wallets.map((item) => {
                            return (
                                <View>
                                    <Wallet
                                        name={item.name}
                                        currency={item.currency}
                                        balance={item.balance}
                                        goal={item.goal}
                                        color={item.color}
                                        lastUpdated={new Date(item.lastUpdated).toLocaleString()}
                                        key={item.name}
                                        onPressUpdate={() => onPressUpdate()}
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