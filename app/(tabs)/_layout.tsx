import React from 'react';
import { Tabs } from 'expo-router';
import { MessageCircle, Zap, Bookmark, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.backgroundSecondary,
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: Colors.light.accent,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Limnus',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: focused ? Colors.light.accent + '30' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? Colors.light.accent + '50' : 'transparent',
            }}>
              <MessageCircle size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Field',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: focused ? Colors.light.accent + '30' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? Colors.light.accent + '50' : 'transparent',
            }}>
              <Zap size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Auth',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: focused ? Colors.light.accent + '30' : 'transparent',
              borderWidth: focused ? 1 : 0,
              borderColor: focused ? Colors.light.accent + '50' : 'transparent',
            }}>
              <Shield size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}