# 🔒 Seguridad de AgroCacao IA

## Protección del Modelo TFLite

### ⚠️ Realidad sobre seguridad en apps móviles offline

**El modelo TFLite en React Native NO puede ser 100% seguro** porque:

1. El archivo `.tflite` está embebido en el APK/IPA
2. Cualquiera puede descomprimir el APK y extraer `best_int8.tflite`
3. No hay forma de cifrar completamente en apps offline-first

**Pero podemos dificultar el acceso:**

### ✅ Medidas de seguridad implementadas

#### 1. Ofuscación automática de código (Android)
```gradle
// Ya configurado en android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**Qué hace:**
- Ofusca nombres de clases/funciones JavaScript
- Dificulta ingeniería inversa del código
- Reduce tamaño del APK

#### 2. Modelo embebido en assets nativos
```
mobile/assets/models/
  └── best_int8.tflite  ← No accesible desde JS directamente
```

**Qué hace:**
- El modelo está en carpeta nativa, no en bundle JS
- Requiere permisos del sistema para extraer
- Más difícil que si estuviera en archivo descargable

#### 3. Sin URLs externas del modelo
- No hay endpoints que expongan el modelo
- No hay API keys que robar
- Toda la inferencia es local

### 🚫 Qué NO protege

1. **Extracción del APK**: Cualquiera puede usar `apktool` o similar
2. **Decompilación**: Aunque ofuscado, el código puede ser analizado
3. **Modelo base**: Si alguien extrae el `.tflite`, puede usarlo

### 🛡️ Medidas adicionales recomendadas

#### Opción 1: Modelo servidor (requiere cambio arquitectónico)
```
❌ NO RECOMENDADO para este proyecto
- Requiere conexión permanente
- Costos de servidor
- Contradice el objetivo "offline-first"
```

#### Opción 2: Marca de agua en el modelo
```python
# Durante entrenamiento YOLO
# Agregar una clase especial oculta que solo tu modelo detecte
# Ejemplo: "agrocacao_watermark"

# Si alguien roba el modelo, puedes identificarlo
```

#### Opción 3: Licenciamiento de código abierto
```
✅ RECOMENDADO
- Publica bajo licencia GPL-3.0
- Requiere que derivados también sean open source
- Permite uso pero con atribución
- Protección legal (no técnica)
```

#### Opción 4: Verificación de integridad del APK
```typescript
// Detectar si la app está modificada
import DeviceInfo from 'react-native-device-info';

const checkIntegrity = async () => {
  const isEmulator = await DeviceInfo.isEmulator();
  const installerPackageName = await DeviceInfo.getInstallerPackageName();
  
  // Si no viene de Play Store, mostrar advertencia
  if (installerPackageName !== 'com.android.vending') {
    console.warn('App instalada desde fuente desconocida');
  }
};
```

### 📊 Nivel de protección actual

| Aspecto | Protección | Comentario |
|---------|-----------|-----------|
| Código JavaScript | 🟡 Media | Ofuscado pero reversible |
| Modelo TFLite | 🟡 Media | Difícil extraer pero posible |
| Datos del usuario | 🟢 Alta | AsyncStorage local, no transmitido |
| API keys | 🟢 Alta | No hay APIs externas |
| Ubicación GPS | 🟢 Alta | Solo se guarda localmente |

### 🎯 Conclusión y recomendación

**Para un proyecto académico/social como AgroCacao IA:**

1. **La seguridad actual es suficiente** para:
   - Evitar copias casuales
   - Proteger datos de usuarios
   - Cumplir con GDPR/privacidad

2. **No es suficiente para**:
   - Proteger modelo como secreto comercial
   - Prevenir reverse engineering por expertos

3. **Mejor estrategia:**
   - Publicar como **open source** con licencia GPL-3.0
   - Enfocarse en **valor agregado** (UX, datos locales, optimizaciones)
   - Construir **comunidad** en vez de ocultamiento
   - El valor real está en:
     * La experiencia de usuario
     * Las optimizaciones para dispositivos de baja gama
     * Los datos de entrenamiento (no el modelo)
     * El conocimiento de dominio (tratamientos, enfermedades)

### 📝 .gitignore recomendado

```gitignore
# Modelo original sin cuantizar (si es grande)
*.pt
*.onnx
*.h5

# Datos de entrenamiento
dataset/
*.zip

# Claves de desarrollo
.env.local
secrets.json

# Builds
*.apk
*.aab
*.ipa
ios/build/
android/app/build/
```

### 🚀 Antes de publicar en GitHub

1. ✅ Verificar que no hay API keys en código
2. ✅ Confirmar que `.env` está en `.gitignore`
3. ✅ Revisar que no hay datos personales en historial
4. ✅ Agregar LICENSE (GPL-3.0 o MIT)
5. ✅ Documentar en README que el modelo es para uso académico

### 📄 Licencia sugerida

```markdown
# Licencia

Este proyecto está bajo licencia GPL-3.0

El modelo de IA (best_int8.tflite) es para uso educativo y social.
Uso comercial requiere autorización explícita.

Datos de entrenamiento recopilados en colaboración con 
cooperativas de cacao en Ecuador.
```

---

**Resumen**: Tu modelo está tan seguro como puede estarlo una app offline. 
La mejor protección es la comunidad y el valor agregado, no el ocultamiento técnico.
