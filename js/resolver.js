// ==================== VARIABLES GLOBALES ====================
let examenes = [];
let examenActual = null;
let preguntaActual = 0;
let respuestas = {}; // Almacena { preguntaIndex: respuestaIndex }
let tiempoRestante = 0;
let timerInterval = null;
let examenIniciado = false;
let resultados = [];

// ==================== FUNCIONES DE ALMACENAMIENTO ====================
function getExamenes() {
    return JSON.parse(localStorage.getItem('examenes') || '[]');
}

function getResultados() {
    return JSON.parse(localStorage.getItem('resultadosExamenes') || '[]');
}

function guardarResultado(resultado) {
    resultados = getResultados();
    resultados.push(resultado);
    localStorage.setItem('resultadosExamenes', JSON.stringify(resultados));
}

// ==================== INICIALIZACIÓN ====================
function inicializar() {
    examenes = getExamenes();
    resultados = getResultados();
    
    if (examenes.length === 0) {
        console.log('No hay exámenes disponibles');
        return;
    }
    
    renderizarExamenes();
    configurarTabs();
}

// ==================== RENDERIZACIÓN DE EXÁMENES ====================
function renderizarExamenes() {
    const gridContainer = document.querySelector('.examen-grid');
    
    if (!gridContainer) return;
    
    // Limpiar grid
    gridContainer.innerHTML = '';
    
    examenes.forEach((examen, index) => {
        const card = document.createElement('div');
        card.className = 'examen-card';
        card.innerHTML = `
            <div class="card-badge">${examen.codigo}</div>
            <h3 class="card-title">${examen.titulo}</h3>
            <p class="card-description">${examen.descripcion}</p>
            
            <div class="card-stats">
                <div class="stat">
                    <span class="stat-label">Duración</span>
                    <span class="stat-value">${examen.tiempo} min</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Aprobatorio</span>
                    <span class="stat-value">${examen.porcentaje}%</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Preguntas</span>
                    <span class="stat-value">${examen.preguntas.length}</span>
                </div>
            </div>

            <button class="btn-presentar" onclick="iniciarExamen(${index})">Presentar</button>
        `;
        gridContainer.appendChild(card);
    });
}

// ==================== INICIAR EXAMEN ====================
function iniciarExamen(index) {
    if (index < 0 || index >= examenes.length) {
        alert('Examen no encontrado');
        return;
    }
    
    examenActual = examenes[index];
    preguntaActual = 0;
    respuestas = {};
    examenIniciado = true;
    tiempoRestante = examenActual.tiempo * 60; // Convertir a segundos
    
    // Cambiar vista
    document.getElementById('examenSelection').classList.add('hidden');
    document.getElementById('examenResolution').classList.remove('hidden');
    
    // Configurar título
    document.getElementById('examenTitle').textContent = examenActual.titulo;
    
    // Iniciar timer
    iniciarTimer();
    
    // Renderizar pregunta
    renderizarPregunta();
    renderizarNavegacion();
}

// ==================== TEMPORIZADOR ====================
function iniciarTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    actualizarDisplay();
    
    timerInterval = setInterval(() => {
        tiempoRestante--;
        actualizarDisplay();
        
        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            enviarExamen();
            alert('¡Se acabó el tiempo! El examen ha sido enviado.');
        }
    }, 1000);
}

function actualizarDisplay() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    const display = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    
    const timerElement = document.getElementById('timerDisplay');
    if (timerElement) {
        timerElement.textContent = display;
        
        // Cambiar color si quedan menos de 5 minutos
        if (tiempoRestante < 300) {
            timerElement.style.color = '#DC2626';
        } else {
            timerElement.style.color = 'inherit';
        }
    }
}

// ==================== RENDERIZAR PREGUNTA ====================
function renderizarPregunta() {
    if (!examenActual || preguntaActual >= examenActual.preguntas.length) return;
    
    const pregunta = examenActual.preguntas[preguntaActual];
    const container = document.getElementById('preguntaContent');
    
    let html = `
        <div class="pregunta-header">
            <h3>Pregunta ${preguntaActual + 1} de ${examenActual.preguntas.length}</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((preguntaActual + 1) / examenActual.preguntas.length) * 100}%"></div>
            </div>
        </div>
        
        <div class="pregunta-texto">
            <p>${pregunta.texto}</p>
        </div>
        
        <div class="respuestas-grupo">
    `;
    
    pregunta.respuestas.forEach((respuesta, index) => {
        const isSelected = respuestas[preguntaActual] === index;
        const radioId = `respuesta-${preguntaActual}-${index}`;
        
        html += `
            <div class="respuesta-item">
                <input 
                    type="radio" 
                    id="${radioId}" 
                    name="respuesta-${preguntaActual}" 
                    value="${index}"
                    ${isSelected ? 'checked' : ''}
                    onchange="guardarRespuesta(${preguntaActual}, ${index})"
                />
                <label for="${radioId}" class="respuesta-label">
                    <span class="respuesta-texto">${respuesta.texto}</span>
                </label>
            </div>
        `;
    });
    
    html += `</div>`;
    
    container.innerHTML = html;
    
    // Actualizar estado de botones
    actualizarBotones();
}

