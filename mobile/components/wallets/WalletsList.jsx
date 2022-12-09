import {ScrollView, View, StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";
import ngrokConfig from "../ngrok.config";
import WalletUpdateInputs from "./WalletUpdateInputs";
import CreateWallet from "./CreateWallet";

export default function WalletsList() {
    const [wallets, setWallets] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [colorList, setColorList] = useState([]);

    const getCurrencyList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/currencies',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let currencyLists = [];
                for (let i = 0; i < responseJson.length; i++) {
                    currencyLists.push({
                        code: responseJson[i].code,
                        name: responseJson[i].name,
                    });
                    setCurrencyList(currencyLists);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const getColorsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        Array.from(new Set(colorList));
        return fetch(ngrokConfig.myUrl + '/v2/colors',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let colorsList = [];
                for (let i = 0; i < responseJson.length; i++) {
                    colorsList.push(responseJson[i].hexCode);
                    setColorList(colorsList);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

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

    const deleteWallet = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const walletId = await AsyncStorage.getItem('walletId');
        return fetch(ngrokConfig.myUrl + '/v2/wallets/' + walletId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            getWalletsList();
        })
            .catch((error) => {
                console.error(error);
            })};

    useEffect(() => {
        getCurrencyList().then();
        getColorsList().then();
        getWalletsList().then();
    },[]);


    return (
        <View style={styles.container}>
            <ScrollView>
                <View>
                    <CreateWallet
                        currencyList={currencyList}
                        colorList={colorList}
                        onWalletList={() => getWalletsList().then()}
                    />
                    {
                        wallets.sort((a, b) => a.name > b.name ? 1 : -1).map((item) => {
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
                                        currencyList={currencyList}
                                        colorsList={colorList}
                                        key={item.name}
                                        onDeleted={() => deleteWallet().then()}
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
        paddingBottom: 10
    }
});