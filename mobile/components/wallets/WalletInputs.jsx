import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import getSymbolFromCurrency from "currency-symbol-map";
import { Picker } from '@react-native-picker/picker';
import Wallet from "./Wallet";
import {NumberInputValidation, NameConstraint} from "./WalletValidation";

export default function WalletInputs(props) {
    const timeMillis = new Date().getTime();

return (
    <View style={styles.container}>
        <Wallet
            id={props.id}
            name={props.name}
            currency={props.currency}
            balance={props.balance}
            goal={props.goal}
            color={props.color}
            lastUpdated={props.lastUpdated}
            createElement={props.createElement}
            onDeleted={() => props.onDeleted()}
        />
        <ScrollView style={{width: 500}}>
            <View style={{marginTop: 10}}>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputText}
                        placeholder="Name"
                        onChangeText={text => props.setName(NameConstraint(text))}
                        value={props.name}
                    />
                </View>
                <View style={styles.dropdownContainer}>
                    <View style={styles.pickerContainer}>
                        <Picker
                            key={timeMillis}
                            itemStyle={styles.pickerItem}
                            style={styles.Picker}
                            selectedValue={props.currency}
                            onValueChange={
                                (itemValue, itemIndex) => {
                                    props.setCurrency(itemValue);
                                }
                            }
                        >
                            {
                                props.currencyList.map((item) => (
                                        <Picker.Item
                                            key={props.currencyList.indexOf(item)}
                                            defaultValue={props.currency}
                                            label=
                                                {
                                                    getSymbolFromCurrency(item.code) ?
                                                        (
                                                            getSymbolFromCurrency(item.code) + "\t\t" + item.code + "\t\t" + item.name
                                                        ) :  (
                                                            item.code + "\t\t" + item.name)
                                                }
                                            value={item.code}
                                            onPress={(code) => props.setCurrency(code)}
                                        />
                                    ))
                            }
                        </Picker>
                    </View>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        keyboardType={'number-pad'}
                        maxLength={17}
                        style={styles.inputText}
                        placeholder="Balance"
                        onChangeText={text =>
                        {
                            props.setBalance(NumberInputValidation(text));
                        }}
                        value={props.balance}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        keyboardType={'number-pad'}
                        maxLength={17}
                        style={styles.inputText}
                        placeholder="Goal"
                        onChangeText={text =>
                        {
                            props.setGoal(NumberInputValidation(text));
                        }}
                        value={props.goal}
                    />
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
            </View>

        </ScrollView>
        <View style={styles.modalSubmit}>
            <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel} key={timeMillis}>
                <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.createWalletBtn,
                            {backgroundColor: !props.name.length ? '#b4b4b4' : props.color}]}
                            disabled={!props.name.length} onPress={props.onSubmit} key={timeMillis+1}>
                <Text style={{fontSize: 22}}>{props.onBtnText}</Text>
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
    pickerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginLeft: 100,
        width: 300,
        height: 50,
        backgroundColor: '#ECECECFF',
        marginBottom: 5,
    },
    Picker: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 275,
        height: 50,
        backgroundColor: 'rgba(0,0,0,0)',
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
    inputView: {
        width: 300,
        backgroundColor: "#ececec",
        borderRadius: 20,
        height: 50,
        marginBottom: 5,
        justifyContent: "center",
        alignSelf: 'center',
        padding: 20,
        color: '#000',
    },
    inputColor: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    inputText: {
        height: 50,
        color: '#464646',
        fontSize: 18,
        plaseholderTextColor: '#464646',
    }
});