import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getTreatmentsForDisease, filterTreatmentsByType, Treatment } from '../data/TreatmentDatabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Treatment'>;
type TabType = 'immediate' | 'biological' | 'chemical';

export const TreatmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { disease } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('immediate');
  
  // Obtener información de la enfermedad
  const diseaseInfo = getTreatmentsForDisease(disease);
  const treatments = filterTreatmentsByType(disease, activeTab);

  const renderTreatmentCard = (treatment: Treatment) => (
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

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'immediate' && (
            <View>
              <Text style={styles.sectionTitle}>Remoción Manual</Text>
              <Text style={styles.sectionSubtitle}>
                El control cultural previene la dispersión de esporas. Ejecutar inmediatamente.
              </Text>

              {/* Steps */}
              <View style={styles.timeline}>
                {/* Step 1 */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconContainer}>
                    <View style={styles.timelineIcon}>
                      <MaterialCommunityIcons name="scissors-cutting" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Cortar mazorca infectada</Text>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>Paso 1</Text>
                      </View>
                    </View>
                    <Text style={styles.stepDescription}>
                      Use tijeras sanitizadas. Corte el pedúnculo cerca del tronco sin dañar el cojín.
                    </Text>
                  </View>
                </View>

                {/* Step 2 */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconContainer}>
                    <View style={styles.timelineIcon}>
                      <MaterialCommunityIcons name="package-variant-closed" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Embolsar las mazorcas</Text>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>Paso 2</Text>
                      </View>
                    </View>
                    <Text style={styles.stepDescription}>
                      Coloque las mazorcas infectadas en una bolsa plástica gruesa para evitar que las esporas se liberen al aire.
                    </Text>
                  </View>
                </View>

                {/* Step 3 */}
                <View style={styles.timelineRow}>
                  <View style={styles.timelineIconContainer}>
                    <View style={styles.timelineIcon}>
                      <MaterialCommunityIcons name="shovel" size={20} color={COLORS.primary} />
                    </View>
                  </View>
                  <View style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepTitle}>Enterrar en el suelo</Text>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>Paso 3</Text>
                      </View>
                    </View>
                    <Text style={styles.stepDescription}>
                      Cave un hoyo de al menos 50cm de profundidad. Cubra las mazorcas con tierra y compacte firmemente.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'biological' && (
            <View>
              <Text style={styles.sectionTitle}>Agente de Bio-Control</Text>
              <Text style={styles.sectionSubtitle}>
                Hongo antagonista que inhibe el crecimiento de {disease}.
              </Text>

              <View style={styles.bioCard}>
                <View style={styles.bioHeader}>
                  <MaterialCommunityIcons name="bacteria" size={16} color={COLORS.primary} />
                  <Text style={styles.bioTitle}>Trichoderma spp.</Text>
                </View>
                <Text style={styles.bioDescription}>
                  Hongo antagonista que inhibe el crecimiento de {disease}.
                </Text>
                <View style={styles.bioDetails}>
                  <View style={styles.bioDetail}>
                    <Text style={styles.bioDetailLabel}>Dosis</Text>
                    <Text style={styles.bioDetailValue}>2kg / ha</Text>
                  </View>
                  <View style={styles.bioDetail}>
                    <Text style={styles.bioDetailLabel}>Momento</Text>
                    <Text style={styles.bioDetailValue}>Floración</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'chemical' && (
            <View>
              <Text style={styles.sectionTitle}>Control Químico</Text>

              {/* Warning Banner */}
              <View style={styles.warningBanner}>
                <MaterialCommunityIcons name="gavel" size={20} color={COLORS.warning} />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>Advertencia Legal</Text>
                  <Text style={styles.warningText}>
                    Use solo productos autorizados. Consulte las regulaciones locales antes de la aplicación.
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.chemicalCard}>
                <View style={styles.chemicalIcon}>
                  <MaterialCommunityIcons name="flask" size={20} color="#3b82f6" />
                </View>
                <View style={styles.chemicalInfo}>
                  <Text style={styles.chemicalName}>Hidróxido de Cobre</Text>
                  <Text style={styles.chemicalType}>Fungicida • Protectivo</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fab}>
        <TouchableOpacity style={styles.fabButton}>
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.backgroundDark} />
          <Text style={styles.fabText}>Marcar Remoción Completa</Text>
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
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
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.warning,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#ffb366',
    lineHeight: 16,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  fabButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
