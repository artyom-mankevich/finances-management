import {Text, View, StyleSheet, ScrollView, TextInput, TouchableOpacity} from "react-native";
import {useState} from "react";
import SelectDropdown from "react-native-select-dropdown";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import {NameConstraint, NumberInputValidation} from "../wallets/WalletValidation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function CryptoTransferInputs(props) {
    const [isDisabled, setIsDisabled] = useState(false);
    const [wallets, setWallets] = useState(props.cryptoWallets ? props.cryptoWallets : []);
    const [amount, setAmount] = useState(props.amount ? props.amount : 0);
    const [address, setAddress] = useState(props.address ? props.address : '');
    const [password, setPassword] = useState(props.encryptedPrivateKey ? props.encryptedPrivateKey : '');
    const [wallet, setWallet] = useState(props.wallet ? props.wallet : '');

    const setAsyncCryptoTransfer = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/eth-keys/transfer/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'amount': Number(amount),
                'toAddress': address,
                'ethKeysId': wallet.id,
                'password': password,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Crypto Wallet created");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const btnColorSet = amount && address && password && wallet;

    return (
        <View style={styles.container}>
            <ScrollView style={{width: 300}} showsVerticalScrollIndicator={false}>
                <View style={styles.titleInfo}>
                    <Text style={styles.title}>Wallet</Text>
                </View>
                <View style={styles.inputInfo}>
                    <View style={{paddingBottom:10}}>
                        <SelectDropdown
                            data={wallets.map((item) => (
                                item.address
                            ))}
                            onSelect={(selectedItem, index) => {
                                wallets.map((item) => {
                                    if (item.address === selectedItem) {
                                        setWallet(item);
                                    }
                                })
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
                    <View style={styles.inputView}>
                        <TextInput
                            keyboardType={'number-pad'}
                            maxLength={17}
                            style={styles.inputText}
                            placeholder="Amount (ETH)"
                            onChangeText={text =>
                            {
                                setAmount(NumberInputValidation(text));
                            }}
                            value={amount ? amount.toString() : ''}
                        />
                    </View>
                </View>
                <View style={styles.titleInfo}>
                    <Text style={styles.title}>Recipient</Text>
                </View>
                <View style={styles.inputBody}>
                    <View style={[styles.inputView, {marginBottom: 10}]}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Ethereum address"
                            onChangeText={text => setAddress(NameConstraint(text))}
                            value={address ? address : ''}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            secureTextEntry={true}
                            style={styles.inputText}
                            placeholder="Wallet password"
                            onChangeText={text => setPassword(NameConstraint(text))}
                            value={password ? password : ''}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.modalSubmit}>
                <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel}>
                    <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.createWalletBtn, {backgroundColor: btnColorSet ? '#3e68d1' : '#b4b4b4'}]}
                    disabled={btnColorSet ? isDisabled : true}
                    onPress={() => {
                        setIsDisabled(true);
                        setAsyncCryptoTransfer().then();
                    }}
                >
                    <Text style={{fontSize: 22}}>{"Submit"}</Text>
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
})