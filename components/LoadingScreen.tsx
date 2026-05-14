import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Animated } from 'react-native';

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
}

export default function LoadingScreen({ visible, message = 'Loading...' }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]} pointerEvents="auto">
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#1A3F75" style={{ marginBottom: 4 }} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    minWidth: 180,
  },
  text: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A3F75',
    letterSpacing: 0.3,
  },
});
