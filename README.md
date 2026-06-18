# Acme School — Plataforma de Exámenes

Plataforma web para la gestión y resolución de exámenes en línea, desarrollada con HTML5, CSS3 y JavaScript vanilla. Los datos se persisten utilizando `localStorage`.

---

## Módulos

| Módulo | Acceso | Descripción |
|---|---|---|
| Login | Público | Autenticación con email institucional y contraseña |
| Gestión de Usuarios | Privado | CRUD de usuarios (Administrativo / Docente) |
| Gestión de Exámenes | Privado | CRUD de exámenes con preguntas y respuestas |
| Resolución de Exámenes | Público | Lista, selección y resolución de exámenes con temporizador |

---

## Estructura del proyecto

```
ProyectoAcmeschool_JavaScript_Ca-izares_Serrano_Carvajal/
├── login.html              ← Punto de entrada / autenticación
├── usuarios.html           ← Gestión de usuarios (privado)
├── examenes.html           ← Gestión de exámenes (privado)
├── resolver.html           ← Resolución de exámenes (público)
├── auth.js                 ← Manejo de sesión y validación de login
├── login.js                ← Lógica del formulario de login (Web Component)
├── usuarios.js             ← CRUD de usuarios
├── examenes.js             ← CRUD de exámenes y preguntas
├── js/
│   └── resolver.js         ← Lógica de resolución, temporizador y resultados
├── css/
│   └── resolver.css        ← Estilos del módulo resolver
├── main.css                ← Variables globales y estilos base
├── login.css               ← Estilos del login
├── examenes.css            ← Estilos de gestión de exámenes
├── usuarios.css            ← Estilos de gestión de usuarios
├── responsive-examenes.css ← Responsive para exámenes
├── responsive-usuarios.css ← Responsive para usuarios
└── assets/
    └── Logo.png            ← Logo institucional
```

---

## Cómo usar

1. Clonar el repositorio
2. Abrir `login.html` en el navegador
3. Iniciar sesión con las credenciales de administrador:
   - **Email:** `admin@acme.edu`
   - **Contraseña:** `Admin123`
4. Desde el panel acceder a **Usuarios** o **Exámenes** para gestionar la información
5. Para resolver un examen abrir `resolver.html` directamente — no requiere autenticación

> No requiere instalación ni servidor. Funciona directamente en el navegador.

---

## Credenciales de prueba

| Email | Contraseña | Cargo |
|---|---|---|
| admin@acme.edu | Admin123 | Administrativo |

---

## Funcionalidades principales

- **Login** con validación de email institucional (bloquea Gmail, Hotmail, etc.)
- **Gestión de usuarios:** crear, editar y eliminar usuarios con rol Administrativo o Docente
- **Gestión de exámenes:** crear exámenes con código, título, tiempo, porcentaje de aprobación y preguntas con respuestas múltiples
- **Resolución de exámenes:** temporizador en tiempo real, selección de respuestas, cálculo automático de puntaje y mensaje de aprobación o reprobación
- **Protección de rutas:** los módulos privados redirigen al login si no hay sesión activa
- **Responsive:** adaptado para celular, tablet y PC

---

## Tecnologías

- HTML5
- CSS3
- JavaScript ES6+
- localStorage / sessionStorage
- Web Components (`customElements`)

---

## Autores

- **Cañizares** — Módulo de Resolución de Exámenes
- **Serrano** — Gestión de Exámenes + Gestión de Usuarios
- **Carvajal** — Login + Auth