import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NoteCard from '../components/notes/NoteCard';

const mockNote = {
  _id: 'note1',
  title: 'Apuntes de Cálculo',
  content: 'Derivadas e integrales son conceptos fundamentales del cálculo diferencial e integral.',
  isPinned: false,
  isFavorite: false,
  category: { _id: 'cat1', name: 'Matemáticas', color: '#6366f1' },
  createdAt: '2026-06-01T10:00:00.000Z',
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('NoteCard Component', () => {
  it('Debe renderizar el título de la nota', () => {
    renderWithRouter(<NoteCard note={mockNote} />);
    expect(screen.getByText('Apuntes de Cálculo')).toBeInTheDocument();
  });

  it('Debe renderizar el contenido de la nota', () => {
    renderWithRouter(<NoteCard note={mockNote} />);
    expect(screen.getByText(/Derivadas e integrales/)).toBeInTheDocument();
  });

  it('Debe renderizar el badge de categoría', () => {
    renderWithRouter(<NoteCard note={mockNote} />);
    expect(screen.getByText('Matemáticas')).toBeInTheDocument();
  });

  it('Debe mostrar icono de favorito cuando isFavorite es true', () => {
    renderWithRouter(<NoteCard note={{ ...mockNote, isFavorite: true }} />);
    const starIcon = document.querySelector('.text-yellow-500');
    expect(starIcon).toBeInTheDocument();
  });

  it('Debe mostrar "Sin título" cuando no hay título', () => {
    renderWithRouter(<NoteCard note={{ ...mockNote, title: '' }} />);
    expect(screen.getByText('Sin título')).toBeInTheDocument();
  });

  it('Debe renderizar sin contenido', () => {
    renderWithRouter(<NoteCard note={{ ...mockNote, content: '' }} />);
    expect(screen.getByText('Apuntes de Cálculo')).toBeInTheDocument();
  });
});
