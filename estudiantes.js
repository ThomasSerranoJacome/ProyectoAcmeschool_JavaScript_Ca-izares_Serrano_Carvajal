function obtenerExamenes() {
  try {
    const raw = localStorage.getItem("acme_examenes");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) { }

  return [
    {
      codigo: "JS-101",
      titulo: "Fundamentos de JavaScript",
      aprobacion: 30,
      numEstudiantes: 4,
      promedioPorcentaje: 50,
    },
  ];
}

function estadoBadge(promedio, aprobacion) {
  return promedio >= aprobacion ? "badge-aprobado" : "badge-reprobado";
}


function fmt(n) {
  return `${Number(n).toFixed(1)} %`;
}

function renderTabla(examenes) {
  const tbody = document.getElementById("tablaExamenes");
  const contador = document.getElementById("contadorExamenes");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (examenes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="vacio">
          No hay exámenes registrados. Ajusta los filtros o agrega datos.
        </td>
      </tr>`;
    if (contador) contador.textContent = "0 registros";
    return;
  }

  examenes.forEach((ex) => {
    const aprueba = Number(ex.promedioPorcentaje) >= Number(ex.aprobacion);
    const badgeClass = aprueba ? "badge-aprobado" : "badge-reprobado";
    const badgeTexto = aprueba ? "Aprobado" : "Reprobado";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="codigo-tag">${ex.codigo}</span></td>
      <td>${ex.titulo}</td>
      <td><span class="badge-estado ${badgeClass}">${badgeTexto} (${fmt(ex.aprobacion)})</span></td>
      <td class="center">${ex.numEstudiantes}</td>
      <td class="center">
        <div class="barra-container">
          <div class="barra" style="width: ${Math.min(ex.promedioPorcentaje, 100)}%"></div>
          <span class="barra-label">${fmt(ex.promedioPorcentaje)}</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (contador) {
    contador.textContent = `${examenes.length} registro${examenes.length !== 1 ? "s" : ""}`;
  }
}

function filtrarExamenes(examenes, codigo, titulo, numEst, promedio) {
  return examenes.filter((ex) => {
    const okCodigo = !codigo || ex.codigo.toLowerCase().includes(codigo.toLowerCase());
    const okTitulo = !titulo || ex.titulo.toLowerCase().includes(titulo.toLowerCase());
    const okNum = !numEst || Number(ex.numEstudiantes) >= Number(numEst);
    const okProm = !promedio || Number(ex.promedioPorcentaje) >= Number(promedio);
    return okCodigo && okTitulo && okNum && okProm;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const todosLosExamenes = obtenerExamenes();

  renderTabla(todosLosExamenes);

  const inputCodigo = document.getElementById("codigo");
  const inputTitulo = document.getElementById("titulo");
  const inputNum = document.getElementById("aprobacion");
  const inputProm = document.getElementById("numero de estudiantes");

  function aplicarFiltro() {
    const resultado = filtrarExamenes(
      todosLosExamenes,
      inputCodigo?.value ?? "",
      inputTitulo?.value ?? "",
      inputNum?.value ?? "",
      inputProm?.value ?? ""
    );
    renderTabla(resultado);
  }

  [inputCodigo, inputTitulo, inputNum, inputProm].forEach((input) => {
    if (input) input.addEventListener("input", aplicarFiltro);
  });
});