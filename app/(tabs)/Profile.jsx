import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Colors from './../../constants/Colors';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Using MaterialIcons as an example
import { getLocalStorage, clearLocalStorage } from '../../service/Storage';

export default function Profile() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch user details when the component loads
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userData = await getLocalStorage('userDetail');
      setUser(userData);
    };
    fetchUserDetails();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      // Clear local storage or remove user session
      await clearLocalStorage(); // Make sure this clears 'userDetail'
      router.replace('/login'); // Navigate back to the login page
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 20, gap: 30 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30 }}>Profile</Text>

      {/* User Profile Section */}
      <View style={{ display: 'flex', alignItems: 'center', marginVertical: 25 }}>
        {user?.imageUrl ? (
          <Image
            source={{ uri: user.imageUrl }}
            style={{ width: 80, height: 80, borderRadius: 99 }}
          />
        ) : (
          <Icon name="account-circle" size={80} color={Colors.GRAY} />
        )}
        <Text style={{ fontFamily: 'outfit-Bold', fontSize: 20, marginTop: 6 }}>
          {user?.displayName || 'User Name'}
        </Text>
        <Text style={{ fontFamily: 'outfit', fontSize: 16, color: Colors.GRAY }}>
          {user?.email || 'Email Address'}
        </Text>
      </View>

   

      {/* Logout Button */}
      <TouchableOpacity
        style={{
          backgroundColor: 'black',
          padding: 15,
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={handleLogout}
      >
        <Icon name="logout" size={24} color="white" />
        <Text style={{ fontFamily: 'outfit-medium', fontSize: 18, color: 'white', marginLeft: 8 }}>
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
