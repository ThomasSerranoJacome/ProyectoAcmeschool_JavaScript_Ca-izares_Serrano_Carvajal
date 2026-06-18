function initUsuarios() {
    if (!localStorage.getItem('usuarios')) {
        localStorage.setItem('usuarios', JSON.stringify([
            {
                id: '100000001',
                nombre: 'Administrador Acme',
                email: 'admin@acme.edu',
                telefono: '3001234567',
                cargo: 'administrativo',
                password: 'Admin123'
            }
        ]));
    }
}

function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

function setUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

let editandoId = null;

function renderTablaUsuarios() {
    const usuarios = getUsuarios();
    const tbody    = document.getElementById('tablaExamenes'); // usa tu id existente
    const contador = document.getElementById('contadorUsuarios');

    contador.textContent = usuarios.length + ' registros';

    if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">No hay usuarios registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>
                ${u.id}<br>
                <small style="color:#888">${u.telefono}</small>
            </td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>
                <span style="background:#DBEAFE;color:#1B4F8A;padding:2px 8px;border-radius:99px;font-size:12px;font-weight:600;">
                    ${u.cargo.charAt(0).toUpperCase() + u.cargo.slice(1)}
                </span>
            </td>
            <td>
                <button onclick="editarUsuario('${u.id}')" style="color:#2563C4;border:none;background:none;cursor:pointer;font-size:13px;margin-right:8px;">Editar</button>
                <button onclick="eliminarUsuario('${u.id}')" style="color:#DC2626;border:none;background:none;cursor:pointer;font-size:13px;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('btnCrearUsuario').addEventListener('click', () => {
    const id       = document.getElementById('codigo').value.trim();
    const nombre   = document.getElementById('titulo').value.trim();
    const email    = document.getElementById('tiempo').value.trim();
    const telefono = document.getElementById('porcentaje').value.trim();
    const cargo    = document.getElementById('cargo').value;
    const password = document.querySelector('input[type="password"]').value.trim();

    if (!id || !nombre || !email || !telefono || !cargo) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }

    if (password && password.length < 8) {
    alert('La contraseña debe tener mínimo 8 caracteres.');
    return;
    }

    if (!editandoId && !password) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
    }

    let usuarios = getUsuarios();

    if (editandoId) {
        usuarios = usuarios.map(u => {
            if (u.id === editandoId) {
                return {
                    ...u,
                    id, nombre, email, telefono, cargo,
                    password: password || u.password
                };
            }
            return u;
        });
        editandoId = null;
        document.querySelector('.formulario-usuarios h2').textContent = 'Crear Usuario';
    } else {
        if (usuarios.find(u => u.id === id)) {
            alert('Ya existe un usuario con ese número de identificación.');
            return;
        }
        if (usuarios.find(u => u.email === email)) {
            alert('Ya existe un usuario con ese email.');
            return;
        }
        usuarios.push({ id, nombre, email, telefono, cargo, password });
    }

    setUsuarios(usuarios);
    limpiarFormularioUsuarios();
    renderTablaUsuarios();
    alert('Usuario guardado correctamente.');
});

function editarUsuario(id) {
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    editandoId = id;
    document.getElementById('codigo').value    = usuario.id;
    document.getElementById('titulo').value    = usuario.nombre;
    document.getElementById('tiempo').value    = usuario.email;
    document.getElementById('porcentaje').value = usuario.telefono;
    document.getElementById('cargo').value     = usuario.cargo;
    document.querySelector('input[type="password"]').value = '';
    document.querySelector('.formulario-usuarios h2').textContent = 'Editar Usuario';
    document.getElementById('btnCrearUsuario').querySelector('span').textContent = 'Guardar Cambios';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    const usuarios = getUsuarios().filter(u => u.id !== id);
    setUsuarios(usuarios);
    renderTablaUsuarios();
}

function limpiarFormularioUsuarios() {
    document.getElementById('codigo').value    = '';
    document.getElementById('titulo').value    = '';
    document.getElementById('tiempo').value    = '';
    document.getElementById('porcentaje').value = '';
    document.getElementById('cargo').value     = '';
    document.querySelector('input[type="password"]').value = '';
    editandoId = null;
    document.querySelector('.formulario-usuarios h2').textContent = 'Crear Usuario';
    document.getElementById('btnCrearUsuario').querySelector('span').textContent = 'Crear Usuario';
}

document.getElementById('btnAgregarPregunta-usuarios').addEventListener('click', limpiarFormularioUsuarios);

initUsuarios();
renderTablaUsuarios();