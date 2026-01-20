<div align="center">

# 🌱 AgroCacao IA

## ⚠️ ESTADO DEL PROYECTO: BETA TEMPRANA

Esta aplicación está en desarrollo activo. NO usar para decisiones críticas de cultivo sin supervisión profesional.

### Sistema Inteligente de Detección de Enfermedades en Cacao

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.31-000020?logo=expo)](https://expo.dev/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-TFLite-00FFFF?logo=tensorflow)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/LuzuJ/Agro_RedConect?logo=github)](https://github.com/LuzuJ/Agro_RedConect/tree/main/releases)

*Detección en tiempo real de Monilia y Fitoftora con inteligencia artificial offline*

---

## 📥 Descargas

| Plataforma | Enlace de Descarga |
|------------|-------------------|
| **Android** | [![Android APK](https://img.shields.io/badge/Android-APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/LuzuJ/Agro_RedConect/raw/main/releases/AgroCacao-IA-v1.0.0.apk) |
| **Android (F-Droid)** | _Próximamente_ |
| **Nightly Build** | [![Nightly](https://img.shields.io/badge/Nightly-APK-orange?style=for-the-badge&logo=android)](https://github.com/LuzuJ/Agro_RedConect/tree/main/releases/) |

[📖 Ver Documentación](#-características) • [🎯 Ver Capturas](#-capturas-de-pantalla) • [🔧 Compilar desde Código](#opción-2-compilar-desde-código-fuente)

---

</div>

## 🎯 Descripción

**AgroCacao IA** es una aplicación móvil profesional diseñada para cacaocultores y técnicos agrícolas que permite detectar enfermedades en plantaciones de cacao mediante visión por computadora. Funciona **100% offline** utilizando un modelo YOLOv8 optimizado para dispositivos móviles.

### 🔬 Enfermedades Detectadas

| Enfermedad | Agente Causal | Confianza Mínima |
|------------|---------------|------------------|
| **Monilia** | *Moniliophthora roreri* | 35% |
| **Fitoftora** | *Phytophthora spp.* | 35% |
| **Sano** | - | 35% |

## ✨ Características

### 🎥 Detección en Tiempo Real
- Análisis continuo mediante cámara con bounding boxes dinámicos
- Procesamiento cada 3 segundos para optimizar rendimiento
- Indicadores visuales: verde (sano), rojo (enfermedad detectada)
- Feedback háptico al detectar patógenos

### 📊 Historial y Geolocalización
- Almacenamiento local de detecciones con AsyncStorage
- Geolocalización automática de cada diagnóstico
- Filtros por enfermedad y severidad
- Exportación de datos para análisis

### 💊 Recetas de Tratamiento
- **Tratamientos inmediatos**: Podas sanitarias, eliminación de frutos
- **Controles biológicos**: *Trichoderma*, caldo sulfocálcico
- **Controles químicos**: Fungicidas cúpricos, mancozeb, fosetil-aluminio
- Seguimiento del progreso de aplicación

### 🎮 Gamificación
- Sistema de logros y medallas
- Rachas de detecciones consecutivas
- Ranking de productores
- Motivación para monitoreo constante

## 🧠 Tecnología

### Modelo de IA

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Arquitectura** | YOLOv8n | Equilibrio velocidad/precisión |
| **Formato** | TFLite (int8) | Optimizado para móviles |
| **Input** | 640x640 RGB | Estándar YOLO |
| **Tamaño** | 27 MB | Compresión cuantizada |
| **Inferencia** | ~200-300ms | En dispositivos medios |
| **Confianza** | 0.35 | Pico curva F1 |
| **IoU** | 0.60 | Reduce falsos positivos |

### Enfermedades Detectadas

1. **Sano**: Recuadro verde, vibración suave
2. **Monilia**: Recuadro rojo, vibración fuerte, navegación automática a tratamiento
3. **Fitoftora**: Recuadro rojo, vibración fuerte, navegación automática a tratamiento

### Stack Tecnológico

```
Frontend:          Backend:           Inteligencia Artificial:
├─ React Native   ├─ AsyncStorage    ├─ YOLOv8n (Ultralytics)
├─ Expo SDK 54    ├─ Offline-first   ├─ TensorFlow Lite (int8)
├─ TypeScript     └─ Sin servidor    └─ react-native-fast-tflite
└─ React Navigation                  
```

**Librerías Clave:**
- `expo-camera` - Acceso a cámara nativa + stream de video
- `expo-location` - Geolocalización GPS
- `expo-haptics` - Feedback táctil
- `@react-native-async-storage/async-storage` - Persistencia local
- `react-native-fast-tflite` - Inferencia del modelo YOLO

## 📥 Instalación

### 📱 Descarga Directa (Recomendado)

<div align="center">

## [**⬇️ DESCARGAR APK (v1.0.0)**](https://github.com/LuzuJ/Agro_RedConect/raw/main/releases/AgroCacao-IA-v1.0.0.apk)

[![Descarga APK](https://img.shields.io/badge/Descargar-APK%20Android-3DDC84?style=for-the-badge&logo=android&logoColor=white&labelColor=1a1a1a)](https://github.com/LuzuJ/Agro_RedConect/raw/main/releases/AgroCacao-IA-v1.0.0.apk)

**Tamaño:** 130 MB | **Versión:** 1.0.0 | **Android:** 7.0+

[Ver todas las versiones →](https://github.com/LuzuJ/Agro_RedConect/tree/main/releases/)

</div>

#### 📋 Pasos de instalación:

1. **Descarga** el APK haciendo clic en el botón de arriba
2. **En tu dispositivo Android:**
   - Ve a **Configuración → Seguridad**
   - Activa **"Instalar apps de origen desconocido"** para tu navegador/administrador de archivos
3. **Abre** el archivo descargado desde tus descargas
4. **Toca** "Instalar" y espera a que termine
5. **Otorga** permisos de cámara y ubicación cuando la app lo solicite

#### ✅ Requisitos:
- ✔️ Android 7.0 (API 24) o superior
- ✔️ 200 MB de espacio libre
- ✔️ Cámara trasera funcional
- ✔️ Conexión a internet solo para descargar (la app funciona offline)

---

---

### 🛠️ Opción Avanzada: Compilar desde Código Fuente

<details>
<summary><b>Click para ver instrucciones de compilación</b></summary>

```bash
# Clonar repositorio
git clone https://github.com/LuzuJ/Agro_RedConect.git
cd AgroCacao-IA

# Instalar dependencias
npm install

# Ejecutar en dispositivo/emulador Android
npm run android

# O generar APK de producción
npm run build:release
# APK en: android/app/build/outputs/apk/release/app-release.apk
```

**Requisitos de desarrollo:**
- Node.js 18+
- Java JDK 11+
- Android SDK (Android Studio)
- Git

📖 Para más detalles, consulta [TECHNICAL.md](TECHNICAL.md).

</details>

## 🎯 Uso

### Detección en Tiempo Real

1. Abre la app y otorga permisos
2. Apunta la cámara hacia una mazorca de cacao
3. Activa el **modo tiempo real** (icono radar)
4. Observa los recuadros:
   - 🟢 **Verde**: Mazorca sana
   - 🔴 **Rojo**: Enfermedad detectada (Monilia/Fitoftora)
5. Captura foto para ver diagnóstico detallado

### Diagnóstico con Foto

1. Modo cámara normal (icono lente)
2. Captura foto de la mazorca
3. Espera análisis (~2 segundos)
4. Revisa resultados con nivel de confianza
5. Accede a tratamientos recomendados

## 📸 Capturas de Pantalla

| Splash Screen | Detección Tiempo Real | Diagnóstico | Tratamientos |
|:-------------:|:--------------------:|:-----------:|:------------:|
| ![Splash](docs/screenshots/splash.png) | ![Camera](docs/screenshots/camera.png) | ![Diagnosis](docs/screenshots/diagnosis.png) | ![Treatment](docs/screenshots/treatment.png) |

*Capturas de pantalla de la versión 1.0.0*

## 🗺️ Arquitectura del Sistema

```
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

Ver [TECHNICAL.md](TECHNICAL.md) para más detalles.

## 📊 Rendimiento

| Métrica | Valor | Dispositivo de Prueba |
|---------|-------|-----------------------|
| **Tiempo de inferencia** | ~250ms | Snapdragon 665 |
| **FPS en tiempo real** | ~3-4 fps | Snapdragon 665 |
| **Tamaño de APK** | 130 MB | Release v1.0.0 |
| **Consumo de RAM** | ~180 MB | Durante detección |
| **Precisión del modelo** | 87% mAP@0.5 | Dataset YOLO |

## � Roadmap

### Versión 1.1.0 (Próximamente)
- [ ] 🌐 Modo multi-idioma (Español/Inglés/Portugués)
- [ ] 📊 Exportar historial a CSV/Excel
- [ ] 🔔 Notificaciones de seguimiento de tratamiento
- [ ] 📷 Mejorar calidad de detección en baja luz
- [ ] 🎯 Reducir tamaño del APK a ~100 MB

### Versión 1.2.0 (Futuro)
- [ ] 🤖 Actualizar a YOLOv10 para mejor precisión
- [ ] 🌍 Sincronización opcional con la nube
- [ ] 👥 Modo colaborativo para cooperativas
- [ ] 📈 Dashboard de estadísticas avanzadas
- [ ] 🔊 Asistente por voz para accesibilidad

### Versión 2.0.0 (Visión)
- [ ] 🍃 Detección de más enfermedades (Black Pod, Witch's Broom)
- [ ] 🌡️ Integración con sensores IoT
- [ ] 🤝 Marketplace de productos orgánicos
- [ ] 🎓 Módulo educativo con videos
- [ ] 🌐 Versión web progresiva (PWA)

[Ver todas las funcionalidades planificadas →](https://github.com/LuzuJ/Agro_RedConect/tree/main)

## 🔐 Seguridad y Privacidad

- ✅ **100% Offline**: Ningún dato sale del dispositivo
- ✅ **Sin servidores**: No hay backend, no hay tracking
- ✅ **Datos locales**: AsyncStorage encriptado
- ✅ **Código abierto**: Auditable en GitHub
- ✅ **Sin anuncios**: Aplicación limpia
- ✅ **Sin telemetría**: Respeto total a la privacidad

Ver [TECHNICAL.md](TECHNICAL.md) para más detalles sobre seguridad.

```
MIT License - Copyright (c) 2026 Jonathan Luzuriaga
```

## 👨‍💻 Autor

**Jonathan Luzuriaga**
- 📍 Quito, Ecuador
- 📧 Email: [contacto]
- 🔗 GitHub: [@TU_USUARIO](https://github.com/LuzuJ)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## 🐛 Reportar Problemas

¿Encontraste un bug? [Abre un issue](https://github.com/LuzuJ/Agro_RedConect/tree/main/issues) con:
- Descripción del problema
- Pasos para reproducirlo
- Modelo de dispositivo y versión de Android
- Capturas de pantalla (si aplica)

## 📚 Documentación Adicional

- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema
- [DEPLOY.md](DEPLOY.md) - Guía de despliegue completa
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Resumen del deployment actual
- [SECURITY.md](SECURITY.md) - Políticas de seguridad
- [NEXT_STEPS.md](NEXT_STEPS.md) - Roadmap y próximas features

## 🎓 Citación

Si usas este proyecto en tu investigación, por favor cita:

```bibtex
@software{agrocacao_ia_2026,
  author = {Luzuriaga, Jonathan},
  title = {AgroCacao IA: Sistema Inteligente de Detección de Enfermedades en Cacao},
  year = {2026},
  publisher = {GitHub},
  url = {https://github.com/LuzuJ/Agro_RedConect/tree/main}
}
```

## 🌟 Agradecimientos

- **Ultralytics** - Por YOLOv8 y documentación excepcional
- **Expo Team** - Por simplificar el desarrollo React Native
- **Cacaocultores** - Por inspirar este proyecto

---

<div align="center">

**⭐ Si te resultó útil, dale una estrella al proyecto ⭐**

Hecho con ❤️ para la comunidad cacaotera ecuatoriana

</div>

**Opción recomendada**: 
```bash
npx expo install react-native-fast-tflite
npx expo prebuild
```

## 📁 Estructura del Proyecto

```
mobile/
├── App.tsx                     # Navegación principal
├── app.json                    # Config Expo + permisos
├── assets/models/
│   ├── best_int8.tflite        # Modelo YOLOv8
│   └── labels.txt              # Sano, Monilia, Fitoftora
├── src/
│   ├── screens/                # 5 pantallas
│   ├── services/
│   │   └── DetectionService.ts # Lógica de inferencia
│   └── constants/
│       ├── colors.ts           # Paleta
│       └── modelConfig.ts      # Parámetros IA
└── MODEL_INTEGRATION.md        # Guía TFLite
```

## 🧪 Testing

1. Ejecuta `npx expo start`
2. Escanea QR con Expo Go
3. Prueba:
   - Captura de foto
   - Botón tiempo real (target icon)
   - Vibración al detectar enfermedad
   - Navegación entre pantallas
   - Mapa de plagas

## 🔧 Troubleshooting

**Error de peer dependencies:**
```bash
npm install --legacy-peer-deps
```

**Expo dev server no inicia:**
```bash
npx expo start -c  # Limpiar cache
```

**Google Maps no aparece:**
Agrega tu API key en `app.json` → `config.googleMaps.apiKey`

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

**Nota sobre el modelo YOLOv8:** El modelo de detección está basado en YOLOv8 de [Ultralytics](https://github.com/ultralytics/ultralytics), licenciado bajo AGPL-3.0.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si encuentras algún bug o tienes sugerencias:

1. 🍴 Haz fork del repositorio
2. 🌿 Crea una rama para tu feature: `git checkout -b feature/nueva-caracteristica`
3. 💾 Commit tus cambios: `git commit -m 'Agregar nueva característica'`
4. 📤 Push a la rama: `git push origin feature/nueva-caracteristica`
5. 🔃 Abre un Pull Request

Ver [TECHNICAL.md](TECHNICAL.md) para guía de desarrollo.

## 🐛 Reportar Problemas

¿Encontraste un bug? [Abre un issue](https://github.com/LuzuJ/Agro_RedConect/tree/main/issue/new) con:

- 📱 Modelo de dispositivo y versión de Android
- 🐞 Descripción detallada del problema
- 📸 Capturas de pantalla si es posible
- 🔢 Pasos para reproducir el error

## 📚 Documentación Adicional

- � [Documentación Técnica Completa](TECHNICAL.md) - Arquitectura, deployment, API y configuración
- 📄 [Licencia](LICENSE) - Términos de uso y distribución

## 🙏 Agradecimientos

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Framework de detección de objetos
- [React Native Fast TFLite](https://github.com/mrousavy/react-native-fast-tflite) - Bindings de TensorFlow Lite
- [Expo](https://expo.dev/) - Plataforma de desarrollo móvil
- Comunidad de cacaocultores que proporcionaron imágenes para entrenamiento

## 👨‍💻 Autor

Desarrollado con ❤️ para cacaocultores

---

<div align="center">

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub ⭐**

[![GitHub stars](https://img.shields.io/github/stars/TU_USUARIO/AgroCacao-IA?style=social)](https://github.com/LuzuJ/Agro_RedConect/)
[![GitHub forks](https://img.shields.io/github/forks/TU_USUARIO/AgroCacao-IA?style=social)](LuzuJ/Agro_RedConect)

[Reportar Bug]https://github.com/LuzuJ/Agro_RedConect/tree/main/issues) • [Solicitar Feature](https://github.com/LuzuJ/Agro_RedConect/tree/main/issues) • [Ver Roadmap](#-roadmap)

</div>
