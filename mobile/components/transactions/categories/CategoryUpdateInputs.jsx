import {ScrollView, TextInput, TouchableOpacity, View, StyleSheet} from "react-native";
import {useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";
import CategoryToUpdate from "./CategoryToUpdate";
import Modal from "react-native-modal";
import CategoryInputs from "./CategoryInputs";
import Category from "./Category";
import {FontAwesome} from "@expo/vector-icons";

export default function CategoryUpdateInputs(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [categoryId, setCategoryId] = useState(props.categoryId);
    const [name, setName] = useState(props.name);
    const [icon, setIcon] = useState(props.icon);
    const [color, setColor] = useState(props.color);
    const [iconList, setIconList] = useState([]);
    const [colorList, setColorList] = useState([]);

    const setUpdateCategory = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return fetch(ngrokConfig.myUrl + '/v2/transaction-categories/' + categoryId + '/',{
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': name,
                'icon': icon,
                'color': color,
            })
        }).then((response) => {
            response.json();
            props.onCategoryList();
            setModalVisible(false);
            console.log("Category updated");
        })
            .catch((error) => {
                console.error(error);
            })}

    const onUpdated = () => {
        setModalVisible(true);
        setColorList(props.colorList);
        setIconList(props.iconList);
        AsyncStorage.setItem('categoryId', props.categoryId).then();
    }

    return (
        <View style={styles.categoryInputContainer}>
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
                <View style={styles.walletUpdateBtn}>
                    {
                        !props.createElement &&
                        <View>
                                <View style={styles.walletDeleteBtn}>
                                    <TouchableOpacity
                                        style={styles.walletDeleteBtnTouchableOpacity}
                                        onPress={() => props.onDeleteCategory()}>
                                        <FontAwesome name="trash" size={55} color="#930000"/>
                                    </TouchableOpacity>
                                </View>

                        </View>
                    }
                </View>
                <View style={styles.modalContainer}>
                    <CategoryInputs
                        name={name}
                        setName={setName}
                        icon={icon}
                        setIcon={setIcon}
                        color={color}
                        setColor={setColor}
                        iconList={Array.from(new Set(iconList))}
                        colorList={Array.from(new Set(colorList))}
                        onBtnText={"Update"}
                        createElement={false}
                        onDeleted={() => props.onDeleted()}
                        onCancel={() => setModalVisible(false)}
                        onUpdate={() => setUpdateCategory().then()}
                    />
                </View>
            </Modal>
            <Category
                name={name}
                icon={icon}
                color={color}
                categoryId={categoryId}
                onUpdated={() => onUpdated()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    categoryInputContainer: {

    },
    modalContainer: {
        width: 370,
        height: 400,
    },
    walletDeleteBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 30,
    }
});