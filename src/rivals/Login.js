import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import supabase from '../supabaseClient';
import {Button, Input} from 'react-native-elements';
import { updatePlayerB } from '../supabaseClient';
import { useRoute } from '@react-navigation/native';

export default function Login() {
  const [email, setEmail] = useState('dev@gmail.com');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('tester');
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState()
  const navigation = useNavigation();
  const route = useRoute();
  const { game_id } = route.params;

  console.log("Game ID:", game_id);


  async function signInWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    navigation.navigate("Matchmaking");
    createUser()
    setLoading(false);
    
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    createUser()
    setLoading(false);
    
    
  }
  async function createUser(){
    const { data: userResponse, error } = await supabase.auth.getUser();
    if (error) throw new Error("Failed to fetch user: " + error.message);
  
    const user = userResponse.user;
    if (!user) throw new Error("No user logged in");
    setUserID(user.id)
    console.log("USERID: "+ userID)
    console.log("EEEE:"+ user.id)
    linkWithGame(user.id) 
  }

  async function signUpWithPhone() {
    const { data, error } = await supabase.auth.signUp({
      phone: phone,
      password: password,
    })
    if (error) Alert.alert(error.message);
  }
  async function signInWithPhone() {
    const { user, error } = await supabase.auth.signInWithPassword({
      phone: '+1'+phone,
      password: password,
    })
  }
  async function linkWithGame(testID) {
    try {
      console.log("Attempting to link game with gameID and userID:", game_id, testID);
      const result = await updatePlayerB(game_id, testID);
      console.log("Link with game successful:", result);
    } catch (error) {
      console.error("Error linking with game:", error);
    }
  }
  

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          onChangeText={text => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      {/* <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Phone"
          onChangeText={text => setPhone(text)}
          value={phone}
          placeholder="6789998212"
          autoCapitalize={'none'}
        />
      </View> */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          onChangeText={text => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
