/**
 * ============================================================
 *  ACME SCHOOL — Módulo de Funcionalidades Extendidas
 *  Archivo: acmeschool-features.js
 *
 *  INSTRUCCIONES DE USO:
 *  Incluir este script en cada página DESPUÉS de los scripts
 *  existentes:
 *    <script src="./acmeschool-features.js"></script>
 *
 *  Cada sección está claramente marcada con el módulo al que
 *  pertenece y cómo se activa.
 * ============================================================
 */

'use strict';

// ============================================================
// 0. UTILIDADES COMPARTIDAS
// ============================================================

const AcmeUtils = {
  /** Genera un ID único basado en timestamp + aleatorio */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  /** Formatea fecha a formato legible en español Colombia */
  formatDate(date = new Date()) {
    return date.toLocaleString('es-CO', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  },

  /** Muestra un toast (notificación flotante) en vez de alert() */
  toast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('acme-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'acme-toast-container';
      container.style.cssText = `
        position:fixed; bottom:24px; right:24px; z-index:9999;
        display:flex; flex-direction:column; gap:10px;
        max-width:340px;
      `;
      document.body.appendChild(container);
    }

    const colors = {
      success: '#10B981',
      error:   '#DC2626',
      warning: '#F59E0B',
      info:    '#2563C4',
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      background:#fff; border-left:4px solid ${colors[type] ?? colors.info};
      box-shadow:0 4px 16px rgba(0,0,0,.15); border-radius:6px;
      padding:12px 16px; font-size:14px; color:#333;
      display:flex; align-items:center; gap:10px;
      animation: acmeSlideIn .3s ease;
    `;
    toast.innerHTML = `<span style="font-size:18px">${
      { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' }[type] ?? 'ℹ️'
    }</span><span>${message}</span>`;

    container.appendChild(toast);

    if (!document.getElementById('acme-toast-style')) {
      const s = document.createElement('style');
      s.id = 'acme-toast-style';
      s.textContent = `@keyframes acmeSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}`;
      document.head.appendChild(s);
    }

    setTimeout(() => {
      toast.style.animation = 'acmeSlideIn .3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /** Muestra un modal de confirmación (reemplaza confirm()) */
  confirm(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10000;
      display:flex;align-items:center;justify-content:center;
    `;
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:10px;padding:28px 32px;max-width:380px;
        width:90%;box-shadow:0 8px 32px rgba(0,0,0,.2);text-align:center;">
        <p style="font-size:15px;color:#333;margin:0 0 24px">${message}</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button id="acme-confirm-ok" style="background:#2563C4;color:#fff;border:none;
            border-radius:6px;padding:8px 24px;cursor:pointer;font-weight:600">Confirmar</button>
          <button id="acme-confirm-cancel" style="background:#f3f4f6;color:#555;border:1px solid #ddd;
            border-radius:6px;padding:8px 24px;cursor:pointer">Cancelar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#acme-confirm-ok').onclick = () => { overlay.remove(); onConfirm?.(); };
    overlay.querySelector('#acme-confirm-cancel').onclick = () => { overlay.remove(); onCancel?.(); };
  },

  /** Inyecta un bloque <style> si aún no existe */
  addStyle(id, css) {
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  },

  /** Detecta la página actual por el nombre del archivo */
  currentPage() {
    return window.location.pathname.split('/').pop().toLowerCase();
  },
};


// ============================================================
// 1. BÚSQUEDA Y FILTRADO EN TIEMPO REAL
//    Aplica a: examenes.html, usuarios.html
//    Efecto: agrega una barra de búsqueda encima de cada tabla
// ============================================================

const AcmeSearch = {
  /** Inyecta barra de búsqueda encima de la tabla con id `tableBodyId` */
  inject(tableBodyId, counterId, placeholder) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;
    const wrapper = tableBody.closest('table')?.parentElement;
    if (!wrapper) return;

    const bar = document.createElement('div');
    bar.style.cssText = 'margin-bottom:12px;display:flex;gap:8px;align-items:center;';
    bar.innerHTML = `
      <input id="acme-search-${tableBodyId}" type="text"
        placeholder="${placeholder}"
        style="flex:1;padding:8px 12px;border:1px solid #BFCFE8;border-radius:6px;font-size:13px;" />
      <button id="acme-search-clear-${tableBodyId}"
        style="padding:7px 12px;border:1px solid #BFCFE8;border-radius:6px;background:#fff;
          cursor:pointer;color:#888;font-size:13px;display:none">✕ Limpiar</button>
    `;
    wrapper.insertBefore(bar, wrapper.querySelector('table'));

    const input = bar.querySelector(`#acme-search-${tableBodyId}`);
    const clearBtn = bar.querySelector(`#acme-search-clear-${tableBodyId}`);

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      clearBtn.style.display = q ? 'block' : 'none';
      const rows = tableBody.querySelectorAll('tr');
      let visible = 0;
      rows.forEach(row => {
        const match = row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      const counter = document.getElementById(counterId);
      if (counter) counter.textContent = `${visible} resultado(s)`;
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      tableBody.querySelectorAll('tr').forEach(r => r.style.display = '');
      const counter = document.getElementById(counterId);
      if (counter) {
        const total = tableBody.querySelectorAll('tr').length;
        counter.textContent = `${total} registros`;
      }
    });
  },

  init() {
    const page = AcmeUtils.currentPage();
    if (page === 'examenes.html') {
      // Esperar a que la tabla se renderice
      setTimeout(() =>
        this.inject('tablaExamenes', 'contadorExamenes', '🔍 Buscar examen por código, título...'), 400);
    }
    if (page === 'usuarios.html') {
      setTimeout(() =>
        this.inject('tablaExamenes', 'contadorUsuarios', '🔍 Buscar usuario por nombre, email...'), 400);
    }
  },
};


// ============================================================
// 2. ORDENAMIENTO DE COLUMNAS EN TABLAS
//    Aplica a: examenes.html, usuarios.html
//    Efecto: hace clic en el encabezado de columna para ordenar
// ============================================================

