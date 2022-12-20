import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {useEffect, useState} from "react";
import {View, StyleSheet, Text, TouchableOpacity, ScrollView} from "react-native";
import {BarChart, LineChart} from "react-native-gifted-charts";
import WalletUpdateInputs from "../wallets/WalletUpdateInputs";
import Modal from "react-native-modal";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import IncomeTransaction from "../transactions/transaction/IncomeTransaction";
import ExpenseTransaction from "../transactions/transaction/ExpenseTransaction";
import TransferTransaction from "../transactions/transaction/TransferTransaction";
import GestureRecognizer from "react-native-swipe-gestures";
import CategoryIcons from "../transactions/categories/CategoryIcons";
import {format} from "date-fns";
import getSymbolFromCurrency from "currency-symbol-map";
import {ReduceFriendlyNumbers} from "../wallets/WalletValidation";

export default function OverviewComponent(props) {
    const [dateFormat, setDateFormat] = useState('d MMMM y');
    const [currencyFormat, setCurrencyFormat] = useState('left');
    const [lineIncomeChartData, setLineIncomeChartData] = useState([]);
    const [lineExpenseChartData, setLineExpenseChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);
    const [data, setData] = useState([]);
    const [oneWeek, setOneWeek] = useState(true);
    const [oneMonth, setOneMonth] = useState(false);
    const [threeMonths, setThreeMonths] = useState(false);
    const [oneYear, setOneYear] = useState(false);
    const [period, setPeriod] = useState('7d');
    const [wallets, setWallets] = useState([]);
    const [currencyList, setCurrencyList] = useState([]);
    const [colorList, setColorList] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false)
    const [transactionType, setTransactionType] = useState('income');
    const [sourceAmount, setSourceAmount] = useState(0);
    const [targetAmount, setTargetAmount] = useState(0);
    const [sourceWallet, setSourceWallet] = useState('');
    const [targetWallet, setTargetWallet] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('');



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
    };

    const deleteWallet = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const walletId = await AsyncStorage.getItem('walletId');
        return fetch(ngrokConfig.myUrl + '/v2/wallets/' + walletId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            getWalletsList();
        })
            .catch((error) => {
                console.error(error);
            })};

    const getTransactionsChartsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const currencFormat = await AsyncStorage.getItem('currencyFormat');
        setCurrencyFormat(currencFormat);
        return await fetch(ngrokConfig.myUrl + '/v2/transactions/chart-data/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let lineIncomeChartDataTmp = [];
                let lineExpenseChartDataTmp = [];
                for(let i = 0; i < responseJson.incomes.length; i++) {
                    lineIncomeChartDataTmp.push({
                        value: responseJson.incomes[i],
                        label: responseJson.dates[i],
                        dataPointText: responseJson.incomes[i],
                    })
                    setLineIncomeChartData(lineIncomeChartDataTmp);
                }
                for (let i = 0; i < responseJson.expenses.length; i++) {
                    lineExpenseChartDataTmp.push({
                        value: responseJson.expenses[i],
                        label: responseJson.dates[i],
                        dataPointText: responseJson.expenses[i],
                    })
                    setLineExpenseChartData(lineExpenseChartDataTmp);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const getStocksChartList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/stocks/chart-data/?period=' + period,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let barChartDataTmp = [];
                for (let i = 0; i < responseJson.data.dates.length; i++) {
                    barChartDataTmp.push({
                        value: responseJson.data.values[i],
                        label: responseJson.data.dates[i],
                    })
                    setBarChartData(barChartDataTmp);
                }
                setData(responseJson.data);
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getTransactionsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const dateFormat = await AsyncStorage.getItem('dateFormat');
        setDateFormat(dateFormat);
        const currencFormat = await AsyncStorage.getItem('currencyFormat');
        setCurrencyFormat(currencFormat);
        return await fetch(ngrokConfig.myUrl + '/v2/transactions/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setTransactions(JSON.parse(JSON.stringify(responseJson.results)));
            })
            .catch((error) =>{
                console.error(error);
            });
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

    const onCancel = () => {
        setModalVisible(false);
    }

    const onUpdate = () => {
        getTransactionsList().then();
        getCategoriesList();
        getTransactionsChartsList().then();
        getStocksChartList().then();
        getCurrencyList().then();
        getColorsList().then();
        getWalletsList().then();
    }

    useEffect(() => {
        onUpdate();
    },[]);

    props.refreshing ? onUpdate() : null;

    return (
        <View>
            <View style={styles.transactionsChart}>
                <View style={styles.headerText}>
                    <Text style={styles.titleHeaderText}>Transactions</Text>
                </View>
                <View style={styles.chartLine}>
                    <LineChart
                        isAnimated={true}
                        onDataChangeAnimationDuration={2000}
                        yAxisTextStyle={{fontSize: 10}}
                        data={lineExpenseChartData}
                        data2={lineIncomeChartData}
                        rotateLabel={true}
                        xAxisLabelTextStyle={{fontSize: 10, width: 70, marginLeft: 5, marginTop: 5}}
                        width={330}
                        height={250}
                        textFontSize={14}
                        textShiftY={-6}
                        dataPointsColor1={'#7A3EF8'}
                        dataPointsColor2={'#EB4A82'}
                        dataPointsRadius={7}
                        initialSpacing={0}
                        color1={'#7A3EF8'}
                        color2={'#EB4A82'}
                        hideRules={true}
                        noOfSections={10}
                        pressEnabled={true}
                        showStripOnPress={false}
                        showTextOnPress={true}
                        focusedDataPointShape={'circle'}
                        focusedDataPointWidth={10}
                        focusedDataPointHeight={10}
                        focusedDataPointColor={'#ff0000'}
                        focusedDataPointRadius={10}
                        dataPoint
                    />
                </View>
            </View>
            <View style={styles.stocksChart}>
                <View style={styles.headerText}>
                    <Text style={styles.titleHeaderText}>Stocks</Text>
                </View>
                <View style={styles.chartContainer}>
                    <BarChart
                        data={barChartData}
                        disableScroll={true}
                        width={330}
                        height={280}
                        spacing={10}
                        initialSpacing={20}
                        frontColor={'#3e68d1'}
                        barWidth={300 / barChartData.length - 10}
                        hideRules={true}
                        noOfSections={10}
                        pressEnabled={true}
                        rotateLabel={true}
                        labelWidth={75}
                        xAxisLabelWidth={80}
                        xAxisLabelTextStyle={{fontSize: 10, height: 90, width: 80, paddingTop: 70, marginLeft: 35}}
                        yAxisTextStyle={{fontSize: 8}}
                    />
                </View>
                <View style={styles.filterPeriod}>
                    <TouchableOpacity style={styles.periodButton} onPress={() => {
                        setOneWeek(true);
                        setOneMonth(false);
                        setThreeMonths(false);
                        setOneYear(false);
                        setPeriod('7d');
                        getStocksChartList('7d').then();
                    }
                    }>
                        <Text style={oneWeek ? styles.periodButtonActive : styles.periodButtonInactive}>1W</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.periodButton} onPress={() => {
                        setOneWeek(false);
                        setOneMonth(true);
                        setThreeMonths(false);
                        setOneYear(false);
                        setPeriod('1mo');
                        getStocksChartList('1mo').then();
                    }
                    }>
                        <Text style={oneMonth ? styles.periodButtonActive : styles.periodButtonInactive}>1M</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.periodButton} onPress={() => {
                        setOneWeek(false);
                        setOneMonth(false);
                        setThreeMonths(true);
                        setOneYear(false);
                        setPeriod('3mo');
                        getStocksChartList('3mo').then();
                    }
                    }>
                        <Text style={threeMonths ? styles.periodButtonActive : styles.periodButtonInactive}>3M</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.periodButton} onPress={() => {
                        setOneWeek(false);
                        setOneMonth(false);
                        setThreeMonths(false);
                        setOneYear(true);
                        setPeriod('1y');
                        getStocksChartList('1y').then();
                    }
                    }>
                        <Text style={oneYear ? styles.periodButtonActive : styles.periodButtonInactive}>1Y</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.walletsListPart}>
                <View style={styles.headerText}>
                    <Text style={styles.titleHeaderText}>Wallets</Text>
                </View>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsHorizontalScrollIndicator={false}>
                    <View style={styles.walletsList}>
                        {
                            wallets.length > 0 ?
                            wallets.slice(0,4).sort((a, b) => a.name > b.name ? 1 : -1).map((item) => {
                                return (
                                    <View key={item.id}>
                                        <WalletUpdateInputs
                                            walletId={item.id}
                                            name={item.name}
                                            currency={item.currency}
                                            balance={item.balance}
                                            goal={item.goal}
                                            color={item.color}
                                            lastUpdated={new Date(item.lastUpdated).toLocaleString()}
                                            currencyList={currencyList}
                                            colorsList={colorList}
                                            key={item.name}
                                            onDeleted={() => deleteWallet().then()}
                                            onWalletList={() => getWalletsList().then()}
                                        />
                                    </View>
                                )
                            }) : null
                        }
                    </View>
                </ScrollView>
            </View>
            <View style={styles.transactionsContainer}>
                <View style={styles.headerText}>
                    <Text style={styles.titleHeaderText}>Transactions</Text>
                </View>
                <GestureRecognizer
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
                <ScrollView showsHorizontalScrollIndicator={false}>
                    <View style={styles.transactionsList}>
                        {
                            transactions.slice(0,3).map((transaction) => (
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
                                                    format(new Date(transaction.createdAt).getTime(), dateFormat)
                                                }
                                            </Text>
                                        </View>
                                        <View style={styles.transactionAmount}>
                                            <Text style={styles.transactionText}>
                                                {
                                                    transaction.sourceAmount !== null && transaction.targetAmount === null
                                                        ?
                                                        <Text>
                                                            {
                                                                currencyFormat === 'left' ? getSymbolFromCurrency(transaction.sourceWallet.currency) + ' ' + ReduceFriendlyNumbers(transaction.sourceAmount, 1) :
                                                                    ReduceFriendlyNumbers(transaction.sourceAmount, 1) + ' ' + getSymbolFromCurrency(transaction.sourceWallet.currency)
                                                            }
                                                        </Text>
                                                        : transaction.sourceAmount === null && transaction.targetAmount !== null
                                                            ?
                                                            <Text>
                                                                {
                                                                    currencyFormat === 'left' ? getSymbolFromCurrency(transaction.targetWallet.currency) + ' ' + ReduceFriendlyNumbers(transaction.targetAmount, 1) :
                                                                        ReduceFriendlyNumbers(transaction.targetAmount, 1) + ' ' + getSymbolFromCurrency(transaction.targetWallet.currency)
                                                                }
                                                            </Text>

                                                            : <View style={styles.amountTransfer}>
                                                                <Text style={styles.transactionText}>
                                                                    {
                                                                        currencyFormat === 'left' ? getSymbolFromCurrency(transaction.sourceWallet.currency) + ' ' + ReduceFriendlyNumbers(transaction.sourceAmount, 1) :
                                                                            ReduceFriendlyNumbers(transaction.sourceAmount, 1) + ' ' + getSymbolFromCurrency(transaction.sourceWallet.currency)
                                                                    }
                                                                </Text>
                                                                <MaterialIcons name="arrow-downward" size={20} color='#000' />
                                                                <Text style={styles.transactionText}>
                                                                    {
                                                                        currencyFormat === 'left' ? getSymbolFromCurrency(transaction.targetWallet.currency) + ' ' + ReduceFriendlyNumbers(transaction.targetAmount, 1) :
                                                                            ReduceFriendlyNumbers(transaction.targetAmount, 1) + ' ' + getSymbolFromCurrency(transaction.targetWallet.currency)
                                                                    }
                                                                </Text>
                                                            </View>
                                                }
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
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
    titleHeaderText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
    },
    transactionsChart: {
        width: '100%',
    },
    chartLine: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10,
        paddingBottom: 40,
    },
    chartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10,
    },
    walletsList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    walletDeleteBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
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
    transactionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: '#ececec',
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
        marginLeft: -30,
    },
    transactionText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    transactionCategory: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionCategoryIcon: {
        padding: 5,
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
        width: 140,
        marginLeft: 15,
        alignItems: 'center',
    },
    transactionTime: {
        color: '#7D848FFF',
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
    filterPeriod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginTop: 40,
        marginLeft: 20,
        marginRight: 20,
    },
    periodButton: {
        backgroundColor: '#fff',
        color: '#7D848FFF',
        borderRadius: 10,
        width: 70,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: .5,
    },
    periodButtonInactive: {
        color: '#7D848FFF',
        fontSize: 16,
    },
    periodButtonActive: {
        backgroundColor: '#3E68D1FF',
        textAlign: 'center',
        textAlignVertical: 'center',
        width: 70,
        height: 40,
        color: '#fff',
        fontSize: 18,
        borderRadius: 10,
        fontWeight: 'bold',
    },
});