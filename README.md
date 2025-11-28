# AgriConnect v2

Red social para agricultores con arquitectura limpia y escalable.

## 🏗️ Arquitectura

```
agriconnect-v2/
├── client/           # Frontend React + TypeScript + Vite
├── server/           # Backend Node.js + Express (preparado)
└── shared/           # Tipos y utilidades compartidas
```

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo (solo frontend)
npm run dev

# Desarrollo (frontend + backend)
npm run dev:all

# Build de producción
npm run build
```

## 📁 Estructura del Cliente

```
client/src/
├── components/       # Componentes UI reutilizables
│   ├── ui/          # Componentes base (Button, Card, etc.)
│   └── layout/      # Componentes de layout
├── features/        # Módulos por funcionalidad
│   ├── auth/        # Autenticación
│   ├── posts/       # Publicaciones
│   ├── market/      # Marketplace
│   ├── diagnosis/   # Diagnóstico de plantas
│   └── groups/      # Grupos
├── hooks/           # Custom hooks globales
├── contexts/        # Contextos React
├── services/        # Servicios API
├── lib/            # Utilidades
└── types/          # TypeScript types
```

## 🔧 Tecnologías

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- IndexedDB (almacenamiento local)

### Backend (preparado)
- Node.js
- Express
- TypeScript
- Prisma (ORM - preparado para cualquier DB)

## 🗃️ Base de Datos

El proyecto usa una **capa de abstracción** que permite cambiar fácilmente entre:
- IndexedDB (desarrollo local)
- PostgreSQL
- MongoDB
- MySQL

Solo necesitas implementar la interfaz `IRepository` para cada proveedor.

## 📝 Licencia

MIT

Juan Pérez  
juan.perez@example.com  
password123  

María García  
maria.garcia@example.com  
password123  

Carlos Rodríguez  
carlos.rodriguez@example.com  
password123  