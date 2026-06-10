import { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
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
} from 'lucide-react';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, active, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200 ${
      active
        ? 'bg-primary-500 text-white'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
    }`}
  >
    {children}
  </button>
);

interface RichTextEditorHandle {
  getContent: () => string;
  getHTML: () => string;
}

interface RichTextEditorProps {
  content?: string;
  onChange?: (text: string, html: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({ content = '', onChange, placeholder, className = '' }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.innerText || '',
    getHTML: () => editorRef.current?.innerHTML || '',
  }));

  useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const saveHistory = useCallback((html: string): void => {
    setHistory((prev: string[]) => {
      const newHistory: string[] = prev.slice(0, historyIndex + 1);
      newHistory.push(html);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev: number) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const execCommand = useCallback((command: string, value?: string): void => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    const html: string = editorRef.current?.innerHTML || '';
    saveHistory(html);
    onChange?.(editorRef.current?.innerText || '', html);
  }, [onChange, saveHistory]);

  const handleInput = useCallback((): void => {
    const html: string = editorRef.current?.innerHTML || '';
    saveHistory(html);
    onChange?.(editorRef.current?.innerText || '', html);
  }, [onChange, saveHistory]);

  const handleUndo = useCallback((): void => {
    if (historyIndex > 0) {
      const newIndex: number = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex] || '';
        onChange?.(editorRef.current.innerText || '', history[newIndex] || '');
      }
    }
  }, [historyIndex, history, onChange]);

  const handleRedo = useCallback((): void => {
    if (historyIndex < history.length - 1) {
      const newIndex: number = historyIndex + 1;
      setHistoryIndex(newIndex);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex] || '';
        onChange?.(editorRef.current.innerText || '', history[newIndex] || '');
      }
    }
  }, [historyIndex, history, onChange]);

  const isActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
    }
  }, [handleUndo, handleRedo]);

  return (
    <div className={`border border-gray-200 dark:border-dark-700 rounded-2xl overflow-hidden bg-white dark:bg-dark-850 transition-all duration-200 focus-within:border-primary-400 dark:focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10 ${className}`}>
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-900/50">
        <ToolbarButton onClick={() => execCommand('bold')} active={isActive('bold')} title="Negrita"><Bold className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} active={isActive('italic')} title="Cursiva"><Italic className="w-4 h-4" /></ToolbarButton>
        <div className="w-px h-6 bg-gray-200 dark:bg-dark-700 mx-1 self-center" />
        <ToolbarButton onClick={() => execCommand('formatBlock', '<h1>')} title="Título 1"><Heading1 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<h2>')} title="Título 2"><Heading2 className="w-4 h-4" /></ToolbarButton>
        <div className="w-px h-6 bg-gray-200 dark:bg-dark-700 mx-1 self-center" />
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Lista"><List className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Lista ordenada"><ListOrdered className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', '<blockquote>')} title="Cita"><Quote className="w-4 h-4" /></ToolbarButton>
        <div className="w-px h-6 bg-gray-200 dark:bg-dark-700 mx-1 self-center" />
        <ToolbarButton onClick={handleUndo} title="Deshacer"><Undo className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton onClick={handleRedo} title="Rehacer"><Redo className="w-4 h-4" /></ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 text-sm text-gray-800 dark:text-slate-200 focus:outline-none leading-relaxed [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400 dark:[&:empty:before]:text-slate-600"
        data-placeholder={placeholder || 'Escribe tu contenido aquí...'}
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