const AcmeSortable = {
  sortState: { col: -1, asc: true },

  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html', 'usuarios.html'].includes(page)) return;

    setTimeout(() => {
      const table = document.querySelector('table');
      if (!table) return;
      const headers = table.querySelectorAll('thead th');
      headers.forEach((th, i) => {
        th.style.cursor = 'pointer';
        th.title = 'Clic para ordenar';
        th.addEventListener('click', () => this._sort(table, i));
      });
    }, 500);
  },

  _sort(table, colIndex) {
    const asc = this.sortState.col === colIndex ? !this.sortState.asc : true;
    this.sortState = { col: colIndex, asc };

    const tbody = table.querySelector('tbody');
    const rows  = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
      const ta = a.cells[colIndex]?.textContent.trim().toLowerCase() ?? '';
      const tb = b.cells[colIndex]?.textContent.trim().toLowerCase() ?? '';
      const na = parseFloat(ta), nb = parseFloat(tb);
      if (!isNaN(na) && !isNaN(nb)) return asc ? na - nb : nb - na;
      return asc ? ta.localeCompare(tb) : tb.localeCompare(ta);
    });

    rows.forEach(r => tbody.appendChild(r));

    // Indicador visual en encabezado
    table.querySelectorAll('thead th').forEach((th, i) => {
      th.textContent = th.textContent.replace(/ [▲▼]$/, '');
      if (i === colIndex) th.textContent += asc ? ' ▲' : ' ▼';
    });
  },
};


// ============================================================
// 3. EXPORTAR TABLA A CSV
//    Aplica a: examenes.html, usuarios.html
//    Efecto: botón "Exportar CSV" en la cabecera de la tabla
// ============================================================

const AcmeExportCSV = {
  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html', 'usuarios.html'].includes(page)) return;

    setTimeout(() => {
      const tableHeader = document.querySelector('.tabla-header, .tabla-header-usuarios');
      if (!tableHeader) return;

      const btn = document.createElement('button');
      btn.textContent = '⬇ Exportar CSV';
      btn.style.cssText = `
        padding:6px 14px;background:#fff;border:1px solid #BFCFE8;border-radius:6px;
        cursor:pointer;font-size:13px;color:#2563C4;font-weight:600;
      `;
      btn.addEventListener('click', () => this._export());
      tableHeader.appendChild(btn);
    }, 500);
  },

  _export() {
    const table = document.querySelector('table');
    if (!table) return;

    const rows = [];
    table.querySelectorAll('tr').forEach(row => {
      // Omitir filas de acciones (última columna con botones)
      const cells = Array.from(row.querySelectorAll('th, td')).slice(0, -1);
      rows.push(cells.map(c => `"${c.textContent.trim().replace(/"/g, '""')}"`).join(','));
    });

    const csv = '\uFEFF' + rows.join('\n'); // BOM para Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `acme-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    AcmeUtils.toast('Archivo CSV descargado', 'success');
  },
};


// ============================================================
// 4. PAGINACIÓN DE TABLAS
//    Aplica a: examenes.html, usuarios.html
//    Efecto: divide la tabla en páginas de N filas
// ============================================================

const AcmePagination = {
  pageSize: 5,
  currentPage: 1,

  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html', 'usuarios.html'].includes(page)) return;

    // Observar cambios en la tabla para re-paginar
    setTimeout(() => {
      const tbody = document.getElementById('tablaExamenes');
      if (!tbody) return;

      const observer = new MutationObserver(() => this._paginate());
      observer.observe(tbody, { childList: true });
      this._paginate();
    }, 600);
  },

  _paginate() {
    const tbody = document.getElementById('tablaExamenes');
    if (!tbody) return;

    const allRows = Array.from(tbody.querySelectorAll('tr'));
    const visibleRows = allRows.filter(r => r.style.display !== 'none');
    const totalPages = Math.max(1, Math.ceil(visibleRows.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, totalPages);

    // Mostrar/ocultar filas según página
    allRows.forEach(r => r.dataset.paginationHidden = 'false');
    visibleRows.forEach((r, i) => {
      const inPage = i >= (this.currentPage - 1) * this.pageSize &&
                     i <  this.currentPage * this.pageSize;
      r.dataset.paginationHidden = inPage ? 'false' : 'true';
      r.style.display = inPage ? '' : 'none';
    });

    // Render controles
    this._renderControls(totalPages);
  },

  _renderControls(totalPages) {
    let ctrl = document.getElementById('acme-pagination');
    if (!ctrl) {
      ctrl = document.createElement('div');
      ctrl.id = 'acme-pagination';
      ctrl.style.cssText = `
        display:flex;align-items:center;gap:8px;margin-top:12px;
        font-size:13px;color:#555;justify-content:flex-end;flex-wrap:wrap;
      `;
      const wrapper = document.getElementById('tablaExamenes')?.closest('.tabla-container, .tabla-container-usuarios');
      wrapper?.appendChild(ctrl);
    }

    ctrl.innerHTML = `
      <span>Página ${this.currentPage} de ${totalPages}</span>
      <button id="acme-pg-prev" ${this.currentPage === 1 ? 'disabled' : ''}
        style="padding:4px 10px;border:1px solid #BFCFE8;border-radius:4px;
          cursor:pointer;background:#fff;${this.currentPage===1?'opacity:.4':''}">‹ Anterior</button>
      <button id="acme-pg-next" ${this.currentPage === totalPages ? 'disabled' : ''}
        style="padding:4px 10px;border:1px solid #BFCFE8;border-radius:4px;
          cursor:pointer;background:#fff;${this.currentPage===totalPages?'opacity:.4':''}">Siguiente ›</button>
      <select id="acme-pg-size" style="padding:4px 6px;border:1px solid #BFCFE8;border-radius:4px;font-size:12px;">
        ${[5,10,20].map(n => `<option value="${n}" ${n===this.pageSize?'selected':''}>${n} por página</option>`).join('')}
      </select>
    `;

    ctrl.querySelector('#acme-pg-prev').onclick = () => { this.currentPage--; this._paginate(); };
    ctrl.querySelector('#acme-pg-next').onclick = () => { this.currentPage++; this._paginate(); };
    ctrl.querySelector('#acme-pg-size').onchange = e => {
      this.pageSize = Number(e.target.value);
      this.currentPage = 1;
      this._paginate();
    };
  },
};


