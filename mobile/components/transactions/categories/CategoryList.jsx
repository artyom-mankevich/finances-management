import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ngrokConfig from "../../ngrok.config";
import {View, StyleSheet, Text, ScrollView} from "react-native";
import CreateCategory from "./CreateCategory";
import Category from "./Category";
import CategoryUpdateInputs from "./CategoryUpdateInputs";

export default function CategoryList(props) {
    const [categories, setCategories] = useState([]);
    const [iconList, setIconList] = useState([]);
    const [colorList, setColorList] = useState([]);

    const getIconsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        Array.from(new Set(iconList));
        return fetch(ngrokConfig.myUrl + '/v2/icons/',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let iconsList = [];
                for (let i = 0; i < responseJson.length; i++) {
                    iconsList.push(responseJson[i]);
                    setIconList(iconsList);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const getColorsList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        Array.from(new Set(colorList));
        return fetch(ngrokConfig.myUrl + '/v2/colors/',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                let colorsList = [];
                for (let i = 0; i < responseJson.length; i++) {
                    colorsList.push(responseJson[i].hexCode);
                    setColorList(colorsList);
                }
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const getCategoriesList = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        return await fetch(ngrokConfig.myUrl + '/v2/transaction-categories/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setCategories(responseJson);
            })
            .catch((error) =>{
                console.error(error);
            });
    };

    const deleteCategory = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const categoryId = await AsyncStorage.getItem('categoryId');
        return fetch(ngrokConfig.myUrl + '/v2/transaction-categories/' + categoryId + '/',{
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then(() => {
            getCategoriesList();
            console.log('Category deleted');
        })
            .catch((error) => {
                console.error(error);
            })};

    useEffect(() => {
        getCategoriesList().then();
        getIconsList().then();
        getColorsList().then();
    }, []);

    props.refreshing ? getCategoriesList().then() : null;

    return (
        <View style={styles.container}>
            <View style={{alignItems:'center'}}>
                <Text style={styles.categoriesTitle}>Categories</Text>
            </View>
            <View style={styles.categoriesContainer}>
                <View style={styles.categoriesAddBtn}>
                    <CreateCategory
                        colorList={colorList}
                        iconList={iconList}
                        onCategoryList={() => getCategoriesList().then()}
                    />
                </View>
                <ScrollView
                    style={styles.scrollView}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.categoriesList}>
                        {
                            categories.sort((a, b) => a.name > b.name ? 1 : -1).map((item) => (
                            <View key={item.id}>
                                <CategoryUpdateInputs
                                    ket={item.id}
                                    categoryId={item.id}
                                    name={item.name}
                                    color={item.color}
                                    iconList={item.icon}
                                    colorList={colorList}
                                    iconList={iconList}
                                    onCategoryList={() => getCategoriesList().then()}
                                    onDeleteCategory={() => deleteCategory().then()}
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    categoriesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        paddingTop: 5,
        paddingBottom: 5,
    },
    scrollView: {
        width: 'auto',
    },
    categoriesContainer: {
        flexDirection: 'column',
    },
    categoriesListScroll: {
    },
    categoriesList: {
        flexDirection: 'row',
    },
});