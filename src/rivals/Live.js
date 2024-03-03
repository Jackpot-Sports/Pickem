import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
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

const Live =  () => {
  const navigation = useNavigation();
  const [picks, setPicks] = useState([]);
  // const [choice, setChoice] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberValidated, setPhoneNumberValidated] = useState(false);
  const [gameId, setGameId] = useState("");
  useEffect(() => {
    const fetchRandomPicks = async () => {
      try {
        // Fetch 3 random rows from the bet_pool table
        const { data, error } = await supabase
          .from("bet_pool")
          .select("id, home_team, away_team")
          .order("id", { ascending: false });
        // .range(0, 2); // Change the range to match the number of picks you want

        if (error) {
          console.error("Error fetching picks:", error.message);
        } else {
          const shuffledPicks = shuffleArray(data);

          // Select the first 3 picks (or fewer if there are fewer than 3)
          const randomPicks = shuffledPicks.slice(0, 3);

          setPicks(randomPicks);
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    fetchRandomPicks();
  }, []);
  const validatePhoneNumber = (number) => {
    // Example: Validate based on length and/or a regex pattern
    return number.trim().length === 10; // Basic validation for example
  };
  const handleResult = async (result, choice) => {
    const pickIndex = picks.findIndex((pick) => pick.id === choice);
    
    // Package choice and result into a JSON array
    const resultData = {
      choice,
      result,
    };
    console.log(resultData)
    const updatedPicks = [...picks];
    // Check if the item was found
    if (pickIndex !== -1) {
      // Remove the item from the picks data

      updatedPicks.splice(pickIndex, 1);
      // Log the updated picks data and the resultData array
    } else {
      console.error(`Item with id ${id} not found in picks data.`);
    }
    // if session
    console.log("ASDSAd")
    await createNewGame(resultData, [updatedPicks]);
    try {
    const shareResponse = await Share.share({
      message: 'Check out this game!', // Your message or game details to share
      // You can also specify a URL, title, etc.
    });

    if (shareResponse.action === Share.sharedAction) {
      console.log('Game details shared.');
    } else if (shareResponse.action === Share.dismissedAction) {
      console.log('Share dialog dismissed.');
    }
  } catch (error) {
    console.error('Error sharing:', error.message);
  }
  navigation.navigate('Matchmaking');
  };

  const handleSubmitPhoneNumber = () => {
    if (validatePhoneNumber(phoneNumber)) {
      // If phone number is valid, update state and potentially perform other actions
      setPhoneNumberValidated(true);
      Alert.alert("Success", "Phone number accepted.");
    } else {
      // If validation fails, keep the input visible and inform the user
      Alert.alert("Error", "Please enter a valid phone number.");
    }
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
  if (!phoneNumberValidated) {
    return (
      <View style={styles.container}>
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
      <View>
        {picks.map((pick) => (
          <Card key={pick.id} style={styles.commonCard}>
            <Card.Content>
              <Title style={styles.titleText}>
                {pick.home_team} vs {pick.away_team}
              </Title>
              {/* Additional details */}
              <Paragraph>Additional details...</Paragraph>

              {/* Buttons for Win and Lose */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.winButton]}
                  onPress={() => handleResult("Win", pick.id)}
                >
                  <Title style={styles.buttonText}>Win</Title>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.loseButton]}
                  onPress={() => handleResult("Lose", pick.id)}
                >
                  <Title style={styles.buttonText}>Lose</Title>
                </TouchableOpacity>
              </View>
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
    marginTop: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: "column",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    width: "40%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  winButton: {
    backgroundColor: "#4CAF50", // Green color
  },
  loseButton: {
    backgroundColor: "#F44336", // Red color
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },
  subText: {
    fontSize: 16,
    color: "#000000",
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
    color: "#000000", // Text color
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
