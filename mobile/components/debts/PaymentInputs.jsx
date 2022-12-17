import {View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import {useState} from "react";
import {NumberInputValidation} from "../wallets/WalletValidation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function PaymentInputs(props) {
    const [debtId, setDebtId] = useState('');
    const [amount, setAmount] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);

    const setAsyncPayment = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/debts/transactions/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'id': debtId,
                'amount': Number(amount),
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Payment created");
        })
            .catch((error) => {
                console.error(error);
            })
    }

return (
    <View style={styles.container}>
        <ScrollView style={{width: 300}} showsVerticalScrollIndicator={false}>
            <View style={styles.paymentInfo}>
                <View style={styles.titleInfo}>
                    <Text style={styles.title}>Info</Text>
                </View>
                <View style={styles.dropdownContainer}>
                    <View style={styles.selectedContainer}>
                        <SelectDropdown
                            data={props.debts.map((debt) => (debt.name))}
                            onSelect={(selectedItem, index) => {
                                props.debts.map((item) => {
                                    if (item.name === selectedItem) {
                                        setDebtId(item.id);
                                    }
                                })
                            }}
                            defaultValue={props.debts.name}
                            defaultButtonText={<Text style={styles.defaultButtonText}>{props.debts[0].name}</Text>}
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
                <View style={styles.inputAmount}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Amount</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputText}
                            placeholder="Amount"
                            onChangeText={text =>
                            {
                                setAmount(Number(NumberInputValidation(text)));
                            }}
                            value={Number(amount)}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
        <View style={styles.modalSubmit}>
            <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel}>
                <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.createWalletBtn,
                {backgroundColor: amount ? '#3e68d1' : '#b4b4b4'}]}
                              disabled={isDisabled} onPress={() => {
                                  setIsDisabled(true);
                                  isDisabled ? setAsyncPayment().then() : null;
            }}>
                <Text style={{fontSize: 22}}>{"Add payment"}</Text>
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
    titleInfo: {
        padding: 20,
    },
    title: {
        fontSize: 22,

        fontWeight: 'bold',
    }
});