import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Test Component</Text>
      <Text style={styles.subtext}>This should be visible</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
  },
});
