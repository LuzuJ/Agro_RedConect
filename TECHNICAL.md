# 🔧 Documentación Técnica - AgroCacao IA

## 📋 Índice

- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalación y Desarrollo](#-instalación-y-desarrollo)
- [Compilación y Despliegue](#-compilación-y-despliegue)
- [API y Base de Datos](#-api-y-base-de-datos)
- [Modelo de IA](#-modelo-de-ia)
- [Configuración de Releases](#-configuración-de-releases)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🏗️ Arquitectura del Sistema

### Estructura del Proyecto

```
Agro_RedConect/
├── src/
│   ├── components/          # Componentes reutilizables React Native
│   │   └── ErrorBoundary.tsx
│   ├── screens/            # Pantallas principales
│   │   ├── SplashScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── DiagnosisScreen.tsx
│   │   ├── TreatmentScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── HeatmapScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/           # Lógica de negocio
│   │   ├── DetectionService.ts
│   │   ├── DetectionHistoryService.ts
│   │   ├── TreatmentProgressService.ts
│   │   └── GamificationService.ts
│   ├── navigation/         # Configuración de navegación
│   │   └── AppNavigator.tsx
│   ├── data/               # Datos estáticos
│   │   └── TreatmentDatabase.ts
│   ├── constants/          # Constantes globales
│   │   ├── colors.ts
│   │   └── modelConfig.ts
│   └── utils/              # Utilidades
│       └── errors.ts
│
├── assets/
│   └── models/             # Modelo TensorFlow Lite
│       ├── best_int8.tflite (27 MB)
│       ├── labels.txt
│       └── metadata.yaml
│
├── android/                # Proyecto Android nativo
│   ├── app/
│   │   ├── build.gradle    # Configuración de build
│   │   └── src/main/
│   └── build.gradle        # Configuración raíz
│
├── Modelo IA/              # Scripts de entrenamiento
│   ├── entrenar_baseline.py
│   ├── split_dataset.py
│   ├── config_cacao.yaml
│   └── DATASET_FINAL_YOLO/
│
└── modelo_predictivo/      # Modelo exportado
    ├── best_int8.tflite
    └── metadata.yaml
```

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                     React Native App                     │
├─────────────────────────────────────────────────────────┤
│  CameraScreen  │  DiagnosisScreen  │  TreatmentScreen   │
├─────────────────────────────────────────────────────────┤
│              DetectionService (Core Logic)               │
│  ┌────────────────────┐    ┌────────────────────────┐  │
│  │  Camera Stream     │───▶│  TFLite Inference      │  │
│  │  expo-camera       │    │  react-native-fast-    │  │
│  │  (640x640)         │    │  tflite (YOLOv8n int8) │  │
│  └────────────────────┘    └────────────────────────┘  │
│              ▼                       ▼                   │
│  ┌────────────────────┐    ┌────────────────────────┐  │
│  │  Bounding Boxes    │    │  AsyncStorage          │  │
│  │  (Real-time UI)    │    │  (History + Location)  │  │
│  │  + Haptics         │    │  + expo-location       │  │
│  └────────────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Usuario

1. **SplashScreen** (1.5s) → Carga inicial, sin autenticación
2. **CameraScreen** → Detección en tiempo real o captura única
3. **DiagnosisScreen** → Resultado con nivel de confianza
4. **TreatmentScreen** → 3 pestañas: Inmediato | Biológico | Químico
5. **HistoryScreen** → Historial con filtros y geolocalización
6. **HeatmapScreen** → Mapa de calor de detecciones (futuro)

---

## 💻 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React Native** | 0.81.5 | Framework móvil |
| **Expo SDK** | ~54.0.31 | Herramientas de desarrollo |
| **TypeScript** | 5.x | Tipado estático |
| **React Navigation** | 6.x | Navegación entre pantallas |

### Librerías Nativas Clave

| Librería | Propósito |
|----------|-----------|
| `expo-camera` | Acceso a cámara + stream de video |
| `expo-location` | Geolocalización GPS |
| `expo-haptics` | Feedback táctil/vibración |
| `@react-native-async-storage/async-storage` | Persistencia local |
| `react-native-fast-tflite` | Inferencia TensorFlow Lite |
| `react-native-maps` | Mapas (Heatmap) |

### Inteligencia Artificial

| Componente | Descripción |
|------------|-------------|
| **Framework** | YOLOv8n (Ultralytics) |
| **Formato** | TensorFlow Lite (int8) |
| **Cuantización** | INT8 para optimización móvil |
| **Tamaño** | 27 MB (comprimido) |
| **Input** | 640x640 RGB |
| **Output** | Bounding boxes + clases + confianza |
| **Clases** | 0: Sano, 1: Monilia, 2: Fitoftora |

---

## 🚀 Instalación y Desarrollo

### Requisitos Previos

```bash
Node.js 18+
Java JDK 11+
Android SDK (Android Studio)
Git
```

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/LuzuJ/Agro_RedConect.git
cd AgroCacao-IA

# 2. Instalar dependencias
npm install

# Si hay errores de peer dependencies:
npm install --legacy-peer-deps

# 3. Configurar Android SDK (si no está configurado)
# Asegúrate de tener ANDROID_HOME configurado
echo $ANDROID_HOME  # Linux/Mac
echo $env:ANDROID_HOME  # Windows PowerShell
```

### Desarrollo

```bash
# Iniciar Metro bundler
npx expo start

# Ejecutar en Android (dispositivo/emulador conectado)
npx expo run:android

# Ejecutar con cache limpio
npx expo start -c

# Ver logs de Android
npx react-native log-android
```

### Estructura de Comandos NPM

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build:release": "cd android && ./gradlew assembleRelease",
    "clean": "cd android && ./gradlew clean",
    "test": "jest"
  }
}
```

---

## 📦 Compilación y Despliegue

### Paso 1: Generar Keystore de Producción

**⚠️ EJECUTAR SOLO UNA VEZ**

```powershell
# Windows PowerShell
./generate-keystore.ps1

# O manualmente:
keytool -genkeypair -v -storetype PKCS12 `
  -keystore android/app/release.keystore `
  -alias agrocacao-key `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -storepass TU_PASSWORD
```

**Guardar:**
- 📁 Archivo: `android/app/release.keystore`
- 🔑 Alias: `agrocacao-key`
- 🔒 Password: (el que elegiste)

**⚠️ CRÍTICO:** Guarda el keystore en 3 lugares seguros:
1. USB cifrado
2. Servicio de nube privado
3. Disco duro externo

### Paso 2: Configurar Firma

Crear `android/app/keystore.properties`:

```properties
storePassword=TU_PASSWORD
keyPassword=TU_PASSWORD
keyAlias=agrocacao-key
storeFile=release.keystore
```

**⚠️ Este archivo NO debe subirse a Git** (ya está en `.gitignore`)

### Paso 3: Compilar APK de Producción

```bash
# Limpiar builds anteriores
cd android && ./gradlew clean && cd ..

# Compilar APK firmada
npm run build:release

# APK generada en:
# android/app/build/outputs/apk/release/app-release.apk
```

### Paso 4: Verificar APK

```bash
# Instalar en dispositivo conectado
adb install android/app/build/outputs/apk/release/app-release.apk

# Ver información del APK
aapt dump badging android/app/build/outputs/apk/release/app-release.apk

# Verificar firma
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

### Paso 5: Subir a GitHub

```bash
# 1. Inicializar Git (si es nuevo proyecto)
git init

# 2. Agregar archivos (el .gitignore ya excluye archivos sensibles)
git add .

# 3. Commit inicial
git commit -m "feat: sistema de detección de enfermedades en cacao con YOLOv8"

# 4. Conectar con GitHub (crear repo primero en GitHub)
git remote add origin https://github.com/LuzuJ/Agro_RedConect.git
git branch -M main
git push -u origin main
```

### Verificación de Seguridad

**✅ Lo que SÍ se sube a Git:**
- ✅ Código fuente (src/, android/app/src/)
- ✅ Configuraciones públicas (gradle, package.json)
- ✅ Modelo TFLite (assets/models/)
- ✅ README y documentación

**❌ Lo que NO se sube a Git:**
- ❌ `.env` (variables de entorno)
- ❌ `*.keystore` y `*.jks` (keystores)
- ❌ `keystore.properties` (credenciales)
- ❌ `node_modules/` (dependencias)
- ❌ `android/app/build/` (builds compilados)

```bash
# Verificar archivos a subir
git status

# Ver archivos ignorados
git status --ignored

# Verificar diferencias antes de commit
git diff --cached
```

---

## 🌐 Configuración de GitHub Releases

### Crear Release con APK Descargable

1. **Ve a tu repositorio en GitHub**
   - `https://github.com/LuzuJ/Agro_RedConect/`

2. **Clic en "Releases" → "Draft a new release"**

3. **Configurar Release:**
   ```
   Tag version: v1.0.0
   Release title: 🌱 AgroCacao IA v1.0.0 - Primera Versión Estable
   ```

4. **Agregar descripción** (ejemplo):
   ```markdown
   ## 🎉 Primera Versión Estable
   
   ### ✨ Características:
   - 🎥 Detección en tiempo real
   - 🧠 Modelo YOLOv8 optimizado
   - 📍 Geolocalización automática
   - 💊 Recetas de tratamiento
   
   ### 📱 Requisitos:
   - Android 7.0+ (API 24)
   - 200 MB de espacio
   ```

5. **Subir APK:**
   - Arrastra `app-release.apk` → Renombrar a `AgroCacao-IA-v1.0.0.apk`
   - Espera que suba completamente

6. **Publicar:**
   - ✅ Marcar "Set as the latest release"
   - ⬜ NO marcar "Set as a pre-release"
   - Clic "Publish release"

### Enlace de Descarga Directa

Tu APK estará disponible en:
```
https://github.com/LuzuJ/Agro_RedConect/blob/main/releases/AgroCacao-IA-v1.0.0.apk

### Actualizar Versiones Futuras

```bash
# 1. Actualizar versión en android/app/build.gradle
# android {
#   defaultConfig {
#     versionCode 2
#     versionName "1.1.0"
#   }
# }

# 2. Compilar nueva APK
npm run build:release

# 3. Commit y push
git add android/app/build.gradle
git commit -m "chore: bump version to 1.1.0"
git push

# 4. Crear nuevo release en GitHub con nueva APK
gh release create v1.1.0 \
  android/app/build/outputs/apk/release/app-release.apk#AgroCacao-IA-v1.1.0.apk \
  --title "AgroCacao IA v1.1.0" \
  --notes "Ver CHANGELOG para detalles"
```

---

## 🗄️ API y Base de Datos

### AsyncStorage (Almacenamiento Local)

```typescript
// Estructura de datos
interface DetectionRecord {
  id: string;
  timestamp: number;
  disease: 'Sano' | 'Monilia' | 'Fitoftora';
  confidence: number;
  location: {
    latitude: number;
    longitude: number;
  };
  imageUri: string;
}

// Keys usadas
const STORAGE_KEYS = {
  DETECTION_HISTORY: '@agrocacao:detection_history',
  USER_PREFERENCES: '@agrocacao:user_preferences',
  GAMIFICATION_DATA: '@agrocacao:gamification',
  TREATMENT_PROGRESS: '@agrocacao:treatment_progress'
};
```

### Servicios

#### DetectionService

```typescript
class DetectionService {
  // Inicializar modelo TFLite
  async initializeModel(): Promise<void>
  
  // Ejecutar inferencia
  async detectDisease(imageUri: string): Promise<Detection>
  
  // Detección en tiempo real
  async processFrame(frame: Frame): Promise<Detection[]>
}
```

#### DetectionHistoryService

```typescript
class DetectionHistoryService {
  // Guardar detección
  async saveDetection(detection: DetectionRecord): Promise<void>
  
  // Obtener historial
  async getHistory(filters?: Filters): Promise<DetectionRecord[]>
  
  // Exportar a CSV
  async exportToCSV(): Promise<string>
}
```

---

## 🤖 Modelo de IA

### Especificaciones Técnicas

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Arquitectura** | YOLOv8n | Equilibrio velocidad/precisión |
| **Framework** | Ultralytics YOLOv8 | State-of-the-art en detección |
| **Formato exportado** | TensorFlow Lite (int8) | Optimizado para móviles |
| **Cuantización** | INT8 | Reduce tamaño 4x, mínima pérdida |
| **Input shape** | (1, 640, 640, 3) | Estándar YOLO |
| **Output** | Bounding boxes + clases | Post-procesamiento en CPU |
| **Tamaño modelo** | 27 MB | Compresión int8 |
| **Tiempo inferencia** | ~200-300ms | En Snapdragon 665 |
| **Umbral confianza** | 0.35 | Pico curva F1 |
| **Umbral IoU** | 0.60 | Reduce falsos positivos |

### Entrenamiento del Modelo

```python
# Ubicación: Modelo IA/entrenar_baseline.py

from ultralytics import YOLO

# Cargar modelo pre-entrenado
model = YOLO('yolov8n.pt')

# Entrenar
results = model.train(
    data='config_cacao.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device=0,  # GPU
    name='cacao_detector'
)

# Exportar a TFLite
model.export(format='tflite', int8=True)
```

### Dataset

- **Total imágenes:** 2,500+
- **Clases:** Sano (0), Monilia (1), Fitoftora (2)
- **Split:** 70% train, 20% validation, 10% test
- **Augmentation:** Rotación, flip, brillo, contraste

### Métricas del Modelo

| Métrica | Valor |
|---------|-------|
| **mAP@0.5** | 87% |
| **mAP@0.5:0.95** | 62% |
| **Precision** | 89% |
| **Recall** | 85% |
| **F1-Score** | 87% |

---

## 🛠️ Solución de Problemas

### Error: "keytool not found"

```bash
# Instalar Java JDK
# Windows: https://adoptium.net/
# Verificar instalación
java -version
keytool -help
```

### Error: "Android SDK not found"

```bash
# Configurar ANDROID_HOME
# Windows PowerShell:
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\TU_USUARIO\AppData\Local\Android\Sdk", "User")

# Verificar:
echo $env:ANDROID_HOME
```

### Error: "Execution failed for task ':app:mergeDexRelease'"

```bash
# Habilitar multidex en android/app/build.gradle
android {
    defaultConfig {
        multiDexEnabled true
    }
}
```

### APK no instala en el teléfono

1. Habilitar "Instalar apps desconocidas" en Configuración → Seguridad
2. Verificar firma: `jarsigner -verify app-release.apk`
3. Verificar `versionCode` sea mayor al anterior

### Error: "Cannot find module 'react-native-fast-tflite'"

```bash
# Reinstalar dependencias nativas
cd android && ./gradlew clean && cd ..
npm install
npx expo prebuild --clean
npm run android
```

### Modelo TFLite no carga

```bash
# Verificar que existe
ls assets/models/best_int8.tflite

# Verificar configuración en metro.config.js
module.exports = {
  resolver: {
    assetExts: ['tflite', 'txt', 'yaml', ...],
  },
};
```

---

## 📞 Soporte y Recursos

### Documentación Externa

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [YOLOv8 Documentation](https://docs.ultralytics.com/)
- [TensorFlow Lite Guide](https://www.tensorflow.org/lite)
- [Android Developer Docs](https://developer.android.com/)

### Comunidad

- [GitHub Issues](https://github.com/LuzuJ/Agro_RedConect/issues)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)
- [Expo Forums](https://forums.expo.dev/)

---

## 📊 Métricas de Rendimiento

### Benchmarks

| Dispositivo | Procesador | RAM | Tiempo Inferencia | FPS Real-time |
|-------------|------------|-----|-------------------|---------------|
| Samsung A20s | Snapdragon 450 | 3GB | ~280ms | 3-4 fps |
| Xiaomi Redmi Note 9 | Helio G85 | 4GB | ~220ms | 4-5 fps |
| Samsung S21 | Snapdragon 888 | 8GB | ~120ms | 8-10 fps |

### Consumo de Recursos

| Recurso | Uso Promedio | Uso Máximo |
|---------|--------------|------------|
| RAM | ~180 MB | ~250 MB |
| Batería | 15% por hora | 25% por hora |
| Almacenamiento | 150 MB | 200 MB (con historial) |
| Datos móviles | 0 MB | 0 MB (offline) |

---

## 🔐 Consideraciones de Seguridad

### Datos del Usuario

- ✅ Todo almacenado localmente (AsyncStorage)
- ✅ Sin servidores externos
- ✅ Sin tracking ni analytics
- ✅ Sin recolección de datos personales

### Permisos Requeridos

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.VIBRATE" />
```

### Buenas Prácticas

- 🔒 Keystore guardado en lugar seguro (no en Git)
- 🔒 Variables de entorno en `.env` (no en código)
- 🔒 Credenciales en `keystore.properties` (gitignored)
- 🔒 Código fuente abierto para auditoría

---

## 📝 Notas Finales

- El modelo TFLite (27 MB) debe incluirse en el bundle de la app
- La primera inferencia puede tardar ~1 segundo (inicialización)
- Detecciones subsecuentes son más rápidas (~200-300ms)
- Funciona 100% offline, no requiere internet después de instalación
- Permisos de cámara y ubicación son obligatorios

Para más información, consulta el [README.md](README.md) principal.

---

**Última actualización:** Enero 2026
