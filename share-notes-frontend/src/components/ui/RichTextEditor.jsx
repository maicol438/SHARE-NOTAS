import { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200 ${
      active
        ? "bg-primary-500 text-white"
        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = forwardRef(({ content = "", onChange, placeholder, className = "" }, ref) => {
  const editorRef = useRef(null);
  const [selection, setSelection] = useState({ bold: false, italic: false });

  useImperativeHandle(ref, () => ({
    getHTML: () => editorRef.current?.innerHTML || "",
    getText: () => editorRef.current?.innerText || "",
    clear: () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    },
  }), []);

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

  const exec = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
    updateSelection();
  }, [onChange]);

  const updateSelection = () => {
    setSelection({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
    });
  };

  const handleMouseUp = () => updateSelection();
  const handleKeyUp = () => updateSelection();

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <ToolbarButton onClick={() => exec("bold")} active={selection.bold} title="Negrita">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} active={selection.italic} title="Cursiva">
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton onClick={() => exec("formatBlock", "<h1>")} title="Título 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<h2>")} title="Título 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Lista">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Lista numerada">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<blockquote>")} title="Cita">
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <ToolbarButton onClick={() => exec("undo")} title="Deshacer">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("redo")} title="Rehacer">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        className="prose prose-sm max-w-none outline-none min-h-[200px] p-4 text-gray-900 dark:text-gray-100"
        data-placeholder={placeholder}
        style={{ caretColor: "#6366f1" }}
      />

      <style>{`
        [contenteditable]:focus { outline: none; }
        [contenteditable] p { margin: 0.5em 0; }
        [contenteditable] h1 { font-size: 1.75em; font-weight: 700; margin: 1em 0 0.5em; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        [contenteditable] blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
          font-style: italic;
        }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] em { font-style: italic; }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
