# Events JC Backend

## Descripción
Backend para la gestión de eventos y reservas desarrollado con NestJS. Esta aplicación permite la gestión completa de eventos, incluyendo creación, actualización, reserva y administración de usuarios.

## Servicios Principales

### Servicio de Autenticación (AuthModule)
- **Funcionalidades**: 
  - Registro y autenticación de usuarios
  - Gestión de sesiones con JWT
  - Protección de rutas con Guards
  - Recuperación de contraseñas
- **Tecnologías**: 
  - Passport
  - JWT
  - Bcrypt para encriptación de contraseñas

### Servicio de Eventos (EventModule)
- **Funcionalidades**:
  - Creación y gestión de eventos
  - Búsqueda y filtrado de eventos
  - Categorización de eventos
- **Características**:
  - Soporte para fechas y zonas horarias (date-fns, date-fns-tz)
  - Validación de datos con class-validator

### Servicio de Reservas (BookingModule)
- **Funcionalidades**:
  - Creación y gestión de reservas para eventos
  - Verificación de disponibilidad
  - Confirmación de reservas
- **Características**:
  - Integración con el servicio de eventos
  - Validación de conflictos de horarios

### Servicio de Email (MailModule)
- **Funcionalidades**:
  - Envío de notificaciones por correo electrónico
  - Plantillas para diferentes tipos de notificaciones
- **Tecnologías**:
  - @nestjs-modules/mailer

## Base de Datos
- PostgreSQL con TypeORM
- Configuración basada en variables de entorno
- Zona horaria configurada para América/Bogotá
- **Containerización**: Base de datos PostgreSQL implementada con Docker
  - Imagen: postgres:17.3
  - Volumen persistente para almacenamiento de datos
  - Configuración mediante variables de entorno

## Características Técnicas
- Desarrollo con TypeScript
- Validación de datos con class-validator y class-transformer
- Estructura modular siguiendo los principios de NestJS
- Pruebas unitarias con Jest
- Docker para la gestión de la base de datos

## Requisitos
- Node.js
- Docker y Docker Compose (para la base de datos)
- Variables de entorno configuradas (DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_CONTAINER_NAME)

## Instalación

```bash
# Iniciar la base de datos con Docker
docker-compose up -d

# Instalar dependencias
yarn install

# Desarrollo
yarn start:dev

# Producción
yarn build
yarn start:prod
```

## Pruebas

```bash
# Pruebas unitarias
yarn test

# Cobertura de pruebas
yarn test:cov

# Pruebas e2e
yarn test:e2e
```