function guardarRespuesta(preguntaIndex, respuestaIndex) {
    respuestas[preguntaIndex] = respuestaIndex;
}

// ==================== NAVEGACIÓN ENTRE PREGUNTAS ====================
function preguntaAnterior() {
    if (preguntaActual > 0) {
        preguntaActual--;
        renderizarPregunta();
        renderizarNavegacion();
    }
}

function preguntaSiguiente() {
    if (preguntaActual < examenActual.preguntas.length - 1) {
        preguntaActual++;
        renderizarPregunta();
        renderizarNavegacion();
    }
}

function actualizarBotones() {
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnEnviar = document.getElementById('btnEnviar');
    
    if (btnAnterior) {
        btnAnterior.disabled = preguntaActual === 0;
    }
    
    if (btnSiguiente && btnEnviar) {
        if (preguntaActual === examenActual.preguntas.length - 1) {
            btnSiguiente.classList.add('hidden');
            btnEnviar.classList.remove('hidden');
        } else {
            btnSiguiente.classList.remove('hidden');
            btnEnviar.classList.add('hidden');
        }
    }
}

// ==================== NAVEGACIÓN VISUAL (SIDEBAR) ====================
function renderizarNavegacion() {
    const navContainer = document.getElementById('preguntasNav');
    
    if (!navContainer) return;
    
    navContainer.innerHTML = '';
    
    examenActual.preguntas.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'pregunta-nav-btn';
        
        if (index === preguntaActual) {
            btn.classList.add('active');
        }
        
        if (respuestas.hasOwnProperty(index)) {
            btn.classList.add('answered');
        }
        
        btn.textContent = `P${index + 1}`;
        btn.onclick = () => irAPregunta(index);
        
        navContainer.appendChild(btn);
    });
}

function irAPregunta(index) {
    preguntaActual = index;
    renderizarPregunta();
    renderizarNavegacion();
}

// ==================== ENVIAR EXAMEN ====================
function enviarExamen() {
    if (!examenActual) return;
    
    clearInterval(timerInterval);
    
    // Calcular puntuación
    let correctas = 0;
    examenActual.preguntas.forEach((pregunta, index) => {
        if (respuestas.hasOwnProperty(index)) {
            const respuestaSeleccionada = pregunta.respuestas[respuestas[index]];
            if (respuestaSeleccionada.correcta) {
                correctas++;
            }
        }
    });
    
    const porcentaje = (correctas / examenActual.preguntas.length) * 100;
    const aprobado = porcentaje >= examenActual.porcentaje;
    
    // Guardar resultado
    const resultado = {
        id: Date.now(),
        codigo: examenActual.codigo,
        titulo: examenActual.titulo,
        fecha: new Date().toLocaleString('es-CO'),
        correctas: correctas,
        total: examenActual.preguntas.length,
        porcentaje: Math.round(porcentaje),
        aprobado: aprobado,
        respuestas: respuestas
    };
    
    guardarResultado(resultado);
    
    // Mostrar resultado
    mostrarResultado(resultado);
}

