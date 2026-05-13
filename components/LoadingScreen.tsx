import React from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
}

export default function LoadingScreen({ visible, message = 'Loading...' }: LoadingScreenProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <LottieView
            source={require('../assets/animation/Loding.json')}
            autoPlay
            loop
            style={styles.lottie}
            colorFilters={[
              {
                keypath: '**', // Target all paths in the Lottie animation
                color: '#1A3F75', // Base blue theme color
              },
            ]}
          />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    minWidth: 200,
  },
  lottie: {
    width: 120,
    height: 120,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3F75',
    letterSpacing: 0.5,
  },
});
