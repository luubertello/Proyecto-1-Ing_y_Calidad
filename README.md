# Proyecto 1 — Sistema de Gestión

Sistema de gestión con frontend en React y backend en NestJS, con base de datos MySQL.

## 🔗 URLs

| Servicio  | URL |
|-----------|-----|
| Frontend  | https://proyecto-1-umber-six.vercel.app |
| Backend / API | https://proyecto-1-t2k6.onrender.com |

## 📦 Repositorio

https://github.com/luubertello/Proyecto-1-Ing_y_Calidad

## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite
- **Backend:** TypeScript + NestJS + TypeORM
- **Base de datos:** MySQL
- **Autenticación:** JWT (access + refresh token)
- **Hosting:** Vercel (frontend) · Render (backend) · Aiven (base de datos)

## ⚙️ Instalación y ejecución local

### Requisitos previos

- Node.js (v18 o superior recomendado)
- Yarn
- Docker y Docker Compose (para levantar la base de datos local)

### 1. Clonar el repositorio

```bash
git clone https://github.com/luubertello/Proyecto-1-Ing_y_Calidad.git
cd Proyecto-1-Ing_y_Calidad
```

### 2. Backend

```bash
cd Proyecto1_Back
yarn install
```

Crear un archivo `.env` en la raíz del backend con las siguientes variables:

```env
DB_PORT=3310
DB_HOST="localhost"
DB_USERNAME="admin"
DB_PASSWORD="admin"
DB_DATABASE="proyecto"

PORT=3000
DB_TYPE="mysql"
DB_SSL="false"
JWT_SECRET="<generar_un_secreto_propio>"
JWT_EXPIRATION_ACCESS="60s"
JWT_EXPIRATION_REFRESH="7d"
PUNTO_VENTA_ACTIVO_ID=2
```

Levantar la base de datos local con Docker:

```bash
docker compose -p proyecto up -d
```

Ejecutar las migraciones:

```bash
yarn migration:run
```

Levantar el backend:

```bash
yarn start:dev
```

El backend queda disponible en `http://localhost:3000`.

### 3. Frontend

```bash
cd ../Proyecto1_Front
yarn install
yarn dev
```

El frontend queda disponible en `http://localhost:5173` (puerto por defecto de Vite).
