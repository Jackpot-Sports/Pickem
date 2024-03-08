import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Share } from 'react-native';
import { Card, Title, Paragraph } from "react-native-paper";
import supabase  from "../supabaseClient";
import * as Sharing from 'expo-sharing';
import { createClient } from "@supabase/supabase-js";

//const supabase = createClient(
//  "https://aohggynmsqurtpszrgin.supabase.co",
//  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaGdneW5tc3F1cnRwc3pyZ2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM1MDMyMzUsImV4cCI6MjAwOTA3OTIzNX0.wj2GWnQ6vsoph6Vs17GgLuBuuMt2tctCN9r1kIUCST4"
//);
import { fetchMMAProps } from "../supabaseClient";

const Live =  () => {
  const navigation = useNavigation();
  const [picks, setPicks] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('player_a');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberValidated, setPhoneNumberValidated] = useState(false);
  const [choices, setChoices] = useState({});
  const [numPicks, setNumPicks] = useState(0);
  const [user,setUser] = useState()
  useEffect(() => {

    const fetchProps = async () => {
      const props = await fetchMMAProps(); // Assuming this returns an ID or null
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse.user;
      setUser(user)
      setPicks(props);
    };

    fetchProps();
  }, []);

  const validatePhoneNumber = (number) => {
    // Example: Validate based on length and/or a regex pattern
    return number.trim().length === 10; // Basic validation for example
  };

  const handleSubmitPhoneNumber = () => {
    if (validatePhoneNumber(phoneNumber)) {
      setPhoneNumberValidated(true);
    } else {
      Alert.alert("Error", "Please enter a valid phone number.");
    }
  };
  function generateInviteLink(gameID) {
    const host = 'http://localhost:8081';
    return `${host}/user/${gameID}`;
  }


  const handleResult = async (result, choice) => {
    console.log("All picks:", picks); // Log all picks for debugging
    console.log("Choice ID:", choice); // Log the choice ID being searched
  
    const pickedItem = picks.find(pick => pick.uid === choice);
    if (pickedItem) {
      const { prop } = pickedItem;
      setChoices({
        [choice]: { result, prop }
      });
  
      const gameID = await createNewGameRow(choice, result, prop);
      if (gameID) {
        const inviteLink = generateInviteLink(gameID);
        try {
          await Sharing.shareAsync(inviteLink, {
            mimeType: 'text/plain',
            dialogTitle: 'Share the game invite link with friends',
          });
          console.log('Invite link shared successfully.');
        } catch (error) {
          console.error('Error sharing invite link:', error);
        }
        navigation.navigate('Matchmaking');
      }
    } else {
      console.log('Pick not found');
    }
  };
  
  
  
  const createNewGameRow = async (choiceId, result, prop) => {

    const unpickedPicks = picks.filter(pick => !choices.hasOwnProperty(pick.uid) && pick.uid !== choiceId);

    // Create an array of IDs from the unpicked picks, excluding the choiceId
    let unpickedIds = unpickedPicks.map(pick => pick.uid);

  let insertData = {
    picks_a: JSON.stringify({ [choiceId]: { result, prop } }),
    un_picked: unpickedIds, // This is now an array of text (IDs), matching the expected format
    phone: phoneNumber,
    currentPlayer:"player_b"
    // Your existing logic to include player_a...
  };
  
    if (user) {
      console.log(user);
      console.log(user.id)
      insertData.player_a = user.id; // Assigning user.id if present
    }
  
    console.log(insertData);
  
    try {
      const { data, error } = await supabase
        .from('pre_rivals')
        .insert([insertData])
        .select();
      console.log(data, error);
      if (error) {
        console.error('Error inserting data:', error);
        return null;
      }
      
      console.log('Success, inserted data:', data);
      return data[0].game_id;
    } catch (error) {
      console.error('Unexpected error:', error);
      return null;
    }
  };
  
  if (!user &&!phoneNumberValidated ) {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>Put your number in</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Button title="Submit" onPress={handleSubmitPhoneNumber} />
      </View>
    );
  } else {
  return (
    <View style={styles.container}>
      <View style={{marginTop: 50}}>
        {picks.map((pick) => (
          <Card key={pick.uid} style={styles.commonCard}>
            <Card.Content>
              <Title style={styles.titleText}>
                {pick.home} vs {pick.away}
              </Title >
              {/* Additional details */}
              <Paragraph style={styles.subText}> {pick.category} {pick.point}</Paragraph>

              {choices[pick.uid] ? (
                // If the pick has been chosen, display who chose it and their choice
                <Text style={styles.subText}>{choices[pick.uid].player} chose {choices[pick.uid].result}</Text>
              ) : (
                <View style={styles.buttonContainer}>
                  {pick.point ? (
                    // Render Over/Under buttons if there is a point value
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.winButton]}
                        onPress={() => handleResult("Over", pick.uid)}
                      >
                        <Title style={styles.buttonText}>Over</Title>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.loseButton]}
                        onPress={() => handleResult("Under", pick.uid)}
                      >
                        <Title style={styles.buttonText}>Under</Title>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Render Yes/No buttons if there is no point value
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.winButton]} // Consider changing the style if you want different colors for Yes/No
                        onPress={() => handleResult(pick.home, pick.uid)}
                      >
                        <Title style={styles.buttonText}>{pick.home}</Title>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.loseButton]} // Consider changing the style if you want different colors for Yes/No
                        onPress={() => handleResult(pick.away, pick.uid)}
                      >
                        <Title style={styles.buttonText}>{pick.away}</Title>
                      </TouchableOpacity>
                    </>
                  )} 
                </View>
              )}
            </Card.Content>
          </Card>
        ))}

      </View>
      
    </View>
  );
        }
};

export default Live;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
  },
  commonCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 5,
    marginBottom: 10,
    flexDirection: "column",
    backgroundColor: "#212121"
  },
  
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
    width: "40%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  winButton: {
    backgroundColor: "#4CAF50", // Green color
  },
  loseButton: {
    backgroundColor: "#F44336", // Red color
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  subText: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black background
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: "#333", // Dark background for the text input
    color: "#fff", // Text color
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
