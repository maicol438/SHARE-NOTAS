import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '../components/ui/Tooltip';

beforeEach(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    top: 200, bottom: 300, left: 200, right: 300,
    width: 100, height: 50, x: 200, y: 200,
    toJSON: () => ({}),
  }));
});

describe('Tooltip Component', () => {
  it('Debe renderizar el contenido children', () => {
    render(<Tooltip text="Info"><button>Hover</button></Tooltip>);
    expect(screen.getByText('Hover')).toBeInTheDocument();
  });

  it('Debe mostrar el texto del tooltip al hacer hover', () => {
    render(<Tooltip text="Información adicional"><span>Elemento</span></Tooltip>);
    fireEvent.mouseEnter(screen.getByText('Elemento'));
    expect(screen.getByText('Información adicional')).toBeInTheDocument();
  });
});
