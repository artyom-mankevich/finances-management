import {View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity} from "react-native";
import {useState} from "react";
import {NameConstraint} from "../wallets/WalletValidation";
import {MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function CryptoWalletInputs(props) {
    const [isDisabled, setIsDisabled] = useState(false);

    const setAsyncCryptoWallet = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/eth-keys/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'address': props.address,
                'privateKey': props.privateKey,
                'password': props.encryptedPrivateKey,
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Crypto Wallet created");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{width: 300}} showsVerticalScrollIndicator={false}>
                <View style={styles.inputInfo}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Wallet Information</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Address"
                            onChangeText={text => props.setAddress(NameConstraint(text))}
                            value={props.address ? props.address : ''}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            secureTextEntry={true}
                            style={styles.inputText}
                            placeholder="Private Key"
                            onChangeText={text => props.setPrivateKey(NameConstraint(text))}
                            value={props.privateKey ? props.privateKey : ''}
                        />
                    </View>
                </View>
                <View style={styles.inputTitle}>
                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>Encryption key</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            secureTextEntry={true}
                            style={styles.inputText}
                            placeholder="Password"
                            onChangeText={text => props.setEncryptedPrivateKey(NameConstraint(text))}
                            value={props.encryptedPrivateKey ? props.encryptedPrivateKey : ''}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.modalSubmit}>
                <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel}>
                    <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.createWalletBtn, {backgroundColor: props.btnColorSet ? '#3e68d1' : '#b4b4b4'}]}
                    disabled={props.btnColorSet ? isDisabled : true}
                    onPress={() => {
                        setIsDisabled(true);
                        setAsyncCryptoWallet().then();
                    }}
                >
                    <Text style={{fontSize: 22}}>{"Add Wallet"}</Text>
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