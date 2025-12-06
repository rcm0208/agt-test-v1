import React from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Divider, FAB, IconButton, List, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";

import { useWorkout } from "../../../context/WorkoutContext";

export default function PlanListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { plans, deletePlan } = useWorkout();

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Plan", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePlan(id) },
    ]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`${item.exercises.length} exercises`}
            onPress={() =>
              router.push({ pathname: "/plan/editor", params: { id: item.id } })
            }
            right={(props) => (
              <IconButton
                {...props}
                icon="delete"
                onPress={() => handleDelete(item.id, item.name)}
              />
            )}
          />
        )}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <List.Subheader>No plans yet. Create one!</List.Subheader>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push("/plan/editor")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
