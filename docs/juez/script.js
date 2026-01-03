// =========================
//  BASE DE DATOS (IndexedDB)
// =========================

let db;

const request = indexedDB.open("JuezFEB_DB", 1);

// Crear estructura si no existe
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("tarjetas", { keyPath: "id", autoIncrement: true });
};

// Conexión exitosa
request.onsuccess = function (event) {
  db = event.target.result;
  cargarTarjetas();
};

// Guardar tarjeta en la base
function guardarTarjeta() {
  const data = {
    fecha: new Date().toISOString(),
    rojo: document.getElementById("rojo")?.value || "",
    azul: document.getElementById("azul")?.value || "",
    puntajeRojo: document.getElementById("totalRojo")?.value || 0,
    puntajeAzul: document.getElementById("totalAzul")?.value || 0
  };

  const tx = db.transaction("tarjetas", "readwrite");
  tx.objectStore("tarjetas").add(data);
  tx.oncomplete = cargarTarjetas;
}

// Cargar historial de tarjetas
function cargarTarjetas() {
  const tx = db.transaction("tarjetas", "readonly");
  const store = tx.objectStore("tarjetas");
  const req = store.getAll();

  req.onsuccess = () => {
    const cont = document.getElementById("listaTarjetas");
    cont.innerHTML = "";

    req.result.forEach(t => {
      const div = document.createElement("div");
      div.className = "historial-item";

      div.innerHTML = `
        <strong>${t.rojo} vs ${t.azul}</strong><br>
        Rojo: ${t.puntajeRojo} — Azul: ${t.puntajeAzul}<br>
        Fecha: ${new Date(t.fecha).toLocaleString()}
      `;

      cont.appendChild(div);
    });
  };
}
// =========================
//  SUMA AUTOMÁTICA
// =========================
function recalcularTotales() {
  const r1r = Number(document.getElementById("r1r").value) || 0;
  const r2r = Number(document.getElementById("r2r").value) || 0;
  const r3r = Number(document.getElementById("r3r").value) || 0;

  const r1a = Number(document.getElementById("r1a").value) || 0;
  const r2a = Number(document.getElementById("r2a").value) || 0;
  const r3a = Number(document.getElementById("r3a").value) || 0;

  document.getElementById("totalRojo").value = r1r + r2r + r3r;
  document.getElementById("totalAzul").value = r1a + r2a + r3a;
}

document.querySelectorAll("input[type='number']").forEach(input => {
  input.addEventListener("input", recalcularTotales);
});


// =========================
//  FIRMA CON EL DEDO
// =========================
const canvas = document.getElementById("firmaCanvas");
const ctx = canvas.getContext("2d");

let dibujando = false;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

canvas.addEventListener("mousedown", (e) => {
  dibujando = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("mousemove", (e) => {
  if (!dibujando) return;
  const pos = getPos(e);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => dibujando = false);

// Touch (dedo)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dibujando = true;
  const t = e.touches[0];
  const pos = getPos(t);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!dibujando) return;
  const t = e.touches[0];
  const pos = getPos(t);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
});

canvas.addEventListener("touchend", () => dibujando = false);

// Botón limpiar firma
document.getElementById("limpiarFirma").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
// =========================
//  GENERAR PDF COMPLETO (OFICIAL FEB) — VERSIÓN FINAL
// =========================
document.getElementById("btnPDF").addEventListener("click", async () => {
  console.log("PDF CORREGIDO ACTIVADO");
  const { jsPDF } = window.jspdf;

  const tarjeta = document.querySelector(".tarjeta-juez");
  if (!tarjeta) {
    alert("No se encontró la tarjeta para generar el PDF.");
    return;
  }

  // Forzar fondo blanco REAL en html2canvas
  tarjeta.style.backgroundColor = "#FFFFFF";

  const fecha = document.getElementById("fechaCombate")?.value || "Sin fecha";
  const juez = document.getElementById("nombreJuez")?.value || "Sin nombre";

  const pdf = new jsPDF("p", "mm", "a4");

  const logo = new Image();
  logo.src = "logo-feb.png";

  logo.onload = async function () {

    // =========================
    //  BORDE NEGRO
    // =========================
    pdf.setLineWidth(1.2);
    pdf.rect(5, 5, 200, 287);

    // =========================
    //  ENCABEZADO
    // =========================
    pdf.addImage(logo, "PNG", 12, 10, 22, 22);

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("FEDERACIÓN ENTRERRIANA DE BOXEO", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Tarjeta Oficial del Juez", 105, 28, { align: "center" });

    pdf.setLineWidth(0.8);
    pdf.line(10, 35, 200, 35);

    // =========================
    //  DATOS
    // =========================
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${fecha}`, 12, 45);
    pdf.text(`Juez: ${juez}`, 12, 52);

    // =========================
    //  CAPTURA DE TARJETA
    // =========================

    window.devicePixelRatio = 1;

    const canvasTarjeta = await html2canvas(tarjeta, {
      scale: 3,
      backgroundColor: "#FFFFFF",
      useCORS: true
    });

    const imgData = canvasTarjeta.toDataURL("image/png");

    const pageWidth = pdf.internal.pageSize.getWidth();

    // =========================
    //  TAMAÑO FIJO EN MILÍMETROS (10×14 cm)
    // =========================
    const finalWidth = 100;   // 10 cm
    const finalHeight = 170;  // 14 cm

    // Centrado real
    const x = (pageWidth - finalWidth) / 2;
    const y = 60;

    // Insertar imagen EXACTA sin escalar
    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

    // =========================
    //  GUARDAR PDF
    // =========================
    pdf.save("Tarjeta-Juez-FEB.pdf");
  };

  logo.onerror = function () {
    alert("No se pudo cargar el logo. Verifica que 'logo-feb.png' exista.");
  };
});