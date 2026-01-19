import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Camera');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBackground}>
          <MaterialCommunityIcons name="leaf" size={80} color={COLORS.primary} />
        </View>
      </Animated.View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>AGROCACAO IA</Text>
        <Text style={styles.subtitle}>Detecta. Diagnostica. Trata.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.spinner} />
        <Text style={styles.footerText}>IA para la Salud del Cacao</Text>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: '#1e3a1a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
    gap: 16,
  },
  spinner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary + '33',
    borderTopColor: COLORS.primary,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.primary + '66',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  version: {
    fontSize: 10,
    color: '#5a7a54',
  },
});
