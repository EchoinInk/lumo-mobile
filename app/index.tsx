import React from "react";
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      
      {/* Header */}
      <View style={{ marginTop: 40, marginBottom: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: "600" }}>
          Lumo
        </Text>
        <Text style={{ opacity: 0.6, marginTop: 4 }}>
          Today’s focus
        </Text>
      </View>

      {/* Focus Card */}
      <View
        style={{
          padding: 20,
          borderRadius: 16,
          backgroundColor: "#f4f4f5",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          No tasks yet
        </Text>
        <Text style={{ opacity: 0.6, marginTop: 6 }}>
          Add your first task to get started
        </Text>
      </View>

    </View>
  );
}