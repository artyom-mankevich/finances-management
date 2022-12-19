import {Text, View, StyleSheet, TextInput, ScrollView, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";
import {NameConstraint, NumberInputValidation} from "../wallets/WalletValidation";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import getSymbolFromCurrency from "currency-symbol-map";

export default function InvestmentInputs(props) {
    const [isDisabled, setIsDisabled] = useState(false);

    const setAsyncInvestment = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/investments/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': props.name,
                'description': props.description,
                'balance': Number(props.amount),
                'percent': Number(props.mpy),
                'currency': props.currency,
                'color': props.color,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Debt created");
            props.setName('');
            props.setDescription('');
            props.setAmount('');
            props.setMpy('');
            props.setCurrency('USD');
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const setAsyncInvestmentUpdate = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/investments/' + props.investmentId + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': props.name,
                'description': props.description,
                'balance': Number(props.amount),
                'percent': Number(props.mpy),
                'currency': props.currency,
                'color': props.color,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Investment updated");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const deleteInvestment = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/investments/' + props.investmentId + '/',{
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

    useEffect(() => {
        if (props.createElement) {
            props.setName('');
            props.setDescription('');
            props.setAmount('');
            props.setMpy('');
            props.setCurrency('USD');
        }
    },[]);

    return (
        <View style={styles.container}>
            <ScrollView
                style={{width: 300}}
                showsVerticalScrollIndicator={false}
                >
                <View style={styles.inputInfo}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Info</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Name"
                            onChangeText={text => props.setName(NameConstraint(text))}
                            value={props.name ? props.name : ''}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Description"
                            onChangeText={text => props.setDescription(NameConstraint(text))}
                            value={props.description ? props.description : ''}
                        />
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
                            placeholder="Starting amount"
                            onChangeText={text => props.setAmount(NumberInputValidation(text))}
                            value={props.amount ? props.amount.toString() : ''}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputText}
                            placeholder="MPY(%)"
                            onChangeText={text => props.setMpy(NumberInputValidation(text))}
                            value={props.mpy ? props.mpy.toString() : ''}
                        />
                    </View>
                </View>
                <View style={styles.inputCurrency}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Currency</Text>
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
                                defaultButtonText={<Text style={styles.defaultButtonText}>Select Currency</Text>}
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
                <View style={styles.inputColor}>
                    {
                        props.colorList.map((color) => (
                            <TouchableOpacity
                                key={props.colorList.indexOf(color)}
                                style={{
                                    backgroundColor: color,
                                    width: 40,
                                    height: 40,
                                    borderRadius: 40,
                                    margin: 5
                                }}
                                onPress={() => props.setColor(color)}
                            />
                        ))
                    }
                </View>
                <View style={styles.btnDelete}>
                    {
                        !props.createElement &&
                        <View style={styles.deleteView}>
                            <View style={styles.walletDeleteBtn}>
                                <TouchableOpacity
                                    style={styles.walletDeleteBtnTouchableOpacity}
                                    disabled={isDisabled}
                                    onPress={() => deleteInvestment()}>
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
                    {backgroundColor: props.btnColorSet ? props.color : '#b4b4b4'}]}
                                  disabled={isDisabled} onPress={() => {
                    setIsDisabled(true);
                    props.createElement ? setAsyncInvestment().then() : setAsyncInvestmentUpdate().then();
                }}>
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
        padding: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    btnDelete: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    inputView: {
        width: 300,
        backgroundColor: '#ececec',
        borderRadius: 20,
        height: 50,
        marginBottom: 10,
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
    dropdownContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginBottom: 5,
        width: 300,
    },
    dropdownBtnStyleWallet: {
        width: 300,
        borderRadius: 20,
    },
    defaultButtonText: {
        color: '#8c8c8c',
        fontSize: 20,
    },
    inputColor: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingTop: 30,
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