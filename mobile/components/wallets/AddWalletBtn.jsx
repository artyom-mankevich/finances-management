import { View, StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default function AddWalletBtn(props) {
    return (
        <View style={styles.addWalletView}>
            <TouchableOpacity
                style={styles.addWalletBtn}
                onPress={props.onPress}
            >
                <FontAwesome5 name="plus" size={110} color='#fff' />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    addWalletView: {
      padding: 10,
    },
    addWalletBtn: {
        width: 350,
        height: 250,
        backgroundColor: '#3e68d1',
        borderRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    }
});