import {Text, View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView} from "react-native";
import {FontAwesome5} from "@expo/vector-icons";
import Modal from "react-native-modal";
import CategoryInputs from "./CategoryInputs";
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";

export default function CreateCategory(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [iconList, setIconList] = useState(props.iconList);
    const [color, setColor] = useState('#3E68D1');
    const [colorList, setColorList] = useState(props.colorList);

    const setAsyncCategory = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transaction-categories/',{
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': name,
                'icon': icon.code,
                'color': color,
            })
        }).then((response) => {
            props.onCategoryList();
            console.log("Category created");
            response.json()
        })
            .catch((error) => {
                console.error(error);
            })}

    useEffect(() => {
        setIconList(props.iconList);
        setColorList(props.colorList);
    })

    const onCancel = () => {
        setModalVisible(false);
        setName('');
    }

    const onSubmit = () => {
        setAsyncCategory().then();
        setModalVisible(false);
        setName('');
    }

    return (
        <View style={styles.createCategory}>
            <Modal
                isVisible={modalVisible}
                backdropColor={'#000000'}
                backdropOpacity={0.8}
                animationIn={"zoomInDown"}
                animationOut={"zoomOutUp"}
                animationInTiming={600}
                animationOutTiming={600}
                backdropTransitionInTiming={600}
                backdropTransitionOutTiming={600}
            >
                <View style={styles.modalContainer}>
                    <CategoryInputs
                        name={name}
                        setName={setName}
                        icon={icon}
                        setIcon={setIcon}
                        iconList={Array.from(new Set(iconList))}
                        color={color}
                        setColor={setColor}
                        colorList={Array.from(new Set(colorList))}
                        onCancel={onCancel}
                        omSubmit={onSubmit}
                        onBtnText={"Create"}
                        createElement={true}
                    />
                </View>
            </Modal>
            <View style={styles.addCategoryView}>
                <TouchableOpacity
                    style={[styles.addCategoryBtn, {backgroundColor: color}]}
                    onPress={() => {
                        setModalVisible(true);
                        setColor(colorList[~~(Math.random() * colorList.length)]);
                    }}
                >
                    <FontAwesome5 name="plus" size={40} color='#fff' />
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    createCategory: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 10,
    },
    addCategoryView: {
        flexDirection: 'row',
    },
    addCategoryBtn: {
        width: 160,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    categoriesScrollView: {
        width: 290,
        borderRadius: 30,
    },
    modalContainer: {
        width: 370,
        height: 400,
    }
});