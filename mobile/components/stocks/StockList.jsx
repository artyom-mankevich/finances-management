import {Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking, StatusBar} from "react-native";
import StockInputs from "./StockInputs";
import {useEffect, useState} from "react";
import {ReduceFriendlyNumbers} from "../wallets/WalletValidation";
import Modal from "react-native-modal";
import GestureRecognizer from "react-native-swipe-gestures";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {BarChart} from "react-native-gifted-charts";
import {AntDesign, FontAwesome, MaterialIcons} from "@expo/vector-icons";
import {MultiSelect} from "react-native-element-dropdown";


export default function StockList(props) {
    const [modalVisibleStock, setModalVisibleStock] = useState(false);
    const [barChartData, setBarChartData] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [data, setData] = useState([]);
    const [onBtnCreate, setOnBtnCreate] = useState(true);
    const [ticker, setTicker] = useState('');
    const [shares, setShares] = useState('');
    const [stockCount, setStockCount] = useState(0);
    const [stockNext, setStockNext] = useState('');
    const [oneWeek, setOneWeek] = useState(true);
    const [oneMonth, setOneMonth] = useState(false);
    const [threeMonths, setThreeMonths] = useState(false);
    const [oneYear, setOneYear] = useState(false);
    const [news, setNews] = useState([]);
    const [period, setPeriod] = useState('7d');
    const [currencyFormat, setCurrencyFormat] = useState('left');
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [tickersFilter, setTickersFilter] = useState([]);

    const renderDataItem = (item) => {
        return (
            <View style={styles.item}>
                <Text style={styles.selectedTextStyle}>{item.label}</Text>
            </View>
        );
    };

    const getStocksList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const currencFormat = await AsyncStorage.getItem('currencyFormat');
        setCurrencyFormat(currencFormat);
        return await fetch(ngrokConfig.myUrl + '/v2/stocks/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setStockCount(responseJson.count);
                responseJson.count > 5 ? setStockNext(responseJson.next.toString()) : setStockNext('');
                setStocks(JSON.parse(JSON.stringify(responseJson.results)));
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getStocksListNext = async() => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(stockNext.replace('http', 'https'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }

        })
            .then((response) => response.json())
            .then((responseJson) => {
                setStocks(stocks.concat(responseJson.results));
                setStockCount(stockCount - 5);
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getStocksChartList = async (period) => {
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

    const getStockNews = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/news/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setNews(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getStockNewsFilter = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/news-filters/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setTickersFilter(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const getStockNewsLanguages = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/news-languages/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let languagesTmp = [];
                for (let i = 0; i < responseJson.length; i++) {
                    languagesTmp.push({
                        label: responseJson[i].code,
                        value: responseJson[i].code,
                    })
                    setLanguages(languagesTmp);
                }
                //setNews(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    }

    const setAsyncNewsFiltersUpdate = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/news-filters/' + tickersFilter.id + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'tickers': tickersFilter.tickers,
                'languages': selectedLanguages,
            })
        }).then((response) => {
            onUpdate();
            console.log("News filters updated");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const onCancel = () => {
        setModalVisibleStock(false);
        setTicker('');
        setShares('');
    }

    const onUpdate = async () => {
        getStockNewsLanguages().then();
        getStockNewsFilter().then();
        getStockNews().then();
        setModalVisibleStock(false);
        getStocksList().then();
        getStocksChartList(period).then();
    }

    useEffect(() => {
        onUpdate().then();
    }, []);

    props.refreshing ? getStocksList() && getStockNews() : null;

    const btnColorSetTicker = ticker && shares;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <GestureRecognizer
                    onSwipeLeft={() => setModalVisibleStock(false)}
                    onSwipeRight={() => setModalVisibleStock(false)}
                >
                    <Modal
                        isVisible={modalVisibleStock}
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
                            <StockInputs
                                ticker={ticker}
                                setTicker={setTicker}
                                shares={shares}
                                setShares={setShares}
                                onUpdate={onUpdate}
                                onCancel={onCancel}
                                btnColorSetTicker={btnColorSetTicker}
                                createElement={onBtnCreate}
                            />
                        </View>
                    </Modal>
                </GestureRecognizer>
                <View style={styles.modalBtnContainer}>
                    <View style={styles.addStocksView}>
                        <TouchableOpacity
                            style={[styles.addStockBtn, {width: 140, backgroundColor: '#555994'}]}
                            onPress={() => {
                                setModalVisibleStock(true);
                            }}
                        >
                            <Text style={styles.addDebtText}>Add Stock</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
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
                <View style={styles.filterContainer}>
                    <View style={styles.multiContainer}>
                        <MultiSelect
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            data={languages}
                            labelField="label"
                            valueField="value"
                            placeholder="Add news filter"
                            value={selectedLanguages}
                            search
                            searchPlaceholder="Search..."
                            onChange={item => {

                                setSelectedLanguages(item);
                                setAsyncNewsFiltersUpdate().then();
                            }}
                            renderLeftIcon={() => (
                                <FontAwesome
                                    style={styles.icon}
                                    color="black"
                                    name="language"
                                    size={20}
                                />
                            )}
                            renderItem={renderDataItem}
                            renderSelectedItem={(item, unSelect) => (
                                <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                                    <View style={styles.selectedStyle}>
                                        <Text style={styles.textSelectedStyle}>{item.label}</Text>
                                        <AntDesign color="black" name="delete" size={17} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        <StatusBar />
                    </View>
                </View>
                <View style={styles.news}>
                    <View style={styles.newsHeader}>
                        <Text style={styles.newsHeaderText}>News</Text>
                    </View>
                    <View style={styles.newsBodyContainer}>
                        <View style={styles.newsContainer}>
                            {
                                news.map((item, index) => {
                                    return (
                                        <View key={index} style={styles.newItem}>
                                            <View style={styles.newItemHeader}>
                                                <Text style={styles.newItemTitle}>{item.title}</Text>
                                            </View>
                                            <View style={styles.newItemBody}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Linking.openURL(item.url);
                                                    }
                                                }>
                                                    <View style={styles.newItemBodyContainer}>
                                                        <Text style={styles.newItemLinkText}>See All</Text>
                                                        <MaterialIcons name={"chevron-right"} size={20} color={'#3e68d1'}/>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )})
                            }
                        </View>
                    </View>
                </View>
                <View style={styles.stocksContainer}>
                    {
                        stocks.map((stock, index) => (
                            <View key={index} style={styles.stockItem}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisibleStock(true);
                                        setTicker(stock.ticker);
                                        setShares(stock.amount);
                                        setOnBtnCreate(false);
                                        AsyncStorage.setItem('stockId', stock.id).then();
                                    }}
                                >
                                    <View style={styles.listItemView}>
                                        <View style={styles.listItemViewText}>
                                            <Text style={styles.listItemTicker}>{stock.ticker}</Text>
                                            <Text style={styles.listItemAmount}>{stock.amount}</Text>
                                        </View>
                                        <View style={styles.listItemViewPrice}>
                                            <Text style={styles.listItemPrice}>
                                                {
                                                    currencyFormat === 'left' ? '$ ' + ReduceFriendlyNumbers(stock.price, 1) : ReduceFriendlyNumbers(stock.price, 1) + ' $'
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))
                    }
                </View>
                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10}}>
                    {
                        stockCount > 5 &&
                        <View style={styles.loadMoreContainer}>
                            <TouchableOpacity
                                style={styles.loadMoreBtn}
                                onPress={() => {
                                    getStocksListNext().then();
                                }}
                            >
                                <Text style={styles.loadMoreText}>Show more</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                <View style={styles.newsContainer}>

                </View>
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    stocksContainer: {
        flex: 1,
        alignItems: 'center',
    },
    newsContainer: {
        width: '85%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,

    },
    newsBodyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    newsHeader: {
        paddingLeft: 50,
        paddingTop: 10,
    },
    newsHeaderText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    newItemLinkText: {
        fontSize: 16,
        color: '#3e68d1',
    },
    newItemTitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    newItemHeader: {
        marginLeft: 10,
    },
    newItemBodyContainer: {
        flexDirection: 'row',
        marginLeft: 10,
        alignItems: 'center',
    },
    stockItem: {
        width: '90%',
        padding: 10,
    },
    listItemView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    listItemTicker: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
    },
    listItemAmount: {
        fontSize: 16,
        color: '#000',
    },
    listItemViewPrice: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 50,
        backgroundColor: '#555994',
        borderRadius: 10,
    },
    listItemPrice: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
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
    chartBar: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10,
        paddingRight: 15,
    },
    chartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 10,
    },
    loadMoreText: {
        color: '#3E68D1FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        width: 370,
        height: 400,
    },
    addStocksView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 15,
    },
    modalBtnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    addStockBtn: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    addDebtText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
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
    multiContainer: {
        width: '100%',
        paddingTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flex:1
    },
    dropdown: {
        width: 250,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
    },
    placeholderStyle: {
        paddingLeft: 30,
        fontSize: 16,
        color: '#7D848FFF',
    },
    selectedTextStyle: {
        fontSize: 14,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    icon: {
        marginRight: 5,
    },
    item: {
        padding: 17,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: 'white',
        shadowColor: '#000',
        marginTop: 8,
        marginRight: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,

        elevation: 2,
    },
    textSelectedStyle: {
        marginRight: 5,
        fontSize: 16,
    },
});