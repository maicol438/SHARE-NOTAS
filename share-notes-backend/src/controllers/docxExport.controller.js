import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import Note from "../models/Note.js";
import Category from "../models/Category.js";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const findNote = async (noteId, userId) => {
  return await Note.findOne({
    _id: noteId,
    $or: [
      { user: userId },
      { sharedWith: { $elemMatch: { user: userId, permission: "edit" } } },
    ],
  }).populate("category", "name color");
};

const buildDocx = async (note, type) => {
  const title = type === "task" ? `[Tarea] ${note.title}` : note.title;
  const rawContent = type === "task"
    ? (note.description
        ? `${note.description}\n\n${note.content || ""}`
        : note.content || "Tarea sin descripción")
    : note.content;

  const date = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const children = [];

  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    })
  );

  if (note.category?.name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Categoría: ", bold: true, size: 22 }),
          new TextRun({ text: note.category.name, size: 22 }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (date) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Última actualización: ", bold: true, size: 22 }),
          new TextRun({ text: date, size: 22 }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "─".repeat(50),
          size: 18,
          color: "999999",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  if (rawContent) {
    const blocks = rawContent.split(/\n\n+/);
    for (const block of blocks) {
      const lines = block.split("\n");
      for (let i = 0; i < lines.length; i++) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: lines[i],
                size: 24,
              }),
            ],
            spacing: {
              after: i < lines.length - 1 ? 0 : 200,
              line: 276,
            },
          })
        );
      }
    }
  }

  if (note.isCompleted !== undefined) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Estado: ${note.isCompleted ? "Completada" : "Pendiente"}`,
            size: 22,
            italics: true,
            color: note.isCompleted ? "2E7D32" : "E65100",
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    if (note.priority) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Prioridad: ${note.priority}`, size: 22, italics: true }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (note.dueDate) {
      const due = new Date(note.dueDate).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Fecha de vencimiento: ${due}`, size: 22, italics: true }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "\nGenerado desde Share Notes",
          size: 18,
          color: "999999",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    title,
    description: `Exportación de ${type}`,
    creator: "Share Notes",
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 24 },
        },
      },
    },
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
};

export const exportNoteAsDocx = async (req, res, next) => {
  try {
    const note = await findNote(req.params.id, req.userId);
    if (!note) {
      return res
        .status(404)
        .json({ message: "Nota no encontrada o no tienes permiso de edición" });
    }

    const buffer = await buildDocx(note, "note");
    const filename = encodeURIComponent(
      `${note.title.replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").trim() || "nota"}.docx`
    );

    res.set({
      "Content-Type": DOCX_MIME,
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Content-Length": buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    console.error("Error exportando DOCX:", error.message);
    return res.status(500).json({
      message: "Error al exportar la nota a Word",
      detail: error.message,
    });
  }
};

export const exportTaskAsDocx = async (req, res, next) => {
  try {
    const note = await findNote(req.params.id, req.userId);
    if (!note || note.type !== "task") {
      return res
        .status(404)
        .json({ message: "Tarea no encontrada o no tienes permiso de edición" });
    }

    const buffer = await buildDocx(note, "task");
    const filename = encodeURIComponent(
      `${note.title.replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").trim() || "tarea"}.docx`
    );

    res.set({
      "Content-Type": DOCX_MIME,
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Content-Length": buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    console.error("Error exportando DOCX tarea:", error.message);
    return res.status(500).json({
      message: "Error al exportar la tarea a Word",
      detail: error.message,
    });
  }
};
