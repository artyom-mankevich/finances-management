import { createDrawerNavigator} from "@react-navigation/drawer";
import SidebarMenu from "./components/SidebarMenu";
import * as React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {Auth0Provider} from "react-native-auth0";
import config from "./auth0.config";

const Drawer = createDrawerNavigator();

export default function App() {
  return (
        <Auth0Provider clientId={config.clientId} domain={config.domain}>
            <NavigationContainer>
                <SidebarMenu {...Drawer}/>
            </NavigationContainer>
        </Auth0Provider>
  );
}
