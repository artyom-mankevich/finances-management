import {useEffect, useState} from "react";
import {View, Alert, StyleSheet, TouchableOpacity} from "react-native";
import Modal from "react-native-modal";
import WalletInputs from "./WalletInputs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {FontAwesome5} from "@expo/vector-icons";

export default function CreateWallet() {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [currencyList, setCurrencyList] = useState([]);
    const [currency, setCurrency] = useState('USD');
    const [balance, setBalance] = useState(0);
    const [goal, setGoal] = useState('');
    const [colorList, setColorList] = useState([]);
    const [color, setColor] = useState("#7A3EF8");
    const [lastUpdated, setLastUpdated] = useState(new Date().getTime());

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
                for (let i = 0; i < responseJson.length; i++) {
                    colorList.push(responseJson[i].hexCode);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const setAsyncWallet = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/wallets/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'currency': currency.toString(),
                'balance': parseFloat(balance),
                'name': name.toString(),
                'color': color.toString(),
                'goal': parseFloat(goal),
            })

        }).then((response) => response.json())
            .then(() => {
                Alert.alert(
                    "Success",
                    "Wallet created successfully",
                    [
                        { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                );
            }).catch((error) => {
                console.error(error);
            })}

    useEffect(() => {
        getColorsList().then(r => {
            setColor(colorList[~~(Math.random() * colorList.length)]);
        });
        getCurrencyList().then();
    }, []);

    const onCancel = () => {
        setModalVisible(false);
        setName('');
        setCurrency('USD');
        setBalance(0);
        setGoal('');
        setLastUpdated(new Date().getTime())
    }

    const onSubmit = async () => {
        setAsyncWallet().then();
        setModalVisible(false);
        setName('');
        setCurrency('USD');
        setBalance(0);
        setGoal('');
        setLastUpdated(new Date().getTime())
    }

    return (
        <View>
            <Modal
                isVisible={modalVisible}
                backdropColor={'#000000'}
                backdropOpacity={0.8}
                animationIn={"zoomInDown"}
                animationOut={"zoomOutUp"}
                animationInTiming={600}
                animationOutTiming={600}
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
            >
            <WalletInputs
                name={name}
                setName={setName}
                currency={currency}
                setCurrency={setCurrency}
                currencyList={Array.from(new Set(currencyList))}
                balance={balance}
                setBalance={setBalance}
                goal={goal}
                setGoal={setGoal}
                color={color}
                setColor={setColor}
                lastUpdated={lastUpdated}
                setLastUpdated={setLastUpdated}
                colorList={Array.from(new Set(colorList))}
                onCancel={onCancel}
                onSubmit={onSubmit}
                onBtnText={"Create"}
            />
            </Modal>
            <View style={styles.addWalletView}>
                <TouchableOpacity
                    style={styles.addWalletBtn}
                    onPress={() => {
                        setModalVisible(true)
                        setColor(colorList[~~(Math.random() * colorList.length)]);
                    }}
                >
                    <FontAwesome5 name="plus" size={110} color='#fff' />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    addWalletView: {
        padding: 10,
    },
    addWalletBtn: {
        width: 350,
        height: 250,
        backgroundColor: '#3e68d1',
        borderRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    }
});