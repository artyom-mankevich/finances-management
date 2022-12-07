import {useEffect, useState} from "react";
import {View, Alert} from "react-native";
import AddWalletBtn from "./AddWalletBtn";
import Modal from "react-native-modal";
import WalletInputs from "./WalletInputs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function CreateWallet(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [currencyList, setCurrencyList] = useState([]);
    const [currency, setCurrency] = useState('');
    const [balance, setBalance] = useState('');
    const [goal, setGoal] = useState('');
    const [colorList, setColorList] = useState([]);
    const [color, setColor] = useState("#7A3EF8");
    const [lastUpdated, setLastUpdated] = useState();

    const getCurrencyList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch('http://192.168.100.3:8087/v2/currencies',{
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
            .then((responseJson) => {
                console.log(responseJson);
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
        getCurrencyList().then(r => console.log());
    }, []);

    const onCancel = () => {
        setModalVisible(false);
        setName('');
        setCurrency('');
        setBalance('');
        setGoal('');
    }

    const onSubmit = async () => {
        setAsyncWallet().then(r => console.log());
        setModalVisible(false);
        setName('');
        setCurrency('');
        setBalance('');
        setGoal('');
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
            />
            </Modal>
            <AddWalletBtn onPress={() => {
                setModalVisible(true);
                setColor(colorList[~~(Math.random() * colorList.length)]);
            }}/>
        </View>
    );
}
