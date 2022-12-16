import {useState} from "react";
import {View, StyleSheet, TextInput, Text, TouchableOpacity} from "react-native";
import {NameConstraint, NumberInputValidation} from "../../wallets/WalletValidation";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";

export default function TransferTransaction(props) {
    const [sourceAmount, setSourceAmount] = useState(props.sourceAmount ? props.sourceAmount : '');
    const [targetAmount, setTargetAmount] = useState(props.targetAmount ? props.targetAmount : '');
    const [wallets, setWallets] = useState(props.wallets);
    const [sourceWallet, setSourceWallet] = useState(props.sourceWallet ? props.sourceWallet : '');
    const [targetWallet, setTargetWallet] = useState(props.targetWallet ? props.targetWallet : '');
    const [description, setDescription] = useState(props.description ? props.description : '');
    const [color, setColor] = useState(props.color);

    const setAsyncTransfer = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transactions/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'sourceAmount': sourceAmount,
                'targetAmount': targetAmount,
                'sourceWallet': sourceWallet.id,
                'targetWallet': targetWallet.id,
                'description': description,
            })
        }).then((response) => {
            props.onUpdated();
            console.log("Transaction expense created");
            response.json()
        })
            .catch((error) => {
                console.error(error);
            })}

    const setAsyncUpdateTransfer = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transactions/' + props.transactionId + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'sourceAmount': sourceAmount,
                'targetAmount': targetAmount,
                'sourceWallet': sourceWallet.id,
                'targetWallet': targetWallet.id,
                'description': description,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Transaction expense created");
            response.json()
        })
            .catch((error) => {
                console.error(error);
            })}

    const onSubmit = () => {
        setAsyncTransfer().then();
        setDescription('');
        setSourceAmount('');
        setTargetAmount('');
        props.onCancel();
    }

    const onUpdated = () => {
        setAsyncUpdateTransfer().then();
        props.onCancel();
    }

    const btnColorSet = sourceAmount && targetAmount && sourceWallet && targetWallet;

    return (
        <View>
            <View style={{paddingLeft:10, backgroundColor:'#fff'}}>
                <Text style={styles.amountText}>Amount</Text>
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.amountInput}>
                        <TextInput
                            numberOfLines={1}
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputAmount}
                            placeholder="Source Amount"
                            onChangeText={text => setSourceAmount(NumberInputValidation(text))}
                            value={sourceAmount.toString()}
                        />
                    </View>
                        <View style={styles.arrowRight}>
                            <MaterialIcons name={"arrow-forward"} size={30} color={'#000'}/>
                        </View>
                    <View style={styles.amountInput}>
                        <TextInput
                            numberOfLines={1}
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputAmount}
                            placeholder="Target Amount"
                            onChangeText={text => setTargetAmount(NumberInputValidation(text))}
                            value={targetAmount.toString()}
                        />
                    </View>
                </View>
                <View style={styles.infoExpense}>
                    <Text style={styles.walletInfo}>Wallet</Text>
                </View>
                <View style={styles.selectData}>
                    <View>
                        <SelectDropdown
                            data={wallets.map((item) => (
                                item.name !== targetWallet.name && item.name !== sourceWallet.name ? item.name : null
                            ))}
                            onSelect={(selectedItem, index) => {
                                wallets.map((item) => {
                                    if (item.name === selectedItem) {
                                        setSourceWallet(item);
                                    }
                                })
                                console.log(selectedItem);
                            }}
                            defaultButtonText={
                                <Text style={[props.sourceWallet ? {fontSize: 20, color: '#000'} : {fontSize: 16, color: '#7D848FFF'}]}>
                                    {props.sourceWallet ? props.sourceWallet.name : 'Select Wallet'}
                                </Text>}
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
                    <View style={styles.arrowRight}>
                        <MaterialIcons name={"arrow-forward"} size={30} color={'#000'}/>
                    </View>
                    <View style={styles.selectWalletTarget}>
                        <SelectDropdown
                            data={wallets.map((item) => (
                                item.name !== sourceWallet.name && item.name !== targetWallet.name ? item.name : null
                            ))}
                            onSelect={(selectedItem, index) => {
                                wallets.map((item) => {
                                    if (item.name === selectedItem) {
                                        setTargetWallet(item);
                                    }
                                })
                                console.log(selectedItem);
                            }}
                            defaultButtonText={
                                <Text style={[props.targetWallet ? {fontSize: 20, color: '#000'} : {fontSize: 16, color: '#7D848FFF'}]}>
                                    {props.targetWallet ? props.targetWallet.name : "Target Wallet"}
                                </Text>}
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
                <View style={styles.descriptionInputView}>
                    <TextInput
                        style={styles.inputDescription}
                        placeholder="Description (optional)"
                        onChangeText={text => setDescription(NameConstraint(text))}
                        value={description}
                    />
                </View>
            </View>
            <View style={styles.modalSubmit}>
                <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel}>
                    <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.createWalletBtn,
                    {backgroundColor: btnColorSet ? color : '#b4b4b4'}]}
                                  disabled={!btnColorSet} onPress={() => props.createElement ? onSubmit() : onUpdated()}>
                    <Text style={{fontSize: 22}}>{props.createElement ? "Create" : "Update"}</Text>
                    <MaterialIcons name="arrow-forward-ios" size={30} color='#000' />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    amountText: {
        paddingLeft: 20,
        fontSize: 24,
        fontWeight: 'bold',
    },
    amountInput: {
        width: 160,
        backgroundColor: "#ececec",
        borderRadius: 20,
        height: 50,
        marginBottom: 5,
        justifyContent: "center",
        padding: 12,
        color: '#000',
        flexWrap: 'wrap',
    },
    inputAmount: {
        fontSize: 18,
        color: '#000',
        height: 50,
        plaseholderTextColor: '#7D848FFF',
    },
    infoExpense: {
        flexDirection: "row",
        paddingLeft: 10,
    },
    walletInfo: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingLeft: 10,
    },
    selectData: {
        flexDirection: 'row',
        height: 50,
        marginBottom: 10,
    },
    dropdownBtnStyleWallet: {
        width: 160,
        borderRadius: 10,
    },
    dropdownBtnTxtStyle: {
        fontSize: 22,
    },
    defaultButtonText: {
        fontSize: 18,
        color: '#7D848FFF',
    },
    arrowRight: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    descriptionInputView: {
        width: 350,
        backgroundColor: "#ececec",
        borderRadius: 20,
        height: 50,
        marginBottom: 15,
        justifyContent: "center",
        color: '#000',
        padding: 10,
    },
    inputDescription: {
        width: 310,
        fontSize: 20,
        color: '#000',
        height: 50,
        paddingLeft: 10,
        plaseholderTextColor: '#7D848FFF',
    },
    modalSubmit: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    createWalletBtn: {
        width: '80%',
        height: 40,
        flexDirection: 'row',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomRightRadius: 30,
    },
    cancelBtn: {
        width: '20%',
        height: 40,
        backgroundColor: 'rgb(255,255,255)',
        flexDirection: 'row',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 30
    },
});
