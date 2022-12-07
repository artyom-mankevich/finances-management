import {TouchableOpacity, View, StyleSheet, Alert} from "react-native";
import WalletToUpdate from "./WalletToUpdate";
import {Feather, FontAwesome} from "@expo/vector-icons";
import {useEffect, useState} from "react";
import Modal from "react-native-modal";
import WalletInputs from "./WalletInputs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function WalletUpdateInputs(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [colorList, setColorList] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [walletId, setWalletId] = useState(props.walletId);
    const [name, setName] = useState(props.name);
    const [currency, setCurrency] = useState(props.currency);
    const [balance, setBalance] = useState(props.balance);
    const [goal, setGoal] = useState(props.goal);
    const [color, setColor] = useState(props.color);
    const [lastUpdated, setLastUpdated] = useState(props.lastUpdated);

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

    const setUpdateWallet = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/wallets/' + walletId + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'currency': currency,
                'balance': balance,
                'name': name,
                'color': color,
                'goal': goal,
            })

        }).then((response) => response.json())
            .then(() => {
                setModalVisible(false);
                Alert.alert(
                    "Success",
                    "Wallet updated successfully",
                    [
                        { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                );
            }).catch((error) => {
                console.error(error);
            })}

    useEffect(() => {
        getColorsList().then();
        getCurrencyList().then();
    }, [walletId]);

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
                    colorList={Array.from(new Set(colorList))}
                    onBtnText={"Update"}
                    onCancel={() => {
                        setModalVisible(false);
                    }}
                    onSubmit={() => {
                        setUpdateWallet().then();
                    }
                    }
                />
            </Modal>
            <WalletToUpdate
                name={props.name}
                currency={props.currency}
                balance={props.balance}
                goal={props.goal}
                lastUpdated={props.lastUpdated}
                color={props.color}
            />
            <View style={styles.walletUpdateBtn}>
                <TouchableOpacity
                    style={styles.walletUpdateBtnTouchableOpacity}
                    onPress={() =>{
                        setModalVisible(true);
                        AsyncStorage.setItem('walletId', props.walletId).then();
                    }}
                    key={props.name}
                >
                    <View>
                        <Feather name="circle" size={60} color="#fff" />
                    </View>
                    <View style={styles.walletUpdateGear}>
                        <FontAwesome name="gear" size={37} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    walletUpdateBtn: {
        position: 'absolute',
        right: 0,
        marginLeft: 'auto',
        bottom: 0,
    },
    walletUpdateBtnTouchableOpacity: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletUpdateGear: {
        bottom: 50,
    }
})