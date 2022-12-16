import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";
import {Text, TouchableOpacity, View, StyleSheet, ScrollView} from "react-native";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import CategoryIcons from "../categories/CategoryIcons";
import getSymbolFromCurrency from "currency-symbol-map";
import {ReduceFriendlyNumbers} from "../../wallets/WalletValidation";
import Modal from "react-native-modal";
import ExpenseTransaction from "./ExpenseTransaction";
import IncomeTransaction from "./IncomeTransaction";
import TransferTransaction from "./TransferTransaction";
import GestureRecognizer from "react-native-swipe-gestures";

export default function TransactionList(props) {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState(true);
    const [incomeTransactions, setIncomeTransactions] = useState(false);
    const [expenseTransactions, setExpenseTransactions] = useState(false);
    const [transferTransactions, setTransferTransactions] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionType, setTransactionType] = useState('income');
    const [sourceAmount, setSourceAmount] = useState(0);
    const [targetAmount, setTargetAmount] = useState(0);
    const [sourceWallet, setSourceWallet] = useState('');
    const [targetWallet, setTargetWallet] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [transactionCount, setTransactionCount] = useState(0);
    const [transactionNext, setTransactionNext] = useState('');

    const getTransactionsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/transactions/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setTransactionCount(responseJson.count);
                responseJson.count > 15 ? setTransactionNext(responseJson.next.toString()) : setTransactionNext('');
                setTransactions(JSON.parse(JSON.stringify(responseJson.results)));
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getTransactionsListNext = async() => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(transactionNext.replace('http', 'https'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setTransactions(transactions.concat(responseJson.results));
                setTransactionCount(transactionCount - 15);
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getTargetWalletsList = () => {
        const targetWallets = [];
        transactions.map((transaction) => {
            if (transaction.targetWallet) {
                targetWallets.push(transaction.targetWallet);
            }
        })
        return targetWallets;
    }

    const getCategoriesList = () => {
        const categories = [];
        transactions.map((transaction) => {
            if (transaction.category) {
                if (categories.filter((category) => category.id === transaction.category.id).length === 0) {
                    categories.push(transaction.category);
                }
            }
        });
        return categories;
    }

    const deleteTransaction = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transactions/' + transactionId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            getTransactionsList().then();
            setModalVisible(false);
            console.log('Transaction deleted');
        })
            .catch((error) => {
                console.error(error);
            })};

    useEffect(() => {
        getTransactionsList();
        getCategoriesList();
        getTransactionsList().then();
    }, []);

    const onCancel = () => {
        setModalVisible(false);
    }

    props.refreshing ? getTransactionsList().then() : null;

    return (
        <View>
            <View style={styles.filterContainer}>
                <TouchableOpacity style={styles.filterButton} onPress={() => {
                    setAllTransactions(true);
                    setIncomeTransactions(false);
                    setExpenseTransactions(false);
                    setTransferTransactions(false);
                }
                }>
                    <Text style={allTransactions ? styles.filterButtonTextActive : styles.filterButtonText}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton} onPress={() => {
                    setAllTransactions(false);
                    setIncomeTransactions(true);
                    setExpenseTransactions(false);
                    setTransferTransactions(false);
                }
                }>
                    <Text style={incomeTransactions ? styles.filterButtonTextActive : styles.filterButtonText}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton} onPress={() => {
                    setAllTransactions(false);
                    setIncomeTransactions(false);
                    setExpenseTransactions(true);
                    setTransferTransactions(false);
                }
                }>
                    <Text style={expenseTransactions ? styles.filterButtonTextActive : styles.filterButtonText}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton} onPress={() => {
                    setAllTransactions(false);
                    setIncomeTransactions(false);
                    setExpenseTransactions(false);
                    setTransferTransactions(true);
                }
                }>
                    <Text style={transferTransactions ? styles.filterButtonTextActive : styles.filterButtonText}>Transfer</Text>
                </TouchableOpacity>
            </View>
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
                        <View>
                            <View style={styles.walletDeleteBtn}>
                                <TouchableOpacity
                                    style={styles.walletDeleteBtnTouchableOpacity}
                                    onPress={() => deleteTransaction()}>
                                    <FontAwesome name="trash" size={55} color="#930000"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.modalHeader, color ? {backgroundColor: color} : {backgroundColor: '#000'}]}>
                            <Text style={styles.modalHeaderText}>{transactionType === 'Expense' ? 'Expense' : transactionType === 'Income' ? 'Income' : 'Transfer'}</Text>
                        </View>
                        <View style={styles.modalBody}>
                            {
                                transactionType === 'Income' ?
                                <IncomeTransaction
                                    targetAmount={targetAmount}
                                    category={category}
                                    targetWallet={targetWallet}
                                    description={description}
                                    wallets={getTargetWalletsList()}
                                    categories={getCategoriesList()}
                                    color={color}
                                    onCancel={onCancel}
                                    onUpdate={() => {
                                        getTransactionsList().then();
                                        setModalVisible(false);}
                                    }
                                    createElement={false}
                                    transactionId={transactionId}
                                />
                                    :
                                transactionType === 'Expense' ?
                                    <ExpenseTransaction
                                        sourceAmount={sourceAmount}
                                        category={category}
                                        sourceWallet={sourceWallet}
                                        description={description}
                                        wallets={getTargetWalletsList()}
                                        categories={getCategoriesList()}
                                        color={color}
                                        onCancel={onCancel}
                                        onUpdate={() => {
                                            getTransactionsList().then();
                                            setModalVisible(false);}
                                        }
                                        createElement={false}
                                        transactionId={transactionId}
                                        />
                                    :
                                    <TransferTransaction
                                        sourceAmount={sourceAmount}
                                        targetAmount={targetAmount}
                                        sourceWallet={sourceWallet}
                                        targetWallet={targetWallet}
                                        description={description}
                                        wallets={getTargetWalletsList()}
                                        categories={getCategoriesList()}
                                        onCancel={onCancel}
                                        onUpdate={() => {
                                            getTransactionsList().then();
                                            setModalVisible(false);}
                                        }
                                        createElement={false}
                                        color={color}
                                        transactionId={transactionId}
                                        />
                            }
                        </View>
                    </View>
                </Modal>
            </GestureRecognizer>
            <View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
            <View style={styles.transactionsContainer}>
                {
                    incomeTransactions && transactions.filter(transaction => transaction.sourceAmount === null && transaction.targetAmount !== null).map((transaction, index) => (
                        <View key={transaction.id}>
                        <TouchableOpacity
                            style={styles.transactionContainer}
                            key={transaction.id}
                            onPress={() => {
                                setTransactionType('Income');
                                setTargetAmount(transaction.targetAmount);
                                setTargetWallet(transaction.targetWallet);
                                setModalVisible(true)
                                setDescription(transaction.description)
                                setCategory(transaction.category)
                                setColor(transaction.category.color);
                                setTransactionId(transaction.id);
                            }}
                        >
                            <View style={styles.transactionStartIconContainer}>
                                {
                                transaction.sourceAmount !== null && transaction.targetAmount === null
                                    ?
                                    <MaterialIcons name={'arrow-downward'} size={35} color={'red'} />
                                    : transaction.sourceAmount === null && transaction.targetAmount !== null
                                        ?
                                        <MaterialIcons name={'arrow-upward'} size={35} color={'green'} />
                                    :
                                    <MaterialIcons name={'swap-horiz'} size={35} color={'blue'} />
                            }
                            </View>
                            <View style={styles.transactionInfoContainer}>
                                <Text style={styles.transactionText}>{transaction.description}</Text>
                                <View style={styles.transactionCategory}>
                                    {
                                        transaction.category !== null &&
                                        <View style={styles.transactionCategoryIcon}>
                                            <CategoryIcons item={transaction.category.icon} size={15} selectedIcon={transaction.category.icon} color={transaction.category.color}/>
                                        </View>
                                    }
                                    {
                                        transaction.category === null &&
                                        <View style={styles.transactionCategoryTransfer}>
                                            <Text style={styles.transactionCategoryTransferText}>{transaction.sourceWallet.name}</Text>
                                            <MaterialIcons name="arrow-downward" size={18} color='#000' />
                                            <Text style={styles.transactionCategoryTransferText}>{transaction.targetWallet.name}</Text>
                                        </View>
                                    }
                                    <View style={styles.transactionCategoryText}>
                                        {
                                            transaction.category !== null &&
                                            <Text style={[styles.transactionText, {color: transaction.category.color}]}>{transaction.category.name}</Text>
                                        }
                                    </View>
                                </View>
                            </View>
                            <View style={styles.transactionDate}>
                                <Text style={styles.transactionTime}>
                                    {
                                        new Date(transaction.createdAt).getDate() + '.' + (new Date(transaction.createdAt).getMonth() + 1) + '.' + new Date(transaction.createdAt).getFullYear()
                                    }
                                </Text>
                            </View>
                            <View style={styles.transactionAmount}>
                                <Text style={styles.transactionText}>
                                    {
                                        transaction.sourceAmount !== null && transaction.targetAmount === null
                                            ?
                                            <Text>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                            : transaction.sourceAmount === null && transaction.targetAmount !== null
                                            ?
                                                <Text>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount, 1)}</Text>

                                                : <View style={styles.amountTransfer}>
                                                    <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                                    <MaterialIcons name="arrow-downward" size={20} color='#000' />
                                                    <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount.toFixed(2), 1)}</Text>
                                                </View>
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                        ))
                    }
                {
                        expenseTransactions && transactions.filter(transaction => transaction.sourceAmount !== null && transaction.targetAmount === null).map((transaction, index) => (
                            <View key={transaction.id}>
                            <TouchableOpacity
                                style={styles.transactionContainer}
                                key={transaction.id}
                                onPress={() => {
                                    setTransactionType('Expense');
                                    setSourceAmount(transaction.sourceAmount);
                                    setSourceWallet(transaction.sourceWallet);
                                    setModalVisible(true)
                                    setDescription(transaction.description)
                                    setCategory(transaction.category)
                                    setColor(transaction.category.color);
                                    setTransactionId(transaction.id);
                                }}
                            >
                                <View style={styles.transactionStartIconContainer}>
                                    {
                                        transaction.sourceAmount !== null && transaction.targetAmount === null
                                            ?
                                            <MaterialIcons name={'arrow-downward'} size={35} color={'red'} />
                                            : transaction.sourceAmount === null && transaction.targetAmount !== null
                                                ?
                                                <MaterialIcons name={'arrow-upward'} size={35} color={'green'} />
                                                :
                                                <MaterialIcons name={'swap-horiz'} size={35} color={'blue'} />
                                    }
                                </View>
                                <View style={styles.transactionInfoContainer}>
                                    <Text style={styles.transactionText}>{transaction.description}</Text>
                                    <View style={styles.transactionCategory}>
                                        {
                                            transaction.category !== null &&
                                            <View style={styles.transactionCategoryIcon}>
                                                <CategoryIcons item={transaction.category.icon} size={15} selectedIcon={transaction.category.icon} color={transaction.category.color}/>
                                            </View>
                                        }
                                        {
                                            transaction.category === null &&
                                            <View style={styles.transactionCategoryTransfer}>
                                                <Text style={styles.transactionCategoryTransferText}>{transaction.sourceWallet.name}</Text>
                                                <MaterialIcons name="arrow-downward" size={18} color='#000' />
                                                <Text style={styles.transactionCategoryTransferText}>{transaction.targetWallet.name}</Text>
                                            </View>
                                        }
                                        <View style={styles.transactionCategoryText}>
                                            {
                                                transaction.category !== null &&
                                                <Text style={[styles.transactionText, {color: transaction.category.color}]}>{transaction.category.name}</Text>
                                            }
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.transactionDate}>
                                    <Text style={styles.transactionTime}>
                                        {
                                            new Date(transaction.createdAt).getDate() + '.' + (new Date(transaction.createdAt).getMonth() + 1) + '.' + new Date(transaction.createdAt).getFullYear()
                                        }
                                    </Text>
                                </View>
                                <View style={styles.transactionAmount}>
                                    <Text style={styles.transactionText}>
                                        {
                                            transaction.sourceAmount !== null && transaction.targetAmount === null
                                                ?
                                                <Text>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                                : transaction.sourceAmount === null && transaction.targetAmount !== null
                                                    ?
                                                    <Text>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount, 1)}</Text>

                                                    : <View style={styles.amountTransfer}>
                                                        <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                                        <MaterialIcons name="arrow-downward" size={20} color='#000' />
                                                        <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount.toFixed(2), 1)}</Text>
                                                    </View>
                                        }
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            </View>
                        ))
                }
                {
                    transferTransactions && transactions.filter(transaction => transaction.sourceAmount !== null && transaction.targetAmount !== null).map((transaction, index) => (
                        <View key={transaction.id}>
                        <TouchableOpacity
                            style={styles.transactionContainer}
                            key={transaction.id}
                            onPress={() => {
                                setTransactionType('Transfer');
                                setSourceAmount(transaction.sourceAmount);
                                setTargetAmount(transaction.targetAmount);
                                setSourceWallet(transaction.sourceWallet);
                                setTargetWallet(transaction.targetWallet);
                                setModalVisible(true)
                                setDescription(transaction.description)
                                setTransactionId(transaction.id);
                            }}
                        >
                            <View style={styles.transactionStartIconContainer}>
                                {
                                    transaction.sourceAmount !== null && transaction.targetAmount === null
                                        ?
                                        <MaterialIcons name={'arrow-downward'} size={35} color={'red'} />
                                        : transaction.sourceAmount === null && transaction.targetAmount !== null
                                            ?
                                            <MaterialIcons name={'arrow-upward'} size={35} color={'green'} />
                                            :
                                            <MaterialIcons name={'swap-horiz'} size={35} color={'blue'} />
                                }
                            </View>
                            <View style={styles.transactionInfoContainer}>
                                <Text style={styles.transactionText}>{transaction.description}</Text>
                                <View style={styles.transactionCategory}>
                                    {
                                        transaction.category !== null &&
                                        <View style={styles.transactionCategoryIcon}>
                                            <CategoryIcons item={transaction.category.icon} size={15} selectedIcon={transaction.category.icon} color={transaction.category.color}/>
                                        </View>
                                    }
                                    {
                                        transaction.category === null &&
                                        <View style={styles.transactionCategoryTransfer}>
                                            <Text style={styles.transactionCategoryTransferText}>{transaction.sourceWallet.name}</Text>
                                            <MaterialIcons name="arrow-downward" size={18} color='#000' />
                                            <Text style={styles.transactionCategoryTransferText}>{transaction.targetWallet.name}</Text>
                                        </View>
                                    }
                                    <View style={styles.transactionCategoryText}>
                                        {
                                            transaction.category !== null &&
                                            <Text style={[styles.transactionText, {color: transaction.category.color}]}>{transaction.category.name}</Text>
                                        }
                                    </View>
                                </View>
                            </View>
                            <View style={styles.transactionDate}>
                                <Text style={styles.transactionTime}>
                                    {
                                        new Date(transaction.createdAt).getDate() + '.' + (new Date(transaction.createdAt).getMonth() + 1) + '.' + new Date(transaction.createdAt).getFullYear()
                                    }
                                </Text>
                            </View>
                            <View style={styles.transactionAmount}>
                                <Text style={styles.transactionText}>
                                    {
                                        transaction.sourceAmount !== null && transaction.targetAmount === null
                                            ?
                                            <Text>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                            : transaction.sourceAmount === null && transaction.targetAmount !== null
                                                ?
                                                <Text>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount, 1)}</Text>

                                                : <View style={styles.amountTransfer}>
                                                    <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                                    <MaterialIcons name="arrow-downward" size={20} color='#000' />
                                                    <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount.toFixed(2), 1)}</Text>
                                                </View>
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                    ))
                }
                {
                    allTransactions && transactions.map((transaction) => (
                    <View key={transaction.id}>
                        <TouchableOpacity
                            style={styles.transactionContainer}
                            key={transaction.id}
                            onPress={() => {
                                transaction.sourceWallet !== null && transaction.targetWallet !== null && setTransactionType('Transfer');
                                transaction.sourceWallet !== null && transaction.targetWallet === null && setTransactionType('Expense');
                                transaction.sourceWallet === null && transaction.targetWallet !== null && setTransactionType('Income');
                                transaction.sourceAmount !== null && setSourceAmount(transaction.sourceAmount);
                                transaction.targetAmount !== null && setTargetAmount(transaction.targetAmount);
                                transaction.sourceWallet !== null && setSourceWallet(transaction.sourceWallet);
                                transaction.targetWallet !== null && setTargetWallet(transaction.targetWallet);
                                transaction.category !== null && setCategory(transaction.category);
                                transaction.category !== null && setColor(transaction.category.color);
                                setModalVisible(true)
                                setDescription(transaction.description)
                                setTransactionId(transaction.id);
                            }}
                        >
                            <View style={styles.transactionStartIconContainer}>
                                {
                                    transaction.sourceAmount !== null && transaction.targetAmount === null
                                        ?
                                        <MaterialIcons name={'arrow-downward'} size={35} color={'red'} />
                                        : transaction.sourceAmount === null && transaction.targetAmount !== null
                                            ?
                                            <MaterialIcons name={'arrow-upward'} size={35} color={'green'} />
                                            :
                                            <MaterialIcons name={'swap-horiz'} size={35} color={'blue'} />
                                }
                            </View>
                            <View style={styles.transactionInfoContainer}>
                                <Text style={styles.transactionText}>{transaction.description}</Text>
                                <View style={styles.transactionCategory}>
                                    {
                                        transaction.category !== null &&
                                        <View style={styles.transactionCategoryIcon}>
                                            <CategoryIcons item={transaction.category.icon} size={15} selectedIcon={transaction.category.icon} color={transaction.category.color}/>
                                        </View>
                                    }
                                    {
                                        transaction.category === null &&
                                        <View style={styles.transactionCategoryTransfer}>
                                            <Text style={styles.transactionCategoryTransferText}>{transaction.sourceWallet.name}</Text>
                                            <MaterialIcons name="arrow-downward" size={18} color='#000' />
                                            <Text style={styles.transactionCategoryTransferText}>{transaction.targetWallet.name}</Text>
                                        </View>
                                    }
                                    <View style={styles.transactionCategoryText}>
                                        {
                                            transaction.category !== null &&
                                            <Text style={[styles.transactionText, {color: transaction.category.color}]}>{transaction.category.name}</Text>
                                        }
                                    </View>
                                </View>
                            </View>
                            <View style={styles.transactionDate}>
                                <Text style={styles.transactionTime}>
                                    {
                                        new Date(transaction.createdAt).getDate() + '.' + (new Date(transaction.createdAt).getMonth() + 1) + '.' + new Date(transaction.createdAt).getFullYear()
                                    }
                                </Text>
                            </View>
                            <View style={styles.transactionAmount}>
                                <Text style={styles.transactionText}>
                                    {
                                        transaction.sourceAmount !== null && transaction.targetAmount === null
                                            ?
                                            <Text>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                            : transaction.sourceAmount === null && transaction.targetAmount !== null
                                                ?
                                                <Text>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount, 1)}</Text>

                                                : <View style={styles.amountTransfer}>
                                                    <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.sourceWallet.currency)} {ReduceFriendlyNumbers(transaction.sourceAmount, 1)}</Text>
                                                    <MaterialIcons name="arrow-downward" size={20} color='#000' />
                                                    <Text style={styles.transactionText}>{getSymbolFromCurrency(transaction.targetWallet.currency)} {ReduceFriendlyNumbers(transaction.targetAmount.toFixed(2), 1)}</Text>
                                                </View>
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    ))
                }
                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10}}>
                {
                    transactionCount > 15 &&
                    <View style={styles.loadMoreContainer}>
                        <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={() => {
                                getTransactionsListNext(transactionNext).then();
                            }}
                        >
                            <Text style={styles.loadMoreText}>Show more</Text>
                        </TouchableOpacity>
                    </View>
                }
                </View>
            </View>
            </ScrollView>
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    scrollView: {
        height: '71%',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    filterButton: {
        backgroundColor: '#ffffff',
        color: '#7D848FFF',
        borderRadius: 10,
        width: 90,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: .5,
    },
    filterButtonText: {
        color: '#7D848FFF',
        fontSize: 18,
    },
    filterButtonTextActive: {
        backgroundColor: '#3E68D1FF',
        textAlign: 'center',
        textAlignVertical: 'center',
        width: 90,
        height: 50,
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        borderRadius: 10,
    },
    loadMoreContainer: {
        backgroundColor: '#ffffff',
        color: '#7D848FFF',
        borderRadius: 10,
        width: 100,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: .5,
        borderColor: '#3E68D1FF',
    },
    loadMoreText: {
        color: '#3E68D1FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: '#ececec',
    },
    modalHeader: {
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeaderText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    transactionStartIconContainer: {
        width: 90,
        alignItems: 'center',
        marginLeft: 0,
        marginRight: 0,
        paddingRight: 20,
    },
    transactionInfoContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 90,
        marginLeft: -10,
    },
    transactionTime: {
        color: '#7D848FFF',
    },
    transactionText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    transactionCategoryIcon: {
        padding: 5,
    },
    transactionCategory: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionCategoryTransfer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
    },
    transactionCategoryTransferText: {
        marginTop: 0,
    },
    transactionDate: {
        marginLeft: 25,
    },
    transactionAmount: {
        marginLeft: 'auto',
        marginRight: 20,
    },
    amountTransfer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletDeleteBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
    }
});