import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aohggynmsqurtpszrgin.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaGdneW5tc3F1cnRwc3pyZ2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM1MDMyMzUsImV4cCI6MjAwOTA3OTIzNX0.wj2GWnQ6vsoph6Vs17GgLuBuuMt2tctCN9r1kIUCST4"
);

const fetchGames = async (phoneNumber) => {
    let { data: games, error } = await supabase
      .from('pre_rivals')
      .select('*') // Select all fields; adjust accordingly
      .eq('phone', phoneNumber);
  
    if (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  
    return games;
  };

  const fetchPropBetsKeys = async (uniquePropBetIds) => {
    const { data, error } = await supabase
      .from('prop_bets')
      .select('uid, key')
      .in('uid', uniquePropBetIds);
  
    if (error) {
      console.error('Error fetching prop bets keys:', error);
      return {};
    }
  
    // Convert the array of prop bets into an object for easier access
    const propBetsKeys = data.reduce((acc, propBet) => {
      acc[propBet.uid] = propBet.key;
      return acc;
    }, {});
  
    return propBetsKeys;
  };
  
  

const History = ({navigation}) => {
    const [games, setGames] = useState([]);

    useEffect(() => {
      const phoneNumber = '6788962515'; // Example phone number
      fetchGames(phoneNumber).then(setGames);
    }, []);

    
  
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
    
  
    return (
        <View>
            <FlatList
                data={games}
                renderItem={renderItem}
                keyExtractor={item => item.game_id?.toString()}
            />
        </View>
      
      
    );
  };
  
  const styles = StyleSheet.create({
    item: {
      backgroundColor: '#f9c2ff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 16,
    },
  });

export default History;