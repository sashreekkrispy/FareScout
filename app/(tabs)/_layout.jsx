import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getLocalStorage } from '../../service/Storage';

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    GetUserDetail();
  }, []);

  const GetUserDetail = async () => {
    const userInfo = await getLocalStorage('userDetail');
    if (!userInfo) {
      router.replace('/login');
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => {
            return <MaterialIcons name="home" size={size} color={color} />;
          },
        }}
      />
     
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => {
            return <MaterialIcons name="account-circle" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