// ============================================================
// 5. TEMA OSCURO / CLARO (DARK MODE TOGGLE)
//    Aplica a: TODAS las páginas
//    Efecto: botón de luna/sol en el encabezado
// ============================================================

const AcmeDarkMode = {
  KEY: 'acme_dark_mode',

  init() {
    const isDark = localStorage.getItem(this.KEY) === 'true';
    if (isDark) this._apply(true);

    // Insertar botón en el header
    const header = document.querySelector('.header-div');
    if (!header) return;

    const btn = document.createElement('button');
    btn.id = 'acme-dark-toggle';
    btn.title = 'Cambiar tema';
    btn.style.cssText = `
      background:none;border:1px solid rgba(255,255,255,.4);color:inherit;
      border-radius:20px;padding:4px 10px;cursor:pointer;font-size:16px;
    `;
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.addEventListener('click', () => this._toggle());
    header.appendChild(btn);
  },

  _toggle() {
    const current = localStorage.getItem(this.KEY) === 'true';
    this._apply(!current);
    localStorage.setItem(this.KEY, String(!current));
    const btn = document.getElementById('acme-dark-toggle');
    if (btn) btn.textContent = !current ? '☀️' : '🌙';
  },

  _apply(dark) {
    AcmeUtils.addStyle('acme-dark-style', `
      body.acme-dark {
        filter: invert(1) hue-rotate(180deg);
      }
      body.acme-dark img,
      body.acme-dark video,
      body.acme-dark .logo {
        filter: invert(1) hue-rotate(180deg);
      }
    `);
    document.body.classList.toggle('acme-dark', dark);
  },
};


// ============================================================
// 6. INDICADOR DE PROGRESO DE FORMULARIO
//    Aplica a: examenes.html, usuarios.html
//    Efecto: barra de progreso que avanza al completar campos
// ============================================================