function mostrarResultado(resultado) {
    const container = document.getElementById('examenResolution');
    
    const estados = resultado.aprobado ? 'aprobado' : 'desaprobado';
    const colorEstado = resultado.aprobado ? '#10B981' : '#DC2626';
    const iconoEstado = resultado.aprobado ? '✓' : '✗';
    
    container.innerHTML = `
        <div class="resultado-container">
            <div class="resultado-card">
                <div class="resultado-header" style="border-left: 4px solid ${colorEstado}">
                    <h2>Examen Completado</h2>
                    <p class="resultado-titulo">${resultado.titulo}</p>
                </div>
                
                <div class="resultado-estado">
                    <div class="estado-icono" style="color: ${colorEstado}; font-size: 48px; font-weight: bold;">
                        ${iconoEstado}
                    </div>
                    <div class="estado-texto">
                        <h3 style="color: ${colorEstado}">
                            ${resultado.aprobado ? '¡APROBADO!' : 'NO APROBADO'}
                        </h3>
                        <p>Necesitabas ${resultado.aprobado ? 'aprobar con' : 'al menos'} ${examenActual.porcentaje}%</p>
                    </div>
                </div>
                
                <div class="resultado-stats">
                    <div class="stat-box">
                        <div class="stat-numero" style="color: ${colorEstado}">
                            ${resultado.porcentaje}%
                        </div>
                        <div class="stat-label">Calificación</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-numero">${resultado.correctas}/${resultado.total}</div>
                        <div class="stat-label">Respuestas Correctas</div>
                    </div>
                    
                    <div class="stat-box">
                        <div class="stat-numero">${resultado.fecha}</div>
                        <div class="stat-label">Fecha</div>
                    </div>
                </div>
                
                <div class="resultado-botones">
                    <button class="btn-primary" onclick="volverASeleccion()">
                        ← Volver a exámenes
                    </button>
                    <button class="btn-secondary" onclick="verDetalleResultado(${resultado.id})">
                        Ver detalle
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== VOLVER A SELECCIÓN ====================
function volverASeleccion() {
    examenActual = null;
    preguntaActual = 0;
    respuestas = {};
    examenIniciado = false;
    
    if (timerInterval) clearInterval(timerInterval);
    
    document.getElementById('examenSelection').classList.remove('hidden');
    document.getElementById('examenResolution').classList.add('hidden');
}

// ==================== GESTIÓN DE TABS ====================
function configurarTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remover active de todos
            tabs.forEach(t => t.classList.remove('active'));
            // Agregar active al clickeado
            tab.classList.add('active');
            
            if (index === 0) {
                // Resolver examen
                mostrarVistaExamenes();
            } else if (index === 1) {
                // Mis resultados
                mostrarVistaResultados();
            }
        });
    });
}

function mostrarVistaExamenes() {
    document.getElementById('examenSelection').classList.remove('hidden');
    document.getElementById('examenResolution').classList.add('hidden');
}

function mostrarVistaResultados() {
    const mainContent = document.querySelector('.main-content');
    
    let html = `
        <section class="resultados-view">
            <div class="resultados-header">
                <h2>Mis Resultados</h2>
            </div>
            
            <div class="resultados-container">
    `;
    
    if (resultados.length === 0) {
        html += `
            <div class="empty-state">
                <p style="font-size: 48px; margin-bottom: 10px;">📋</p>
                <p style="color: #888;">No has completado ningún examen aún.</p>
            </div>
        `;
    } else {
        resultados.forEach((resultado) => {
            const colorEstado = resultado.aprobado ? '#10B981' : '#DC2626';
            const iconoEstado = resultado.aprobado ? '✓' : '✗';
            
            html += `
                <div class="resultado-item">
                    <div class="resultado-item-header">
                        <div>
                            <h4>${resultado.titulo}</h4>
                            <p style="font-size: 12px; color: #888;">${resultado.fecha}</p>
                        </div>
                        <div class="resultado-item-calificacion" style="color: ${colorEstado}; font-weight: bold; font-size: 18px;">
                            ${resultado.porcentaje}%
                        </div>
                    </div>
                    <div class="resultado-item-body">
                        <p>${resultado.correctas} de ${resultado.total} respuestas correctas</p>
                        <div style="color: ${colorEstado}; font-weight: bold; margin-top: 8px;">
                            ${iconoEstado} ${resultado.aprobado ? 'Aprobado' : 'No aprobado'}
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
            <button class="btn-secondary" onclick="limpiarResultados()" style="margin-top: 20px;">
                Limpiar historial
            </button>
        </section>
    `;
    
    mainContent.innerHTML = html;
    
    // Ocultar examen resolution
    const examenResolution = document.getElementById('examenResolution');
    if (examenResolution) {
        examenResolution.classList.add('hidden');
    }
}

function limpiarResultados() {
    if (confirm('¿Estás seguro de que deseas limpiar todo el historial de resultados?')) {
        localStorage.removeItem('resultadosExamenes');
        resultados = [];
        mostrarVistaResultados();
        alert('Historial limpiado correctamente.');
    }
}

function verDetalleResultado(id) {
    const resultado = resultados.find(r => r.id === id);
    if (!resultado) return;
    
    console.log('Detalle del resultado:', resultado);
    alert(`Detalle de ${resultado.titulo}:\n\nCalificación: ${resultado.porcentaje}%\nRespuestas correctas: ${resultado.correctas}/${resultado.total}\nFecha: ${resultado.fecha}`);
}

// ==================== ESTILOS DINÁMICOS ====================
function inyectarEstilos() {
    const estilo = document.createElement('style');
    estilo.textContent = `
        .hidden {
            display: none !important;
        }
        
        .pregunta-header {
            margin-bottom: 24px;
        }
        
        .pregunta-header h3 {
            margin: 0 0 12px 0;
            color: #333;
            font-size: 16px;
        }
        
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #E5E7EB;
            border-radius: 3px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: #2563C4;
            transition: width 0.3s ease;
        }
        
        .pregunta-texto {
            margin-bottom: 24px;
        }
        
        .pregunta-texto p {
            font-size: 16px;
            line-height: 1.6;
            color: #1F2937;
            margin: 0;
        }
        
        .respuestas-grupo {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .respuesta-item {
            display: flex;
            align-items: flex-start;
            padding: 12px;
            border: 2px solid #E5E7EB;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .respuesta-item:hover {
            border-color: #2563C4;
            background: #F0F4FF;
        }
        
        .respuesta-item input[type="radio"] {
            margin-right: 12px;
            margin-top: 2px;
            cursor: pointer;
            accent-color: #2563C4;
        }
        
        .respuesta-item input[type="radio"]:checked + .respuesta-label {
            color: #2563C4;
            font-weight: 500;
        }
        
        .respuesta-label {
            cursor: pointer;
            flex: 1;
        }
        
        .respuesta-texto {
            display: block;
            color: #333;
        }
        
        .pregunta-nav-btn {
            width: 40px;
            height: 40px;
            margin: 4px;
            padding: 0;
            border: 1px solid #BFCFE8;
            border-radius: 4px;
            background: #fff;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            color: #666;
            transition: all 0.2s ease;
        }
        
        .pregunta-nav-btn:hover {
            border-color: #2563C4;
            color: #2563C4;
        }
        
        .pregunta-nav-btn.active {
            background: #2563C4;
            color: #fff;
            border-color: #2563C4;
        }
        
        .pregunta-nav-btn.answered {
            background: #E0F2FE;
            color: #0369A1;
        }
        
        .pregunta-nav-btn.answered.active {
            background: #2563C4;
            color: #fff;
        }
        
        .navigation-buttons {
            display: flex;
            gap: 12px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #E5E7EB;
        }
        
        .btn-primary, .btn-secondary {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .btn-primary {
            background: #2563C4;
            color: white;
            flex: 1;
        }
        
        .btn-primary:hover:not(:disabled) {
            background: #1d4ca0;
        }
        
        .btn-primary:disabled {
            background: #BFCFE8;
            cursor: not-allowed;
        }
        
        .btn-secondary {
            background: transparent;
            color: #666;
            border: 1px solid #BFCFE8;
            flex: 1;
        }
        
        .btn-secondary:hover {
            border-color: #2563C4;
            color: #2563C4;
        }
        
        .resultado-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 600px;
            padding: 20px;
        }
        
        .resultado-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
        }
        
        .resultado-header {
            padding: 24px;
            background: #F9FAFB;
        }
        
        .resultado-header h2 {
            margin: 0 0 8px 0;
            color: #333;
        }
        
        .resultado-titulo {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        
        .resultado-estado {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 24px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .estado-icono {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #F3F4F6;
        }
        
        .estado-texto h3 {
            margin: 0;
            font-size: 20px;
        }
        
        .estado-texto p {
            margin: 4px 0 0 0;
            font-size: 14px;
            color: #666;
        }
        
        .resultado-stats {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            padding: 24px;
            background: #F9FAFB;
        }
        
        .stat-box {
            text-align: center;
        }
        
        .stat-numero {
            display: block;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .stat-label {
            display: block;
            font-size: 12px;
            color: #666;
        }
        
        .resultado-botones {
            display: flex;
            gap: 12px;
            padding: 24px;
        }
        
        .resultado-botones button {
            flex: 1;
        }
        
        .resultados-view {
            padding: 24px;
        }
        
        .resultados-header {
            margin-bottom: 24px;
        }
        
        .resultados-header h2 {
            margin: 0;
            color: #333;
        }
        
        .resultados-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }
        
        .resultado-item {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 16px;
            background: white;
            transition: all 0.2s ease;
        }
        
        .resultado-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .resultado-item-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
        }
        
        .resultado-item-header h4 {
            margin: 0 0 4px 0;
            color: #333;
            font-size: 15px;
        }
        
        .resultado-item-body {
            font-size: 14px;
            color: #666;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        @media (max-width: 768px) {
            .resolution-container {
                flex-direction: column;
            }
            
            .preguntas-sidebar {
                width: 100%;
                margin-bottom: 20px;
                border-right: none;
                border-bottom: 1px solid #E5E7EB;
                padding-bottom: 20px;
            }
            
            .pregunta-nav-btn {
                width: 36px;
                height: 36px;
                font-size: 11px;
            }
            
            .resultado-stats {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(estilo);
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    inyectarEstilos();
    inicializar();
});