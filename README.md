# Backend - Trabajo Práctico Progra3

**Resumen de la aplicación**
- **Qué hace:** API REST construida con NestJS que maneja usuarios, recetas, ingredientes y calendario de comidas. Integra servicios externos para obtener información nutricional (FatSecret) y almacenamiento de imágenes (Cloudinary). Autenticación por JWT y control de roles.

**Sistema de Roles**
- Los roles definidos están en [src/modules/auth/roles.enum.ts](src/modules/auth/roles.enum.ts#L1-L6).
- Roles disponibles:
  - `administrador` — RoleIds.ADMIN
  - `usuario` — RoleIds.USER
- Uso: los endpoints protegidos usan `JwtAuthGuard` y `RolesGuard` (decorador `@Roles(...)`) para autorizar por rol.

**Arquitectura / Integraciones**
- Cloudinary
  - Responsable del almacenamiento de imágenes (subida y obtención de URLs).
  - Variables requeridas: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

- FatSecret
  - Servicio para obtener información nutricional (calorías por ingrediente). 
  - Flujo: el servicio obtiene un token OAuth2 (client credentials) y luego consulta los endpoints públicos de FatSecret para buscar alimentos y su informacion nutricional.
  - Variables requeridas: `FATSECRET_CLIENT_ID`, `FATSECRET_CLIENT_SECRET`.

Cómo obtener una cuenta / credenciales de FatSecret
1. Ir a la plataforma de desarrolladores de FatSecret: https://platform.fatsecret.com
2. Registrarse o iniciar sesión y crear una nueva aplicación/credencial de API.
3. Copiar el `client_id` y `client_secret` y pegarlos en las variables de entorno `FATSECRET_CLIENT_ID` y `FATSECRET_CLIENT_SECRET`.
4. Deben registrar su IP para que FATSECRET les permita consumir los endpoints.

**Variables de entorno**
- Hay un archivo de ejemplo en `.env.example`. Rellenar un archivo `.env` local con valores reales.
- Variables principales (ver [`.env.example`](.env.example)):
  - `FRONT` — URL del frontend (ej. http://localhost:3000)
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` — base de datos
  - `JWT_SECRET` — secreto para firmar JWT
  - `DB_SYNCHRONIZE` — activar/desactivar sincronización (boolean)
  - `BCRYPT_SALT_ROUNDS` — salt rounds para bcrypt
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary
  - `FATSECRET_CLIENT_ID`, `FATSECRET_CLIENT_SECRET` — FatSecret

**Cómo ejecutar la aplicación (desarrollo)**
1. Instalar dependencias:
```bash
   npm install
```
2. Crear un archivo `.env` basado en `.env.example` y rellenar las variables.
3. Ejecutar en modo desarrollo (esto crea las tablas automáticamente):
```bash
   npm run start:dev
```
4. Una vez que las tablas estén creadas, en otra terminal correr el seed para poblar los datos iniciales (ingredientes, tipos de comida, recetas y usuario admin):
```bash
   npm run seed
```
   El seed es idempotente: si ya hay datos en una tabla, la omite y no genera duplicados.

5. Usuario de prueba creado por el seed:
   - **Email:** admin@test.com
   - **Password:** password
   - **Rol:** Administrador

6. Tests:
```bash
   npm run test
```