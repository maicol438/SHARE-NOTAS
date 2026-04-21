import { jsPDF } from "jspdf";

export const exportToPDF = (note) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(note.title, margin, y);
  y += 10;

  if (note.category) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Categoría: ${note.category.name}`, margin, y);
    y += 7;
  }

  if (note.user) {
    doc.setFontSize(9);
    doc.text(`Autor: ${note.user.name}`, margin, y);
    y += 7;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  const contentLines = doc.splitTextToSize(note.content, contentWidth);
  doc.text(contentLines, margin, y);

  const date = new Date(note.createdAt).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Creado: ${date}`, margin, pageHeight - 10);

  doc.save(`${note.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
};