import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet,ScrollView,TextInput,Button,SafeAreaView } from 'react-native';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aohggynmsqurtpszrgin.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaGdneW5tc3F1cnRwc3pyZ2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM1MDMyMzUsImV4cCI6MjAwOTA3OTIzNX0.wj2GWnQ6vsoph6Vs17GgLuBuuMt2tctCN9r1kIUCST4"
);

const fetchGames = async (phoneNumber) => {
  let { data: games, error } = await supabase
    .from('pre_rivals')
    .select('*') // Select all fields; adjust accordingly
    // Check if the phone number matches either player_a or player_b
    .or(`player_a.eq.${phoneNumber},player_b.eq.${phoneNumber}`);

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return games;
};

  

const History = () => {
    const [games, setGames] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneNumberValidated, setPhoneNumberValidated] = useState(false);


    const validatePhoneNumber = (number) => {
      // Example: Validate based on length and/or a regex pattern
      return number.trim().length === 10; // Basic validation for example
    };
  
    const handleSubmitPhoneNumber = async () => {
      if (validatePhoneNumber(phoneNumber)) {
        setPhoneNumberValidated(true);
        const fetchedGames = await fetchGames(phoneNumber);
        setGames(fetchedGames);
      } else {
        Alert.alert("Error", "Please enter a valid phone number.");
      }
    };

    
  
    const renderItem = ({ item }) => {
        // Parse the picks JSON strings
        const picksA = JSON.parse(item.picks_a || '{}');
        const picksB = JSON.parse(item.picks_b || '{}');
      
        // Extract and format the prop information for display
        const displayPicksA = Object.values(picksA).map(({result, prop}) => `${prop}: ${result}`).join('\n');
        const displayPicksB = Object.values(picksB).map(({result, prop}) => `${prop}: ${result}`).join('\n');
      
        return (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              // Placeholder for any action you want to take when an item is pressed
              console.log('Selected game:', item);
            }}
          >
            <Text style={styles.title}>Picks A:</Text>
            <Text>{displayPicksA}</Text>
            <Text style={styles.title}>Picks B:</Text>
            <Text>{displayPicksB}</Text>
          </TouchableOpacity>
        );
    };
    
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
      <View style={styles.container}>
        <FlatList
            data={games}
            renderItem={renderItem}
            keyExtractor={item => item.game_id?.toString()}
        />
      </View>
      </ScrollView>
      </SafeAreaView>
    );
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#121212",
      alignItems: "center",
      height: '10vh',
    },
    textContainer: {
      backgroundColor: "#121212",
      alignItems: "center",
      paddingBottom: 50,
      height: '100vh', // Full viewport height
      
    },
    item: {
      backgroundColor: '#f9c2ff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 16,
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

export default History;