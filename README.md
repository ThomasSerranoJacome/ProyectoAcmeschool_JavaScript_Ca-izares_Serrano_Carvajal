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

- **Juliana Cañizares** — Módulo de Resolución de Exámenes
- **Thomas Serrano** — Gestión de Exámenes + Gestión de Usuarios
- **Jose Carvajal** — Login + Auth

(1H) Registro de estudiantes.

Para Acme School se ha vuelto difícil saber exactamente quienes han hecho los exámenes, ya que al permitir al estudiante ingresar identificación y nombre, estos suelen variar los datos.



Se ha decidido agregar un módulo, donde los administrativos o docentes puedan gestionar estudiantes. Este módulo debe permitir crear, actualizar, eliminar y mostrar la información de estos. Los datos a gestionar son: identificación, nombre completo, email, género (opcional), fecha de nacimiento.



Adicionalmente, modifique el formulario que llena el estudiante al iniciar el examen para que pida solo el documento y verifique si existe como estudiante. De no existir, mostrar un mensaje al estudiante que no puede realizar el examen porque no está registrado.

Resultado esperado

El camper debe hacer uso de todo lo aprendido durante el skill. El uso de buenas prácticas es de vital importancia.



Este examen complementa al proyecto App para reservas de canchas deportivas, por lo cual, todo lo solicitado debe ser creado sobre este.



Se debe agregar al proyecto las modificaciones propuestas para lograr la gestión de estudiantes.



Recuerde cargar los cambios al proyecto en Github.