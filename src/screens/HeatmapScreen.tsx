import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { detectionHistoryService, DetectionHistoryEntry } from '../services/DetectionHistoryService';

type Props = NativeStackScreenProps<RootStackParamList, 'Heatmap'>;

interface DetectionMarker {
  id: string;
  latitude: number;
  longitude: number;
  disease: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

type FilterType = 'all' | 'Monilia' | 'Fitoftora';

export const HeatmapScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [detections, setDetections] = useState<DetectionMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDetectionHistory();
  }, []);

  const loadDetectionHistory = async () => {
    try {
      setIsLoading(true);
      const history = await detectionHistoryService.getHistory();
      
      const markers: DetectionMarker[] = history
        .filter((entry: DetectionHistoryEntry) => entry.location && entry.disease !== 'Sano')
        .map((entry: DetectionHistoryEntry) => ({
          id: entry.id,
          latitude: entry.location!.latitude,
          longitude: entry.location!.longitude,
          disease: entry.disease as string,
          severity: calculateSeverity(entry.confidence),
          timestamp: String(entry.timestamp), // Convertir a string
        }));
      
      setDetections(markers);
      console.log(`🗺️ Cargados ${markers.length} marcadores del historial`);
    } catch (error) {
      console.error('❌ Error cargando historial para mapa:', error);
      Alert.alert('Error', 'No se pudo cargar el historial de detecciones');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSeverity = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getSeverityLabel = (severity: string): string => {
    if (severity === 'high') return 'Alta';
    if (severity === 'medium') return 'Media';
    return 'Baja';
  };

  const filteredDetections = detections.filter(
    d => selectedFilter === 'all' || d.disease === selectedFilter
  );

  const stats = {
    total: detections.length,
    monilia: detections.filter(d => d.disease === 'Monilia').length,
    fitoftora: detections.filter(d => d.disease === 'Fitoftora').length,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Detecciones</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando detecciones...</Text>
        </View>
      ) : (
        <>
          {/* Filtros */}
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text 
                style={[styles.filterButtonText, selectedFilter === 'all' && styles.filterButtonTextActive]}
                numberOfLines={1}
              >
                Todas ({stats.total})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'Monilia' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('Monilia')}
            >
              <Text 
                style={[styles.filterButtonText, selectedFilter === 'Monilia' && styles.filterButtonTextActive]}
                numberOfLines={1}
              >
                🔴 Monilia ({stats.monilia})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'Fitoftora' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('Fitoftora')}
            >
              <Text 
                style={[styles.filterButtonText, selectedFilter === 'Fitoftora' && styles.filterButtonTextActive]}
                numberOfLines={1}
              >
                💧 Fitóftora ({stats.fitoftora})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vista de Lista */}
          <ScrollView style={styles.listContainer}>
            {filteredDetections.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-off" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No hay detecciones registradas</Text>
                <Text style={styles.emptySubtext}>Escanea mazorcas con ubicación activada para verlas aquí</Text>
              </View>
            ) : (
              filteredDetections.map((detection) => (
                <View key={detection.id} style={styles.listItem}>
                  <View style={[styles.listMarker, { backgroundColor: getSeverityColor(detection.severity) }]} />
                  <View style={styles.listContent}>
                    <Text style={styles.listTitle}>{detection.disease}</Text>
                    <Text style={styles.listSubtitle}>
                      Severidad: {getSeverityLabel(detection.severity)}
                    </Text>
                    {Boolean(detection.latitude && detection.longitude) && (
                      <Text style={styles.listLocation}>
                        📍 {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
                      </Text>
                    )}
                    <Text style={styles.listTimestamp}>
                      {new Date(detection.timestamp).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

// Estilos simplificados sin mapa
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceDark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.backgroundDark,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  listMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  listContent: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  listSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  listLocation: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  listTimestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
