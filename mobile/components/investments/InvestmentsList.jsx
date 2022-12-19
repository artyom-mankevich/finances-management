import {View, StyleSheet, ScrollView, TouchableOpacity, Text} from "react-native";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import GestureRecognizer from "react-native-swipe-gestures";
import Modal from "react-native-modal";
import InvestmentInputs from "./InvestmentInputs";
import getSymbolFromCurrency from "currency-symbol-map";
import {ReduceFriendlyNumbers} from "../wallets/WalletValidation";

export default function InvestmentsList(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [mpy, setMpy] = useState('');
    const [currency, setCurrency] = useState('');
    const [currencyList, setCurrencyList] = useState([]);
    const [color, setColor] = useState('');
    const [colorList, setColorList] = useState([]);
    const [onBtnCreate, setOnBtnCreate] = useState(true);
    const [currencyFormat, setCurrencyFormat] = useState('left');
    const [investmentId, setInvestmentId] = useState('');
    const [investmentList, setInvestmentList] = useState([]);


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

    const getInvestmentsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const currencFormat = await AsyncStorage.getItem('currencyFormat');
        setCurrencyFormat(currencFormat);
        return await fetch(ngrokConfig.myUrl + '/v2/investments/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("responseJson investments:", responseJson);
                setInvestmentList(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const deleteInvestment = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transactions/' + transactionId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            getInvestmentsList().then();
            setModalVisible(false);
            console.log('Investment deleted');
        })
            .catch((error) => {
                console.error(error);
            })};

    useEffect(() => {
        getCurrencyList().then();
        getColorsList().then();
        getInvestmentsList().then();
    }, []);

    const onCancel = () => {
        setModalVisible(false);
    }

    const onUpdate = () => {
        setModalVisible(false);
        getInvestmentsList().then();
    }

    props.refreshing ? getInvestmentsList().then() : null;

    const btnColorSet = name && amount && mpy && currency && color;

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
                        <InvestmentInputs
                            name={name}
                            setName={setName}
                            description={description}
                            setDescription={setDescription}
                            amount={amount}
                            setAmount={setAmount}
                            mpy={mpy}
                            setMpy={setMpy}
                            currency={currency}
                            setCurrency={setCurrency}
                            currencyList={currencyList}
                            color={color}
                            setColor={setColor}
                            colorList={colorList}
                            createElement={onBtnCreate}
                            investmentId={investmentId}
                            btnColorSet={btnColorSet}
                            onUpdate={onUpdate}
                            onCancel={onCancel}
                        />
                    </Modal>
                </GestureRecognizer>
                <View style={styles.modalBtnContainer}>
                    <View style={styles.addInvestmentView}>
                        <TouchableOpacity
                            style={styles.addInvestmentBtn}
                            onPress={() => {
                                setModalVisible(true);
                                setOnBtnCreate(true);
                            }}
                        >
                            <Text style={styles.addInvestmentText}>Add Investments</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.investmentsContainer}>
                {
                    investmentList.length > 0 ?
                        investmentList.map((investment, index) => {
                            return(
                                <TouchableOpacity
                                    key={index}
                                    style={styles.investmentContainer}
                                    onPress={() => {
                                        setModalVisible(true);
                                        setOnBtnCreate(false);
                                        setName(investment.name);
                                        setDescription(investment.description);
                                        setAmount(investment.balance);
                                        setMpy(investment.percent);
                                        setCurrency(investment.currency);
                                        setColor(investment.color);
                                        setInvestmentId(investment.id);
                                        AsyncStorage.setItem('investmentId', investment.id).then();
                                    }}
                                >
                                    <View style={styles.investmentView}>
                                        <View style={styles.investmentColorView}>
                                            <View style={[styles.investmentColor, {backgroundColor: investment.color}]}/>
                                        </View>
                                        <View style={styles.investmentInfoView}>
                                            <View style={styles.investmentNameView}>
                                                <Text style={styles.investmentNameText}>{investment.name}</Text>
                                            </View>
                                            <View style={styles.investmentDescriptionView}>
                                                <Text style={styles.investmentDescriptionText}>{investment.description}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.investmentBalanceView}>
                                            <View style={styles.investmentAmountView}>
                                                <Text style={styles.investmentAmountText}>
                                                    {
                                                        currencyFormat === 'left' ? getSymbolFromCurrency(investment.currency) +
                                                            ' ' + ReduceFriendlyNumbers(investment.balance, 1) :
                                                            ReduceFriendlyNumbers(investment.balance, 1) + ' ' + getSymbolFromCurrency(investment.currency)
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.investmentPercentView}>
                                                <Text style={styles.investmentPercentText}>{investment.percent}%</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        }) : null
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    investmentsContainer: {
        flex: 1,
        width: '90%',
        alignSelf: 'center',
    },
    investmentView: {
        backgroundColor: '#e8e8e8',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        height: 70,
        marginBottom: 5,
    },
    investmentColorView: {
        marginRight: 'auto',
        marginLeft: 20,
    },
    investmentColor: {
        width: 20,
        height: 20,
        borderRadius: 4,
    },
    investmentInfoView: {
        marginRight: 'auto',
        marginLeft: -100,
    },
    investmentNameView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    investmentNameText: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    investmentDescriptionView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    investmentDescriptionText: {
        color: '#000',
        fontSize: 14,
    },
    investmentBalanceView: {
        paddingRight: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    investmentAmountView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    investmentAmountText: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    investmentPercentText: {
        color: '#000',
        fontSize: 14,
    },
    modalBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    addInvestmentView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
    },
    addInvestmentBtn: {
        width: 200,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#3e68d1',
    },
    addInvestmentText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});