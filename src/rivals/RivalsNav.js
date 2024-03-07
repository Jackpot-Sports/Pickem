import React from "react";
import { View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import RivalsSession from "./RivalsSession";
import Matchmaking from "./Matchmaking";
import History from "./History";
import Live from "./Live";
import Login from "./Login";
import GamesList from "./GamesList";
import GameDetails from "./GameDetails";

const Stack = createStackNavigator();


const FeedStack = ({ game_id }) => {
  return (
    <Stack.Navigator initialRouteName="Matchmaking" screenOptions={{
      // headerShown: false, // This will hide the header globally for all screens
    }}>
      <Stack.Screen 
        name="Matchmaking" 
        component={Matchmaking} 
        initialParams={{ game_id }} 
      />
      <Stack.Screen name="RivalsSession" component={RivalsSession} />
      <Stack.Screen name="Live" component={Live} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="GamesList" component={GamesList} />
      <Stack.Screen name="GameDetails" component={GameDetails} />
    </Stack.Navigator>
  );
};

const RivalsNav = ({ game_id = null }) => {

  return (
    <View style={{ flex: 1 }}>
      <FeedStack game_id={game_id} /> 
    </View>
  );
};

export default RivalsNav;