const AcmeFormProgress = {
  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html', 'usuarios.html'].includes(page)) return;

    setTimeout(() => {
      const form = document.querySelector('.formulario, .formulario-usuarios');
      if (!form) return;

      const bar = document.createElement('div');
      bar.style.cssText = 'margin-bottom:10px;';
      bar.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:4px;">
          <span>Progreso del formulario</span>
          <span id="acme-progress-pct">0%</span>
        </div>
        <div style="height:6px;background:#E5E7EB;border-radius:3px;overflow:hidden;">
          <div id="acme-progress-bar"
            style="height:100%;background:#2563C4;border-radius:3px;width:0;transition:width .3s;"></div>
        </div>
      `;
      form.insertBefore(bar, form.firstChild);

      const fields = form.querySelectorAll('input, textarea, select');
      const update = () => {
        const filled = Array.from(fields).filter(f => f.value.trim() !== '').length;
        const pct = Math.round((filled / fields.length) * 100);
        document.getElementById('acme-progress-bar').style.width = pct + '%';
        document.getElementById('acme-progress-pct').textContent = pct + '%';
        document.getElementById('acme-progress-bar').style.background =
          pct === 100 ? '#10B981' : '#2563C4';
      };
      fields.forEach(f => f.addEventListener('input', update));
      fields.forEach(f => f.addEventListener('change', update));
    }, 400);
  },
};


// ============================================================
// 7. AUTOGUARDADO DE FORMULARIO (BORRADOR EN LOCALSTORAGE)
//    Aplica a: examenes.html, usuarios.html
//    Efecto: guarda el borrador cada 5 seg y lo restaura al volver
// ============================================================

const AcmeAutosave = {
  KEY_PREFIX: 'acme_draft_',
  interval: null,

  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html', 'usuarios.html'].includes(page)) return;

    setTimeout(() => {
      const form = document.querySelector('.formulario, .formulario-usuarios');
      if (!form) return;

      // Cargar borrador existente
      this._restore(page);

      // Guardar cada 5 segundos mientras el usuario escribe
      this.interval = setInterval(() => this._save(page, form), 5000);

      // Indicador visual
      const ind = document.createElement('p');
      ind.id = 'acme-autosave-ind';
      ind.style.cssText = 'font-size:11px;color:#aaa;text-align:right;margin:0;';
      ind.textContent = '';
      form.appendChild(ind);

      // Botón limpiar borrador
      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'Descartar borrador';
      clearBtn.style.cssText = `
        font-size:11px;color:#DC2626;background:none;border:none;cursor:pointer;
        padding:0;margin-top:4px;display:block;
      `;
      clearBtn.addEventListener('click', () => {
        localStorage.removeItem(this.KEY_PREFIX + page);
        form.querySelectorAll('input, textarea, select').forEach(f => f.value = '');
        AcmeUtils.toast('Borrador descartado', 'info');
      });
      form.appendChild(clearBtn);
    }, 450);
  },

  _save(page, form) {
    const data = {};
    form.querySelectorAll('input:not([type=password]), textarea, select').forEach(f => {
      if (f.id) data[f.id] = f.value;
    });
    localStorage.setItem(this.KEY_PREFIX + page, JSON.stringify(data));
    const ind = document.getElementById('acme-autosave-ind');
    if (ind) ind.textContent = `💾 Borrador guardado: ${new Date().toLocaleTimeString('es-CO')}`;
  },

  _restore(page) {
    const raw = localStorage.getItem(this.KEY_PREFIX + page);
    if (!raw) return;
    const data = JSON.parse(raw);
    setTimeout(() => {
      Object.entries(data).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el && !el.value) el.value = val;
      });
      AcmeUtils.toast('Borrador restaurado del formulario', 'info', 3000);
    }, 600);
  },
};


// ============================================================
// 8. HISTORIAL DE ACTIVIDAD (LOG DE ACCIONES)
//    Aplica a: TODAS las páginas (admin)
//    Efecto: registra cada acción CRUD en localStorage y las
//            muestra como panel deslizante con botón en header
// ============================================================

const AcmeActivityLog = {
  KEY: 'acme_activity_log',
  MAX: 50,

  /** Llama este método desde cualquier módulo para registrar acciones */
  record(action, detail = '') {
    const logs = this._load();
    logs.unshift({
      id: AcmeUtils.uid(),
      action,
      detail,
      time: AcmeUtils.formatDate(),
      page: AcmeUtils.currentPage(),
    });
    localStorage.setItem(this.KEY, JSON.stringify(logs.slice(0, this.MAX)));
  },

  _load() {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  },

  init() {
    const page = AcmeUtils.currentPage();
    if (['login.html', 'resolver.html'].includes(page)) return;

    const header = document.querySelector('.header-div');
    if (!header) return;

    const btn = document.createElement('button');
    btn.textContent = '📋 Actividad';
    btn.style.cssText = `
      background:none;border:1px solid rgba(255,255,255,.4);color:inherit;
      border-radius:6px;padding:4px 10px;cursor:pointer;font-size:13px;
    `;
    btn.addEventListener('click', () => this._showPanel());
    header.appendChild(btn);
  },

  _showPanel() {
    const existing = document.getElementById('acme-log-panel');
    if (existing) { existing.remove(); return; }

    const logs = this._load();
    const panel = document.createElement('div');
    panel.id = 'acme-log-panel';
    panel.style.cssText = `
      position:fixed;top:0;right:0;bottom:0;width:340px;background:#fff;
      box-shadow:-4px 0 20px rgba(0,0,0,.15);z-index:9000;overflow-y:auto;
      padding:20px;font-size:13px;
    `;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0">📋 Historial de actividad</h3>
        <button onclick="document.getElementById('acme-log-panel').remove()"
          style="background:none;border:none;cursor:pointer;font-size:18px;color:#888">✕</button>
      </div>
      ${logs.length === 0
        ? '<p style="color:#aaa;text-align:center;margin-top:40px">Sin actividad registrada</p>'
        : logs.map(l => `
          <div style="border-bottom:1px solid #f0f0f0;padding:10px 0;">
            <div style="font-weight:600;color:#333">${l.action}</div>
            <div style="color:#666;margin:2px 0">${l.detail}</div>
            <div style="font-size:11px;color:#aaa">${l.time} · ${l.page}</div>
          </div>
        `).join('')}
      ${logs.length > 0 ? `
        <button onclick="localStorage.removeItem('acme_activity_log');
          document.getElementById('acme-log-panel').remove();
          AcmeUtils.toast('Historial limpiado','info');"
          style="margin-top:16px;width:100%;padding:8px;background:#f3f4f6;border:1px solid #ddd;
            border-radius:6px;cursor:pointer;color:#888;font-size:12px;">
          🗑 Limpiar historial
        </button>` : ''}
    `;
    document.body.appendChild(panel);
  },
};


// ============================================================
// 9. VALIDACIÓN DE FORMULARIO MEJORADA (USUARIOS)
//    Aplica a: usuarios.html
//    Efecto: valida email institucional, teléfono colombiano y
//            fortaleza de contraseña en tiempo real
// ============================================================

const AcmeFormValidation = {
  FREE_DOMAINS: [
    'gmail.com','yahoo.com','hotmail.com','outlook.com',
    'live.com','icloud.com','aol.com','protonmail.com',
  ],

  init() {
    if (AcmeUtils.currentPage() !== 'usuarios.html') return;
    setTimeout(() => {
      this._attachEmailValidator();
      this._attachPhoneValidator();
      this._attachPasswordStrength();
    }, 400);
  },

  _attachEmailValidator() {
    const emailField = document.getElementById('tiempo'); // campo email en usuarios
    if (!emailField) return;
    const msg = this._createMessage(emailField);
    emailField.addEventListener('blur', () => {
      const val = emailField.value.trim().toLowerCase();
      if (!val) { msg.textContent = ''; return; }
      const domain = val.split('@')[1];
      if (!val.includes('@') || !domain) {
        this._error(msg, emailField, '⚠ Formato de email inválido');
      } else if (this.FREE_DOMAINS.includes(domain)) {
        this._error(msg, emailField, '⚠ Solo correos institucionales (no Gmail, Hotmail...)');
      } else if (!domain.includes('.')) {
        this._error(msg, emailField, '⚠ El dominio no es válido');
      } else {
        this._ok(msg, emailField, '✔ Email institucional válido');
      }
    });
  },

  _attachPhoneValidator() {
    const phoneField = document.getElementById('porcentaje'); // campo teléfono
    if (!phoneField) return;
    const msg = this._createMessage(phoneField);
    phoneField.addEventListener('input', () => {
      const val = phoneField.value.trim().replace(/\s/g,'');
      if (!val) { msg.textContent = ''; return; }
      if (!/^3\d{9}$/.test(val)) {
        this._error(msg, phoneField, '⚠ Ingresa un celular colombiano válido (10 dígitos, empieza en 3)');
      } else {
        this._ok(msg, phoneField, '✔ Número válido');
      }
    });
  },

  _attachPasswordStrength() {
    const passField = document.querySelector('input[type="password"]');
    if (!passField) return;

    const wrapper = passField.parentElement;
    const meter = document.createElement('div');
    meter.style.cssText = 'margin-top:6px;';
    meter.innerHTML = `
      <div style="height:4px;background:#E5E7EB;border-radius:2px;overflow:hidden;margin-bottom:4px;">
        <div id="acme-pass-bar" style="height:100%;width:0;border-radius:2px;transition:all .3s;"></div>
      </div>
      <span id="acme-pass-label" style="font-size:11px;color:#888;"></span>
    `;
    wrapper.appendChild(meter);

    // Mostrar/ocultar contraseña
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = '👁';
    toggle.title = 'Mostrar/ocultar contraseña';
    toggle.style.cssText = `
      position:absolute;right:8px;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;font-size:14px;
    `;
    wrapper.style.position = 'relative';
    wrapper.appendChild(toggle);
    toggle.addEventListener('click', () => {
      passField.type = passField.type === 'password' ? 'text' : 'password';
      toggle.textContent = passField.type === 'password' ? '👁' : '🙈';
    });

    passField.addEventListener('input', () => {
      const v = passField.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;

      const levels = [
        { w:'0%',   c:'#E5E7EB', l:'' },
        { w:'25%',  c:'#DC2626', l:'Muy débil' },
        { w:'50%',  c:'#F59E0B', l:'Débil' },
        { w:'75%',  c:'#2563C4', l:'Moderada' },
        { w:'100%', c:'#10B981', l:'Fuerte' },
      ];
      const lvl = levels[score];
      document.getElementById('acme-pass-bar').style.width = lvl.w;
      document.getElementById('acme-pass-bar').style.background = lvl.c;
      document.getElementById('acme-pass-label').textContent = lvl.l;
    });
  },

  _createMessage(field) {
    const msg = document.createElement('small');
    msg.style.cssText = 'display:block;font-size:11px;margin-top:3px;';
    field.parentElement.appendChild(msg);
    return msg;
  },

  _error(msg, field, text) {
    msg.style.color = '#DC2626';
    msg.textContent = text;
    field.style.borderColor = '#DC2626';
  },

  _ok(msg, field, text) {
    msg.style.color = '#10B981';
    msg.textContent = text;
    field.style.borderColor = '#10B981';
  },
};


// ============================================================
// 10. ESTADÍSTICAS DEL PANEL (DASHBOARD WIDGET)
//     Aplica a: examenes.html
//     Efecto: muestra tarjetas de stats arriba de la sección
// ============================================================

const AcmeStats = {
  init() {
    if (AcmeUtils.currentPage() !== 'examenes.html') return;
    setTimeout(() => this._render(), 500);

    // Re-renderizar cuando la tabla cambie
    const obs = new MutationObserver(() => this._render());
    const tbody = document.getElementById('tablaExamenes');
    if (tbody) obs.observe(tbody, { childList: true });
  },

  _render() {
    const examenes = JSON.parse(localStorage.getItem('examenes') || '[]');
    const totalPreguntas = examenes.reduce((s, e) => s + (e.preguntas?.length ?? 0), 0);
    const avgTiempo = examenes.length
      ? Math.round(examenes.reduce((s, e) => s + e.tiempo, 0) / examenes.length)
      : 0;
    const avgAprobacion = examenes.length
      ? Math.round(examenes.reduce((s, e) => s + e.porcentaje, 0) / examenes.length)
      : 0;

    let widget = document.getElementById('acme-stats-widget');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'acme-stats-widget';
      widget.style.cssText = `
        display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;
      `;
      const section = document.querySelector('.examenes-section');
      section?.parentElement?.insertBefore(widget, section);
    }

    widget.innerHTML = [
      { label: 'Exámenes', value: examenes.length, icon: '📝' },
      { label: 'Preguntas totales', value: totalPreguntas, icon: '❓' },
      { label: 'Tiempo promedio', value: `${avgTiempo} min`, icon: '⏱' },
      { label: 'Aprobación prom.', value: `${avgAprobacion}%`, icon: '🎯' },
    ].map(s => `
      <div style="flex:1;min-width:120px;background:#fff;border:1px solid #E5E7EB;
        border-radius:8px;padding:14px 16px;text-align:center;">
        <div style="font-size:22px;margin-bottom:4px">${s.icon}</div>
        <div style="font-size:22px;font-weight:700;color:#2563C4">${s.value}</div>
        <div style="font-size:12px;color:#888;margin-top:2px">${s.label}</div>
      </div>
    `).join('');
  },
};


