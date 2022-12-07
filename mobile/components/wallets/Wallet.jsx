import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import {Feather, FontAwesome} from "@expo/vector-icons";

export default function Wallet(props) {
    return (
        <View style={{marginTop:10, width:350, height:250, borderRadius:30, backgroundColor:props.color}}>
            <View style={styles.walletHeader}>
            <View style={styles.walletName}>
                <Text style={styles.walletNameText}>{props.name}</Text>
            </View>
            <View style={styles.walletBalanceInfo}>
                <View style={styles.walletBalance}>
                    <Text style={styles.walletBalanceText}>{props.currency}</Text>
                    <Text style={styles.walletBalanceText}>{props.balance}</Text>
                </View>
                <View style={styles.walletGoal}>
                    <Text style={styles.walletGoalText}>{props.currency}</Text>
                    <Text style={styles.walletGoalText}>{props.goal}</Text>
                </View>
            </View>
                </View>
            <View style={styles.walletFooter}>
                    <View style={styles.walletUpdateInfo}>
                        <Text style={styles.walletUpdateText}>Last Update:</Text>
                        <Text style={styles.walletUpdateText}>{props.lastUpdated}</Text>
                    </View>
                    <View style={styles.walletUpdateBtn}>
                        <TouchableOpacity
                            style={styles.walletUpdateBtnTouchableOpacity}
                            onPress={() => console.log("Update Wallet")}
                            key={props.name}
                        >
                            <View style={styles.walletUpdateCircle}>
                                <Feather name="circle" size={60} color="#fff" />
                            </View>
                            <View style={styles.walletUpdateGear}>
                                <FontAwesome name="gear" size={37} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wallet: {
        width: 350,
        height: 250,
        backgroundColor: '#3e68d1',
        borderRadius: 30,
    },
    walletHeader: {
        flexDirection: 'row',
    },
    walletName: {
        textAlign: 'left',
        paddingLeft: 30,
        paddingTop: 20,
    },
    walletNameText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '700',
    },
    walletBalanceInfo: {
        flexDirection: 'column',
        marginLeft: 'auto',
        paddingTop: 20,
        paddingRight: 10,
    },
    walletBalance: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    walletBalanceText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '700',
        paddingRight: 5,
    },
    walletGoal: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    walletGoalText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '400',
        paddingRight: 5,
    },
    walletFooter: {
        flexDirection: 'row',
    },
    walletUpdateInfo: {
        flexDirection: 'column',
        paddingLeft: 30,
        top: 70,
    },
    walletUpdateText: {
        color: '#fff',
        fontSize: 16,
    },
    walletUpdateBtn: {
        flexDirection: 'row',
        marginLeft: 'auto',
        top: 65,
    },
    walletUpdateBtnTouchableOpacity: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletUpdateGear: {
        bottom: 50,
    }
});