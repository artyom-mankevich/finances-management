import {View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Text} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import CategoryIcons from "./CategoryIcons";
import {useState} from "react";
import {NameConstraint} from "./CategoryValidation";

export default function CategoryInputs(props) {
    const [selectedIcon, setSelectedIcon] = useState('');
    return (
        <View style={styles.categoryInputContainer}>
            <ScrollView style={{width: 500}}>
                <View style={[styles.categoryInputView,
                    {
                        backgroundColor: props.color,
                    }]}>
                    <TextInput
                        style={styles.categoryInputText}
                        placeholder="Name"
                        onChangeText={text => props.setName(NameConstraint(text))}
                        value={props.name}
                    />
                </View>
                <View style={styles.categoryInputIcon}>
                    {
                        props.iconList.map((item) => (
                                <TouchableOpacity
                                    key={props.iconList.indexOf(item)}
                                    style={styles.categoryIconTouchableOpacity}
                                    onPress={() => {
                                        setSelectedIcon(item.code);
                                        props.setIcon(item.code)
                                    }}
                                >
                                    <CategoryIcons key={item.id} item={item.code} name={item.code} selectedIcon={selectedIcon} color={props.color}/>
                                </TouchableOpacity>
                            ))
                    }
                </View>
                <View style={styles.categoryInputColor}>
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
            </ScrollView>
            <View style={styles.modalSubmit}>
                <TouchableOpacity style={styles.cancelBtn} onPress={props.onCancel} key={new Date().getTime()}>
                    <MaterialIcons name="arrow-back" size={40} color='#4d4d4d' />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.createCategoryBtn,
                    {backgroundColor: !props.name.length ? '#b4b4b4' : props.color}]}
                                  disabled={!props.name.length} onPress={props.createElement ? props.omSubmit : props.onUpdate} key={new Date().getTime()+1}>
                    <Text style={{fontSize: 22}}>{props.onBtnText}</Text>
                    <MaterialIcons name="arrow-forward-ios" size={30} color='#000' />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    categoryInputContainer: {
        flex: 1,
        backgroundColor: '#D7D7D7E5',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    categoryInputIcon: {
        width: 370,
        height: 230,
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        padding: 10,
        flexWrap: 'wrap',
    },
    categoryIconTouchableOpacity: {
        width: 40,
        height: 40,
        borderRadius: 65,
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSubmit: {
        flexDirection: 'row',
        width: '100%',
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
    createCategoryBtn: {
        width: '80%',
        height: 40,
        flexDirection: 'row',
        borderBottomRightRadius: 30,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryInputView: {
        width: 300,
        backgroundColor: "#ececec",
        borderRadius: 20,
        height: 50,
        marginTop: 10,
        marginBottom: 10,
        justifyContent: "center",
        alignSelf: 'center',
        padding: 20,
        color: '#000',
    },
    categoryInputColor: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    categoryInputText: {
        height: 50,
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '900',
        plaseholderTextColor: '#7D848FFF',
    }
});