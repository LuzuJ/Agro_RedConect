import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { detectionHistoryService } from '../services/DetectionHistoryService';
import { gamificationService, getXPForNextLevel, getXPForCurrentLevel, Achievement } from '../services/GamificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface UserProfile {
  name: string;
  phone: string;
  farm: string;
  hectares: string;
  cooperative: string;
  location: string;
}

interface UserStats {
  totalScans: number;
  diseasesDetected: number;
  healthyMazorcas: number;
  treatmentsCompleted: number;
}

interface GamificationStats {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  xpProgress: number;
  unlockedAchievements: Achievement[];
  totalAchievements: number;
}

const PROFILE_KEY = '@user_profile';

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    phone: '',
    farm: '',
    hectares: '',
    cooperative: '',
    location: '',
  });
  const [stats, setStats] = useState<UserStats>({
    totalScans: 0,
    diseasesDetected: 0,
    healthyMazorcas: 0,
    treatmentsCompleted: 0,
  });
  const [gamification, setGamification] = useState<GamificationStats>({
    level: 1,
    currentXP: 0,
    xpForNextLevel: 100,
    xpProgress: 0,
    unlockedAchievements: [],
    totalAchievements: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
    loadGamification();
  }, []);

  const loadProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem(PROFILE_KEY);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const loadStats = async () => {
    try {
      const history = await detectionHistoryService.getHistory();
      const gamData = await gamificationService.getData();
      
      const totalScans = history.length;
      const diseasesDetected = history.filter(h => h.disease !== 'Sano').length;
      const healthyMazorcas = history.filter(h => h.disease === 'Sano').length;
      
      setStats({
        totalScans,
        diseasesDetected,
        healthyMazorcas,
        treatmentsCompleted: gamData.stats.totalTreatments,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadGamification = async () => {
    try {
      const data = await gamificationService.getData();
      const unlockedAchievements = await gamificationService.getUnlockedAchievements();
      
      const currentLevelXP = getXPForCurrentLevel(data.level);
      const nextLevelXP = getXPForNextLevel(data.level);
      const xpInCurrentLevel = data.totalXP - currentLevelXP;
      const xpNeededForLevel = nextLevelXP - currentLevelXP;
      const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;
      
      setGamification({
        level: data.level,
        currentXP: data.totalXP,
        xpForNextLevel: nextLevelXP,
        xpProgress: Math.min(progress, 100),
        unlockedAchievements,
        totalAchievements: data.achievements.length,
      });
    } catch (error) {
      console.error('Error cargando gamificación:', error);
    }
  };

  const saveProfile = async () => {
    try {
      if (!profile.name.trim()) {
        Alert.alert('Error', 'El nombre es obligatorio');
        return;
      }

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('✅ Guardado', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error guardando perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(PROFILE_KEY);
            // TODO: Navegar a pantalla de login
            Alert.alert('Sesión cerrada');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => isEditing ? saveProfile() : setIsEditing(true)}
        >
          <MaterialCommunityIcons 
            name={isEditing ? "check" : "pencil"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={100} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{profile.name || 'Agricultor'}</Text>
          <Text style={styles.userRole}>Productor de Cacao</Text>
        </View>

        {/* Level & XP */}
        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{gamification.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Nivel {gamification.level}</Text>
              <Text style={styles.levelSubtitle}>
                {gamification.currentXP} / {gamification.xpForNextLevel} XP
              </Text>
            </View>
            <TouchableOpacity style={styles.achievementsButton}>
              <MaterialCommunityIcons name="trophy" size={20} color={COLORS.warning} />
              <Text style={styles.achievementsCount}>
                {gamification.unlockedAchievements.length}/{gamification.totalAchievements}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${gamification.xpProgress}%` }]} />
          </View>
        </View>

        {/* Achievements Preview */}
        {gamification.unlockedAchievements.length > 0 && (
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>🏆 Logros Recientes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {gamification.unlockedAchievements.slice(0, 5).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <Text style={styles.achievementTitle} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="camera" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Escaneos</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="bug" size={24} color={COLORS.danger} />
            <Text style={styles.statNumber}>{stats.diseasesDetected}</Text>
            <Text style={styles.statLabel}>Enfermedades</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>{stats.healthyMazorcas}</Text>
            <Text style={styles.statLabel}>Sanas</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clipboard-check" size={24} color={COLORS.warning} />
            <Text style={styles.statNumber}>{stats.treatmentsCompleted}</Text>
            <Text style={styles.statLabel}>Tratamientos</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Información Personal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor={COLORS.textSecondary}
              />
            ) : (
              <Text style={styles.inputValue}>{profile.name || 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile({ ...profile, phone: text })}
                placeholder="Ej: +593 99 123 4567"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.inputValue}>{profile.phone || 'No especificado'}</Text>
            )}
          </View>
        </View>

        {/* Farm Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 Información de la Finca</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la Finca</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.farm}
                onChangeText={(text) => setProfile({ ...profile, farm: text })}
                placeholder="Ej: El Paraíso"
                placeholderTextColor={COLORS.textSecondary}
              />
            ) : (
              <Text style={styles.inputValue}>{profile.farm || 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hectáreas</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.hectares}
                onChangeText={(text) => setProfile({ ...profile, hectares: text })}
                placeholder="Ej: 2.5"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="decimal-pad"
              />
            ) : (
              <Text style={styles.inputValue}>{profile.hectares ? `${profile.hectares} ha` : 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ubicación</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.location}
                onChangeText={(text) => setProfile({ ...profile, location: text })}
                placeholder="Ej: Esmeraldas, Ecuador"
                placeholderTextColor={COLORS.textSecondary}
              />
            ) : (
              <Text style={styles.inputValue}>{profile.location || 'No especificado'}</Text>
            )}
          </View>
        </View>

        {/* Cooperative Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Cooperativa</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de la Cooperativa</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.cooperative}
                onChangeText={(text) => setProfile({ ...profile, cooperative: text })}
                placeholder="Ej: UNOCACE"
                placeholderTextColor={COLORS.textSecondary}
              />
            ) : (
              <Text style={styles.inputValue}>{profile.cooperative || 'No especificado'}</Text>
            )}
          </View>

          {!isEditing && Boolean(profile.cooperative) && (
            <View style={styles.cooperativeCard}>
              <MaterialCommunityIcons name="account-group" size={32} color={COLORS.primary} />
              <View style={styles.cooperativeInfo}>
                <Text style={styles.cooperativeName}>{profile.cooperative}</Text>
                <Text style={styles.cooperativeSubtext}>Miembro activo</Text>
              </View>
              <TouchableOpacity style={styles.cooperativeButton}>
                <MaterialCommunityIcons name="information" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Notificaciones</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Ayuda y Soporte</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="information-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Acerca de AgroCacao IA</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={24} color={COLORS.danger} />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AgroCacao IA v1.0.0</Text>
          <Text style={styles.footerSubtext}>Hecho con ❤️ para agricultores</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(55,236,19,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  levelSection: {
    padding: 16,
    backgroundColor: COLORS.surfaceDark,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55,236,19,0.3)',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  levelBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(55,236,19,0.3)',
  },
  levelNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  achievementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,149,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  achievementsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.warning,
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  achievementsSection: {
    padding: 16,
  },
  achievementsScroll: {
    marginTop: 12,
  },
  achievementCard: {
    width: 100,
    height: 120,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputValue: {
    fontSize: 16,
    color: 'white',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
  },
  cooperativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  cooperativeInfo: {
    flex: 1,
  },
  cooperativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  cooperativeSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cooperativeButton: {
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
    borderColor: COLORS.danger + '40',
  },
  logoutText: {
    color: COLORS.danger,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  footerSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
});
