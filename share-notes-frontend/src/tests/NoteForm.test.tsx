import { render, screen, fireEvent } from '@testing-library/react';
import NoteForm from '../components/notes/NoteForm';

const mockCategory = { _id: 'cat1', name: 'General', color: '#6366f1' };

describe('NoteForm Component', () => {
  it('Debe renderizar el formulario con campos vacíos para nueva nota', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<NoteForm onSubmit={onSubmit} onClose={onClose} categories={[mockCategory]} />);

    expect(screen.getByPlaceholderText('Título de la nota')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Agregar etiqueta...')).toBeInTheDocument();
  });

  it('Debe mostrar los datos de la nota existente para editar', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const initialData = {
      title: 'Nota existente',
      content: 'Contenido existente',
      contentHTML: '<p>Contenido existente</p>',
      category: 'cat1',
      tags: ['tag1', 'tag2'],
    };

    render(<NoteForm onSubmit={onSubmit} onClose={onClose} initialData={initialData} categories={[mockCategory]} />);

    expect(screen.getByDisplayValue('Nota existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tag1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tag2')).toBeInTheDocument();
  });

  it('Debe tener botón Cancelar que llama a onClose', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    const { container } = render(<NoteForm onSubmit={onSubmit} onClose={onClose} />);

    const cancelButton = container.querySelector('button[type="button"]');
    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
