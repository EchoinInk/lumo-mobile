import { TabBarBackground, TabBarIcon } from "@/src/components/navigation";
import { Colors } from "@/src/theme/tokens";
import { Tabs } from "expo-router";
import {
    CalendarDays,
    CheckSquare,
    HeartPulse,
    LayoutGrid,
    Menu,
} from "lucide-react-native";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 68,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {(LayoutGrid as any)({
                size: 24,
                color: focused ? Colors.primary : Colors.textSecondary,
                strokeWidth: 2,
              })}
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {(CheckSquare as any)({
                size: 24,
                color: focused ? Colors.primary : Colors.textSecondary,
                strokeWidth: 2,
              })}
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {(CalendarDays as any)({
                size: 24,
                color: focused ? Colors.primary : Colors.textSecondary,
                strokeWidth: 2,
              })}
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {(HeartPulse as any)({
                size: 24,
                color: focused ? Colors.primary : Colors.textSecondary,
                strokeWidth: 2,
              })}
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              {(Menu as any)({
                size: 24,
                color: focused ? Colors.primary : Colors.textSecondary,
                strokeWidth: 2,
              })}
            </TabBarIcon>
          ),
        }}
      />
    </Tabs>
  );
}
