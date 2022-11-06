import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator} from "@react-navigation/drawer";
import OverviewPage from "./screens/Overview";
import AnalyticsPage from "./screens/Analytics";
import CryptoPage from "./screens/Crypto";
import DebtsPage from "./screens/Debts";
import InvestmentsPage from "./screens/Investments";
import TransactionsPage from "./screens/Transactions";
import WalletPage from "./screens/Wallet";
import CustomSidebarMenu from "./screens/CustomSidebarMenu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import * as React from "react";

const Drawer = createDrawerNavigator();

export default function App() {
  return (

        <NavigationContainer>
            <Drawer.Navigator drawerContent={(props) => <CustomSidebarMenu {...props} />}>
                <Drawer.Screen name='Overview' component={OverviewPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <MaterialIcons name="dashboard" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />
                <Drawer.Screen name='Transactions' component={TransactionsPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <FontAwesome name="dollar" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />
                <Drawer.Screen name='Wallet' component={WalletPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <Ionicons name="wallet" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />
                <Drawer.Screen name='Analytics' component={AnalyticsPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <Ionicons name="analytics" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />

                <Drawer.Screen name='Investments' component={InvestmentsPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <FontAwesome name="bank" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />

                <Drawer.Screen name='Debts' component={DebtsPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <FontAwesome name="shopping-bag" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />

                <Drawer.Screen name='Crypto' component={CryptoPage}
                    options={{
                        drawerIcon: ({focused, size}) => (
                            <MaterialCommunityIcons name="ethereum" size={size} color={focused ? '#3e68d1' : '#ccc'} />
                        ),
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>

  );
}
