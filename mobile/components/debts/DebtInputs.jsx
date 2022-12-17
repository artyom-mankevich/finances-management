import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {NameConstraint, NumberInputValidation} from "../wallets/WalletValidation";
import SelectDropdown from "react-native-select-dropdown";
import getSymbolFromCurrency from "currency-symbol-map";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import DateTimePickerAndroid from "@react-native-community/datetimepicker";
import {useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function DebtInputs(props) {
     const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [date, setDate] = useState(new Date(props.expiresAt));

    const setAsyncDebt = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/debts/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': props.name,
                'currency': props.currency,
                'balance': props.currentAmount,
                'goal': props.finalAmount,
                'expiresAt': props.expiresAt,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Debt created");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const setAsyncDebtUpdate = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const debtId = await AsyncStorage.getItem('debtId');
        return fetch(ngrokConfig.myUrl + '/v2/debts/' + debtId + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': props.name,
                'currency': props.currency,
                'balance': props.currentAmount,
                'goal': props.finalAmount,
                'expiresAt': props.expiresAt,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Debt created");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const deleteDebt = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const debtId = await AsyncStorage.getItem('debtId');
        return fetch(ngrokConfig.myUrl + '/v2/debts/' + debtId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            props.onUpdate();
            console.log('Debt deleted');
        })
            .catch((error) => {
                console.error(error);
            })};

    return (
        <View style={styles.container}>
            <ScrollView style={{width: 300}} showsVerticalScrollIndicator={false}>
                <View style={styles.inputInfo}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Info</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Name"
                            onChangeText={text => props.setName(NameConstraint(text))}
                            value={props.name}
                        />
                    </View>
                    <View style={styles.dropdownContainer}>
                        <View style={styles.selectedContainer}>
                            <SelectDropdown
                                data={
                                    props.currencyList.map((currency) => (
                                        currency.code + ' ' + currency.name
                                    ))
                                }
                                onSelect={(selectedItem, index) => {
                                    props.currencyList.map((item) => {
                                        if (item.code.toLowerCase() === selectedItem.substring(0, 3).toLowerCase()) {
                                            props.setCurrency(item.code);
                                        }
                                    })
                                }}
                                defaultValue={getSymbolFromCurrency(props.currency.code) + ' ' + props.currency.code + ' ' + props.currency.name}
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
                <View style={styles.inputAmount}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Amount</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputText}
                            placeholder="Final Amount"
                            onChangeText={text =>
                            {
                                props.setFinalAmount(NumberInputValidation(text));
                            }}
                            value={props.finalAmount.toString()}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputText}
                            placeholder="Current value (optional)"
                            onChangeText={text =>
                            {
                                props.setCurrentAmount(NumberInputValidation(text));
                            }}
                            value={props.currentAmount.toString()}
                        />
                    </View>
                </View>
                <View style={styles.inputExpires}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Expires at</Text>
                    </View>
                    <View style={styles.inputDate}>
                        <TouchableOpacity
                            style={styles.datePicker}
                            onPress={() => setDatePickerVisibility(true)}
                        >
                            {isDatePickerVisible && (
                                <DateTimePickerAndroid
                                    value={date}
                                    mode={'date'}
                                    onChange={(event, selectedDate) => {
                                        const currentDate = selectedDate || date;
                                        setDatePickerVisibility(false);
                                        setDate(currentDate);
                                        props.setExpiresAt(currentDate);
                                    }}
                                />)
                            }
                            <View style={styles.datePickerView}>
                                <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
                                <Text style={styles.datePickerText}>{<MaterialIcons name={'calendar-today'} color={'#000'} size={20}/>}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {
                        !props.createElement &&
                        <View style={styles.deleteView}>
                            <View style={styles.walletDeleteBtn}>
                                <TouchableOpacity
                                    style={styles.walletDeleteBtnTouchableOpacity}
                                    onPress={() => deleteDebt()}>
                                    <FontAwesome name="trash" size={55} color="#930000"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                </View>
            </ScrollView>
            <View style={styles.modalSubmit}>
                <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel}>
                    <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.createWalletBtn,
                    {backgroundColor: props.btnColorSet ? '#3e68d1' : '#b4b4b4'}]}
                                  disabled={!props.btnColorSet} onPress={() => props.createElement ? setAsyncDebt().then() : setAsyncDebtUpdate()}>
                    <Text style={{fontSize: 22}}>{props.createElement ? "Create" : "Update"}</Text>
                    <MaterialIcons name="arrow-forward-ios" size={30} color='#000' />
                </TouchableOpacity>
            </View>
        </View>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D7D7D7E5',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    titleInfo: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    deleteView: {
        padding: 30,
        alignItems: 'center',
    },
    inputView: {
        width: 300,
        backgroundColor: '#ececec',
        borderRadius: 20,
        height: 50,
        marginBottom: 5,
        justifyContent: "center",
        alignSelf: 'center',
        padding: 20,
        color: '#000',
    },
    inputText: {
        height: 50,
        color: '#464646',
        fontSize: 18,
        plaseholderTextColor: '#464646',
    },
    inputDate: {
        width: 300,
        backgroundColor: '#ececec',
        borderRadius: 20,
        height: 50,
        justifyContent: "center",
        alignSelf: 'center',
        paddingLeft: 20,
    },
    datePickerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    datePicker: {
        width: 260,
        alignSelf: 'center',
        justifyContent: 'center',
        paddingRight: 20,
    },
    datePickerText: {
        fontSize: 18,
        color: '#000',
    },
    dropdownContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginBottom: 5,
        width: 300,
    },
    defaultButtonText: {
        color: '#8c8c8c',
        fontSize: 20,
    },
    dropdownBtnStyleWallet: {
        width: 300,
        borderRadius: 20,
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
        backgroundColor: 'rgba(238,238,238,0)',
        flexDirection: 'row',
        borderRadius: 5,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
});