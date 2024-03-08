import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
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
          setGameDetails(data);
          // Assuming un_picked contains unpicked prop bet uids as an array
          if (data && data.un_picked) {
            loadUnpickedBets(data.un_picked);
          }
        }
      } catch (error) {
        console.error("Error:", error.message);
        Alert.alert("Error", "An unexpected error occurred.");
      }
    };

    const loadUnpickedBets = async (unpickedUids) => {
      try {
        const { data, error } = await supabase
          .from("prop_bets")
          .select("*")
          .in("uid", unpickedUids);

        if (error) {
          throw error;
        }

        setUnPickedBets(data);
      } catch (error) {
        console.error("Failed to load unpicked bets:", error.message);
        Alert.alert("Error", "Failed to load unpicked bets.");
      }
    };

    loadGameDetails();
  }, [gameId]);

  const handleSelection = async (choiceUid, result) => {
    // Filter out the selected choiceUid from unPickedBets to get the updated list of unpicked bets
    const updatedUnpickedIds = unPickedBets
    .filter(bet => bet.uid !== choiceUid)
    .map(bet => bet.uid);
    const currentPlayerActiveData = await getCurrentPlayerInGame(gameId)
    const currentActivePlayer = currentPlayerActiveData.data[0].currentPlayer
    console.log("ASDASDSAD"+gameDetails[currentActivePlayer === 'player_a' ? 'picks_a' : 'picks_b'])
    let updateData = {
      // Update the currentPlayer's choice with the new result
      // Assuming you need to maintain the structure of picks_a or picks_b based on the currentPlayer
      [currentActivePlayer === 'player_a' ? 'picks_a' : 'picks_b']: JSON.stringify({ ...gameDetails[currentActivePlayer === 'player_a' ? 'picks_a' : 'picks_b'], [choiceUid]: { result } }),
      un_picked: updatedUnpickedIds,
      // Switch the currentPlayer
      currentPlayer: currentActivePlayer === 'player_a' ? 'player_b' : 'player_a',
    };
    const nextUserID = await getUserIDOfPlayer(updateData.currentPlayer,gameId)
    updateData.active_player = nextUserID.data[0].currentActivePlayer
    
    console.log("Updating with data:", updateData);
  
    try {
      const { data, error } = await supabase
        .from('pre_rivals')
        .update(updateData)
        .match({ game_id: gameId }); // Use the correct identifier to match the game row you're updating
  
      console.log("Update response:", { data, error });
  
      if (error) {
        console.error('Error updating data:', error);
        Alert.alert('Update Failed', error.message);
        return null;
      }
  
      console.log('Success, updated data:', data);
      navigation.navigate('Matchmaking');
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
      return null;
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
    <View style={styles.container}>
      <Text>Game ID: {gameDetails.game_id}</Text>
      {unPickedBets.map((bet, index) => (
        <Card key={index} style={styles.commonCard}>
          <Card.Content>
            <Title style={styles.titleText}>{bet.description}</Title>
            <Paragraph>Point: {bet.point}</Paragraph>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.winButton]}
                onPress={() => handleSelection(bet.uid, 'Win')}>
                <Text style={styles.buttonText}>Win</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.loseButton]}
                onPress={() => handleSelection(bet.uid, 'Lose')}>
                <Text style={styles.buttonText}>Lose</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};
export default GameDetails;

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
