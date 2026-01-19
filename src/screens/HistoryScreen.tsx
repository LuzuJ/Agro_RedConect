import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { detectionHistoryService, DetectionHistoryEntry } from '../services/DetectionHistoryService';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

type FilterType = 'all' | 'Monilia' | 'Fitoftora' | 'Sano';
type SortType = 'recent' | 'oldest' | 'confidence';

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [history, setHistory] = useState<DetectionHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DetectionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('recent');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [history, filterType, sortType]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await detectionHistoryService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...history];

    // Aplicar filtro
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.disease === filterType);
    }

    // Aplicar ordenamiento
    switch (sortType) {
      case 'recent':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidence - a.confidence);
        break;
    }

    setFilteredHistory(filtered);
  };

  const getDiseaseColor = (disease: string) => {
    switch (disease) {
      case 'Monilia':
        return COLORS.warning;
      case 'Fitoftora':
        return COLORS.error;
      case 'Sano':
        return COLORS.primary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getDiseaseIcon = (disease: string) => {
    switch (disease) {
      case 'Monilia':
        return 'bug';
      case 'Fitoftora':
        return 'water';
      case 'Sano':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const deleteEntry = async (id: string) => {
    // TODO: Implementar eliminación en DetectionHistoryService
    const updated = history.filter(entry => entry.id !== id);
    setHistory(updated);
  };

  const renderHistoryItem = ({ item }: { item: DetectionHistoryEntry }) => {
    const isExpanded = expandedId === item.id;
    const diseaseColor = getDiseaseColor(item.disease);
    const diseaseIcon = getDiseaseIcon(item.disease);

    return (
      <TouchableOpacity 
        style={styles.historyCard}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
          
          <View style={styles.cardInfo}>
            <View style={styles.diseaseRow}>
              <MaterialCommunityIcons name={diseaseIcon} size={20} color={diseaseColor} />
              <Text style={[styles.diseaseName, { color: diseaseColor }]}>
                {item.disease}
              </Text>
              <View style={[styles.confidenceBadge, { backgroundColor: diseaseColor + '20' }]}>
                <Text style={[styles.confidenceText, { color: diseaseColor }]}>
                  {(item.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
            
            {item.location && (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>
                  {item.location.address || `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`}
                </Text>
              </View>
            )}
          </View>

          <MaterialCommunityIcons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color={COLORS.textSecondary} 
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Detecciones ({item.boxes.length})</Text>
            {item.boxes.map((box, index) => (
              <View key={`${item.id}-box-${index}-${box.label}`} style={styles.boxItem}>
                <MaterialCommunityIcons 
                  name={getDiseaseIcon(box.label)} 
                  size={16} 
                  color={getDiseaseColor(box.label)} 
                />
                <Text style={styles.boxLabel}>{box.label}</Text>
                <Text style={styles.boxConfidence}>{(box.confidence * 100).toFixed(1)}%</Text>
              </View>
            ))}

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Diagnosis', {
                  disease: item.disease as any,
                  confidence: item.confidence,
                  imageUri: item.imageUri,
                  boxes: item.boxes.map(b => ({
                    label: b.label,
                    confidence: b.confidence,
                    x1: 0, y1: 0, x2: 1, y2: 1,
                    color: getDiseaseColor(b.label)
                  }))
                })}
              >
                <MaterialCommunityIcons name="eye" size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Ver Detalles</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteEntry(item.id)}
              >
                <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <TouchableOpacity onPress={loadHistory}>
          <MaterialCommunityIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
            Todas ({history.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterType === 'Monilia' && styles.filterChipActive]}
          onPress={() => setFilterType('Monilia')}
        >
          <MaterialCommunityIcons 
            name="bug" 
            size={16} 
            color={filterType === 'Monilia' ? COLORS.backgroundDark : COLORS.textSecondary} 
          />
          <Text style={[styles.filterChipText, filterType === 'Monilia' && styles.filterChipTextActive]}>
            Monilia ({history.filter(h => h.disease === 'Monilia').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterType === 'Fitoftora' && styles.filterChipActive]}
          onPress={() => setFilterType('Fitoftora')}
        >
          <MaterialCommunityIcons 
            name="water" 
            size={16} 
            color={filterType === 'Fitoftora' ? COLORS.backgroundDark : COLORS.textSecondary} 
          />
          <Text style={[styles.filterChipText, filterType === 'Fitoftora' && styles.filterChipTextActive]}>
            Fitóftora ({history.filter(h => h.disease === 'Fitoftora').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterType === 'Sano' && styles.filterChipActive]}
          onPress={() => setFilterType('Sano')}
        >
          <MaterialCommunityIcons 
            name="check-circle" 
            size={16} 
            color={filterType === 'Sano' ? COLORS.backgroundDark : COLORS.textSecondary} 
          />
          <Text style={[styles.filterChipText, filterType === 'Sano' && styles.filterChipTextActive]}>
            Sanas ({history.filter(h => h.disease === 'Sano').length})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
          <TouchableOpacity
            style={[styles.sortButton, sortType === 'recent' && styles.sortButtonActive]}
            onPress={() => setSortType('recent')}
          >
            <MaterialCommunityIcons 
              name="clock" 
              size={16} 
              color={sortType === 'recent' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.sortButtonText, sortType === 'recent' && styles.sortButtonTextActive]}>
              Reciente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, sortType === 'oldest' && styles.sortButtonActive]}
            onPress={() => setSortType('oldest')}
          >
            <MaterialCommunityIcons 
              name="history" 
              size={16} 
              color={sortType === 'oldest' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.sortButtonText, sortType === 'oldest' && styles.sortButtonTextActive]}>
              Antiguo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, sortType === 'confidence' && styles.sortButtonActive]}
            onPress={() => setSortType('confidence')}
          >
            <MaterialCommunityIcons 
              name="chart-line" 
              size={16} 
              color={sortType === 'confidence' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.sortButtonText, sortType === 'confidence' && styles.sortButtonTextActive]}>
              Confianza
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* History List */}
      {(() => {
        if (isLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
          );
        }
        
        if (filteredHistory.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-document-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Sin Detecciones</Text>
              <Text style={styles.emptyText}>
                {filterType === 'all' 
                  ? 'Aún no has realizado ninguna detección'
                  : `No hay detecciones de ${filterType}`
                }
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Camera')}
              >
                <MaterialCommunityIcons name="camera" size={20} color={COLORS.backgroundDark} />
                <Text style={styles.emptyButtonText}>Escanear Ahora</Text>
              </TouchableOpacity>
            </View>
          );
        }
        
        return (
          <FlatList
            data={filteredHistory}
            keyExtractor={item => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      })()}
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: COLORS.surfaceDark,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  filtersContainer: {
    maxHeight: 60,
    backgroundColor: COLORS.surfaceDark,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.backgroundDark,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sortLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginRight: 12,
  },
  sortOptions: {
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: 'rgba(55,236,19,0.2)',
  },
  sortButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  sortButtonTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  historyCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  boxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    marginBottom: 6,
  },
  boxLabel: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  boxConfidence: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(55,236,19,0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 12,
  },
  emptyButtonText: {
    color: COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
