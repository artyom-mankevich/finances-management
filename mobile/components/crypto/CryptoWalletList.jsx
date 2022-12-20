import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {useEffect, useState} from "react";
import {ScrollView, View, StyleSheet, TouchableOpacity, Text} from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";
import Modal from "react-native-modal";
import CryptoWalletInputs from "./CryptoWalletInputs";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import {format} from "date-fns";
import CryptoTransferInputs from "./CryptoTransferInputs";

export default function CryptoWalletList(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleTransfer, setModalVisibleTransfer] = useState(false);
    const [cryptoWallets, setCryptoWallets] = useState([]);
    const [cryptoTransactions, setCryptoTransactions] = useState([]);
    const [address, setAddress] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [encryptedPrivateKey, setEncryptedPrivateKey] = useState('');
    const [dateFormat, setDateFormat] = useState('d MMMM y');
    const [currencyFormat, setCurrencyFormat] = useState('left');
    const [amount, setAmount] = useState('');

    const getCryptoWalletsList = async () => {
        const dateFormat = await AsyncStorage.getItem('dateFormat');
        setDateFormat(dateFormat);
        const currencFormat = await AsyncStorage.getItem('currencyFormat');
        setCurrencyFormat(currencFormat);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/eth-keys/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setCryptoWallets(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const deleteCryptoWallet = async (walletId) => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/eth-keys/' + walletId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            onUpdate();
            console.log('Crypto wallet deleted');
        })
            .catch((error) => {
                console.error(error);
            })};

    const onCancel = () => {
        setModalVisible(false);
        setModalVisibleTransfer(false);
        setAddress('');
        setPrivateKey('');
        setEncryptedPrivateKey('');
    }

    const onUpdate = () => {
        setModalVisible(false);
        setModalVisibleTransfer(false);
        setAddress('');
        setPrivateKey('');
        setEncryptedPrivateKey('');
        getCryptoWalletsList().then();
        getCryptoTransactionsList().then();
    }

    const getCryptoTransactionsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/eth-keys/transactions/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setCryptoTransactions(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const btnColorSet = address && privateKey && encryptedPrivateKey;

    useEffect(() => {
        getCryptoWalletsList().then();
        getCryptoTransactionsList().then();
    }, []);

    props.refreshing ? getCryptoTransactionsList() && getCryptoWalletsList() : null;

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
                        <View style={styles.modalContainer}>
                            <CryptoWalletInputs
                                address={address}
                                setAddress={setAddress}
                                privateKey={privateKey}
                                setPrivateKey={setPrivateKey}
                                encryptedPrivateKey={encryptedPrivateKey}
                                setEncryptedPrivateKey={setEncryptedPrivateKey}
                                setModalVisible={setModalVisible}
                                btnColorSet={btnColorSet}
                                onCancel={onCancel}
                                onUpdate={onUpdate}
                            />
                        </View>
                    </Modal>
                </GestureRecognizer>
                <View style={styles.modalBtnContainer}>
                    <View style={styles.titleItem}>
                        <Text style={styles.titleText}>Ethereum Wallets</Text>
                    </View>
                    <View style={styles.addCryptoWalletView}>
                        <TouchableOpacity
                            style={styles.addCryptoWalletBtn}
                            onPress={() => {
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.addCryptoWalletText}>Create Wallet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View style={styles.cryptoWalletsContainer}>
                    {
                        cryptoWallets &&
                        cryptoWallets.map((cryptoWallet, index) => {
                            return (
                                <View key={index} style={styles.cryptoWalletItem}>
                                    <View style={styles.cryptoWalletItemLeft}>
                                        <Text style={styles.cryptoWalletItemText}>{cryptoWallet.address}</Text>
                                    </View>
                                    <View style={styles.cryptoWalletFooter}>
                                        <View style={styles.cryptoWalletItemRight}>
                                            <Text style={styles.cryptoWalletItemBtnText}>
                                                {
                                                    currencyFormat === 'left' ? 'ETH ' + (parseInt(cryptoWallet.balance * 10000) / 10000)
                                                        : (parseInt(cryptoWallet.balance * 10000) / 10000) + ' ETH'
                                                }
                                            </Text>
                                        </View>
                                        <View>
                                            <TouchableOpacity
                                                style={styles.cryptoWalletItemBtn}
                                                onPress={() => {
                                                    deleteCryptoWallet(cryptoWallet.id).then();
                                                }}
                                            >
                                                <View style={styles.cryptoWalletItemBtnView}>
                                                    <MaterialIcons name="close" size={40} color="#fff"/>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    }
                </View>
                </View>
            </ScrollView>
            <View style={styles.cryptoTransactionsContainer}>
                <ScrollView>
                    <GestureRecognizer
                        onSwipeLeft={() => setModalVisibleTransfer(false)}
                        onSwipeRight={() => setModalVisibleTransfer(false)}
                    >
                        <Modal
                            isVisible={modalVisibleTransfer}
                            backdropColor={'#000000'}
                            backdropOpacity={0.8}
                            animationIn={"zoomInDown"}
                            animationOut={"zoomOutUp"}
                            animationInTiming={600}
                            animationOutTiming={600}
                            backdropTransitionInTiming={600}
                            backdropTransitionOutTiming={600}
                        >
                                <CryptoTransferInputs
                                    cryptoWallets={cryptoWallets}
                                    amount={amount}
                                    address={address}
                                    encryptedPrivateKey={encryptedPrivateKey}
                                    onCancel={onCancel}
                                    onUpdate={onUpdate}
                                />
                        </Modal>
                    </GestureRecognizer>
                    <View style={styles.modalBtnContainer}>
                        <View style={styles.titleItem}>
                            <Text style={styles.titleText}>Ethereum Transactions</Text>
                        </View>
                        <View style={styles.addCryptoWalletView}>
                            <TouchableOpacity
                                style={[styles.addCryptoWalletBtn, {width: 180}]}
                                onPress={() => {
                                    setModalVisibleTransfer(true);
                                }}
                            >
                                <Text style={styles.addCryptoWalletText}>Create Transfer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.cryptoTransactionsList}>
                    {
                        cryptoTransactions.length > 0 ?
                            cryptoTransactions.map((cryptoTransaction, index) => {
                                return (
                                    <View style={styles.cryptoTransactionItem} key={index}>
                                        <View style={styles.cryptoTransaction}>
                                            <View style={styles.cryptoTransactionBodyLeft}>
                                                <FontAwesome name={'refresh'} size={26} color={'#7A3EF8'} />
                                            </View>
                                            <View style={styles.cryptoTransactionInfo}>
                                                <View style={styles.cryptoTransactionBody}>
                                                    <View style={styles.cryptoTransactionBodyCenter}>
                                                        <View style={styles.cryptoTransactionBodySourceWallet}>
                                                            <Text style={styles.cryptoTransactionBodySourceWalletText}>{cryptoTransaction.sourceWalletAddress}</Text>
                                                        </View>
                                                        <View style={styles.cryptoTransactionBodyArrow}>
                                                            <MaterialIcons name={'arrow-downward'} size={20} color={'black'} />
                                                        </View>
                                                        <View style={styles.cryptoTransactionBodyTargetWallet}>
                                                            <Text style={styles.cryptoTransactionBodyTargetWalletText}>{cryptoTransaction.targetWalletAddress}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={styles.cryptoTransactionFooter}>
                                                    <View style={styles.cryptoTransactionFooterDate}>
                                                        <Text style={styles.cryptoTransactionFooterDateText}>
                                                            {
                                                                format(new Date(cryptoTransaction.date).getTime(), dateFormat)
                                                            }
                                                        </Text>
                                                    </View>
                                                    <View style={styles.cryptoTransactionFooterAmount}>
                                                        <Text style={styles.cryptoTransactionFooterAmountText}>
                                                            {
                                                                currencyFormat === 'left' ? 'ETH ' + cryptoTransaction.amount : cryptoTransaction.amount + ' ETH'
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                            :
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{fontSize:24, fontWeight: 'bold'}}>No Crypto Transactions yet</Text>
                            </View>
                    }
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cryptoTransactionsList: {
        paddingBottom: 10,
    },
    cryptoWalletsContainer: {
        flex: 1,
        width: 350,
    },
    cryptoWalletItem: {
        backgroundColor: '#555994',
        borderRadius: 30,
        height: 250,
        marginBottom: 20,
        alignItems: 'center',
    },
    cryptoWalletItemLeft: {
        flex: 1,
        width: 310,
        alignItems: 'center',
        paddingTop: 10,
    },
    cryptoWalletFooter: {
        width: 310,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 15,
    },
    cryptoWalletItemText: {
        fontSize: 20,
        color: '#fff',
    },
    cryptoWalletItemBtnText: {
        fontSize: 22,
        color: '#fff',
    },
    cryptoWalletItemBtnView: {
        paddingBottom: 10,
    },
    titleItem: {
        padding: 10,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addCryptoWalletView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
    },
    addCryptoWalletBtn: {
        width: 150,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#3e68d1',
    },
    addCryptoWalletText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cryptoTransaction: {
        backgroundColor: '#e5e5e5',
        borderRadius: 10,
        margin: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    cryptoTransactionBody: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cryptoTransactionBodyCenter: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cryptoTransactionInfo: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cryptoTransactionFooter: {
        flexDirection: 'row',
        paddingTop: 5,
    },
    cryptoTransactionFooterDate: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cryptoTransactionFooterAmount: {
        flex: 1,
        alignItems: 'center',
    },
    cryptoTransactionBodySourceWalletText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    cryptoTransactionBodyTargetWalletText: {
        fontSize: 13,
    },
    cryptoTransactionFooterDateText: {
        fontSize: 14,
        color: '#4d4d4d',
    },
    cryptoTransactionFooterAmountText: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
    },
    modalContainer: {
        width: 370,
        height: 400,
    },
});