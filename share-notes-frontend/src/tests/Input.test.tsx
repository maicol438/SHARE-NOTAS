import { render, screen, fireEvent } from '@testing-library/react';
import type { LucideIcon } from 'lucide-react';
import Input from '../components/ui/Input';

describe('Input Component', () => {
  it('Debe renderizar con label conectado al input', () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('Debe mostrar mensaje de error', () => {
    render(<Input label="Email" id="email" error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('Debe llamar onChange al escribir', () => {
    const onChange = vi.fn();
    render(<Input label="Nombre" id="nombre" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Test' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('Debe mostrar el icono cuando se proporciona', () => {
    const Icon = ((() => <span data-testid="icon">🔍</span>) as unknown as LucideIcon);
    render(<Input label="Buscar" id="search" icon={Icon} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
