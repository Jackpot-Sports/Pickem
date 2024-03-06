import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {s} from 'react-native-size-matters';
import {AppFontStyle} from '../utility/AppFontStyle';
import {AppImages} from '../utility/AppImages';
import { AppColors } from '../utility/AppColors';
import { fetchRivals,getUsers } from '../supabaseClient';
import supabase from '../supabaseClient';

const History = () => {
  const [head2Head, setHead2Head] = useState(true);
  const [groupPlay, setGroupPlay] = useState(false);
  const [rivals, setRivals] = useState([]);

  const [arrHistory, setArrHistory] = useState([
    {
      id: 1,
      title: '@lilretweet',
      result: 'W',
    },
    {
      id: 2,
      title: '@icyguap',
      result: 'L',
    },
    {
      id: 3,
      title: '@slumlord',
      result: 'L',
    },
    {
      id: 4,
      title: '@rpad41',
      result: 'W',
    },
    {
      id: 5,
      title: '@lilcoochieslice',
      result: 'W',
    },
    {
      id: 6,
      title: '@teamonkey',
      result: 'W',
    },
  ]);

  // useEffect(() => {
  //   const fetchAndSetRivals = async () => {
  //     try {
  //       const userId = 'eeww';
  //       const { data, error } = await supabase
  //       .from('pre_rivals')
  //       .select('*')
  //       // .or(`player_a.eq.${userId},player_b.eq.${userId}`);
  //       .eq("player_a", userId);

  //       if (error) {
  //         console.error('Error fetching rivals:', error);
  //         return [];
  //       }

  //     } catch (error) {
  //       console.error("Error:", error.message);
  //     }
  //   }
  //   fetchAndSetRivals();
  // }, []);
  

  return (
    <View style={styles.container}>
      <View style={styles.headGroupButtonBgViewStyle}>
        <ButtonHead2Head />
        <ButtonGroupPlay />
      </View>

      <View
        style={{
          marginVertical: s(7),
          marginHorizontal: 20,
        }}>
        <Text
          style={[
            // AppFontStyle.BOLD_Poppins_12,
            {color: AppColors.grayColor_AEB0B4, marginBottom: 5},
          ]}>
          STATS
        </Text>
        <StatsTitleValue
          leftTitle={'MATCHES PLAYED'}
          leftValue={'246'}
          rightTitle={'PICK ACCURACY'}
          rightValue={'59%'}
        />
        <StatsTitleValue
          leftTitle={'MATCHES WON'}
          leftValue={'153'}
          rightTitle={'MONEY WON'}
          rightValue={'$435'}
        />
        <StatsTitleValue
          leftTitle={'WIN PCT'}
          leftValue={'62.2%'}
          rightTitle={''}
          rightValue={''}
        />
      </View>

      <View
        style={{height: 2, backgroundColor: '#505050', marginVertical: 1}}
      />
      <FlatList
        style={{paddingHorizontal: 20}}
        data={arrHistory}
        renderItem={({item, index}) => (
          // List Cell View
          <HistoryView item={item} />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );

  function ButtonHead2Head(params) {
    return (
      <TouchableOpacity
        style={[
          styles.headGroupButtonStyle,
          {
            backgroundColor: head2Head
              ? AppColors.grayColor_676767
              : AppColors.gray_363636,
          },
        ]}
        onPress={() => {
          setHead2Head(true);
          setGroupPlay(false);
        }}>
        <Text
          style={[
            // AppFontStyle.BOLD_Poppins_14,
            {
              color: head2Head ? AppColors.themeColor_E98C49 : AppColors.white,
            },
          ]}>
          HEAD 2 HEAD
        </Text>
      </TouchableOpacity>
    );
  }

  function ButtonGroupPlay(params) {
    return (
      <TouchableOpacity
        style={[
          styles.headGroupButtonStyle,
          {
            backgroundColor: groupPlay
              ? AppColors.grayColor_676767
              : AppColors.gray_363636,
          },
        ]}
        onPress={() => {
          setHead2Head(false);
          setGroupPlay(true);
        }}>
        <Text
          style={[
            // AppFontStyle.BOLD_Poppins_14,
            {
              color: groupPlay ? AppColors.themeColor_E98C49 : AppColors.white,
            },
          ]}>
          GROUP PLAY
        </Text>
      </TouchableOpacity>
    );
  }

  function StatsTitleValue(params) {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: s(20),
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
          }}>
          <Text
            style={[
              // AppFontStyle.BOLD_Poppins_12,
              {
                color: AppColors.white,
                marginBottom: 5,
              },
            ]}>
            {params.leftTitle}
          </Text>
          <Text
            style={[
              // AppFontStyle.BOLD_Poppins_12,
              {
                color: AppColors.white,
                marginBottom: 5,
              },
            ]}>
            {params.leftValue}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
          }}>
          <Text
            style={[
              // AppFontStyle.BOLD_Poppins_12,
              {
                color: AppColors.white,
                marginBottom: 5,
              },
            ]}>
            {params.rightTitle}
          </Text>
          <Text
            style={[
              // AppFontStyle.BOLD_Poppins_12,
              {
                color: AppColors.white,
                marginBottom: 5,
              },
            ]}>
            {params.rightValue}
          </Text>
        </View>
      </View>
    );
  }

  function HistoryView(params) {
    const dict = params.item;
    // console.log('dict:- ', dict);
    return (
      <View
        style={{
          marginTop: s(20),
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {/* Left User Image and nickname View */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(8),
              // flexGrow: 3,
            }}>
            <View
              style={{
                height: s(40),
                width: s(40),
                backgroundColor: '#505050',
                marginLeft: 15,
                borderRadius: s(20),
              }}></View>
            <Text
              style={[ {color: AppColors.white}]}>
              {dict.title}
            </Text>
          </View>

          {/* Right Data View */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: s(8),
              // flexGrow: 2,
              justifyContent: 'flex-end',
            }}>
            <Text
              style={[
                // AppFontStyle.SEMIBOLD_Poppins_16,
                {color: dict.result === 'W' ? 'green' : 'red'},
              ]}>
              {dict.result + '  '}
              <Text
                style={[
                  // AppFontStyle.SEMIBOLD_Poppins_16,
                  {color: AppColors.white},
                ]}>
                2-3
              </Text>
            </Text>
            <Text
              style={[
                // AppFontStyle.BOLD_Poppins_10,
                {color: AppColors.white, textAlign: 'center'},
              ]}>
              {'VIEW\n RESULTS'}
            </Text>
            <Image
              source={AppImages.ic_expandRightDouble}
              style={{
                height: s(30),
                width: s(30),
                resizeMode: 'contain',
              }}
            />
          </View>
        </View>

        {/* Separater */}
        <View
          style={{
            height: 3,
            backgroundColor: '#505050',
            marginTop: 15,
          }}></View>
      </View>
    );
  }
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    // alignItems: 'center',
  },
  headGroupButtonBgViewStyle: {
    marginTop: 10,
    marginHorizontal: 10,
    // backgroundColor: AppColors.grayColor_676767,
    height: 50,
    flexDirection: 'row',
    gap: s(25),
    paddingHorizontal: s(23),
    // paddingHorizontal: s(20),
  },
  headGroupButtonSelectedStyle: {
    backgroundColor: AppColors.grayColor_676767,
  },
  headGroupTextSelectedStyle: {
    color: AppColors.themeColor_E98C49,
  },
  headGroupButtonStyle: {
    backgroundColor: 'red',
    marginVertical: s(6),
    flexGrow: 1,
    borderRadius: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.gray_363636,
  },
  commonCard: {
    borderRadius: 14,
    borderWidth: 1,
    // marginTop: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  overCard: {
    backgroundColor: '#16B7B8',
  },
  underCard: {
    backgroundColor: '#FF563C',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff', // Use your app's color scheme
  },
  subText: {
    fontSize: 16,
    color: '#fff', // Use your app's color scheme
    marginTop: 4,
  },
  dropdownButton: {
    backgroundColor: '#252525', // Set the dropdown background color
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  dropdownButtonText: {
    color: '#FFFFFF', // Set the label text color to white
    fontSize: 16,
    textAlign: 'center',
  },
  dropDowns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
});
