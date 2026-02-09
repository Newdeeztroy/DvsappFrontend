# Documentación Backend - Gestión de Módulos, Submódulos y Submenús

## Descripción General
Este documento detalla las funcionalidades necesarias para el backend que soporten el componente frontend `SubmoduleManagement.vue`.

## Estructura Jerárquica
- **Módulos** (nivel superior)
- **Submódulos** (asociados a módulos)
- **Submenús** (ítems de menú asociados a submódulos)

## Modelos de Datos Requeridos

### 1. Módulo
```php
// Tabla: modules
- id (int, primary, autoincrement)
- name (string, required)
- description (text, nullable)
- icon (string, nullable)
- active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. Submódulo
```php
// Tabla: submodules
- id (int, primary, autoincrement)
- name (string, required)
- module_id (int, foreign key to modules.id, required)
- description (text, nullable)
- icon (string, nullable)
- active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. Submenú (Ítem de Menú)
```php
// Tabla: menu_items (o submenu_items)
- id (int, primary, autoincrement)
- name (string, required)
- submodule_id (int, foreign key to submodules.id, required)
- route (string, nullable) - Ruta del menú
- icon (string, nullable)
- active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
```

## Rutas API Requeridas

### Módulos (`/modules`)
- `GET /modules` - Listar todos los módulos
- `POST /modules` - Crear un nuevo módulo
- `GET /modules/{id}` - Obtener un módulo específico
- `PUT /modules/{id}` - Actualizar un módulo
- `DELETE /modules/{id}` - Eliminar un módulo
- `PATCH /modules/{id}/status` - Cambiar estado activo/inactivo

### Submódulos (`/submodules`)
- `GET /submodules` - Listar todos los submódulos
- `POST /submodules` - Crear un nuevo submódulo
- `GET /submodules/{id}` - Obtener un submódulo específico
- `PUT /submodules/{id}` - Actualizar un submódulo
- `DELETE /submodules/{id}` - Eliminar un submódulo
- `PATCH /submodules/{id}/status` - Cambiar estado activo/inactivo

### Submenús (`/menu-items`)
- `GET /menu-items` - Listar todos los submenús
- `POST /menu-items` - Crear un nuevo submenú
- `GET /menu-items/{id}` - Obtener un submenú específico
- `PUT /menu-items/{id}` - Actualizar un submenú
- `DELETE /menu-items/{id}` - Eliminar un submenú
- `PATCH /menu-items/{id}/status` - Cambiar estado activo/inactivo

## Estructura de Respuestas API

### Listado (con o sin paginación)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Nombre del elemento",
      "description": "Descripción del elemento",
      "icon": "fa-solid fa-icon",
      "active": true,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### Elemento individual
```json
{
  "id": 1,
  "name": "Nombre del elemento",
  "description": "Descripción del elemento",
  "icon": "fa-solid fa-icon",
  "active": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Error de validación
```json
{
  "message": "Validation failed",
  "errors": {
    "field_name": ["Mensaje de error"]
  }
}
```

## Relaciones entre Modelos

### Módulo
- Tiene muchos submódulos (relación 1:N con submodules.module_id)

### Submódulo
- Pertenece a un módulo (relación N:1 con modules.id)
- Tiene muchos submenús (relación 1:N con menu_items.submodule_id)

### Submenú
- Pertenece a un submódulo (relación N:1 con submodules.id)

## Funcionalidades Específicas

### 1. Filtrado de Submódulos por Módulo
- El frontend filtra submódulos por `module_id`
- Endpoint: `GET /submodules` con posible parámetro de filtro

### 2. Filtrado de Submenús por Submódulo
- El frontend filtra submenús por `submodule_id`
- Endpoint: `GET /menu-items` con posible parámetro de filtro

### 3. Gestión de Estado
- Todos los modelos tienen campo `active` para soft-delete lógico
- Se utiliza `PATCH /{modelo}/{id}/status` con cuerpo `{ "active": boolean }`

## Consideraciones de Seguridad

- Todas las rutas deben estar protegidas con autenticación
- Se recomienda usar tokens JWT
- Headers requeridos: `Authorization: Bearer {token}`, `Content-Type: application/json`

## Validaciones Requeridas

### Módulo
- `name`: Requerido, único, máximo 255 caracteres
- `description`: Opcional, máximo 1000 caracteres
- `icon`: Opcional, máximo 100 caracteres
- `active`: Booleano, por defecto true

### Submódulo
- `name`: Requerido, máximo 255 caracteres
- `module_id`: Requerido, debe existir en tabla modules
- `description`: Opcional, máximo 1000 caracteres
- `icon`: Opcional, máximo 100 caracteres
- `active`: Booleano, por defecto true

### Submenú
- `name`: Requerido, máximo 255 caracteres
- `submodule_id`: Requerido, debe existir en tabla submodules
- `route`: Opcional, máximo 255 caracteres
- `icon`: Opcional, máximo 100 caracteres
- `active`: Booleano, por defecto true

## Ejemplos de Solicitudes

### Crear Submódulo
```
POST /submodules
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Nombre del Submódulo",
  "module_id": 1,
  "description": "Descripción del submódulo",
  "icon": "fa-solid fa-cube",
  "active": true
}
```

### Crear Submenú
```
POST /menu-items
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Nombre del Submenú",
  "submodule_id": 1,
  "route": "/ruta/del/submenu",
  "icon": "fa-solid fa-link",
  "active": true
}
```

### Cambiar estado
```
PATCH /submodules/1/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "active": false
}
```

## Observaciones Importantes

1. El frontend espera que las respuestas de listado puedan ser tanto un array directo como un objeto con propiedad `data` (para compatibilidad con paginación)
2. Las fechas deben estar en formato ISO 8601
3. Se recomienda implementar políticas de acceso para proteger las operaciones CRUD
4. Considerar índices en las columnas de relación (module_id, submodule_id) para mejor rendimiento