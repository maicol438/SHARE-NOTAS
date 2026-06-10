import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/ui/Modal';

describe('Modal Component', () => {
  it('No debe renderizar cuando isOpen es false', () => {
    render(<Modal isOpen={false} onClose={(): void => {}}><p>Contenido</p></Modal>);
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('Debe renderizar cuando isOpen es true', () => {
    render(<Modal isOpen={true} onClose={(): void => {}}><p>Contenido</p></Modal>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('Debe llamar onClose al hacer clic en el overlay', () => {
    const onClose = vi.fn();
    const { container } = render(<Modal isOpen={true} onClose={onClose}><p>Contenido</p></Modal>);
    const overlay = container.querySelector('[class*="bg-black"]');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('Debe mostrar el título cuando se proporciona', () => {
    render(<Modal isOpen={true} onClose={(): void => {}} title="Título del Modal"><p>Contenido</p></Modal>);
    expect(screen.getByText('Título del Modal')).toBeInTheDocument();
  });

  it('Debe tener botón de cerrar con aria-label', () => {
    render(<Modal isOpen={true} onClose={(): void => {}}><p>Contenido</p></Modal>);
    expect(screen.getByLabelText('Cerrar modal')).toBeInTheDocument();
  });
});
