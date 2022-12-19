import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import SelectDropdown from "react-native-select-dropdown";
import {FontAwesome} from "@expo/vector-icons";
import {format} from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function Setting(props) {
    const [onClickSave, setOnClickSave] = useState(false);
    const [accountId, setAccountId] = useState('');
    const [dateFormats, setDateFormats] = useState([]);
    const [selectedDateFormat, setSelectedDateFormat] = useState('d MMMM y');
    const [currencyList, setCurrencyList] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [currencyFormat, setCurrencyFormat] = useState('left');
    const [startingPages, setStartingPages] = useState([]);
    const [selectedStartingPage, setSelectedStartingPage] = useState('Overview');


    const getAccountSettingList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/account-settings/',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setAccountId(responseJson.id);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const setAsyncAccountSetting = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/account-settings/' + accountId + '/',{
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'dateFormat': setSelectedDateFormat,
                'mainCurrency': selectedCurrency,
                'currencyFormat': currencyFormat,
                'startPage': selectedStartingPage,
            })
        }).then((response) => {
            response.json()
        })
            .catch((error) => {
                console.error(error);
            })}

    const getDateFormat = () => {
        let dateFormats = [];
        const timestamp = new Date().getTime();
        dateFormats.push({label: format(timestamp, 'd MMMM y'), value: 'd MMMM y'});
        dateFormats.push({label: format(timestamp, 'MMM d y'), value: 'MMM d y'});
        dateFormats.push({label: format(timestamp, 'dd.MM.yyyy'), value: 'dd.MM.yyyy'});
        dateFormats.push({label: format(timestamp, 'dd/MM/yyyy'), value: 'dd/MM/yyyy'});
        dateFormats.push({label: format(timestamp, 'MM/dd/yyyy'), value: 'MM/dd/yyyy'});
        setDateFormats(dateFormats);
    }

    const getStartingPages = () => {
        let startingPage = [];
        startingPage.push({label: 'Overview', value: 'Overview'});
        startingPage.push({label: 'Transactions', value: 'Transactions'});
        startingPage.push({label: 'Wallets', value: 'Wallets'});
        startingPage.push({label: 'Analytics', value: 'Analytics'});
        startingPage.push({label: 'Stocks', value: 'Stocks'});
        startingPage.push({label: 'Investments', value: 'Investments'});
        startingPage.push({label: 'Debts', value: 'Debts'});
        startingPage.push({label: 'Crypto', value: 'Crypto'});
        setStartingPages(startingPage);
    }

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

    const setSelectedFormat = async (format) => {
        await AsyncStorage.setItem('dateFormat', format);
    }

    const setSelectedCurrencyType = async (currency) => {
        await AsyncStorage.setItem('currencyDefault', currency);
    }

    const setSelectedCurrencyFormat = async (format) => {
        await AsyncStorage.setItem('currencyFormat', format);
    }

    const setSelectedStartingPageType = async (page) => {
        await AsyncStorage.setItem('startingPage', page);
    }

    const onLoadPage = () => {
        getAccountSettingList().then();
        getStartingPages();
        getDateFormat();
        getCurrencyList().then();
    }

    useEffect(() => {
        onLoadPage();
    },[]);

    return (
        <View style={styles.container}>
            <View style={styles.setting}>
                <View style={styles.settingDateFormat}>
                    <View style={styles.settingDateFormatLabel}>
                        <Text style={styles.settingDateFormatLabelText}>Date Format</Text>
                    </View>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.selectedContainer}>
                            <SelectDropdown
                                data={
                                    dateFormats.map((item) => (
                                        item.label
                                    ))
                                }
                                onSelect={(selectedItem, index) => {
                                    setSelectedDateFormat(dateFormats[index].value);
                                    setOnClickSave(false);
                                }}
                                defaultValue={'d MMMM y'}
                                defaultButtonText={<Text style={styles.defaultButtonText}>{format(new Date().getTime(), 'd MMMM y')}</Text>}
                                buttonTextAfterSelection={(selectedItem, index) => (selectedItem)}
                                rowTextForSelection={(item, index) => (item)}
                                buttonStyle={styles.dropdownBtnStyleWallet}
                                buttonTextStyle={styles.dropdownBtnTxtStyle}
                                renderDropdownIcon={isOpened => (
                                    <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={14} />
                                )}
                                dropdownIconPosition={'right'}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.settingDateFormat}>
                    <View style={styles.settingDateFormatLabel}>
                        <Text style={styles.settingDateFormatLabelText}>Main Currency</Text>
                    </View>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.selectedContainer}>
                            <SelectDropdown
                                data={
                                    currencyList.map((currency) => (
                                        currency.code + ' ' + currency.name
                                    ))
                                }
                                onSelect={(selectedItem, index) => {
                                    currencyList.map((currency) => {
                                        if (currency.code.toLowerCase() === selectedItem.substring(0, 3).toLowerCase()) {
                                            setSelectedCurrency(currency.code);
                                            setOnClickSave(false);
                                        }
                                    })
                                }}
                                defaultValue={'USD'}
                                defaultButtonText={<Text style={styles.defaultButtonText}>USD United States Dollar</Text>}
                                buttonTextAfterSelection={(selectedItem, index) => (selectedItem)}
                                rowTextForSelection={(item, index) => (item)}
                                buttonStyle={styles.dropdownBtnStyleWallet}
                                buttonTextStyle={styles.dropdownBtnTxtStyle}
                                renderDropdownIcon={isOpened => (
                                    <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={14} />
                                )}
                                dropdownIconPosition={'right'}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.settingDateFormat}>
                    <View style={styles.settingDateFormatLabel}>
                        <Text style={styles.settingDateFormatLabelText}>Currency Format</Text>
                    </View>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.selectedContainer}>
                            <SelectDropdown
                                data={
                                    ['left', 'right']
                                }
                                onSelect={(selectedItem, index) => {
                                    setCurrencyFormat(selectedItem);
                                    setOnClickSave(false);
                                }}
                                defaultValue={'left'}
                                defaultButtonText={<Text style={styles.defaultButtonText}>left</Text>}
                                buttonTextAfterSelection={(selectedItem, index) => (selectedItem)}
                                rowTextForSelection={(item, index) => (item)}
                                buttonStyle={styles.dropdownBtnStyleWallet}
                                buttonTextStyle={styles.dropdownBtnTxtStyle}
                                renderDropdownIcon={isOpened => (
                                    <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={14} />
                                )}
                                dropdownIconPosition={'right'}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.settingDateFormat}>
                    <View style={styles.settingDateFormatLabel}>
                        <Text style={styles.settingDateFormatLabelText}>Starting Page</Text>
                    </View>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.selectedContainer}>
                            <SelectDropdown
                                data={
                                    startingPages.map((item) => (
                                        item.label
                                    ))
                                }
                                onSelect={(selectedItem, index) => {
                                    setSelectedStartingPage(selectedItem);
                                    setOnClickSave(false);
                                }}
                                defaultValue={'Overview'}
                                defaultButtonText={<Text style={styles.defaultButtonText}>Overview</Text>}
                                buttonTextAfterSelection={(selectedItem, index) => (selectedItem)}
                                rowTextForSelection={(item, index) => (item)}
                                buttonStyle={styles.dropdownBtnStyleWallet}
                                buttonTextStyle={styles.dropdownBtnTxtStyle}
                                renderDropdownIcon={isOpened => (
                                    <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={14} />
                                )}
                                dropdownIconPosition={'right'}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.addSettingView}>
                    <TouchableOpacity
                        style={[styles.addSettingBtn, !onClickSave ? {backgroundColor: '#3e68d1'} : {backgroundColor: '#e0e0e0'}]}
                        disabled={onClickSave}
                        onPress={() => {
                            setSelectedFormat(selectedDateFormat).then();
                            setSelectedCurrencyType(selectedCurrency).then();
                            setSelectedCurrencyFormat(currencyFormat).then();
                            setSelectedStartingPageType(selectedStartingPage).then();
                            setAsyncAccountSetting().then();
                            setOnClickSave(true);
                        }}
                    >
                        <Text style={styles.addSettingText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    settingDateFormat: {
        justifyContent: 'center',
    },
    settingDateFormatLabel: {
        padding: 20,
        paddingLeft: 60,
    },
    settingDateFormatLabelText: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
    },
    dropdownContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 10,
        marginBottom: 5,
        width: 300,
    },
    defaultButtonText: {
        color: '#676767',
        fontSize: 20,
    },
    dropdownBtnStyleWallet: {
        width: 300,
        borderRadius: 10,
        backgroundColor: '#d7d7d7',
    },
    addSettingView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 15,
    },
    addSettingBtn: {
        width: 160,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    addSettingText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});