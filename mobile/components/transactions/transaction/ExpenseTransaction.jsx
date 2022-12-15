import {useState} from "react";
import {View, StyleSheet, TextInput, Text, TouchableOpacity} from "react-native";
import {NameConstraint, NumberInputValidation} from "../../wallets/WalletValidation";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";

export default function ExpenseTransaction(props) {
    const [sourceAmount, setSourceAmount] = useState(0);
    const [wallets, setWallets] = useState(props.wallets);
    const [categories, setCategories] = useState(props.categories);
    const [wallet, setWallet] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(props.color);

    const setAsyncExpense = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transactions/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'category': category.id,
                'sourceAmount': sourceAmount,
                'sourceWallet': wallet.id,
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

    const onSubmit = () => {
        setAsyncExpense().then();
        setDescription('');
        setSourceAmount(0);
        props.onCancel();
    }

    const btnColorSet = sourceAmount && wallet && category;

    return (
        <View>
            <View style={{paddingLeft:30, backgroundColor:'#fff'}}>
            <Text style={styles.amountText}>Amount</Text>
            <View style={styles.amountInputView}>
                <TextInput
                    keyboardType={'number-pad'}
                    maxLength={17}
                    style={styles.inputAmount}
                    placeholder="Source Amount"
                    onChangeText={text => setSourceAmount(NumberInputValidation(text))}
                    value={sourceAmount}
                />
            </View>
            <View style={styles.infoExpense}>
                <Text style={styles.walletInfo}>Wallet</Text>
                <Text style={styles.categoryInfo}>Category</Text>
            </View>
            <View style={styles.selectData}>
                <View>
                    <SelectDropdown
                        data={wallets.map((item) => (
                            item.name !== wallet.name ? item.name : null
                        ))}
                        onSelect={(selectedItem, index) => {
                            wallets.map((item) => {
                                if (item.name === selectedItem) {
                                    setWallet(item);
                                }
                            })
                            console.log(selectedItem);
                        }}
                        defaultButtonText={<Text style={styles.defaultButtonText}>Source Wallet</Text>}
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
                <View style={styles.selectCategoryExponse}>
                    <SelectDropdown
                        data={categories.map((item) => (
                            item.name !== category.name ? item.name : null
                        ))}
                        onSelect={(selectedItem, index) => {
                            categories.map((item) => {
                                if (item.name === selectedItem) {
                                    setCategory(item);
                                }
                            })
                            console.log(selectedItem);
                        }}
                        defaultButtonText={<Text style={styles.defaultButtonText}>Category</Text>}
                        buttonTextAfterSelection={(selectedItem, index) => (selectedItem)}
                        rowTextForSelection={(item, index) => (item)}
                        buttonStyle={styles.dropdownBtnStyleCategory}
                        buttonTextStyle={styles.dropdownBtnTxtStyle}
                        renderDropdownIcon={isOpened => (
                            <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={18} />
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
                                  disabled={!btnColorSet} onPress={()=>onSubmit()}>
                    <Text style={{fontSize: 22}}>Create</Text>
                    <MaterialIcons name="arrow-forward-ios" size={30} color='#000' />
                </TouchableOpacity>
            </View>
        </View>
        );
}

const styles = StyleSheet.create({
    amountText: {
        paddingLeft: 10,
        fontSize: 24,
        fontWeight: 'bold',
    },
    amountInputView: {
        width: 310,
        backgroundColor: "#ececec",
        borderRadius: 20,
        height: 50,
        marginBottom: 5,
        justifyContent: "center",
        padding: 20,
        color: '#000',
    },
    inputAmount: {
        width: 310,
        fontSize: 20,
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
    },
    categoryInfo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 100,
    },
    selectData: {
        flexDirection: 'row',
        height: 50,
        marginBottom: 10,
    },
    dropdownBtnStyleWallet: {
        width: 150,
        borderRadius: 10,
    },
    dropdownBtnStyleCategory: {
        width: 130,
        borderRadius: 10,
    },
    dropdownBtnTxtStyle: {
        fontSize: 20,
    },
    defaultButtonText: {
        fontSize: 16,
        color: '#7D848FFF',
    },
    arrowRight: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    descriptionInputView: {
        width: 310,
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
