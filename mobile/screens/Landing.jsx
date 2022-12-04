import {Text, View, StyleSheet, Image, ScrollView} from "react-native";


export default function LoadingPage() {
    return (
        <View style={styles.viewStyle}>
        <ScrollView style={{width: 500, height: 800}}>
            <View style={{height: 910}}>
            <Image
                style={{width: 420, height: 340, resizeMode: 'cover'}}
                source={require('../assets/landing_1.png')}
            />
            <Image
                style={{width: 420, height: 290, resizeMode: 'cover'}}
                source={require('../assets/landing_3.png')}
                 />
            <Image
                style={{width: 420, height: 280, resizeMode: 'cover'}}
                source={require('../assets/landing_2.png')}
                 />
            </View>
        </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    viewStyle: {
        flex: 1,
    },
    landing_2: {
        width: '100%',
        height: '37%',
    },
    landing_3: {
        width: '100%',
        height: '37%',
    }
});