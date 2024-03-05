import { createClient } from "@supabase/supabase-js";
import { LogBox } from "react-native";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://aohggynmsqurtpszrgin.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaGdneW5tc3F1cnRwc3pyZ2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM1MDMyMzUsImV4cCI6MjAwOTA3OTIzNX0.wj2GWnQ6vsoph6Vs17GgLuBuuMt2tctCN9r1kIUCST4";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUserID() {
  return supabase;
}

export async function fetchRivals(userId) {
  const { data, error } = await supabase
    .from('pre_rivals')
    .select('*')
    // .or(`player_a.eq.${userId},player_b.eq.${userId}`);
    .eq("player_a", userId);

  if (error) {
    console.error('Error fetching rivals:', error);
    return [];
  }

  return data;
}

export async function getCurrentUserId() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }


    const { data } = await supabase
      .from('users')
      .select('*') // Adjust to select specific columns if needed
      .eq('uid', user.id) // Ensure 'uid' matches the column name in your table
      .single(); 

    return data
  } catch (error) {
    console.error('Unexpected error in getCurrentUserId:', error);
    return null;
  }
}

export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("uid, display_name");

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}


export async function fetchRandomPicks() {
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  try {
    const { data, error } = await supabase
      .from("bet_pool")
      .select("id, home_team, away_team")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching picks:", error.message);
      return []; // Return an empty array or handle the error as needed
    } else {
      const shuffledPicks = shuffleArray(data || []);
      const randomPicks = shuffledPicks.slice(0, 3); // Select the first 3 picks
      return randomPicks; // Return the shuffled and sliced picks array
    }
  } catch (error) {
    console.error("Error:", error.message);
    return []; // Return an empty array or handle the error as needed
  }
}

export async function fetchRandomProps() {
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  try {
    const { data, error } = await supabase
      .from("prop_bets")
      .select("key, description, point,uid");

    if (error) {
      console.error("Error fetching picks:", error.message);
      return []; // Return an empty array or handle the error as needed
    } else {
      const shuffledPicks = shuffleArray(data || []);
      const randomPicks = shuffledPicks.slice(0, 3); // Select the first 3 picks
      return randomPicks; // Return the shuffled and sliced picks array
    }
  } catch (error) {
    console.error("Error:", error.message);
    return []; // Return an empty array or handle the error as needed
  }
}

export const handleGameSelection = async (gameDetails, pickId, result, userId) => {
  // Parsing the nested un_picked array correctly
  const parsedUnPicked = JSON.parse(gameDetails.un_picked[0]);
  const updatedUnPicked = parsedUnPicked.filter(pick => JSON.parse(pick).id !== pickId);

  // Determine the user's role and prepare updates for picks_a or picks_b
  const userRole = userId === gameDetails.player_a ? 'picks_a' : 'picks_b';
  const updatedPicks = { id: pickId, result: result }; // Assuming the latest pick should overwrite

  // Preparing the update payload
  const updates = {
    un_picked: JSON.stringify([updatedUnPicked]), // Ensuring the structure matches the original
    [userRole]: updatedPicks, // Directly setting the latest pick, assuming overwrite
    active_player: gameDetails.player_a === userId ? gameDetails.player_b : gameDetails.player_a, // Switching active player
  };

  // Execute the update
  const { data, error } = await supabase
    .from('pre_rivals')
    .update(updates)
    .eq('game_id', gameDetails.game_id);

  if (error) {
    console.error('Error updating game:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
};

export async function getActivePlayerGames() {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.error('No current user ID found.');
      return [];
    }

    const { data, error } = await supabase
      .from('pre_rivals')
      .select('*')
      .eq('active_player', currentUserId)
      //.not('status', 'eq', 'inactive');

    if (error) {
      console.error('Error fetching active player games:', error);
      return [];
    }
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error in getActivePlayerGames:', error);
    return [];
  }
}

// console.log("supabase client initialized client:", supabase);
export default supabase;
