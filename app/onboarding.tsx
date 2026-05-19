import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions, FlatList,
  Platform, Animated, StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = '@onboarding_completed';

interface OnboardingSlide {
  id: string;
  image: any;
  title: string;
  subtitle: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    image: require('../assets/images/onboarding-1.png'),
    title: 'Fast Delivery',
    subtitle: 'Pharma at Your Doorstep',
    description:
      'Streamline your pharmaceutical deliveries with real-time tracking and route optimization for maximum efficiency.',
  },
  {
    id: '2',
    image: require('../assets/images/onboarding-2.png'),
    title: 'Smart Sales',
    subtitle: 'Manage Stores Effortlessly',
    description:
      'Visit stores, create orders, track inventory, and manage your sales pipeline — all from one powerful app.',
  },
  {
    id: '3',
    image: require('../assets/images/onboarding-3.png'),
    title: 'Live Analytics',
    subtitle: 'Data-Driven Decisions',
    description:
      'Get real-time insights with interactive dashboards, sales reports, and geo-mapped store coverage analytics.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const imageScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const imageOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const titleTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: 'clamp',
    });

    const titleOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <View style={styles.imageGlow} />
          <Animated.View
            style={{
              transform: [{ scale: imageScale }],
              opacity: imageOpacity,
            }}
          >
            <Image
              source={item.image}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
          </Animated.View>
        </View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              transform: [{ translateY: titleTranslateY }],
              opacity: titleOpacity,
            },
          ]}
        >
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container]}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      {/* Background decorative elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity
          style={[styles.skipButton, { top: insets.top + 16 }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 50 }}
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 32, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: i === currentIndex ? '#1A3F75' : '#B0C4DE',
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        {isLastSlide ? (
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.85}
            style={styles.goButtonOuter}
          >
            <LinearGradient
              colors={['#1A3F75', '#2D5A9E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.goButton}
            >
              <Text style={styles.goButtonText}>Let's Go</Text>
              <View style={styles.goButtonIcon}>
                <Ionicons name="arrow-forward" size={20} color="#1A3F75" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={styles.nextButtonOuter}
          >
            <LinearGradient
              colors={['#1A3F75', '#2D5A9E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButton}
            >
              <Ionicons name="arrow-forward" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(26, 63, 117, 0.04)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(26, 63, 117, 0.03)',
  },
  skipButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: width * 0.75,
    height: width * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  imageGlow: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(26, 63, 117, 0.06)',
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 24,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D5A9E',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A3F75',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  bottomSection: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  goButtonOuter: {
    width: '100%',
    shadowColor: '#1A3F75',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
  },
  goButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  goButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonOuter: {
    shadowColor: '#1A3F75',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
