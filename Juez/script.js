// ===== IndexedDB para tarjetas del juez =====
let db;

const request = indexedDB.open("JuezFEB_DB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  db.createObjectStore("tarjetas", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  cargarTarjetas();
};

function guardarTarjeta() {
  const data = {
    fecha: new Date().toISOString(),
    rojo: document.getElementById("rojo").value,
    azul: document.getElementById("azul").value,
    puntajeRojo: document.getElementById("puntajeRojo").value,
    puntajeAzul: document.getElementById("puntajeAzul").value
  };

  const tx = db.transaction("tarjetas", "readwrite");
  tx.objectStore("tarjetas").add(data);
  tx.oncomplete = cargarTarjetas;
}

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