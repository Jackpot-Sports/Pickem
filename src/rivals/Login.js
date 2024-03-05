import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import supabase from '../supabaseClient';
import {Button, Input} from 'react-native-elements';

export default function Login() {
  const [email, setEmail] = useState('dev@gmail.com');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('tester');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  async function signInWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    navigation.navigate("Matchmaking");
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {error} = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) Alert.alert(error.message);
    setLoading(false);
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
