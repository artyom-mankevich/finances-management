import {useEffect, useState} from "react";
import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {ReduceFriendlyNumbers} from "../wallets/WalletValidation";
import { BarChart, LineChart } from "react-native-gifted-charts";
import CategoryIcons from "../transactions/categories/CategoryIcons";


export default function AnalyticsList(props) {
    const [currentBalancesSum, setCurrentBalancesSum] = useState('');
    const [barChartData, setBarChartData] = useState([]);
    const [lineIncomeChartData, setLineIncomeChartData] = useState([]);
    const [lineExpenseChartData, setLineExpenseChartData] = useState([]);
    const [data, setData] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [totalIncomes, setTotalIncomes] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState('');
    const [oneWeek, setOneWeek] = useState(true);
    const [oneMonth, setOneMonth] = useState(false);
    const [threeMonths, setThreeMonths] = useState(false);
    const [oneYear, setOneYear] = useState(false);
    const [period, setPeriod] = useState('7d');
    const [dateFormat, setDateFormat] = useState('d MMMM y');
    const [currencyFormat, setCurrencyFormat] = useState('left');


    const getWalletsChartsList = async (period) => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/wallets/chart-data/?period=' + period,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setCurrentBalancesSum(responseJson.currentBalancesSum);
                let barChartDataTmp = [];
                for (let i = 0; i < responseJson.data.dates.length; i++) {
                    barChartDataTmp.push({
                        value: responseJson.data.balances[i],
                        label: responseJson.data.dates[i],
                    })
                    setBarChartData(barChartDataTmp);
                }
                setData(responseJson.data);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const getTransactionsChartsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const dateFormat = await AsyncStorage.getItem('dateFormat');
        setDateFormat(dateFormat);
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
                console.log("responseJson", responseJson);
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
                console.log(lineIncomeChartData);
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

    const getTransactionsTop = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/transaction-categories/top/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setIncomes(responseJson.incomes.data);
                setTotalIncomes(responseJson.incomes.total);
                setExpenses(responseJson.expenses.data);
                setTotalExpenses(responseJson.expenses.total);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const onUpdate = () => {
        getWalletsChartsList(period);
        getTransactionsTop();
        getTransactionsChartsList()
    }


    useEffect(() => {
        onUpdate();
    }, []);

    props.refreshing ? onUpdate() : null;

    return (
        <View>

            <View style={styles.chart}>
                <View style={styles.headerText}>
                    <Text style={styles.incomeTopText}>Wallets</Text>
                    <Text style={styles.incomeTopText}>{ReduceFriendlyNumbers(currentBalancesSum, 1)}</Text>
                </View>
                <View style={styles.chartBar}>
                    <BarChart
                        isAnimated={true}
                        onDataChangeAnimationDuration={2000}
                        yAxisTextStyle={{fontSize: 10}}
                        data={barChartData}
                        barStyle={styles.barStyle}
                        disableScroll={true}
                        width={330}
                        height={250}
                        spacing={30}
                        initialSpacing={30}
                        frontColor={'#3e68d1'}
                        barWidth={300 / barChartData.length - 30}
                        hideRules={true}
                        noOfSections={10}
                    />
                </View>
                <View style={styles.filterPeriod}>
                    <TouchableOpacity style={styles.periodButton} onPress={() => {
                        setOneWeek(true);
                        setOneMonth(false);
                        setThreeMonths(false);
                        setOneYear(false);
                        setPeriod('7d');
                        getWalletsChartsList('7d').then();
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
                        getWalletsChartsList('1mo').then();
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
                        getWalletsChartsList('3mo').then();
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
                        getWalletsChartsList('1y').then();
                    }
                    }>
                        <Text style={oneYear ? styles.periodButtonActive : styles.periodButtonInactive}>1Y</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.incomeTopText}>Transactions</Text>
                </View>
                <View style={styles.chartLine}>
                    <LineChart
                        isAnimated={true}
                        onDataChangeAnimationDuration={2000}
                        yAxisTextStyle={{fontSize: 10}}
                        data={lineExpenseChartData}
                        data2={lineIncomeChartData}
                        rotateLabel={true}
                        xAxisLabelTextStyle={{fontSize: 12, width: 70}}
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
                <View style={styles.chartTop}>
                    <Text style={styles.chartTopCategories}>Top Categories</Text>
                </View>
                <View style={{paddingTop: 10}}>
                    <View style={styles.incomeTopHeader}>
                        <Text style={styles.incomeTopText}>Income</Text>
                        <Text style={styles.incomeTopText}>
                            {
                            currencyFormat === 'left' ? '$ ' + ReduceFriendlyNumbers(totalIncomes, 1) :
                                ReduceFriendlyNumbers(totalIncomes, 1) + ' $'
                            }
                        </Text>
                    </View>
                    <View style={styles.incomeTopBody}>
                        {
                            incomes.map((income, index) => {
                                return (
                                    <View key={index} style={styles.incomeTopItem}>
                                        <View style={styles.incomeIconName}>
                                            <View style={styles.incomeTopItemIcon}>
                                                <CategoryIcons item={income.icon} size={35} color={income.color} selectedIcon={income.icon}/>
                                            </View>
                                            <Text style={styles.incomeTopItemName}>{income.name}</Text>
                                        </View>
                                        <Text style={styles.incomeTopItemValue}>{
                                            currencyFormat === 'left' ? '$ ' + ReduceFriendlyNumbers(income.total, 1) :
                                                ReduceFriendlyNumbers(income.total, 1) + ' $'
                                        }
                                        </Text>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View>
                <View style={{paddingTop: 30, paddingBottom: 20}}>
                    <View style={styles.incomeTopHeader}>
                        <Text style={styles.incomeTopText}>Expense</Text>
                        <Text style={styles.incomeTopText}>
                            {
                            currencyFormat === 'left' ? '$ ' + ReduceFriendlyNumbers(totalExpenses, 1) :
                                ReduceFriendlyNumbers(totalExpenses, 1) + ' $'
                            }
                        </Text>
                    </View>
                    <View style={styles.incomeTopBody}>
                        {
                            expenses.map((expense, index) => {
                                return (
                                    <View key={index} style={styles.incomeTopItem}>
                                        <View style={styles.incomeIconName}>
                                            <View style={styles.incomeTopItemIcon}>
                                                <CategoryIcons item={expense.icon} size={35} color={expense.color} selectedIcon={expense.icon}/>
                                            </View>
                                            <Text style={styles.incomeTopItemName}>{expense.name}</Text>
                                        </View>
                                        <Text style={styles.incomeTopItemValue}>
                                            {
                                            currencyFormat === 'left' ? '$ ' + ReduceFriendlyNumbers(expense.total, 1) :
                                                ReduceFriendlyNumbers(expense.total, 1) + ' $'
                                            }
                                        </Text>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
    },
    chartBar: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10,
        paddingRight: 15,
    },
    chartLine: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10,
    },
    filterPeriod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
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
    chartTop: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    chartTopCategories: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    incomeTopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 5,
    },
    incomeTopText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    incomeTopBody: {
        paddingLeft: 30,
    },
    incomeTopItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    incomeIconName: {
        flexDirection: 'row',
    },
    incomeTopItemName: {
        paddingLeft: 30,
        fontSize: 18,
        paddingTop: 5,
    },
    incomeTopItemValue: {
        fontSize: 18,
        paddingTop: 5,
        paddingRight: 30,
    }
});