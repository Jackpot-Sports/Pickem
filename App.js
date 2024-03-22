import "react-native-url-polyfill/auto";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-native-paper";
import RivalsNav from "./src/rivals/RivalsNav";
import { NavigationContainer } from "@react-navigation/native";
import Auth from "./src/rivals/Auth";

export default function App() {
    const linking = {
      prefixes: ['https://pickems.netlify.app/', 'yourapp://','http://localhost:8081/'],
      config: {
        screens: {
          Home: 'home',
          matchmaking:"Matchmaking",
          Matchmaking: "Matchmaking",
          Matchmaking: '*', // Catch-all route for unmatched paths
        },
      },
    };
    
  
  return (
    <NavigationContainer linking={linking}>
      <Provider>
        <Auth></Auth>
      </Provider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});