// ============================================================
// 11. VISTA PREVIA DEL EXAMEN (MODAL)
//     Aplica a: examenes.html
//     Efecto: botón "Previsualizar" en cada fila de la tabla
// ============================================================

const AcmePreview = {
  init() {
    if (AcmeUtils.currentPage() !== 'examenes.html') return;

    // Patch de renderTabla para agregar botón previsualizar
    const observer = new MutationObserver(() => this._addButtons());
    const tbody = document.getElementById('tablaExamenes');
    if (tbody) observer.observe(tbody, { childList: true });
    setTimeout(() => this._addButtons(), 600);
  },

  _addButtons() {
    const examenes = JSON.parse(localStorage.getItem('examenes') || '[]');
    const rows = document.querySelectorAll('#tablaExamenes tr');
    rows.forEach(row => {
      if (row.querySelector('.acme-preview-btn')) return;
      const codigoCell = row.cells?.[0];
      if (!codigoCell) return;
      const codigo = codigoCell.textContent.trim();
      const examen = examenes.find(e => e.codigo === codigo);
      if (!examen) return;
      const actionsCell = row.cells[row.cells.length - 1];
      const btn = document.createElement('button');
      btn.className = 'acme-preview-btn';
      btn.textContent = 'Vista previa';
      btn.style.cssText = `
        color:#10B981;border:none;background:none;cursor:pointer;
        font-size:13px;margin-right:6px;
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._showModal(examen);
      });
      actionsCell.insertBefore(btn, actionsCell.firstChild);
    });
  },

  _showModal(examen) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;
      display:flex;align-items:center;justify-content:center;padding:20px;
    `;
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:10px;max-width:600px;width:100%;
        max-height:80vh;overflow-y:auto;padding:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <span style="background:#DBEAFE;color:#1B4F8A;padding:2px 8px;
              border-radius:99px;font-size:12px;font-weight:600;">${examen.codigo}</span>
            <h2 style="margin:8px 0 0">${examen.titulo}</h2>
          </div>
          <button onclick="this.closest('.acme-overlay').remove()"
            style="background:none;border:none;cursor:pointer;font-size:20px;color:#888">✕</button>
        </div>
        <p style="color:#666;margin-bottom:16px;">${examen.descripcion || ''}</p>
        <div style="display:flex;gap:20px;margin-bottom:20px;font-size:13px;color:#555;">
          <span>⏱ ${examen.tiempo} min</span>
          <span>🎯 Aprobación: ${examen.porcentaje}%</span>
          <span>❓ ${examen.preguntas.length} preguntas</span>
        </div>
        ${examen.preguntas.map((p, i) => `
          <div style="border:1px solid #E5E7EB;border-radius:8px;padding:14px;margin-bottom:12px;">
            <p style="font-weight:600;margin:0 0 10px"><span style="color:#2563C4">${i+1}.</span> ${p.texto}</p>
            ${p.respuestas.map((r, ri) => `
              <div style="padding:6px 10px;border-radius:4px;margin-bottom:6px;font-size:13px;
                background:${r.correcta ? '#D1FAE5' : '#F9FAFB'};
                color:${r.correcta ? '#065F46' : '#555'};
                border:1px solid ${r.correcta ? '#6EE7B7' : '#E5E7EB'};">
                ${r.correcta ? '✔' : String.fromCharCode(65+ri) + ')'} ${r.texto}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;
    overlay.classList.add('acme-overlay');
    overlay.querySelector('button').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  },
};


// ============================================================
// 12. DUPLICAR EXAMEN
//     Aplica a: examenes.html
//     Efecto: botón "Duplicar" en cada fila, crea una copia con
//             código nuevo y sufijo "-COPIA"
// ============================================================

const AcmeDuplicate = {
  init() {
    if (AcmeUtils.currentPage() !== 'examenes.html') return;
    const tbody = document.getElementById('tablaExamenes');
    if (!tbody) return;
    const obs = new MutationObserver(() => this._addButtons());
    obs.observe(tbody, { childList: true });
    setTimeout(() => this._addButtons(), 700);
  },

  _addButtons() {
    const examenes = JSON.parse(localStorage.getItem('examenes') || '[]');
    document.querySelectorAll('#tablaExamenes tr').forEach(row => {
      if (row.querySelector('.acme-dup-btn')) return;
      const codigo = row.cells?.[0]?.textContent.trim();
      const examen = examenes.find(e => e.codigo === codigo);
      if (!examen) return;
      const actionsCell = row.cells[row.cells.length - 1];
      const btn = document.createElement('button');
      btn.className = 'acme-dup-btn';
      btn.textContent = 'Duplicar';
      btn.style.cssText = `color:#F59E0B;border:none;background:none;cursor:pointer;font-size:13px;margin-right:6px;`;
      btn.addEventListener('click', () => this._duplicate(examen));
      actionsCell.insertBefore(btn, actionsCell.firstChild);
    });
  },

  _duplicate(examen) {
    const examenes = JSON.parse(localStorage.getItem('examenes') || '[]');
    const newCodigo = examen.codigo + '-COPIA';
    if (examenes.find(e => e.codigo === newCodigo)) {
      AcmeUtils.toast('Ya existe una copia de este examen', 'warning'); return;
    }
    const copia = { ...JSON.parse(JSON.stringify(examen)), codigo: newCodigo, titulo: examen.titulo + ' (Copia)' };
    examenes.push(copia);
    localStorage.setItem('examenes', JSON.stringify(examenes));
    AcmeUtils.toast(`Examen duplicado como "${newCodigo}"`, 'success');
    AcmeActivityLog.record('Examen duplicado', `${examen.codigo} → ${newCodigo}`);
    // Re-renderizar tabla si la función global existe
    if (typeof renderTabla === 'function') renderTabla();
  },
};


// ============================================================
// 13. IMPORTAR EXAMEN DESDE JSON
//     Aplica a: examenes.html
//     Efecto: botón que abre selector de archivo .json
// ============================================================

const AcmeImportJSON = {
  init() {
    if (AcmeUtils.currentPage() !== 'examenes.html') return;
    setTimeout(() => {
      const tableHeader = document.querySelector('.tabla-header');
      if (!tableHeader) return;

      const btn = document.createElement('button');
      btn.textContent = '📂 Importar JSON';
      btn.style.cssText = `
        padding:6px 14px;background:#fff;border:1px solid #BFCFE8;border-radius:6px;
        cursor:pointer;font-size:13px;color:#555;font-weight:600;
      `;
      btn.addEventListener('click', () => this._openPicker());
      tableHeader.appendChild(btn);
    }, 500);
  },

  _openPicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          const items = Array.isArray(data) ? data : [data];
          let imported = 0, skipped = 0;
          const examenes = JSON.parse(localStorage.getItem('examenes') || '[]');
          items.forEach(item => {
            if (!item.codigo || !item.titulo) { skipped++; return; }
            if (examenes.find(e => e.codigo === item.codigo)) { skipped++; return; }
            examenes.push(item);
            imported++;
          });
          localStorage.setItem('examenes', JSON.stringify(examenes));
          AcmeUtils.toast(`✅ ${imported} examen(es) importado(s). ${skipped} omitido(s).`, 'success', 4000);
          AcmeActivityLog.record('Importación JSON', `${imported} exámenes importados`);
          if (typeof renderTabla === 'function') renderTabla();
        } catch {
          AcmeUtils.toast('El archivo JSON no es válido', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },
};


// ============================================================
// 14. TEMPORIZADOR VISUAL CON ALERTA SONORA
//     Aplica a: resolver.html
//     Efecto: añade alerta visual parpadeante + sonido beep
//             cuando quedan ≤ 60 segundos
// ============================================================

const AcmeTimerAlert = {
  beepInterval: null,

  init() {
    if (AcmeUtils.currentPage() !== 'resolver.html') return;

    // Observa el elemento del timer para detectar cambios
    const checkTimer = setInterval(() => {
      const display = document.getElementById('timerDisplay');
      if (!display) return;

      const observer = new MutationObserver(() => {
        const text = display.textContent.trim();
        const [min, sec] = text.split(':').map(Number);
        const total = (min || 0) * 60 + (sec || 0);

        if (total <= 60 && total > 0) {
          display.style.animation = 'acme-blink .8s infinite';
          AcmeUtils.addStyle('acme-blink-style',
            `@keyframes acme-blink{0%,100%{opacity:1}50%{opacity:.2}}`);
          if (!this.beepInterval) {
            this.beepInterval = setInterval(() => this._beep(), 2000);
          }
        } else {
          display.style.animation = '';
          clearInterval(this.beepInterval);
          this.beepInterval = null;
        }
      });
      observer.observe(display, { childList: true, characterData: true, subtree: true });
      clearInterval(checkTimer);
    }, 1000);
  },

  _beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => osc.stop(), 200);
    } catch { /* AudioContext no disponible */ }
  },
};


// ============================================================
// 15. REANUDAR EXAMEN INTERRUMPIDO
//     Aplica a: resolver.html
//     Efecto: guarda el estado del examen en progreso en
//             sessionStorage y ofrece retomarlo al recargar
// ============================================================

const AcmeResume = {
  KEY: 'acme_exam_resume',

  init() {
    if (AcmeUtils.currentPage() !== 'resolver.html') return;

    // Verificar si hay examen guardado
    const saved = sessionStorage.getItem(this.KEY);
    if (saved) {
      const state = JSON.parse(saved);
      setTimeout(() => {
        const banner = document.createElement('div');
        banner.style.cssText = `
          background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;
          padding:12px 16px;margin:12px;display:flex;
          align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;
        `;
        banner.innerHTML = `
          <span style="font-size:14px;color:#92400E;">
            ⚡ Tienes un examen en progreso: <strong>${state.titulo}</strong>
          </span>
          <div style="display:flex;gap:8px;">
            <button id="acme-resume-btn" style="padding:6px 14px;background:#2563C4;
              color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
              Continuar examen
            </button>
            <button id="acme-resume-discard" style="padding:6px 14px;background:#fff;
              border:1px solid #ddd;border-radius:6px;cursor:pointer;font-size:13px;color:#888;">
              Descartar
            </button>
          </div>
        `;
        document.querySelector('.main-content, main')?.prepend(banner);

        banner.querySelector('#acme-resume-btn').onclick = () => {
          // Restaurar variables globales si existen
          if (typeof examenActual !== 'undefined') {
            banner.remove();
            AcmeUtils.toast('Examen restaurado', 'success');
          }
        };
        banner.querySelector('#acme-resume-discard').onclick = () => {
          sessionStorage.removeItem(this.KEY);
          banner.remove();
        };
      }, 800);
    }

    // Guardar estado cada vez que el usuario responde
    document.addEventListener('click', e => {
      if (e.target.matches('input[type="radio"]')) {
        if (typeof examenActual !== 'undefined' && examenActual) {
          sessionStorage.setItem(this.KEY, JSON.stringify({
            titulo: examenActual.titulo,
            codigo: examenActual.codigo,
            savedAt: new Date().toISOString(),
          }));
        }
      }
    });
  },
};


// ============================================================
// 16. MODO DE ACCESIBILIDAD (TAMAÑO DE FUENTE)
//     Aplica a: TODAS las páginas
//     Efecto: controles A- / A+ para ajustar tamaño de texto
// ============================================================

const AcmeAccessibility = {
  KEY: 'acme_font_size',
  sizes: [14, 16, 18, 21],

  init() {
    const header = document.querySelector('.header-div');
    if (!header) return;

    const saved = parseInt(localStorage.getItem(this.KEY)) || 16;
    document.documentElement.style.fontSize = saved + 'px';

    const ctrl = document.createElement('div');
    ctrl.style.cssText = 'display:flex;align-items:center;gap:4px;';
    ctrl.innerHTML = `
      <button id="acme-font-down" title="Reducir texto" style="background:none;
        border:1px solid rgba(255,255,255,.4);color:inherit;border-radius:4px;
        padding:2px 8px;cursor:pointer;font-weight:700;">A−</button>
      <button id="acme-font-up" title="Aumentar texto" style="background:none;
        border:1px solid rgba(255,255,255,.4);color:inherit;border-radius:4px;
        padding:2px 8px;cursor:pointer;font-weight:700;">A+</button>
    `;
    header.appendChild(ctrl);

    ctrl.querySelector('#acme-font-up').onclick = () => this._change(1);
    ctrl.querySelector('#acme-font-down').onclick = () => this._change(-1);
  },

  _change(dir) {
    const current = parseInt(document.documentElement.style.fontSize) || 16;
    const idx = this.sizes.indexOf(current);
    const next = this.sizes[Math.max(0, Math.min(this.sizes.length - 1, idx + dir))];
    document.documentElement.style.fontSize = next + 'px';
    localStorage.setItem(this.KEY, next);
  },
};


// ============================================================
// 17. REEMPLAZAR alert() / confirm() NATIVOS POR TOASTS/MODALES
//     Aplica a: TODAS las páginas
//     Efecto: los alert() existentes en el código original se
//             convierten automáticamente en toasts elegantes
// ============================================================

const AcmeNativeOverride = {
  init() {
    // Solo sobreescribir alert — confirm se maneja por AcmeUtils.confirm
    const originalAlert = window.alert.bind(window);
    window.alert = (msg) => {
      const lower = String(msg).toLowerCase();
      const type = lower.includes('error') || lower.includes('incorrecto') || lower.includes('inválido')
        ? 'error'
        : lower.includes('correctamente') || lower.includes('guardado') || lower.includes('eliminado')
          ? 'success'
          : lower.includes('advertencia') || lower.includes('atención')
            ? 'warning'
            : 'info';
      AcmeUtils.toast(msg, type);
    };
  },
};


// ============================================================
// 18. ATAJOS DE TECLADO
//     Aplica a: examenes.html + resolver.html
//     Efecto:
//       Ctrl+S → guardar examen (examenes.html)
//       ← → → navegar preguntas (resolver.html)
//       Ctrl+F → enfocar búsqueda (examenes.html, usuarios.html)
// ============================================================

const AcmeKeyboard = {
  init() {
    document.addEventListener('keydown', e => {
      const page = AcmeUtils.currentPage();

      // Ctrl + S → guardar examen
      if (e.ctrlKey && e.key === 's' && page === 'examenes.html') {
        e.preventDefault();
        if (typeof guardarExamen === 'function') guardarExamen();
        AcmeUtils.toast('Guardando examen…', 'info', 1500);
      }

      // Flechas → navegar preguntas en resolver
      if (page === 'resolver.html') {
        if (e.key === 'ArrowRight' && typeof preguntaSiguiente === 'function') preguntaSiguiente();
        if (e.key === 'ArrowLeft'  && typeof preguntaAnterior  === 'function') preguntaAnterior();
      }

      // Ctrl + F → foco en buscador
      if (e.ctrlKey && e.key === 'f' &&
          ['examenes.html','usuarios.html'].includes(page)) {
        const searchInput = document.querySelector('[id^="acme-search-"]');
        if (searchInput) { e.preventDefault(); searchInput.focus(); }
      }
    });
  },
};


// ============================================================
// 19. CONTADOR DE SESIÓN ACTIVA (TIEMPO EN PLATAFORMA)
//     Aplica a: examenes.html, usuarios.html
//     Efecto: muestra el tiempo transcurrido de sesión en el header
// ============================================================

const AcmeSessionTimer = {
  startKey: 'acme_session_start',
  interval: null,

  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html', 'usuarios.html'].includes(page)) return;

    if (!sessionStorage.getItem(this.startKey)) {
      sessionStorage.setItem(this.startKey, Date.now());
    }

    const span = document.createElement('span');
    span.id = 'acme-session-clock';
    span.title = 'Tiempo en sesión';
    span.style.cssText = 'font-size:12px;color:rgba(255,255,255,.7);';
    const header = document.querySelector('.header-div');
    if (header) header.appendChild(span);

    this.interval = setInterval(() => {
      const start = parseInt(sessionStorage.getItem(this.startKey));
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(elapsed / 60).toString().padStart(2,'0');
      const s = (elapsed % 60).toString().padStart(2,'0');
      const el = document.getElementById('acme-session-clock');
      if (el) el.textContent = `⏲ ${m}:${s}`;
    }, 1000);
  },
};


