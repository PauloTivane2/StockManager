import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ──────────────────────────────────────────────────
// Design System — Executive Minimalist
// ──────────────────────────────────────────────────
const C = {
  black:      [20, 20, 20]   as [number, number, number],
  charcoal:   [55, 55, 55]   as [number, number, number],
  gray:       [120, 120, 120] as [number, number, number],
  silver:     [180, 180, 180] as [number, number, number],
  smoke:      [230, 230, 230] as [number, number, number],
  snow:       [247, 247, 247] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  alertRed:   [180, 40, 40]  as [number, number, number],
  alertBg:    [253, 245, 245] as [number, number, number],
};

// Use Montserrat
const SERIF = "Montserrat";
const SANS  = "Montserrat";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────
export interface PdfInsights {
  totalValue: number;
  lowStockCount: number;
  totalEntries: number;
  totalExits: number;
  totalProducts: number;
}

export interface PdfCategoryRow {
  name: string;
  count: number;
  quantity: number;
  value: number;
}

export interface PdfTopProduct {
  name: string;
  sku: string;
  category: { name: string };
  quantity: number;
  value: number;
  minStock: number;
}

export interface PdfReportData {
  insights: PdfInsights;
  categoryData: PdfCategoryRow[];
  topProducts: PdfTopProduct[];
}

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", minimumFractionDigits: 0 }).format(v);

const fmtDate = () =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());

const fmtTime = () =>
  new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date());

function lastY(doc: jsPDF): number {
  return (doc as any).lastAutoTable?.finalY ?? 50;
}

// ──────────────────────────────────────────────────
// Drawing Primitives
// ──────────────────────────────────────────────────
function hrLine(doc: jsPDF, y: number, weight = 0.4, color = C.silver) {
  const w = doc.internal.pageSize.getWidth();
  doc.setDrawColor(...color);
  doc.setLineWidth(weight);
  doc.line(20, y, w - 20, y);
}

