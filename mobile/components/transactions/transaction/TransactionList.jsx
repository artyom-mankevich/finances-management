import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";
import {Text, TouchableOpacity, View, StyleSheet, ScrollView} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import CategoryIcons from "../categories/CategoryIcons";
import getSymbolFromCurrency from "currency-symbol-map";
import {ReduceFriendlyNumbers} from "../../wallets/WalletValidation";

export default function TransactionList(props) {
    const [transactions, setTransactions] = useState([]);
    const [allTransactions, setAllTransactions] = useState(true);
    const [incomeTransactions, setIncomeTransactions] = useState(false);
    const [expenseTransactions, setExpenseTransactions] = useState(false);
    const [transferTransactions, setTransferTransactions] = useState(false);

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
                //console.log("responseJson.result: ", responseJson.results);
                setTransactions(JSON.parse(JSON.stringify(responseJson.results)));
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    useEffect(() => {
        getTransactionsList().then();
    }, []);

    props.onUpdate ? getTransactionsList().then() : null;
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
            <View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
            <View style={styles.transactionsContainer}>
                {
                    incomeTransactions && transactions.filter(transaction => transaction.sourceAmount === null && transaction.targetAmount !== null).map((transaction, index) => (
                        <View style={styles.transactionContainer} key={transaction.id}>
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
                        </View>
                        ))
                    }
                {
                        expenseTransactions && transactions.filter(transaction => transaction.sourceAmount !== null && transaction.targetAmount === null).map((transaction, index) => (
                            <View style={styles.transactionContainer} key={transaction.id}>
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
                            </View>
                        ))
                }
                {
                    transferTransactions && transactions.filter(transaction => transaction.sourceAmount !== null && transaction.targetAmount !== null).map((transaction, index) => (
                        <View style={styles.transactionContainer} key={transaction.id}>
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
                        </View>
                    ))
                }
                {
                    allTransactions && transactions.map((transaction) => (
                        //console.log("transaction: ", transaction),
                        <View style={styles.transactionContainer} key={transaction.id}>
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
                        </View>
                    ))
                }
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
    transactionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#ececec',
        borderRadius: 20,
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
    }
});