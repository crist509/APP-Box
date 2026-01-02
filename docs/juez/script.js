// =========================
//  GENERAR PDF COMPLETO (OFICIAL FEB)
// =========================
document.getElementById("btnPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  const tarjeta = document.querySelector(".tarjeta-juez");

  if (!tarjeta) {
    alert("No se encontró la tarjeta para generar el PDF.");
    return;
  }

  // Fondo blanco para evitar transparencia
  tarjeta.style.background = "white";

  const fecha = document.getElementById("fechaCombate")?.value || "Sin fecha";
  const juez = document.getElementById("nombreJuez")?.value || "Sin nombre";

  const pdf = new jsPDF("p", "mm", "a4");

  const logo = new Image();
  logo.src = "logo-feb.png";

  logo.onload = async function () {

    // =========================
    //  BORDE NEGRO DE LA HOJA
    // =========================
    pdf.setLineWidth(1.2);
    pdf.rect(5, 5, 200, 287); // borde estilo acta

    // =========================
    //  ENCABEZADO INSTITUCIONAL
    // =========================

    // Logo FEB
    pdf.addImage(logo, "PNG", 12, 10, 22, 22);

    // Título principal
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("FEDERACIÓN ENTRERRIANA DE BOXEO", 105, 20, { align: "center" });

    // Subtítulo
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Tarjeta Oficial del Juez", 105, 28, { align: "center" });

    // Línea divisoria
    pdf.setLineWidth(0.8);
    pdf.line(10, 35, 200, 35);

    // =========================
    //  DATOS DEL COMBATE
    // =========================
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${fecha}`, 12, 45);
    pdf.text(`Juez: ${juez}`, 12, 52);

    // =========================
    //  CAPTURA DE LA TARJETA
    // =========================
    const canvasTarjeta = await html2canvas(tarjeta, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#FFFFFF"
    });

    const imgData = canvasTarjeta.toDataURL("image/png");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = canvasTarjeta.height * imgWidth / canvasTarjeta.width;

    // Centrado horizontal
    const x = (pageWidth - imgWidth) / 2;

    let posY = 60;

    // Ajuste si es muy grande
    if (imgHeight > pageHeight - posY - 40) {
      const scale = (pageHeight - posY - 40) / imgHeight;
      pdf.addImage(imgData, "PNG", x, posY, imgWidth * scale, imgHeight * scale);
      posY += imgHeight * scale + 10;
    } else {
      pdf.addImage(imgData, "PNG", x, posY, imgWidth, imgHeight);
      posY += imgHeight + 10;
    }

    // =========================
    //  FIRMA DEL JUEZ
    // =========================
    const firmaImg = canvas.toDataURL("image/png");

    pdf.setFontSize(12);
    pdf.text("Firma del juez:", 12, posY + 10);
    pdf.addImage(firmaImg, "PNG", 12, posY + 15, 60, 30);

    // =========================
    //  GUARDAR PDF
    // =========================
    pdf.save("Tarjeta-Juez-FEB.pdf");
  };

  logo.onerror = function () {
    alert("No se pudo cargar el logo. Verifica que 'logo-feb.png' exista.");
  };
});