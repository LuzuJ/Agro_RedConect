# 📤 Guía para Subir a GitHub

## ✅ Estado Actual

Todo está listo para subir a GitHub:

- ✅ Código fuente limpio
- ✅ APK incluido en `releases/AgroCacao-IA-v1.0.0.apk` (130 MB)
- ✅ **Git LFS configurado** para archivos grandes (APK + modelo TFLite)
- ✅ Archivos sensibles protegidos (.env, keystores)
- ✅ README profesional con badges y documentación
- ✅ Commits organizados

## 🚀 Pasos para Subir

### 1. Crear Repositorio en GitHub

1. Ve a [github.com/new](https://github.com/new)
2. Completa:
   - **Repository name**: `AgroCacao-IA`
   - **Description**: `Sistema inteligente de detección de enfermedades en cacao con YOLOv8 y React Native - Funciona 100% offline`
   - **Visibility**: ✅ Public
   - **NO marques**: Initialize with README, .gitignore, license (ya los tienes)
3. Clic en **"Create repository"**

### 2. Conectar y Subir el Código

```bash
# En tu terminal (PowerShell)
cd "d:\PERSONAL PROJECTS\AgroIA_demo\Agro_RedConect"

# Conectar con tu repositorio de GitHub
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote set-url origin https://github.com/TU_USUARIO/AgroCacao-IA.git

# Verificar la conexión
git remote -v

# Subir todo a GitHub
git push -u origin main
```

**Nota**: Si te pide autenticación:
- Usuario: tu username de GitHub
- Contraseña: usa un **Personal Access Token** (no tu contraseña)
  - Créalo en: Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Scopes necesarios: `repo` (acceso completo a repositorios)

### 3. Verificar en GitHub

Una vez subido, ve a tu repositorio en GitHub y verifica:

1. **✅ Archivos visibles**:
   - README.md con badges y formato profesional
   - `releases/AgroCacao-IA-v1.0.0.apk` (130 MB)
   - `assets/models/best_int8.tflite` (27 MB)
   - Carpeta `android/` completa
   - `.env.example`

2. **❌ Archivos NO visibles (protegidos)**:
   - `android/app/release.keystore`
   - `android/app/keystore.properties`
   - `.env`
   - `/Modelo IA/` (datasets de entrenamiento)
   - `/Mockups/`

### 4. Configurar Página Principal

1. En tu repositorio, ve a **Settings**
2. En la sección **General**:
   - **Topics**: Agrega tags: `react-native`, `yolov8`, `tensorflow-lite`, `cacao`, `agriculture`, `ai`, `computer-vision`, `ecuador`
   - **Description**: Asegúrate que esté igual a la descripción del README

3. En **About** (sidebar derecho):
   - ✅ Use your repository description
   - Website: (deja vacío o agrega tu portfolio)

### 5. Actualizar README con Tu Usuario

Edita el README y reemplaza `TU_USUARIO` con tu username real de GitHub:

```bash
# Buscar y reemplazar en el archivo
# Líneas a actualizar:
# - Badge de APK: releases/AgroCacao-IA-v1.0.0.apk
# - Link de issues: https://github.com/TU_USUARIO/AgroCacao-IA/issues
# - Link de citación: https://github.com/TU_USUARIO/AgroCacao-IA
```

Luego haz commit:
```bash
git add README.md
git commit -m "docs: Actualizar enlaces con username de GitHub"
git push
```

## 📥 Permitir Descargas del APK

### Opción A: Descarga Directa desde releases/ (Ya configurado)

Los usuarios pueden descargar directamente:
```
https://github.com/TU_USUARIO/AgroCacao-IA/raw/main/releases/AgroCacao-IA-v1.0.0.apk
```

**Instrucciones para usuarios**:
1. Clic en el badge "Download APK" del README
2. O navegar a la carpeta `releases/`
3. Clic en `AgroCacao-IA-v1.0.0.apk`
4. Clic en botón **"Download"**

### Opción B: GitHub Releases (Más profesional)

1. En tu repositorio, ve a **Releases** (sidebar derecho)
2. Clic en **"Create a new release"**
3. Completa:
   - **Tag**: `v1.0.0`
   - **Release title**: `🌱 AgroCacao IA v1.0.0 - Primera Versión`
   - **Description**:
     ```markdown
     # 🎉 Primera Release Oficial
     
     ## ✨ Características Principales
     - ✅ Detección en tiempo real de Monilia y Fitoftora
     - ✅ Modelo YOLOv8n TFLite (int8) incluido
     - ✅ Funciona 100% offline sin internet
     - ✅ Historial con geolocalización
     - ✅ Sistema de gamificación
     
     ## 📥 Instalación
     1. Descarga `AgroCacao-IA-v1.0.0.apk` (130 MB)
     2. Habilita "Instalar apps de origen desconocido"
     3. Instala y otorga permisos de cámara/ubicación
     
     ## 📋 Requisitos
     - Android 7.0 (API 24) o superior
     - 200 MB de espacio libre
     
     ## 📊 Rendimiento
     - Inferencia: ~250ms en Snapdragon 665
     - Precisión: 87% mAP@0.5
     
     ## 🐛 Reporte de Bugs
     [Abre un issue](https://github.com/TU_USUARIO/AgroCacao-IA/issues)
     ```
4. **Attach binaries**: Arrastra `releases/AgroCacao-IA-v1.0.0.apk`
5. Marca: ✅ **Set as the latest release**
6. Clic en **"Publish release"**

Esto creará un enlace oficial de descarga:
```
https://github.com/TU_USUARIO/AgroCacao-IA/releases/download/v1.0.0/AgroCacao-IA-v1.0.0.apk
```

## 📱 Compartir el Proyecto

Una vez subido, puedes compartir con:

**Link corto**:
```
https://github.com/TU_USUARIO/AgroCacao-IA
```

**Link directo de descarga** (después de crear release):
```
https://github.com/TU_USUARIO/AgroCacao-IA/releases/latest
```

**QR Code**: Genera en [qr-code-generator.com](https://www.qr-code-generator.com/) con el link de tu repo

## 🔄 Actualizaciones Futuras

Cuando hagas cambios:

```bash
# 1. Hacer cambios en el código
# 2. Actualizar versión en android/app/build.gradle
#    versionCode 2
#    versionName "1.1.0"

# 3. Generar nuevo APK
npm run build:release

# 4. Copiar a releases/
Copy-Item "android/app/build/outputs/apk/release/app-release.apk" `
          "releases/AgroCacao-IA-v1.1.0.apk"

# 5. Commit y push
git add .
git commit -m "release: v1.1.0 - Descripción de cambios"
git push

# 6. Crear nueva release en GitHub con el nuevo APK
```

## 📊 Analytics y Stats

GitHub te mostrará automáticamente:
- **Clones**: Cuántas veces clonaron tu repo
- **Views**: Visitas únicas al repo
- **Stars**: Personas que marcaron tu proyecto favorito
- **Forks**: Copias del proyecto
- **Downloads**: Descargas del APK (en Releases)

Ve a: **Insights → Traffic** para ver estadísticas

## 🎯 Próximos Pasos Recomendados

1. ✅ Subir a GitHub (main)
2. ⬜ Crear primera Release (v1.0.0)
3. ⬜ Agregar screenshots reales en `docs/screenshots/`
4. ⬜ Crear video demo y subirlo a YouTube
5. ⬜ Compartir en redes:
   - LinkedIn (artículo técnico)
   - Twitter/X (thread con capturas)
   - Reddit (r/reactnative, r/MachineLearning)
6. ⬜ Agregar proyecto a [Made with Expo](https://github.com/expo/examples)
7. ⬜ Considerar Google Play Store ($25)

## 🆘 Troubleshooting

### Error: "remote: Permission denied"
**Causa**: Credenciales incorrectas
**Solución**: Usa Personal Access Token en lugar de contraseña

### Error: "large files detected"
**Causa**: GitHub tiene límite de 100 MB por archivo
**Solución**: ✅ **Ya configurado**. Git LFS ya está activado para archivos `.apk` y `.tflite`

Si necesitas verificar:
```bash
git lfs ls-files
# Debe mostrar:
# assets/models/best_int8.tflite
# releases/AgroCacao-IA-v1.0.0.apk
```

### Error: "failed to push some refs"
**Causa**: El remote tiene commits que no tienes local
**Solución**:
```bash
git pull origin main --rebase
git push
```

## ✅ Checklist Final

Antes de considerar el proyecto "publicado", verifica:

- [ ] README.md muestra correctamente en GitHub
- [ ] APK se puede descargar desde `releases/`
- [ ] No hay archivos sensibles visibles (keystores, .env)
- [ ] El modelo TFLite está incluido
- [ ] Los badges funcionan correctamente
- [ ] La descripción del repo es atractiva
- [ ] Topics/tags están configurados
- [ ] Licencia MIT visible
- [ ] Contacto/autor actualizado
- [ ] SECURITY.md configurado

---

**🎉 ¡Listo para mostrar al mundo tu proyecto!**
