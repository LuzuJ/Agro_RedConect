<div align="center">

# 🌱 AgroCacao IA (Visión Artificial Móvil)

## ⏸️ ESTADO DEL PROYECTO: PAUSADO / MIGRADO

> [!IMPORTANT]
> **Este proyecto móvil (React Native) se encuentra actualmente en pausa.** 
> Todas las funcionalidades de la Guía de Enfermedades y Precios de Mercado las he migrado y mejorado en mi nueva Aplicación Web Progresiva (PWA): **[AgroL](https://agrol-zeta.vercel.app/)**
> 
> *¿Por qué pausé esta versión móvil?* Decidí pivotar hacia una web PWA para asegurar un acceso más fácil (sin descargas pesadas desde la Play Store) para los agricultores en zonas de baja conectividad. Sin embargo, **el Modelo de Visión Artificial (TensorFlow Lite)** que desarrollé aquí se mantiene como un activo de alto valor en mi portafolio para futuras integraciones.

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.31-000020?logo=expo)](https://expo.dev/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-TFLite-00FFFF?logo=tensorflow)](https://github.com/ultralytics/ultralytics)

*Detección en tiempo real de Monilia y Fitoftora con inteligencia artificial offline*

---
</div>

## 🎯 ¿Qué es este proyecto?

**AgroCacao IA** es una prueba de concepto y aplicación móvil nativa (Android/iOS) que desarrollé para permitir a los cacaocultores detectar enfermedades en sus plantaciones mediante visión por computadora. La característica principal es que funciona **100% offline** utilizando un modelo YOLOv8 optimizado y cuantizado para dispositivos móviles.

### 🔬 Enfermedades Detectadas

| Enfermedad | Agente Causal |
|------------|---------------|
| **Monilia** | *Moniliophthora roreri* |
| **Fitoftora** | *Phytophthora spp.* |
| **Sano** | - |

---

## 🧠 Telemetría del Modelo de IA (Visión Artificial)

Desarrollé y entrené un modelo predictivo YOLOv8 exportado a TensorFlow Lite (`best_int8.tflite`) diseñado para escanear y diagnosticar enfermedades en el Cacao directamente desde la cámara del celular.

**Resultados del Entrenamiento (Baseline_GPU - 50 Epochs):**
- **Precisión (Precision):** `93.72%`
- **Sensibilidad (Recall):** `90.27%`
- **mAP50 (Mean Average Precision):** `95.48%`
- **mAP50-95:** `77.95%`

Estas métricas demuestran una capacidad excepcional del modelo para diferenciar hojas y mazorcas sanas de aquellas infectadas por patógenos en entornos reales de campo.

### 📸 Predicciones y Validación del Modelo

| Predicción en Lote 0 | Predicción en Lote 1 | Matriz de Confusión | Resultados de Entrenamiento |
|:-------------:|:--------------------:|:-----------:|:------------:|
| ![Pred 0](Modelo%20IA/Baseline_GPU/Baseline_GPU/val_batch0_pred.jpg) | ![Pred 1](Modelo%20IA/Baseline_GPU/Baseline_GPU/val_batch1_pred.jpg) | ![Matriz](Modelo%20IA/Baseline_GPU/Baseline_GPU/confusion_matrix.png) | ![Resultados](Modelo%20IA/Baseline_GPU/Baseline_GPU/results.png) |

*Imágenes generadas directamente por mi pipeline de validación de YOLOv8.*

---

## 🗺️ Arquitectura del Sistema Móvil

```text
┌─────────────────────────────────────────────────────────┐
│                     React Native App                     │
├─────────────────────────────────────────────────────────┤
│  CameraScreen  │  DiagnosisScreen  │  TreatmentScreen   │
├─────────────────────────────────────────────────────────┤
│              DetectionService (Core Logic)               │
│  ┌────────────────────┐    ┌────────────────────────┐  │
│  │  Camera Stream     │───▶│  TFLite Inference      │  │
│  │  (640x640)         │    │  (YOLOv8n int8)        │  │
│  └────────────────────┘    └────────────────────────┘  │
│              ▼                       ▼                   │
│  ┌────────────────────┐    ┌────────────────────────┐  │
│  │  Bounding Boxes    │    │  AsyncStorage          │  │
│  │  (Real-time UI)    │    │  (History + Location)  │  │
│  └────────────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Compilación Local (Para Desarrolladores)

Si deseas probar el código fuente de esta versión nativa:

```bash
# Clonar repositorio
git clone https://github.com/LuzuJ/Agro_RedConect.git
cd Agro_RedConect

# Instalar dependencias
npm install

# Ejecutar en dispositivo/emulador Android
npm run android
```

---

## 👨‍💻 Autor

**Jonathan Luzuriaga**
- 📍 Quito, Ecuador
- 📧 Email: jonaluzu1@gmail.com
- 🔗 GitHub: [@LuzuJ](https://github.com/LuzuJ)
- 🚀 Proyecto Actual: [AgroL (App Web)](https://agrol-zeta.vercel.app/)

<div align="center">

**⭐ Si mi trabajo te resulta útil o interesante, considera darle una estrella al repositorio ⭐**

[![GitHub stars](https://img.shields.io/github/stars/LuzuJ/Agro_RedConect?style=social)](https://github.com/LuzuJ/Agro_RedConect/)
[![GitHub forks](https://img.shields.io/github/forks/LuzuJ/Agro_RedConect?style=social)](https://github.com/LuzuJ/Agro_RedConect/)

</div>
