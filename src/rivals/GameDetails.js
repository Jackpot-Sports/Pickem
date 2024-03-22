import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useRoute } from '@react-navigation/native';
import supabase from "../supabaseClient";
import {getCurrentPlayerInGame,getUserIDOfPlayer} from "../supabaseClient"
const GameDetails = () => {
  const [gameDetails, setGameDetails] = useState(null);
  const [unPickedBets, setUnPickedBets] = useState([]);
  const [user,setUser] = useState()
  const route = useRoute();
  const { gameId } = route.params;

  useEffect(() => {
    const loadGameDetails = async () => {
        const { data: userResponse } = await supabase.auth.getUser();
        const user = userResponse.user;
        setUser(user)
        if (!gameId) {
            Alert.alert("Error", "Game ID is required.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from("pre_rivals")
                .select("*")
                .eq("game_id", gameId)
                .single();

            if (error) {
                console.error("Error fetching game details:", error.message);
                Alert.alert("Error", "Failed to load game details.");
            } else {
                console.log(data);
                setGameDetails(data);
                // Correctly parse 'picks_a' if needed here or in the rendering logic
                if (data && data.un_picked) {
                    const unpickedIds = data.un_picked; // Assuming this is already an array of IDs
                    loadUnpickedBets(unpickedIds);
                }
            }
        } catch (error) {
            console.error("Error:", error.message);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    loadGameDetails();
}, [gameId]);

const loadUnpickedBets = async (unpickedIds) => {
    try {
      //   IF WE CHANGE WHERE WE ARE PULLING PROPBETS FROM THIS IS WHERE WE CHANGE IT
        const { data, error } = await supabase
            .from("ufc_events")
            .select("*")
            .in("id", unpickedIds);
        console.log(unpickedIds)
        console.log(data)
        if (error) {
            throw error;
        }

        setUnPickedBets(data);
    } catch (error) {
        console.error("Failed to load unpicked bets:", error.message);
        Alert.alert("Error", "Failed to load unpicked bets.");
    }
};


  const handleSelection = async (choiceid, result) => {
  // Remove the selected bet ID from the list of unpicked bets
  const updatedUnpickedIds = unPickedBets
    .filter(bet => bet.id !== choiceid)
    .map(bet => bet.id);

  const currentPlayerActiveData = await getCurrentPlayerInGame(gameId);
  const currentActivePlayer = currentPlayerActiveData.data[0].currentPlayer;
  const picksKey = currentActivePlayer === 'player_a' ? 'picks_a' : 'picks_b';

  // Attempt to parse the existing picks for the current player
  let existingPicks = {};
  if (gameDetails[picksKey]) {
    try {
      existingPicks = JSON.parse(gameDetails[picksKey]);
    } catch (error) {
      console.error("Error parsing existing picks:", error);
      // Handle error (e.g., malformed JSON)
    }
  }

  // Add the new pick to the existing picks
  const updatedPicks = { ...existingPicks, [choiceid]: { result } };

  let updateData = {
    [picksKey]: JSON.stringify(updatedPicks), // Convert the updated picks back to a JSON string
    un_picked: updatedUnpickedIds,
    currentPlayer: currentActivePlayer === 'player_a' ? 'player_b' : 'player_a',
  };

  // Updating the database with the new picks and unpicked bets
  try {
    const { data, error } = await supabase
      .from('pre_rivals')
      .update(updateData)
      .match({ game_id: gameId });

    if (error) {
      console.error('Error updating data:', error);
      Alert.alert('Update Failed', error.message);
      return;
    }

    console.log('Success, updated data:', data);
    // navigation.navigate('Matchmaking');
    const url = 'https://pickems.netlify.app'
    await Linking.openURL(url)
  } catch (error) {
    console.error('Unexpected error:', error);
    Alert.alert('Error', 'An unexpected error occurred.');
  }
};


  if (!gameDetails) {
    return (
      <View style={styles.container}>
        <Text>Loading game details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "#121212"}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          {unPickedBets.map((bet) => (
            <Card key={bet.id} style={styles.commonCard}>
              <Card.Content>
                <Title style={styles.titleText}>
                  {bet.home} vs {bet.away}
                </Title>
                <Paragraph style={styles.subText}>
                  {bet.category} {bet.point}
                </Paragraph>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.winButton]}
                    onPress={() => handleSelection(bet.id, 'Win')}>
                    <Text style={styles.buttonText}>Win</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.loseButton]}
                    onPress={() => handleSelection(bet.id, 'Lose')}>
                    <Text style={styles.buttonText}>Lose</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default GameDetails;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    alignItems: "center",
    paddingBottom: 50,
    height: '10vh', // Full viewport height
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
