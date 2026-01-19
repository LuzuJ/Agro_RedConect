# 🚀 Guía de Despliegue - AgroCacao IA

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Java JDK 11+ instalado (para generar keystore)
- Android SDK instalado
- Git instalado

## 🔐 Paso 1: Generar Keystore de Producción

**⚠️ IMPORTANTE: Solo ejecuta esto UNA VEZ. Guarda el keystore en un lugar seguro.**

```powershell
# Generar keystore firmado para producción
./generate-keystore.ps1
```

El script te pedirá:
- Nombre completo
- Organización/Universidad
- Ciudad
- País (código de 2 letras, ej: EC)
- Contraseña (mínimo 6 caracteres)

**🔒 Guarda esta información:**
- Archivo: `android/app/release.keystore`
- Alias: `agrocacao-key`
- Contraseña: (la que elegiste)

**⚠️ Si pierdes el keystore, NO podrás actualizar la app en Play Store.**

## 📦 Paso 2: Compilar APK de Producción

```powershell
# Instalar dependencias
npm install

# Compilar APK firmada
npm run build:release
```

La APK estará en:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📤 Paso 3: Subir a GitHub

### 3.1 Verificar que NO subes archivos sensibles

El `.gitignore` ya está configurado para excluir:
- ✅ `.env` (variables de entorno)
- ✅ `*.jks` y `*.keystore` (keystores de producción)
- ✅ `keystore.properties` (credenciales del keystore)
- ✅ `node_modules/` (dependencias)

**✅ SÍ se suben:**
- ✅ `assets/models/` (modelo TFLite - necesario)
- ✅ `android/` (código nativo - necesario para builds)
- ✅ `.env.example` (template sin datos sensibles)

### 3.2 Comandos Git

```bash
# Inicializar repositorio (si es nuevo)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "feat: Sistema de detección de enfermedades en cacao con YOLOv8"

# Conectar con GitHub (crea el repo primero en GitHub)
git remote add origin https://github.com/TU_USUARIO/AgroCacao-IA.git

# Subir código
git branch -M main
git push -u origin main
```

## 🔒 Paso 4: Verificación de Seguridad

### ✅ Checklist de Seguridad

- [ ] `.env` NO está en el repositorio
- [ ] `release.keystore` NO está en el repositorio
- [ ] `keystore.properties` NO está en el repositorio
- [ ] No hay API keys hardcodeadas en el código
- [ ] El modelo TFLite SÍ está incluido
- [ ] La carpeta `android/` SÍ está incluida

### 🔍 Verificar archivos antes de subir

```bash
# Ver qué archivos se van a subir
git status

# Ver archivos ignorados
git status --ignored

# Verificar que no haya secretos expuestos
git diff --cached
```

## 📱 Paso 5: Distribuir APK

### Opción A: Descarga Directa (Recomendado para testing)

1. Sube la APK a GitHub Releases:
   - Ve a tu repositorio en GitHub
   - Click en "Releases" → "Create a new release"
   - Sube `app-release.apk`
   - Publica el release

2. Comparte el link de descarga:
   ```
   https://github.com/TU_USUARIO/AgroCacao-IA/releases/latest/download/app-release.apk
   ```

### Opción B: Google Play Store (Producción)

1. Ve a [Google Play Console](https://play.google.com/console)
2. Crea una nueva aplicación
3. Sube la APK firmada
4. Completa la información de la app
5. Publica en modo "Internal Testing" primero

## 🔄 Actualizar la App

Para versiones futuras:

```powershell
# 1. Actualiza versionCode y versionName en android/app/build.gradle
# android/app/build.gradle:
#   versionCode 2
#   versionName "1.1.0"

# 2. Compila nueva APK
npm run build:release

# 3. Commit y push
git add .
git commit -m "chore: bump version to 1.1.0"
git push

# 4. Crea nuevo release en GitHub con la nueva APK
```

## 🛡️ Backup del Keystore

**⚠️ MUY IMPORTANTE:**

1. Guarda `release.keystore` en 3 lugares seguros:
   - USB cifrado
   - Servicio de nube privado (Google Drive, OneDrive)
   - Disco duro externo

2. Documenta las credenciales en un gestor de contraseñas:
   - 1Password, Bitwarden, LastPass, etc.

3. **NUNCA:**
   - ❌ Subas el keystore a GitHub
   - ❌ Compartas la contraseña por email
   - ❌ Guardes el keystore en la misma carpeta del proyecto

## 🆘 Solución de Problemas

### Error: "keytool not found"
```bash
# Instala Java JDK
# Windows: https://adoptium.net/
# Verifica instalación:
java -version
keytool -help
```

### Error: "Android SDK not found"
```bash
# Verifica que ANDROID_HOME esté configurado
echo $env:ANDROID_HOME

# Debe apuntar a algo como:
# C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

### La APK no instala en el teléfono
1. Habilita "Instalar apps desconocidas" en Configuración
2. Asegúrate de que la APK esté firmada correctamente
3. Verifica que el `versionCode` sea mayor al anterior

## 📞 Contacto

Si tienes problemas durante el despliegue, revisa:
- [Documentación de React Native](https://reactnative.dev/docs/signed-apk-android)
- [Guía de Android Studio](https://developer.android.com/studio/publish/app-signing)
