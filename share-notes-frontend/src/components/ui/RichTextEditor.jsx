import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Link,
} from "lucide-react";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const Button = ({ onClick, active, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${active
          ? "bg-primary-500 text-white"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Negrita"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Cursiva"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Título 1"
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Título 2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Título 3"
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Lista"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Lista numerada"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Cita"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <Button
        onClick={() => editor.chain().focus().undo().run()}
        active={false}
        title="Deshacer"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        active={false}
        title="Rehacer"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};

const EditorContent = ({ editor, placeholder = "Escribe algo..." }) => {
  if (!editor) return null;

  return (
    <div
      className="ProseMirror prose prose-sm max-w-none outline-none min-h-[200px] p-4"
      placeholder={placeholder}
      style={{
        caretColor: "#6366f1",
      }}
    />
  );
};

const RichTextEditor = forwardRef(({ content = "", onChange, placeholder, className = "" }, ref) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getHTML: () => editorRef.current?.innerHTML || "",
    getText: () => editorRef.current?.innerText || "",
    clear: () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    },
  }));

  useEffect(() => {
    if (editorRef.current && content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange({
        html: editorRef.current.innerHTML,
        text: editorRef.current.innerText,
      });
    }
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden
        focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all
        ${className}
      `}
    >
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="ProseMirror prose prose-sm max-w-none outline-none min-h-[200px] p-4 text-gray-900 dark:text-gray-100"
        data-placeholder={placeholder}
        style={{
          caretColor: "#6366f1",
        }}
      />
      <style>{`
        .ProseMirror:focus { outline: none; }
        .ProseMirror p { margin: 0.5em 0; }
        .ProseMirror h1 { font-size: 1.75em; font-weight: 700; margin: 1em 0 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 1em 0 0.5em; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .ProseMirror blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
          font-style: italic;
        }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror a { color: #6366f1; text-decoration: underline; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;