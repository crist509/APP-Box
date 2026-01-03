console.log("TEST: script.js se está ejecutando");

/* ============================================================
   GENERAR PDF COMPLETO (OFICIAL FEB)
   ============================================================ */
document.getElementById("btnPDF")?.addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;

    const tarjeta = document.querySelector(".tarjeta-juez");
    if (!tarjeta) {
        alert("No se encontró la tarjeta para generar el PDF.");
        return;
    }

    tarjeta.style.backgroundColor = "#FFFFFF";

    const fechaCombate = document.getElementById("fechaCombate")?.value || "";
    const lugar = document.querySelector(".info-general input[type='text']")?.value || "";
    const juez = document.getElementById("nombreJuez")?.value || "";

    const pdf = new jsPDF("p", "mm", "a4");

    const logo = new Image();
    logo.src = "logo-feb.png";

    logo.onload = async function () {

        pdf.setLineWidth(1.2);
        pdf.rect(5, 5, 200, 287);

        pdf.addImage(logo, "PNG", 12, 10, 22, 22);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("FEDERACIÓN ENTRERRIANA DE BOXEO", 105, 20, { align: "center" });

        pdf.setFontSize(12);
        pdf.text("Tarjeta Oficial del Juez", 105, 28, { align: "center" });

        pdf.line(10, 35, 200, 35);

        pdf.setFontSize(12);
        pdf.text(`Fecha del combate: ${fechaCombate}`, 12, 45);
        pdf.text(`Lugar: ${lugar}`, 12, 52);
        pdf.text(`Juez: ${juez}`, 12, 59);

        window.devicePixelRatio = 1;

        const canvasTarjeta = await html2canvas(tarjeta, {
            scale: 3,
            backgroundColor: "#FFFFFF",
            useCORS: true
        });

        const imgData = canvasTarjeta.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();

        const finalWidth = 100;
        const finalHeight = 170;

        const x = (pageWidth - finalWidth) / 2;
        const y = 70;

        pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const pdfName = `Tarjeta-Juez-FEB-${timestamp}.pdf`;

        guardarHistorialTarjeta({
            id: crypto.randomUUID(),
            fechaGenerada: new Date().toLocaleString(),
            fechaCombate: fechaCombate,
            lugar: lugar,
            juez: juez,
            boxeadorRojo: document.getElementById("rojo")?.value || "",
            boxeadorAzul: document.getElementById("azul")?.value || "",
            totalRojo: document.getElementById("totalRojo")?.value || "",
            totalAzul: document.getElementById("totalAzul")?.value || "",
            ganador: document.querySelector(".ganador input")?.value || "",
            pdfNombre: pdfName
        });

        pdf.save(pdfName);
    };
});

/* ============================================================
   GUARDAR HISTORIAL
   ============================================================ */
function guardarHistorialTarjeta(data) {
    const historial = JSON.parse(localStorage.getItem("historialTarjetas")) || [];
    historial.push(data);
    localStorage.setItem("historialTarjetas", JSON.stringify(historial));
}

/* ============================================================
   MOSTRAR HISTORIAL + BUSCADOR
   ============================================================ */
function mostrarHistorial(filtro = "") {
    const historial = JSON.parse(localStorage.getItem("historialTarjetas")) || [];
    const contenedor = document.getElementById("historialContainer");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    const listaFiltrada = historial.filter(item =>
        JSON.stringify(item).toLowerCase().includes(filtro.toLowerCase())
    );

    listaFiltrada.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("historial-item");

        div.innerHTML = `
            <h3>Tarjeta del ${item.fechaGenerada}</h3>
            <p><strong>Fecha del combate:</strong> ${item.fechaCombate}</p>
            <p><strong>Lugar:</strong> ${item.lugar}</p>
            <p><strong>Juez:</strong> ${item.juez}</p>
            <p><strong>Rojo:</strong> ${item.boxeadorRojo} (${item.totalRojo})</p>
            <p><strong>Azul:</strong> ${item.boxeadorAzul} (${item.totalAzul})</p>
            <p><strong>Ganador:</strong> ${item.ganador}</p>

            <div class="historial-botones">
                <button class="btn-historial btn-verpdf" onclick="regenerarPDF('${item.id}')">Ver PDF</button>
                <button class="btn-historial btn-whatsapp" onclick="reenviarWhatsapp('${item.id}')">WhatsApp</button>
                <button class="btn-historial btn-borrar" onclick="borrarTarjeta('${item.id}')">Borrar</button>
            </div>
        `;

        contenedor.appendChild(div);
    });
}

/* ============================================================
   BUSCADOR EN TIEMPO REAL
   ============================================================ */
document.getElementById("buscador")?.addEventListener("input", (e) => {
    mostrarHistorial(e.target.value);
});

/* ============================================================
   BORRAR UNA TARJETA
   ============================================================ */
function borrarTarjeta(id) {
    let historial = JSON.parse(localStorage.getItem("historialTarjetas")) || [];
    historial = historial.filter(t => t.id !== id);
    localStorage.setItem("historialTarjetas", JSON.stringify(historial));
    mostrarHistorial();
}

/* ============================================================
   BORRAR TODO EL HISTORIAL
   ============================================================ */
function borrarTodo() {
    if (confirm("¿Seguro que deseas borrar TODO el historial?")) {
        localStorage.removeItem("historialTarjetas");
        mostrarHistorial();
    }
}

/* ============================================================
   REENVIAR WHATSAPP
   ============================================================ */
function reenviarWhatsapp(id) {
    const historial = JSON.parse(localStorage.getItem("historialTarjetas")) || [];
    const item = historial.find(t => t.id === id);

    if (!item) return;

    const mensaje =
        `Tarjeta FEB\n` +
        `Fecha: ${item.fechaCombate}\n` +
        `Lugar: ${item.lugar}\n` +
        `Juez: ${item.juez}\n` +
        `Azul: ${item.boxeadorAzul} (${item.totalAzul})\n` +
        `Rojo: ${item.boxeadorRojo} (${item.totalRojo})\n` +
        `Ganador: ${item.ganador}\n\n` +
        `PDF generado: ${item.pdfNombre}`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

/* ============================================================
   REGENERAR PDF DESDE HISTORIAL
   ============================================================ */
function regenerarPDF(id) {
    const historial = JSON.parse(localStorage.getItem("historialTarjetas")) || [];
    const item = historial.find(t => t.id === id);

    if (!item) return;

    alert("Datos cargados. Ahora podés generar el PDF nuevamente.");

    document.getElementById("fechaCombate").value = item.fechaCombate;
    document.querySelector(".info-general input[type='text']").value = item.lugar;

    document.getElementById("rojo").value = item.boxeadorRojo;
    document.getElementById("azul").value = item.boxeadorAzul;
    document.getElementById("totalRojo").value = item.totalRojo;
    document.getElementById("totalAzul").value = item.totalAzul;
    document.querySelector(".ganador input").value = item.ganador;
    document.getElementById("nombreJuez").value = item.juez;
}

/* ============================================================
   INICIALIZAR HISTORIAL
   ============================================================ */
mostrarHistorial();