// ============================================================
// 20. EXPORTAR RESULTADOS A JSON (resolver.html)
//     Aplica a: resolver.html → pestaña "Mis Resultados"
//     Efecto: botón para descargar resultados como .json
// ============================================================

const AcmeExportResults = {
  init() {
    if (AcmeUtils.currentPage() !== 'resolver.html') return;

    // Observar cuando aparezca la vista de resultados
    const obs = new MutationObserver(() => {
      const section = document.querySelector('.resultados-view');
      if (section && !section.querySelector('.acme-export-results-btn')) {
        const btn = document.createElement('button');
        btn.className = 'acme-export-results-btn btn-secondary';
        btn.textContent = '⬇ Exportar mis resultados (JSON)';
        btn.style.cssText = `margin-top:8px;padding:8px 16px;background:#fff;
          border:1px solid #BFCFE8;border-radius:6px;cursor:pointer;
          font-size:13px;color:#2563C4;font-weight:600;`;
        btn.addEventListener('click', () => {
          const data = JSON.parse(localStorage.getItem('resultadosExamenes') || '[]');
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href = url;
          a.download = `acme-resultados-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          AcmeUtils.toast('Resultados exportados', 'success');
        });
        section.appendChild(btn);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  },
};


// ============================================================
// 21. NOMBRE DEL USUARIO LOGUEADO EN EL HEADER
//     Aplica a: examenes.html, usuarios.html
//     Efecto: muestra el nombre real desde sessionStorage
// ============================================================

const AcmeSessionDisplay = {
  init() {
    const page = AcmeUtils.currentPage();
    if (!['examenes.html','usuarios.html'].includes(page)) return;

    const raw = sessionStorage.getItem('acme_session');
    if (!raw) return;
    const session = JSON.parse(raw);

    const nameEl = document.querySelector('.admin-nombre');
    if (nameEl && session.fullName) {
      nameEl.textContent = `👤 ${session.fullName}`;
      nameEl.title = `${session.email} · ${session.role}`;
    }
  },
};


// ============================================================
// ============================================================
//  PUNTO DE ENTRADA: inicializar todos los módulos
// ============================================================
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Módulos que aplican a todas las páginas
  AcmeDarkMode.init();
  AcmeAccessibility.init();
  AcmeKeyboard.init();
  AcmeNativeOverride.init();
  AcmeActivityLog.init();
  AcmeSessionDisplay.init();
  AcmeSessionTimer.init();

  // Módulos específicos por página
  const page = AcmeUtils.currentPage();

  if (['examenes.html', 'usuarios.html'].includes(page)) {
    AcmeSearch.init();
    AcmeSortable.init();
    AcmeExportCSV.init();
    AcmePagination.init();
    AcmeFormProgress.init();
    AcmeAutosave.init();
  }

  if (page === 'examenes.html') {
    AcmeStats.init();
    AcmePreview.init();
    AcmeDuplicate.init();
    AcmeImportJSON.init();
  }

  if (page === 'usuarios.html') {
    AcmeFormValidation.init();
  }

  if (page === 'resolver.html') {
    AcmeTimerAlert.init();
    AcmeResume.init();
    AcmeExportResults.init();
  }
});