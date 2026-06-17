function initDatos() {
    if (!localStorage.getItem('examenes')) {
        localStorage.setItem('examenes', JSON.stringify([
            {
                codigo: 'JS-101',
                titulo: 'Fundamentos de JavaScript',
                tiempo: 10,
                porcentaje: 70,
                descripcion: 'Evalua conceptos basicos de variables, funciones, arreglos y DOM.',
                preguntas: [
                    {
                        texto: '¿Cuál es el tipo de dato de "Hola Mundo"?',
                        respuestas: [
                            { texto: 'Number', correcta: false },
                            { texto: 'String', correcta: true },
                            { texto: 'Boolean', correcta: false }
                        ]
                    },
                    {
                        texto: '¿Qué hace el método push() en un arreglo?',
                        respuestas: [
                            { texto: 'Elimina el último elemento', correcta: false },
                            { texto: 'Agrega un elemento al final', correcta: true },
                            { texto: 'Ordena el arreglo', correcta: false }
                        ]
                    },
                    {
                        texto: '¿Cuál es la forma correcta de declarar una variable en JS moderno?',
                        respuestas: [
                            { texto: 'var nombre', correcta: false },
                            { texto: 'let nombre', correcta: true },
                            { texto: 'variable nombre', correcta: false }
                        ]
                    }
                ]
            }
        ]));
    }
}

function getExamenes() {
    return JSON.parse(localStorage.getItem('examenes') || '[]');
}

function setExamenes(examenes) {
    localStorage.setItem('examenes', JSON.stringify(examenes));
}

let preguntas = [];
let editandoCodigo = null;

