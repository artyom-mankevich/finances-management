import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Category(props) {
    return (
        <View style={{height:50}}>
            <View style={styles.category}>
                <TouchableOpacity
                    key={Math.random().toString(36).substr(2, 9)}
                    style={[styles.categoryButton, {backgroundColor: props.color}]}
                    onPress={() => {
                        props.onUpdated();
                        AsyncStorage.setItem('categoryId', props.categoryId).then();
                    }}
                >
                    <Text style={styles.categoryName} numberOfLines={1}>{props.name}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    category: {
        flex: 1,
        borderRadius: 30,
        width: 110,
        marginRight: 4,
        marginLeft: 4,
    },
    categoryButton: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    categoryName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
});