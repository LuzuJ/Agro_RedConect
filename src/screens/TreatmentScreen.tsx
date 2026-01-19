import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getTreatmentsForDisease, filterTreatmentsByType, Treatment } from '../data/TreatmentDatabase';
import TreatmentProgressService, { TreatmentProgress, TreatmentStep } from '../services/TreatmentProgressService';
import { gamificationService, showAchievementNotification } from '../services/GamificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Treatment'>;
type TabType = 'immediate' | 'biological' | 'chemical';

const getEffectivenessStyle = (effectiveness: 'high' | 'medium' | 'low') => {
  switch (effectiveness) {
    case 'high':
      return styles.highEffectiveness;
    case 'medium':
      return styles.mediumEffectiveness;
    case 'low':
      return styles.lowEffectiveness;
  }
};

export const TreatmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { disease } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('immediate');
  const [treatmentProgress, setTreatmentProgress] = useState<Map<string, TreatmentProgress>>(new Map());
  
  // Obtener información de la enfermedad
  const diseaseInfo = getTreatmentsForDisease(disease);
  const treatments = filterTreatmentsByType(disease, activeTab);

  // Cargar progreso guardado
  useEffect(() => {
    loadProgress();
  }, [disease]);

  const loadProgress = async () => {
    const progressMap = new Map<string, TreatmentProgress>();
    
    for (const treatment of diseaseInfo.treatments) {
      const progress = await TreatmentProgressService.getProgress(disease, treatment.id);
      if (progress) {
        progressMap.set(treatment.id, progress);
      }
    }
    
    setTreatmentProgress(progressMap);
  };

  const handleStepToggle = async (treatment: Treatment, stepId: string, currentState: boolean) => {
    // Feedback háptico
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let progress = treatmentProgress.get(treatment.id);

    // Inicializar progreso si no existe
    if (!progress && treatment.steps) {
      progress = await TreatmentProgressService.initializeProgress(
        disease,
        treatment.id,
        treatment.steps.map((step, index) => ({
          id: `step_${index}`,
          title: step,
          description: '',
        }))
      );
    }

    if (!progress) return;

    // Toggle paso
    const updatedProgress = currentState
      ? await TreatmentProgressService.uncompleteStep(disease, treatment.id, stepId)
      : await TreatmentProgressService.completeStep(disease, treatment.id, stepId);

    if (updatedProgress) {
      const newMap = new Map(treatmentProgress);
      newMap.set(treatment.id, updatedProgress);
      setTreatmentProgress(newMap);

      // Si se completó todo, celebrar
      if (updatedProgress.completedAt && !currentState) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Registrar en gamificación
        try {
          const result = await gamificationService.recordTreatmentComplete();
          
          // Mostrar celebración con info de nivel si aplica
          let message = `Has terminado: "${treatment.title}"\n\n¡Excelente trabajo!`;
          
          if (result.levelsGained > 0) {
            const data = await gamificationService.getData();
            message += `\n\n🎉 ¡Subiste al nivel ${data.level}!`;
          }
          
          Alert.alert('🎉 ¡Tratamiento Completado!', message, [{ text: 'OK', style: 'default' }]);
          
          // Mostrar logros desbloqueados
          result.newAchievements.forEach(achievement => {
            setTimeout(() => showAchievementNotification(achievement), 500);
          });
        } catch (error) {
          console.error('Error registrando gamificación:', error);
          Alert.alert(
            '🎉 ¡Tratamiento Completado!',
            `Has terminado: "${treatment.title}"\n\n¡Excelente trabajo!`,
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
    }
  };

  const renderChecklistItem = (treatment: Treatment, step: string, index: number) => {
    const progress = treatmentProgress.get(treatment.id);
    const stepId = `step_${index}`;
    const stepData = progress?.steps.find(s => s.id === stepId);
    const isCompleted = stepData?.completed || false;

    return (
      <TouchableOpacity
        key={stepId}
        style={styles.checklistItem}
        onPress={() => handleStepToggle(treatment, stepId, isCompleted)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
          {isCompleted && (
            <MaterialCommunityIcons name="check" size={18} color="white" />
          )}
        </View>
        <Text style={[styles.checklistText, isCompleted && styles.checklistTextCompleted]}>
          {step}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTreatmentCard = (treatment: Treatment) => {
    const progress = treatmentProgress.get(treatment.id);
    const completedSteps = progress?.steps.filter(s => s.completed).length || 0;
    const totalSteps = treatment.steps?.length || 0;
    const hasChecklist = totalSteps > 0;

    return (
    <View key={treatment.id} style={styles.treatmentCard}>
      <View style={styles.treatmentHeader}>
        <MaterialCommunityIcons 
          name={
            treatment.type === 'immediate' ? 'hand-front-right' :
            treatment.type === 'biological' ? 'leaf' : 'flask'
          } 
          size={24} 
          color={COLORS.primary} 
        />
        <Text style={styles.treatmentTitle}>{treatment.title}</Text>
      </View>
      
      <Text style={styles.treatmentDescription}>{treatment.description}</Text>
      
      {treatment.ingredients && treatment.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes:</Text>
          {treatment.ingredients.map((ingredient, i) => (
            <Text key={i} style={styles.listItem}>• {ingredient}</Text>
          ))}
        </View>
      )}
      
      {treatment.dosage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosificación:</Text>
          <Text style={styles.sectionText}>{treatment.dosage}</Text>
        </View>
      )}
      
      {treatment.application && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicación:</Text>
          <Text style={styles.sectionText}>{treatment.application}</Text>
        </View>
      )}
      
      {treatment.frequency && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>Frecuencia: {treatment.frequency}</Text>
        </View>
      )}
      
      {treatment.duration && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="timer-outline" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>Duración: {treatment.duration}</Text>
        </View>
      )}
      
      {treatment.precautions && treatment.precautions.length > 0 && (
        <View style={[styles.section, styles.warningSection]}>
          <View style={styles.warningSectionHeader}>
            <MaterialCommunityIcons name="alert" size={18} color={COLORS.error} />
            <Text style={styles.warningTitle}>Precauciones</Text>
          </View>
          {treatment.precautions.map((precaution, i) => (
            <Text key={i} style={styles.warningText}>⚠️ {precaution}</Text>
          ))}
        </View>
      )}

      {/* CHECKLIST INTERACTIVO */}
      {hasChecklist && (
        <View style={styles.checklistSection}>
          <View style={styles.checklistHeader}>
            <View style={styles.checklistTitleRow}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={COLORS.primary} />
              <Text style={styles.checklistTitle}>Lista de Pasos</Text>
            </View>
            {totalSteps > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {completedSteps}/{totalSteps}
                </Text>
              </View>
            )}
          </View>
          
          {treatment.steps && treatment.steps.map((step, index) => 
            renderChecklistItem(treatment, step, index)
          )}

          {completedSteps === totalSteps && totalSteps > 0 && (
            <View style={styles.completionBanner}>
              <MaterialCommunityIcons name="party-popper" size={24} color={COLORS.success} />
              <Text style={styles.completionText}>¡Tratamiento Completado!</Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.badgesRow}>
        {treatment.effectiveness && (
          <View style={[styles.badge, getEffectivenessStyle(treatment.effectiveness)]}>
            <Text style={styles.badgeText}>
              {treatment.effectiveness === 'high' ? 'Alta efectividad' : 
               treatment.effectiveness === 'medium' ? 'Media efectividad' : 'Baja efectividad'}
            </Text>
          </View>
        )}
        {treatment.cost && (
          <View style={[styles.badge, styles.costBadge]}>
            <Text style={styles.badgeText}>
              Costo: {treatment.cost === 'low' ? 'Bajo' : treatment.cost === 'medium' ? 'Medio' : 'Alto'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receta de Tratamiento</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        {/* Hero Diagnosis Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={styles.alertBadge}>
                <MaterialCommunityIcons name="alert" size={16} color={COLORS.error} />
                <Text style={styles.alertText}>Enfermedad Detectada</Text>
              </View>
              <Text style={styles.heroTitle}>{diseaseInfo.disease}</Text>
              <Text style={styles.heroSubtitle}>
                Severidad: {diseaseInfo.severity === 'high' ? 'Alta' : diseaseInfo.severity === 'medium' ? 'Media' : 'Baja'}
              </Text>
              <Text style={styles.scientificName}>{diseaseInfo.scientificName}</Text>
            </View>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="bacteria" size={28} color={COLORS.error} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'immediate' && styles.tabActive]}
            onPress={() => setActiveTab('immediate')}
          >
            <MaterialCommunityIcons
              name="hand-front-right"
              size={20}
              color={activeTab === 'immediate' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'immediate' && styles.tabTextActive]}>
              Inmediato
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'biological' && styles.tabActive]}
            onPress={() => setActiveTab('biological')}
          >
            <MaterialCommunityIcons
              name="leaf"
              size={20}
              color={activeTab === 'biological' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'biological' && styles.tabTextActive]}>
              Biológico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'chemical' && styles.tabActive]}
            onPress={() => setActiveTab('chemical')}
          >
            <MaterialCommunityIcons
              name="flask"
              size={20}
              color={activeTab === 'chemical' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'chemical' && styles.tabTextActive]}>
              Químico
            </Text>
          </TouchableOpacity>
        </View>

        {/* Treatment Cards */}
        <View style={styles.content}>
          {treatments.length > 0 ? (
            treatments.map(treatment => renderTreatmentCard(treatment))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="flask-empty-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>
                No hay tratamientos {activeTab === 'immediate' ? 'inmediatos' : 
                  activeTab === 'biological' ? 'biológicos' : 'químicos'} disponibles
              </Text>
            </View>
          )}
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
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55,236,19,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  heroCard: {
    margin: 16,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.3)',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  alertText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scientificName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,69,58,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.2)',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3b6732',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: 'white',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  // Treatment Card Styles
  treatmentCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  treatmentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    paddingLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  warningSection: {
    backgroundColor: 'rgba(255,149,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.2)',
    borderRadius: 8,
    padding: 12,
  },
  warningSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  warningText: {
    fontSize: 13,
    color: '#ffb366',
    marginBottom: 4,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  highEffectiveness: {
    backgroundColor: 'rgba(55,236,19,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(55,236,19,0.3)',
  },
  mediumEffectiveness: {
    backgroundColor: 'rgba(255,204,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,204,0,0.3)',
  },
  lowEffectiveness: {
    backgroundColor: 'rgba(255,149,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.3)',
  },
  costBadge: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Existing styles for backwards compatibility
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timelineIconContainer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: 'rgba(55,236,19,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(55,236,19,0.2)',
    marginTop: 4,
  },
  stepCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  stepBadge: {
    backgroundColor: 'rgba(55,236,19,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stepBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bioCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  bioDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  bioDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  bioDetail: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bioDetailLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bioDetailValue: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,149,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.3)',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
  },
  chemicalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chemicalIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chemicalInfo: {
    flex: 1,
  },
  chemicalName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  chemicalType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // ===== CHECKLIST INTERACTIVO =====
  checklistSection: {
    backgroundColor: 'rgba(55,236,19,0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(55,236,19,0.2)',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checklistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  progressBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.backgroundDark,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  checklistTextCompleted: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(52,199,89,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.3)',
  },
  completionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
  },
});
