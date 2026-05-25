import { TabBarIcon } from "@/src/components/navigation";
import { BottomTabAddButton } from "@/src/components/ui/BottomTabAddButton";
import { Colors } from "@/src/theme/tokens";
import { Tabs } from "expo-router";
import { CalendarDays, Home, LayoutDashboard, Menu } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 72,
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingHorizontal: 16,
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
          title: "Start",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <Home
                size={24}
                color={focused ? Colors.primary : Colors.textSecondary}
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused}>
              <LayoutDashboard
                size={24}
                color={focused ? Colors.primary : Colors.textSecondary}
                strokeWidth={2}
              />
            </TabBarIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => <BottomTabAddButton focused={focused} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("modals/add-modal");
          },
        })}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
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
        name="more"
        options={{
          title: "More",
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
