# AgriCacao - Diagnóstico Inteligente de Enfermedades de Cacao 🌱

Aplicación web progresiva (PWA) para diagnóstico instantáneo de enfermedades de cacao mediante inteligencia artificial.

## 📋 Características

- **Sin fricción**: La app abre directo en la cámara, sin login ni registro
- **Diagnóstico offline**: Detección en tiempo real usando TensorFlow Lite
- **Guías de tratamiento**: Soluciones inmediatas, biológicas y químicas
- **Mapa de calor**: Visualiza brotes de enfermedades en tu zona
- **Geo-tracking**: Almacena ubicación de cada detección

## 🏗️ Arquitectura del Proyecto

```
Agro_RedConect/
├── src/
│   ├── client/              # Frontend React + TypeScript
│   │   ├── screens/         # Pantallas: Splash, Camera, Diagnosis, etc
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Hooks personalizados
│   │   ├── services/        # Servicios API
│   │   └── App.tsx          # Componente principal
│   │
│   ├── server/              # Backend Node.js + Express (MVC)
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Modelos MongoDB
│   │   ├── routes/          # Rutas API
│   │   ├── middleware/      # Middlewares
│   │   ├── config/          # Configuración
│   │   └── index.js         # Entry point servidor
│   │
│   └── shared/              # Tipos compartidos TypeScript
│
├── public/
│   └── models/              # Modelo TensorFlow Lite (.tflite)
│
├── Modelo IA/               # Scripts de entrenamiento YOLOv8
└── modelo_predictivo/       # Modelo entrenado
```

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/LuzuJ/Agro_RedConect.git
cd Agro_RedConect

# Instalar dependencias
npm install --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

## 💻 Desarrollo

```bash
# Iniciar servidor backend + frontend (recomendado)
npm run dev

# O por separado:
npm run dev:server  # Solo backend (puerto 5000)
npm run dev:client  # Solo frontend (puerto 3000)
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:5000/api/v1

## 🔨 Producción

```bash
# Build
npm run build

# Iniciar servidor (sirve API + archivos estáticos)
npm start
```

## 📊 Base de Datos

El proyecto usa MongoDB. Para inicializar con datos de ejemplo:

```bash
npm run seed
```

### Modelos de datos:
- **Detection**: Registros de detecciones con geolocalización
- **Disease**: Enfermedades (Sano, Monilia, Fitoftora)
- **Treatment**: Tratamientos por enfermedad y tipo

## 🎯 Flujo de Usuario

1. **Pantalla Splash** (1.5s) - Logo, sin autenticación
2. **Cámara** - Detección en tiempo real con confianza > 35%
3. **Diagnóstico** - Resultado offline con foto y porcentaje
4. **Tratamiento** - 3 pestañas: Inmediato | Biológico | Químico
5. **Mapa de Calor** - Visualización de brotes cercanos

## 🛠️ Tecnologías

### Frontend
- React 19
- TypeScript
- TailwindCSS
- TensorFlow.js / TFLite
- Leaflet (mapas)
- Vite

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Arquitectura MVC
- RESTful API

### IA
- YOLOv8 (entrenamiento)
- TensorFlow Lite (inferencia)
- Modelo: `best_int8.tflite`

## 📱 API Endpoints

### Detecciones
- `POST /api/v1/detections` - Crear detección
- `POST /api/v1/detections/sync` - Sincronizar detecciones offline
- `GET /api/v1/detections` - Historial de detecciones

### Tratamientos
- `GET /api/v1/treatments/disease/:diseaseName` - Obtener tratamientos
- `GET /api/v1/treatments/:id` - Detalle de tratamiento

### Mapa de Calor
- `GET /api/v1/heatmap?latitude=X&longitude=Y` - Datos del mapa
- `GET /api/v1/heatmap/alerts` - Alertas de zona

## 📝 Variables de Entorno

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/agricacao

# API
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

MIT

## 👥 Autores

- **LuzuJ** - [GitHub](https://github.com/LuzuJ)

---

**Nota**: Las carpetas `Modelo IA/` y `modelo_predictivo/` contienen scripts de entrenamiento y el modelo final. No modificar a menos que se requiera re-entrenar el modelo.
