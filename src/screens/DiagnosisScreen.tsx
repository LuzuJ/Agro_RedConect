import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import { COLORS } from '../constants/colors';
import { DISEASE_SEVERITY } from '../constants/modelConfig';
import { RootStackParamList } from '../navigation/AppNavigator';
import { detectionHistoryService } from '../services/DetectionHistoryService';
import { gamificationService, showAchievementNotification } from '../services/GamificationService';

type Props = NativeStackScreenProps<RootStackParamList, 'Diagnosis'>;

const diseaseInfo: Record<string, { scientificName: string; color: string }> = {
  Monilia: { scientificName: 'Moniliophthora roreri', color: '#FF453A' },
  Fitoftora: { scientificName: 'Phytophthora palmivora', color: '#FF9500' },
  Sano: { scientificName: 'Estado saludable', color: COLORS.primary },
};

export const DiagnosisScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUri, boxes } = route.params;
  
  // Debug: Verificar boxes recibidos + Registrar gamificación
  React.useEffect(() => {
    console.log('🎯 DiagnosisScreen recibió:');
    console.log(`   - Total boxes: ${boxes.length}`);
    boxes.forEach((box, i) => {
      console.log(`   Box ${i + 1}: ${box.label} ${(box.confidence * 100).toFixed(1)}% at [${box.x1.toFixed(3)}, ${box.y1.toFixed(3)}, ${box.x2.toFixed(3)}, ${box.y2.toFixed(3)}]`);
    });

    // Registrar escaneo en gamificación
    const recordGamification = async () => {
      try {
        const result = await gamificationService.recordScan(boxes);
        
        // Mostrar notificación de nivel
        if (result.levelsGained > 0) {
          const data = await gamificationService.getData();
          Alert.alert(
            '🎉 ¡Nivel Subido!',
            `¡Felicitaciones! Ahora eres nivel ${data.level}`,
            [{ text: 'Genial!', style: 'default' }]
          );
        }

        // Mostrar logros desbloqueados
        result.newAchievements.forEach(achievement => {
          setTimeout(() => showAchievementNotification(achievement), 500);
        });
      } catch (error) {
        console.error('Error registrando gamificación:', error);
      }
    };

    recordGamification();
  }, [boxes]);
  
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isSharing, setIsSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Calcular estadísticas de detecciones
  const stats = React.useMemo(() => {
    const counts = {
      Sano: 0,
      Monilia: 0,
      Fitoftora: 0,
    };

    boxes.forEach(box => {
      if (box.label in counts) {
        counts[box.label as keyof typeof counts]++;
      }
    });

    const totalHealthy = counts.Sano;
    const totalDiseased = counts.Monilia + counts.Fitoftora;
    const total = totalHealthy + totalDiseased;
    const healthPercentage = total > 0 ? (totalHealthy / total) * 100 : 0;

    // Encontrar la enfermedad más común (si hay)
    const diseases = boxes.filter(b => b.label !== 'Sano');
    const dominantDisease = diseases.length > 0
      ? diseases.sort((a, b) => b.confidence - a.confidence)[0]
      : null;

    return {
      counts,
      totalHealthy,
      totalDiseased,
      total,
      healthPercentage,
      dominantDisease,
      hasDisease: totalDiseased > 0,
    };
  }, [boxes]);

  const shareResults = async () => {
    try {
      setIsSharing(true);
      
      // Exportar historial completo como JSON
      const jsonData = await detectionHistoryService.exportAsJSON();
      
      // Crear archivo temporal
      const fileName = `agrocacao_historial_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      
      // Verificar si sharing está disponible
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          'No Disponible',
          'La función de compartir no está disponible en este dispositivo',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Compartir archivo
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Compartir Historial de Detecciones',
      });
      
    } catch (error) {
      console.error('❌ Error al compartir:', error);
      Alert.alert(
        'Error',
        'No se pudo compartir el historial. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSharing(false);
    }
  };
  // Text-to-Speech
  const handleAudioToggle = async () => {
    if (isMuted) {
      Alert.alert('Audio Silenciado', 'Activa el audio primero usando el botón de volumen');
      return;
    }
    
    try {
      if (isSpeaking) {
        // Detener
        await Speech.stop();
        setIsSpeaking(false);
      } else {
        // Iniciar
        setIsSpeaking(true);
        
        // Construir mensaje
        let message = '';
        
        if (stats.dominantDisease) {
          const diseaseData = DISEASE_SEVERITY[stats.dominantDisease.label];
          
          // Introducción
          message += `Diagnóstico completado. Se detectaron ${stats.total} mazorca${stats.total === 1 ? '' : 's'}. `;
          
          // Estado de salud
          if (stats.hasDisease) {
            message += `${diseaseData?.message || 'Enfermedad detectada'}. `;
            
            // Contadores específicos
            if (stats.counts.Monilia > 0) {
              message += `${stats.counts.Monilia} mazorca${stats.counts.Monilia === 1 ? '' : 's'} con Monilia. `;
            }
            if (stats.counts.Fitoftora > 0) {
              message += `${stats.counts.Fitoftora} mazorca${stats.counts.Fitoftora === 1 ? '' : 's'} con Fitóftora. `;
            }
            if (stats.counts.Sano > 0) {
              message += `${stats.counts.Sano} mazorca${stats.counts.Sano === 1 ? '' : 's'} sana${stats.counts.Sano === 1 ? '' : 's'}. `;
            }
            
            // Acción recomendada
            message += `Acción recomendada: ${diseaseData?.action || 'Revisar tratamientos'}. `;
            
            // Nivel de riesgo según tipo de enfermedad
            if (stats.dominantDisease.label === 'Monilia' || stats.dominantDisease.label === 'Fitoftora') {
              message += 'Nivel de riesgo: Alto. Actúe inmediatamente. ';
            }
          } else {
            message += 'Todas las mazorcas están sanas. Ninguna acción necesaria. ';
          }
          
          // Porcentaje de salud
          message += `Salud del cultivo: ${stats.healthPercentage.toFixed(0)} por ciento.`;
        }
        
        // Reproducir
        Speech.speak(message, {
          language: 'es-ES',
          pitch: 1,
          rate: 0.85, // Más lento para agricultores
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => {
            setIsSpeaking(false);
            Alert.alert('Error', 'No se pudo reproducir el audio');
          },
        });
      }
    } catch (error) {
      console.error('Error en TTS:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultado</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerIcon}>
            <MaterialCommunityIcons name="account-circle" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareResults} disabled={isSharing}>
            {isSharing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons name="share-variant" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image}
            resizeMode="cover"
            onLayout={(e) => {
              setImageSize({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height
              });
            }}
          />
          {/* Overlay muy sutil para no tapar boxes */}
          <View style={styles.imageOverlay} />
          
          {/* Bounding Boxes */}
          {boxes && boxes.length > 0 && imageSize.width > 0 && boxes.map((box, index) => {
            const boxWidth = (box.x2 - box.x1) * imageSize.width;
            const boxHeight = (box.y2 - box.y1) * imageSize.height;
            const left = box.x1 * imageSize.width;
            const top = box.y1 * imageSize.height;
            
            // Debug: Log box coordinates
            if (index === 0) {
              console.log('📦 Renderizando boxes en DiagnosisScreen:');
              console.log(`   - Total boxes: ${boxes.length}`);
              console.log(`   - Image size: ${imageSize.width}x${imageSize.height}`);
            }
            console.log(`   Box ${index + 1}: ${box.label} at (${left.toFixed(0)}, ${top.toFixed(0)}) size ${boxWidth.toFixed(0)}x${boxHeight.toFixed(0)} color=${box.color}`);
            
            return (
              <View
                key={`box-${box.label}-${index}-${box.confidence}`}
                style={[
                  styles.boundingBox,
                  {
                    left,
                    top,
                    width: boxWidth,
                    height: boxHeight,
                    borderColor: box.color,
                  }
                ]}
              >
                <View style={[styles.boxLabel, { backgroundColor: box.color }]}>
                  <Text style={styles.boxLabelText}>
                    {box.label} {(box.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            );
          })}
          
          {/* Brackets */}
          <View style={[styles.bracket, styles.topLeft]} />
          <View style={[styles.bracket, styles.topRight]} />
          <View style={[styles.bracket, styles.bottomLeft]} />
          <View style={[styles.bracket, styles.bottomRight]} />
          
          <View style={styles.imageLabel}>
            <MaterialCommunityIcons name="camera" size={14} color={COLORS.primary} />
            <Text style={styles.imageLabelText}>Original</Text>
          </View>
        </View>

        {/* ===== ENCABEZADO TIPO SEMÁFORO ===== */}
        {stats.dominantDisease && (
          <View style={[
            styles.alertBanner,
            { backgroundColor: stats.hasDisease ? COLORS.danger : COLORS.success }
          ]}>
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertEmoji}>
                {DISEASE_SEVERITY[stats.dominantDisease.label]?.emoji || '⚠️'}
              </Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {DISEASE_SEVERITY[stats.dominantDisease.label]?.message || 'Detección completada'}
              </Text>
              <Text style={styles.alertAction}>
                Acción: {DISEASE_SEVERITY[stats.dominantDisease.label]?.action || 'Revisar'}
              </Text>
            </View>
          </View>
        )}

        {/* Diagnosis Card - Resumen de todas las detecciones */}
        <View style={styles.diagnosisCard}>
          {/* Estadísticas Generales */}
          <View style={styles.statsHeader}>
            <MaterialCommunityIcons 
              name={stats.hasDisease ? "alert-circle" : "check-circle"} 
              size={24} 
              color={stats.hasDisease ? '#FF453A' : COLORS.primary} 
            />
            <Text style={styles.statsTitle}>
              {stats.total} mazorca{stats.total === 1 ? '' : 's'} detectada{stats.total === 1 ? '' : 's'}
            </Text>
          </View>

          {/* Barra de progreso de salud */}
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBarBackground}>
              <View 
                style={[
                  styles.healthBarFill, 
                  { 
                    width: `${stats.healthPercentage}%`,
                    backgroundColor: stats.healthPercentage >= 70 ? COLORS.primary : '#FF9500'
                  }
                ]} 
              />
            </View>
            <Text style={styles.healthBarText}>
              {stats.healthPercentage.toFixed(0)}% saludable
            </Text>
          </View>

          {/* Contadores por tipo */}
          <View style={styles.countersContainer}>
            {stats.counts.Sano > 0 && (
              <View style={[styles.counterCard, { borderColor: COLORS.primary }]}>
                <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
                <Text style={[styles.counterNumber, { color: COLORS.primary }]}>{stats.counts.Sano}</Text>
                <Text style={styles.counterLabel}>Sanas</Text>
              </View>
            )}
            
            {stats.counts.Monilia > 0 && (
              <View style={[styles.counterCard, { borderColor: '#FF453A' }]}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF453A" />
                <Text style={[styles.counterNumber, { color: '#FF453A' }]}>{stats.counts.Monilia}</Text>
                <Text style={styles.counterLabel}>Monilia</Text>
              </View>
            )}
            
            {stats.counts.Fitoftora > 0 && (
              <View style={[styles.counterCard, { borderColor: '#FF9500' }]}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#FF9500" />
                <Text style={[styles.counterNumber, { color: '#FF9500' }]}>{stats.counts.Fitoftora}</Text>
                <Text style={styles.counterLabel}>Fitoftora</Text>
              </View>
            )}
          </View>

          {/* Mensaje principal */}
          {stats.hasDisease ? (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="alert" size={18} color="#FF453A" />
              <Text style={styles.warningText}>
                {stats.totalDiseased} mazorca{stats.totalDiseased === 1 ? ' necesita' : 's necesitan'} tratamiento
              </Text>
            </View>
          ) : (
            <View style={styles.successBox}>
              <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.primary} />
              <Text style={styles.successText}>
                ¡Todas las mazorcas están saludables!
              </Text>
            </View>
          )}
        </View>

        {/* Lista de Detecciones Individuales */}
        <View style={styles.detectionsList}>
          <Text style={styles.detectionsTitle}>Detecciones Individuales</Text>
          
          {boxes.map((box, index) => {
            const info = diseaseInfo[box.label] || diseaseInfo.Sano;
            const isHealthy = box.label === 'Sano';
            
            return (
              <View key={`${box.label}-${box.confidence}-${box.x1}-${box.y1}`} style={styles.detectionItem}>
                <View style={[styles.detectionIcon, { backgroundColor: box.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={isHealthy ? "check-circle" : "alert-circle"} 
                    size={24} 
                    color={box.color} 
                  />
                </View>
                
                <View style={styles.detectionInfo}>
                  <Text style={styles.detectionLabel}>{box.label}</Text>
                  <Text style={styles.detectionScientific}>{info.scientificName}</Text>
                </View>
                
                <View style={styles.detectionConfidence}>
                  <Text style={[styles.confidenceValue, { color: box.color }]}>
                    {(box.confidence * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.confidenceLabel}>confianza</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          {/* Mute Toggle */}
          <TouchableOpacity 
            style={[styles.muteButton, isMuted && styles.muteButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <MaterialCommunityIcons 
              name={isMuted ? "volume-off" : "volume-high"} 
              size={24} 
              color={isMuted ? COLORS.danger : COLORS.textPrimary} 
            />
          </TouchableOpacity>

          {/* Audio Play Button */}
          <TouchableOpacity 
            style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
            onPress={handleAudioToggle}
            disabled={isMuted}
          >
            <MaterialCommunityIcons 
              name={isSpeaking ? "stop-circle" : "play-circle"} 
              size={32} 
              color="white" 
            />
            <Text style={styles.audioButtonText}>
              {isSpeaking ? 'Detener Audio' : 'Escuchar Diagnóstico'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {stats.hasDisease && (
            <>
              {stats.counts.Monilia > 0 && (
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: '#FF453A' }]} 
                  onPress={() => navigation.navigate('Treatment', { disease: 'Monilia' })}
                >
                  <MaterialCommunityIcons name="bottle-tonic-plus" size={24} color="white" />
                  <Text style={styles.primaryButtonText}>Tratar Monilia</Text>
                </TouchableOpacity>
              )}
              
              {stats.counts.Fitoftora > 0 && (
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: '#FF9500' }]} 
                  onPress={() => navigation.navigate('Treatment', { disease: 'Fitoftora' })}
                >
                  <MaterialCommunityIcons name="bottle-tonic-plus" size={24} color="white" />
                  <Text style={styles.primaryButtonText}>Tratar Fitoftora</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Camera')}>
            <MaterialCommunityIcons name="camera-retake" size={20} color={COLORS.textSecondary} />
            <Text style={styles.secondaryButtonText}>Escanear otra vez</Text>
          </TouchableOpacity>
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
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  // ===== ENCABEZADO TIPO SEMÁFORO =====
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertIconContainer: {
    marginRight: 16,
  },
  alertEmoji: {
    fontSize: 48,  // EMOJI GIGANTE
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 20,  // TEXTO GRANDE
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alertAction: {
    fontSize: 16,  // Legible bajo sol
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
  },
  // ===== IMAGEN =====
  imageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    pointerEvents: 'none',
  },
  bracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: COLORS.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 16,
    right: 16,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  imageLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  diagnosisCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  healthBarContainer: {
    gap: 8,
  },
  healthBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthBarText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  countersContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  counterCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  counterNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  counterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF453A20',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FF453A40',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#FF453A',
    fontWeight: '600',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  detectionsList: {
    gap: 12,
    marginBottom: 24,
  },
  detectionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  detectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  detectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionInfo: {
    flex: 1,
    gap: 2,
  },
  detectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  detectionScientific: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detectionConfidence: {
    alignItems: 'flex-end',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confidenceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 5,
    borderRadius: 4,
    backgroundColor: 'transparent',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  boxLabel: {
    position: 'absolute',
    top: -28,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  boxLabelText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actions: {
    gap: 12,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  muteButton: {
    backgroundColor: COLORS.surfaceDark,
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  muteButtonActive: {
    backgroundColor: COLORS.error + '20',
    borderColor: COLORS.error,
  },
  audioButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  audioButtonActive: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  audioButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
