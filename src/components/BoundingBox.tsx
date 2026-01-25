import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { MODEL_CONFIG } from '../constants/modelConfig';

interface BoundingBoxProps {
  box: { 
    top: number; 
    left: number; 
    bottom: number; 
    right: number;
  };
  label: string;
  confidence: number;
}

/**
 * Componente para dibujar un cuadro de detección sobre la cámara en tiempo real
 * Usa el sistema de colores de semáforo para máxima visibilidad
 */
export const BoundingBox: React.FC<BoundingBoxProps> = ({ box, label, confidence }) => {
  // Determinar color según la etiqueta usando el sistema de semáforo
  const getColorForLabel = (label: string): string => {
    switch (label) {
      case 'Sano':
        return COLORS.success; // 🟢 Verde
      case 'Monilia':
      case 'Fitoftora':
        return COLORS.danger; // 🔴 Rojo
      default:
        return COLORS.warning; // 🟡 Amarillo (fallback)
    }
  };

  const color = getColorForLabel(label);
  
  // Calcular dimensiones del cuadro
  const width = box.right - box.left;
  const height = box.bottom - box.top;

  return (
    <View
      style={[
        styles.boxContainer,
        {
          top: box.top,
          left: box.left,
          width: width,
          height: height,
          borderColor: color,
        },
      ]}
    >
      {/* Etiqueta con nombre de la enfermedad y confianza */}
      <View style={[styles.labelBackground, { backgroundColor: color }]}>
        <Text style={styles.labelText}>
          {label} {Math.round(confidence * 100)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    position: 'absolute',
    borderWidth: 3, // Grosor visible bajo luz solar
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  labelBackground: {
    position: 'absolute',
    top: -28, // Colocar la etiqueta justo encima de la caja
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5, // Sombra en Android para legibilidad
  },
  labelText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
