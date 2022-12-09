import {TouchableOpacity, View, StyleSheet, Alert} from "react-native";
import WalletToUpdate from "./WalletToUpdate";
import {Feather, FontAwesome} from "@expo/vector-icons";
import {useState} from "react";
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
        }).then((response) => {
            response.json();
            props.onWalletList();
            setModalVisible(false);
        })
            .catch((error) => {
                console.error(error);
            })}

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
                    createElement={false}
                    onDeleted={() => props.onDeleted()}
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
                        for(let i = 0; i < props.colorsList.length; i++) {
                            colorList.push(props.colorsList[i]);
                        }
                        setCurrencyList(props.currencyList);
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
        top: 175,
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