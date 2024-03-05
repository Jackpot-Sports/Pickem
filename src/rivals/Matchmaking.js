import React, { useState , useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getCurrentUserId } from "../supabaseClient";
import supabase from "../supabaseClient";

const Matchmaking = ({ route }) => {
  const { game_id } = route.params;
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const goToLogin = () => {
    navigation.navigate("Login");
  };

  const goToLiveScreen = () => {
    navigation.navigate('Live', { phone: '6788962515' });
  };
  const goToGamesListScreen = () => {
    navigation.navigate("GamesList");
  };
  const goToHistoryScreen = () => {
    navigation.navigate("History");
  };
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const { data, error } = supabase.auth.getSession();
    setIsLoggedIn(!data);
    const { data2: listener } = supabase.auth.onAuthStateChange((_event, data) => {
      setIsLoggedIn(!!data);
    });

    return () => {
      // listener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (game_id != null) {
      console.log(game_id)
      console.log("Valid Game ID exists, navigating to the game..."); // Create login screen thatll connect games
      goToLiveScreen();
    } else {
      console.log("No valid game ID, staying on Matchmaking screen.");
    }
}, [game_id, navigation]);
  return (
    <View style={styles.container}>
      <Text style={[styles.titleText, { color: "#fff" }]}>Pitch</Text>
      <Text style={[styles.titleText, { color: "#fff" }]}>
        Pick DFS props against your friends
      </Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={openModal} style={styles.button}>
          <Text style={styles.titleText}>How to play</Text>
          {/* <Text style={styles.subText}>12/20 Games Remaining this Week</Text> */}
        </TouchableOpacity>

        {!isLoggedIn && (
          <TouchableOpacity onPress={goToLogin} style={styles.button}>
            <Text style={styles.titleText}>Log in</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={goToLiveScreen} style={styles.button}>
          <Text style={styles.titleText}>Play</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={goToHistoryScreen} style={styles.button}>
        <Text style={styles.titleText}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToGamesListScreen} style={styles.button}>
        <Text style={styles.titleText}>AlexTest</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text>Back</Text>
            </TouchableOpacity>
            <Text style={styles.howToPlayText}>
              Quick Guide:
              {"\n\n"}- After clicking "Draft", select from 5 player props.
              {"\n"}- Choose over or under for the projected total.
              {"\n"}- Invite a rival. Draft order: you, rival, you, then rival picks twice.
              {"\n"}- If you pick over, your rival gets under, and vice versa.
              {"\n"}- Winners are decided after real-life results are in.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  row: {
    flexDirection: "row",
    maxWidth: "60%", // Set a maximum width
    justifyContent: "center", // Center horizontally
    padding: 16,
  },
  button: {
    backgroundColor: "#e7e7e7", // Use your app's color scheme
    padding: 10,
    marginVertical: 10, // Creates space between the buttons
    marginLeft: 20,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000", // Use your app's color scheme
  },
  subText: {
    fontSize: 16,
    color: "#666", // Use your app's color scheme
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end', // Positions the close button to the right
  },
  closeButtonText: {
    // Styles for the close button text
  },
  howToPlayText: {
    marginTop: 20, // Add some spacing between the close button and the text
    // Styles for the how to play text
  },
});

export default Matchmaking;
