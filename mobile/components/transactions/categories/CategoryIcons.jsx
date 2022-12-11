import {View} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    Entypo,
    FontAwesome5,
    MaterialCommunityIcons
} from "@expo/vector-icons";

export default function CategoryIcons(props) {
    return (
        <View>
            {
                props.item === 'cottage'
                    ?
                    <FontAwesome5 name={"home"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                    : props.item === 'key'
                        ? <MaterialCommunityIcons name={"key-variant"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                        : props.item === 'imagesearch_roller'
                            ? <FontAwesome5 name={"paint-roller"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                            : props.item === 'wine_bar'
                                ? <MaterialIcons name={"wine-bar"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                : props.item === 'directions_car'
                                    ? <MaterialIcons name={"directions-car"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                    : props.item === 'medical_services'
                                        ? <MaterialIcons name={"medical-services"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                        : props.item === 'shopping_bag'
                                            ? <MaterialIcons name={"shopping-bag"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                            : props.item === 'fitness_center'
                                                ? <MaterialIcons name={"fitness-center"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                                : props.item === 'local_gas_station'
                                                    ? <MaterialIcons name={"local-gas-station"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                                    : props.item === 'paid'
                                                        ? <Entypo name={"credit"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                                        : props.item === 'arrow_upward'
                                                            ? <MaterialIcons name={"arrow-upward"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                                            : props.item === 'arrow_downward'
                                                                ? <MaterialIcons name={"arrow-downward"} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
                                                                : <MaterialIcons name={props.item} size={35} color={props.selectedIcon === props.item ? props.color : '#7D848FFF'} />
            }
        </View>
    );
}