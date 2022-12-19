import CustomSidebarMenu from "../screens/CustomSidebarMenu";
import OverviewPage from "../screens/Overview";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import TransactionsPage from "../screens/Transactions";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import WalletPage from "../screens/Wallets";
import Ionicons from "react-native-vector-icons/Ionicons";
import AnalyticsPage from "../screens/Analytics";
import InvestmentsPage from "../screens/Investments";
import DebtsPage from "../screens/Debts";
import CryptoPage from "../screens/Crypto"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as React from "react";
import SettingsPage from "../screens/Settings";
import StocksPage from "../screens/Stocks";

export default function SidebarMenu(Drawer) {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerStyle: {backgroundColor: 'rgb(255,255,255)'},
                headerStyle: {
                    backgroundColor: '#3e68d1',
                },
                headerTitleStyle: {
                    color: '#fff'
                },
                headerTintColor: '#fff',
                drawerActiveBackgroundColor: '#3e68d1',
                drawerActiveTintColor: '#ffffff',
                drawerInactiveBackgroundColor: 'transparent',
                drawerInactiveTintColor: '#363636',
                drawerLabelStyle: {
                    marginLeft: -20,
                    fontSize: 16,
                },
                drawerType: 'slide',
                pressColor: '#363636',
                pressOpacity: 0.5,
            }}
            drawerContent={(props) => <CustomSidebarMenu {...props} pressColor={"#f6f8ff"}/>}>
            <Drawer.Screen name='Overview' component={OverviewPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <MaterialIcons name="dashboard" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Transactions' component={TransactionsPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <FontAwesome name="dollar" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Wallets' component={WalletPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <Ionicons name="wallet" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                                 unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Analytics' component={AnalyticsPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <FontAwesome name="bar-chart-o" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Stocks' component={StocksPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <FontAwesome name="bank" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Investments' component={InvestmentsPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <MaterialIcons name="trending-up" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Debts' component={DebtsPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <FontAwesome name="shopping-bag" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Crypto' component={CryptoPage}
                           options={{
                               drawerIcon: ({focused, size}) => (
                                   <MaterialCommunityIcons name="ethereum" size={size} color={focused ? '#ffffff' : '#363636'} />
                               ),
                               unmountOnBlur: true,
                           }}
            />
            <Drawer.Screen name='Settings' component={SettingsPage}
                            options={{
                                drawerIcon: ({focused, size}) => (
                                    <MaterialIcons name="settings" size={size} color={focused ? '#ffffff' : '#363636'} />
                                ),
                            }}
            />
        </Drawer.Navigator>
    )
}