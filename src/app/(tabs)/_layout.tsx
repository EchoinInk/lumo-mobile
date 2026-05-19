import { TabBarBackground, TabBarIcon } from '@/components/navigation';
import { Colors } from '@/theme/tokens';
import { Tabs } from 'expo-router';
import { CalendarDays, CheckSquare, HeartPulse, LayoutGrid, Menu } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <LayoutGrid 
                size={24} 
                color={focused ? Colors.primary : Colors.textSecondary} 
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <CheckSquare 
                size={24} 
                color={focused ? Colors.primary : Colors.textSecondary} 
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <CalendarDays 
                size={24} 
                color={focused ? Colors.primary : Colors.textSecondary} 
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <HeartPulse 
                size={24} 
                color={focused ? Colors.primary : Colors.textSecondary} 
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <Menu 
                size={24} 
                color={focused ? Colors.primary : Colors.textSecondary} 
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
    </Tabs>
  );
}
