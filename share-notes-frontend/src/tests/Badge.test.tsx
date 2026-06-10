import { render, screen, fireEvent } from '@testing-library/react';
import Badge from '../components/ui/Badge';

describe('Badge Component', () => {
  it('Debe renderizar con el label correcto', () => {
    render(<Badge label="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('Debe llamar onRemove al hacer clic en el botón de eliminar', () => {
    const onRemove = vi.fn();
    render(<Badge label="Tag" onRemove={onRemove} />);
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);
    expect(onRemove).toHaveBeenCalled();
  });

  it('No debe mostrar botón de eliminar sin onRemove', () => {
    render(<Badge label="Tag" />);
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });
});