function renderTabla() {
    const examenes = getExamenes();
    const tbody = document.getElementById('tablaExamenes');
    const contador = document.getElementById('contadorExamenes');

    contador.textContent = examenes.length + ' registros';

    if (examenes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#888">No hay exámenes registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = examenes.map(e => `
        <tr>
            <td>${e.codigo}</td>
            <td>
                <strong>${e.titulo}</strong><br>
                <small style="color:#888">${e.descripcion}</small>
            </td>
            <td>${e.tiempo} min</td>
            <td>${e.porcentaje}%</td>
            <td>${e.preguntas ? e.preguntas.length : 0}</td>
            <td>
                <button onclick="editarExamen('${e.codigo}')" style="color:#2563C4;border:none;background:none;cursor:pointer;font-size:13px;margin-right:8px;">Editar</button>
                <button onclick="eliminarExamen('${e.codigo}')" style="color:#DC2626;border:none;background:none;cursor:pointer;font-size:13px;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function renderPreguntas() {
    const contenedor = document.getElementById('contenedorPreguntas');

    if (preguntas.length === 0) {
        contenedor.innerHTML = '';
        return;
    }

    contenedor.innerHTML = preguntas.map((p, pi) => `
        <div style="background:#f8faff;border:1px solid #BFCFE8;border-radius:8px;padding:12px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>Pregunta ${pi + 1}</strong>
                <button onclick="eliminarPregunta(${pi})" style="color:#DC2626;border:none;background:none;cursor:pointer;font-size:12px;">Eliminar</button>
            </div>
            <input type="text" placeholder="Escribe la pregunta..."
                value="${p.texto}"
                oninput="preguntas[${pi}].texto = this.value"
                style="width:100%;padding:6px;border:1px solid #BFCFE8;border-radius:4px;margin-bottom:8px;font-size:13px;" />
            
            <div id="respuestas-${pi}">
                ${p.respuestas.map((r, ri) => `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <input type="radio" name="correcta-${pi}" ${r.correcta ? 'checked' : ''}
                            onchange="marcarCorrecta(${pi}, ${ri})" title="Correcta" />
                        <input type="text" placeholder="Respuesta ${ri + 1}"
                            value="${r.texto}"
                            oninput="preguntas[${pi}].respuestas[${ri}].texto = this.value"
                            style="flex:1;padding:5px;border:1px solid #BFCFE8;border-radius:4px;font-size:13px;" />
                        <button onclick="eliminarRespuesta(${pi}, ${ri})" style="color:#DC2626;border:none;background:none;cursor:pointer;">✕</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="agregarRespuesta(${pi})" style="font-size:12px;padding:4px 10px;border:1px solid #BFCFE8;border-radius:4px;background:#fff;cursor:pointer;margin-top:4px;">+ Agregar respuesta</button>
        </div>
    `).join('');
}

document.getElementById('btnAgregarPregunta').addEventListener('click', () => {
    preguntas.push({
        texto: '',
        respuestas: [
            { texto: '', correcta: false },
            { texto: '', correcta: false }
        ]
    });
    renderPreguntas();
});

function eliminarPregunta(pi) {
    preguntas.splice(pi, 1);
    renderPreguntas();
}

function agregarRespuesta(pi) {
    preguntas[pi].respuestas.push({ texto: '', correcta: false });
    renderPreguntas();
}

function eliminarRespuesta(pi, ri) {
    preguntas[pi].respuestas.splice(ri, 1);
    renderPreguntas();
}

function marcarCorrecta(pi, ri) {
    preguntas[pi].respuestas = preguntas[pi].respuestas.map((r, i) => ({
        ...r, correcta: i === ri
    }));
}

function guardarExamen() {
    const codigo      = document.getElementById('codigo').value.trim();
    const titulo      = document.getElementById('titulo').value.trim();
    const tiempo      = parseInt(document.getElementById('tiempo').value);
    const porcentaje  = parseInt(document.getElementById('porcentaje').value);
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!codigo || !titulo || !tiempo || !porcentaje) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }

    if (preguntas.length === 0) {
        alert('Agrega al menos una pregunta al examen.');
        return;
    }

    for (let i = 0; i < preguntas.length; i++) {
        if (!preguntas[i].texto) {
            alert(`La pregunta ${i + 1} no tiene texto.`);
            return;
        }
        if (!preguntas[i].respuestas.some(r => r.correcta)) {
            alert(`La pregunta ${i + 1} no tiene una respuesta correcta marcada.`);
            return;
        }
    }

    let examenes = getExamenes();
    const nuevoExamen = { codigo, titulo, tiempo, porcentaje, descripcion, preguntas };

    if (editandoCodigo) {
        examenes = examenes.map(e => e.codigo === editandoCodigo ? nuevoExamen : e);
        editandoCodigo = null;
        document.querySelector('.formulario h2').textContent = 'Crear examen';
    } else {
        if (examenes.find(e => e.codigo === codigo)) {
            alert('Ya existe un examen con ese código.');
            return;
        }
        examenes.push(nuevoExamen);
    }

    setExamenes(examenes);
    limpiarFormulario();
    renderTabla();
    alert('Examen guardado correctamente.');
}

function editarExamen(codigo) {
    const examenes = getExamenes();
    const examen = examenes.find(e => e.codigo === codigo);
    if (!examen) return;

    editandoCodigo = codigo;
    document.getElementById('codigo').value      = examen.codigo;
    document.getElementById('titulo').value      = examen.titulo;
    document.getElementById('tiempo').value      = examen.tiempo;
    document.getElementById('porcentaje').value  = examen.porcentaje;
    document.getElementById('descripcion').value = examen.descripcion;
    preguntas = JSON.parse(JSON.stringify(examen.preguntas));
    document.querySelector('.formulario h2').textContent = 'Editar examen';
    renderPreguntas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarExamen(codigo) {
    if (!confirm('¿Estás seguro de eliminar este examen?')) return;
    let examenes = getExamenes().filter(e => e.codigo !== codigo);
    setExamenes(examenes);
    renderTabla();
}

function limpiarFormulario() {
    document.getElementById('codigo').value      = '';
    document.getElementById('titulo').value      = '';
    document.getElementById('tiempo').value      = '';
    document.getElementById('porcentaje').value  = '';
    document.getElementById('descripcion').value = '';
    preguntas = [];
    editandoCodigo = null;
    renderPreguntas();
}

const preguntasSection = document.querySelector('.preguntas-section');
const btnGuardar = document.createElement('button');
btnGuardar.textContent = 'Guardar Examen';
btnGuardar.style.cssText = 'margin-top:15px;padding:8px 20px;background:#2563C4;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;width:100%;';
btnGuardar.addEventListener('click', guardarExamen);
preguntasSection.after(btnGuardar);

const btnLimpiar = document.createElement('button');
btnLimpiar.textContent = 'Limpiar formulario';
btnLimpiar.style.cssText = 'margin-top:8px;padding:6px 20px;background:transparent;color:#888;border:1px solid #BFCFE8;border-radius:6px;cursor:pointer;font-size:13px;width:100%;';
btnLimpiar.addEventListener('click', limpiarFormulario);
btnGuardar.after(btnLimpiar);

initDatos();
renderTabla();