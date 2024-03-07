import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  Text,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Share } from 'react-native';
import { Card, Title, Paragraph } from "react-native-paper";
// import { supabase } from "../supabaseClient";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aohggynmsqurtpszrgin.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaGdneW5tc3F1cnRwc3pyZ2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM1MDMyMzUsImV4cCI6MjAwOTA3OTIzNX0.wj2GWnQ6vsoph6Vs17GgLuBuuMt2tctCN9r1kIUCST4"
);
import { fetchRandomProps } from "../supabaseClient";

const Live =  () => {
  const navigation = useNavigation();
  const [picks, setPicks] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('player_a');
  const [phoneNumber, setPhoneNumber] = useState("1234567890");
  const [phoneNumberValidated, setPhoneNumberValidated] = useState(false);
  const [choices, setChoices] = useState({});
  const [numPicks, setNumPicks] = useState(0);

  useEffect(() => {
    const fetchProps = async () => {
      const user = await fetchRandomProps(); // Assuming this returns an ID or null
      // Assuming there's another function or logic here to fetch user details by userId
      setPicks(user);
    };

    fetchProps();
  }, []);

  const validatePhoneNumber = (number) => {
    // Example: Validate based on length and/or a regex pattern
    return number.trim().length === 10; // Basic validation for example
  };

  const handleSubmitPhoneNumber = () => {
    if (validatePhoneNumber(phoneNumber)) {
      // If phone number is valid, update state and potentially perform other actions
      setPhoneNumberValidated(true);
      // Alert.alert("Success", "Phone number accepted.");
    } else {
      // If validation fails, keep the input visible and inform the user
      Alert.alert("Error", "Please enter a valid phone number.");
    }
  };

  // const handleResult = async (result, choice) => {
  //   const pickIndex = picks.findIndex((pick) => pick.uid === choice);
    
  //   // Package choice and result into a JSON array
  //   const resultData = {
  //     choice,
  //     result,
  //   };
  //   console.log(resultData)
  //   const updatedPicks = [...picks];
  //   // Check if the item was found
  //   if (pickIndex !== -1) {
  //     // Remove the item from the picks data

  //     updatedPicks.splice(pickIndex, 1);
  //     // Log the updated picks data and the resultData array
  //   } else {
  //     console.error(`Item with id ${uid} not found in picks data.`);
  //   }
  //   // if session
  //   console.log("ASDSAd")
  //   await createNewGame(resultData, [updatedPicks]);
  //   try {
  //   const shareResponse = await Share.share({
  //     message: 'Check out this game!', // Your message or game details to share
  //     // You can also specify a URL, title, etc.
  //   });

  //   if (shareResponse.action === Share.sharedAction) {
  //     console.log('Game details shared.');
  //   } else if (shareResponse.action === Share.dismissedAction) {
  //     console.log('Share dialog dismissed.');
  //   }
  // } catch (error) {
  //   console.error('Error sharing:', error.message);
  // }
  // navigation.navigate('Matchmaking');
  // };

  const handleSoloResult = async (result, choice) => {
    // Assuming 'picks' is an array of objects and 'choice' is the UID you're matching
    const pickIndex = picks.findIndex(pick => pick.uid === choice);
    let prop = 'i'; // Initialize prop outside the if block to make it accessible later
  
    // Ensure we found a pick before proceeding
    if (pickIndex !== -1) {
      const pick = picks[pickIndex]; // Get the pick object
      const resultData = { choice, result }; // Assuming 'result' is defined elsewhere
  
      // Construct 'prop' using the pick object
      prop = `${pick.description || ''} ${pick.key || ''} ${pick.point || ''}`;
      // Further actions using 'resultData' and 'prop'
    } else {
      console.log('Pick not found');
      // Handle the case where the pick is not found
      return; // Exit the function early if the pick is not found
    }
  
    // Now 'prop' is accessible here
    // Update the choices state
    setChoices(prevChoices => ({
      ...prevChoices,
      [choice]: { player: currentPlayer, result, prop }
    }));
  
    // Switch to the next player after logging the pick
    setNumPicks((prevNumPicks) => prevNumPicks + 1);
    setCurrentPlayer(currentPlayer === 'player_a' ? 'player_b' : 'player_a');
  };
  
  
  useEffect(() => {
    // Check if all 5 picks have been made
    if (numPicks === 5) {
      // Call function to create a new game row in the database
      createNewGameRow();
    }
  }, [numPicks]);

  const logPick = async (pickData, player) => {
    // Logic to log the pick for the current player
    // This is a placeholder for the actual implementation, which depends on your backend
    console.log(`Logging pick for ${player}:`, pickData);
    // You might want to update the game state in your backend here
  };

  const createNewGame = async (selectedPick, remainingPicks) => {
    try {
      // Update the picks_a column with the selected pick for the specified user
      const { data: newGame, error: createGameError } = await supabase
        .from("pre_rivals")
        .insert([{player_a:phoneNumber, picks_a: selectedPick, un_picked: remainingPicks }])
        .select();

      if (createGameError) {
        console.error("Error updating picks_a:", createGameError.message);
        return;
      }
      setGameId(newGame[0].game_id);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const createNewGameRow = async () => {
    let picks_a = {};
    let picks_b = {};

    // Iterate through the choices and categorize them into picks_a or picks_b based on the player
    Object.entries(choices).forEach(([choiceID, { player, result,prop }]) => {
      if (player === "player_a") {
        picks_a[choiceID] = { result, prop };
      } else if (player === "player_b") {
        picks_b[choiceID] = { result, prop };
      }
    });

    try {
      const { data, error } = await supabase
        .from('pre_rivals')
        .insert([{
          picks_a: JSON.stringify(picks_a),
          picks_b: JSON.stringify(picks_b),
          player_a: phoneNumber,
        }]);

      if (error) {
        console.error('Error inserting data:', error);
        return;
      }

      console.log('Success, inserted data:', data);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }
  if (!phoneNumberValidated) {
    return (
      <View style={styles.textContainer}>
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
    <SafeAreaView style={{flex: 1, backgroundColor: "#121212",}}>
    <ScrollView contentContainerStyle={styles.container} >
      <View style={{marginTop: 50}}>
        {picks.map((pick) => (
          <Card key={pick.uid} style={styles.commonCard}>
            <Card.Content>
              <Title style={styles.titleText}>
                {pick.description}
              </Title >
              {/* Additional details */}
              <Paragraph style={styles.subText}> {pick.key} {pick.point}</Paragraph>

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
                        onPress={() => handleSoloResult("Over", pick.uid)}
                      >
                        <Title style={styles.buttonText}>Over</Title>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.loseButton]}
                        onPress={() => handleSoloResult("Under", pick.uid)}
                      >
                        <Title style={styles.buttonText}>Under</Title>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Render Yes/No buttons if there is no point value
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.winButton]} // Consider changing the style if you want different colors for Yes/No
                        onPress={() => handleSoloResult("Yes", pick.uid)}
                      >
                        <Title style={styles.buttonText}>Yes</Title>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.loseButton]} // Consider changing the style if you want different colors for Yes/No
                        onPress={() => handleSoloResult("No", pick.uid)}
                      >
                        <Title style={styles.buttonText}>No</Title>
                      </TouchableOpacity>
                    </>
                  )} 
                </View>
              )}
            </Card.Content>
          </Card>
        ))}

      </View>
    </ScrollView>
    </SafeAreaView>
  );
        }
};

export default Live;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    alignItems: "center",
    paddingBottom: 50,
    height: '10vh', // Full viewport height
    
  },
  textContainer: {
    backgroundColor: "#121212",
    alignItems: "center",
    paddingBottom: 50,
    height: '100vh', // Full viewport height
    
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
