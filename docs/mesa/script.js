
// CONFIGURACIÓN GENERAL
// ============================

const config = {
    pro: { roundSeconds: 180, restSeconds: 60 },
    amateur: { roundSeconds: 120, restSeconds: 60 }
};
document.getElementById("finishBtn").onclick = () => {
    saveFightToHistory();   // ← ESTA ES LA FUNCIÓN REAL
    stopGlobalTimer();
    clearInterval(timerInterval);
    timerInterval = null;
    statusDisplay.textContent = "Combate finalizado.";
};

let currentMode = "pro";
let roundLimit = 12;
let round = 0;
let timeLeft = config[currentMode].roundSeconds;
let timerInterval = null;
let inRest = false;

let globalSeconds = 0;
let globalInterval = null;

// ============================
// ELEMENTOS DEL DOM
// ============================

const roundDisplay = document.getElementById("roundNumber");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");

const bellStart = document.getElementById("bellStart");
const bellEnd = document.getElementById("bellEnd");
const tenSeconds = document.getElementById("tenSeconds");

[bellStart, bellEnd, tenSeconds].forEach(audio => {
    if (audio) {
        audio.volume = 1.0;
        audio.load();
    }
});

const cardsContainer = document.getElementById("cardsContainer");
const listaHistorial = document.getElementById("listaHistorial");

const fightTypeSelect = document.getElementById("fightType");
const roundLimitInput = document.getElementById("roundLimit");

// ============================
// CRONÓMETRO GLOBAL
// ============================

function updateGlobalTimer() {
    let m = Math.floor(globalSeconds / 60);
    let s = globalSeconds % 60;
    document.getElementById("globalTimer").textContent =
        "Cronómetro: " + m.toString().padStart(2, '0') + ":" + s.toString().padStart(2, '0');
}

function startGlobalTimer() {
    if (globalInterval) return;
    globalInterval = setInterval(() => {
        globalSeconds++;
        updateGlobalTimer();
    }, 1000);
}

function stopGlobalTimer() {
    clearInterval(globalInterval);
    globalInterval = null;
}

function resetGlobalTimer() {
    stopGlobalTimer();
    globalSeconds = 0;
    updateGlobalTimer();
}

// ============================
// CRONÓMETRO DE ROUND
// ============================

function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startRound() {
    if (round >= roundLimit) {
        statusDisplay.textContent = "Combate finalizado. Se alcanzó el límite de rounds.";
        return;
    }

    round++;
    inRest = false;
    timeLeft = config[currentMode].roundSeconds;
    roundDisplay.textContent = "Round: " + round;
    timerDisplay.textContent = formatTime(timeLeft);
    statusDisplay.textContent = "Round " + round + " en curso.";
    if (bellStart) bellStart.play();
}

function startRest() {
    inRest = true;
    timeLeft = config[currentMode].restSeconds;
    timerDisplay.textContent = formatTime(timeLeft);
}

function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);

        if (!inRest && timeLeft === 10 && tenSeconds) {
            tenSeconds.play();
            statusDisplay.textContent = "¡Últimos 10 segundos!";
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            if (!inRest) {
                if (bellEnd) bellEnd.play();
                statusDisplay.textContent = "Fin del round " + round + ". Descanso.";
                startRest();
                startTimer();
            } else {
                startRound();
                startTimer();
            }
        }
    }, 1000);
}

// ============================
// EVENTOS DE CONFIGURACIÓN
// ============================

fightTypeSelect.addEventListener("change", () => {
    if (round === 0) {
        currentMode = fightTypeSelect.value;
        timeLeft = config[currentMode].roundSeconds;
        timerDisplay.textContent = formatTime(timeLeft);
    }
});

roundLimitInput.addEventListener("change", () => {
    if (round === 0) {
        roundLimit = parseInt(roundLimitInput.value) || 12;
    }
});

// ============================
// BOTONES DEL COMBATE
// ============================

document.getElementById("startBtn").onclick = () => {
    startGlobalTimer();
    if (round === 0) startRound();
    startTimer();
};

document.getElementById("nextBtn").onclick = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startRound();
};

document.getElementById("stopBtn").onclick = () => {
    stopGlobalTimer();
    clearInterval(timerInterval);
    timerInterval = null;
    statusDisplay.textContent = "Pausado.";
};

document.getElementById("resetBtn").onclick = () => {
    resetGlobalTimer();
    clearInterval(timerInterval);
    timerInterval = null;
    round = 0;
    inRest = false;
    timeLeft = config[currentMode].roundSeconds;
    roundDisplay.textContent = "Round: 0";
    timerDisplay.textContent = formatTime(timeLeft);
    statusDisplay.textContent = "Reiniciado.";
};





