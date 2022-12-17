import {View, StyleSheet, Text, ScrollView, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {useEffect, useState} from "react";
import DebtChart from "./DebtChart";
import {ReduceFriendlyNumbers} from "../wallets/WalletValidation";
import GestureRecognizer from "react-native-swipe-gestures";
import Modal from "react-native-modal";
import DebtInputs from "./DebtInputs";
import PaymentInputs from "./PaymentInputs";

export default function DebtsList(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisiblePay, setModalVisiblePay] = useState(false);
    const [debtsData, setDebtsData] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [finalAmount, setFinalAmount] = useState(0);
    const [currentAmount, setCurrentAmount] = useState(0);
    const [expiresAt, setExpiresAt] = useState(new Date());
    const [onBtnCreate, setOnBtnCreate] = useState(true);

    const getCurrencyList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/currencies/',{
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

    const getDebtsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/debts/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                //console.log("responseJson", responseJson);
                let debtsList = [];
                for(let i = 0; i < responseJson.length; i++) {
                    debtsList.push(
                        responseJson[i]
                    );
                    setDebtsData(debtsList);
                    setName(responseJson[i].name);
                    setCurrency(responseJson[i].currency);
                    setFinalAmount(responseJson[i].goal);
                    setCurrentAmount(responseJson[i].balance);
                    setExpiresAt(responseJson[i].expiresAt);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    useEffect(() => {
        getDebtsList().then();
        getCurrencyList().then();
    }, []);

    props.refreshing ? getDebtsList().then() : null;

    const onCancel = () => {
        setModalVisible(false);
        setModalVisiblePay(false);
        setName('');
        setCurrency('USD');
        setFinalAmount(0);
        setCurrentAmount(0);
        setExpiresAt(new Date().getTime());
    }

    const onUpdate = async () => {
        getDebtsList().then();
        setModalVisible(false);
        setModalVisiblePay(false);
    }

    const btnColorSet = name && currency && finalAmount && expiresAt;

    return (
    <View>
        <ScrollView>
            <GestureRecognizer
                onSwipeLeft={() => setModalVisible(false)}
                onSwipeRight={() => setModalVisible(false)}
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
                    <DebtInputs
                        name={name}
                        setName={setName}
                        currencyList={currencyList}
                        currency={currency}
                        setCurrency={setCurrency}
                        finalAmount={finalAmount}
                        setFinalAmount={setFinalAmount}
                        currentAmount={currentAmount}
                        setCurrentAmount={setCurrentAmount}
                        expiresAt={expiresAt}
                        setExpiresAt={setExpiresAt}
                        btnColorSet={btnColorSet}
                        onCancel={onCancel}
                        onUpdate={onUpdate}
                        createElement={onBtnCreate}
                    />
                </Modal>
            </GestureRecognizer>
            <GestureRecognizer
                onSwipeLeft={() => setModalVisiblePay(false)}
                onSwipeRight={() => setModalVisiblePay(false)}
            >
                <Modal
                    isVisible={modalVisiblePay}
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
                        <PaymentInputs
                            debts={debtsData}
                            onCancel={onCancel}
                            onUpdate={onUpdate}
                        />
                    </View>
                </Modal>
            </GestureRecognizer>
            <View style={styles.modalBtnContainer}>
                <View style={styles.addDebtView}>
                    <TouchableOpacity
                        style={styles.addDebtBtn}
                        onPress={() => {
                            setModalVisible(true);
                            setOnBtnCreate(true);
                        }}
                    >
                        <Text style={styles.addDebtText}>Add Debt</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.addDebtView}>
                    <TouchableOpacity
                        style={styles.addDebtBtn}
                        onPress={() => {
                            setModalVisiblePay(true);
                        }}
                    >
                        <Text style={styles.addDebtText}>Add Payment</Text>
                    </TouchableOpacity>
                </View>
                </View>
        </ScrollView>
        <View style={styles.chartContainer}>
            {
                debtsData.length > 0 ?
                    debtsData.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} onPress={()=>{
                                console.log("item select ", item);
                                setName(item.name);
                                setCurrency(item.currency);
                                setFinalAmount(item.goal);
                                setCurrentAmount(item.balance);
                                setExpiresAt(item.expiresAt);
                                setModalVisible(true);
                                setOnBtnCreate(false);
                                AsyncStorage.setItem('debtId', item.id).then();
                            }}>
                                <View style={styles.debtContainer}>
                                    <View style={styles.debtChartContainer}>
                                        <DebtChart
                                            data={[
                                                {
                                                    value: item.balance,
                                                    color: '#F6BA1B',
                                                },
                                                {
                                                    value: item.goal - item.balance > 0 ? item.goal - item.balance : 0,
                                                    color: '#cccccc',
                                                }
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.debtTextContainer}>
                                        <View style={styles.debtNameContainer}>
                                            <Text style={styles.debtAmount}>
                                                {item.currency} {ReduceFriendlyNumbers(item.balance,1)} / {item.currency} {ReduceFriendlyNumbers(item.goal,1)}
                                            </Text>
                                        </View>
                                        <View style={styles.debtName}>
                                            <Text style={styles.debtNameText}>
                                                {item.name}
                                            </Text>
                                        </View>
                                        <View style={styles.debtDate}>
                                            <Text style={styles.debtDateTextExpires}>
                                                Expires at:
                                            </Text>
                                            <Text style={styles.debtDateText}>
                                                {new Date(item.expiresAt).toLocaleDateString("en-GB")}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                    :
                    <Text style={styles.noDataText}>No data</Text>
            }
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    addDebtView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
    },
    modalContainer: {
        width: 370,
        height: 350,
    },
    modalBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    addDebtBtn: {
        width: 160,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#3e68d1',
    },
    addDebtText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    debtContainer: {
        flexDirection: 'row',
        paddingLeft: 10,
    },
    debtChartContainer: {

    },
    debtTextContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    debtNameContainer: {
        width: 140,
        marginTop: 20,
    },
    debtAmount: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    debtName: {
        width: 100,
        alignItems: 'center',
        marginTop: 30,
        marginLeft: -20,
    },
    debtNameText: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold',
    },
    debtDate: {
        width: 120,
        alignItems: 'center',
    },
    debtDateTextExpires: {
        paddingTop: 30,
        paddingRight: 30,
        color: '#000',
        fontSize: 16,
    },
    debtDateText: {
        color: '#000',
        fontSize: 16,
        paddingRight: 35,
    },
    noDataText: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    }
});