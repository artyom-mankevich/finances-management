import { createDrawerNavigator} from "@react-navigation/drawer";
import SidebarMenu from "./components/SidebarMenu";
import * as React from "react";
import {NavigationContainer} from "@react-navigation/native";

const Drawer = createDrawerNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <SidebarMenu {...Drawer}/>
      </NavigationContainer>
  );
}