// ============================
// TARJETAS DE JUECES
// ============================

function createScoreSelect() {
    const select = document.createElement("select");

    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "";
    select.appendChild(empty);

    [10, 9, 8, 7, 6].forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
    });

    return select;
}

function calculateJudgeTotals(cardDiv) {
    const azulSelects = cardDiv.querySelectorAll(".score-azul");
    const rojoSelects = cardDiv.querySelectorAll(".score-rojo");

    let totalAzul = 0;
    let totalRojo = 0;

    azulSelects.forEach(sel => { if (sel.value) totalAzul += parseInt(sel.value); });
    rojoSelects.forEach(sel => { if (sel.value) totalRojo += parseInt(sel.value); });

    cardDiv.querySelector(".total-azul").textContent = totalAzul;
    cardDiv.querySelector(".total-rojo").textContent = totalRojo;
}

function generateProCards() {
    cardsContainer.innerHTML = "";

    const judges = [
        { id: 1, name: document.getElementById("judge1Name").value || "Juez 1" },
        { id: 2, name: document.getElementById("judge2Name").value || "Juez 2" },
        { id: 3, name: document.getElementById("judge3Name").value || "Juez 3" }
    ];

    judges.forEach(j => {
        const card = document.createElement("div");
        card.className = "judge-card";

        const title = document.createElement("h3");
        title.textContent = "Tarjeta " + j.name;
        card.appendChild(title);

        const table = document.createElement("table");
        table.className = "judge-table";

        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");

        ["Round", "Azul", "Rojo"].forEach(txt => {
            const th = document.createElement("th");
            th.textContent = txt;
            headRow.appendChild(th);
        });

        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        for (let r = 1; r <= roundLimit; r++) {
            const row = document.createElement("tr");

            const tdRound = document.createElement("td");
            tdRound.textContent = r;
            row.appendChild(tdRound);

            const tdAzul = document.createElement("td");
            const selAzul = createScoreSelect();
            selAzul.className = "score-azul";
            selAzul.addEventListener("change", () => calculateJudgeTotals(card));
            tdAzul.appendChild(selAzul);
            row.appendChild(tdAzul);

            const tdRojo = document.createElement("td");
            const selRojo = createScoreSelect();
            selRojo.className = "score-rojo";
            selRojo.addEventListener("change", () => calculateJudgeTotals(card));
            tdRojo.appendChild(selRojo);
            row.appendChild(tdRojo);

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        card.appendChild(table);

        const totalsDiv = document.createElement("div");
        totalsDiv.className = "totals";
        totalsDiv.innerHTML = `
            Total Azul: <span class="total-azul">0</span> |
            Total Rojo: <span class="total-rojo">0</span>
        `;
        card.appendChild(totalsDiv);

        cardsContainer.appendChild(card);
    });
}

function generateAmateurCard() {
    cardsContainer.innerHTML = "";

    const card = document.createElement("div");
    card.id = "amateurCard";
    card.className = "judge-card";

    const title = document.createElement("h3");
    title.textContent = "Puntuación Amateur (final)";
    card.appendChild(title);

    const table = document.createElement("table");
    table.className = "judge-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    ["Azul", "Rojo"].forEach(txt => {
        const th = document.createElement("th");
        th.textContent = txt;
        headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const row = document.createElement("tr");

    const tdAzul = document.createElement("td");
    const inputAzul = document.createElement("input");
    inputAzul.type = "number";
    inputAzul.min = "0";
    tdAzul.appendChild(inputAzul);
    row.appendChild(tdAzul);

    const tdRojo = document.createElement("td");
    const inputRojo = document.createElement("input");
    inputRojo.type = "number";
    inputRojo.min = "0";
    tdRojo.appendChild(inputRojo);
    row.appendChild(tdRojo);

    tbody.appendChild(row);
    table.appendChild(tbody);

    card.appendChild(table);
    cardsContainer.appendChild(card);
}

document.getElementById("generateCardsBtn").onclick = () => {
    if (fightTypeSelect.value === "pro") {
        generateProCards();
    } else {
        generateAmateurCard();
    }
};

// ============================
// HISTORIAL LIVIANO (A1 COMPLETO)
// ============================
console.log("EJECUTANDO saveFightToHistory");

function saveFightToHistory() {
    const fechaFestival = document.getElementById("fightDate").value;
    const numero = document.getElementById("fightNumber").value;
    const azul = document.getElementById("blueBoxer").value;
    const rojo = document.getElementById("redBoxer").value;
    const fallo = document.getElementById("decision").value;
    const ganador = document.getElementById("winner").value;

    const fechaHora = new Date().toLocaleString();

    let historial = JSON.parse(localStorage.getItem("historialFestivales")) || {};

    if (!historial[fechaFestival]) historial[fechaFestival] = {};

    historial[fechaFestival][numero] = {
        numero,
        azul,
        rojo,
        fallo,
        ganador,
        fechaHora
    };

    localStorage.setItem("historialFestivales", JSON.stringify(historial));

    
    renderHistorial();
}

function renderHistorial() {

    let historial = JSON.parse(localStorage.getItem("historialFestivales")) || {};
    listaHistorial.innerHTML = "";

    const fechas = Object.keys(historial);

    if (fechas.length === 0) {
        listaHistorial.textContent = "No hay combates registrados aún.";
        return;
    }

    fechas.forEach(fecha => {

        const titulo = document.createElement("h3");
        titulo.textContent = "Festival del " + fecha;
        listaHistorial.appendChild(titulo);

        const combates = Object.values(historial[fecha]);

        combates.forEach(combate => {

            const div = document.createElement("div");
            div.className = "historial-item";
            div.style.padding = "12px";
            div.style.marginBottom = "10px";
            div.style.background = "#fff";
            div.style.borderRadius = "10px";
            div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";

            div.innerHTML = `
                <strong>Combate ${combate.numero}</strong><br>
                ${combate.azul} vs ${combate.rojo}<br>
                Fallo: ${combate.fallo}<br>
                Ganador: ${combate.ganador}<br>
                Guardado: ${combate.fechaHora}<br>
            `;

            listaHistorial.appendChild(div);
        });

        const btnActa = document.createElement("button");
        btnActa.textContent = "Exportar ACTA completa del festival";
        btnActa.onclick = () => exportActaCompletaFestival();
        listaHistorial.appendChild(btnActa);

        listaHistorial.appendChild(document.createElement("hr"));
    });

    const btnClear = document.createElement("button");
    btnClear.textContent = "Limpiar historial completo";
    btnClear.style.background = "#b30000";
    btnClear.onclick = clearHistorial;
    listaHistorial.appendChild(btnClear);
}

function clearHistorial() {
    if (confirm("¿Seguro que deseas borrar TODO el historial?")) {
        localStorage.removeItem("historialFestivales");
        renderHistorial();
    }
}

// ============================
// RECONSTRUCCIÓN DE TARJETAS
// ============================

function reconstruirTarjetas() {
    const tarjetasOriginales = document.querySelectorAll(".judge-card");
    const contenedor = document.createElement("div");

    contenedor.id = "tarjetas-temp";
    contenedor.style.position = "absolute";
    contenedor.style.top = "-9999px";
    contenedor.style.left = "-9999px";
    contenedor.style.opacity = "1"; // importante: NO usar display:none

    document.body.appendChild(contenedor);

    const tarjetas = [];

    tarjetasOriginales.forEach(card => {
        const clon = card.cloneNode(true);
        contenedor.appendChild(clon);
        tarjetas.push(clon);
    });

    return tarjetas;
}
// ============================
// EXPORTAR ACTA DEL FESTIVAL (PDF)
// ============================ 

function exportActaFestival() {

    const fechaFestival = document.getElementById("fightDate").value;
    const numero = document.getElementById("fightNumber").value;
    const azul = document.getElementById("blueBoxer").value;
    const rojo = document.getElementById("redBoxer").value;
    const fallo = document.getElementById("decision").value;
    const ganador = document.getElementById("winner").value;

    const fechaHora = new Date().toLocaleString();

    const pdf = new jspdf.jsPDF({
        orientation: "p",
        unit: "px",
        format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;

    // ENCABEZADO
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("FEDERACIÓN ENTRERRIANA DE BOXEO", pageWidth / 2, 40, { align: "center" });

    pdf.setFontSize(16);
    pdf.text(`ACTA DEL COMBATE Nº ${numero}`, pageWidth / 2, 80, { align: "center" });

    // DATOS
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(12);

    let y = 130;

    pdf.text(`Festival: ${fechaFestival}`, margin, y); y += 25;
    pdf.text(`Boxeador Azul: ${azul}`, margin, y); y += 25;
    pdf.text(`Boxeador Rojo: ${rojo}`, margin, y); y += 25;
    pdf.text(`Fallo: ${fallo}`, margin, y); y += 25;
    pdf.text(`Ganador: ${ganador}`, margin, y); y += 25;
    pdf.text(`Generado: ${fechaHora}`, margin, y); y += 40;

    // TARJETAS
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Tarjetas de los jueces:", margin, y);
    y += 30;

    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(12);

    const tarjetas = document.querySelectorAll(".judge-card");

    if (tarjetas.length === 0) {
        pdf.text("No hay tarjetas generadas.", margin, y);
    } else {
        tarjetas.forEach((t, index) => {

            let titulo = t.querySelector("h3").textContent.replace("Tarjeta ", "").trim();

            let numeroJuez = "";
            let nombreJuez = titulo;

            if (titulo.includes("-")) {
                const partes = titulo.split("-");
                numeroJuez = partes[0].trim();
                nombreJuez = partes[1].trim();
            } else {
                numeroJuez = "Juez " + (index + 1);
            }

            const totalAzul = t.querySelector(".total-azul")?.textContent || "0";
            const totalRojo = t.querySelector(".total-rojo")?.textContent || "0";

            pdf.text(`- ${numeroJuez} (${nombreJuez}): Azul ${totalAzul} | Rojo ${totalRojo}`, margin, y);
            y += 25;
        });
    }

    pdf.save(`ACTA_COMBATE_${numero}_${fechaFestival}.pdf`);
}

function exportActaCompletaFestival() {

    const historial = JSON.parse(localStorage.getItem("historialFestivales")) || {};

    if (Object.keys(historial).length === 0) {
        alert("No hay combates guardados para exportar.");
        return;
    }

    const fechaFestival = Object.keys(historial)[0];
    const combates = Object.values(historial[fechaFestival]);

    const pdf = new jspdf.jsPDF({
        orientation: "p",
        unit: "px",
        format: "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;

    let firstPage = true;

    for (const combate of combates) {

        if (!firstPage) pdf.addPage();
        firstPage = false;

        // ENCABEZADO
        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(20);
        pdf.text("FEDERACIÓN ENTRERRIANA DE BOXEO", pageWidth / 2, 40, { align: "center" });

        pdf.setFontSize(16);
        pdf.text(`ACTA DEL COMBATE Nº ${combate.numero}`, pageWidth / 2, 80, { align: "center" });

        // DATOS
        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(12);

        let y = 130;

        pdf.text(`Festival: ${fechaFestival}`, margin, y); y += 25;
        pdf.text(`Boxeador Azul: ${combate.azul}`, margin, y); y += 25;
        pdf.text(`Boxeador Rojo: ${combate.rojo}`, margin, y); y += 25;
        pdf.text(`Fallo: ${combate.fallo}`, margin, y); y += 25;
        pdf.text(`Ganador: ${combate.ganador}`, margin, y); y += 25;
        pdf.text(`Guardado: ${combate.fechaHora}`, margin, y); y += 40;

        // TARJETAS
        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text("Tarjetas de los jueces:", margin, y);
        y += 30;

        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(12);

        if (combate.tarjetas && Array.isArray(combate.tarjetas)) {

            combate.tarjetas.forEach((t, index) => {

                let numeroJuez = "Juez " + (index + 1);
                let nombreJuez = t.juez;

                pdf.text(`- ${numeroJuez} (${nombreJuez}): Azul ${t.azul} | Rojo ${t.rojo}`, margin, y);
                y += 25;
            });

        } else {

            pdf.text("No hay tarjetas registradas para este combate.", margin, y);
            y += 25;
        }
    }

    pdf.save(`ACTA_COMPLETA_FESTIVAL_${fechaFestival}.pdf`);
}

// ============================
// INICIO DEL SISTEMA
// ============================

timerDisplay.textContent = formatTime(timeLeft);
roundDisplay.textContent = "Round: 0";
updateGlobalTimer();
renderHistorial();

console.log("bellStart:", bellStart.src);
console.log("bellEnd:", bellEnd.src);
console.log("tenSeconds:", tenSeconds.src);

bellStart.addEventListener("error", () => console.log("ERROR: bellStart no se pudo cargar"));
bellEnd.addEventListener("error", () => console.log("ERROR: bellEnd no se pudo cargar"));
tenSeconds.addEventListener("error", () => console.log("ERROR: tenSeconds no se pudo cargar"));

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("pdfBtn");

    if (!btn) {
        console.log("pdfBtn NO encontrado en el DOM");
        return;
    }

    btn.addEventListener("click", () => {
        console.log(">>> CLICK DETECTADO");
        exportActaFestival();
    
    });

});