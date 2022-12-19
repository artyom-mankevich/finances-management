import {View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import {NameConstraint, NumberInputValidation} from "../wallets/WalletValidation";
import {FontAwesome, MaterialIcons} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../ngrok.config";

export default function StockInputs(props) {
    const [isDisabled, setIsDisabled] = useState(false);

    const setAsyncTicker = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/stocks/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'ticker': props.ticker,
                'amount': Number(props.shares),
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Stock created");
            props.setTicker('');
            props.setShares('');
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const setAsyncDebtUpdate = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        const stockId = await AsyncStorage.getItem('stockId');
        return fetch(ngrokConfig.myUrl + '/v2/stocks/' + stockId + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'ticker': props.ticker,
                'amount': Number(props.shares),
            })
        }).then((response) => {
            props.onUpdate();
            console.log("Stock updated");
        })
            .catch((error) => {
                console.error(error);
            })
    }

    const deleteStock = async () => {
        setIsDisabled(true);
        const accessToken = await AsyncStorage.getItem('accessToken');
        const stockId = await AsyncStorage.getItem('stockId');
        return fetch(ngrokConfig.myUrl + '/v2/stocks/' + stockId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            props.onUpdate();
            console.log('Stock deleted');
        })
            .catch((error) => {
                console.error(error);
            })};

    useEffect(() => {
        if(props.createElement) {
            props.setTicker('');
            props.setShares('');
        }
    },[]);

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
                             placeholder="Ticker"
                             maxLength={4}
                             onChangeText={text => props.setTicker(NameConstraint(text))}
                             value={props.ticker ? props.ticker : ''}
                         />
                     </View>
                 </View>
                 <View style={styles.inputShares}>
                     <View style={styles.titleInfo}>
                         <Text style={styles.title}>Shares</Text>
                     </View>
                     <View style={styles.inputView}>
                         <TextInput
                             keyboardType={'number-pad'}
                             style={styles.inputText}
                             placeholder="Number of shares"
                             onChangeText={text => props.setShares(NumberInputValidation(text))}
                             value={props.shares ? props.shares.toString() : ''}
                         />
                     </View>
                     {
                         !props.createElement &&
                         <View style={styles.deleteView}>
                             <View style={styles.stockDeleteBtn}>
                                 <TouchableOpacity
                                     style={styles.stockDeleteBtnTouchableOpacity}
                                     disabled={isDisabled}
                                     onPress={() => deleteStock()}>
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
                     {backgroundColor: props.btnColorSetTicker ? '#3e68d1' : '#b4b4b4'}]}
                                   disabled={isDisabled} onPress={() => {
                     setIsDisabled(true);
                     props.createElement ? setAsyncTicker().then() : setAsyncDebtUpdate().then();
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
    deleteView: {
        padding: 30,
        alignItems: 'center',
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