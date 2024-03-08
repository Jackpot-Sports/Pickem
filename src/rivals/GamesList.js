import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getActivePlayerGames } from '../supabaseClient';

const GamesList = ({ navigation }) => {
  const [games, setGames] = useState([]);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesData = await getActivePlayerGames();
        console.log(gamesData)
        if (gamesData.length === 0) {
          setLoadingError(true);
        } else {
          setGames(gamesData);
          setLoadingError(false);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setLoadingError(true);
      }
    };
  
    fetchGames();
  }, []);
  const goGame= (item)=>{
    console.log(item.game_id)
    navigation.navigate('GameDetails', { gameId: item.game_id })
  }
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => goGame(item)}

    >
      <Text style={styles.title}>Game ID: {item.game_id}</Text>
      {/* Display more details as needed */}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {loadingError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>No games found.</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          renderItem={renderItem}
          keyExtractor={item => item.game_id.toString()}
        />
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default GamesList;