function heading(doc: jsPDF, text: string, y: number): number {
  doc.setFont(SERIF, "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.black);
  doc.text(text, 20, y);
  hrLine(doc, y + 2, 0.6, C.charcoal);
  return y + 10;
}

function label(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont(SANS, "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.gray);
  doc.text(text.toUpperCase(), x, y);
}

function bigValue(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont(SERIF, "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.black);
  doc.text(text, x, y);
}

function ensureSpace(doc: jsPDF, currentY: number, needed: number): number {
  if (currentY + needed > doc.internal.pageSize.getHeight() - 25) {
    doc.addPage();
    return 25;
  }
  return currentY;
}

// ──────────────────────────────────────────────────
// Cover / Header Block
// ──────────────────────────────────────────────────
function drawHeader(doc: jsPDF, data: PdfReportData) {
  const w = doc.internal.pageSize.getWidth();

  // Top thin rule
  doc.setFillColor(...C.black);
  doc.rect(0, 0, w, 1.5, "F");

  // Company
  doc.setFont(SERIF, "bold");
  doc.setFontSize(28);
  doc.setTextColor(...C.black);
  doc.text("STOK", 20, 22);

  // Tagline
  doc.setFont(SERIF, "italic");
  doc.setFontSize(10);
  doc.setTextColor(...C.gray);
  doc.text("Plataforma de Gestão de Estoque", 20, 29);

  // Right side — date block
  doc.setFont(SANS, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  doc.text("RELATÓRIO GERADO EM", w - 20, 14, { align: "right" });

  doc.setFont(SERIF, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C.charcoal);
  doc.text(fmtDate(), w - 20, 20, { align: "right" });

  doc.setFont(SANS, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.gray);
  doc.text(`às ${fmtTime()}`, w - 20, 26, { align: "right" });

  // Divider
  hrLine(doc, 35, 0.8, C.black);

  // Report title
  doc.setFont(SERIF, "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.black);
  doc.text("Relatório Executivo de Estoque", 20, 46);

  doc.setFont(SERIF, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C.gray);
  doc.text(
    `Análise consolidada de ${data.insights.totalProducts} produtos em inventário.`,
    20,
    53
  );

  hrLine(doc, 58);
}

// ──────────────────────────────────────────────────
// KPI Dashboard Block
// ──────────────────────────────────────────────────
function drawKPIs(doc: jsPDF, data: PdfReportData): number {
  const w = doc.internal.pageSize.getWidth();
  const startY = 65;

  const kpis = [
    { label: "Valor Total em Estoque", value: fmt(data.insights.totalValue) },
    { label: "Total de Produtos",      value: data.insights.totalProducts.toString() },
    { label: "Entradas Registadas",    value: `+${data.insights.totalEntries}` },
    { label: "Saídas Registadas",      value: `-${data.insights.totalExits}` },
    { label: "Alertas de Stock",       value: data.insights.lowStockCount.toString() },
  ];

  // First KPI — featured (large)
  const featuredWidth = (w - 40) * 0.45;
  doc.setFillColor(...C.snow);
  doc.roundedRect(20, startY, featuredWidth, 32, 2, 2, "F");
  label(doc, kpis[0].label, 26, startY + 8);
  bigValue(doc, kpis[0].value, 26, startY + 22);

  // Remaining KPIs — 2x2 grid
  const gridX = 20 + featuredWidth + 8;
  const cellW = (w - 20 - gridX - 4) / 2;
  const cellH = 14;

  for (let i = 1; i < kpis.length; i++) {
    const col = (i - 1) % 2;
    const row = Math.floor((i - 1) / 2);
    const cx = gridX + col * (cellW + 4);
    const cy = startY + row * (cellH + 4);

    doc.setFillColor(...C.snow);
    doc.roundedRect(cx, cy, cellW, cellH, 1.5, 1.5, "F");

    label(doc, kpis[i].label, cx + 4, cy + 5.5);

    doc.setFont(SERIF, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.black);
    doc.text(kpis[i].value, cx + 4, cy + 11.5);
  }

  return startY + 40;
}

// ──────────────────────────────────────────────────
// Main Generator
// ──────────────────────────────────────────────────
export async function generateStockReport(data: PdfReportData): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  try {
    const [regRes, boldRes] = await Promise.all([
      fetch('/fonts/Montserrat-Regular.ttf'),
      fetch('/fonts/Montserrat-Bold.ttf')
    ]);
    const regBuf = await regRes.arrayBuffer();
    const boldBuf = await boldRes.arrayBuffer();
    
    doc.addFileToVFS('Montserrat-Regular.ttf', arrayBufferToBase64(regBuf));
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
    
    doc.addFileToVFS('Montserrat-Bold.ttf', arrayBufferToBase64(boldBuf));
    doc.addFont('Montserrat-Bold.ttf', 'Montserrat', 'bold');
    
    doc.setFont("Montserrat");
  } catch (error) {
    console.error("Oops, could not load fonts...", error);
  }

  // ── PAGE 1: HEADER + KPIs ──────────────────────
  drawHeader(doc, data);
  let y = drawKPIs(doc, data);

  // ── CATEGORIES TABLE ───────────────────────────
  y = y + 8;
  y = heading(doc, "Análise por Categoria", y);

  autoTable(doc, {
    startY: y,
    head: [["Categoria", "Produtos", "Qtd. em Stock", "Valor Total", "Valor Médio"]],
    body: data.categoryData.map((c) => [
      c.name,
      c.count.toString(),
      c.quantity.toLocaleString("pt-MZ"),
      fmt(c.value),
      fmt(c.quantity > 0 ? c.value / c.quantity : 0),
    ]),
    theme: "plain",
    styles: {
      font: SERIF,
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      textColor: C.charcoal,
      lineColor: C.smoke,
      lineWidth: 0.15,
    },
    headStyles: {
      font: SANS,
      fillColor: C.snow,
      textColor: C.charcoal,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: C.black },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold", textColor: C.black },
      4: { halign: "right", textColor: C.gray, fontSize: 8 },
    },
    margin: { left: 20, right: 20 },
    tableLineColor: C.smoke,
    tableLineWidth: 0.15,
  });

  // ── TOP 10 PRODUCTS TABLE ──────────────────────
  y = lastY(doc) + 14;
  y = ensureSpace(doc, y, 70);
  y = heading(doc, "Top 10 Produtos por Valor em Estoque", y);

  autoTable(doc, {
    startY: y,
    head: [["#", "Produto", "SKU", "Categoria", "Qtd.", "Valor Total"]],
    body: data.topProducts.map((p, i) => [
      (i + 1).toString().padStart(2, "0"),
      p.name,
      p.sku,
      p.category.name,
      p.quantity.toLocaleString("pt-MZ"),
      fmt(p.value),
    ]),
    theme: "plain",
    styles: {
      font: SERIF,
      fontSize: 9,
      cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
      textColor: C.charcoal,
      lineColor: C.smoke,
      lineWidth: 0.15,
    },
    headStyles: {
      font: SANS,
      fillColor: C.snow,
      textColor: C.charcoal,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10, textColor: C.silver, font: SANS, fontSize: 8 },
      1: { fontStyle: "bold", textColor: C.black },
      2: { textColor: C.gray, fontSize: 8, font: SANS },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold", textColor: C.black },
    },
    margin: { left: 20, right: 20 },
    tableLineColor: C.smoke,
    tableLineWidth: 0.15,
  });

  // ── LOW STOCK ALERT TABLE ──────────────────────
  const lowStock = data.topProducts.filter((p) => p.quantity <= p.minStock);
  if (lowStock.length > 0) {
    y = lastY(doc) + 14;
    y = ensureSpace(doc, y, 50);

    // Alert heading with special styling
    doc.setFont(SERIF, "bold");
    doc.setFontSize(13);
    doc.setTextColor(...C.alertRed);
    doc.text("Produtos em Alerta de Stock", 20, y);
    hrLine(doc, y + 2, 0.6, C.alertRed);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Produto", "SKU", "Stock Actual", "Mínimo", "Défice"]],
      body: lowStock.map((p) => [
        p.name,
        p.sku,
        p.quantity.toString(),
        p.minStock.toString(),
        (p.minStock - p.quantity).toString(),
      ]),
      theme: "plain",
      styles: {
        font: SERIF,
        fontSize: 9,
        cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
        textColor: C.charcoal,
        lineColor: C.smoke,
        lineWidth: 0.15,
      },
      headStyles: {
        font: SANS,
        fillColor: C.alertBg,
        textColor: C.alertRed,
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
      },
      columnStyles: {
        0: { fontStyle: "bold", textColor: C.black },
        1: { textColor: C.gray, font: SANS, fontSize: 8 },
        2: { halign: "right", textColor: C.alertRed, fontStyle: "bold" },
        3: { halign: "right" },
        4: { halign: "right", textColor: C.alertRed, fontStyle: "bold" },
      },
      margin: { left: 20, right: 20 },
      tableLineColor: C.smoke,
      tableLineWidth: 0.15,
    });
  }

  // ── FOOTER ON ALL PAGES ────────────────────────
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    const w = doc.internal.pageSize.getWidth();

    // Bottom rule
    doc.setFillColor(...C.black);
    doc.rect(0, h - 1.5, w, 1.5, "F");

    // Left — branding
    doc.setFont(SERIF, "italic");
    doc.setFontSize(7);
    doc.setTextColor(...C.silver);
    doc.text("STOK  ·  Relatório Confidencial", 20, h - 5);

    // Right — page number
    doc.setFont(SANS, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.silver);
    doc.text(`${i} / ${pages}`, w - 20, h - 5, { align: "right" });
  }

  // ── SAVE ───────────────────────────────────────
  const d = new Date();
  const datePart = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  const timePart = `${d.getHours().toString().padStart(2, "0")}h${d.getMinutes().toString().padStart(2, "0")}`;
  doc.save(`STOK-Relatorio_${datePart}_${timePart}.pdf`);
}
