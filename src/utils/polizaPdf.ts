// Genera el PDF con el detalle de una póliza a partir de los datos que ya
// trae el perfil del cliente. jsPDF se importa dinámicamente para no cargarlo
// en el bundle inicial: solo se descarga cuando el usuario pide el PDF.
import logoUrl from "../assets/Logo.png";

export type PolizaPdfPago = {
  idPago: number | string;
  fecha?: string;
  monto?: string | number;
};

export type PolizaPdfData = {
  idPoliza: number | string;
  fechaInicio?: string;
  fechaFin?: string;
  prima?: string | number;
  sumaAsegurada?: string | number;
  deducible?: string | number;
  estado?: string;
  producto?: {
    nombre?: string;
    nombreComercial?: string;
    descripcion?: string;
    tipo?: string | number;
  } | null;
  plan?: { nombre?: string } | null;
  pagos?: PolizaPdfPago[];
};

export type ClientePdfData = {
  nombreCompleto: string;
  cedula?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  estado?: string;
};

const BRAND: [number, number, number] = [43, 122, 87]; // #2B7A57

const text = (value?: string | number | null) =>
  value === undefined || value === null || value === "" ? "-" : String(value);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

const formatMoney = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "-";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
};

const loadImageAsDataUrl = async (url: string) => {
  const blob = await (await fetch(url)).blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generarPolizaPdf = async (
  poliza: PolizaPdfData,
  cliente: ClientePdfData,
) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Encabezado
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageWidth, 28, "F");
  try {
    const logo = await loadImageAsDataUrl(logoUrl);
    const props = doc.getImageProperties(logo);
    const h = 16;
    doc.addImage(logo, "PNG", margin, 6, (props.width / props.height) * h, h);
  } catch {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("TKUIDO", margin, 17);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Detalle de Póliza", pageWidth - margin, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Póliza #${text(poliza.idPoliza)}`, pageWidth - margin, 20, {
    align: "right",
  });

  const nombreProducto =
    poliza.producto?.nombreComercial || poliza.producto?.nombre || "Producto";

  doc.setTextColor(33, 33, 33);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(nombreProducto, margin, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Generado el ${new Date().toLocaleString()}`, margin, 48);

  const sectionTable = (
    title: string,
    rows: Array<[string, string]>,
    startY: number,
  ) => {
    autoTable(doc, {
      startY,
      head: [[{ content: title, colSpan: 2 }]],
      body: rows,
      theme: "grid",
      margin: { left: margin, right: margin },
      headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [243, 248, 245] },
      },
    });
    return (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY;
  };

  let y = sectionTable(
    "Datos de la póliza",
    [
      ["Número de póliza", text(poliza.idPoliza)],
      ["Estado", text(poliza.estado)],
      ["Fecha de inicio", formatDate(poliza.fechaInicio)],
      ["Fecha de fin", formatDate(poliza.fechaFin)],
      ["Prima", text(poliza.prima)],
      ["Suma asegurada", text(poliza.sumaAsegurada)],
      ["Deducible", text(poliza.deducible)],
    ],
    54,
  );

  y = sectionTable(
    "Producto y plan",
    [
      ["Producto", nombreProducto],
      ["Plan", text(poliza.plan?.nombre)],
      ["Tipo", text(poliza.producto?.tipo)],
      ["Descripción", text(poliza.producto?.descripcion)],
    ],
    y + 6,
  );

  y = sectionTable(
    "Titular",
    [
      ["Nombre", text(cliente.nombreCompleto)],
      ["Cédula", text(cliente.cedula)],
      ["Correo", text(cliente.correo)],
      ["Teléfono", text(cliente.telefono)],
      ["Dirección", text(cliente.direccion)],
      ["Estado", text(cliente.estado)],
    ],
    y + 6,
  );

  const pagos = poliza.pagos ?? [];
  const total = pagos.reduce((acc, p) => {
    const n = Number(p.monto);
    return Number.isNaN(n) ? acc : acc + n;
  }, 0);

  autoTable(doc, {
    startY: y + 6,
    head: [["#", "Fecha", "Referencia", "Monto"]],
    body:
      pagos.length > 0
        ? pagos.map((p, i) => [
            String(i + 1),
            formatDate(p.fecha),
            text(p.idPago),
            formatMoney(p.monto),
          ])
        : [[{ content: "Sin pagos registrados", colSpan: 4 }]],
    foot:
      pagos.length > 0
        ? [["", "", "Total pagado", formatMoney(total)]]
        : undefined,
    theme: "striped",
    margin: { left: margin, right: margin },
    headStyles: { fillColor: BRAND, textColor: 255 },
    footStyles: {
      fillColor: [243, 248, 245],
      textColor: 33,
      fontStyle: "bold",
    },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 10 }, 3: { halign: "right" } },
  });

  // Pie de página en todas las hojas
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "Documento informativo generado desde el portal de clientes TKUIDO.",
      margin,
      pageHeight - 8,
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - margin,
      pageHeight - 8,
      {
        align: "right",
      },
    );
  }

  doc.save(`poliza-${poliza.idPoliza}.pdf`);
};
