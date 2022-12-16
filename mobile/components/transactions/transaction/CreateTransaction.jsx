import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";
import {useEffect, useState} from "react";
import {View, StyleSheet, TouchableOpacity, Text} from "react-native";
import Modal from "react-native-modal";
import ExpenseTransaction from "./ExpenseTransaction";
import IncomeTransaction from "./IncomeTransaction";
import GestureRecognizer from "react-native-swipe-gestures";
import TransferTransaction from "./TransferTransaction";
import TransactionList from "./TransactionList";

export default function CreateTransaction(props) {
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [colorList, setColorList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [color, setColor] = useState("#3e68d1");
    const [expense, setExpense] = useState(true);
    const [income, setIncome] = useState(false);
    const [transfer, setTransfer] = useState(false);

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
    }

    const getCategoriesList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/transaction-categories/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setCategories(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const getColorsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        Array.from(new Set(colorList));
        return fetch(ngrokConfig.myUrl + '/v2/colors/',{
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

    const updateData = () => {
        getWalletsList().then();
        getCategoriesList().then();
        getColorsList().then();
    }

    useEffect(() => {
        updateData();
    }, []);

    const onCancel = () => {
        setModalVisible(false);
    }

    return (
        <View style={styles.container}>
            <GestureRecognizer
                onSwipeDown={()=>setModalVisible(false)}
                onSwipeUp={()=>setModalVisible(false)}
                onSwipeLeft={()=>setModalVisible(false)}
                onSwipeRight={()=>setModalVisible(false)}
            >
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={[styles.expenseButton, expense ? {backgroundColor: color} : {backgroundColor: '#fff'}]}
                            onPress={() => {
                                setExpense(true);
                                setIncome(false);
                                setTransfer(false);
                                console.log("Expense pressed");
                            }}
                        >
                            <Text style={[styles.headerBtnText, expense ? {color:'#fff'} : {color:'#7D848FFF'}]}>Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.incomeButton, income ? {backgroundColor: color} : {backgroundColor: '#fff'}]}
                            onPress={() => {
                                setExpense(false);
                                setIncome(true);
                                setTransfer(false);
                                console.log("Income pressed");
                            }}
                        >
                            <Text style={[styles.headerBtnText, income ? {color:'#fff'} : {color:'#7D848FFF'}]}>Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.transferButton, transfer ? {backgroundColor: color} : {backgroundColor: '#fff'}]}
                            onPress={() => {
                                setExpense(false);
                                setIncome(false);
                                setTransfer(true);
                                console.log("Transfer pressed");
                            }}
                            >
                            <Text style={[styles.headerBtnText, transfer ? {color:'#fff'} : {color:'#7D848FFF'}]}>Transfer</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalBody}>
                        { expense &&
                            <ExpenseTransaction
                                wallets={wallets}
                                categories={categories}
                                color={color}
                                onCancel={onCancel}
                                onUpdated={props.onRefresh}
                                createElement={true}
                            />
                        }
                        {
                            income &&
                                <IncomeTransaction
                                    wallets={wallets}
                                    categories={categories}
                                    color={color}
                                    onCancel={onCancel}
                                    onUpdated={props.onRefresh}
                                    createElement={true}
                                />
                        }
                        {
                            transfer &&
                                <TransferTransaction
                                    wallets={wallets}
                                    categories={categories}
                                    color={color}
                                    onCancel={onCancel}
                                    onUpdated={props.onRefresh}
                                    createElement={true}
                                />
                        }
                    </View>
                </View>
            </Modal>
            </GestureRecognizer>
            <View style={styles.addTransactionView}>
                <TouchableOpacity
                    style={styles.addTransactionBtn}
                    onPress={() => {
                        setModalVisible(true);
                        setColor(colorList[~~(Math.random() * colorList.length)]);
                    }}
                >
                    <Text style={styles.addTransactionText}>Add Transaction</Text>
                </TouchableOpacity>
            </View>
            <TransactionList refreshing={props.refreshing}/>
        </View>
        );
}

const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    headerBtnText: {
        fontSize: 26,
    },
    expenseButton: {
        width: '33%',
        height: 60,
        borderTopLeftRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    incomeButton: {
        width: '34%',
        height: 60,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transferButton: {
        width: '33%',
        height: 60,
        borderTopRightRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTransactionView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    addTransactionBtn: {
        width: 300,
        height: 80,
        backgroundColor: '#3e68d1',
        borderRadius: 15,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTransactionText: {
        color: '#fff',
        fontSize: 24,
    },
    modalContainer: {
        width: 370,
        height: 440,
    },
    modalSubmit: {
        flexDirection: 'row',
        width: '100%',
    },
    createWalletBtn: {
        width: '80%',
        height: 40,
        flexDirection: 'row',
        borderBottomRightRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        width: '20%',
        height: 40,
        backgroundColor: 'rgb(255,255,255)',
        flexDirection: 'row',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 30
    },
});