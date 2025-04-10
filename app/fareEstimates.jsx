// app/fareEstimates.jsx

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { calculateFareEstimates } from "../utils/fareCalculator";
import Colors from "../constants/Colors";

export default function FareEstimatesScreen({ route }) {
  // Expect route.params to have pickupLocation and dropLocation.
  const { pickupLocation, dropLocation } = route.params;
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Example:

  useEffect(() => {
    try {
      // Calculate fares locally.
      const estimates = calculateFareEstimates(pickupLocation, dropLocation);
      setFares(estimates);
    } catch (err) {
      console.error("Error calculating fares:", err);
      setError("Error calculating fares");
    } finally {
      setLoading(false);
    }
  }, [pickupLocation, dropLocation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Fare Estimates</Text>
      <FlatList
        data={fares}
        keyExtractor={(item) => item.service}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.serviceName}>{item.service}</Text>
            <Text>{item.fareRange}</Text>
            <Text>{`${item.duration} min • ${item.distance} km`}</Text>
            <Text>{`Surge: ${item.surgeMultiplier}x`}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
  },
  serviceName: {
    fontWeight: "bold",
    fontSize: 18,
  },
});
