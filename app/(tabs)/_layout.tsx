import { Tabs } from "expo-router";
import { Calendar, HeartPulse, Home, ListTodo, Menu } from "lucide-react-native";
import { Colors } from "@/src/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => <ListTodo size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color, size }) => <HeartPulse size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="more/index"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
        }}
      />

      {/* Hide nested More routes from tab bar */}
      <Tabs.Screen name="more/about" options={{ href: null }} />
      <Tabs.Screen name="more/budget" options={{ href: null }} />
      <Tabs.Screen name="more/cleaning" options={{ href: null }} />
      <Tabs.Screen name="more/groceries" options={{ href: null }} />
      <Tabs.Screen name="more/habits" options={{ href: null }} />
      <Tabs.Screen name="more/meals" options={{ href: null }} />
      <Tabs.Screen name="more/payments" options={{ href: null }} />
      <Tabs.Screen name="more/settings" options={{ href: null }} />
      <Tabs.Screen name="more/weight" options={{ href: null }} />
      <Tabs.Screen name="more/workouts" options={{ href: null }} />
    </Tabs>
  );
}